'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { GlassButton } from '@/components/shared/GlassButton';
import { useUiStore } from '@/store/ui.store';
import { ArrowRight, Shield, Fingerprint, ScanFace } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   Background: Animated Mesh Gradient Canvas
   ═══════════════════════════════════════════════════════════ */
function MeshGradientCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        let time = 0;

        function resize() {
            if (!canvas) return;
            canvas.width = window.innerWidth * 2;
            canvas.height = window.innerHeight * 2;
            canvas.style.width = '100%';
            canvas.style.height = '100%';
        }
        resize();
        window.addEventListener('resize', resize);

        function draw() {
            if (!canvas || !ctx) return;
            const w = canvas.width;
            const h = canvas.height;
            time += 0.003;

            ctx.clearRect(0, 0, w, h);

            // Base gradient
            const baseGrad = ctx.createLinearGradient(0, 0, w, h);
            baseGrad.addColorStop(0, '#f8fafc');
            baseGrad.addColorStop(0.5, '#eef2ff');
            baseGrad.addColorStop(1, '#f5f3ff');
            ctx.fillStyle = baseGrad;
            ctx.fillRect(0, 0, w, h);

            // Animated blob 1 — indigo
            const x1 = w * (0.3 + 0.15 * Math.sin(time * 0.8));
            const y1 = h * (0.25 + 0.1 * Math.cos(time * 0.6));
            const r1 = w * (0.18 + 0.03 * Math.sin(time * 1.2));
            const grad1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, r1);
            grad1.addColorStop(0, 'rgba(99, 102, 241, 0.12)');
            grad1.addColorStop(0.5, 'rgba(99, 102, 241, 0.06)');
            grad1.addColorStop(1, 'transparent');
            ctx.fillStyle = grad1;
            ctx.fillRect(0, 0, w, h);

            // Animated blob 2 — violet
            const x2 = w * (0.7 + 0.12 * Math.cos(time * 0.7));
            const y2 = h * (0.6 + 0.15 * Math.sin(time * 0.5));
            const r2 = w * (0.2 + 0.04 * Math.cos(time));
            const grad2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, r2);
            grad2.addColorStop(0, 'rgba(167, 139, 250, 0.1)');
            grad2.addColorStop(0.5, 'rgba(167, 139, 250, 0.04)');
            grad2.addColorStop(1, 'transparent');
            ctx.fillStyle = grad2;
            ctx.fillRect(0, 0, w, h);

            // Animated blob 3 — cyan accent
            const x3 = w * (0.5 + 0.18 * Math.sin(time * 0.9 + 2));
            const y3 = h * (0.35 + 0.12 * Math.cos(time * 0.65 + 1));
            const r3 = w * (0.14 + 0.02 * Math.sin(time * 1.1));
            const grad3 = ctx.createRadialGradient(x3, y3, 0, x3, y3, r3);
            grad3.addColorStop(0, 'rgba(129, 140, 248, 0.08)');
            grad3.addColorStop(1, 'transparent');
            ctx.fillStyle = grad3;
            ctx.fillRect(0, 0, w, h);

            // Animated blob 4 — emerald subtle
            const x4 = w * (0.2 + 0.1 * Math.cos(time * 0.4 + 3));
            const y4 = h * (0.7 + 0.08 * Math.sin(time * 0.8));
            const r4 = w * 0.12;
            const grad4 = ctx.createRadialGradient(x4, y4, 0, x4, y4, r4);
            grad4.addColorStop(0, 'rgba(52, 211, 153, 0.05)');
            grad4.addColorStop(1, 'transparent');
            ctx.fillStyle = grad4;
            ctx.fillRect(0, 0, w, h);

            animationId = requestAnimationFrame(draw);
        }
        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ opacity: 0.9 }}
        />
    );
}

/* ── Dot grid pattern overlay ───────────────────────────── */
function DotGrid() {
    return (
        <div
            className="absolute inset-0 pointer-events-none"
            style={{
                backgroundImage:
                    'radial-gradient(rgba(99,102,241,0.08) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
                maskImage:
                    'radial-gradient(ellipse at center, black 30%, transparent 70%)',
                WebkitMaskImage:
                    'radial-gradient(ellipse at center, black 30%, transparent 70%)',
            }}
        />
    );
}

