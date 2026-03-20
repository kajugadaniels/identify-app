'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useUiStore } from '@/store/ui.store';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

const panelVariants = {
    hidden: { opacity: 0, scale: 0.94, y: 16 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 320, damping: 28 },
    },
    exit: {
        opacity: 0,
        scale: 0.94,
        y: 12,
        transition: { duration: 0.18, ease: 'easeIn' },
    },
};

export function AuthDialog() {
    const { isAuthDialogOpen, authDialogTab, closeAuthDialog, openAuthDialog } = useUiStore();

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
        return () => { document.body.style.overflow = ''; };
    }, [isAuthDialogOpen]);

    return (
        <AnimatePresence>
            {isAuthDialogOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{ duration: 0.2 }}
                        onClick={closeAuthDialog}
                        className="fixed inset-0 z-50"
                        style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)' }}
                    />

                    {/* Dialog panel */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 pointer-events-none">
                        <motion.div
                            key="panel"
                            variants={panelVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="pointer-events-auto w-full max-w-md"
                            style={{
                                background: 'rgba(255, 255, 255, 0.88)',
                                backdropFilter: 'blur(40px)',
                                WebkitBackdropFilter: 'blur(40px)',
                                border: '1px solid rgba(255, 255, 255, 0.92)',
                                boxShadow: '0 24px 64px rgba(0, 0, 0, 0.14)',
                                borderRadius: '1.5rem',
                                padding: '2rem',
                            }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        {authDialogTab === 'login' ? 'Welcome back' : 'Create account'}
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-0.5">
                                        {authDialogTab === 'login'
                                            ? 'Sign in to your VerifyID account'
                                            : 'Start verifying identities for free'}
                                    </p>
                                </div>
                                <button
                                    onClick={closeAuthDialog}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Tab switcher */}
                            <div className="flex rounded-xl p-1 mb-6" style={{ background: 'rgba(148, 163, 184, 0.12)' }}>
                                {(['login', 'register'] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => openAuthDialog(tab)}
                                        className="relative flex-1 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
                                        style={{
                                            color: authDialogTab === tab ? '#0f172a' : '#94a3b8',
                                        }}
                                    >
                                        {authDialogTab === tab && (
                                            <motion.div
                                                layoutId="auth-tab-indicator"
                                                className="absolute inset-0 rounded-lg"
                                                style={{
                                                    background: 'rgba(255, 255, 255, 0.95)',
                                                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                                                }}
                                                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                            />
                                        )}
                                        <span className="relative z-10">
                                            {tab === 'login' ? 'Sign in' : 'Register'}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Form — animated swap */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={authDialogTab}
                                    initial={{ opacity: 0, x: authDialogTab === 'login' ? -12 : 12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: authDialogTab === 'login' ? 12 : -12 }}
                                    transition={{ duration: 0.2, ease: 'easeOut' }}
                                >
                                    {authDialogTab === 'login' ? (
                                        <LoginForm onSuccess={closeAuthDialog} />
                                    ) : (
                                        <RegisterForm onSuccess={closeAuthDialog} />
                                    )}
                                </motion.div>
                            </AnimatePresence>

                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
