import { useState } from "react";
import { MdOutlinePerson, MdOutlineVisibility } from "react-icons/md";
import type { AuditLog } from "@/api/endpoints/uploadLinksPrivate";
import { useViewDocument } from "@/hooks/useDocuments";
import DocumentViewer from "@/components/common/DocumentViewer/DocumentViewer";

interface AuditLogItemProps {
  log: AuditLog;
}

const Spinner = () => (
  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);

const getMimeTypeFromUrl = (url: string): string => {
  const path = url.split("?")[0].toLowerCase();
  if (path.endsWith(".pdf")) return "application/pdf";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".gif")) return "image/gif";
  if (path.endsWith(".webp")) return "image/webp";
  return "application/pdf";
};

const AuditLogItem = ({ log }: AuditLogItemProps) => {
  const [viewerState, setViewerState] = useState<{
    url: string;
    mimeType: string;
  } | null>(null);
  const { mutate: view, isPending } = useViewDocument();

  const handleView = () => {
    if (!log.document_id) return;
    view(log.document_id, {
      onSuccess: (data) => {
        if (data.success && data.data?.download_url) {
          const url = data.data.download_url;
          setViewerState({ url, mimeType: getMimeTypeFromUrl(url) });
        }
      },
    });
  };

  const date = new Date(log.created_at).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const filename = log.uploader_name
    ? `Upload by ${log.uploader_name}`
    : "Document";

  return (
    <>
      <div className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
          <MdOutlinePerson size={16} className="text-slate-400" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 truncate">
            {log.uploader_name ?? "Anonymous"}
          </p>
          <p className="text-xs text-slate-400">{date}</p>
          {log.uploader_ip && (
            <p className="text-xs text-slate-400 font-mono">{log.uploader_ip}</p>
          )}
        </div>

        {log.document_id && (
          <button
            onClick={handleView}
            disabled={isPending}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary px-2.5 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {isPending ? <Spinner /> : <MdOutlineVisibility size={14} />}
            View
          </button>
        )}
      </div>

      {viewerState && (
        <DocumentViewer
          url={viewerState.url}
          filename={filename}
          mimeType={viewerState.mimeType}
          onClose={() => setViewerState(null)}
        />
      )}
    </>
  );
};

export default AuditLogItem;
