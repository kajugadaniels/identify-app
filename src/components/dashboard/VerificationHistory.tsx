'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { GlassCard } from '@/components/shared/GlassCard';
import { ScoreBadge } from '@/components/shared/ScoreBadge';
import { VerificationHistoryItem } from '@/types';
import { ScanFace, CheckCircle2, XCircle, Search, Clock } from 'lucide-react';

// ── Service layer import ───────────────────────────────
import { getVerificationHistory } from '@/services/user.service';

/* ── Stagger variants ───────────────────────────────────── */
const listVariants: Variants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.06, delayChildren: 0.05 },
    },
};

const rowVariants: Variants = {
    hidden: { opacity: 0, y: 14, scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 320, damping: 26 },
    },
};

/* ── Skeleton shimmer row ───────────────────────────────── */
function SkeletonRow() {
    return (
        <div
            className="relative rounded-2xl overflow-hidden h-[88px]"
            style={{
                background: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(255,255,255,0.4)',
            }}
        >
            <div className="absolute inset-0">
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.6) 50%, transparent 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'skeleton-shimmer 1.8s ease-in-out infinite',
                    }}
                />
            </div>
            <div className="relative p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-slate-200/40" />
                <div className="flex-1 flex gap-6">
                    <div className="w-16 h-3 rounded-full bg-slate-200/50" />
                    <div className="w-16 h-3 rounded-full bg-slate-200/40" />
                    <div className="w-16 h-3 rounded-full bg-slate-200/30" />
                </div>
                <div className="w-14 h-3 rounded-full bg-slate-200/40" />
            </div>
        </div>
    );
}

