import { createElement } from "react";
import { MdOutlineChevronRight } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import type { VaultGrantor, VaultDirectory } from "@/api/endpoints/familyVaults";
import { getCategoryStyle } from "@/constants/categoryStyles";

// ── Helpers ────────────────────────────────────────────────────────────────────

const getInitials = (name: string): string => {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const AVATAR_COLORS = [
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
];

const getAvatarColor = (email: string) =>
  AVATAR_COLORS[email.charCodeAt(0) % AVATAR_COLORS.length];

// ── Sub-components ─────────────────────────────────────────────────────────────

interface PermissionBadgeProps {
  label: string;
  colorClass: string;
}

const PermissionBadge = ({ label, colorClass }: PermissionBadgeProps) => (
  <span
    className={`inline-flex items-center text-xs px-1.5 py-0.5 rounded-full font-medium ${colorClass}`}
  >
    {label}
  </span>
);

interface DirectoryRowProps {
  directory: VaultDirectory;
  grantorName: string;
}

const DirectoryRow = ({ directory, grantorName }: DirectoryRowProps) => {
  const navigate = useNavigate();
  const style = getCategoryStyle(directory.category?.type ?? "");

  const handleClick = () => {
    navigate(`/vaults/directory/${directory.id}`, {
      state: {
        grantorName,
        directoryName: directory.name,
        categoryType: directory.category?.type ?? "",
        categoryName: directory.category?.name ?? "",
      },
    });
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-start gap-2.5 rounded-xl p-1.5 -mx-1.5 hover:bg-slate-50 transition-colors cursor-pointer"
    >
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${style.bgColor}`}
      >
        {createElement(style.icon, { size: 13, color: style.iconColor })}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center flex-wrap gap-1 mb-1">
          <span className="text-xs font-medium text-slate-800 truncate max-w-[120px]">
            {directory.name}
          </span>
          {directory.can_view && (
            <PermissionBadge
              label="View"
              colorClass="bg-blue-50 text-blue-600"
            />
          )}
          {directory.can_upload && (
            <PermissionBadge
              label="Upload"
              colorClass="bg-green-50 text-green-600"
            />
          )}
          {directory.can_download && (
            <PermissionBadge
              label="Download"
              colorClass="bg-purple-50 text-purple-600"
            />
          )}
          {!directory.is_active && (
            <PermissionBadge
              label="Inactive"
              colorClass="bg-slate-100 text-slate-400"
            />
          )}
        </div>
        <p className="text-xs text-slate-400">
          {directory.document_count}{" "}
          {directory.document_count === 1 ? "document" : "documents"}
        </p>
      </div>

      <MdOutlineChevronRight size={16} className="text-slate-300 shrink-0 mt-0.5" />
    </div>
  );
};

// ── VaultCard ──────────────────────────────────────────────────────────────────

interface VaultCardProps {
  grantor: VaultGrantor;
}

const VaultCard = ({ grantor }: VaultCardProps) => {
  const totalDocs = grantor.directories.reduce(
    (sum, d) => sum + d.document_count,
    0,
  );
  const activeCount = grantor.directories.filter((d) => d.is_active).length;
  const avatarColor = getAvatarColor(grantor.email);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5 flex flex-col">
      {/* Grantor header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-semibold text-sm ${avatarColor}`}
        >
          {getInitials(grantor.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {grantor.name}
          </p>
          <p className="text-xs text-slate-400 truncate">{grantor.email}</p>
        </div>
        <span className="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-600">
          {grantor.directories.length}{" "}
          {grantor.directories.length === 1 ? "folder" : "folders"}
        </span>
      </div>

      <div className="h-px bg-slate-100 mb-3" />

      {/* Directories */}
      <div className="flex flex-col gap-3 flex-1">
        {grantor.directories.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-2">
            No folders shared
          </p>
        ) : (
          grantor.directories.map((dir) => (
            <DirectoryRow key={dir.id} directory={dir} grantorName={grantor.name} />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {totalDocs} {totalDocs === 1 ? "document" : "documents"} accessible
        </span>
        <span className="text-xs font-medium text-slate-500">
          {activeCount} active
        </span>
      </div>
    </div>
  );
};

export default VaultCard;
