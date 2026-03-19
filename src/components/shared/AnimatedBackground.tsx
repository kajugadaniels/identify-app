'use client';

import { motion } from 'framer-motion';

export function AnimatedBackground() {
    return (
        <div
            className="fixed inset-0 -z-10 overflow-hidden"
            style={{ backgroundColor: '#030712' }}
        >
            {/* ── Primary orb — indigo/purple ──────────────── */}
            <motion.div
                style={{
                    position: 'absolute',
                    top: '-160px',
                    left: '-160px',
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.15) 50%, transparent 70%)',
                    filter: 'blur(80px)',
                }}
                animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* ── Secondary orb — pink/rose ─────────────────── */}
            <motion.div
                style={{
                    position: 'absolute',
                    bottom: '-160px',
                    right: '-160px',
                    width: '500px',
                    height: '500px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, rgba(244,63,94,0.12) 50%, transparent 70%)',
                    filter: 'blur(80px)',
                }}
                animate={{ x: [0, -50, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            />

            {/* ── Tertiary orb — cyan center ────────────────── */}
            <motion.div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
            />

            {/* ── Subtle dot grid ───────────────────────────── */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.15,
                    backgroundImage: `radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)`,
                    backgroundSize: '32px 32px',
                }}
            />
        </div>
    );
}