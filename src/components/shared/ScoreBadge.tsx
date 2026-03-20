'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Shield } from 'lucide-react';

interface ScoreBadgeProps {
    score: number; // 0–100
    passed: boolean;
    size?: 'sm' | 'md' | 'lg';
    animate?: boolean;
}

const sizeMap = {
    sm: {
        outer: 80,
        stroke: 5,
        fontSize: 'text-lg',
        labelSize: 'text-[10px]',
        iconSize: 10,
        percentSize: 'text-[10px]',
        gap: 'gap-2',
    },
    md: {
        outer: 140,
        stroke: 7,
        fontSize: 'text-3xl',
        labelSize: 'text-xs',
        iconSize: 14,
        percentSize: 'text-sm',
        gap: 'gap-3',
    },
    lg: {
        outer: 180,
        stroke: 9,
        fontSize: 'text-5xl',
        labelSize: 'text-sm',
        iconSize: 16,
        percentSize: 'text-base',
        gap: 'gap-4',
    },
};

/* ── Color palette per state ────────────────────────────── */
function getColors(passed: boolean, score: number) {
    if (passed) {
        return {
            gradientId: 'successGrad',
            stops: ['#34d399', '#059669'],
            glow: 'rgba(5, 150, 105, 0.2)',
            glowStrong: 'rgba(5, 150, 105, 0.35)',
            bg: 'rgba(5, 150, 105, 0.06)',
            border: 'rgba(5, 150, 105, 0.12)',
            text: 'text-emerald-600',
            label: 'Verified',
        };
    }
    if (score >= 60) {
        return {
            gradientId: 'warningGrad',
            stops: ['#fbbf24', '#d97706'],
            glow: 'rgba(217, 119, 6, 0.2)',
            glowStrong: 'rgba(217, 119, 6, 0.3)',
            bg: 'rgba(217, 119, 6, 0.06)',
            border: 'rgba(217, 119, 6, 0.12)',
            text: 'text-amber-600',
            label: 'Partial',
        };
    }
    return {
        gradientId: 'failGrad',
        stops: ['#f87171', '#dc2626'],
        glow: 'rgba(220, 38, 38, 0.2)',
        glowStrong: 'rgba(220, 38, 38, 0.3)',
        bg: 'rgba(239, 68, 68, 0.06)',
        border: 'rgba(239, 68, 68, 0.12)',
        text: 'text-red-500',
        label: 'Failed',
    };
}

