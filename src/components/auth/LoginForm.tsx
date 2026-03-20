'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { GlassButton } from '@/components/shared/GlassButton';

// ── Service layer import ───────────────────────────────
import { loginUser } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

// ── Zod schema ────────────────────────────────────────
const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
    onSuccess?: () => void;
}

/* ── Stagger animation variants ─────────────────────────── */
const containerVariants: Variants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.08, delayChildren: 0.04 },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 340, damping: 26 },
    },
};

/* ── Unique Glass Input with animated gradient border ───── */
interface GlassFieldProps {
    label: string;
    type: string;
    placeholder: string;
    error?: string;
    icon: React.ReactNode;
    iconRight?: React.ReactNode;
    onIconRightClick?: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registration: any;
}

function GlassField({
    label,
    type,
    placeholder,
    error,
    icon,
    iconRight,
    onIconRightClick,
    registration,
}: GlassFieldProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const { ref: inputRef, name: inputName } = registration;

    return (
        <div className="flex flex-col gap-1.5">
            {/* Label */}
            <motion.label
                className="text-[13px] font-medium tracking-wide flex items-center gap-1.5 select-none"
                animate={{
                    color: error
                        ? '#ef4444'
                        : isFocused
                            ? '#6366f1'
                            : '#64748b',
                }}
                transition={{ duration: 0.2 }}
            >
                {label}
            </motion.label>

            {/* Input wrapper with animated border */}
            <div className="relative group">
                {/* ── Animated gradient border (visible on focus) ── */}
                <motion.div
                    className="absolute -inset-[1.5px] rounded-2xl pointer-events-none"
                    animate={{ opacity: isFocused ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                        background:
                            'linear-gradient(135deg, #6366f1 0%, #818cf8 30%, #a78bfa 60%, #6366f1 100%)',
                        backgroundSize: '300% 300%',
                        animation: isFocused
                            ? 'login-gradient-border 3s ease infinite'
                            : 'none',
                    }}
                />

                {/* ── Static border (visible when not focused) ──── */}
                <motion.div
                    className="absolute -inset-[1.5px] rounded-2xl pointer-events-none"
                    animate={{ opacity: isFocused ? 0 : 1 }}
                    transition={{ duration: 0.3 }}
                    style={{
                        border: error
                            ? '1.5px solid rgba(239, 68, 68, 0.45)'
                            : hasValue
                                ? '1.5px solid rgba(99, 102, 241, 0.2)'
                                : '1.5px solid rgba(148, 163, 184, 0.22)',
                    }}
                />

                {/* ── Inner glass surface ───────────────────────── */}
                <div
                    className="relative rounded-2xl overflow-hidden transition-shadow duration-300"
                    style={{
                        background: isFocused
                            ? 'rgba(255, 255, 255, 0.88)'
                            : 'rgba(248, 250, 252, 0.55)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        boxShadow: isFocused
                            ? '0 4px 24px rgba(99,102,241,0.08), 0 0 0 3px rgba(99,102,241,0.05), inset 0 1px 0 rgba(255,255,255,0.9)'
                            : error
                                ? '0 0 0 3px rgba(239,68,68,0.05), inset 0 1px 0 rgba(255,255,255,0.5)'
                                : 'inset 0 1px 0 rgba(255,255,255,0.5), 0 1px 3px rgba(0,0,0,0.02)',
                    }}
                >
                    <div className="flex items-center">
                        {/* Left icon */}
                        <motion.div
                            className="pl-4 pr-1 flex items-center justify-center"
                            animate={{
                                color: error
                                    ? '#ef4444'
                                    : isFocused
                                        ? '#6366f1'
                                        : '#94a3b8',
                                scale: isFocused ? 1.08 : 1,
                            }}
                            transition={{
                                type: 'spring',
                                stiffness: 400,
                                damping: 20,
                            }}
                        >
                            {icon}
                        </motion.div>

                        {/* Actual input */}
                        <input
                            type={type}
                            placeholder={placeholder}
                            className="flex-1 bg-transparent py-3.5 px-2.5 text-sm text-slate-800 placeholder:text-slate-400/60 outline-none font-medium tracking-[-0.01em]"
                            onFocus={() => setIsFocused(true)}
                            onBlur={(e) => {
                                setIsFocused(false);
                                setHasValue(e.target.value.length > 0);
                                registration.onBlur(e);
                            }}
                            onChange={(e) => {
                                setHasValue(e.target.value.length > 0);
                                registration.onChange(e);
                            }}
                            ref={inputRef}
                            name={inputName}
                        />

                        {/* Right icon (toggle visibility) */}
                        {iconRight && (
                            <motion.button
                                type="button"
                                onClick={onIconRightClick}
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 17,
                                }}
                                className="pr-4 pl-1 flex items-center justify-center text-slate-400 hover:text-indigo-500 transition-colors outline-none"
                            >
                                {iconRight}
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>

            {/* Error message — animated reveal */}
            <motion.div
                initial={false}
                animate={{
                    height: error ? 'auto' : 0,
                    opacity: error ? 1 : 0,
                }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="overflow-hidden"
            >
                <p className="text-xs text-red-500 font-medium flex items-center gap-1.5 pt-0.5">
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        className="shrink-0"
                    >
                        <circle
                            cx="6"
                            cy="6"
                            r="5"
                            stroke="currentColor"
                            strokeWidth="1.2"
                        />
                        <path
                            d="M6 3.5v2.5M6 8h.005"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                        />
                    </svg>
                    {error}
                </p>
            </motion.div>
        </div>
    );
}

/* ── Social login button ────────────────────────────────── */
function SocialButton({
    children,
    label,
}: {
    children: React.ReactNode;
    label: string;
}) {
    return (
        <motion.button
            type="button"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className="flex-1 flex items-center justify-center gap-2.5 py-3 rounded-2xl text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors outline-none"
            style={{
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1.5px solid rgba(148, 163, 184, 0.18)',
                boxShadow:
                    'inset 0 1px 0 rgba(255,255,255,0.6), 0 1px 3px rgba(0,0,0,0.02)',
            }}
        >
            {children}
            <span>{label}</span>
        </motion.button>
    );
}

/* ═══════════════════════════════════════════════════════════
   Main LoginForm
   ═══════════════════════════════════════════════════════════ */
export function LoginForm({ onSuccess }: LoginFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);
    const { toast } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    async function onSubmit(data: LoginFormData) {
        try {
            const { user, token } = await loginUser(data);

            setAuth(user, token);

            toast({
                title: 'Welcome back!',
                description: `Good to see you again, ${user.firstName}.`,
            });

            onSuccess?.();
            router.push('/dashboard');
        } catch (error: unknown) {
            const message =
                (
                    error as {
                        response?: {
                            data?: { error?: { message?: string } };
                        };
                    }
                )?.response?.data?.error?.message ??
                'Invalid email or password.';

            toast({
                title: 'Login failed',
                description: message,
                variant: 'destructive',
            });
        }
    }

    return (
        <motion.form
            onSubmit={handleSubmit(onSubmit)}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-5"
        >
            {/* Email field */}
            <motion.div variants={itemVariants}>
                <GlassField
                    label="Email"
                    type="email"
                    placeholder="john@example.com"
                    error={errors.email?.message}
                    icon={<Mail size={18} strokeWidth={1.8} />}
                    registration={register('email')}
                />
            </motion.div>

            {/* Password field */}
            <motion.div variants={itemVariants}>
                <GlassField
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    error={errors.password?.message}
                    icon={<Lock size={18} strokeWidth={1.8} />}
                    iconRight={
                        showPassword ? (
                            <EyeOff size={16} strokeWidth={1.8} />
                        ) : (
                            <Eye size={16} strokeWidth={1.8} />
                        )
                    }
                    onIconRightClick={() => setShowPassword(!showPassword)}
                    registration={register('password')}
                />
            </motion.div>

            {/* Forgot password */}
            <motion.div variants={itemVariants} className="flex justify-end -mt-1">
                <button
                    type="button"
                    className="text-xs font-medium text-indigo-500 hover:text-indigo-700 transition-colors outline-none"
                >
                    Forgot password?
                </button>
            </motion.div>

            {/* Submit */}
            <motion.div variants={itemVariants}>
                <GlassButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={isSubmitting}
                    iconRight={
                        !isSubmitting ? (
                            <motion.span
                                animate={{ x: [0, 3, 0] }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                                className="inline-flex"
                            >
                                <ArrowRight size={16} strokeWidth={2} />
                            </motion.span>
                        ) : undefined
                    }
                >
                    Sign in
                </GlassButton>
            </motion.div>

            {/* Divider */}
            <motion.div
                variants={itemVariants}
                className="flex items-center gap-3 my-1"
            >
                <div
                    className="flex-1 h-[1px]"
                    style={{
                        background:
                            'linear-gradient(90deg, transparent, rgba(148,163,184,0.2), transparent)',
                    }}
                />
                <span className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">
                    or
                </span>
                <div
                    className="flex-1 h-[1px]"
                    style={{
                        background:
                            'linear-gradient(90deg, transparent, rgba(148,163,184,0.2), transparent)',
                    }}
                />
            </motion.div>

            {/* Social login buttons */}
            <motion.div variants={itemVariants} className="flex gap-3">
                <SocialButton label="Google">
                    <svg width="16" height="16" viewBox="0 0 18 18">
                        <path
                            d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                            fill="#4285F4"
                        />
                        <path
                            d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.26c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
                            fill="#34A853"
                        />
                        <path
                            d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                            fill="#EA4335"
                        />
                    </svg>
                </SocialButton>
                <SocialButton label="GitHub">
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="text-slate-800"
                    >
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                    </svg>
                </SocialButton>
            </motion.div>

            {/* ── Keyframe for animated gradient border ──────── */}
            <style jsx global>{`
                @keyframes login-gradient-border {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }
            `}</style>
        </motion.form>
    );
}