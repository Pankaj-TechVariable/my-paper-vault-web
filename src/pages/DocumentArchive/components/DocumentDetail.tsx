import { createElement, useState } from "react";
import {
  MdOutlineEdit,
  MdOutlineDelete,
  MdOutlineDownload,
  MdClose,
  MdOutlineFolder,
  MdOutlineCalendarToday,
  MdOutlineStorage,
  MdOutlineInsertDriveFile,
  MdOutlineVisibility,
} from "react-icons/md";
import type { Document } from "@/api/endpoints/documents";
import type { Directory } from "@/api/endpoints/directories";
import { getCategoryStyle } from "@/constants/categoryStyles";
import { getMimeIcon, formatFileSize } from "@/utils/document.utils";
import ConfirmModal from "@/components/common/ConfirmModal/ConfirmModal";
import RenameDocumentModal from "./RenameDocumentModal";
import { useDownloadDocument, useViewDocument } from "@/hooks/useDocuments";
import DocumentViewer from "@/components/common/DocumentViewer/DocumentViewer";
import DetailRow from "./DetailRow";
import ActionIconButton from "./ActionIconButton";

interface DocumentDetailProps {
  document: Document;
  directory?: Directory;
  onClose: () => void;
  onRename: (doc: Document, newName: string, onSuccess: () => void) => void;
  onDelete: (doc: Document, onSuccess: () => void) => void;
  renameLoading?: boolean;
  deleteLoading?: boolean;
}

const DocumentDetail = ({
  document,
  directory,
  onClose,
  onRename,
  onDelete,
  renameLoading,
  deleteLoading,
}: DocumentDetailProps) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmRename, setConfirmRename] = useState(false);
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const download = useDownloadDocument();
  const view = useViewDocument();
  const style = getCategoryStyle(directory?.category?.type ?? "");

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
            value={directory?.name ?? "—"}
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
        </div>

        {/* Actions */}
        <div className="flex rounded-xl border border-slate-100 overflow-hidden divide-x divide-slate-100">
          <ActionIconButton
            icon={<MdOutlineVisibility size={18} />}
            label="View"
            onClick={() =>
              view.mutate(document.id, {
                onSuccess: (data) => {
                  if (data.success && data.data?.download_url)
                    setViewUrl(data.data.download_url);
                },
              })
            }
            loading={view.isPending}
          />
          <ActionIconButton
            icon={<MdOutlineDownload size={18} />}
            label="Download"
            onClick={() => download.mutate({ id: document.id, name: document.name })}
            loading={download.isPending}
          />
          <ActionIconButton
            icon={<MdOutlineEdit size={18} />}
            label="Rename"
            onClick={() => setConfirmRename(true)}
          />
          <ActionIconButton
            icon={<MdOutlineDelete size={18} />}
            label="Delete"
            onClick={() => setConfirmDelete(true)}
            destructive
          />
        </div>
      </div>

      {viewUrl && (
        <DocumentViewer
          url={viewUrl}
          filename={document.name}
          mimeType={document.mime_type}
          onClose={() => setViewUrl(null)}
        />
      )}

      {confirmRename && (
        <RenameDocumentModal
          document={document}
          onSave={(doc, newName) => {
            onRename(doc, newName, () => setConfirmRename(false));
          }}
          onCancel={() => setConfirmRename(false)}
          loading={renameLoading}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Delete document?"
          message={`"${document.name}" will be permanently deleted and cannot be recovered.`}
          confirmLabel="Delete"
          onConfirm={() => onDelete(document, () => setConfirmDelete(false))}
          onCancel={() => setConfirmDelete(false)}
          loading={deleteLoading}
          destructive
        />
      )}
    </>
  );
};

export default DocumentDetail;
