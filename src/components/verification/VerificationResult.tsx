'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/shared/GlassCard';
import { GlassButton } from '@/components/shared/GlassButton';
import { ScoreBadge } from '@/components/shared/ScoreBadge';
import { VerificationResult as VerificationResultType } from '@/types';
import {
    ArrowRight,
    RotateCcw,
    User,
    Calendar,
    Fingerprint,
    ScanFace,
    FileText,
    Shield,
} from 'lucide-react';

interface Props {
    result: VerificationResultType;
    onRetry: () => void;
}

/* ── Stagger variants ───────────────────────────────────── */
const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.1, delayChildren: 0.15 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
};

/* ── Color helpers ──────────────────────────────────────── */
function getBarColor(value: number): string {
    if (value >= 80) return '#059669';
    if (value >= 60) return '#d97706';
    return '#dc2626';
}

function getBarGradient(value: number): string {
    if (value >= 80) return 'linear-gradient(90deg, #34d399, #059669)';
    if (value >= 60) return 'linear-gradient(90deg, #fbbf24, #d97706)';
    return 'linear-gradient(90deg, #f87171, #dc2626)';
}

function getBarBg(value: number): string {
    if (value >= 80) return 'rgba(5, 150, 105, 0.08)';
    if (value >= 60) return 'rgba(217, 119, 6, 0.08)';
    return 'rgba(220, 38, 38, 0.08)';
}

