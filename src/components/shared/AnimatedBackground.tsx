'use client';

import { motion } from 'framer-motion';

export function AnimatedBackground() {
    return (
        <div
            className="fixed inset-0 -z-10 overflow-hidden"
            style={{ backgroundColor: '#f1f5f9' }}
        >
            {/* ── Primary orb — indigo ──────────────────────── */}
            <motion.div
                style={{
                    position: 'absolute',
                    top: '-120px',
                    left: '-120px',
                    width: '560px',
                    height: '560px',
                    borderRadius: '50%',
                    backgroundColor: '#6366f1',
                    opacity: 0.10,
                    filter: 'blur(80px)',
                }}
                animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* ── Secondary orb — violet ─────────────────────── */}
            <motion.div
                style={{
                    position: 'absolute',
                    bottom: '-120px',
                    right: '-120px',
                    width: '480px',
                    height: '480px',
                    borderRadius: '50%',
                    backgroundColor: '#a78bfa',
                    opacity: 0.10,
                    filter: 'blur(80px)',
                }}
                animate={{ x: [0, -50, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            />

            {/* ── Tertiary orb — sky blue center ─────────────── */}
            <motion.div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '380px',
                    height: '380px',
                    borderRadius: '50%',
                    backgroundColor: '#38bdf8',
                    opacity: 0.07,
                    filter: 'blur(70px)',
                }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.07, 0.12, 0.07] }}
                transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
            />

            {/* ── Subtle dot grid — SVG data URI (no CSS gradients) ── */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.6,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1' fill='%23cbd5e1'/%3E%3C/svg%3E")`,
                    backgroundSize: '32px 32px',
                }}
            />
        </div>
    );
}
