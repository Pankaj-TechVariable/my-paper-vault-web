import {
  HiCheckCircle,
  HiXCircle,
  HiInformationCircle,
  HiExclamation,
  HiX,
} from "react-icons/hi";
import type { ToastType } from "@/store/toastStore";
import { useToastStore } from "@/store/toastStore";

const CONFIG: Record<
  ToastType,
  { icon: React.ReactNode; containerClass: string; titleClass: string }
> = {
  success: {
    icon: <HiCheckCircle size={40} className="text-green-600" />,
    containerClass: "bg-green-50 border-green-200",
    titleClass: "text-green-800",
  },
  error: {
    icon: <HiXCircle size={40} className="text-red-600" />,
    containerClass: "bg-red-50 border-red-200",
    titleClass: "text-red-800",
  },
  info: {
    icon: <HiInformationCircle size={40} className="text-blue-600" />,
    containerClass: "bg-blue-50 border-blue-200",
    titleClass: "text-blue-800",
  },
  warning: {
    icon: <HiExclamation size={40} className="text-yellow-600" />,
    containerClass: "bg-yellow-50 border-yellow-200",
    titleClass: "text-yellow-800",
  },
};

const FullscreenToast = () => {
  const { fullscreen, hideFullscreen } = useToastStore();

  if (!fullscreen) return null;

  const { type, title, message, closable = true } = fullscreen;
  const style = CONFIG[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-8">
      <div className={`w-full max-w-sm rounded-3xl border p-8 bg-white ${style.containerClass}`}>
        <div className="mb-5 flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-white p-4 shadow-sm">
            {style.icon}
          </div>
          <p className={`text-xl font-bold ${style.titleClass}`}>{title}</p>
          {message && (
            <p className="mt-2 text-base text-slate-500">{message}</p>
          )}
        </div>

        {closable && (
          <button
            onClick={hideFullscreen}
            className="mt-2 w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-100 py-4 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <HiX size={16} /> Close
          </button>
        )}
      </div>
    </div>
  );
};

export default FullscreenToast;
