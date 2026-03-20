'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useUiStore } from '@/store/ui.store';

// Redirects to / and opens the login dialog when the user is not authenticated.
// Waits for zustand to rehydrate from localStorage before deciding.
//
// Usage:
//   const { user, isAuthenticated, isLoading } = useRequireAuth();
//   if (isLoading || !isAuthenticated) return null;
export function useRequireAuth() {
    const router = useRouter();
    const { isAuthenticated, user, _hasHydrated } = useAuthStore();
    const { openAuthDialog } = useUiStore();

    useEffect(() => {
        if (_hasHydrated && !isAuthenticated) {
            router.replace('/');
            openAuthDialog('login');
        }
    }, [_hasHydrated, isAuthenticated, router, openAuthDialog]);

    return {
        user,
        isAuthenticated,
        isLoading: !_hasHydrated,
    };
}
