import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { AnimatedBackground } from '@/components/shared/AnimatedBackground';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

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
        <html lang="en">
            <body className={`${inter.className} min-h-screen antialiased`}>
                <AnimatedBackground />
                <div className="relative" style={{ zIndex: 10 }}>
                    <Navbar />
                    <main>{children}</main>
                </div>
                <Toaster />
            </body>
        </html>
    );
}