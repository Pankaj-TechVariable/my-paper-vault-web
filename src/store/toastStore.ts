import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastConfig {
  type: ToastType;
  title: string;
  message?: string;
  closable?: boolean;
}

export interface FullscreenToastConfig extends ToastConfig {
  closable?: boolean;
}

interface ToastState {
  fullscreen: FullscreenToastConfig | null;
  showFullscreen: (config: FullscreenToastConfig) => void;
  hideFullscreen: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  fullscreen: null,
  showFullscreen: (config) => set({ fullscreen: config }),
  hideFullscreen: () => set({ fullscreen: null }),
}));
