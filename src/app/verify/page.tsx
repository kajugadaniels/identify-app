'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { GlassCard } from '@/components/shared/GlassCard';
import { GlassButton } from '@/components/shared/GlassButton';
import { StepIndicator } from '@/components/shared/StepIndicator';
import { IDUploader } from '@/components/verification/IDUploader';
import { VerificationResult } from '@/components/verification/VerificationResult';
import { useToast } from '@/components/ui/use-toast';
import { VerificationResult as VerificationResultType } from '@/types';

// ── Service layer imports ──────────────────────────────
import {
    createLivenessSession,
    submitVerification,
} from '@/services/verification.service';

// ── Step definitions ──────────────────────────────────
const STEPS = [
    { label: 'Upload ID' },
    { label: 'Selfie' },
    { label: 'Processing' },
    { label: 'Result' },
];

export default function VerifyPage() {
    const { isAuthenticated } = useRequireAuth();
    const { toast } = useToast();

    const [currentStep, setCurrentStep] = useState(0);
    const [idFile, setIdFile] = useState<File | null>(null);
    const [selfieFile, setSelfieFile] = useState<File | null>(null);
    const [result, setResult] = useState<VerificationResultType | null>(null);
    const [processing, setProcessing] = useState(false);

    if (!isAuthenticated) return null;

    // ── Step 0 → 1: ID uploaded, proceed to selfie ────
    function handleIdSelected(file: File) {
        setIdFile(file);
    }

    function handleProceedToSelfie() {
        if (!idFile) {
            toast({
                title: 'ID image required',
                description: 'Please upload your ID card before continuing.',
                variant: 'destructive',
            });
            return;
        }
        setCurrentStep(1);
    }

    // ── Step 1: Selfie selected ────────────────────────
    function handleSelfieSelected(file: File) {
        setSelfieFile(file);
    }

    // ── Step 1 → 2 → 3: Run verification ──────────────
    async function handleStartVerification() {
        if (!selfieFile || !idFile) {
            toast({
                title: 'Selfie required',
                description: 'Please upload a selfie before continuing.',
                variant: 'destructive',
            });
            return;
        }

        setProcessing(true);
        setCurrentStep(2);

        try {
            // Step 1 — create liveness session on AWS via NestJS
            const sessionId = await createLivenessSession();

            // Step 2 — submit both images + session ID for full verification
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

            // Go back to selfie step so user can retry
            setCurrentStep(1);
        } finally {
            setProcessing(false);
        }
    }

    // ── Reset all state for a fresh attempt ───────────
    function handleRetry() {
        setCurrentStep(0);
        setIdFile(null);
        setSelfieFile(null);
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

            {/* Step progress indicator */}
            <div className="mb-8">
                <StepIndicator steps={STEPS} currentStep={currentStep} />
            </div>

            {/* Step content card */}
            <GlassCard variant="lg" className="p-6 sm:p-8">
                <AnimatePresence mode="wait">

                    {/* ── Step 0: Upload ID card ─────────────── */}
                    {currentStep === 0 && (
                        <motion.div
                            key="step-0"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col gap-6"
                        >
                            <div>
                                <h2 className="text-lg font-semibold text-white mb-1">
                                    Upload your ID card
                                </h2>
                                <p className="text-sm text-white/40">
                                    Upload a clear photo of a government-issued ID
                                </p>
                            </div>

                            <IDUploader
                                label="ID card image"
                                hint="Passport, driver's licence or national ID · JPEG or PNG · max 5MB"
                                onFileSelected={handleIdSelected}
                            />

                            <GlassButton
                                variant="primary"
                                size="lg"
                                fullWidth
                                onClick={handleProceedToSelfie}
                                disabled={!idFile}
                            >
                                Continue
                            </GlassButton>
                        </motion.div>
                    )}

                    {/* ── Step 1: Upload selfie ──────────────── */}
                    {currentStep === 1 && (
                        <motion.div
                            key="step-1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col gap-6"
                        >
                            <div>
                                <h2 className="text-lg font-semibold text-white mb-1">
                                    Take a selfie
                                </h2>
                                <p className="text-sm text-white/40">
                                    Upload a clear, well-lit photo of your face
                                </p>
                            </div>

                            <IDUploader
                                label="Selfie image"
                                hint="Face must be clearly visible · no sunglasses or hats"
                                onFileSelected={handleSelfieSelected}
                            />

                            <div className="flex gap-3">
                                <GlassButton
                                    variant="ghost"
                                    size="lg"
                                    onClick={() => setCurrentStep(0)}
                                >
                                    Back
                                </GlassButton>
                                <GlassButton
                                    variant="primary"
                                    size="lg"
                                    fullWidth
                                    onClick={handleStartVerification}
                                    disabled={!selfieFile}
                                    loading={processing}
                                >
                                    Verify now
                                </GlassButton>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Step 2: Processing ─────────────────── */}
                    {currentStep === 2 && (
                        <motion.div
                            key="step-2"
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
                                    className="absolute inset-0 rounded-full border-2
                             border-t-indigo-500 border-r-transparent
                             border-b-transparent border-l-transparent"
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
                            key="step-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            <VerificationResult result={result} onRetry={handleRetry} />
                        </motion.div>
                    )}

                </AnimatePresence>
            </GlassCard>

        </div>
    );
}