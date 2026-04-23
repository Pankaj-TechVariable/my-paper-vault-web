import { createElement } from "react";
import {
  FaChevronRight,
  FaCalendar,
  FaDatabase,
  FaUser,
} from "react-icons/fa6";
import type { Document } from "@/api/endpoints/documents";
import type { Directory } from "@/api/endpoints/directories";
import { getCategoryStyle } from "@/constants/categoryStyles";
import { formatFileSize, getMimeIcon } from "@/utils/document.utils";

interface DocumentItemProps {
  document: Document;
  directory?: Directory;
  onClick?: (doc: Document) => void;
  isSelected?: boolean;
}

const DocumentItem = ({ document, directory, onClick, isSelected }: DocumentItemProps) => {
  const categoryStyle = getCategoryStyle(directory?.category?.type ?? "");

  const date = new Date(document.created_at).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      onClick={() => onClick?.(document)}
      className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors cursor-pointer ${
        isSelected
          ? "border-primary bg-blue-50"
          : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
      }`}
    >
      {/* Mime icon with category color */}
      <div
        className={`w-11 h-11 shrink-0 flex items-center justify-center rounded-xl ${categoryStyle.bgColor}`}
      >
        {createElement(getMimeIcon(document.mime_type), {
          size: 20,
          color: categoryStyle.iconColor,
        })}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">
          {document.name}
        </p>

        {directory && (
          <span
            className={`inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold ${categoryStyle.bgColor}`}
            style={{ color: categoryStyle.iconColor }}
          >
            {createElement(categoryStyle.icon, {
              size: 11,
              color: categoryStyle.iconColor,
            })}
            {directory.name}
          </span>
        )}

        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <FaCalendar size={10} color="#475569" /> {date}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <FaDatabase size={10} color="#475569" />{" "}
            {formatFileSize(document.file_size)}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <FaUser size={10} color="#475569" /> Owner
          </span>
        </div>
      </div>

      <FaChevronRight size={13} className="text-slate-300 shrink-0" />
    </div>
  );
};

export default DocumentItem;
