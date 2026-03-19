'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { GlassButton } from '@/components/shared/GlassButton';
import { CaptureMode } from './CameraCapture';

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
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex flex-col gap-5"
        >
            {/* Header */}
            <div className="text-center">
                <h3 className="text-white font-semibold text-lg mb-1">
                    {isId ? 'ID card captured' : 'Selfie captured'}
                </h3>
                <p className="text-white/45 text-sm">
                    {isId
                        ? 'Make sure your ID details are clearly visible'
                        : 'Make sure your face is clearly visible'}
                </p>
            </div>

            {/* Preview image */}
            <div
                className="relative w-full overflow-hidden rounded-2xl border border-white/10"
                style={{
                    aspectRatio: isId ? '16/10' : '3/4',
                    maxHeight: isId ? '280px' : '380px',
                    background: 'rgba(0,0,0,0.4)',
                }}
            >
                <Image
                    src={dataUrl}
                    alt={isId ? 'ID card preview' : 'Selfie preview'}
                    fill
                    className="object-cover"
                    // Mirror selfie preview to match camera orientation
                    style={{ transform: mode === 'selfie' ? 'scaleX(-1)' : 'none' }}
                />

                {/* Subtle vignette */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background:
                            'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 60%, rgba(0,0,0,0.3) 100%)',
                    }}
                />

                {/* Check badge */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{
                        background: 'linear-gradient(135deg, #059669, #34d399)',
                        boxShadow: '0 0 12px rgba(52,211,153,0.5)',
                    }}
                >
                    ✓
                </motion.div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
                <GlassButton
                    variant="ghost"
                    size="lg"
                    fullWidth
                    onClick={onRetake}
                >
                    Retake
                </GlassButton>
                <GlassButton
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={onConfirm}
                >
                    Looks good
                </GlassButton>
            </div>

        </motion.div>
    );
}