/* ── Aurora wave bands ──────────────────────────────────── */
function AuroraWaves() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="absolute w-[200%] left-[-50%]"
                    style={{
                        top: `${28 + i * 14}%`,
                        height: '180px',
                        background: `linear-gradient(90deg, 
                            transparent 0%, 
                            rgba(${i === 0 ? '99,102,241' : i === 1 ? '129,140,248' : '167,139,250'},${0.04 - i * 0.008}) 25%, 
                            rgba(${i === 0 ? '99,102,241' : i === 1 ? '129,140,248' : '167,139,250'},${0.06 - i * 0.01}) 50%, 
                            rgba(${i === 0 ? '99,102,241' : i === 1 ? '129,140,248' : '167,139,250'},${0.04 - i * 0.008}) 75%, 
                            transparent 100%
                        )`,
                        filter: 'blur(40px)',
                        borderRadius: '50%',
                    }}
                    animate={{
                        x: ['0%', '15%', '-10%', '0%'],
                        rotate: [0, 1, -1, 0],
                        scaleY: [1, 1.2, 0.9, 1],
                    }}
                    transition={{
                        duration: 12 + i * 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: i * 2,
                    }}
                />
            ))}
        </div>
    );
}

/* ── Floating glass orbs ────────────────────────────────── */
function FloatingOrbs() {
    const orbs = [
        { size: 220, top: '10%', left: '8%', color: 'rgba(99,102,241,0.08)', delay: 0 },
        { size: 160, top: '60%', left: '82%', color: 'rgba(167,139,250,0.07)', delay: 1.5 },
        { size: 120, top: '75%', left: '15%', color: 'rgba(129,140,248,0.06)', delay: 3 },
        { size: 90, top: '20%', left: '75%', color: 'rgba(52,211,153,0.05)', delay: 2 },
        { size: 180, top: '45%', left: '50%', color: 'rgba(99,102,241,0.05)', delay: 4 },
    ];

    return (
        <>
            {orbs.map((orb, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        width: orb.size,
                        height: orb.size,
                        top: orb.top,
                        left: orb.left,
                        background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
                        border: '1px solid rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(1px)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
                    }}
                    animate={{
                        y: [0, -20, 10, -15, 0],
                        x: [0, 12, -8, 5, 0],
                        scale: [1, 1.05, 0.97, 1.03, 1],
                    }}
                    transition={{
                        duration: 14 + i * 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: orb.delay,
                    }}
                />
            ))}
        </>
    );
}

/* ── Stagger text animation variants ────────────────────── */
const wordContainerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.04, delayChildren: 0.3 },
    },
};

const wordVariants = {
    hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
};

/* ── Floating feature pills ─────────────────────────────── */
function FloatingPill({
    icon,
    label,
    className,
    delay,
}: {
    icon: React.ReactNode;
    label: string;
    className?: string;
    delay: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
                duration: 0.6,
                delay,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className={className}
        >
            <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                    duration: 4 + delay,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full"
                style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(16px) saturate(1.3)',
                    WebkitBackdropFilter: 'blur(16px) saturate(1.3)',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    boxShadow:
                        '0 8px 32px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.8)',
                }}
            >
                <span className="text-indigo-600">{icon}</span>
                <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                    {label}
                </span>
            </motion.div>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════
   Landing Page — Hero Only
   ═══════════════════════════════════════════════════════════ */
