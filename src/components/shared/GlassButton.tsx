'use client';

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
    icon?: React.ReactNode;  // icon shown on the left
    iconRight?: React.ReactNode; // icon shown on the right
    fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
    // Solid indigo gradient — main CTA
    primary: `
    bg-gradient-to-r from-indigo-600 to-violet-600
    hover:from-indigo-500 hover:to-violet-500
    text-white glow-brand
    border border-indigo-500/30
  `,
    // Glass surface — secondary actions
    secondary: `
    glass-md text-white/90
    hover:bg-white/[0.12]
    border-white/10
  `,
    // Transparent — tertiary / nav actions
    ghost: `
    bg-transparent text-white/70
    hover:text-white hover:bg-white/[0.06]
    border-transparent
  `,
    // Red — destructive actions
    danger: `
    bg-gradient-to-r from-red-600 to-rose-600
    hover:from-red-500 hover:to-rose-500
    text-white border border-red-500/30
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'h-8  px-3  text-xs  gap-1.5',
    md: 'h-10 px-5  text-sm  gap-2',
    lg: 'h-12 px-7  text-base gap-2.5',
};

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
    ...props
}: GlassButtonProps) {
    const isDisabled = disabled || loading;

    return (
        <motion.button
            // Subtle press animation on click
            whileTap={!isDisabled ? { scale: 0.97 } : undefined}
            whileHover={!isDisabled ? { scale: 1.01 } : undefined}
            transition={{ duration: 0.15 }}

            className={cn(
                // Base styles
                'relative inline-flex items-center justify-center',
                'rounded-xl font-medium',
                'transition-all duration-200',
                'select-none outline-none',
                // Variant + size
                variantStyles[variant],
                sizeStyles[size],
                // States
                isDisabled && 'opacity-50 cursor-not-allowed',
                fullWidth && 'w-full',
                className,
            )}
            disabled={isDisabled}
            {...props}
        >
            {/* Loading spinner replaces left icon */}
            {loading ? (
                <Loader2Icon className="w-4 h-4 animate-spin" />
            ) : (
                icon && <span className="shrink-0">{icon}</span>
            )}

            {children}

            {/* Right icon — never shown during loading */}
            {!loading && iconRight && (
                <span className="shrink-0">{iconRight}</span>
            )}
        </motion.button>
    );
}