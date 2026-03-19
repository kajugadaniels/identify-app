'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

// Variant controls the glass intensity
type GlassVariant = 'sm' | 'md' | 'lg';

interface GlassCardProps extends HTMLMotionProps<'div'> {
    variant?: GlassVariant;
    hover?: boolean;    // enables subtle lift on hover
    children: React.ReactNode;
    className?: string;
}

const variants: Record<GlassVariant, string> = {
    sm: 'glass',
    md: 'glass-md',
    lg: 'glass-lg',
};

export function GlassCard({
    variant = 'md',
    hover = false,
    children,
    className,
    ...props
}: GlassCardProps) {
    return (
        <motion.div
            // Entrance animation — every card fades up when it mounts
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}

            // Optional hover lift effect
            whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}

            className={cn(
                variants[variant],
                'rounded-2xl',
                hover && 'cursor-pointer transition-shadow duration-300 hover:shadow-indigo-500/10',
                className,
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
}