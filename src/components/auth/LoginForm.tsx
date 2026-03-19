'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { GlassButton } from '@/components/shared/GlassButton';
import { GlassInput } from '@/components/shared/GlassInput';
import { useAuthStore } from '@/store/auth.store';

// ── Service layer import ───────────────────────────────
import { loginUser } from '@/services/auth.service';

// ── Zod schema ────────────────────────────────────────
const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
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

            router.push('/dashboard');

        } catch (error: unknown) {
            const message =
                (
                    error as {
                        response?: { data?: { error?: { message?: string } } };
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
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

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
                placeholder="Your password"
                error={errors.password?.message}
                iconRight={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                onIconRightClick={() => setShowPassword(!showPassword)}
                {...register('password')}
            />

            <GlassButton
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isSubmitting}
                className="mt-2"
            >
                Sign in
            </GlassButton>

        </form>
    );
}