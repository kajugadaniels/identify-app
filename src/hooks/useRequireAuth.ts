'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

// Redirects to /login if the user is not authenticated.
// Use this at the top of every protected page.
//
// Usage:
//   const { user } = useRequireAuth();
//   if (!user) return null; // prevents flash of protected content
export function useRequireAuth() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace('/login');
        }
    }, [isAuthenticated, router]);

    return { user, isAuthenticated };
}