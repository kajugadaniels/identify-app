'use client';

import { motion } from 'framer-motion';
import { GlassButton } from '@/components/shared/GlassButton';
import { GlassCard } from '@/components/shared/GlassCard';
import { useUiStore } from '@/store/ui.store';

// ── Feature cards data ────────────────────────────────
const FEATURES = [
    {
        icon: '🛡️',
        title: 'Liveness Detection',
        description:
            'Real-time camera challenge confirms a live person — blocks photos, masks and deepfakes.',
    },
    {
        icon: '🔍',
        title: 'Face Matching',
        description:
            'AWS Rekognition compares your selfie against your ID with up to 99% accuracy.',
    },
    {
        icon: '📄',
        title: 'ID Text Extraction',
        description:
            'OCR automatically reads your name and date of birth directly from the card.',
    },
    {
        icon: '📊',
        title: 'Accuracy Score',
        description:
            'Every verification returns a composite confidence score with a full breakdown.',
    },
    {
        icon: '🔒',
        title: 'Zero Storage',
        description:
            'Raw images are never stored. Only encrypted score metadata is saved.',
    },
    {
        icon: '⚡',
        title: 'Under 5 Seconds',
        description:
            'The full verification pipeline completes in under 5 seconds end to end.',
    },
];

// ── Animation variants ────────────────────────────────
const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 28, scale: 0.97 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number] },
    },
};

export default function LandingPage() {
    const { openAuthDialog } = useUiStore();

    return (
        <div className="min-h-screen">

            {/* ── Hero section ────────────────────────────── */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center">

                {/* Pill badge */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-slate-500 mb-8"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    AI-powered identity verification
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
                    className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-tight mb-6"
                >
                    Verify identity{' '}
                    <span className="gradient-text">in seconds</span>
                    <br />
                    not minutes
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, delay: 0.2 }}
                    className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                    Biometric face matching, liveness detection and ID document verification
                    — all in one secure, instant pipeline.
                </motion.p>

                {/* CTA buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <GlassButton
                        variant="primary"
                        size="lg"
                        onClick={() => openAuthDialog('register')}
                    >
                        Get started free
                    </GlassButton>
                    <GlassButton
                        variant="secondary"
                        size="lg"
                        onClick={() => openAuthDialog('login')}
                    >
                        Sign in
                    </GlassButton>
                </motion.div>

                {/* Trust indicators */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="flex flex-wrap items-center justify-center gap-6 mt-12 text-xs text-slate-400"
                >
                    {['No credit card required', 'GDPR compliant', 'End-to-end encrypted'].map(
                        (item) => (
                            <span key={item} className="flex items-center gap-1.5">
                                <span className="text-emerald-500">✓</span>
                                {item}
                            </span>
                        ),
                    )}
                </motion.div>

                {/* Floating score preview card */}
                <motion.div
                    initial={{ opacity: 0, y: 48 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.85, delay: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
                    className="mt-20 flex justify-center"
                >
                    <div className="glass-lg rounded-3xl p-8 max-w-sm w-full">
                        {/* Mock result display */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">
                                    Verification result
                                </p>
                                <p className="text-slate-800 font-semibold">John Doe</p>
                            </div>
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white"
                                style={{
                                    backgroundColor: '#059669',
                                    boxShadow: '0 0 20px rgba(5,150,105,0.35)',
                                }}
                            >
                                ✓
                            </div>
                        </div>

                        {/* Score bar rows */}
                        {[
                            { label: 'Liveness', score: 97, color: '#6366f1' },
                            { label: 'Face match', score: 94, color: '#a78bfa' },
                            { label: 'OCR', score: 100, color: '#059669' },
                        ].map((item) => (
                            <div key={item.label} className="mb-3">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-400">{item.label}</span>
                                    <span className="text-slate-600 font-medium">{item.score}%</span>
                                </div>
                                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(148,163,184,0.2)' }}>
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: item.color }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.score}%` }}
                                        transition={{ duration: 1.2, delay: 0.8, ease: 'easeOut' }}
                                    />
                                </div>
                            </div>
                        ))}

                        <div
                            className="mt-5 pt-4 border-t border-slate-200/60 flex items-center justify-between"
                        >
                            <span className="text-xs text-slate-400">Composite score</span>
                            <span className="text-xl font-bold text-indigo-600">
                                97%
                            </span>
                        </div>
                    </div>
                </motion.div>

            </section>

            {/* ── Features section ─────────────────────────── */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-14"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                        Everything you need to{' '}
                        <span className="gradient-text">trust your users</span>
                    </h2>
                    <p className="text-slate-500 max-w-xl mx-auto">
                        A complete verification pipeline powered by AWS Rekognition
                        and built with security as the default.
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-80px' }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                    {FEATURES.map((feature) => (
                        <motion.div key={feature.title} variants={itemVariants}>
                            <GlassCard
                                variant="md"
                                hover
                                className="p-6 h-full"
                            >
                                <div className="text-3xl mb-4">{feature.icon}</div>
                                <h3 className="text-slate-800 font-semibold mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </GlassCard>
                        </motion.div>
                    ))}
                </motion.div>

            </section>

            {/* ── CTA section ──────────────────────────────── */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <GlassCard
                        variant="lg"
                        className="p-10 sm:p-16 text-center"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                            Ready to verify your first identity?
                        </h2>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto">
                            Create a free account and run your first verification
                            in under two minutes.
                        </p>
                        <GlassButton
                            variant="primary"
                            size="lg"
                            onClick={() => openAuthDialog('register')}
                        >
                            Create free account
                        </GlassButton>
                    </GlassCard>
                </motion.div>
            </section>

            {/* ── Footer ───────────────────────────────────── */}
            <footer className="border-t border-slate-200/70 py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-sm text-slate-400">
                        © 2026 VerifyID. Built with security first.
                    </span>
                    <div className="flex gap-6 text-sm text-slate-400">
                        <span>Privacy</span>
                        <span>Terms</span>
                        <span>Security</span>
                    </div>
                </div>
            </footer>

        </div>
    );
}
