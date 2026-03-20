import { create } from 'zustand';

type AuthDialogTab = 'login' | 'register';

interface UiState {
    isAuthDialogOpen: boolean;
    authDialogTab: AuthDialogTab;
    openAuthDialog: (tab?: AuthDialogTab) => void;
    closeAuthDialog: () => void;
}

export const useUiStore = create<UiState>((set) => ({
    isAuthDialogOpen: false,
    authDialogTab: 'login',

    openAuthDialog: (tab = 'login') =>
        set({ isAuthDialogOpen: true, authDialogTab: tab }),

    closeAuthDialog: () =>
        set({ isAuthDialogOpen: false }),
}));
