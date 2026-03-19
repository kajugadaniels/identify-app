// src/hooks/useCamera.ts

import { useRef, useState, useCallback, useEffect } from 'react';

export type CameraFacing = 'user' | 'environment';

export interface CameraQuality {
    isBlurry: boolean;
    isTooDark: boolean;
    isTooSmall: boolean;
    hint: string | null; // human-readable guidance shown to user
    isGood: boolean;       // true when all checks pass
}

interface UseCameraReturn {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    isReady: boolean;   // camera stream is active
    error: string | null;
    quality: CameraQuality;
    capturedImage: string | null; // base64 data URL after capture
    startCamera: (facing: CameraFacing) => Promise<void>;
    stopCamera: () => void;
    capture: () => string | null;
    reset: () => void;
}

// ── Quality thresholds ─────────────────────────────────
const BRIGHTNESS_MIN = 60;   // 0–255 — below this is too dark
const BRIGHTNESS_GOOD = 80;   // above this is well-lit
const BLUR_THRESHOLD = 80;   // Laplacian variance — below this is blurry
const SMALL_THRESHOLD = 0.25; // card must fill at least 25% of frame

export function useCamera(): UseCameraReturn {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const rafRef = useRef<number | null>(null);

    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [quality, setQuality] = useState<CameraQuality>({
        isBlurry: false,
        isTooDark: false,
        isTooSmall: false,
        hint: null,
        isGood: false,
    });

    // ── Start camera stream ──────────────────────────────
    const startCamera = useCallback(async (facing: CameraFacing) => {
        setError(null);
        setIsReady(false);

        try {
            // Stop any existing stream before starting a new one
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: facing,
                    // Request high resolution for better quality analysis
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                setIsReady(true);
            }
        } catch (err: unknown) {
            const e = err as Error;

            // Give the user a clear, actionable error message
            if (e.name === 'NotAllowedError') {
                setError(
                    'Camera permission denied. Please allow camera access in your browser settings.',
                );
            } else if (e.name === 'NotFoundError') {
                setError('No camera found on this device.');
            } else {
                setError('Could not start camera. Please try again.');
            }
        }
    }, []);

    // ── Stop camera and release resources ────────────────
    const stopCamera = useCallback(() => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        setIsReady(false);
    }, []);

    // ── Capture current frame to base64 ─────────────────
    const capture = useCallback((): string | null => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return null;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // Draw the current video frame onto the canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        setCapturedImage(dataUrl);
        stopCamera();
        return dataUrl;
    }, [stopCamera]);

    // ── Reset to start over ──────────────────────────────
    const reset = useCallback(() => {
        setCapturedImage(null);
        setQuality({
            isBlurry: false, isTooDark: false,
            isTooSmall: false, hint: null, isGood: false,
        });
    }, []);

    // ── Quality analysis loop ─────────────────────────────
    // Runs on every animation frame while the camera is active
    // Analyses brightness and sharpness of the current frame
    useEffect(() => {
        if (!isReady || capturedImage) return;

        function analyseFrame() {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (!video || !canvas || video.readyState < 2) {
                rafRef.current = requestAnimationFrame(analyseFrame);
                return;
            }

            // Use a small canvas for analysis — faster than full resolution
            const analysisSize = 160;
            canvas.width = analysisSize;
            canvas.height = analysisSize;

            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) return;

            ctx.drawImage(video, 0, 0, analysisSize, analysisSize);

            const imageData = ctx.getImageData(0, 0, analysisSize, analysisSize);
            const pixels = imageData.data;

            // ── Brightness analysis ─────────────────────────
            // Average the luminance of all pixels
            let totalBrightness = 0;
            for (let i = 0; i < pixels.length; i += 4) {
                // Standard luminance formula (ITU-R BT.601)
                totalBrightness +=
                    pixels[i] * 0.299 +     // R
                    pixels[i + 1] * 0.587 + // G
                    pixels[i + 2] * 0.114;  // B
            }
            const avgBrightness = totalBrightness / (pixels.length / 4);

            // ── Blur analysis (Laplacian variance) ──────────
            // Sharp images have high variance in edge detection
            // Blurry images have low variance — edges are soft
            let laplacianSum = 0;
            const w = analysisSize;
            const grayscale: number[] = [];

            for (let i = 0; i < pixels.length; i += 4) {
                grayscale.push(
                    pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114,
                );
            }

            // Apply 3x3 Laplacian kernel
            for (let y = 1; y < w - 1; y++) {
                for (let x = 1; x < w - 1; x++) {
                    const idx = y * w + x;
                    const lap =
                        -grayscale[idx - w - 1] - grayscale[idx - w] - grayscale[idx - w + 1] -
                        grayscale[idx - 1] + 8 * grayscale[idx] - grayscale[idx + 1] -
                        grayscale[idx + w - 1] - grayscale[idx + w] - grayscale[idx + w + 1];
                    laplacianSum += lap * lap;
                }
            }
            const blurVariance = laplacianSum / ((w - 2) * (w - 2));

            // ── Build quality result ─────────────────────────
            const isTooDark = avgBrightness < BRIGHTNESS_MIN;
            const isDim = avgBrightness < BRIGHTNESS_GOOD;
            const isBlurry = blurVariance < BLUR_THRESHOLD;

            let hint: string | null = null;
            if (isTooDark) hint = 'Too dark — move to a brighter area';
            else if (isDim) hint = 'Improve lighting for better results';
            else if (isBlurry) hint = 'Hold still — image is blurry';
            else hint = null;

            const isGood = !isTooDark && !isBlurry;

            setQuality({
                isBlurry,
                isTooDark,
                isTooSmall: false,
                hint,
                isGood,
            });

            rafRef.current = requestAnimationFrame(analyseFrame);
        }

        rafRef.current = requestAnimationFrame(analyseFrame);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [isReady, capturedImage]);

    // ── Cleanup on unmount ───────────────────────────────
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    return {
        videoRef,
        canvasRef,
        isReady,
        error,
        quality,
        capturedImage,
        startCamera,
        stopCamera,
        capture,
        reset,
    };
}