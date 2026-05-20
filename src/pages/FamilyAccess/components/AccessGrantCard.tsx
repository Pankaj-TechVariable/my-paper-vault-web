import { createElement, useState } from "react";
import type {
  AccessGrant,
  AccessGrantDirectory,
} from "@/api/endpoints/familyAccess";
import { getCategoryStyle } from "@/constants/categoryStyles";
import { useRevokeAccess } from "@/hooks/useFamilyAccess";
import Button from "@/components/common/Button/Button";
import ConfirmModal from "@/components/common/ConfirmModal/ConfirmModal";

interface PermissionBadgeProps {
  label: string;
  colorClass: string;
}

const PermissionBadge = ({ label, colorClass }: PermissionBadgeProps) => (
  <span
    className={`inline-flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full font-medium ${colorClass}`}
  >
    {label}
  </span>
);

interface DirectoryRowProps {
  directory: AccessGrantDirectory;
  memberId: string;
  onRevoke: (directoryId: string, memberId: string) => void;
  isRevoking: boolean;
}

const DirectoryRow = ({
  directory,
  memberId,
  onRevoke,
  isRevoking,
}: DirectoryRowProps) => {
  const [confirming, setConfirming] = useState(false);
  const style = getCategoryStyle(directory.category?.type ?? "");

  return (
    <div className="flex items-start gap-2.5">
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
        </div>
        <p className="text-xs text-slate-400">
          {directory.document_count}{" "}
          {directory.document_count === 1 ? "document" : "documents"}
        </p>
      </div>
      {!directory.is_active && (
        <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400 font-medium shrink-0">
          Inactive
        </span>
      )}
      <Button
        label="Revoke"
        disabled={isRevoking}
        onClick={() => setConfirming(true)}
        className="shrink-0 h-auto! py-1! px-2.5! rounded-lg! bg-red-600 text-xs!"
      />
      {confirming && (
        <ConfirmModal
          title="Revoke access"
          message={`Remove ${directory.name} access for this member? They will no longer be able to view or manage documents in this folder.`}
          confirmLabel="Revoke"
          onConfirm={() => {
            setConfirming(false);
            onRevoke(directory.id, memberId);
          }}
          onCancel={() => setConfirming(false)}
          loading={isRevoking}
          destructive
        />
      )}
    </div>
  );
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-purple-100 text-purple-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
];

const getAvatarColor = (email: string): string => {
  const idx = email.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
};

interface AccessGrantCardProps {
  grant: AccessGrant;
}

const AccessGrantCard = ({ grant }: AccessGrantCardProps) => {
  const { mutate: revoke, isPending, variables } = useRevokeAccess();
  const totalDocs = grant.directories.reduce(
    (sum, d) => sum + d.document_count,
    0,
  );
  const avatarColor = getAvatarColor(grant.email);

  const handleRevoke = (directoryId: string, memberId: string) => {
    revoke({ directoryId, memberId });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5 flex flex-col">
      {/* Member header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-semibold text-sm ${avatarColor}`}
        >
          {getInitials(grant.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {grant.name}
          </p>
          <p className="text-xs text-slate-400 truncate">{grant.email}</p>
        </div>
        <span className="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-primary">
          {grant.directories.length}{" "}
          {grant.directories.length === 1 ? "category" : "categories"}
        </span>
      </div>

      <div className="h-px bg-slate-100 mb-3" />

      {/* Directories */}
      <div className="flex flex-col gap-3 flex-1">
        {grant.directories.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-2">
            No categories shared
          </p>
        ) : (
          grant.directories.map((dir) => (
            <DirectoryRow
              key={dir.id}
              directory={dir}
              memberId={grant.id}
              onRevoke={handleRevoke}
              isRevoking={isPending && variables?.directoryId === dir.id}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {totalDocs} {totalDocs === 1 ? "document" : "documents"} accessible
        </span>
        <span className="text-xs font-medium text-slate-500">
          {grant.directories.filter((d) => d.is_active).length} active
        </span>
      </div>
    </div>
  );
};

export default AccessGrantCard;
