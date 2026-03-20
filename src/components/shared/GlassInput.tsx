'use client';

import { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    icon?: React.ReactNode; // left icon
    iconRight?: React.ReactNode; // right icon (e.g. password toggle)
    onIconRightClick?: () => void;
}

// forwardRef so react-hook-form can register this input directly
export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
    (
        {
            label,
            error,
            hint,
            icon,
            iconRight,
            onIconRightClick,
            className,
            id,
            ...props
        },
        ref,
    ) => {
        const [focused, setFocused] = useState(false);
        const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="flex flex-col gap-1.5 w-full">

                {/* Label */}
                {label && (
                    <label
                        htmlFor={inputId}
                        className="text-sm font-medium text-slate-600 select-none"
                    >
                        {label}
                    </label>
                )}

                {/* Input wrapper — handles focus ring glow */}
                <motion.div
                    animate={{
                        boxShadow: focused
                            ? '0 0 0 2px rgba(99,102,241,0.4), 0 0 16px rgba(99,102,241,0.15)'
                            : '0 0 0 0px transparent',
                    }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                        'relative flex items-center rounded-xl overflow-hidden',
                        error && 'ring-1 ring-red-500/60',
                    )}
                >
                    {/* Left icon */}
                    {icon && (
                        <span className="absolute left-3.5 text-slate-400 pointer-events-none">
                            {icon}
                        </span>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        className={cn(
                            'input-glass w-full h-11 rounded-xl px-4 text-sm',
                            'transition-colors duration-200',
                            icon && 'pl-10',
                            iconRight && 'pr-10',
                            className,
                        )}
                        {...props}
                    />

                    {/* Right icon — clickable (e.g. show/hide password) */}
                    {iconRight && (
                        <button
                            type="button"
                            tabIndex={-1}
                            onClick={onIconRightClick}
                            className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors duration-150"
                        >
                            {iconRight}
                        </button>
                    )}
                </motion.div>

                {/* Error message — animated in/out */}
                <AnimatePresence mode="wait">
                    {error && (
                        <motion.p
                            key="error"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="text-xs text-red-400 flex items-center gap-1"
                        >
                            <span>⚠</span> {error}
                        </motion.p>
                    )}
                    {!error && hint && (
                        <motion.p
                            key="hint"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs text-slate-400"
                        >
                            {hint}
                        </motion.p>
                    )}
                </AnimatePresence>

            </div>
        );
    },
);

GlassInput.displayName = 'GlassInput';