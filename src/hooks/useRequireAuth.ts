'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

// Redirects to /login only after zustand has finished rehydrating from
// localStorage. Without the _hasHydrated guard, every page reload would
// redirect because isAuthenticated starts as false before the store loads.
//
// Usage:
//   const { user, isAuthenticated, isLoading } = useRequireAuth();
//   if (isLoading || !isAuthenticated) return null;
export function useRequireAuth() {
    const router = useRouter();
    const { isAuthenticated, user, _hasHydrated } = useAuthStore();

    useEffect(() => {
        // Wait until zustand has read from localStorage before deciding
        // whether to redirect — avoids false logout on every page reload
        if (_hasHydrated && !isAuthenticated) {
            router.replace('/login');
        }
    }, [_hasHydrated, isAuthenticated, router]);

    return {
        user,
        isAuthenticated,
        // True while zustand is still reading from localStorage
        isLoading: !_hasHydrated,
    };
}
