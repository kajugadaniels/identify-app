// src/components/verification/VerificationResult.tsx

'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/shared/GlassCard';
import { GlassButton } from '@/components/shared/GlassButton';
import { ScoreBadge } from '@/components/shared/ScoreBadge';
import { VerificationResult as VerificationResultType } from '@/types';

interface Props {
    result: VerificationResultType;
    onRetry: () => void;
}

export function VerificationResult({ result, onRetry }: Props) {
    const router = useRouter();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'backOut' }}
            className="flex flex-col items-center gap-6 py-4"
        >
            {/* Score ring */}
            <ScoreBadge
                score={result.compositeScore}
                passed={result.passed}
                size="lg"
                animate
            />

            {/* Message */}
            <p className="text-white/60 text-sm text-center max-w-xs">
                {result.message}
            </p>

            {/* Score breakdown */}
            <GlassCard variant="sm" className="w-full p-5">
                <p className="text-xs text-white/40 uppercase tracking-widest mb-4">
                    Score breakdown
                </p>

                <div className="flex flex-col gap-3">
                    {[
                        { label: 'Liveness detection', value: result.breakdown.liveness_score },
                        { label: 'Face match', value: result.breakdown.face_match_score },
                        {
                            label: 'ID text extraction',
                            value: result.breakdown.ocr_passed ? 100 : 0,
                        },
                    ].map((item, i) => (
                        <div key={item.label}>
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="text-white/50">{item.label}</span>
                                <span className="text-white/80 font-medium">
                                    {item.value.toFixed(0)}%
                                </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{
                                        background:
                                            item.value >= 80
                                                ? 'linear-gradient(90deg, #34d399, #059669)'
                                                : item.value >= 60
                                                    ? 'linear-gradient(90deg, #fbbf24, #d97706)'
                                                    : 'linear-gradient(90deg, #f87171, #dc2626)',
                                    }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.value}%` }}
                                    transition={{ duration: 0.8, delay: i * 0.15, ease: 'easeOut' }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Extracted data — only if OCR passed */}
                {result.extractedData && (
                    <div className="mt-5 pt-4 border-t border-white/[0.06] grid grid-cols-2 gap-3">
                        {result.extractedData.name && (
                            <div>
                                <p className="text-xs text-white/30 mb-0.5">Name on ID</p>
                                <p className="text-sm text-white/70 font-medium">
                                    {result.extractedData.name}
                                </p>
                            </div>
                        )}
                        {result.extractedData.dateOfBirth && (
                            <div>
                                <p className="text-xs text-white/30 mb-0.5">Date of birth</p>
                                <p className="text-sm text-white/70 font-medium">
                                    {result.extractedData.dateOfBirth}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </GlassCard>

            {/* Actions */}
            <div className="flex gap-3 w-full">
                <GlassButton
                    variant="secondary"
                    fullWidth
                    onClick={onRetry}
                >
                    Try again
                </GlassButton>
                <GlassButton
                    variant="primary"
                    fullWidth
                    onClick={() => router.push('/dashboard')}
                >
                    View dashboard
                </GlassButton>
            </div>

        </motion.div>
    );
}