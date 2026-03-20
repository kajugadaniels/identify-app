import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { AnimatedBackground } from '@/components/shared/AnimatedBackground';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { Toaster } from '@/components/ui/sonner';

const dmSans = DM_Sans({
    subsets: ['latin'],
    variable: '--font-dm-sans',
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
        <html lang="en">
            <body className={`${dmSans.variable} min-h-screen antialiased`} suppressHydrationWarning>
                <AnimatedBackground />
                <div className="relative" style={{ zIndex: 10 }}>
                    <Navbar />
                    <main>{children}</main>
                </div>
                <AuthDialog />
                <Toaster />
            </body>
        </html>
    );
}
