'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { GlassButton } from '@/components/shared/GlassButton';
import { CaptureMode } from './CameraCapture';
import {
    CheckCircle2,
    RotateCcw,
    ArrowRight,
    CreditCard,
    ScanFace,
    Shield,
} from 'lucide-react';

interface CapturePreviewProps {
    dataUrl: string;
    mode: CaptureMode;
    onConfirm: () => void;
    onRetake: () => void;
}

export function CapturePreview({
    dataUrl,
    mode,
    onConfirm,
    onRetake,
}: CapturePreviewProps) {
    const isId = mode === 'id';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col gap-5"
        >
            {/* ── Header ────────────────────────────────────── */}
            <div className="flex items-center gap-3">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 20,
                        delay: 0.1,
                    }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                        background:
                            'linear-gradient(135deg, rgba(5,150,105,0.1), rgba(52,211,153,0.06))',
                        border: '1px solid rgba(5,150,105,0.12)',
                    }}
                >
                    {isId ? (
                        <CreditCard
                            size={18}
                            strokeWidth={1.8}
                            className="text-emerald-600"
                        />
                    ) : (
                        <ScanFace
                            size={18}
                            strokeWidth={1.8}
                            className="text-emerald-600"
                        />
                    )}
                </motion.div>
                <div>
                    <motion.h3
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15, duration: 0.3 }}
                        className="text-slate-800 font-semibold text-[15px]"
                    >
                        {isId ? 'ID card captured' : 'Selfie captured'}
                    </motion.h3>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                        className="text-slate-400 text-xs mt-0.5"
                    >
                        {isId
                            ? 'Make sure your ID details are clearly visible'
                            : 'Make sure your face is clearly visible'}
                    </motion.p>
                </div>
            </div>

            {/* ── Preview image ──────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="relative w-full overflow-hidden rounded-2xl"
                style={{
                    aspectRatio: isId ? '16/10' : '3/4',
                    maxHeight: isId ? '280px' : '380px',
                }}
            >
                {/* Glass frame border */}
                <div
                    className="absolute inset-0 rounded-2xl z-10 pointer-events-none"
                    style={{
                        border: '2px solid rgba(52, 211, 153, 0.25)',
                        boxShadow:
                            'inset 0 0 30px rgba(0,0,0,0.15), 0 4px 20px rgba(0,0,0,0.06)',
                    }}
                />

                {/* Dark base */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'linear-gradient(135deg, #0f172a, #1e293b)',
                    }}
                />

                {/* Image with reveal animation */}
                <motion.div
                    initial={{ scale: 1.05, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        duration: 0.5,
                        delay: 0.2,
                        ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    className="absolute inset-0"
                >
                    <Image
                        src={dataUrl}
                        alt={isId ? 'ID card preview' : 'Selfie preview'}
                        fill
                        className="object-cover"
                        style={{
                            transform:
                                mode === 'selfie' ? 'scaleX(-1)' : 'none',
                        }}
                    />
                </motion.div>

                {/* Subtle vignette */}
                <div
                    className="absolute inset-0 pointer-events-none z-[5]"
                    style={{
                        background:
                            'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.35) 100%)',
                    }}
                />

                {/* ── Top-right check badge ──────────────────── */}
                <motion.div
                    initial={{ scale: 0, opacity: 0, rotate: -30 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{
                        delay: 0.4,
                        type: 'spring',
                        stiffness: 350,
                        damping: 18,
                    }}
                    className="absolute top-3 right-3 z-20"
                >
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{
                            background:
                                'linear-gradient(135deg, #059669, #34d399)',
                            boxShadow:
                                '0 4px 16px rgba(5,150,105,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                        }}
                    >
                        <CheckCircle2
                            size={18}
                            strokeWidth={2.5}
                            className="text-white"
                        />
                    </div>
                </motion.div>

                {/* ── Bottom status bar ──────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                    className="absolute bottom-3 inset-x-3 z-20"
                >
                    <div
                        className="flex items-center justify-between px-3.5 py-2 rounded-xl"
                        style={{
                            background: 'rgba(0, 0, 0, 0.6)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span className="text-[11px] text-slate-300 font-medium">
                                {isId
                                    ? 'ID document captured'
                                    : 'Selfie captured'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Shield
                                size={10}
                                strokeWidth={2}
                                className="text-indigo-400"
                            />
                            <span className="text-[10px] text-slate-500 font-medium">
                                Encrypted
                            </span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* ── Action buttons ─────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.3 }}
                className="flex gap-3"
            >
                <GlassButton
                    variant="ghost"
                    size="lg"
                    fullWidth
                    onClick={onRetake}
                    icon={<RotateCcw size={14} strokeWidth={2} />}
                >
                    Retake
                </GlassButton>
                <GlassButton
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={onConfirm}
                    iconRight={
                        <motion.span
                            animate={{ x: [0, 3, 0] }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            className="inline-flex"
                        >
                            <ArrowRight size={15} strokeWidth={2} />
                        </motion.span>
                    }
                >
                    Looks good
                </GlassButton>
            </motion.div>
        </motion.div>
    );
}