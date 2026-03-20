'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GlassButton } from '@/components/shared/GlassButton';
import { useAuthStore } from '@/store/auth.store';
import { useUiStore } from '@/store/ui.store';

const NAV_LINKS = [
    { href: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { href: '/verify', label: 'Verify ID', icon: VerifyIcon },
];

/* ── Inline SVG micro-icons ─────────────────────────────── */
function DashboardIcon({ className }: { className?: string }) {
    return (
        <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
            <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
            <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
            <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        </svg>
    );
}

function VerifyIcon({ className }: { className?: string }) {
    return (
        <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 1L2 4v4c0 3.5 2.5 6.4 6 7 3.5-.6 6-3.5 6-7V4L8 1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M5.5 8.2L7.2 10 10.5 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/* ── Floating orb accent (subtle brand glow) ────────────── */
function NavGlow() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
                className="absolute -top-12 left-1/2 -translate-x-1/2 w-[420px] h-[120px] rounded-full opacity-[0.07]"
                style={{
                    background: 'radial-gradient(ellipse at center, #818cf8 0%, #6366f1 40%, transparent 70%)',
                    filter: 'blur(30px)',
                }}
            />
        </div>
    );
}

/* ── Active link indicator pill ──────────────────────────── */
function ActiveIndicator() {
    return (
        <motion.div
            layoutId="nav-active-pill"
            className="absolute inset-0 rounded-xl"
            style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(129,140,248,0.08) 100%)',
                border: '1px solid rgba(99,102,241,0.15)',
                boxShadow: '0 0 12px rgba(99,102,241,0.06), inset 0 1px 0 rgba(255,255,255,0.5)',
            }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
    );
}