export function ScoreBadge({
    score,
    passed,
    size = 'md',
    animate = true,
}: ScoreBadgeProps) {
    const [displayScore, setDisplayScore] = useState(animate ? 0 : score);
    const [completed, setCompleted] = useState(!animate);
    const config = sizeMap[size];
    const colors = getColors(passed, score);

    // SVG circle math
    const radius = (config.outer - config.stroke * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = config.outer / 2;

    // Animate the number counting up
    useEffect(() => {
        if (!animate) return;
        let start = 0;
        const duration = 1500;
        const step = 16;

        const timer = setInterval(() => {
            start += step;
            const progress = Math.min(start / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayScore(Math.round(eased * score));
            if (progress >= 1) {
                clearInterval(timer);
                setCompleted(true);
            }
        }, step);

        return () => clearInterval(timer);
    }, [score, animate]);

    const strokeDashoffset =
        circumference - (displayScore / 100) * circumference;

    const showLarge = size === 'md' || size === 'lg';

    return (
        <div className={cn('flex flex-col items-center', config.gap)}>
            {/* ── Ring container ─────────────────────────────── */}
            <motion.div
                initial={animate ? { scale: 0.8, opacity: 0 } : undefined}
                animate={animate ? { scale: 1, opacity: 1 } : undefined}
                transition={{
                    type: 'spring',
                    stiffness: 280,
                    damping: 22,
                    delay: 0.1,
                }}
                className="relative"
                style={{ width: config.outer, height: config.outer }}
            >
                {/* Pulsing glow ring (behind SVG) */}
                {showLarge && (
                    <motion.div
                        className="absolute inset-0 rounded-full"
                        animate={
                            completed
                                ? {
                                      boxShadow: [
                                          `0 0 0px ${colors.glow}`,
                                          `0 0 24px ${colors.glowStrong}`,
                                          `0 0 0px ${colors.glow}`,
                                      ],
                                  }
                                : {}
                        }
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                )}

                {/* Glass backdrop circle */}
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: 'rgba(255, 255, 255, 0.5)',
                        backdropFilter: showLarge
                            ? 'blur(16px) saturate(1.2)'
                            : 'blur(8px)',
                        WebkitBackdropFilter: showLarge
                            ? 'blur(16px) saturate(1.2)'
                            : 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                        boxShadow:
                            'inset 0 1px 0 rgba(255,255,255,0.6), 0 4px 16px rgba(0,0,0,0.04)',
                    }}
                />

                {/* SVG ring */}
                <svg
                    width={config.outer}
                    height={config.outer}
                    viewBox={`0 0 ${config.outer} ${config.outer}`}
                    className="relative z-10"
                    style={{ transform: 'rotate(-90deg)' }}
                >
                    <defs>
                        <linearGradient
                            id={`${colors.gradientId}-${size}`}
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                        >
                            <stop offset="0%" stopColor={colors.stops[0]} />
                            <stop offset="100%" stopColor={colors.stops[1]} />
                        </linearGradient>
                        {/* Glow filter for the ring */}
                        <filter id={`ring-glow-${size}`}>
                            <feGaussianBlur
                                stdDeviation="3"
                                result="blur"
                            />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Background track */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke="rgba(148, 163, 184, 0.1)"
                        strokeWidth={config.stroke}
                    />

                    {/* Track tick marks (decorative, md/lg only) */}
                    {showLarge &&
                        Array.from({ length: 40 }).map((_, i) => {
                            const angle = (i / 40) * 360;
                            const rad = (angle * Math.PI) / 180;
                            const innerR = radius - config.stroke - 2;
                            const outerR = radius - config.stroke + 1;
                            const x1 = center + innerR * Math.cos(rad);
                            const y1 = center + innerR * Math.sin(rad);
                            const x2 = center + outerR * Math.cos(rad);
                            const y2 = center + outerR * Math.sin(rad);
                            return (
                                <line
                                    key={i}
                                    x1={x1}
                                    y1={y1}
                                    x2={x2}
                                    y2={y2}
                                    stroke="rgba(148,163,184,0.08)"
                                    strokeWidth="0.5"
                                />
                            );
                        })}

                    {/* Animated progress ring */}
                    <motion.circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke={`url(#${colors.gradientId}-${size})`}
                        strokeWidth={config.stroke}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{
                            duration: 1.5,
                            ease: [0.25, 0.46, 0.45, 0.94],
                            delay: 0.2,
                        }}
                        filter={
                            showLarge
                                ? `url(#ring-glow-${size})`
                                : undefined
                        }
                    />
                </svg>

                {/* Score number — centered */}
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
                    {showLarge && (
                        <motion.div
                            initial={animate ? { opacity: 0, scale: 0.5 } : undefined}
                            animate={animate ? { opacity: 1, scale: 1 } : undefined}
                            transition={{ delay: 0.3, duration: 0.4 }}
                        >
                            <Shield
                                size={size === 'lg' ? 16 : 12}
                                strokeWidth={2}
                                className="text-slate-300 mb-1 mx-auto"
                            />
                        </motion.div>
                    )}
                    <span
                        className={cn(
                            'font-bold text-slate-800 tabular-nums leading-none',
                            config.fontSize,
                        )}
                    >
                        {displayScore}
                        <span
                            className={cn(
                                'font-medium text-slate-400',
                                config.percentSize,
                            )}
                        >
                            %
                        </span>
                    </span>
                </div>

                {/* Completion burst particles (md/lg only) */}
                <AnimatePresence>
                    {completed && animate && showLarge && (
                        <>
                            {Array.from({ length: 8 }).map((_, i) => {
                                const angle = (i / 8) * 360;
                                const rad = (angle * Math.PI) / 180;
                                const dist = config.outer * 0.6;
                                return (
                                    <motion.div
                                        key={`particle-${i}`}
                                        className="absolute rounded-full"
                                        style={{
                                            width: 4,
                                            height: 4,
                                            top: '50%',
                                            left: '50%',
                                            marginTop: -2,
                                            marginLeft: -2,
                                            background: colors.stops[i % 2],
                                        }}
                                        initial={{
                                            scale: 0,
                                            x: 0,
                                            y: 0,
                                            opacity: 1,
                                        }}
                                        animate={{
                                            scale: [0, 1.5, 0],
                                            x: Math.cos(rad) * dist,
                                            y: Math.sin(rad) * dist,
                                            opacity: [1, 1, 0],
                                        }}
                                        transition={{
                                            duration: 0.7,
                                            ease: 'easeOut',
                                            delay: i * 0.03,
                                        }}
                                    />
                                );
                            })}
                        </>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* ── Status badge ───────────────────────────────── */}
            <motion.div
                initial={animate ? { opacity: 0, y: 6 } : undefined}
                animate={animate ? { opacity: 1, y: 0 } : undefined}
                transition={{ delay: 0.8, duration: 0.3 }}
            >
                <span
                    className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold uppercase tracking-wider',
                        config.labelSize,
                        colors.text,
                    )}
                    style={{
                        background: colors.bg,
                        border: `1px solid ${colors.border}`,
                    }}
                >
                    {passed ? (
                        <CheckCircle2
                            size={config.iconSize}
                            strokeWidth={2.5}
                        />
                    ) : (
                        <XCircle
                            size={config.iconSize}
                            strokeWidth={2.5}
                        />
                    )}
                    {colors.label}
                </span>
            </motion.div>
        </div>
    );
}