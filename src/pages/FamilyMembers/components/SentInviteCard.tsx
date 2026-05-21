import { useState } from "react";
import { MdOutlineSchedule } from "react-icons/md";
import type { PendingInvite } from "@/api/endpoints/familyMembers";
import { useDeleteFamilyMember } from "@/hooks/useFamilyMembers";
import Button from "@/components/common/Button/Button";
import ConfirmModal from "@/components/common/ConfirmModal/ConfirmModal";

interface SentInviteCardProps {
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

const SentInviteCard = ({ invite }: SentInviteCardProps) => {
  const [confirming, setConfirming] = useState(false);
  const { mutate: cancel, isPending } = useDeleteFamilyMember();

  const recipient = invite.recipient;

  const initials = recipient.name
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

  const handleCancel = () => {
    cancel(invite.id, { onSuccess: () => setConfirming(false) });
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-semibold text-sm ${getAvatarColor(recipient.email)}`}
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{recipient.name}</p>
          <p className="text-xs text-slate-400 truncate">{recipient.email}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="flex items-center gap-1 text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
              <MdOutlineSchedule size={11} />
              Pending
            </span>
            <span className="text-xs text-slate-400">Sent {sentDate}</span>
          </div>
        </div>

        <Button
          label="Cancel"
          variant="outlined"
          className="h-auto! py-1! px-2.5! rounded-lg! border-red-200! text-xs! shrink-0"
          labelClassName="text-red-500!"
          onClick={() => setConfirming(true)}
        />
      </div>

      {confirming && (
        <ConfirmModal
          title="Cancel Invite"
          message={`Cancel the family invite sent to ${recipient.name}?`}
          confirmLabel="Cancel Invite"
          onConfirm={handleCancel}
          onCancel={() => setConfirming(false)}
          loading={isPending}
          destructive
        />
      )}
    </>
  );
};

export default SentInviteCard;
