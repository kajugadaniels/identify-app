'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCamera, CameraFacing } from '@/hooks/useCamera';
import { Camera, AlertCircle, CheckCircle2, Shield } from 'lucide-react';

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
        instruction:
            'Hold your ID card inside the frame. Keep it flat and steady.',
        guideShape: 'rect',
    },
    selfie: {
        facing: 'user' as CameraFacing,
        title: 'Take your selfie',
        instruction:
            'Centre your face inside the oval. Look directly at the camera.',
        guideShape: 'oval',
    },
} as const;

/* ── Scanning line animation ────────────────────────────── */
function ScanLine({ mode }: { mode: CaptureMode }) {
    return (
        <motion.div
            className="absolute left-[10%] right-[10%] h-[2px] pointer-events-none z-20"
            style={{
                background:
                    'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.6) 30%, rgba(129,140,248,0.8) 50%, rgba(99,102,241,0.6) 70%, transparent 100%)',
                boxShadow: '0 0 12px rgba(99,102,241,0.4)',
                borderRadius: '2px',
            }}
            animate={{
                top: ['15%', '85%', '15%'],
            }}
            transition={{
                duration: mode === 'id' ? 3 : 3.5,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
        />
    );
}

/* ── Animated corner marker ─────────────────────────────── */
type Corner = 'tl' | 'tr' | 'bl' | 'br';

function CornerMarker({
    corner,
    isGood,
    delay,
}: {
    corner: Corner;
    isGood: boolean;
    delay: number;
}) {
    const positions: Record<Corner, React.CSSProperties> = {
        tl: { top: -1, left: -1 },
        tr: { top: -1, right: -1 },
        bl: { bottom: -1, left: -1 },
        br: { bottom: -1, right: -1 },
    };

    const color = isGood ? '#34d399' : 'rgba(255,255,255,0.7)';

    const borderStyles: Record<Corner, React.CSSProperties> = {
        tl: {
            borderTop: `3px solid ${color}`,
            borderLeft: `3px solid ${color}`,
            borderRadius: '6px 0 0 0',
        },
        tr: {
            borderTop: `3px solid ${color}`,
            borderRight: `3px solid ${color}`,
            borderRadius: '0 6px 0 0',
        },
        bl: {
            borderBottom: `3px solid ${color}`,
            borderLeft: `3px solid ${color}`,
            borderRadius: '0 0 0 6px',
        },
        br: {
            borderBottom: `3px solid ${color}`,
            borderRight: `3px solid ${color}`,
            borderRadius: '0 0 6px 0',
        },
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                type: 'spring',
                stiffness: 400,
                damping: 20,
                delay,
            }}
            style={{
                position: 'absolute',
                width: '24px',
                height: '24px',
                transition: 'border-color 0.3s',
                ...positions[corner],
                ...borderStyles[corner],
                ...(isGood
                    ? { filter: 'drop-shadow(0 0 4px rgba(52,211,153,0.4))' }
                    : {}),
            }}
        />
    );
}