/* ── Mini score bar ─────────────────────────────────────── */
function MiniBar({
    label,
    value,
    color,
    delay,
}: {
    label: string;
    value: number;
    color: string;
    delay: number;
}) {
    return (
        <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-slate-400 truncate">
                    {label}
                </span>
                <span className="text-[11px] font-bold text-slate-600 tabular-nums ml-1">
                    {value.toFixed(0)}%
                </span>
            </div>
            <div
                className="h-[5px] rounded-full overflow-hidden"
                style={{ background: 'rgba(148,163,184,0.1)' }}
            >
                <motion.div
                    className="h-full rounded-full"
                    style={{
                        background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                        boxShadow: `0 0 6px ${color}22`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{
                        duration: 0.8,
                        delay,
                        ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                />
            </div>
        </div>
    );
}

/* ── Formatted relative time ────────────────────────────── */
function formatRelativeDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

/* ═══════════════════════════════════════════════════════════
   VerificationHistory
   ═══════════════════════════════════════════════════════════ */
export function VerificationHistory() {
    const [history, setHistory] = useState<VerificationHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchHistory() {
            try {
                const data = await getVerificationHistory();
                setHistory(data);
            } catch {
                // Silently fail — empty state handles the UI
            } finally {
                setLoading(false);
            }
        }
        fetchHistory();
    }, []);

    // ── Loading state — shimmer skeletons ──────────────
    if (loading) {
        return (
            <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <SkeletonRow />
                    </motion.div>
                ))}
            </div>
        );
    }

    // ── Empty state ────────────────────────────────────
    if (history.length === 0) {
        return (
            <GlassCard variant="md" className="overflow-hidden">
                <div
                    className="h-1 w-full"
                    style={{
                        background:
                            'linear-gradient(90deg, #818cf8 0%, #a78bfa 50%, #c4b5fd 100%)',
                        opacity: 0.5,
                    }}
                />
                <div className="p-10 sm:p-12 text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 20,
                        }}
                        className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                        style={{
                            background:
                                'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(167,139,250,0.06))',
                            border: '1px solid rgba(99,102,241,0.1)',
                        }}
                    >
                        <Search
                            size={28}
                            strokeWidth={1.5}
                            className="text-indigo-400"
                        />
                    </motion.div>
                    <motion.h3
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-700 font-semibold text-base mb-1.5"
                    >
                        No verifications yet
                    </motion.h3>
                    <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed"
                    >
                        Your verification history will appear here after your
                        first identity check
                    </motion.p>
                </div>
            </GlassCard>
        );
    }

    // ── History rows ───────────────────────────────────
    return (
        <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-3"
        >
            <AnimatePresence>
                {history.map((item, index) => (
                    <motion.div key={item.id} variants={rowVariants} layout>
                        <GlassCard variant="sm" hover className="overflow-hidden">
                            <div className="p-4 sm:p-5">
                                <div className="flex items-center gap-4">
                                    {/* ── Score badge ───────────────── */}
                                    <ScoreBadge
                                        score={item.compositeScore}
                                        passed={item.passed}
                                        size="sm"
                                        animate={false}
                                    />

                                    {/* ── Score breakdown bars ─────── */}
                                    <div className="flex-1 hidden sm:flex items-center gap-4">
                                        <MiniBar
                                            label="Liveness"
                                            value={item.livenessScore}
                                            color="#6366f1"
                                            delay={index * 0.06 + 0.2}
                                        />
                                        <MiniBar
                                            label="Face Match"
                                            value={item.faceMatchScore}
                                            color="#818cf8"
                                            delay={index * 0.06 + 0.3}
                                        />
                                        <MiniBar
                                            label="OCR"
                                            value={
                                                item.ocrPassed ? 100 : 0
                                            }
                                            color="#059669"
                                            delay={index * 0.06 + 0.4}
                                        />
                                    </div>

                                    {/* ── Mobile: compact scores ───── */}
                                    <div className="flex-1 sm:hidden grid grid-cols-3 gap-2">
                                        {[
                                            {
                                                label: 'Live',
                                                value: item.livenessScore,
                                                color: '#6366f1',
                                            },
                                            {
                                                label: 'Face',
                                                value: item.faceMatchScore,
                                                color: '#818cf8',
                                            },
                                            {
                                                label: 'OCR',
                                                value: item.ocrPassed
                                                    ? 100
                                                    : 0,
                                                color: '#059669',
                                            },
                                        ].map((s) => (
                                            <div
                                                key={s.label}
                                                className="text-center"
                                            >
                                                <p className="text-[10px] text-slate-400 font-medium mb-0.5">
                                                    {s.label}
                                                </p>
                                                <p
                                                    className="text-xs font-bold tabular-nums"
                                                    style={{ color: s.color }}
                                                >
                                                    {s.value.toFixed(0)}%
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* ── Status + date ────────────── */}
                                    <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                                        {/* Pass/Fail badge */}
                                        <span
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                                            style={{
                                                background: item.passed
                                                    ? 'rgba(5, 150, 105, 0.08)'
                                                    : 'rgba(239, 68, 68, 0.08)',
                                                color: item.passed
                                                    ? '#059669'
                                                    : '#ef4444',
                                                border: item.passed
                                                    ? '1px solid rgba(5,150,105,0.12)'
                                                    : '1px solid rgba(239,68,68,0.12)',
                                            }}
                                        >
                                            {item.passed ? (
                                                <CheckCircle2
                                                    size={11}
                                                    strokeWidth={2.5}
                                                />
                                            ) : (
                                                <XCircle
                                                    size={11}
                                                    strokeWidth={2.5}
                                                />
                                            )}
                                            {item.passed ? 'Passed' : 'Failed'}
                                        </span>

                                        {/* Relative date */}
                                        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                                            <Clock size={10} strokeWidth={2} />
                                            {formatRelativeDate(
                                                item.createdAt,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* ── Row count footer ──────────────────────────── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: history.length * 0.06 + 0.3 }}
                className="flex items-center justify-center gap-2 pt-2"
            >
                <ScanFace size={12} strokeWidth={2} className="text-slate-300" />
                <span className="text-[11px] text-slate-400 font-medium">
                    {history.length} verification
                    {history.length !== 1 ? 's' : ''} total
                </span>
            </motion.div>

            {/* ── Keyframe ──────────────────────────────────── */}
            <style jsx global>{`
                @keyframes skeleton-shimmer {
                    0% {
                        background-position: 200% 0;
                    }
                    100% {
                        background-position: -200% 0;
                    }
                }
            `}</style>
        </motion.div>
    );
}