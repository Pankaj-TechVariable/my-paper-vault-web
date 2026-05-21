import { useState } from "react";
import { MdOutlineLink } from "react-icons/md";
import { useDeactivateAllUploadLinks } from "@/hooks/useUploadLinks";
import ConfirmModal from "@/components/common/ConfirmModal/ConfirmModal";
import Button from "@/components/common/Button/Button";

interface DisableLinksCardProps {
  disabled?: boolean;
}

const DisableLinksCard = ({ disabled }: DisableLinksCardProps) => {
  const [confirming, setConfirming] = useState(false);
  const { mutate: deactivateAll, isPending } = useDeactivateAllUploadLinks();

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
          <MdOutlineLink size={18} className="text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 mb-0.5">Disable All Upload Links</p>
          <p className="text-xs text-slate-400">Immediately revoke all active public upload links</p>
        </div>
        <Button
          label="Disable All"
          variant="outlined"
          onClick={() => setConfirming(true)}
          loading={isPending}
          disabled={disabled}
          className="shrink-0 h-auto! py-1! px-2.5! rounded-lg! border-red-300 text-red-500 hover:bg-red-50 text-xs!"
          labelClassName="text-red-500!"
        />
      </div>

      {confirming && (
        <ConfirmModal
          title="Disable All Upload Links"
          message="This will immediately deactivate all active upload links. Anyone with an existing link will no longer be able to use it."
          confirmLabel="Disable All"
          onConfirm={() => deactivateAll(undefined, { onSuccess: () => setConfirming(false) })}
          onCancel={() => setConfirming(false)}
          loading={isPending}
          destructive
        />
      )}
    </>
  );
};

export default DisableLinksCard;
