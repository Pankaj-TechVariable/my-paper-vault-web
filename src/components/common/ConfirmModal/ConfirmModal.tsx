import { MdClose } from "react-icons/md";
import Button from "@/components/common/Button/Button";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  destructive?: boolean;
}

const ConfirmModal = ({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading,
  destructive,
}: ConfirmModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    />
    <div className="relative bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <button
          onClick={onCancel}
          className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
        >
          <MdClose size={16} />
        </button>
      </div>

      <p className="text-sm text-slate-500">{message}</p>

      <div className="flex gap-2">
        <Button
          label={cancelLabel}
          variant="outlined"
          onClick={onCancel}
          className="flex-1"
          disabled={loading}
        />
        <Button
          label={confirmLabel}
          variant="contained"
          onClick={onConfirm}
          loading={loading}
          className={`flex-1 ${destructive ? "bg-red-500 border-red-500 hover:bg-red-600" : ""}`}
        />
      </div>
    </div>
  </div>
);

export default ConfirmModal;