/* ── Capture button (shutter) ───────────────────────────── */
function ShutterButton({
    isGood,
    onClick,
}: {
    isGood: boolean;
    onClick: () => void;
}) {
    return (
        <motion.button
            onClick={onClick}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className="relative w-[68px] h-[68px] rounded-full outline-none"
            aria-label="Capture photo"
            style={{
                background: 'transparent',
                border: '3.5px solid rgba(255,255,255,0.85)',
                boxShadow: isGood
                    ? '0 0 0 5px rgba(99,102,241,0.15), 0 0 28px rgba(99,102,241,0.3)'
                    : '0 0 0 5px rgba(255,255,255,0.06)',
                transition: 'box-shadow 0.4s',
            }}
        >
            {/* Pulsing ring when quality is good */}
            {isGood && (
                <motion.div
                    className="absolute -inset-[5px] rounded-full pointer-events-none"
                    animate={{
                        boxShadow: [
                            '0 0 0px rgba(99,102,241,0.2)',
                            '0 0 16px rgba(99,102,241,0.35)',
                            '0 0 0px rgba(99,102,241,0.2)',
                        ],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            )}

            {/* Inner filled circle */}
            <motion.div
                className="absolute inset-[5px] rounded-full"
                animate={{
                    background: isGood
                        ? 'linear-gradient(135deg, #6366f1, #818cf8, #a78bfa)'
                        : 'rgba(255,255,255,0.15)',
                }}
                transition={{ duration: 0.4 }}
                style={{
                    boxShadow: isGood
                        ? 'inset 0 1px 0 rgba(255,255,255,0.3)'
                        : 'none',
                }}
            />

            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
                <Camera
                    size={20}
                    strokeWidth={2}
                    className="text-white"
                    style={{
                        filter: isGood
                            ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                            : 'none',
                    }}
                />
            </div>
        </motion.button>
    );
}

/* ── Quality hint pill ──────────────────────────────────── */
function QualityPill({
    type,
    message,
}: {
    type: 'warning' | 'good';
    message: string;
}) {
    const isGood = type === 'good';

    return (
        <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap"
        >
            <div
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-semibold"
                style={{
                    background: isGood
                        ? 'rgba(5, 150, 105, 0.85)'
                        : 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: isGood
                        ? '1px solid rgba(52, 211, 153, 0.4)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                    color: isGood ? '#ffffff' : '#fbbf24',
                }}
            >
                {isGood ? (
                    <CheckCircle2 size={12} strokeWidth={2.5} />
                ) : (
                    <AlertCircle size={12} strokeWidth={2.5} />
                )}
                {message}
            </div>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════
   CameraCapture
   ═══════════════════════════════════════════════════════════ */
export function CameraCapture({
    mode,
    onCapture,
    onError,
}: CameraCaptureProps) {
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
        <div className="flex flex-col gap-5">
            {/* ── Camera viewport ───────────────────────────── */}
            <div
                className="relative w-full overflow-hidden rounded-2xl"
                style={{
                    aspectRatio: mode === 'id' ? '16/10' : '3/4',
                    maxHeight: mode === 'id' ? '280px' : '380px',
                }}
            >
                {/* Dark base */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    }}
                />

                {/* Video feed */}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                        transform:
                            mode === 'selfie' ? 'scaleX(-1)' : 'none',
                    }}
                />

                {/* Hidden canvas */}
                <canvas ref={canvasRef} className="hidden" />

                {/* ── Loading overlay ───────────────────────── */}
                <AnimatePresence>
                    {!isReady && !error && (
                        <motion.div
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4"
                            style={{
                                background:
                                    'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.9))',
                                backdropFilter: 'blur(8px)',
                                WebkitBackdropFilter: 'blur(8px)',
                            }}
                        >
                            {/* Spinner */}
                            <div className="relative w-14 h-14">
                                <svg
                                    className="absolute inset-0 w-full h-full"
                                    viewBox="0 0 56 56"
                                >
                                    <circle
                                        cx="28"
                                        cy="28"
                                        r="24"
                                        fill="none"
                                        stroke="rgba(148,163,184,0.15)"
                                        strokeWidth="2.5"
                                    />
                                </svg>
                                <motion.svg
                                    className="absolute inset-0 w-full h-full"
                                    viewBox="0 0 56 56"
                                    animate={{ rotate: 360 }}
                                    transition={{
                                        duration: 1.2,
                                        repeat: Infinity,
                                        ease: 'linear',
                                    }}
                                >
                                    <defs>
                                        <linearGradient
                                            id="cam-load-grad"
                                            x1="0%"
                                            y1="0%"
                                            x2="100%"
                                            y2="0%"
                                        >
                                            <stop
                                                offset="0%"
                                                stopColor="#6366f1"
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor="#a78bfa"
                                            />
                                        </linearGradient>
                                    </defs>
                                    <circle
                                        cx="28"
                                        cy="28"
                                        r="24"
                                        fill="none"
                                        stroke="url(#cam-load-grad)"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeDasharray={`${
                                            2 * Math.PI * 24 * 0.3
                                        } ${2 * Math.PI * 24 * 0.7}`}
                                    />
                                </motion.svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Camera
                                        size={18}
                                        strokeWidth={1.8}
                                        className="text-slate-400"
                                    />
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm font-medium">
                                Starting camera…
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Error overlay ─────────────────────────── */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 px-6 text-center"
                            style={{
                                background:
                                    'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.95))',
                            }}
                        >
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                                style={{
                                    background: 'rgba(239,68,68,0.1)',
                                    border: '1px solid rgba(239,68,68,0.15)',
                                }}
                            >
                                <AlertCircle
                                    size={24}
                                    strokeWidth={1.8}
                                    className="text-red-400"
                                />
                            </div>
                            <p className="text-slate-300 text-sm font-medium max-w-[240px]">
                                {error}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Guide overlay — when camera ready ──────── */}
                <AnimatePresence>
                    {isReady && !error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}
                            className="absolute inset-0 pointer-events-none"
                        >
                            {/* Scanning line */}
                            <ScanLine mode={mode} />

                            {/* Vignette mask */}
                            <div
                                className="absolute inset-0"
                                style={{
                                    background: `radial-gradient(
                                        ${
                                            mode === 'id'
                                                ? 'ellipse 75% 65%'
                                                : 'ellipse 55% 65%'
                                        } at 50% 50%,
                                        transparent 0%,
                                        rgba(0,0,0,0.55) 100%
                                    )`,
                                }}
                            />

                            {/* Guide frame */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                {config.guideShape === 'rect' ? (
                                    <div
                                        className="relative"
                                        style={{
                                            width: '80%',
                                            height: '70%',
                                            border: `2px solid ${
                                                quality.isGood
                                                    ? 'rgba(52,211,153,0.9)'
                                                    : 'rgba(255,255,255,0.4)'
                                            }`,
                                            borderRadius: '16px',
                                            boxShadow: quality.isGood
                                                ? '0 0 0 1px rgba(52,211,153,0.2), 0 0 24px rgba(52,211,153,0.15), inset 0 0 24px rgba(52,211,153,0.05)'
                                                : 'inset 0 0 20px rgba(0,0,0,0.1)',
                                            transition:
                                                'border-color 0.4s, box-shadow 0.4s',
                                        }}
                                    >
                                        {(
                                            ['tl', 'tr', 'bl', 'br'] as const
                                        ).map((corner, i) => (
                                            <CornerMarker
                                                key={corner}
                                                corner={corner}
                                                isGood={quality.isGood}
                                                delay={0.1 + i * 0.08}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 300,
                                            damping: 22,
                                        }}
                                        style={{
                                            width: '65%',
                                            height: '80%',
                                            border: `2px solid ${
                                                quality.isGood
                                                    ? 'rgba(52,211,153,0.9)'
                                                    : 'rgba(255,255,255,0.4)'
                                            }`,
                                            borderRadius: '50%',
                                            boxShadow: quality.isGood
                                                ? '0 0 0 1px rgba(52,211,153,0.2), 0 0 24px rgba(52,211,153,0.15), inset 0 0 24px rgba(52,211,153,0.05)'
                                                : 'inset 0 0 20px rgba(0,0,0,0.1)',
                                            transition:
                                                'border-color 0.4s, box-shadow 0.4s',
                                        }}
                                    />
                                )}
                            </div>

                            {/* Quality pills */}
                            <AnimatePresence mode="wait">
                                {quality.hint && (
                                    <QualityPill
                                        key="warning"
                                        type="warning"
                                        message={quality.hint}
                                    />
                                )}
                                {quality.isGood && !quality.hint && (
                                    <QualityPill
                                        key="good"
                                        type="good"
                                        message="Good quality"
                                    />
                                )}
                            </AnimatePresence>

                            {/* Bottom info bar */}
                            <div className="absolute bottom-0 inset-x-0 p-3 z-20">
                                <div
                                    className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-full mx-auto w-fit"
                                    style={{
                                        background: 'rgba(0,0,0,0.5)',
                                        backdropFilter: 'blur(8px)',
                                        WebkitBackdropFilter: 'blur(8px)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                    }}
                                >
                                    <Shield
                                        size={11}
                                        strokeWidth={2}
                                        className="text-indigo-400"
                                    />
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        {mode === 'id'
                                            ? 'Position ID within frame'
                                            : 'Center face in oval'}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Capture controls ───────────────────────── */}
            {isReady && !error && (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="flex flex-col items-center gap-3"
                >
                    <ShutterButton
                        isGood={quality.isGood}
                        onClick={handleCapture}
                    />
                    <p className="text-slate-400 text-xs font-medium">
                        {quality.isGood
                            ? 'Tap to capture'
                            : 'Adjust position, then tap to capture'}
                    </p>
                </motion.div>
            )}
        </div>
    );
}