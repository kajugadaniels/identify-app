'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useUiStore } from '@/store/ui.store';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

/* ── Backdrop animation ─────────────────────────────────── */
const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

/* ── Panel entrance — dramatic spring with overshoot ────── */
const panelVariants = {
    hidden: { opacity: 0, scale: 0.88, y: 40, rotateX: 8 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        rotateX: 0,
        transition: {
            type: 'spring',
            stiffness: 280,
            damping: 24,
            mass: 0.8,
            staggerChildren: 0.06,
            delayChildren: 0.08,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.92,
        y: 24,
        rotateX: 4,
        transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
    },
};

/* ── Staggered children ─────────────────────────────────── */
const childVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 340, damping: 26 },
    },
};

/* ── Floating gradient orb ──────────────────────────────── */
function FloatingOrb({
    color,
    size,
    top,
    left,
    delay,
}: {
    color: string;
    size: number;
    top: string;
    left: string;
    delay: number;
}) {
    return (
        <motion.div
            className="absolute rounded-full pointer-events-none"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
                opacity: [0, 0.6, 0.4, 0.6, 0],
                scale: [0.5, 1, 1.1, 1, 0.5],
                x: [0, 15, -10, 5, 0],
                y: [0, -12, 8, -5, 0],
            }}
            transition={{
                duration: 8,
                delay,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
            style={{
                width: size,
                height: size,
                top,
                left,
                background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                filter: 'blur(25px)',
            }}
        />
    );
}

/* ── Shield icon for header ─────────────────────────────── */
function ShieldIcon({ tab }: { tab: 'login' | 'register' }) {
    return (
        <motion.div
            key={tab}
            initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{
                background:
                    tab === 'login'
                        ? 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)'
                        : 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
                boxShadow:
                    tab === 'login'
                        ? '0 4px 20px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.2)'
                        : '0 4px 20px rgba(167,139,250,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
        >
            {tab === 'login' ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                        d="M10 2C7.24 2 5 4.24 5 7v2H4a1 1 0 00-1 1v7a1 1 0 001 1h12a1 1 0 001-1v-7a1 1 0 00-1-1h-1V7c0-2.76-2.24-5-5-5zm-3 5c0-1.66 1.34-3 3-3s3 1.34 3 3v2H7V7zm3 8a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"
                        fill="white"
                        fillOpacity="0.95"
                    />
                </svg>
            ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                        d="M10 2a4 4 0 00-4 4 4 4 0 004 4 4 4 0 004-4 4 4 0 00-4-4zm-6 12c0-2 4-3.1 6-3.1S16 14 16 16v1H4v-1z"
                        fill="white"
                        fillOpacity="0.95"
                    />
                </svg>
            )}
        </motion.div>
    );
}

