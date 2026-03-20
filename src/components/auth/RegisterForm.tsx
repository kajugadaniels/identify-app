'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    User,
    ArrowRight,
    Check,
    X,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { GlassButton } from '@/components/shared/GlassButton';

// ── Service layer import — no direct api calls in components ──
import { registerUser } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

// ── Zod validation schema ─────────────────────────────
const registerSchema = z
    .object({
        firstName: z
            .string()
            .min(2, 'First name must be at least 2 characters')
            .max(50),
        lastName: z
            .string()
            .min(2, 'Last name must be at least 2 characters')
            .max(50),
        email: z.string().email('Please enter a valid email address'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                'Must include uppercase, lowercase, number and special character',
            ),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
    onSuccess?: () => void;
}

/* ── Stagger animation variants ─────────────────────────── */
const containerVariants: Variants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.07, delayChildren: 0.03 },
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

/* ── GlassField — unique input with animated gradient border ─ */
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
                className="text-[13px] font-medium tracking-wide select-none"
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

            {/* Input wrapper */}
            <div className="relative group">
                {/* Animated gradient border (focus) */}
                <motion.div
                    className="absolute -inset-[1.5px] rounded-2xl pointer-events-none"
                    animate={{ opacity: isFocused ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                        background:
                            'linear-gradient(135deg, #6366f1 0%, #818cf8 30%, #a78bfa 60%, #6366f1 100%)',
                        backgroundSize: '300% 300%',
                        animation: isFocused
                            ? 'register-gradient-border 3s ease infinite'
                            : 'none',
                    }}
                />

                {/* Static border (unfocused) */}
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

                {/* Inner glass surface */}
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
                            className="pl-3.5 pr-1 flex items-center justify-center"
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

                        {/* Input */}
                        <input
                            type={type}
                            placeholder={placeholder}
                            className="flex-1 bg-transparent py-3.5 px-2 text-sm text-slate-800 placeholder:text-slate-400/60 outline-none font-medium tracking-[-0.01em] min-w-0"
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

                        {/* Right icon */}
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
                                className="pr-3.5 pl-1 flex items-center justify-center text-slate-400 hover:text-indigo-500 transition-colors outline-none"
                            >
                                {iconRight}
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>

            {/* Error message */}
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

