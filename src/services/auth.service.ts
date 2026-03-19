import api from '@/lib/api';
import { ApiResponse, AuthResponse } from '@/types';

// ── Types for request payloads ────────────────────────
export interface RegisterPayload {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

// ── Auth API calls ─────────────────────────────────────

// POST /auth/register
// Creates a new user account and returns user + JWT token
export async function registerUser(
    payload: RegisterPayload,
): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(
        '/auth/register',
        payload,
    );

    // Throw a clear error if the response shape is wrong
    if (!response.data.data) {
        throw new Error('Invalid response from server');
    }

    return response.data.data;
}

// POST /auth/login
// Authenticates a user and returns user + JWT token
export async function loginUser(
    payload: LoginPayload,
): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(
        '/auth/login',
        payload,
    );

    if (!response.data.data) {
        throw new Error('Invalid response from server');
    }

    return response.data.data;
}