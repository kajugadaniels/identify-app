'use client';

import { useState } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

// Variant controls the glass intensity
type GlassVariant = 'sm' | 'md' | 'lg';

interface GlassCardProps extends HTMLMotionProps<'div'> {
    variant?: GlassVariant;
    hover?: boolean;
    children: React.ReactNode;
    className?: string;
}

/* ── Glass style tokens per variant ─────────────────────── */
const glassStyles: Record<
    GlassVariant,
    {
        bg: string;
        bgHover: string;
        blur: string;
        border: string;
        borderHover: string;
        shadow: string;
        shadowHover: string;
    }
> = {
    sm: {
        bg: 'rgba(255, 255, 255, 0.5)',
        bgHover: 'rgba(255, 255, 255, 0.6)',
        blur: 'blur(12px) saturate(1.2)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        borderHover: '1px solid rgba(255, 255, 255, 0.55)',
        shadow: '0 2px 12px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.5)',
        shadowHover:
            '0 8px 32px rgba(0,0,0,0.06), 0 2px 8px rgba(99,102,241,0.04), inset 0 1px 0 rgba(255,255,255,0.6)',
    },
    md: {
        bg: 'rgba(255, 255, 255, 0.6)',
        bgHover: 'rgba(255, 255, 255, 0.72)',
        blur: 'blur(20px) saturate(1.3)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        borderHover: '1px solid rgba(255, 255, 255, 0.65)',
        shadow: '0 4px 20px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.6)',
        shadowHover:
            '0 12px 40px rgba(0,0,0,0.07), 0 4px 12px rgba(99,102,241,0.05), inset 0 1px 0 rgba(255,255,255,0.7)',
    },
    lg: {
        bg: 'rgba(255, 255, 255, 0.7)',
        bgHover: 'rgba(255, 255, 255, 0.82)',
        blur: 'blur(28px) saturate(1.4)',
        border: '1px solid rgba(255, 255, 255, 0.6)',
        borderHover: '1px solid rgba(255, 255, 255, 0.75)',
        shadow: '0 8px 32px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.7)',
        shadowHover:
            '0 20px 60px rgba(0,0,0,0.08), 0 8px 20px rgba(99,102,241,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
    },
};

export function GlassCard({
    variant = 'md',
    hover = false,
    children,
    className,
    ...props
}: GlassCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const tokens = glassStyles[variant];
    const showHover = hover && isHovered;

    return (
        <motion.div
            /* ── Entrance animation ─────────────────────── */
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
            /* ── Hover lift with spring physics ─────────── */
            whileHover={
                hover
                    ? {
                          y: -6,
                          scale: 1.01,
                          transition: {
                              type: 'spring',
                              stiffness: 300,
                              damping: 20,
                          },
                      }
                    : undefined
            }
            whileTap={
                hover
                    ? {
                          scale: 0.99,
                          y: -2,
                          transition: { duration: 0.15 },
                      }
                    : undefined
            }
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className={cn(
                'relative rounded-2xl overflow-hidden',
                hover && 'cursor-pointer',
                className,
            )}
            style={{
                background: showHover ? tokens.bgHover : tokens.bg,
                backdropFilter: tokens.blur,
                WebkitBackdropFilter: tokens.blur,
                border: showHover ? tokens.borderHover : tokens.border,
                boxShadow: showHover ? tokens.shadowHover : tokens.shadow,
                transition:
                    'background 0.35s ease, border 0.35s ease, box-shadow 0.35s ease',
            }}
            {...props}
        >
            {/* ── Top edge shine line ───────────────────────── */}
            <div
                className="absolute inset-x-0 top-0 h-[1px] pointer-events-none"
                style={{
                    background:
                        'linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.7) 30%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.7) 70%, transparent 95%)',
                }}
            />

            {/* ── Hover glow accent (only when hover enabled) ── */}
            {hover && (
                <motion.div
                    className="absolute inset-0 pointer-events-none rounded-2xl"
                    animate={{
                        opacity: isHovered ? 1 : 0,
                    }}
                    transition={{ duration: 0.4 }}
                    style={{
                        background:
                            'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.06) 0%, transparent 60%)',
                    }}
                />
            )}

            {/* ── Shimmer sweep on hover ────────────────────── */}
            {hover && (
                <div
                    className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl"
                    style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s' }}
                >
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
                            animation: isHovered
                                ? 'glass-card-shimmer 2s ease-in-out infinite'
                                : 'none',
                        }}
                    />
                </div>
            )}

            {/* ── Content ───────────────────────────────────── */}
            <div className="relative z-10">{children}</div>

            {/* ── Keyframe ──────────────────────────────────── */}
            <style jsx global>{`
                @keyframes glass-card-shimmer {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
            `}</style>
        </motion.div>
    );
}