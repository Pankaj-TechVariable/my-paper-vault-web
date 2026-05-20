import { createElement, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdOutlineContentCopy,
  MdOutlineLink,
  MdOutlineInsertDriveFile,
  MdOutlineStorage,
  MdOutlineCalendarToday,
} from "react-icons/md";
import { FaLock } from "react-icons/fa6";
import type { UploadLink } from "@/api/endpoints/uploadLinksPrivate";
import { getCategoryStyle } from "@/constants/categoryStyles";
import { formatFileSize } from "@/utils/document.utils";
import Button from "@/components/common/Button/Button";
import ConfirmModal from "@/components/common/ConfirmModal/ConfirmModal";
import { useDeactivateUploadLink } from "@/hooks/useUploadLinks";
import { toast } from "@/lib/toast";

interface LinkItemProps {
  link: UploadLink;
}

const LinkItem = ({ link }: LinkItemProps) => {
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const { mutate: deactivate, isPending } = useDeactivateUploadLink();

  const style = getCategoryStyle(link.directory.category.type);
  const expiresAt = new Date(link.expires_at);
  const isExpired = expiresAt < new Date();

  const formattedExpiry = expiresAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link.share_url);
    toast.success("Link copied to clipboard");
  };

  const handleDeactivate = () => {
    deactivate(link.id, { onSuccess: () => setConfirming(false) });
  };

  const handleNavigate = () => {
    navigate(`/my-links/${link.id}`, {
      state: {
        directoryName: link.directory.name,
        categoryType: link.directory.category.type,
      },
    });
  };

  return (
    <>
      <div
        onClick={handleNavigate}
        className="relative flex items-start gap-3 p-4 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/50 transition-colors cursor-pointer"
      >
        {link.is_active && !isExpired && (
          <button
            onClick={(e) => { e.stopPropagation(); handleCopy(); }}
            title="Copy link"
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <MdOutlineContentCopy size={15} />
          </button>
        )}

        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.bgColor}`}
        >
          {createElement(style.icon, { size: 16, color: style.iconColor })}
        </div>

        <div className={`flex-1 min-w-0 ${link.is_active && !isExpired ? "pr-10" : ""}`}>
          <p className="text-sm font-semibold text-slate-900 truncate">
            {link.directory.name}
          </p>

          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
              {link.directory.category.name}
            </span>
            {link.is_pin_protected && (
              <span className="flex items-center gap-1 text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
                <FaLock size={9} />
                PIN
              </span>
            )}
            {link.is_active && !isExpired ? (
              <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">
                Active
              </span>
            ) : (
              <span className="text-xs bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">
                {isExpired ? "Expired" : "Inactive"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-1.5 min-w-0 bg-blue-50 rounded-lg px-2 py-1">
            <MdOutlineLink size={13} className="text-blue-400 shrink-0" />
            <p className="text-xs text-blue-600 truncate">{link.share_url}</p>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <MdOutlineInsertDriveFile size={13} className="shrink-0" />
              {link.uploaded_count}/{link.max_file_count} files
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <MdOutlineStorage size={13} className="shrink-0" />
              {formatFileSize(link.max_file_size)} max
            </span>
            <span className={`flex items-center gap-1 text-xs ${isExpired ? "text-red-400" : "text-slate-400"}`}>
              <MdOutlineCalendarToday size={13} className="shrink-0" />
              {isExpired ? "Expired" : "Expires"} {formattedExpiry}
            </span>
          </div>

          {link.is_active && !isExpired && (
            <div className="mt-3" onClick={(e) => e.stopPropagation()}>
              <Button
                label="Deactivate"
                variant="outlined"
                className="h-auto! py-1! px-2.5! rounded-lg! border-red-200! text-xs!"
                labelClassName="text-red-500!"
                loading={isPending}
                onClick={() => setConfirming(true)}
              />
            </div>
          )}
        </div>
      </div>

      {confirming && (
        <ConfirmModal
          title="Deactivate Link"
          message={`Deactivate the upload link for "${link.directory.name}"? Anyone with this link will no longer be able to upload.`}
          confirmLabel="Deactivate"
          onConfirm={handleDeactivate}
          onCancel={() => setConfirming(false)}
          loading={isPending}
          destructive
        />
      )}
    </>
  );
};

export default LinkItem;
