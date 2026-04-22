import { toast as sonner } from "sonner";
import { useToastStore, type ToastConfig, type FullscreenToastConfig } from "@/store/toastStore";

const DEFAULT_DURATION = 3500;

type ToastOpts = Partial<Omit<ToastConfig, "type">> & { duration?: number };

function show(type: ToastConfig["type"], title: string, optsOrMessage?: ToastOpts | string) {
  const opts: ToastOpts = typeof optsOrMessage === "string"
    ? { message: optsOrMessage }
    : optsOrMessage ?? {};

  const { message, duration = DEFAULT_DURATION, closable = true } = opts;
  const options = {
    description: message,
    duration: duration === 0 ? Infinity : duration,
    closeButton: closable,
  };

  switch (type) {
    case "success": return sonner.success(title, options);
    case "error":   return sonner.error(title, options);
    case "warning": return sonner.warning(title, options);
    case "info":    return sonner.info(title, options);
  }
}

export const toast = {
  success: (title: string, optsOrMessage?: ToastOpts | string) => show("success", title, optsOrMessage),
  error:   (title: string, optsOrMessage?: ToastOpts | string) => show("error",   title, optsOrMessage),
  info:    (title: string, optsOrMessage?: ToastOpts | string) => show("info",    title, optsOrMessage),
  warning: (title: string, optsOrMessage?: ToastOpts | string) => show("warning", title, optsOrMessage),
  fullscreen: (config: FullscreenToastConfig) => useToastStore.getState().showFullscreen(config),
};
