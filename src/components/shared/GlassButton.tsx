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
    icon?: React.ReactNode;
    iconRight?: React.ReactNode;
    fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
    // Solid indigo — main CTA (no gradient)
    primary: `
    bg-indigo-600 hover:bg-indigo-500
    text-white glow-brand
    border border-indigo-500/20
  `,
    // Glass surface — secondary actions
    secondary: `
    glass-md text-slate-700
    hover:bg-white/80
    border-slate-200/60
  `,
    // Transparent — tertiary / nav actions
    ghost: `
    bg-transparent text-slate-500
    hover:text-slate-800 hover:bg-slate-100
    border-transparent
  `,
    // Solid red — destructive (no gradient)
    danger: `
    bg-red-600 hover:bg-red-500
    text-white border border-red-500/20
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
            whileTap={!isDisabled ? { scale: 0.97 } : undefined}
            whileHover={!isDisabled ? { scale: 1.01 } : undefined}
            transition={{ duration: 0.15 }}

            className={cn(
                'relative inline-flex items-center justify-center',
                'rounded-xl font-medium',
                'transition-all duration-200',
                'select-none outline-none',
                variantStyles[variant],
                sizeStyles[size],
                isDisabled && 'opacity-50 cursor-not-allowed',
                fullWidth && 'w-full',
                className,
            )}
            disabled={isDisabled}
            {...props}
        >
            {loading ? (
                <Loader2Icon className="w-4 h-4 animate-spin" />
            ) : (
                icon && <span className="shrink-0">{icon}</span>
            )}

            {children}

            {!loading && iconRight && (
                <span className="shrink-0">{iconRight}</span>
            )}
        </motion.button>
    );
}
