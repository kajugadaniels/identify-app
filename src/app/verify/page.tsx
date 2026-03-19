'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { GlassCard } from '@/components/shared/GlassCard';
import { GlassButton } from '@/components/shared/GlassButton';
import { StepIndicator } from '@/components/shared/StepIndicator';
import { CameraCapture } from '@/components/verification/CameraCapture';
import { CapturePreview } from '@/components/verification/CapturePreview';
import { VerificationResult } from '@/components/verification/VerificationResult';
import { useToast } from '@/components/ui/use-toast';
import { VerificationResult as VerificationResultType } from '@/types';
import {
    createLivenessSession,
    submitVerification,
} from '@/services/verification.service';

// ── Step definitions ──────────────────────────────────
const STEPS = [
    { label: 'ID card' },
    { label: 'Selfie' },
    { label: 'Processing' },
    { label: 'Result' },
];

// ── Sub-step within each capture step ────────────────
// 'camera'  = live camera feed with guide overlay
// 'preview' = captured frame shown for review
type SubStep = 'camera' | 'preview';

// ── Helper: convert base64 data URL to File object ───
// NestJS expects a real File in the FormData — not a base64 string
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

export default function VerifyPage() {
    const { isAuthenticated, isLoading } = useRequireAuth();
    const { toast } = useToast();

    // ── Step state ─────────────────────────────────────
    const [currentStep, setCurrentStep] = useState(0);
    const [subStep, setSubStep] = useState<SubStep>('camera');

    // ── Captured image state ───────────────────────────
    const [idDataUrl, setIdDataUrl] = useState<string | null>(null);
    const [selfieDataUrl, setSelfieDataUrl] = useState<string | null>(null);

    // ── Result state ───────────────────────────────────
    const [result, setResult] = useState<VerificationResultType | null>(null);
    const [processing, setProcessing] = useState(false);

    if (isLoading || !isAuthenticated) return null;

    // ── ID card captured from camera ──────────────────
    function handleIdCaptured(dataUrl: string) {
        setIdDataUrl(dataUrl);
        setSubStep('preview');
    }

    // ── User confirms ID preview ───────────────────────
    function handleIdConfirmed() {
        setCurrentStep(1);
        setSubStep('camera');
    }

    // ── User retakes ID ────────────────────────────────
    function handleIdRetake() {
        setIdDataUrl(null);
        setSubStep('camera');
    }

    // ── Selfie captured from camera ────────────────────
    function handleSelfieCaptured(dataUrl: string) {
        setSelfieDataUrl(dataUrl);
        setSubStep('preview');
    }

    // ── User confirms selfie — run verification ────────
    async function handleSelfieConfirmed() {
        if (!idDataUrl || !selfieDataUrl) return;

        setCurrentStep(2);
        setProcessing(true);

        try {
            // Convert base64 data URLs to File objects for FormData
            const idFile = dataUrlToFile(idDataUrl, 'id_card.jpg');
            const selfieFile = dataUrlToFile(selfieDataUrl, 'selfie.jpg');

            // Create liveness session then submit both images
            const sessionId = await createLivenessSession();
            const verificationResult = await submitVerification(
                sessionId,
                idFile,
                selfieFile,
            );

            setResult(verificationResult);
            setCurrentStep(3);

        } catch (error: unknown) {
            const message =
                (error as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message ??
                'Verification failed. Please try again.';

            toast({
                title: 'Verification failed',
                description: message,
                variant: 'destructive',
            });

            // Send back to selfie step to retry
            setCurrentStep(1);
            setSubStep('camera');
            setSelfieDataUrl(null);

        } finally {
            setProcessing(false);
        }
    }

    // ── User retakes selfie ────────────────────────────
    function handleSelfieRetake() {
        setSelfieDataUrl(null);
        setSubStep('camera');
    }

    // ── Camera error ───────────────────────────────────
    function handleCameraError(message: string) {
        toast({
            title: 'Camera error',
            description: message,
            variant: 'destructive',
        });
    }

    // ── Reset everything ───────────────────────────────
    function handleRetry() {
        setCurrentStep(0);
        setSubStep('camera');
        setIdDataUrl(null);
        setSelfieDataUrl(null);
        setResult(null);
        setProcessing(false);
    }

    return (
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">

            {/* Page header */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center mb-8"
            >
                <h1 className="text-2xl font-bold text-white mb-2">
                    Identity Verification
                </h1>
                <p className="text-white/40 text-sm">
                    Complete all steps to verify your identity
                </p>
            </motion.div>

            {/* Step indicator */}
            <div className="mb-8">
                <StepIndicator steps={STEPS} currentStep={currentStep} />
            </div>

            {/* Step content */}
            <GlassCard variant="lg" className="p-6 sm:p-8">
                <AnimatePresence mode="wait">

                    {/* ── Step 0: ID card capture ────────────── */}
                    {currentStep === 0 && subStep === 'camera' && (
                        <motion.div
                            key="id-camera"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
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
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <CapturePreview
                                dataUrl={idDataUrl}
                                mode="id"
                                onConfirm={handleIdConfirmed}
                                onRetake={handleIdRetake}
                            />
                        </motion.div>
                    )}

                    {/* ── Step 1: Selfie capture ─────────────── */}
                    {currentStep === 1 && subStep === 'camera' && (
                        <motion.div
                            key="selfie-camera"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <CameraCapture
                                mode="selfie"
                                onCapture={handleSelfieCaptured}
                                onError={handleCameraError}
                            />

                            {/* Back button */}
                            <div className="mt-4">
                                <GlassButton
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setCurrentStep(0);
                                        setSubStep('camera');
                                        setIdDataUrl(null);
                                    }}
                                >
                                    ← Retake ID card
                                </GlassButton>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 1 && subStep === 'preview' && selfieDataUrl && (
                        <motion.div
                            key="selfie-preview"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <CapturePreview
                                dataUrl={selfieDataUrl}
                                mode="selfie"
                                onConfirm={handleSelfieConfirmed}
                                onRetake={handleSelfieRetake}
                            />
                        </motion.div>
                    )}

                    {/* ── Step 2: Processing ─────────────────── */}
                    {currentStep === 2 && (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col items-center gap-6 py-8"
                        >
                            {/* Spinning ring */}
                            <div className="relative w-20 h-20">
                                <div
                                    className="absolute inset-0 rounded-full border-2"
                                    style={{ borderColor: 'rgba(99,102,241,0.2)' }}
                                />
                                <motion.div
                                    className="absolute inset-0 rounded-full border-2 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center text-2xl">
                                    🔍
                                </div>
                            </div>

                            <div className="text-center">
                                <p className="text-white font-semibold mb-2">
                                    Verifying your identity
                                </p>
                                <p className="text-white/40 text-sm">
                                    Running liveness check, face matching and OCR…
                                </p>
                            </div>

                            {/* Animated step labels */}
                            <div className="flex flex-col gap-2 w-full max-w-xs">
                                {[
                                    'Creating liveness session',
                                    'Comparing faces',
                                    'Extracting ID text',
                                    'Calculating score',
                                ].map((step, i) => (
                                    <motion.div
                                        key={step}
                                        initial={{ opacity: 0, x: -12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.4, duration: 0.3 }}
                                        className="flex items-center gap-2 text-sm text-white/40"
                                    >
                                        <motion.span
                                            animate={{ opacity: [0.3, 1, 0.3] }}
                                            transition={{
                                                delay: i * 0.4,
                                                duration: 1.2,
                                                repeat: Infinity,
                                            }}
                                            className="w-1.5 h-1.5 rounded-full"
                                            style={{ background: '#6366f1' }}
                                        />
                                        {step}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ── Step 3: Result ─────────────────────── */}
                    {currentStep === 3 && result && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            <VerificationResult result={result} onRetry={handleRetry} />
                        </motion.div>
                    )}

                </AnimatePresence>
            </GlassCard>

            {/* Tips card — only shown during capture steps */}
            <AnimatePresence>
                {currentStep < 2 && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-4"
                    >
                        <GlassCard variant="sm" className="p-4">
                            <p className="text-xs text-white/40 uppercase tracking-widest mb-3">
                                Tips for best results
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {(currentStep === 0
                                    ? [
                                        '💡 Use good lighting',
                                        '📐 Keep card flat',
                                        '🔍 Fill the frame',
                                        '🚫 No glare or shadows',
                                    ]
                                    : [
                                        '👁️ Look at the camera',
                                        '💡 Good lighting',
                                        '😐 Neutral expression',
                                        '🚫 No glasses or hats',
                                    ]
                                ).map((tip) => (
                                    <p key={tip} className="text-xs text-white/45">
                                        {tip}
                                    </p>
                                ))}
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}