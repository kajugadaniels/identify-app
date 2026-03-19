'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { GlassButton } from '@/components/shared/GlassButton';
import { GlassInput } from '@/components/shared/GlassInput';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { ApiResponse, AuthResponse } from '@/types';

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

export function RegisterForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    async function onSubmit(data: RegisterFormData) {
        try {
            const response = await api.post<ApiResponse<AuthResponse>>(
                '/auth/register',
                {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    password: data.password,
                },
            );

            const { user, token } = response.data.data!;

            // Store user and token in zustand — also sets localStorage
            setAuth(user, token);

            toast({
                title: 'Account created!',
                description: `Welcome, ${user.firstName}. Let's verify your first identity.`,
            });

            router.push('/dashboard');
        } catch (error: unknown) {
            const message =
                (error as { response?: { data?: { error?: { message?: string } } } })
                    ?.response?.data?.error?.message ?? 'Registration failed. Please try again.';

            toast({
                title: 'Registration failed',
                description: message,
                variant: 'destructive',
            });
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
                <GlassInput
                    label="First name"
                    placeholder="John"
                    error={errors.firstName?.message}
                    {...register('firstName')}
                />
                <GlassInput
                    label="Last name"
                    placeholder="Doe"
                    error={errors.lastName?.message}
                    {...register('lastName')}
                />
            </div>

            <GlassInput
                label="Email"
                type="email"
                placeholder="john@example.com"
                error={errors.email?.message}
                {...register('email')}
            />

            <GlassInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 8 chars, uppercase, number, symbol"
                error={errors.password?.message}
                iconRight={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                onIconRightClick={() => setShowPassword(!showPassword)}
                {...register('password')}
            />

            <GlassInput
                label="Confirm password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repeat your password"
                error={errors.confirmPassword?.message}
                iconRight={
                    showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />
                }
                onIconRightClick={() => setShowConfirmPassword(!showConfirmPassword)}
                {...register('confirmPassword')}
            />

            <GlassButton
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isSubmitting}
                className="mt-2"
            >
                Create account
            </GlassButton>

            {/* Password strength hint */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xs text-white/30 text-center"
            >
                Password must contain uppercase, lowercase, number and special character
            </motion.p>

        </form>
    );
}