export function AuthDialog() {
    const { isAuthDialogOpen, authDialogTab, closeAuthDialog, openAuthDialog } = useUiStore();
    const panelRef = useRef<HTMLDivElement>(null);

    // Close on Escape
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') closeAuthDialog();
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [closeAuthDialog]);

    // Lock body scroll while open
    useEffect(() => {
        document.body.style.overflow = isAuthDialogOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isAuthDialogOpen]);

    return (
        <AnimatePresence>
            {isAuthDialogOpen && (
                <>
                    {/* ── Backdrop ──────────────────────────────── */}
                    <motion.div
                        key="backdrop"
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{ duration: 0.25 }}
                        onClick={closeAuthDialog}
                        className="fixed inset-0 z-50"
                        style={{
                            background:
                                'radial-gradient(ellipse at center, rgba(99,102,241,0.08) 0%, rgba(15,23,42,0.5) 100%)',
                            backdropFilter: 'blur(8px) saturate(1.2)',
                            WebkitBackdropFilter: 'blur(8px) saturate(1.2)',
                        }}
                    />

                    {/* ── Centering wrapper ─────────────────────── */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 pointer-events-none">
                        <motion.div
                            ref={panelRef}
                            key="panel"
                            variants={panelVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="pointer-events-auto w-full max-w-[440px] relative overflow-hidden"
                            style={{
                                perspective: '1200px',
                                background: 'rgba(255, 255, 255, 0.82)',
                                backdropFilter: 'blur(40px) saturate(1.5)',
                                WebkitBackdropFilter: 'blur(40px) saturate(1.5)',
                                border: '1px solid rgba(255, 255, 255, 0.6)',
                                boxShadow: [
                                    '0 32px 80px rgba(0, 0, 0, 0.12)',
                                    '0 12px 32px rgba(0, 0, 0, 0.06)',
                                    '0 0 0 1px rgba(255, 255, 255, 0.4) inset',
                                    '0 1px 0 rgba(255, 255, 255, 0.8) inset',
                                ].join(', '),
                                borderRadius: '1.75rem',
                            }}
                        >
                            {/* ── Floating orbs (ambient glow) ─────── */}
                            <FloatingOrb
                                color="rgba(99,102,241,0.3)"
                                size={140}
                                top="-30px"
                                left="-40px"
                                delay={0}
                            />
                            <FloatingOrb
                                color="rgba(167,139,250,0.25)"
                                size={120}
                                top="60%"
                                left="80%"
                                delay={2}
                            />
                            <FloatingOrb
                                color="rgba(129,140,248,0.2)"
                                size={100}
                                top="30%"
                                left="50%"
                                delay={4}
                            />

                            {/* ── Top decorative bar ───────────────── */}
                            <div
                                className="absolute top-0 inset-x-0 h-[3px]"
                                style={{
                                    background:
                                        'linear-gradient(90deg, transparent 5%, #6366f1 20%, #818cf8 50%, #a78bfa 80%, transparent 95%)',
                                    opacity: 0.7,
                                }}
                            />

                            {/* ── Content ──────────────────────────── */}
                            <div className="relative z-10 p-7 sm:p-8">
                                {/* Header */}
                                <motion.div
                                    variants={childVariants}
                                    className="flex items-start justify-between mb-7"
                                >
                                    <div className="flex items-center gap-3.5">
                                        <AnimatePresence mode="wait">
                                            <ShieldIcon tab={authDialogTab} />
                                        </AnimatePresence>
                                        <div>
                                            <AnimatePresence mode="wait">
                                                <motion.h2
                                                    key={authDialogTab + '-title'}
                                                    initial={{ opacity: 0, y: 6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -6 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="text-xl font-bold text-slate-900 tracking-tight"
                                                >
                                                    {authDialogTab === 'login'
                                                        ? 'Welcome back'
                                                        : 'Create account'}
                                                </motion.h2>
                                            </AnimatePresence>
                                            <AnimatePresence mode="wait">
                                                <motion.p
                                                    key={authDialogTab + '-subtitle'}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.15, delay: 0.05 }}
                                                    className="text-[13px] text-slate-500 mt-0.5"
                                                >
                                                    {authDialogTab === 'login'
                                                        ? 'Sign in to your VerifyID account'
                                                        : 'Start verifying identities for free'}
                                                </motion.p>
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* Close button */}
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 400,
                                            damping: 17,
                                        }}
                                        onClick={closeAuthDialog}
                                        className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors shrink-0 -mt-1 -mr-1"
                                        style={{
                                            background: 'rgba(241, 245, 249, 0.6)',
                                            border: '1px solid rgba(148, 163, 184, 0.12)',
                                        }}
                                    >
                                        <X size={16} strokeWidth={2.5} />
                                    </motion.button>
                                </motion.div>

                                {/* ── Tab switcher ─────────────────── */}
                                <motion.div
                                    variants={childVariants}
                                    className="flex rounded-full p-1 mb-7"
                                    style={{
                                        background: 'rgba(148, 163, 184, 0.1)',
                                        border: '1px solid rgba(148, 163, 184, 0.08)',
                                    }}
                                >
                                    {(['login', 'register'] as const).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => openAuthDialog(tab)}
                                            className="relative flex-1 py-2.5 text-sm font-medium rounded-full transition-colors duration-200 outline-none"
                                            style={{
                                                color:
                                                    authDialogTab === tab
                                                        ? '#1e293b'
                                                        : '#94a3b8',
                                            }}
                                        >
                                            {authDialogTab === tab && (
                                                <motion.div
                                                    layoutId="auth-tab-indicator"
                                                    className="absolute inset-0 rounded-full"
                                                    style={{
                                                        background: 'rgba(255, 255, 255, 0.9)',
                                                        boxShadow: [
                                                            '0 2px 8px rgba(0,0,0,0.06)',
                                                            '0 1px 2px rgba(0,0,0,0.04)',
                                                            'inset 0 1px 0 rgba(255,255,255,0.8)',
                                                        ].join(', '),
                                                        border: '1px solid rgba(148, 163, 184, 0.1)',
                                                    }}
                                                    transition={{
                                                        type: 'spring',
                                                        stiffness: 400,
                                                        damping: 30,
                                                    }}
                                                />
                                            )}
                                            <span className="relative z-10">
                                                {tab === 'login'
                                                    ? 'Sign in'
                                                    : 'Register'}
                                            </span>
                                        </button>
                                    ))}
                                </motion.div>

                                {/* ── Form — animated swap ─────────── */}
                                <motion.div variants={childVariants}>
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={authDialogTab}
                                            initial={{
                                                opacity: 0,
                                                x: authDialogTab === 'login' ? -16 : 16,
                                                filter: 'blur(4px)',
                                            }}
                                            animate={{
                                                opacity: 1,
                                                x: 0,
                                                filter: 'blur(0px)',
                                            }}
                                            exit={{
                                                opacity: 0,
                                                x: authDialogTab === 'login' ? 16 : -16,
                                                filter: 'blur(4px)',
                                            }}
                                            transition={{
                                                duration: 0.25,
                                                ease: [0.4, 0, 0.2, 1],
                                            }}
                                        >
                                            {authDialogTab === 'login' ? (
                                                <LoginForm onSuccess={closeAuthDialog} />
                                            ) : (
                                                <RegisterForm onSuccess={closeAuthDialog} />
                                            )}
                                        </motion.div>
                                    </AnimatePresence>
                                </motion.div>

                                {/* ── Bottom trust badge ───────────── */}
                                <motion.div
                                    variants={childVariants}
                                    className="mt-6 pt-5 flex items-center justify-center gap-2"
                                    style={{
                                        borderTop: '1px solid rgba(148, 163, 184, 0.1)',
                                    }}
                                >
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        className="text-slate-400"
                                    >
                                        <path
                                            d="M8 1L2 4v4c0 3.5 2.5 6.4 6 7 3.5-.6 6-3.5 6-7V4L8 1z"
                                            stroke="currentColor"
                                            strokeWidth="1.3"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M5.5 8.2L7.2 10 10.5 6.5"
                                            stroke="currentColor"
                                            strokeWidth="1.3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <span className="text-xs text-slate-400 tracking-wide">
                                        256-bit encrypted &middot; SOC 2 compliant
                                    </span>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}