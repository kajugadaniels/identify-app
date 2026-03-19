import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AnimatedBackground } from '@/components/shared/AnimatedBackground';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'VerifyID — Secure Identity Verification',
    description: 'AI-powered identity verification using biometric face matching',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        // No 'dark' class needed — globals.css sets color-scheme: dark on html
        <html lang="en">
            <body className={`${inter.className} min-h-screen antialiased`}>

                {/* Animated gradient — sits behind everything via fixed positioning */}
                <AnimatedBackground />

                {/* Page content — z-10 sits above the background */}
                <main className="relative" style={{ zIndex: 10 }}>
                    {children}
                </main>

                {/* Global toast notifications */}
                <Toaster />

            </body>
        </html>
    );
}