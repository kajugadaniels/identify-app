// src/app/dashboard/page.tsx

'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { GlassButton } from '@/components/shared/GlassButton';
import { ProfileCard } from '@/components/dashboard/ProfileCard';
import { VerificationHistory } from '@/components/dashboard/VerificationHistory';

export default function DashboardPage() {
    const { user, isAuthenticated, isLoading } = useRequireAuth();
    const router = useRouter();

    // Prevent rendering protected content before redirect fires
    if (isLoading || !isAuthenticated) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

            {/* Page header */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
            >
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Welcome back,{' '}
                        <span className="gradient-text">{user?.firstName}</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Manage your profile and view past verifications
                    </p>
                </div>

                <GlassButton
                    variant="primary"
                    onClick={() => router.push('/verify')}
                >
                    New verification
                </GlassButton>
            </motion.div>

            {/* Profile card */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="mb-6"
            >
                <ProfileCard />
            </motion.div>

            {/* Verification history */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
            >
                <h2 className="text-lg font-semibold text-slate-700 mb-4">
                    Verification history
                </h2>
                <VerificationHistory />
            </motion.div>

        </div>
    );
}