/* ── Password strength meter ────────────────────────────── */
function PasswordStrength({ password }: { password: string }) {
    const checks = useMemo(() => {
        return [
            { label: '8+ characters', met: password.length >= 8 },
            { label: 'Uppercase', met: /[A-Z]/.test(password) },
            { label: 'Lowercase', met: /[a-z]/.test(password) },
            { label: 'Number', met: /\d/.test(password) },
            { label: 'Special char', met: /[@$!%*?&]/.test(password) },
        ];
    }, [password]);

    const metCount = checks.filter((c) => c.met).length;

    const strengthColor =
        metCount <= 1
            ? '#ef4444'
            : metCount <= 3
                ? '#f59e0b'
                : metCount <= 4
                    ? '#6366f1'
                    : '#10b981';

    const strengthLabel =
        metCount <= 1
            ? 'Weak'
            : metCount <= 3
                ? 'Fair'
                : metCount <= 4
                    ? 'Good'
                    : 'Strong';

    if (!password) return null;

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
        >
            <div
                className="rounded-xl p-3.5"
                style={{
                    background: 'rgba(248, 250, 252, 0.5)',
                    border: '1px solid rgba(148, 163, 184, 0.12)',
                }}
            >
                {/* Strength bar */}
                <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                        Strength
                    </span>
                    <motion.span
                        className="text-[11px] font-bold uppercase tracking-wider"
                        animate={{ color: strengthColor }}
                        transition={{ duration: 0.3 }}
                    >
                        {strengthLabel}
                    </motion.span>
                </div>
                <div className="flex gap-1.5 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="h-[3px] flex-1 rounded-full"
                            initial={{ scaleX: 0 }}
                            animate={{
                                scaleX: 1,
                                backgroundColor:
                                    i < metCount
                                        ? strengthColor
                                        : 'rgba(148, 163, 184, 0.15)',
                            }}
                            transition={{
                                duration: 0.3,
                                delay: i * 0.05,
                                ease: 'easeOut',
                            }}
                            style={{ transformOrigin: 'left' }}
                        />
                    ))}
                </div>

                {/* Checklist */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                    {checks.map((check) => (
                        <motion.div
                            key={check.label}
                            className="flex items-center gap-1.5"
                            animate={{ opacity: check.met ? 1 : 0.5 }}
                            transition={{ duration: 0.2 }}
                        >
                            <motion.div
                                className="w-3.5 h-3.5 rounded-full flex items-center justify-center"
                                animate={{
                                    backgroundColor: check.met
                                        ? 'rgba(16, 185, 129, 0.12)'
                                        : 'rgba(148, 163, 184, 0.1)',
                                    scale: check.met ? [1, 1.2, 1] : 1,
                                }}
                                transition={{ duration: 0.25 }}
                            >
                                {check.met ? (
                                    <Check
                                        size={9}
                                        strokeWidth={3}
                                        className="text-emerald-600"
                                    />
                                ) : (
                                    <X
                                        size={8}
                                        strokeWidth={2.5}
                                        className="text-slate-400"
                                    />
                                )}
                            </motion.div>
                            <span
                                className={`text-[11px] font-medium ${
                                    check.met
                                        ? 'text-slate-600'
                                        : 'text-slate-400'
                                }`}
                            >
                                {check.label}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════
   Main RegisterForm
   ═══════════════════════════════════════════════════════════ */
export function RegisterForm({ onSuccess }: RegisterFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [livePassword, setLivePassword] = useState('');

    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);
    const { toast } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    /* Wrap password registration to track live value */
    const passwordRegistration = register('password');
    const wrappedPasswordRegistration = {
        ...passwordRegistration,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            setLivePassword(e.target.value);
            return passwordRegistration.onChange(e);
        },
    };

    async function onSubmit(data: RegisterFormData) {
        try {
            const { user, token } = await registerUser({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: data.password,
            });

            setAuth(user, token);

            toast({
                title: 'Account created!',
                description: `Welcome, ${user.firstName}.`,
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
                'Registration failed. Please try again.';

            toast({
                title: 'Registration failed',
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
            className="flex flex-col gap-4"
        >
            {/* Name row */}
            <motion.div
                variants={itemVariants}
                className="grid grid-cols-2 gap-3"
            >
                <GlassField
                    label="First name"
                    type="text"
                    placeholder="John"
                    error={errors.firstName?.message}
                    icon={<User size={17} strokeWidth={1.8} />}
                    registration={register('firstName')}
                />
                <GlassField
                    label="Last name"
                    type="text"
                    placeholder="Doe"
                    error={errors.lastName?.message}
                    icon={<User size={17} strokeWidth={1.8} />}
                    registration={register('lastName')}
                />
            </motion.div>

            {/* Email */}
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

            {/* Password */}
            <motion.div variants={itemVariants}>
                <GlassField
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 8 chars, mixed case, number, symbol"
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
                    registration={wrappedPasswordRegistration}
                />
            </motion.div>

            {/* Password strength meter */}
            <motion.div variants={itemVariants}>
                <PasswordStrength password={livePassword} />
            </motion.div>

            {/* Confirm password */}
            <motion.div variants={itemVariants}>
                <GlassField
                    label="Confirm password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    error={errors.confirmPassword?.message}
                    icon={<Lock size={18} strokeWidth={1.8} />}
                    iconRight={
                        showConfirmPassword ? (
                            <EyeOff size={16} strokeWidth={1.8} />
                        ) : (
                            <Eye size={16} strokeWidth={1.8} />
                        )
                    }
                    onIconRightClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                    }
                    registration={register('confirmPassword')}
                />
            </motion.div>

            {/* Terms notice */}
            <motion.div variants={itemVariants}>
                <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                    By creating an account you agree to our{' '}
                    <span className="text-indigo-500 hover:text-indigo-700 cursor-pointer transition-colors font-medium">
                        Terms of Service
                    </span>{' '}
                    and{' '}
                    <span className="text-indigo-500 hover:text-indigo-700 cursor-pointer transition-colors font-medium">
                        Privacy Policy
                    </span>
                </p>
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
                    Create account
                </GlassButton>
            </motion.div>

            {/* ── Keyframe for animated gradient border ──────── */}
            <style jsx global>{`
                @keyframes register-gradient-border {
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