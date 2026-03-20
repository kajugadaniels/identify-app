'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import {
    ArrowRight,
    ScanFace,
    Activity,
    Clock,
    TrendingUp,
} from 'lucide-react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { GlassButton } from '@/components/shared/GlassButton';
import { ProfileCard } from '@/components/dashboard/ProfileCard';
import { VerificationHistory } from '@/components/dashboard/VerificationHistory';

/* ── Stagger variants ───────────────────────────────────── */
const containerVariants: Variants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 18, scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 24,
        },
    },
};

/* ── Time-aware greeting ────────────────────────────────── */
function getGreeting(): { text: string; emoji: string } {
    const h = new Date().getHours();
    if (h < 12) return { text: 'Good morning', emoji: '☀️' };
    if (h < 17) return { text: 'Good afternoon', emoji: '🌤️' };
    if (h < 21) return { text: 'Good evening', emoji: '🌅' };
    return { text: 'Good night', emoji: '🌙' };
}

/* ── Quick stat card ────────────────────────────────────── */
function StatCard({
    icon,
    label,
    value,
    accent,
    trend,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    accent: string;
    trend?: string;
}) {
    return (
        <div
            className="relative rounded-2xl p-5 overflow-hidden group"
            style={{
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(20px) saturate(1.3)',
                WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow:
                    '0 4px 20px rgba(0,0,0,0.03), 0 1px 4px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.6)',
            }}
        >
            {/* Top shine */}
            <div
                className="absolute inset-x-0 top-0 h-[1px] pointer-events-none"
                style={{
                    background:
                        'linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.7) 30%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.7) 70%, transparent 95%)',
                }}
            />

            {/* Accent glow */}
            <div
                className="absolute -top-8 -right-8 w-24 h-24 rounded-full pointer-events-none opacity-[0.06] group-hover:opacity-[0.1] transition-opacity duration-500"
                style={{
                    background: `radial-gradient(circle, ${accent}, transparent 70%)`,
                }}
            />

            <div className="relative z-10">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{
                        background: `linear-gradient(135deg, ${accent}18, ${accent}08)`,
                        border: `1px solid ${accent}15`,
                    }}
                >
                    <span style={{ color: accent }}>{icon}</span>
                </div>
                <p className="text-[11px] uppercase tracking-widest font-semibold text-slate-400 mb-1">
                    {label}
                </p>
                <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-slate-800 tabular-nums">
                        {value}
                    </span>
                    {trend && (
                        <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5 mb-1">
                            <TrendingUp size={10} strokeWidth={2.5} />
                            {trend}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ── Background ambient blobs ───────────────────────────── */
function DashboardBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
            {/* Base */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        'linear-gradient(135deg, #f8fafc 0%, #eef2ff 40%, #f5f3ff 70%, #faf5ff 100%)',
                }}
            />
            {/* Blob 1 */}
            <motion.div
                className="absolute rounded-full"
                style={{
                    width: 500,
                    height: 500,
                    top: '-5%',
                    left: '-8%',
                    background:
                        'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                }}
                animate={{
                    x: [0, 40, -20, 0],
                    y: [0, 30, -10, 0],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Blob 2 */}
            <motion.div
                className="absolute rounded-full"
                style={{
                    width: 400,
                    height: 400,
                    bottom: '5%',
                    right: '-5%',
                    background:
                        'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)',
                    filter: 'blur(50px)',
                }}
                animate={{
                    x: [0, -30, 15, 0],
                    y: [0, -20, 10, 0],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 2,
                }}
            />
            {/* Dot grid */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage:
                        'radial-gradient(rgba(99,102,241,0.04) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    maskImage:
                        'radial-gradient(ellipse at 30% 20%, black 20%, transparent 60%)',
                    WebkitMaskImage:
                        'radial-gradient(ellipse at 30% 20%, black 20%, transparent 60%)',
                }}
            />
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   Dashboard Page
   ═══════════════════════════════════════════════════════════ */
export default function DashboardPage() {
    const { user, isAuthenticated, isLoading } = useRequireAuth();
    const router = useRouter();
    const greeting = useMemo(() => getGreeting(), []);

    // Prevent rendering protected content before redirect fires
    if (isLoading || !isAuthenticated) return null;

    return (
        <>
            <DashboardBackground />

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* ── Header ────────────────────────────────── */}
                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10"
                    >
                        <div>
                            <motion.div
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4 }}
                                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-4"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.6)',
                                    backdropFilter: 'blur(12px)',
                                    WebkitBackdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(255, 255, 255, 0.5)',
                                    boxShadow:
                                        '0 2px 8px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.6)',
                                }}
                            >
                                <span className="text-sm">{greeting.emoji}</span>
                                <span className="text-xs font-semibold text-slate-500 tracking-wide">
                                    {greeting.text}
                                </span>
                            </motion.div>

                            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                                Welcome back,{' '}
                                <span
                                    style={{
                                        background:
                                            'linear-gradient(135deg, #6366f1 0%, #818cf8 40%, #a78bfa 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}
                                >
                                    {user?.firstName}
                                </span>
                            </h1>
                            <p className="text-slate-500 text-sm mt-2 max-w-md">
                                Manage your profile, run verifications, and track
                                your verification history all in one place.
                            </p>
                        </div>

                        <GlassButton
                            variant="primary"
                            size="lg"
                            onClick={() => router.push('/verify')}
                            iconRight={
                                <motion.span
                                    animate={{ x: [0, 3, 0] }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                    className="inline-flex"
                                >
                                    <ArrowRight size={16} strokeWidth={2} />
                                </motion.span>
                            }
                        >
                            New verification
                        </GlassButton>
                    </motion.div>

                    {/* ── Quick stats row ───────────────────────── */}
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8"
                    >
                        <StatCard
                            icon={<ScanFace size={20} strokeWidth={1.8} />}
                            label="Verifications"
                            value="—"
                            accent="#6366f1"
                        />
                        <StatCard
                            icon={<Activity size={20} strokeWidth={1.8} />}
                            label="Success Rate"
                            value="—"
                            accent="#059669"
                        />
                        <StatCard
                            icon={<Clock size={20} strokeWidth={1.8} />}
                            label="Avg. Time"
                            value="—"
                            accent="#818cf8"
                        />
                        <StatCard
                            icon={<TrendingUp size={20} strokeWidth={1.8} />}
                            label="This Month"
                            value="—"
                            accent="#a78bfa"
                        />
                    </motion.div>

                    {/* ── Profile card ──────────────────────────── */}
                    <motion.div variants={itemVariants} className="mb-8">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div
                                className="w-1 h-5 rounded-full"
                                style={{
                                    background:
                                        'linear-gradient(180deg, #6366f1, #a78bfa)',
                                }}
                            />
                            <h2 className="text-lg font-semibold text-slate-800 tracking-tight">
                                Your Profile
                            </h2>
                        </div>
                        <ProfileCard />
                    </motion.div>

                    {/* ── Verification history ──────────────────── */}
                    <motion.div variants={itemVariants}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                                <div
                                    className="w-1 h-5 rounded-full"
                                    style={{
                                        background:
                                            'linear-gradient(180deg, #818cf8, #c4b5fd)',
                                    }}
                                />
                                <h2 className="text-lg font-semibold text-slate-800 tracking-tight">
                                    Verification History
                                </h2>
                            </div>
                            <motion.button
                                whileHover={{ x: 2 }}
                                whileTap={{ scale: 0.97 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 17,
                                }}
                                onClick={() => router.push('/verify')}
                                className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors flex items-center gap-1 outline-none"
                            >
                                Run new check
                                <ArrowRight size={12} strokeWidth={2.5} />
                            </motion.button>
                        </div>
                        <VerificationHistory />
                    </motion.div>

                    {/* ── Footer spacer ─────────────────────────── */}
                    <div className="h-8" />
                </motion.div>
            </div>
        </>
    );
}