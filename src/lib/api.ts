import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// ─────────────────────────────────────────────────────
// Create a single axios instance used across the entire app.
//
// Centralising this means:
//   - Base URL is set once — change it in .env only
//   - JWT is attached automatically on every request
//   - 401 responses are handled globally — no per-component handling
//   - All components stay clean — zero HTTP config in UI files
// ─────────────────────────────────────────────────────
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Timeout after 30 seconds — Rekognition calls can be slow
  timeout: 30_000,
});

// ─────────────────────────────────────────────────────
// REQUEST INTERCEPTOR
//
// Runs before every outgoing request.
// Reads the JWT from localStorage and attaches it as a
// Bearer token in the Authorization header.
//
// We read from localStorage on every request (not once at startup)
// so the token is always fresh after login or token refresh.
// ─────────────────────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Guard for SSR — localStorage is not available on the server
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');

      if (token) {
        // Attach token — NestJS JwtStrategy reads this header
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error: AxiosError) => {
    // Pass request setup errors through unchanged
    return Promise.reject(error);
  },
);

// ─────────────────────────────────────────────────────
// RESPONSE INTERCEPTOR
//
// Runs after every incoming response.
//
// On success  → passes the response through unchanged
// On 401      → clears stale credentials and redirects to /login
// On other errors → passes the error through so the calling
//                   service can handle it with a specific message
// ─────────────────────────────────────────────────────
api.interceptors.response.use(
  // Success — just return the response untouched
  (response) => response,

  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token is expired or invalid — clear everything and redirect
      // We only do this in the browser — not during SSR
      if (typeof window !== 'undefined') {
        // Remove the stale token from storage
        localStorage.removeItem('token');

        // Use window.location instead of Next.js router here because:
        // 1. This interceptor runs outside React component context
        // 2. window.location forces a full page reload which clears
        //    all in-memory state — important for security
        const currentPath = window.location.pathname;

        // Avoid redirect loops — don't redirect if already on /login
        if (currentPath !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    // Pass all errors through — service layer handles the message
    return Promise.reject(error);
  },
);

export default api;