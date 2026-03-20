'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard,
    ScanFace,
    Loader2,
    Award,
    Lightbulb,
    ArrowLeft,
    CheckCircle2,
    Shield,
} from 'lucide-react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { GlassCard } from '@/components/shared/GlassCard';
import { GlassButton } from '@/components/shared/GlassButton';
import { StepIndicator } from '@/components/shared/StepIndicator';
import { CameraCapture } from '@/components/verification/CameraCapture';
import { CapturePreview } from '@/components/verification/CapturePreview';
import { VerificationResult } from '@/components/verification/VerificationResult';
import { useToast } from '@/components/ui/use-toast';
import { VerificationResult as VerificationResultType } from '@/types';
import { submitVerification } from '@/services/verification.service';

// ── Step definitions ──────────────────────────────────
const STEPS = [
    { label: 'ID card' },
    { label: 'Selfie' },
    { label: 'Processing' },
    { label: 'Result' },
];

type SubStep = 'camera' | 'preview';

// ── Helper: convert base64 data URL to File object ───
function dataUrlToFile(dataUrl: string, filename: string): File {
    const [header, base64] = dataUrl.split(',');
    const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return new File([bytes], filename, { type: mime });
}

/* ── Step icon mapping ──────────────────────────────────── */
function StepIcon({ step }: { step: number }) {
    const icons = [
        <CreditCard key={0} size={20} strokeWidth={1.8} />,
        <ScanFace key={1} size={20} strokeWidth={1.8} />,
        <Loader2 key={2} size={20} strokeWidth={1.8} />,
        <Award key={3} size={20} strokeWidth={1.8} />,
    ];
    return icons[step] ?? null;
}

/* ── Ambient background ─────────────────────────────────── */
function VerifyBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
            <div
                className="absolute inset-0"
                style={{
                    background:
                        'linear-gradient(150deg, #f8fafc 0%, #eef2ff 35%, #f5f3ff 65%, #faf5ff 100%)',
                }}
            />
            <motion.div
                className="absolute rounded-full"
                style={{
                    width: 450,
                    height: 450,
                    top: '10%',
                    right: '-10%',
                    background:
                        'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
                    filter: 'blur(50px)',
                }}
                animate={{ x: [0, -30, 15, 0], y: [0, 20, -10, 0] }}
                transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="absolute rounded-full"
                style={{
                    width: 350,
                    height: 350,
                    bottom: '5%',
                    left: '-5%',
                    background:
                        'radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                }}
                animate={{ x: [0, 20, -15, 0], y: [0, -15, 10, 0] }}
                transition={{
                    duration: 16,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 2,
                }}
            />
            {/* Dot grid */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage:
                        'radial-gradient(rgba(99,102,241,0.04) 1px, transparent 1px)',
                    backgroundSize: '36px 36px',
                    maskImage:
                        'radial-gradient(ellipse at 60% 30%, black 20%, transparent 60%)',
                    WebkitMaskImage:
                        'radial-gradient(ellipse at 60% 30%, black 20%, transparent 60%)',
                }}
            />
        </div>
    );
}

/* ── Processing spinner with orbital ring ───────────────── */
function ProcessingSpinner() {
    return (
        <div className="relative w-24 h-24">
            {/* Outer pulsing glow */}
            <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                    boxShadow: [
                        '0 0 0px rgba(99,102,241,0.1)',
                        '0 0 30px rgba(99,102,241,0.2)',
                        '0 0 0px rgba(99,102,241,0.1)',
                    ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Glass circle */}
            <div
                className="absolute inset-0 rounded-full"
                style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
                }}
            />

            {/* Static track */}
            <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 96 96"
            >
                <circle
                    cx="48"
                    cy="48"
                    r="42"
                    fill="none"
                    stroke="rgba(148,163,184,0.1)"
                    strokeWidth="3"
                />
            </svg>

            {/* Spinning gradient arc */}
            <motion.svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 96 96"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
            >
                <defs>
                    <linearGradient id="spin-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                </defs>
                <circle
                    cx="48"
                    cy="48"
                    r="42"
                    fill="none"
                    stroke="url(#spin-grad)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42 * 0.3} ${2 * Math.PI * 42 * 0.7}`}
                />
            </motion.svg>

            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
                <Shield size={24} strokeWidth={1.5} className="text-indigo-500" />
            </div>
        </div>
    );
}

