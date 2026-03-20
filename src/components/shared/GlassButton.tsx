'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2Icon } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface GlassButtonProps
    extends Omit<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        'onAnimationStart' | 'onDrag' | 'onDragStart' | 'onDragEnd'
    > {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    icon?: React.ReactNode;
    iconRight?: React.ReactNode;
    fullWidth?: boolean;
}

/* ── Size tokens (increased height + rounded-full) ──────── */
const sizeStyles: Record<ButtonSize, string> = {
    sm: 'h-9  px-4  text-xs  gap-1.5',
    md: 'h-11 px-6  text-sm  gap-2',
    lg: 'h-[52px] px-8  text-base gap-2.5',
};

/* ── Variant base text colour classes ───────────────────── */
const variantClasses: Record<ButtonVariant, string> = {
    primary: 'text-white',
    secondary: 'text-slate-700',
    ghost: 'text-slate-500',
    danger: 'text-white',
};

/* ── Variant inline styles for glassmorphism layering ───── */
function getVariantStyle(variant: ButtonVariant, isHovered: boolean): React.CSSProperties {
    switch (variant) {
        case 'primary':
            return {
                background: isHovered
                    ? 'linear-gradient(135deg, #6366f1 0%, #818cf8 60%, #a78bfa 100%)'
                    : 'linear-gradient(135deg, #6366f1 0%, #7c7ff7 50%, #818cf8 100%)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: isHovered
                    ? '0 8px 28px rgba(99,102,241,0.4), 0 2px 8px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.2)'
                    : '0 4px 16px rgba(99,102,241,0.3), 0 1px 4px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.15)',
            };
        case 'secondary':
            return {
                background: isHovered
                    ? 'rgba(255, 255, 255, 0.82)'
                    : 'rgba(255, 255, 255, 0.55)',
                backdropFilter: 'blur(16px) saturate(1.3)',
                WebkitBackdropFilter: 'blur(16px) saturate(1.3)',
                border: isHovered
                    ? '1px solid rgba(148, 163, 184, 0.22)'
                    : '1px solid rgba(148, 163, 184, 0.15)',
                boxShadow: isHovered
                    ? '0 4px 20px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.7)'
                    : '0 2px 8px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.6)',
            };
        case 'ghost':
            return {
                background: isHovered
                    ? 'rgba(241, 245, 249, 0.6)'
                    : 'transparent',
                border: isHovered
                    ? '1px solid rgba(148, 163, 184, 0.12)'
                    : '1px solid transparent',
                boxShadow: 'none',
            };
        case 'danger':
            return {
                background: isHovered
                    ? 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)'
                    : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: isHovered
                    ? '0 8px 28px rgba(239,68,68,0.35), 0 2px 8px rgba(239,68,68,0.2), inset 0 1px 0 rgba(255,255,255,0.15)'
                    : '0 4px 16px rgba(239,68,68,0.25), 0 1px 4px rgba(239,68,68,0.12), inset 0 1px 0 rgba(255,255,255,0.1)',
            };
    }
}

/* ── Ripple tracker ─────────────────────────────────────── */
interface Ripple {
    id: number;
    x: number;
    y: number;
}

let rippleCounter = 0;

export function GlassButton({
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    iconRight,
    fullWidth = false,
    children,
    className,
    disabled,
    onClick,
    ...props
}: GlassButtonProps) {
    const isDisabled = disabled || loading;
    const [isHovered, setIsHovered] = useState(false);
    const [ripples, setRipples] = useState<Ripple[]>([]);

    /* ── Spawn ripple from exact click position ─────────── */
    function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
        if (isDisabled) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = ++rippleCounter;

        setRipples((prev) => [...prev, { id, x, y }]);
        setTimeout(() => {
            setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 600);

        onClick?.(e);
    }

    const isSolid = variant === 'primary' || variant === 'danger';

    return (
        <motion.button
            whileTap={!isDisabled ? { scale: 0.94, y: 1 } : undefined}
            whileHover={!isDisabled ? { scale: 1.03, y: -1 } : undefined}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className={cn(
                'relative inline-flex items-center justify-center overflow-hidden',
                'rounded-full font-medium',
                'transition-colors duration-300 ease-out',
                'select-none outline-none',
                'focus-visible:ring-2 focus-visible:ring-offset-2',
                variant === 'danger'
                    ? 'focus-visible:ring-red-400/50'
                    : 'focus-visible:ring-indigo-400/50',
                variantClasses[variant],
                sizeStyles[size],
                isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
                fullWidth && 'w-full',
                className,
            )}
            style={{
                ...getVariantStyle(variant, isHovered),
                ...(isDisabled ? { opacity: 0.5 } : {}),
            }}
            disabled={isDisabled}
            onClick={handleClick}
            {...props}
        >
            {/* ── Top-edge glass highlight (solid variants) ── */}
            {isSolid && (
                <span
                    className="pointer-events-none absolute inset-x-0 top-0 h-[1px]"
                    style={{
                        background:
                            'linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.35) 50%, transparent 90%)',
                    }}
                />
            )}

            {/* ── Shimmer sweep on hover (solid variants) ─── */}
            {isSolid && (
                <span
                    className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                    style={{
                        opacity: isHovered ? 1 : 0,
                        background:
                            'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.18) 50%, transparent 65%)',
                        animation: isHovered
                            ? 'glass-btn-shimmer 1.6s ease-in-out infinite'
                            : 'none',
                    }}
                />
            )}

            {/* ── Ghost / secondary hover glow ──────────────── */}
            {!isSolid && (
                <span
                    className="pointer-events-none absolute inset-0 rounded-full transition-opacity duration-300"
                    style={{
                        opacity: isHovered ? 1 : 0,
                        background:
                            'radial-gradient(ellipse at center, rgba(99,102,241,0.06) 0%, transparent 70%)',
                    }}
                />
            )}

            {/* ── Click ripple effects ──────────────────────── */}
            {ripples.map((ripple) => (
                <motion.span
                    key={ripple.id}
                    initial={{ scale: 0, opacity: 0.5 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="pointer-events-none absolute rounded-full"
                    style={{
                        left: ripple.x - 20,
                        top: ripple.y - 20,
                        width: 40,
                        height: 40,
                        background: isSolid
                            ? 'rgba(255, 255, 255, 0.35)'
                            : 'rgba(99, 102, 241, 0.15)',
                    }}
                />
            ))}

            {/* ── Button content ─────────────────────────────── */}
            <span className="relative z-10 inline-flex items-center justify-center gap-2">
                {loading ? (
                    <motion.span
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        className="inline-flex"
                    >
                        <Loader2Icon className="w-4 h-4" />
                    </motion.span>
                ) : (
                    icon && <span className="shrink-0">{icon}</span>
                )}

                {children}

                {!loading && iconRight && (
                    <span className="shrink-0">{iconRight}</span>
                )}
            </span>

            {/* ── Keyframe for shimmer sweep ─────────────────── */}
            <style jsx global>{`
                @keyframes glass-btn-shimmer {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
            `}</style>
        </motion.button>
    );
}