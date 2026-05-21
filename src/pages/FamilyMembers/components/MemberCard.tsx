import { useState } from "react";
import { MdOutlineEdit, MdClose } from "react-icons/md";
import type { FamilyMember } from "@/api/endpoints/familyMembers";
import { useDeleteFamilyMember, useUpdateFamilyRelation } from "@/hooks/useFamilyMembers";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/common/Button/Button";
import ConfirmModal from "@/components/common/ConfirmModal/ConfirmModal";

interface MemberCardProps {
  member: FamilyMember;
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
];

const getAvatarColor = (email: string) =>
  AVATAR_COLORS[email.charCodeAt(0) % AVATAR_COLORS.length];

const MemberCard = ({ member }: MemberCardProps) => {
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [relationModalOpen, setRelationModalOpen] = useState(false);
  const [relationInput, setRelationInput] = useState("");

  const { mutate: remove, isPending: isRemoving } = useDeleteFamilyMember();
  const { mutate: updateRelation, isPending: isUpdating } = useUpdateFamilyRelation();
  const currentUserId = useAuthStore((s) => s.session?.user.id);

  const isRequester = member.requester_id === currentUserId;
  const other = isRequester ? member.recipient : member.requester;
  const myRelation = isRequester ? member.requester_relation : member.recipient_relation;

  const initials = other.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const memberSince = new Date(member.created_at).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  const openRelationModal = () => {
    setRelationInput(myRelation ?? "");
    setRelationModalOpen(true);
  };

  const handleSaveRelation = () => {
    const trimmed = relationInput.trim();
    if (!trimmed) return;
    updateRelation(
      { id: member.id, relation: trimmed },
      { onSuccess: () => setRelationModalOpen(false) },
    );
  };

  const handleRemove = () => {
    remove(member.id, { onSuccess: () => setConfirmingRemove(false) });
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-semibold text-sm ${getAvatarColor(other.email)}`}
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{other.name}</p>
          <p className="text-xs text-slate-400 truncate">{other.email}</p>
          <div className="flex items-center gap-2 mt-1.5">
            {myRelation ? (
              <button
                onClick={openRelationModal}
                className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium hover:bg-primary/20 transition-colors cursor-pointer"
              >
                {myRelation}
                <MdOutlineEdit size={11} />
              </button>
            ) : (
              <button
                onClick={openRelationModal}
                className="text-xs text-slate-400 hover:text-primary transition-colors cursor-pointer"
              >
                + Add label
              </button>
            )}
            <span className="text-xs text-slate-400">Since {memberSince}</span>
          </div>
        </div>

        <Button
          label="Remove"
          variant="outlined"
          className="h-auto! py-1! px-2.5! rounded-lg! border-red-200! text-xs! shrink-0"
          labelClassName="text-red-500!"
          onClick={() => setConfirmingRemove(true)}
        />
      </div>

      {/* Relation modal */}
      {relationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !isUpdating && setRelationModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {myRelation ? "Edit Relation" : "Add Relation"}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  How is {other.name} related to you?
                </p>
              </div>
              <button
                onClick={() => setRelationModalOpen(false)}
                disabled={isUpdating}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 disabled:opacity-40"
              >
                <MdClose size={16} />
              </button>
            </div>

            <input
              type="text"
              value={relationInput}
              onChange={(e) => setRelationInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveRelation()}
              placeholder="e.g. Brother, Mother, Spouse…"
              maxLength={50}
              autoFocus
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-primary transition-colors placeholder:text-slate-300"
            />

            <div className="flex gap-2">
              <Button
                label="Cancel"
                variant="outlined"
                onClick={() => setRelationModalOpen(false)}
                disabled={isUpdating}
                className="flex-1"
              />
              <Button
                label="Save"
                variant="contained"
                onClick={handleSaveRelation}
                loading={isUpdating}
                disabled={!relationInput.trim()}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      )}

      {confirmingRemove && (
        <ConfirmModal
          title="Remove Member"
          message={`Remove ${other.name} from your family network? This will also revoke any shared access.`}
          confirmLabel="Remove"
          onConfirm={handleRemove}
          onCancel={() => setConfirmingRemove(false)}
          loading={isRemoving}
          destructive
        />
      )}
    </>
  );
};

export default MemberCard;
