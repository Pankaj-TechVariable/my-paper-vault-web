import { useEffect, useRef, useState } from "react";
import { MdClose, MdOutlineDownload, MdOutlineDelete } from "react-icons/md";
import ConfirmModal from "@/components/common/ConfirmModal/ConfirmModal";
import ActionIconButton from "./ActionIconButton";

interface MultiSelectBarProps {
  count: number;
  onClearAll: () => void;
  onDownload: () => void;
  onDelete: () => void;
  deleteLoading?: boolean;
  variant: "panel" | "bar";
}

const MultiSelectBar = ({
  count,
  onClearAll,
  onDownload,
  onDelete,
  deleteLoading,
  variant,
}: MultiSelectBarProps) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const wasDeleting = useRef(false);

  useEffect(() => {
    if (deleteLoading) {
      wasDeleting.current = true;
    } else if (wasDeleting.current) {
      wasDeleting.current = false;
      setConfirmDelete(false);
    }
  }, [deleteLoading]);

  if (variant === "bar") {
    return (
      <div className="bg-white border-t border-slate-100 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-5 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onClearAll}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <MdClose size={18} />
          </button>
          <p className="text-sm font-semibold text-slate-800">
            {count} item{count !== 1 ? "s" : ""} selected
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onDownload}
            title="Download"
            className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <MdOutlineDownload size={20} />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            title="Delete"
            className="p-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <MdOutlineDelete size={20} />
          </button>
        </div>
        {confirmDelete && (
          <ConfirmModal
            title={`Delete ${count} item${count !== 1 ? "s" : ""}?`}
            message="These documents will be permanently deleted and cannot be recovered."
            confirmLabel="Delete"
            onConfirm={onDelete}
            onCancel={() => setConfirmDelete(false)}
            loading={deleteLoading}
            destructive
          />
        )}
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-800">
            {count} item{count !== 1 ? "s" : ""} selected
          </p>
          <button
            onClick={onClearAll}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <MdClose size={16} />
          </button>
        </div>
        <div className="flex rounded-xl border border-slate-100 overflow-hidden divide-x divide-slate-100">
          <ActionIconButton
            icon={<MdOutlineDownload size={18} />}
            label="Download"
            onClick={onDownload}
          />
          <ActionIconButton
            icon={<MdOutlineDelete size={18} />}
            label="Delete"
            onClick={() => setConfirmDelete(true)}
            destructive
          />
        </div>
      </div>

      {confirmDelete && (
        <ConfirmModal
          title={`Delete ${count} item${count !== 1 ? "s" : ""}?`}
          message="These documents will be permanently deleted and cannot be recovered."
          confirmLabel="Delete"
          onConfirm={onDelete}
          onCancel={() => setConfirmDelete(false)}
          destructive
        />
      )}
    </>
  );
};

export default MultiSelectBar;
