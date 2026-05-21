import { useState } from "react";
import type { PendingInvite } from "@/api/endpoints/familyMembers";
import { useAcceptFamilyInvite, useRejectFamilyInvite } from "@/hooks/useFamilyMembers";
import Button from "@/components/common/Button/Button";
import ConfirmModal from "@/components/common/ConfirmModal/ConfirmModal";

interface PendingInviteCardProps {
  invite: PendingInvite;
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

const PendingInviteCard = ({ invite }: PendingInviteCardProps) => {
  const [confirmingReject, setConfirmingReject] = useState(false);
  const { mutate: accept, isPending: isAccepting } = useAcceptFamilyInvite();
  const { mutate: reject, isPending: isRejecting } = useRejectFamilyInvite();

  const sender = invite.requester;

  const initials = sender.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sentDate = new Date(invite.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleAccept = () => accept(invite.id);
  const handleReject = () => {
    reject(invite.id, { onSuccess: () => setConfirmingReject(false) });
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-semibold text-sm ${getAvatarColor(sender.email)}`}
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{sender.name}</p>
          <p className="text-xs text-slate-400 truncate">{sender.email}</p>
          <p className="text-xs text-slate-400 mt-1">Sent {sentDate}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            label="Accept"
            variant="contained"
            className="h-auto! py-1! px-2.5! rounded-lg! text-xs!"
            loading={isAccepting}
            disabled={isRejecting}
            onClick={handleAccept}
          />
          <Button
            label="Decline"
            variant="outlined"
            className="h-auto! py-1! px-2.5! rounded-lg! border-red-200! text-xs!"
            labelClassName="text-red-500!"
            loading={isRejecting}
            disabled={isAccepting}
            onClick={() => setConfirmingReject(true)}
          />
        </div>
      </div>

      {confirmingReject && (
        <ConfirmModal
          title="Decline Invite"
          message={`Decline the family invite from ${sender.name}?`}
          confirmLabel="Decline"
          onConfirm={handleReject}
          onCancel={() => setConfirmingReject(false)}
          loading={isRejecting}
          destructive
        />
      )}
    </>
  );
};

export default PendingInviteCard;
