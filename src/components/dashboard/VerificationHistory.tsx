'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/shared/GlassCard';
import { ScoreBadge } from '@/components/shared/ScoreBadge';
import { VerificationHistoryItem } from '@/types';

// ── Service layer import ───────────────────────────────
import { getVerificationHistory } from '@/services/user.service';

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

    // ── Loading state — skeleton rows ─────────────────
    if (loading) {
        return (
            <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton h-20 rounded-2xl" />
                ))}
            </div>
        );
    }

    // ── Empty state ────────────────────────────────────
    if (history.length === 0) {
        return (
            <GlassCard variant="sm" className="p-10 text-center">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-white/60 font-medium mb-1">
                    No verifications yet
                </p>
                <p className="text-white/30 text-sm">
                    Your verification history will appear here after your first check
                </p>
            </GlassCard>
        );
    }

    // ── History rows ───────────────────────────────────
    return (
        <div className="flex flex-col gap-3">
            {history.map((item, index) => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.06 }}
                >
                    <GlassCard variant="sm" className="p-4">
                        <div className="flex items-center justify-between gap-4">

                            {/* Small score badge — no animation since it's in a list */}
                            <ScoreBadge
                                score={item.compositeScore}
                                passed={item.passed}
                                size="sm"
                                animate={false}
                            />

                            {/* Score breakdown columns */}
                            <div className="flex-1 grid grid-cols-3 gap-2">
                                {[
                                    { label: 'Liveness', value: item.livenessScore },
                                    { label: 'Face match', value: item.faceMatchScore },
                                    { label: 'OCR', value: item.ocrPassed ? 100 : 0 },
                                ].map((s) => (
                                    <div key={s.label} className="text-center">
                                        <p className="text-white/30 text-xs mb-0.5">{s.label}</p>
                                        <p className="text-white/80 text-sm font-semibold">
                                            {s.value.toFixed(0)}%
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Date + pass/fail label */}
                            <div className="text-right shrink-0">
                                <p className="text-white/30 text-xs">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </p>
                                <span
                                    className={`text-xs font-medium mt-0.5 inline-block ${item.passed ? 'text-emerald-400' : 'text-red-400'
                                        }`}
                                >
                                    {item.passed ? 'Passed' : 'Failed'}
                                </span>
                            </div>

                        </div>
                    </GlassCard>
                </motion.div>
            ))}
        </div>
    );
}