/* ── Breakdown row ──────────────────────────────────────── */
function BreakdownRow({
    icon,
    label,
    value,
    index,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    index: number;
}) {
    const color = getBarColor(value);

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                    <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                            background: getBarBg(value),
                            border: `1px solid ${color}15`,
                        }}
                    >
                        <span style={{ color }}>{icon}</span>
                    </div>
                    <span className="text-[13px] text-slate-600 font-medium">
                        {label}
                    </span>
                </div>
                <motion.span
                    className="text-sm font-bold tabular-nums"
                    style={{ color }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.15 + 0.5 }}
                >
                    {value.toFixed(0)}%
                </motion.span>
            </div>
            <div
                className="h-[6px] rounded-full overflow-hidden"
                style={{ background: 'rgba(148, 163, 184, 0.08)' }}
            >
                <motion.div
                    className="h-full rounded-full"
                    style={{
                        background: getBarGradient(value),
                        boxShadow: `0 0 8px ${color}22`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{
                        duration: 1,
                        delay: index * 0.15 + 0.3,
                        ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                />
            </div>
        </div>
    );
}

/* ── Extracted data field ───────────────────────────────── */
function DataField({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-2.5">
            <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{
                    background: 'rgba(99,102,241,0.06)',
                    border: '1px solid rgba(99,102,241,0.08)',
                }}
            >
                <span className="text-indigo-500">{icon}</span>
            </div>
            <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                    {label}
                </p>
                <p className="text-sm font-medium text-slate-700 truncate">
                    {value}
                </p>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   VerificationResult
   ═══════════════════════════════════════════════════════════ */
export function VerificationResult({ result, onRetry }: Props) {
    const router = useRouter();

    const breakdownItems = [
        {
            icon: <Fingerprint size={14} strokeWidth={2} />,
            label: 'Liveness detection',
            value: result.breakdown.liveness_score,
        },
        {
            icon: <ScanFace size={14} strokeWidth={2} />,
            label: 'Face match',
            value: result.breakdown.face_match_score,
        },
        {
            icon: <FileText size={14} strokeWidth={2} />,
            label: 'ID text extraction',
            value: result.breakdown.ocr_passed ? 100 : 0,
        },
    ];

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-6 py-4"
        >
            {/* ── Score ring ────────────────────────────────── */}
            <motion.div variants={itemVariants}>
                <ScoreBadge
                    score={result.compositeScore}
                    passed={result.passed}
                    size="lg"
                    animate
                />
            </motion.div>

            {/* ── Result message ─────────────────────────────── */}
            <motion.div variants={itemVariants} className="text-center">
                <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
                    {result.message}
                </p>
            </motion.div>

            {/* ── Score breakdown card ───────────────────────── */}
            <motion.div variants={itemVariants} className="w-full">
                <GlassCard variant="md" className="overflow-hidden">
                    {/* Top accent */}
                    <div
                        className="h-[3px] w-full"
                        style={{
                            background: result.passed
                                ? 'linear-gradient(90deg, #059669, #34d399, #6ee7b7)'
                                : 'linear-gradient(90deg, #ef4444, #f87171, #fca5a5)',
                            opacity: 0.6,
                        }}
                    />

                    <div className="p-5 sm:p-6">
                        {/* Section header */}
                        <div className="flex items-center gap-2 mb-5">
                            <div
                                className="w-1 h-4 rounded-full"
                                style={{
                                    background: result.passed
                                        ? 'linear-gradient(180deg, #059669, #34d399)'
                                        : 'linear-gradient(180deg, #ef4444, #f87171)',
                                }}
                            />
                            <span className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">
                                Score breakdown
                            </span>
                        </div>

                        {/* Breakdown rows */}
                        <div className="flex flex-col gap-4">
                            {breakdownItems.map((item, i) => (
                                <BreakdownRow
                                    key={item.label}
                                    icon={item.icon}
                                    label={item.label}
                                    value={item.value}
                                    index={i}
                                />
                            ))}
                        </div>

                        {/* ── Extracted data ─────────────────────── */}
                        {result.extractedData && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8, duration: 0.4 }}
                                className="mt-5 pt-5"
                                style={{
                                    borderTop:
                                        '1px solid rgba(148, 163, 184, 0.1)',
                                }}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <div
                                        className="w-1 h-4 rounded-full"
                                        style={{
                                            background:
                                                'linear-gradient(180deg, #6366f1, #a78bfa)',
                                        }}
                                    />
                                    <span className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">
                                        Extracted Information
                                    </span>
                                </div>

                                <div
                                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl p-4"
                                    style={{
                                        background: 'rgba(248, 250, 252, 0.5)',
                                        border: '1px solid rgba(148, 163, 184, 0.08)',
                                    }}
                                >
                                    {result.extractedData.name && (
                                        <DataField
                                            icon={
                                                <User
                                                    size={14}
                                                    strokeWidth={2}
                                                />
                                            }
                                            label="Name on ID"
                                            value={result.extractedData.name}
                                        />
                                    )}
                                    {result.extractedData.dateOfBirth && (
                                        <DataField
                                            icon={
                                                <Calendar
                                                    size={14}
                                                    strokeWidth={2}
                                                />
                                            }
                                            label="Date of birth"
                                            value={
                                                result.extractedData
                                                    .dateOfBirth
                                            }
                                        />
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </GlassCard>
            </motion.div>

            {/* ── Security notice ────────────────────────────── */}
            <motion.div
                variants={itemVariants}
                className="flex items-center gap-2"
            >
                <Shield
                    size={12}
                    strokeWidth={2}
                    className="text-slate-400"
                />
                <span className="text-[11px] text-slate-400 font-medium">
                    Images securely discarded &middot; Only scores retained
                </span>
            </motion.div>

            {/* ── Action buttons ─────────────────────────────── */}
            <motion.div variants={itemVariants} className="flex gap-3 w-full">
                <GlassButton
                    variant="secondary"
                    size="lg"
                    fullWidth
                    onClick={onRetry}
                    icon={<RotateCcw size={14} strokeWidth={2} />}
                >
                    Try again
                </GlassButton>
                <GlassButton
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={() => router.push('/dashboard')}
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
                            <ArrowRight size={15} strokeWidth={2} />
                        </motion.span>
                    }
                >
                    Dashboard
                </GlassButton>
            </motion.div>
        </motion.div>
    );
}