/* ── Processing step label ──────────────────────────────── */
function ProcessingStep({
    label,
    index,
}: {
    label: string;
    index: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.5, duration: 0.35 }}
            className="flex items-center gap-3"
        >
            <motion.div
                className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                style={{
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.1)',
                }}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{
                    delay: index * 0.5,
                    duration: 1.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            >
                <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-indigo-500"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{
                        delay: index * 0.5,
                        duration: 1.2,
                        repeat: Infinity,
                    }}
                />
            </motion.div>
            <span className="text-sm text-slate-500 font-medium">{label}</span>
        </motion.div>
    );
}

/* ── Tip card item ──────────────────────────────────────── */
function TipItem({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <div className="flex items-start gap-2.5">
            <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{
                    background: 'rgba(99,102,241,0.06)',
                    border: '1px solid rgba(99,102,241,0.08)',
                }}
            >
                <span className="text-indigo-500">{icon}</span>
            </div>
            <span className="text-[13px] text-slate-500 font-medium leading-relaxed">
                {text}
            </span>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   Verify Page
   ═══════════════════════════════════════════════════════════ */
export default function VerifyPage() {
    const { isAuthenticated, isLoading } = useRequireAuth();
    const { toast } = useToast();

    const [currentStep, setCurrentStep] = useState(0);
    const [subStep, setSubStep] = useState<SubStep>('camera');
    const [idDataUrl, setIdDataUrl] = useState<string | null>(null);
    const [selfieDataUrl, setSelfieDataUrl] = useState<string | null>(null);
    const [result, setResult] = useState<VerificationResultType | null>(null);
    const [, setProcessing] = useState(false);

    if (isLoading || !isAuthenticated) return null;

    function handleIdCaptured(dataUrl: string) {
        setIdDataUrl(dataUrl);
        setSubStep('preview');
    }

    function handleIdConfirmed() {
        setCurrentStep(1);
        setSubStep('camera');
    }

    function handleIdRetake() {
        setIdDataUrl(null);
        setSubStep('camera');
    }

    function handleSelfieCaptured(dataUrl: string) {
        setSelfieDataUrl(dataUrl);
        setSubStep('preview');
    }

    async function handleSelfieConfirmed() {
        if (!idDataUrl || !selfieDataUrl) return;

        setCurrentStep(2);
        setProcessing(true);

        try {
            const idFile = dataUrlToFile(idDataUrl, 'id_card.jpg');
            const selfieFile = dataUrlToFile(selfieDataUrl, 'selfie.jpg');
            const verificationResult = await submitVerification(
                idFile,
                selfieFile,
            );
            setResult(verificationResult);
            setCurrentStep(3);
        } catch (error: unknown) {
            type ErrData = {
                error?: { message?: string };
                message?: string;
            };
            const data = (
                error as { response?: { data?: ErrData } }
            )?.response?.data;
            const message =
                data?.error?.message ??
                data?.message ??
                'Verification failed. Please try again.';

            toast({
                title: 'Verification failed',
                description: message,
                variant: 'destructive',
            });

            setCurrentStep(1);
            setSubStep('camera');
            setSelfieDataUrl(null);
        } finally {
            setProcessing(false);
        }
    }

    function handleSelfieRetake() {
        setSelfieDataUrl(null);
        setSubStep('camera');
    }

    function handleCameraError(message: string) {
        toast({
            title: 'Camera error',
            description: message,
            variant: 'destructive',
        });
    }

    function handleRetry() {
        setCurrentStep(0);
        setSubStep('camera');
        setIdDataUrl(null);
        setSelfieDataUrl(null);
        setResult(null);
        setProcessing(false);
    }

    const idTips = [
        { icon: <Lightbulb size={13} strokeWidth={2} />, text: 'Use good, even lighting' },
        { icon: <CreditCard size={13} strokeWidth={2} />, text: 'Keep the card flat and steady' },
        { icon: <ScanFace size={13} strokeWidth={2} />, text: 'Fill the guide frame completely' },
        { icon: <Shield size={13} strokeWidth={2} />, text: 'Avoid glare and shadows' },
    ];

    const selfieTips = [
        { icon: <ScanFace size={13} strokeWidth={2} />, text: 'Look directly at the camera' },
        { icon: <Lightbulb size={13} strokeWidth={2} />, text: 'Ensure good lighting on your face' },
        { icon: <Shield size={13} strokeWidth={2} />, text: 'Keep a neutral expression' },
        { icon: <CheckCircle2 size={13} strokeWidth={2} />, text: 'Remove glasses or hats' },
    ];

    return (
        <>
            <VerifyBackground />

            <div className="relative z-10 max-w-lg mx-auto px-4 sm:px-6 py-8 sm:py-12">

                {/* ── Page header ───────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="text-center mb-8"
                >
                    {/* Header badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
                        style={{
                            background: 'rgba(255, 255, 255, 0.6)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.5)',
                            boxShadow:
                                '0 2px 8px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.6)',
                        }}
                    >
                        <span className="text-indigo-500">
                            <StepIcon step={currentStep} />
                        </span>
                        <span className="text-xs font-semibold text-slate-500 tracking-wide">
                            Step {currentStep + 1} of {STEPS.length}
                        </span>
                    </motion.div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                        Identity{' '}
                        <span
                            style={{
                                background:
                                    'linear-gradient(135deg, #6366f1 0%, #818cf8 40%, #a78bfa 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            Verification
                        </span>
                    </h1>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto">
                        Complete all steps to verify your identity securely
                    </p>
                </motion.div>

                {/* ── Step indicator ────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                    className="mb-8"
                >
                    <StepIndicator steps={STEPS} currentStep={currentStep} />
                </motion.div>

                {/* ── Step content card ─────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <GlassCard variant="lg" className="overflow-hidden">
                        {/* Top accent bar */}
                        <div
                            className="h-1 w-full"
                            style={{
                                background:
                                    'linear-gradient(90deg, #6366f1 0%, #818cf8 40%, #a78bfa 70%, #c4b5fd 100%)',
                            }}
                        />

                        <div className="p-6 sm:p-8">
                            <AnimatePresence mode="wait">

                                {/* ── Step 0: ID card capture ────── */}
                                {currentStep === 0 && subStep === 'camera' && (
                                    <motion.div
                                        key="id-camera"
                                        initial={{ opacity: 0, x: 24, filter: 'blur(4px)' }}
                                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                        exit={{ opacity: 0, x: -24, filter: 'blur(4px)' }}
                                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                    >
                                        <div className="flex items-center gap-2.5 mb-5">
                                            <div
                                                className="w-8 h-8 rounded-xl flex items-center justify-center"
                                                style={{
                                                    background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(129,140,248,0.06))',
                                                    border: '1px solid rgba(99,102,241,0.1)',
                                                }}
                                            >
                                                <CreditCard size={16} strokeWidth={1.8} className="text-indigo-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-slate-800">
                                                    Scan your ID card
                                                </h3>
                                                <p className="text-[11px] text-slate-400">
                                                    Position your card within the guide frame
                                                </p>
                                            </div>
                                        </div>
                                        <CameraCapture
                                            mode="id"
                                            onCapture={handleIdCaptured}
                                            onError={handleCameraError}
                                        />
                                    </motion.div>
                                )}

                                {currentStep === 0 && subStep === 'preview' && idDataUrl && (
                                    <motion.div
                                        key="id-preview"
                                        initial={{ opacity: 0, x: 24, filter: 'blur(4px)' }}
                                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                        exit={{ opacity: 0, x: -24, filter: 'blur(4px)' }}
                                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                    >
                                        <CapturePreview
                                            dataUrl={idDataUrl}
                                            mode="id"
                                            onConfirm={handleIdConfirmed}
                                            onRetake={handleIdRetake}
                                        />
                                    </motion.div>
                                )}

                                {/* ── Step 1: Selfie capture ─────── */}
                                {currentStep === 1 && subStep === 'camera' && (
                                    <motion.div
                                        key="selfie-camera"
                                        initial={{ opacity: 0, x: 24, filter: 'blur(4px)' }}
                                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                        exit={{ opacity: 0, x: -24, filter: 'blur(4px)' }}
                                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                    >
                                        <div className="flex items-center gap-2.5 mb-5">
                                            <div
                                                className="w-8 h-8 rounded-xl flex items-center justify-center"
                                                style={{
                                                    background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(129,140,248,0.06))',
                                                    border: '1px solid rgba(99,102,241,0.1)',
                                                }}
                                            >
                                                <ScanFace size={16} strokeWidth={1.8} className="text-indigo-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-slate-800">
                                                    Take a selfie
                                                </h3>
                                                <p className="text-[11px] text-slate-400">
                                                    We&apos;ll match your face against your ID
                                                </p>
                                            </div>
                                        </div>
                                        <CameraCapture
                                            mode="selfie"
                                            onCapture={handleSelfieCaptured}
                                            onError={handleCameraError}
                                        />

                                        <div className="mt-5">
                                            <GlassButton
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setCurrentStep(0);
                                                    setSubStep('camera');
                                                    setIdDataUrl(null);
                                                }}
                                                icon={<ArrowLeft size={14} strokeWidth={2} />}
                                            >
                                                Retake ID card
                                            </GlassButton>
                                        </div>
                                    </motion.div>
                                )}

                                {currentStep === 1 && subStep === 'preview' && selfieDataUrl && (
                                    <motion.div
                                        key="selfie-preview"
                                        initial={{ opacity: 0, x: 24, filter: 'blur(4px)' }}
                                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                        exit={{ opacity: 0, x: -24, filter: 'blur(4px)' }}
                                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                    >
                                        <CapturePreview
                                            dataUrl={selfieDataUrl}
                                            mode="selfie"
                                            onConfirm={handleSelfieConfirmed}
                                            onRetake={handleSelfieRetake}
                                        />
                                    </motion.div>
                                )}

                                {/* ── Step 2: Processing ─────────── */}
                                {currentStep === 2 && (
                                    <motion.div
                                        key="processing"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.35 }}
                                        className="flex flex-col items-center gap-7 py-8 sm:py-10"
                                    >
                                        <ProcessingSpinner />

                                        <div className="text-center">
                                            <p className="text-slate-800 font-semibold text-base mb-1.5">
                                                Verifying your identity
                                            </p>
                                            <p className="text-slate-400 text-sm">
                                                Running liveness check, face matching and OCR…
                                            </p>
                                        </div>

                                        {/* Animated step labels */}
                                        <div
                                            className="flex flex-col gap-3 w-full max-w-xs rounded-xl p-4"
                                            style={{
                                                background: 'rgba(248,250,252,0.5)',
                                                border: '1px solid rgba(148,163,184,0.1)',
                                            }}
                                        >
                                            {[
                                                'Creating liveness session',
                                                'Comparing faces',
                                                'Extracting ID text',
                                                'Calculating score',
                                            ].map((step, i) => (
                                                <ProcessingStep
                                                    key={step}
                                                    label={step}
                                                    index={i}
                                                />
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* ── Step 3: Result ──────────────── */}
                                {currentStep === 3 && result && (
                                    <motion.div
                                        key="result"
                                        initial={{ opacity: 0, scale: 0.96 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{
                                            duration: 0.5,
                                            ease: [0.25, 0.46, 0.45, 0.94],
                                        }}
                                    >
                                        <VerificationResult
                                            result={result}
                                            onRetry={handleRetry}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </GlassCard>
                </motion.div>

                {/* ── Tips card — only during capture steps ─── */}
                <AnimatePresence>
                    {currentStep < 2 && (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ delay: 0.35, duration: 0.4 }}
                            className="mt-4"
                        >
                            <GlassCard variant="sm" className="overflow-hidden">
                                <div className="p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div
                                            className="w-6 h-6 rounded-lg flex items-center justify-center"
                                            style={{
                                                background: 'rgba(99,102,241,0.08)',
                                                border: '1px solid rgba(99,102,241,0.1)',
                                            }}
                                        >
                                            <Lightbulb
                                                size={12}
                                                strokeWidth={2}
                                                className="text-indigo-500"
                                            />
                                        </div>
                                        <span className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">
                                            Tips for best results
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {(currentStep === 0
                                            ? idTips
                                            : selfieTips
                                        ).map((tip, i) => (
                                            <motion.div
                                                key={tip.text}
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    delay: 0.4 + i * 0.06,
                                                    duration: 0.3,
                                                }}
                                            >
                                                <TipItem
                                                    icon={tip.icon}
                                                    text={tip.text}
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}