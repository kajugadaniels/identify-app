// src/components/verification/CameraCapture.tsx

'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCamera, CameraFacing } from '@/hooks/useCamera';
import { GlassButton } from '@/components/shared/GlassButton';

export type CaptureMode = 'id' | 'selfie';

interface CameraCaptureProps {
    mode: CaptureMode;
    onCapture: (dataUrl: string) => void;
    onError?: (message: string) => void;
}

// ── Config per mode ────────────────────────────────────
const MODE_CONFIG = {
    id: {
        facing: 'environment' as CameraFacing,
        title: 'Show your ID card',
        instruction: 'Hold your ID card inside the frame. Keep it flat and steady.',
        guideShape: 'rect',   // rectangular overlay for ID cards
    },
    selfie: {
        facing: 'user' as CameraFacing,
        title: 'Take your selfie',
        instruction: 'Centre your face inside the oval. Look directly at the camera.',
        guideShape: 'oval',   // oval overlay for face
    },
} as const;

export function CameraCapture({ mode, onCapture, onError }: CameraCaptureProps) {
    const config = MODE_CONFIG[mode];
    const startedRef = useRef(false);

    const {
        videoRef,
        canvasRef,
        isReady,
        error,
        quality,
        capturedImage,
        startCamera,
        capture,
        reset,
    } = useCamera();

    // Start camera once on mount
    useEffect(() => {
        if (startedRef.current) return;
        startedRef.current = true;
        startCamera(config.facing);
    }, [config.facing, startCamera]);

    // Propagate errors to parent
    useEffect(() => {
        if (error && onError) onError(error);
    }, [error, onError]);

    function handleCapture() {
        const dataUrl = capture();
        if (dataUrl) onCapture(dataUrl);
    }

    return (
        <div className="flex flex-col gap-4">

            {/* Title + instruction */}
            <div className="text-center">
                <h3 className="text-white font-semibold text-lg mb-1">
                    {config.title}
                </h3>
                <p className="text-white/45 text-sm">{config.instruction}</p>
            </div>

            {/* Camera viewport */}
            <div
                className="relative w-full overflow-hidden rounded-2xl"
                style={{
                    background: 'rgba(0,0,0,0.6)',
                    aspectRatio: mode === 'id' ? '16/10' : '3/4',
                    maxHeight: mode === 'id' ? '280px' : '380px',
                }}
            >
                {/* Video feed */}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                        // Mirror selfie camera so it feels natural
                        transform: mode === 'selfie' ? 'scaleX(-1)' : 'none',
                    }}
                />

                {/* Hidden canvas for quality analysis + capture */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Loading overlay — shown while camera is starting */}
                <AnimatePresence>
                    {!isReady && !error && (
                        <motion.div
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                            style={{ background: 'rgba(0,0,0,0.7)' }}
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="w-10 h-10 rounded-full border-2 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent"
                            />
                            <p className="text-white/60 text-sm">Starting camera…</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error overlay */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center"
                            style={{ background: 'rgba(0,0,0,0.85)' }}
                        >
                            <span className="text-4xl">📷</span>
                            <p className="text-white/80 text-sm font-medium">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Guide overlay — shown when camera is ready */}
                <AnimatePresence>
                    {isReady && !error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 pointer-events-none"
                        >
                            {/* Dark corners — creates the "frame" effect */}
                            <div
                                className="absolute inset-0"
                                style={{
                                    background: `radial-gradient(
                    ${mode === 'id'
                                            ? 'ellipse 75% 65%'
                                            : 'ellipse 55% 65%'
                                        } at 50% 50%,
                    transparent 0%,
                    rgba(0,0,0,0.55) 100%
                  )`,
                                }}
                            />

                            {/* Guide shape — rect for ID, oval for selfie */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                {config.guideShape === 'rect' ? (
                                    // ID card guide rectangle
                                    <div
                                        className="border-2 rounded-xl"
                                        style={{
                                            width: '80%',
                                            height: '70%',
                                            borderColor: quality.isGood
                                                ? 'rgba(52,211,153,0.9)'
                                                : 'rgba(255,255,255,0.5)',
                                            boxShadow: quality.isGood
                                                ? '0 0 0 1px rgba(52,211,153,0.3), 0 0 20px rgba(52,211,153,0.2)'
                                                : 'none',
                                            transition: 'border-color 0.3s, box-shadow 0.3s',
                                        }}
                                    >
                                        {/* Corner markers */}
                                        {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
                                            <CornerMarker
                                                key={corner}
                                                corner={corner}
                                                isGood={quality.isGood}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    // Selfie oval guide
                                    <div
                                        className="border-2 rounded-full"
                                        style={{
                                            width: '65%',
                                            height: '80%',
                                            borderColor: quality.isGood
                                                ? 'rgba(52,211,153,0.9)'
                                                : 'rgba(255,255,255,0.5)',
                                            boxShadow: quality.isGood
                                                ? '0 0 0 1px rgba(52,211,153,0.3), 0 0 20px rgba(52,211,153,0.2)'
                                                : 'none',
                                            transition: 'border-color 0.3s, box-shadow 0.3s',
                                        }}
                                    />
                                )}
                            </div>

                            {/* Quality hint banner */}
                            <AnimatePresence>
                                {quality.hint && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        className="absolute top-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium"
                                        style={{
                                            background: 'rgba(0,0,0,0.7)',
                                            border: '1px solid rgba(255,255,255,0.12)',
                                            color: '#fbbf24',
                                        }}
                                    >
                                        ⚠ {quality.hint}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Good quality indicator */}
                            <AnimatePresence>
                                {quality.isGood && !quality.hint && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute top-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium"
                                        style={{
                                            background: 'rgba(5,150,105,0.3)',
                                            border: '1px solid rgba(52,211,153,0.4)',
                                            color: '#34d399',
                                        }}
                                    >
                                        ✓ Good quality
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Capture button */}
            {isReady && !error && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col items-center gap-3"
                >
                    {/* Main capture button */}
                    <button
                        onClick={handleCapture}
                        className="relative w-16 h-16 rounded-full transition-all duration-200 active:scale-95"
                        style={{
                            background: quality.isGood
                                ? 'linear-gradient(135deg, #6366f1, #a78bfa)'
                                : 'rgba(255,255,255,0.15)',
                            boxShadow: quality.isGood
                                ? '0 0 0 4px rgba(99,102,241,0.2), 0 0 24px rgba(99,102,241,0.4)'
                                : '0 0 0 4px rgba(255,255,255,0.08)',
                            border: '3px solid rgba(255,255,255,0.9)',
                            transition: 'all 0.3s',
                        }}
                        aria-label="Capture photo"
                    >
                        {/* Inner circle */}
                        <div
                            className="absolute inset-2 rounded-full"
                            style={{
                                background: quality.isGood
                                    ? 'rgba(255,255,255,0.3)'
                                    : 'rgba(255,255,255,0.2)',
                            }}
                        />
                    </button>

                    <p className="text-white/35 text-xs">
                        {quality.isGood
                            ? 'Tap to capture'
                            : 'Adjust position then tap to capture'}
                    </p>
                </motion.div>
            )}

        </div>
    );
}

// ── Corner marker sub-component ────────────────────────
type Corner = 'tl' | 'tr' | 'bl' | 'br';

function CornerMarker({
    corner,
    isGood,
}: {
    corner: Corner;
    isGood: boolean;
}) {
    const positions: Record<Corner, React.CSSProperties> = {
        tl: { top: -2, left: -2 },
        tr: { top: -2, right: -2 },
        bl: { bottom: -2, left: -2 },
        br: { bottom: -2, right: -2 },
    };

    const borders: Record<Corner, React.CSSProperties> = {
        tl: { borderTop: '3px solid', borderLeft: '3px solid', borderRadius: '4px 0 0 0' },
        tr: { borderTop: '3px solid', borderRight: '3px solid', borderRadius: '0 4px 0 0' },
        bl: { borderBottom: '3px solid', borderLeft: '3px solid', borderRadius: '0 0 0 4px' },
        br: { borderBottom: '3px solid', borderRight: '3px solid', borderRadius: '0 0 4px 0' },
    };

    return (
        <div
            style={{
                position: 'absolute',
                width: '20px',
                height: '20px',
                borderColor: isGood ? 'rgba(52,211,153,0.9)' : 'rgba(255,255,255,0.7)',
                transition: 'border-color 0.3s',
                ...positions[corner],
                ...borders[corner],
            }}
        />
    );
}