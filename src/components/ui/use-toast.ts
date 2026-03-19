// src/components/ui/use-toast.ts
// Thin wrapper around sonner so components can call useToast() / toast()
// with the same shadcn-style API ({ title, description, variant }).

import { toast as sonnerToast } from 'sonner';

interface ToastOptions {
    title: string;
    description?: string;
    variant?: 'default' | 'destructive';
}

function toast({ title, description, variant }: ToastOptions) {
    const message = description ? `${title} — ${description}` : title;
    if (variant === 'destructive') {
        sonnerToast.error(message);
    } else {
        sonnerToast.success(message);
    }
}

export function useToast() {
    return { toast };
}
