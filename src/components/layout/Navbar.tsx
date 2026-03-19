'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ── Our shared components ─────────────────────────────
import { GlassButton } from '@/components/shared/GlassButton';

// ── Auth store — this was the missing import causing the error ─
import { useAuthStore } from '@/store/auth.store';

// Nav links shown only when user is authenticated
const NAV_LINKS = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/verify', label: 'Verify ID' },
];

export function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    // Pull auth state from zustand store
    const { user, isAuthenticated, clearAuth } = useAuthStore();

    function handleLogout() {
        clearAuth();
        router.push('/login');
    }

    return (
        <header className="glass-nav sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">

                    {/* ── Logo ──────────────────────────────────── */}
                    <Link href="/" className="flex items-center gap-2 select-none">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                            style={{
                                background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
                                boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
                            }}
                        >
                            V
                        </div>
                        <span className="font-semibold text-white text-lg tracking-tight">
                            Verify<span className="gradient-text">ID</span>
                        </span>
                    </Link>

                    {/* ── Desktop nav links ─────────────────────── */}
                    <nav className="hidden md:flex items-center gap-1">
                        {isAuthenticated &&
                            NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                                        pathname === link.href
                                            ? 'bg-white/10 text-white'
                                            : 'text-white/60 hover:text-white hover:bg-white/[0.06]',
                                    )}
                                >
                                    {link.label}
                                </Link>
                            ))}
                    </nav>

                    {/* ── Desktop auth actions ──────────────────── */}
                    <div className="hidden md:flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                <span className="text-sm text-white/40">
                                    Hi,{' '}
                                    <span className="text-white/70 font-medium">
                                        {user?.firstName}
                                    </span>
                                </span>
                                <GlassButton
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleLogout}
                                >
                                    Sign out
                                </GlassButton>
                            </>
                        ) : (
                            <>
                                <GlassButton
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push('/login')}
                                >
                                    Sign in
                                </GlassButton>
                                <GlassButton
                                    variant="primary"
                                    size="sm"
                                    onClick={() => router.push('/register')}
                                >
                                    Get started
                                </GlassButton>
                            </>
                        )}
                    </div>

                    {/* ── Mobile hamburger ──────────────────────── */}
                    <button
                        className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                    >
                        <motion.span
                            animate={mobileOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="block w-5 h-0.5 bg-white/70 rounded-full"
                        />
                        <motion.span
                            animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className="block w-5 h-0.5 bg-white/70 rounded-full"
                        />
                        <motion.span
                            animate={mobileOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="block w-5 h-0.5 bg-white/70 rounded-full"
                        />
                    </button>

                </div>
            </div>

            {/* ── Mobile dropdown menu ──────────────────────── */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="md:hidden overflow-hidden border-t border-white/[0.06]"
                    >
                        <div className="px-4 py-4 flex flex-col gap-1">

                            {/* Nav links */}
                            {isAuthenticated &&
                                NAV_LINKS.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={cn(
                                            'px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                            pathname === link.href
                                                ? 'bg-white/10 text-white'
                                                : 'text-white/60 hover:text-white',
                                        )}
                                    >
                                        {link.label}
                                    </Link>
                                ))}

                            {/* Auth buttons */}
                            <div className="pt-3 border-t border-white/[0.06] mt-2 flex flex-col gap-2">
                                {isAuthenticated ? (
                                    <GlassButton
                                        variant="ghost"
                                        fullWidth
                                        onClick={() => {
                                            handleLogout();
                                            setMobileOpen(false);
                                        }}
                                    >
                                        Sign out
                                    </GlassButton>
                                ) : (
                                    <>
                                        <GlassButton
                                            variant="secondary"
                                            fullWidth
                                            onClick={() => {
                                                router.push('/login');
                                                setMobileOpen(false);
                                            }}
                                        >
                                            Sign in
                                        </GlassButton>
                                        <GlassButton
                                            variant="primary"
                                            fullWidth
                                            onClick={() => {
                                                router.push('/register');
                                                setMobileOpen(false);
                                            }}
                                        >
                                            Get started
                                        </GlassButton>
                                    </>
                                )}
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}