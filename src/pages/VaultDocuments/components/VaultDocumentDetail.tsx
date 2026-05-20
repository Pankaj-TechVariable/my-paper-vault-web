import { createElement, useState } from "react";
import {
  MdClose,
  MdOutlineFolder,
  MdOutlineCalendarToday,
  MdOutlineStorage,
  MdOutlineInsertDriveFile,
  MdOutlineVisibility,
  MdOutlinePerson,
  MdOutlineLink,
} from "react-icons/md";
import type { Document } from "@/api/endpoints/documents";
import { getCategoryStyle } from "@/constants/categoryStyles";
import { getMimeIcon, formatFileSize } from "@/utils/document.utils";
import { useViewDocument } from "@/hooks/useDocuments";
import DocumentViewer from "@/components/common/DocumentViewer/DocumentViewer";

// ── DetailRow ──────────────────────────────────────────────────────────────────

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
      <p className="text-sm font-medium text-slate-800 truncate">{value}</p>
    </div>
  </div>
);

// ── Spinner ────────────────────────────────────────────────────────────────────

const Spinner = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);

// ── VaultDocumentDetail ────────────────────────────────────────────────────────

interface VaultDocumentDetailProps {
  document: Document;
  directoryName?: string;
  categoryType?: string;
  onClose: () => void;
}

const VaultDocumentDetail = ({
  document,
  directoryName,
  categoryType,
  onClose,
}: VaultDocumentDetailProps) => {
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const view = useViewDocument();

  const style = getCategoryStyle(categoryType ?? "");
  const date = new Date(document.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${style.bgColor}`}
            >
              {createElement(getMimeIcon(document.mime_type), {
                size: 20,
                color: style.iconColor,
              })}
            </div>
            <p className="text-sm font-semibold text-slate-800 truncate">
              {document.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <MdClose size={16} />
          </button>
        </div>

        {/* Details */}
        <div className="rounded-xl bg-slate-50 px-3">
          <DetailRow
            icon={<MdOutlineFolder size={15} />}
            label="Category"
            value={directoryName ?? "—"}
          />
          <DetailRow
            icon={<MdOutlineCalendarToday size={15} />}
            label="Date Added"
            value={date}
          />
          <DetailRow
            icon={<MdOutlineStorage size={15} />}
            label="File Size"
            value={formatFileSize(document.file_size)}
          />
          <DetailRow
            icon={<MdOutlineInsertDriveFile size={15} />}
            label="File Type"
            value={document.mime_type}
          />
          {document.uploaded_by && (
            <DetailRow
              icon={<MdOutlinePerson size={15} />}
              label="Uploaded By"
              value={document.uploaded_by}
            />
          )}
          {document.uploaded_via_link_id && (
            <DetailRow
              icon={<MdOutlineLink size={15} />}
              label="Source"
              value="Via Link"
            />
          )}
        </div>

        {/* View action */}
        <button
          onClick={() =>
            view.mutate(document.id, {
              onSuccess: (data) => {
                if (data.success && data.data?.download_url)
                  setViewUrl(data.data.download_url);
              },
            })
          }
          disabled={view.isPending}
          className="flex flex-col items-center gap-1 w-full py-3 rounded-xl text-slate-500 hover:bg-slate-100 border border-slate-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {view.isPending ? (
            <Spinner />
          ) : (
            <MdOutlineVisibility size={18} />
          )}
          <span className="text-[10px] font-medium">View</span>
        </button>
      </div>

      {viewUrl && (
        <DocumentViewer
          url={viewUrl}
          filename={document.name}
          mimeType={document.mime_type}
          onClose={() => setViewUrl(null)}
        />
      )}
    </>
  );
};

export default VaultDocumentDetail;
