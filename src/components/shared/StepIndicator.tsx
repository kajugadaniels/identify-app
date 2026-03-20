'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
    label: string;
    description?: string;
}

interface StepIndicatorProps {
    steps: Step[];
    currentStep: number; // 0-indexed
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
    return (
        <div className="flex items-start justify-center w-full">
            {steps.map((step, index) => {
                const isDone = index < currentStep;
                const isActive = index === currentStep;
                const isPending = index > currentStep;

                return (
                    <div key={index} className="flex items-start">
                        {/* ── Step node + label column ──────────── */}
                        <div className="flex flex-col items-center gap-2.5 relative">

                            {/* Pulsing glow ring behind active step */}
                            {isActive && (
                                <motion.div
                                    className="absolute top-0 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full"
                                    animate={{
                                        boxShadow: [
                                            '0 0 0px rgba(99,102,241,0.15)',
                                            '0 0 18px rgba(99,102,241,0.3)',
                                            '0 0 0px rgba(99,102,241,0.15)',
                                        ],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                />
                            )}

                            {/* Step circle */}
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isActive ? 1.1 : 1,
                                }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 20,
                                }}
                                className="relative w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold z-10"
                                style={{
                                    /* Done: gradient emerald */
                                    ...(isDone && {
                                        background:
                                            'linear-gradient(135deg, #059669, #34d399)',
                                        boxShadow:
                                            '0 4px 14px rgba(5,150,105,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                                        color: 'white',
                                    }),
                                    /* Active: gradient indigo */
                                    ...(isActive && {
                                        background:
                                            'linear-gradient(135deg, #6366f1, #818cf8)',
                                        boxShadow:
                                            '0 4px 14px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
                                        color: 'white',
                                    }),
                                    /* Pending: glass */
                                    ...(isPending && {
                                        background: 'rgba(255, 255, 255, 0.5)',
                                        backdropFilter: 'blur(8px)',
                                        WebkitBackdropFilter: 'blur(8px)',
                                        border: '1.5px solid rgba(148, 163, 184, 0.15)',
                                        boxShadow:
                                            'inset 0 1px 0 rgba(255,255,255,0.5), 0 2px 8px rgba(0,0,0,0.02)',
                                        color: '#94a3b8',
                                    }),
                                }}
                            >
                                {/* Top shine */}
                                {(isDone || isActive) && (
                                    <div
                                        className="absolute inset-x-0 top-0 h-[1px] rounded-full pointer-events-none"
                                        style={{
                                            background:
                                                'linear-gradient(90deg, transparent 15%, rgba(255,255,255,0.4) 50%, transparent 85%)',
                                        }}
                                    />
                                )}

                                {/* Content: checkmark or number */}
                                {isDone ? (
                                    <motion.div
                                        initial={{ scale: 0, rotate: -45 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 500,
                                            damping: 20,
                                        }}
                                    >
                                        <Check
                                            size={14}
                                            strokeWidth={3}
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.span
                                        key={`num-${index}-${isActive}`}
                                        initial={
                                            isActive
                                                ? { scale: 0.5, opacity: 0 }
                                                : false
                                        }
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        {index + 1}
                                    </motion.span>
                                )}
                            </motion.div>

                            {/* Label — only on sm+ */}
                            <div className="hidden sm:flex flex-col items-center">
                                <motion.span
                                    initial={false}
                                    animate={{
                                        color: isDone
                                            ? '#059669'
                                            : isActive
                                                ? '#4f46e5'
                                                : '#94a3b8',
                                    }}
                                    transition={{ duration: 0.3 }}
                                    className="text-[11px] font-semibold tracking-wide"
                                >
                                    {step.label}
                                </motion.span>

                                {/* Optional dot under active label */}
                                {isActive && (
                                    <motion.div
                                        layoutId="step-active-dot"
                                        className="w-1 h-1 rounded-full bg-indigo-500 mt-1.5"
                                        transition={{
                                            type: 'spring',
                                            stiffness: 400,
                                            damping: 28,
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* ── Connector line between steps ──────── */}
                        {index < steps.length - 1 && (
                            <div className="relative w-10 sm:w-16 lg:w-20 h-[2px] mx-1.5 sm:mx-2 mt-[18px]">
                                {/* Track */}
                                <div
                                    className="absolute inset-0 rounded-full"
                                    style={{
                                        background: 'rgba(148, 163, 184, 0.12)',
                                    }}
                                />

                                {/* Filled progress */}
                                <motion.div
                                    className="absolute inset-0 rounded-full"
                                    style={{
                                        background:
                                            'linear-gradient(90deg, #059669, #34d399)',
                                        transformOrigin: 'left',
                                        boxShadow: isDone
                                            ? '0 0 8px rgba(5,150,105,0.2)'
                                            : 'none',
                                    }}
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: isDone ? 1 : 0 }}
                                    transition={{
                                        duration: 0.5,
                                        ease: [0.25, 0.46, 0.45, 0.94],
                                    }}
                                />

                                {/* Active connector: partial fill with indigo */}
                                {isActive && (
                                    <motion.div
                                        className="absolute inset-0 rounded-full"
                                        style={{
                                            background:
                                                'linear-gradient(90deg, #6366f1, transparent)',
                                            transformOrigin: 'left',
                                        }}
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 0.3 }}
                                        transition={{
                                            duration: 0.6,
                                            ease: 'easeOut',
                                        }}
                                    />
                                )}

                                {/* Moving dot on active connector */}
                                {isActive && (
                                    <motion.div
                                        className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-400"
                                        animate={{
                                            left: ['0%', '30%', '0%'],
                                            opacity: [0, 1, 0],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: 'easeInOut',
                                        }}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}