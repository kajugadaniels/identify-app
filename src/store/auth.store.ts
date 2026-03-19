import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;

    // True once zustand has finished reading from localStorage.
    // Always false on the first SSR/hydration render.
    // useRequireAuth waits for this before redirecting.
    _hasHydrated: boolean;

    // ── Actions ───────────────────────────────────
    setAuth: (user: User, token: string) => void;
    clearAuth: () => void;
    updateUser: (user: User) => void;
    setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            // ── Initial state ────────────────────────
            user: null,
            token: null,
            isAuthenticated: false,
            _hasHydrated: false,

            // ── Called after successful login or register ──
            setAuth: (user, token) => {
                localStorage.setItem('token', token);
                set({ user, token, isAuthenticated: true });
            },

            // ── Called on logout or 401 response ──────────
            clearAuth: () => {
                localStorage.removeItem('token');
                set({ user: null, token: null, isAuthenticated: false });
            },

            // ── Called after a successful profile update ───
            updateUser: (user) => set({ user }),

            // ── Set by onRehydrateStorage once localStorage is loaded ──
            setHasHydrated: (value) => set({ _hasHydrated: value }),
        }),
        {
            name: 'auth-storage',

            // Only persist auth data — not the hydration flag
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),

            // Fires after zustand finishes reading from localStorage.
            // Sets _hasHydrated so useRequireAuth knows it's safe to redirect.
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        },
    ),
);