export function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const { user, isAuthenticated, clearAuth } = useAuthStore();
    const { openAuthDialog } = useUiStore();

    /* ── Scroll-aware glass intensification ─────────────── */
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    /* ── Lock body scroll when mobile menu open ─────────── */
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    function handleLogout() {
        clearAuth();
        router.push('/');
    }

    return (
        <header
            className={cn(
                'sticky top-0 z-50 w-full transition-all duration-500 ease-out',
                scrolled
                    ? 'navbar-glass-scrolled'
                    : 'navbar-glass-top',
            )}
            style={{
                backdropFilter: scrolled ? 'blur(20px) saturate(1.4)' : 'blur(12px) saturate(1.2)',
                WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(1.4)' : 'blur(12px) saturate(1.2)',
                background: scrolled
                    ? 'rgba(255, 255, 255, 0.72)'
                    : 'rgba(255, 255, 255, 0.55)',
                borderBottom: scrolled
                    ? '1px solid rgba(148, 163, 184, 0.15)'
                    : '1px solid rgba(148, 163, 184, 0.08)',
                boxShadow: scrolled
                    ? '0 4px 30px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)'
                    : 'none',
            }}
        >
            <NavGlow />

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-[68px]">

                    {/* ── Logo ──────────────────────────────────── */}
                    <Link href="/" className="group flex items-center gap-2.5 select-none">
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: -2 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold overflow-hidden"
                            style={{
                                background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #a78bfa 100%)',
                                boxShadow: '0 4px 14px rgba(99,102,241,0.35), 0 1px 3px rgba(99,102,241,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
                            }}
                        >
                            {/* Shimmer effect on hover */}
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{
                                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)',
                                    animation: 'shimmer 1.5s ease-in-out infinite',
                                }}
                            />
                            <span className="relative z-10 tracking-wide">V</span>
                        </motion.div>

                        <div className="flex items-baseline gap-0">
                            <span className="font-semibold text-slate-800 text-[17px] tracking-tight">
                                Verify
                            </span>
                            <span
                                className="font-bold text-[17px] tracking-tight"
                                style={{
                                    background: 'linear-gradient(135deg, #6366f1, #818cf8, #a78bfa)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                ID
                            </span>
                        </div>
                    </Link>

                    {/* ── Desktop nav links ─────────────────────── */}
                    <nav className="hidden md:flex items-center gap-0.5">
                        {isAuthenticated &&
                            NAV_LINKS.map((link) => {
                                const isActive = pathname === link.href;
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={cn(
                                            'relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2',
                                            isActive
                                                ? 'text-indigo-700'
                                                : 'text-slate-500 hover:text-slate-800',
                                        )}
                                    >
                                        {isActive && <ActiveIndicator />}
                                        <Icon className="relative z-10 w-4 h-4" />
                                        <span className="relative z-10">{link.label}</span>
                                    </Link>
                                );
                            })}
                    </nav>

                    {/* ── Desktop auth actions ──────────────────── */}
                    <div className="hidden md:flex items-center gap-2.5">
                        {isAuthenticated ? (
                            <>
                                {/* User avatar badge */}
                                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl"
                                    style={{
                                        background: 'rgba(241, 245, 249, 0.6)',
                                        border: '1px solid rgba(148, 163, 184, 0.12)',
                                    }}
                                >
                                    <div
                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-white"
                                        style={{
                                            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                                            boxShadow: '0 2px 8px rgba(99,102,241,0.25)',
                                        }}
                                    >
                                        {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <span className="text-sm text-slate-600 font-medium max-w-[120px] truncate">
                                        {user?.firstName}
                                    </span>
                                </div>
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
                                    onClick={() => openAuthDialog('login')}
                                >
                                    Sign in
                                </GlassButton>
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                >
                                    <GlassButton
                                        variant="primary"
                                        size="sm"
                                        onClick={() => openAuthDialog('register')}
                                    >
                                        Get started
                                    </GlassButton>
                                </motion.div>
                            </>
                        )}
                    </div>

                    {/* ── Mobile hamburger ──────────────────────── */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="md:hidden relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                        style={{
                            background: mobileOpen ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                            border: mobileOpen ? '1px solid rgba(99, 102, 241, 0.12)' : '1px solid transparent',
                        }}
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                    >
                        <div className="w-[18px] h-[14px] relative flex flex-col justify-between">
                            <motion.span
                                animate={mobileOpen
                                    ? { rotate: 45, y: 6, width: '18px' }
                                    : { rotate: 0, y: 0, width: '18px' }
                                }
                                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                                className="block h-[1.5px] bg-slate-600 rounded-full origin-center"
                            />
                            <motion.span
                                animate={mobileOpen
                                    ? { opacity: 0, scaleX: 0 }
                                    : { opacity: 1, scaleX: 1 }
                                }
                                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                                className="block h-[1.5px] bg-slate-600 rounded-full w-3 ml-auto"
                            />
                            <motion.span
                                animate={mobileOpen
                                    ? { rotate: -45, y: -6, width: '18px' }
                                    : { rotate: 0, y: 0, width: '18px' }
                                }
                                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                                className="block h-[1.5px] bg-slate-600 rounded-full origin-center"
                            />
                        </div>
                    </motion.button>

                </div>
            </div>

            {/* ── Mobile dropdown menu ──────────────────────── */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        {/* Backdrop overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 top-16 bg-slate-900/20 backdrop-blur-[2px] md:hidden z-40"
                            onClick={() => setMobileOpen(false)}
                        />

                        {/* Menu panel */}
                        <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.98 }}
                            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                            className="md:hidden absolute left-3 right-3 top-[calc(100%+6px)] z-50 rounded-2xl overflow-hidden"
                            style={{
                                background: 'rgba(255, 255, 255, 0.85)',
                                backdropFilter: 'blur(24px) saturate(1.5)',
                                WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
                                border: '1px solid rgba(148, 163, 184, 0.15)',
                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255,255,255,0.5) inset',
                            }}
                        >
                            <div className="p-3 flex flex-col gap-1">

                                {isAuthenticated &&
                                    NAV_LINKS.map((link, idx) => {
                                        const isActive = pathname === link.href;
                                        const Icon = link.icon;
                                        return (
                                            <motion.div
                                                key={link.href}
                                                initial={{ opacity: 0, x: -12 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.06, duration: 0.25 }}
                                            >
                                                <Link
                                                    href={link.href}
                                                    onClick={() => setMobileOpen(false)}
                                                    className={cn(
                                                        'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                                                        isActive
                                                            ? 'text-indigo-700'
                                                            : 'text-slate-500 active:text-slate-800',
                                                    )}
                                                    style={isActive ? {
                                                        background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(129,140,248,0.06) 100%)',
                                                        border: '1px solid rgba(99,102,241,0.12)',
                                                    } : {}}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                    {link.label}
                                                </Link>
                                            </motion.div>
                                        );
                                    })}

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.12, duration: 0.25 }}
                                    className="pt-2 mt-1 flex flex-col gap-2"
                                    style={{
                                        borderTop: '1px solid rgba(148, 163, 184, 0.12)',
                                    }}
                                >
                                    {isAuthenticated ? (
                                        <>
                                            {/* User info row in mobile */}
                                            <div className="flex items-center gap-3 px-4 py-2 mb-1">
                                                <div
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                                                        boxShadow: '0 2px 8px rgba(99,102,241,0.25)',
                                                    }}
                                                >
                                                    {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm text-slate-700 font-medium truncate">
                                                        {user?.firstName}
                                                    </span>
                                                    <span className="text-xs text-slate-400">Signed in</span>
                                                </div>
                                            </div>
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
                                        </>
                                    ) : (
                                        <>
                                            <GlassButton
                                                variant="secondary"
                                                fullWidth
                                                onClick={() => {
                                                    openAuthDialog('login');
                                                    setMobileOpen(false);
                                                }}
                                            >
                                                Sign in
                                            </GlassButton>
                                            <GlassButton
                                                variant="primary"
                                                fullWidth
                                                onClick={() => {
                                                    openAuthDialog('register');
                                                    setMobileOpen(false);
                                                }}
                                            >
                                                Get started
                                            </GlassButton>
                                        </>
                                    )}
                                </motion.div>

                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ── Keyframe for logo shimmer ─────────────────── */}
            <style jsx global>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </header>
    );
}