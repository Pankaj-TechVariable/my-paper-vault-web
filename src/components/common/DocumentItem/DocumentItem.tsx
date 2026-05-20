import { createElement } from "react";
import { MdCheckCircle, MdRadioButtonUnchecked } from "react-icons/md";
import {
  FaChevronRight,
  FaCalendar,
  FaDatabase,
  FaUser,
  FaLink,
} from "react-icons/fa6";
import type { Document } from "@/api/endpoints/documents";
import type { Directory } from "@/api/endpoints/directories";
import { getCategoryStyle } from "@/constants/categoryStyles";
import { formatFileSize, getMimeIcon } from "@/utils/document.utils";

interface DocumentItemProps {
  document: Document;
  directory?: Directory;
  onClick?: (doc: Document) => void;
  onCheckToggle?: (doc: Document) => void;
  isSelected?: boolean;
  showCheckbox?: boolean;
  isChecked?: boolean;
  hideCheckbox?: boolean;
}

const DocumentItem = ({
  document,
  directory,
  onClick,
  onCheckToggle,
  isSelected,
  showCheckbox,
  isChecked,
  hideCheckbox,
}: DocumentItemProps) => {
  const categoryStyle = getCategoryStyle(directory?.category?.type ?? "");

  const date = new Date(document.created_at).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleCheckClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCheckToggle?.(document);
  };

  return (
    <div
      onClick={() => onClick?.(document)}
      className={`group flex items-center gap-4 p-4 rounded-2xl border transition-colors cursor-pointer ${
        isChecked
          ? "border-primary bg-blue-50"
          : isSelected
            ? "border-primary bg-blue-50"
            : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
      }`}
    >
      {/* Icon / checkbox toggle area */}
      <div
        onClick={handleCheckClick}
        className="relative w-11 h-11 shrink-0 cursor-pointer"
      >
        {/* Mime icon */}
        <div
          className={`absolute inset-0 rounded-xl flex items-center justify-center transition-opacity ${categoryStyle.bgColor} ${
            hideCheckbox
              ? ""
              : showCheckbox
                ? "[@media(hover:none)]:opacity-0 [@media(hover:hover)]:opacity-0"
                : "[@media(hover:hover)]:group-hover:opacity-0"
          }`}
        >
          {createElement(getMimeIcon(document.mime_type), {
            size: 20,
            color: categoryStyle.iconColor,
          })}
        </div>

        {/* Checkbox — touch: only when multiselect active; pointer: hover-reveal or multiselect */}
        {!hideCheckbox && (
          <div
            className={`absolute inset-0 items-center justify-center transition-opacity ${
              showCheckbox
                ? "flex opacity-100"
                : "hidden [@media(hover:hover)]:flex opacity-0 group-hover:opacity-100"
            }`}
          >
            {isChecked ? (
              <MdCheckCircle size={26} className="text-primary" />
            ) : (
              <MdRadioButtonUnchecked size={26} className="text-slate-300" />
            )}
          </div>
        )}
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
            <FaUser size={10} color="#475569" />
            {document.uploaded_by ?? "Owner"}
          </span>
          {document.uploaded_via_link_id && (
            <span className="flex items-center gap-1 text-xs font-medium text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-full">
              <FaLink size={9} /> Via Link
            </span>
          )}
        </div>
      </div>

      {!showCheckbox && (
        <FaChevronRight size={13} className="text-slate-300 shrink-0" />
      )}
    </div>
  );
};

export default DocumentItem;
