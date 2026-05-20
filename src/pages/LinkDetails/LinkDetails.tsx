import { createElement, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  MdOutlineArrowBack,
  MdOutlineContentCopy,
  MdOutlineLink,
  MdOutlineCalendarToday,
  MdOutlineStorage,
  MdOutlineInsertDriveFile,
  MdOutlineSchedule,
} from "react-icons/md";
import { FaLock } from "react-icons/fa6";
import { useUploadLink, useDeactivateUploadLink } from "@/hooks/useUploadLinks";
import { getCategoryStyle } from "@/constants/categoryStyles";
import { formatFileSize } from "@/utils/document.utils";
import Button from "@/components/common/Button/Button";
import ConfirmModal from "@/components/common/ConfirmModal/ConfirmModal";
import { toast } from "@/lib/toast";
import LinkDetailsSkeleton from "./components/LinkDetailsSkeleton";
import AuditLogItem from "./components/AuditLogItem";

interface LinkDetailsState {
  directoryName?: string;
  categoryType?: string;
}

const DetailRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
    <span className="text-slate-400 mt-0.5 shrink-0">{icon}</span>
    <div className="min-w-0">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-medium text-slate-800 break-all">{value}</p>
    </div>
  </div>
);

const LinkDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation() as { state: LinkDetailsState | null };
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);

  const { data, isLoading } = useUploadLink(id!);
  const { mutate: deactivate, isPending: isDeactivating } = useDeactivateUploadLink();

  const link = data?.data;
  const style = getCategoryStyle(link?.directory.category.type ?? state?.categoryType ?? "");

  const expiresAt = link ? new Date(link.expires_at) : null;
  const isExpired = expiresAt ? expiresAt < new Date() : false;
  const isActive = !!link?.is_active && !isExpired;

  const formattedExpiry = expiresAt?.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }) ?? "—";

  const formattedCreated = link
    ? new Date(link.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const uploadedCount = link?.uploaded_count ?? 0;
  const maxCount = link?.max_file_count ?? 1;
  const progressPercent = Math.min(Math.round((uploadedCount / maxCount) * 100), 100);
  const progressColor =
    progressPercent >= 80 ? "bg-red-500" : progressPercent >= 60 ? "bg-amber-500" : "bg-green-500";

  const handleCopy = async () => {
    if (!link?.share_url) return;
    await navigator.clipboard.writeText(link.share_url);
    toast.success("Link copied to clipboard");
  };

  const handleDeactivate = () => {
    deactivate(id!, {
      onSuccess: () => setConfirming(false),
    });
  };

  const directoryName = link?.directory.name ?? state?.directoryName ?? "Link Details";

  return (
    <>
      <div className="h-full flex flex-col overflow-hidden px-4 md:px-8 py-6">
        {/* Back */}
        <div className="mb-5 shrink-0">
          <button
            onClick={() => navigate("/my-links")}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 mb-4 transition-colors cursor-pointer"
          >
            <MdOutlineArrowBack size={14} />
            Back to My Links
          </button>

          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.bgColor}`}
              >
                {createElement(style.icon, { size: 16, color: style.iconColor })}
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-slate-900 truncate">{directoryName}</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {link?.is_pin_protected && (
                    <span className="flex items-center gap-1 text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
                      <FaLock size={9} />
                      PIN
                    </span>
                  )}
                  {isLoading ? (
                    <div className="h-5 w-14 bg-slate-100 rounded-full animate-pulse" />
                  ) : isActive ? (
                    <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">
                      {isExpired ? "Expired" : "Inactive"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {isActive && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopy}
                  title="Copy link"
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <MdOutlineContentCopy size={15} />
                </button>
                <Button
                  label="Deactivate"
                  variant="outlined"
                  className="h-auto! py-1! px-2.5! rounded-lg! border-red-200! text-xs!"
                  labelClassName="text-red-500!"
                  loading={isDeactivating}
                  onClick={() => setConfirming(true)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <LinkDetailsSkeleton />
          ) : link ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:items-start">
              {/* Left column: info + progress */}
              <div className="flex flex-col gap-4">
                {/* Link info */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-center gap-1.5 bg-blue-50 rounded-lg px-2.5 py-2 mb-3">
                    <MdOutlineLink size={13} className="text-blue-400 shrink-0" />
                    <p className="text-xs text-blue-600 break-all">{link.share_url}</p>
                  </div>
                  <div className="px-1">
                    <DetailRow
                      icon={<MdOutlineCalendarToday size={15} />}
                      label="Created"
                      value={formattedCreated}
                    />
                    <DetailRow
                      icon={<MdOutlineSchedule size={15} />}
                      label={isExpired ? "Expired on" : "Expires on"}
                      value={formattedExpiry}
                    />
                    <DetailRow
                      icon={<MdOutlineStorage size={15} />}
                      label="Max file size"
                      value={formatFileSize(link.max_file_size)}
                    />
                    {link.is_pin_protected && (
                      <DetailRow
                        icon={<FaLock size={13} />}
                        label="PIN Protection"
                        value="Enabled"
                      />
                    )}
                  </div>
                </div>

                {/* Progress */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-center gap-1.5 mb-3">
                    <MdOutlineInsertDriveFile size={15} className="text-slate-400" />
                    <p className="text-sm font-semibold text-slate-800">Upload Slots</p>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">
                      <span className="font-semibold text-slate-800">{uploadedCount}</span> of{" "}
                      <span className="font-semibold text-slate-800">{maxCount}</span> files uploaded
                    </span>
                    <span className="text-xs text-slate-400">
                      {maxCount - uploadedCount} slot{maxCount - uploadedCount !== 1 ? "s" : ""} remaining
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 text-right">{progressPercent}%</p>
                </div>
              </div>

              {/* Right column: upload history */}
              <div className="bg-white rounded-2xl border border-slate-100 p-4">
                <p className="text-sm font-semibold text-slate-800 mb-1">
                  Upload History
                  {link.auditLogs.length > 0 && (
                    <span className="ml-1.5 text-xs font-normal text-slate-400">
                      ({link.auditLogs.length})
                    </span>
                  )}
                </p>

                {link.auditLogs.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    <p className="text-sm">No uploads yet</p>
                    <p className="text-xs mt-1">Documents uploaded via this link will appear here.</p>
                  </div>
                ) : (
                  <div>
                    {link.auditLogs.map((log) => (
                      <AuditLogItem key={log.id} log={log} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {confirming && (
        <ConfirmModal
          title="Deactivate Link"
          message={`Deactivate the upload link for "${directoryName}"? Anyone with this link will no longer be able to upload.`}
          confirmLabel="Deactivate"
          onConfirm={handleDeactivate}
          onCancel={() => setConfirming(false)}
          loading={isDeactivating}
          destructive
        />
      )}
    </>
  );
};

export default LinkDetails;
