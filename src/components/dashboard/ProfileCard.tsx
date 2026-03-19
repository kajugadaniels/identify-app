'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { GlassButton } from '@/components/shared/GlassButton';
import { GlassInput } from '@/components/shared/GlassInput';
import { GlassCard } from '@/components/shared/GlassCard';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { ApiResponse, User } from '@/types';

const profileSchema = z.object({
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileCard() {
    const [editing, setEditing] = useState(false);
    const { user, updateUser } = useAuthStore();
    const { toast } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: user?.firstName ?? '',
            lastName: user?.lastName ?? '',
        },
    });

    async function onSubmit(data: ProfileFormData) {
        try {
            const response = await api.patch<ApiResponse<User>>(
                '/users/profile',
                data,
            );
            updateUser(response.data.data!);
            setEditing(false);
            toast({ title: 'Profile updated successfully' });
        } catch {
            toast({
                title: 'Update failed',
                description: 'Could not update your profile. Please try again.',
                variant: 'destructive',
            });
        }
    }

    function handleCancel() {
        reset();
        setEditing(false);
    }

    return (
        <GlassCard variant="md" className="p-6">

            {/* Header row */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center
                       text-white font-bold text-lg"
                        style={{
                            background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                            boxShadow: '0 0 16px rgba(99,102,241,0.4)',
                        }}
                    >
                        {user?.firstName?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <p className="text-white font-semibold">
                            {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-white/40 text-sm">{user?.email}</p>
                    </div>
                </div>

                {/* Edit toggle */}
                {!editing && (
                    <GlassButton
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditing(true)}
                    >
                        Edit
                    </GlassButton>
                )}
            </div>

            {/* Edit form — shown only when editing */}
            {editing && (
                <motion.form
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col gap-4"
                >
                    <div className="grid grid-cols-2 gap-3">
                        <GlassInput
                            label="First name"
                            error={errors.firstName?.message}
                            {...register('firstName')}
                        />
                        <GlassInput
                            label="Last name"
                            error={errors.lastName?.message}
                            {...register('lastName')}
                        />
                    </div>

                    <div className="flex gap-3">
                        <GlassButton
                            type="submit"
                            variant="primary"
                            size="sm"
                            loading={isSubmitting}
                        >
                            Save changes
                        </GlassButton>
                        <GlassButton
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleCancel}
                        >
                            Cancel
                        </GlassButton>
                    </div>
                </motion.form>
            )}

        </GlassCard>
    );
}