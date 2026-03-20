'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { GlassButton } from '@/components/shared/GlassButton';
import { GlassCard } from '@/components/shared/GlassCard';
import { User, Mail, Pencil, Check, X } from 'lucide-react';

// ── Service layer import ───────────────────────────────
import { updateProfile } from '@/services/user.service';
import { useAuthStore } from '@/store/auth.store';

const profileSchema = z.object({
    firstName: z.string().min(2, 'At least 2 characters').max(50),
    lastName: z.string().min(2, 'At least 2 characters').max(50),
});

type ProfileFormData = z.infer<typeof profileSchema>;

/* ── Inline glass field for edit mode ───────────────────── */
interface InlineFieldProps {
    label: string;
    error?: string;
    icon: React.ReactNode;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registration: any;
}

function InlineField({ label, error, icon, registration }: InlineFieldProps) {
    const [isFocused, setIsFocused] = useState(false);
    const { ref: inputRef, name: inputName, onChange: inputOnChange, onBlur: inputOnBlur } = registration;

    return (
        <div className="flex flex-col gap-1.5">
            <label
                className="text-[12px] font-semibold uppercase tracking-wider"
                style={{
                    color: error ? '#ef4444' : isFocused ? '#6366f1' : '#94a3b8',
                    transition: 'color 0.2s',
                }}
            >
                {label}
            </label>
            <div className="relative">
                {/* Gradient border on focus */}
                <motion.div
                    className="absolute -inset-[1.5px] rounded-xl pointer-events-none"
                    animate={{ opacity: isFocused ? 1 : 0 }}
                    transition={{ duration: 0.25 }}
                    style={{
                        background:
                            'linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #a78bfa 100%)',
                        backgroundSize: '200% 200%',
                        animation: isFocused
                            ? 'profile-field-glow 3s ease infinite'
                            : 'none',
                    }}
                />
                {/* Static border */}
                <motion.div
                    className="absolute -inset-[1.5px] rounded-xl pointer-events-none"
                    animate={{ opacity: isFocused ? 0 : 1 }}
                    transition={{ duration: 0.25 }}
                    style={{
                        border: error
                            ? '1.5px solid rgba(239,68,68,0.4)'
                            : '1.5px solid rgba(148,163,184,0.2)',
                    }}
                />
                <div
                    className="relative rounded-xl overflow-hidden"
                    style={{
                        background: isFocused
                            ? 'rgba(255,255,255,0.85)'
                            : 'rgba(248,250,252,0.5)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        boxShadow: isFocused
                            ? '0 4px 20px rgba(99,102,241,0.06), inset 0 1px 0 rgba(255,255,255,0.9)'
                            : 'inset 0 1px 0 rgba(255,255,255,0.5)',
                        transition: 'background 0.25s, box-shadow 0.25s',
                    }}
                >
                    <div className="flex items-center">
                        <motion.div
                            className="pl-3 pr-1 flex items-center"
                            animate={{
                                color: error
                                    ? '#ef4444'
                                    : isFocused
                                        ? '#6366f1'
                                        : '#94a3b8',
                                scale: isFocused ? 1.05 : 1,
                            }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        >
                            {icon}
                        </motion.div>
                        <input
                            type="text"
                            className="flex-1 bg-transparent py-3 px-2 text-sm text-slate-800 placeholder:text-slate-400/60 outline-none font-medium min-w-0"
                            onFocus={() => setIsFocused(true)}
                            onBlur={(e) => {
                                setIsFocused(false);
                                inputOnBlur(e);
                            }}
                            onChange={inputOnChange}
                            ref={inputRef}
                            name={inputName}
                        />
                    </div>
                </div>
            </div>
            {/* Error */}
            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-red-500 font-medium flex items-center gap-1 overflow-hidden"
                    >
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" className="shrink-0">
                            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
                            <path d="M6 3.5v2.5M6 8h.005" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ── Info row for display mode ──────────────────────────── */
function InfoRow({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{
                    background: 'rgba(99,102,241,0.06)',
                    border: '1px solid rgba(99,102,241,0.08)',
                }}
            >
                <span className="text-indigo-500">{icon}</span>
            </div>
            <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                    {label}
                </p>
                <p className="text-sm font-medium text-slate-700 truncate">
                    {value}
                </p>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   ProfileCard
   ═══════════════════════════════════════════════════════════ */
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
            const updatedUser = await updateProfile(data);
            updateUser(updatedUser);
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
        reset({
            firstName: user?.firstName ?? '',
            lastName: user?.lastName ?? '',
        });
        setEditing(false);
    }

    const initials =
        (user?.firstName?.[0] ?? '').toUpperCase() +
        (user?.lastName?.[0] ?? '').toUpperCase();

    return (
        <GlassCard variant="md" className="overflow-hidden">
            {/* ── Top accent gradient bar ───────────────────── */}
            <div
                className="h-1 w-full"
                style={{
                    background:
                        'linear-gradient(90deg, #6366f1 0%, #818cf8 40%, #a78bfa 70%, #c4b5fd 100%)',
                }}
            />

            <div className="p-6 sm:p-7">
                {/* ── Header: Avatar + Info + Edit button ────── */}
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                            className="relative"
                        >
                            {/* Outer ring */}
                            <div
                                className="w-[60px] h-[60px] rounded-2xl p-[2px]"
                                style={{
                                    background:
                                        'linear-gradient(135deg, #6366f1, #818cf8, #a78bfa)',
                                }}
                            >
                                <div
                                    className="w-full h-full rounded-[14px] flex items-center justify-center text-white font-bold text-lg"
                                    style={{
                                        background:
                                            'linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #a78bfa 100%)',
                                        boxShadow:
                                            'inset 0 1px 0 rgba(255,255,255,0.2)',
                                    }}
                                >
                                    {initials}
                                </div>
                            </div>
                            {/* Online indicator */}
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white bg-emerald-500"
                                style={{ boxShadow: '0 0 8px rgba(52,211,153,0.4)' }}
                            />
                        </motion.div>

                        <div>
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                                {user?.firstName} {user?.lastName}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <Mail size={12} strokeWidth={2} className="text-slate-400" />
                                <p className="text-sm text-slate-500">{user?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Edit / Cancel toggle */}
                    <AnimatePresence mode="wait">
                        {!editing ? (
                            <motion.div
                                key="edit-btn"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.15 }}
                            >
                                <GlassButton
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditing(true)}
                                    icon={<Pencil size={13} strokeWidth={2} />}
                                >
                                    Edit
                                </GlassButton>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="cancel-btn"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.15 }}
                            >
                                <GlassButton
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCancel}
                                    icon={<X size={14} strokeWidth={2} />}
                                >
                                    Cancel
                                </GlassButton>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── Display mode: info rows ───────────────── */}
                <AnimatePresence mode="wait">
                    {!editing ? (
                        <motion.div
                            key="display"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                        >
                            <div
                                className="rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4"
                                style={{
                                    background: 'rgba(248, 250, 252, 0.5)',
                                    border: '1px solid rgba(148, 163, 184, 0.1)',
                                }}
                            >
                                <InfoRow
                                    icon={<User size={15} strokeWidth={1.8} />}
                                    label="First Name"
                                    value={user?.firstName ?? '—'}
                                />
                                <InfoRow
                                    icon={<User size={15} strokeWidth={1.8} />}
                                    label="Last Name"
                                    value={user?.lastName ?? '—'}
                                />
                                <InfoRow
                                    icon={<Mail size={15} strokeWidth={1.8} />}
                                    label="Email"
                                    value={user?.email ?? '—'}
                                />
                            </div>

                            {/* Member since badge */}
                            <div className="mt-4 flex items-center gap-2">
                                <div
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{
                                        background:
                                            'linear-gradient(135deg, #6366f1, #a78bfa)',
                                    }}
                                />
                                <span className="text-[11px] text-slate-400 font-medium">
                                    Member since{' '}
                                    {user?.createdAt
                                        ? new Date(user.createdAt).toLocaleDateString(
                                              'en-US',
                                              {
                                                  month: 'long',
                                                  year: 'numeric',
                                              },
                                          )
                                        : 'recently'}
                                </span>
                            </div>
                        </motion.div>
                    ) : (
                        /* ── Edit mode: form ────────────────────── */
                        <motion.form
                            key="edit-form"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            onSubmit={handleSubmit(onSubmit)}
                            className="flex flex-col gap-5"
                        >
                            <div
                                className="rounded-xl p-4"
                                style={{
                                    background: 'rgba(248, 250, 252, 0.4)',
                                    border: '1px solid rgba(148, 163, 184, 0.1)',
                                }}
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InlineField
                                        label="First Name"
                                        error={errors.firstName?.message}
                                        icon={
                                            <User
                                                size={15}
                                                strokeWidth={1.8}
                                            />
                                        }
                                        registration={register('firstName')}
                                    />
                                    <InlineField
                                        label="Last Name"
                                        error={errors.lastName?.message}
                                        icon={
                                            <User
                                                size={15}
                                                strokeWidth={1.8}
                                            />
                                        }
                                        registration={register('lastName')}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <GlassButton
                                    type="submit"
                                    variant="primary"
                                    size="sm"
                                    loading={isSubmitting}
                                    icon={
                                        !isSubmitting ? (
                                            <Check
                                                size={14}
                                                strokeWidth={2.5}
                                            />
                                        ) : undefined
                                    }
                                >
                                    Save changes
                                </GlassButton>
                                <GlassButton
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCancel}
                                >
                                    Discard
                                </GlassButton>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Keyframe for field glow ───────────────────── */}
            <style jsx global>{`
                @keyframes profile-field-glow {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
        </GlassCard>
    );
}