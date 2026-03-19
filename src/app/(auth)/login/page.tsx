'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/shared/GlassCard';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center
                    justify-center px-4 py-12">
            <div className="w-full max-w-md">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Welcome back
                    </h1>
                    <p className="text-white/45 text-sm">
                        Sign in to your VerifyID account
                    </p>
                </motion.div>

                {/* Form card */}
                <GlassCard variant="lg" className="p-8">
                    <LoginForm />

                    <div className="mt-6 pt-5 border-t border-white/[0.06] text-center">
                        <p className="text-sm text-white/40">
                            Don&apos;t have an account?{' '}
                            <Link
                                href="/register"
                                className="text-indigo-400 hover:text-indigo-300
                           font-medium transition-colors"
                            >
                                Create one
                            </Link>
                        </p>
                    </div>
                </GlassCard>

            </div>
        </div>
    );
}