export default function LandingPage() {
    const { openAuthDialog } = useUiStore();

    const headlineWords = ['Verify', 'identity'];
    const gradientWords = ['in', 'seconds'];
    const subWords = ['not', 'minutes'];

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* ── Background layers ────────────────────────── */}
            <MeshGradientCanvas />
            <DotGrid />
            <AuroraWaves />
            <FloatingOrbs />

            {/* ── Vignette edges ────────────────────────────── */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(ellipse at center, transparent 50%, rgba(248,250,252,0.8) 100%)',
                }}
            />

            {/* ── Hero content ──────────────────────────────── */}
            <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 lg:pt-40 pb-20">
                <div className="flex flex-col items-center text-center">

                    {/* ── Status pill ──────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: -16, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                            duration: 0.5,
                            ease: [0.25, 0.46, 0.45, 0.94],
                        }}
                        className="mb-8"
                    >
                        <div
                            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full"
                            style={{
                                background: 'rgba(255, 255, 255, 0.6)',
                                backdropFilter: 'blur(16px) saturate(1.3)',
                                WebkitBackdropFilter: 'blur(16px) saturate(1.3)',
                                border: '1px solid rgba(255, 255, 255, 0.5)',
                                boxShadow:
                                    '0 4px 20px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.7)',
                            }}
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                            <span className="text-xs font-semibold text-slate-600 tracking-wide">
                                AI-powered identity verification
                            </span>
                        </div>
                    </motion.div>

                    {/* ── Headline with per-word stagger ────────── */}
                    <motion.h1
                        variants={wordContainerVariants}
                        initial="hidden"
                        animate="visible"
                        className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.05] mb-7"
                    >
                        <span className="block">
                            {headlineWords.map((word, i) => (
                                <motion.span
                                    key={i}
                                    variants={wordVariants}
                                    className="inline-block text-slate-900 mr-[0.25em]"
                                >
                                    {word}
                                </motion.span>
                            ))}
                        </span>
                        <span className="block">
                            {gradientWords.map((word, i) => (
                                <motion.span
                                    key={i}
                                    variants={wordVariants}
                                    className="inline-block mr-[0.25em]"
                                    style={{
                                        background:
                                            'linear-gradient(135deg, #6366f1 0%, #818cf8 40%, #a78bfa 70%, #c4b5fd 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}
                                >
                                    {word}
                                </motion.span>
                            ))}
                            {subWords.map((word, i) => (
                                <motion.span
                                    key={`sub-${i}`}
                                    variants={wordVariants}
                                    className="inline-block text-slate-900 mr-[0.25em]"
                                >
                                    {word}
                                </motion.span>
                            ))}
                        </span>
                    </motion.h1>

                    {/* ── Subheadline ───────────────────────────── */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.65, delay: 0.6 }}
                        className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed"
                    >
                        Biometric face matching, liveness detection and ID document
                        verification — all in one secure, instant pipeline.
                    </motion.p>

                    {/* ── CTA buttons ───────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.75 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
                    >
                        <GlassButton
                            variant="primary"
                            size="lg"
                            onClick={() => openAuthDialog('register')}
                            iconRight={
                                <motion.span
                                    animate={{ x: [0, 4, 0] }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                    className="inline-flex"
                                >
                                    <ArrowRight size={18} strokeWidth={2} />
                                </motion.span>
                            }
                        >
                            Get started free
                        </GlassButton>
                        <GlassButton
                            variant="secondary"
                            size="lg"
                            onClick={() => openAuthDialog('login')}
                        >
                            Sign in
                        </GlassButton>
                    </motion.div>

                    {/* ── Trust indicators ──────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.9 }}
                        className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 mb-20"
                    >
                        {[
                            'No credit card required',
                            'GDPR compliant',
                            'End-to-end encrypted',
                        ].map((item) => (
                            <span
                                key={item}
                                className="flex items-center gap-2 text-xs font-medium text-slate-500"
                            >
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 14 14"
                                    fill="none"
                                    className="text-emerald-500"
                                >
                                    <circle
                                        cx="7"
                                        cy="7"
                                        r="6"
                                        stroke="currentColor"
                                        strokeWidth="1.2"
                                        fill="rgba(52,211,153,0.1)"
                                    />
                                    <path
                                        d="M4.5 7.2L6.2 9 9.5 5.5"
                                        stroke="currentColor"
                                        strokeWidth="1.3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                {item}
                            </span>
                        ))}
                    </motion.div>
                </div>
            </section>
        </div>
    );
}