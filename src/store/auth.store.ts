import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;

    // ── Actions ───────────────────────────────────
    setAuth: (user: User, token: string) => void;
    clearAuth: () => void;
    updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            // ── Initial state ────────────────────────
            user: null,
            token: null,
            isAuthenticated: false,

            // ── Called after successful login or register ──
            // Stores user + token in zustand state AND localStorage
            // The axios interceptor in api.ts reads from localStorage
            // so both are always in sync
            setAuth: (user, token) => {
                localStorage.setItem('token', token);
                set({ user, token, isAuthenticated: true });
            },

            // ── Called on logout or 401 response ──────────
            // Clears both zustand state and localStorage token
            clearAuth: () => {
                localStorage.removeItem('token');
                set({ user: null, token: null, isAuthenticated: false });
            },

            // ── Called after a successful profile update ───
            // Only updates the user object — does not touch the token
            updateUser: (user) => set({ user }),
        }),
        {
            // Key used in localStorage
            name: 'auth-storage',

            // Only persist these three fields — avoids persisting
            // functions or temporary UI state accidentally
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        },
    ),
);