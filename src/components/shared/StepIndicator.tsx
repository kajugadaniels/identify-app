'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
        <div className="flex items-center justify-center w-full gap-0">
            {steps.map((step, index) => {
                const isDone = index < currentStep;
                const isActive = index === currentStep;
                const isPending = index > currentStep;

                return (
                    <div key={index} className="flex items-center">

                        {/* Step circle + label */}
                        <div className="flex flex-col items-center gap-2">
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isActive ? 1.15 : 1,
                                }}
                                transition={{ duration: 0.2 }}
                                className={cn(
                                    'w-8 h-8 rounded-full flex items-center justify-center',
                                    'text-xs font-bold transition-all duration-300',
                                    isDone && 'step-pill-done text-white',
                                    isActive && 'step-pill-active text-white',
                                    isPending && 'step-pill-pending text-white/30',
                                )}
                            >
                                {isDone ? '✓' : index + 1}
                            </motion.div>

                            {/* Label — only show on md+ screens */}
                            <span
                                className={cn(
                                    'hidden sm:block text-xs font-medium transition-colors duration-300',
                                    isActive && 'text-white',
                                    isDone && 'text-emerald-400',
                                    isPending && 'text-white/30',
                                )}
                            >
                                {step.label}
                            </span>
                        </div>

                        {/* Connector line between steps */}
                        {index < steps.length - 1 && (
                            <div className="relative w-12 sm:w-20 h-0.5 mx-1 mb-6">
                                {/* Background track */}
                                <div className="absolute inset-0 bg-white/10 rounded-full" />
                                {/* Filled progress */}
                                <motion.div
                                    className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-indigo-500"
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: isDone ? 1 : 0 }}
                                    transition={{ duration: 0.4, ease: 'easeOut' }}
                                    style={{ transformOrigin: 'left' }}
                                />
                            </div>
                        )}

                    </div>
                );
            })}
        </div>
    );
}