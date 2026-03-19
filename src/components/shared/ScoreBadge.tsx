'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
    score: number;   // 0–100
    passed: boolean;
    size?: 'sm' | 'md' | 'lg';
    animate?: boolean;
}

const sizeMap = {
    sm: { outer: 80, stroke: 6, fontSize: 'text-lg' },
    md: { outer: 140, stroke: 8, fontSize: 'text-3xl' },
    lg: { outer: 180, stroke: 10, fontSize: 'text-4xl' },
};

export function ScoreBadge({
    score,
    passed,
    size = 'md',
    animate = true,
}: ScoreBadgeProps) {
    const [displayScore, setDisplayScore] = useState(animate ? 0 : score);
    const { outer, stroke, fontSize } = sizeMap[size];

    // SVG circle math
    const radius = (outer - stroke * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = outer / 2;

    // Animate the number counting up
    useEffect(() => {
        if (!animate) return;
        let start = 0;
        const duration = 1500;
        const step = 16; // ~60fps

        const timer = setInterval(() => {
            start += step;
            const progress = Math.min(start / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayScore(Math.round(eased * score));
            if (progress >= 1) clearInterval(timer);
        }, step);

        return () => clearInterval(timer);
    }, [score, animate]);

    // Stroke offset for the ring progress
    const strokeDashoffset =
        circumference - (displayScore / 100) * circumference;

    // Color based on score and pass/fail
    const ringColor = passed
        ? 'url(#successGrad)'
        : score >= 60
            ? 'url(#warningGrad)'
            : 'url(#failGrad)';

    const glowClass = passed
        ? 'glow-success'
        : 'glow-error';

    const labelColor = passed
        ? 'text-emerald-400'
        : 'text-red-400';

    return (
        <div className="flex flex-col items-center gap-3">

            {/* SVG ring */}
            <motion.div
                initial={animate ? { scale: 0.8, opacity: 0 } : undefined}
                animate={animate ? { scale: 1, opacity: 1 } : undefined}
                transition={{ duration: 0.5, ease: 'backOut' }}
                className={cn('rounded-full', glowClass)}
                style={{ width: outer, height: outer }}
            >
                <svg
                    width={outer}
                    height={outer}
                    viewBox={`0 0 ${outer} ${outer}`}
                    style={{ transform: 'rotate(-90deg)' }}
                >
                    <defs>
                        {/* Success gradient — green */}
                        <linearGradient id="successGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#34d399" />
                            <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                        {/* Warning gradient — amber */}
                        <linearGradient id="warningGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#fbbf24" />
                            <stop offset="100%" stopColor="#d97706" />
                        </linearGradient>
                        {/* Fail gradient — red */}
                        <linearGradient id="failGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f87171" />
                            <stop offset="100%" stopColor="#dc2626" />
                        </linearGradient>
                    </defs>

                    {/* Background track */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth={stroke}
                    />

                    {/* Animated progress ring */}
                    <motion.circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke={ringColor}
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
                    />
                </svg>

                {/* Score number — centered over the ring */}
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center"
                    style={{ position: 'absolute', inset: 0 }}
                >
                    <span className={cn('font-bold text-white', fontSize)}>
                        {displayScore}
                        <span className="text-base font-normal text-white/50">%</span>
                    </span>
                </div>

            </motion.div>

            {/* Pass / Fail label */}
            <motion.div
                initial={animate ? { opacity: 0, y: 6 } : undefined}
                animate={animate ? { opacity: 1, y: 0 } : undefined}
                transition={{ delay: 0.8, duration: 0.3 }}
                className={cn(
                    'text-sm font-semibold tracking-wide uppercase',
                    labelColor,
                )}
            >
                {passed ? '✓ Verified' : '✗ Failed'}
            </motion.div>

        </div>
    );
}