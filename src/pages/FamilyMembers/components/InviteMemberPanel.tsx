import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MdClose, MdOutlinePersonAdd } from "react-icons/md";
import { useSendFamilyInvite } from "@/hooks/useFamilyMembers";
import { InviteMemberSchema, type InviteMemberFormData } from "@/schemas/familyMembers";
import TextInput from "@/components/common/TextInput/TextInput";
import Button from "@/components/common/Button/Button";

interface InviteMemberPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const InviteMemberPanel = ({ isOpen, onClose }: InviteMemberPanelProps) => {
  const { mutate: sendInvite, isPending } = useSendFamilyInvite();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteMemberFormData>({
    resolver: zodResolver(InviteMemberSchema),
  });

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const onSubmit = (data: InviteMemberFormData) => {
    sendInvite(
      {
        email: data.email,
        ...(data.relation ? { relation: data.relation } : {}),
      },
      { onSuccess: onClose },
    );
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      )}

      <div
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-96 bg-white shadow-xl
          flex flex-col transition-transform duration-300
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <MdOutlinePersonAdd size={18} className="text-primary" />
            <p className="text-sm font-bold text-slate-900">Invite Family Member</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <MdClose size={16} />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-y-auto"
        >
          <div className="flex-1 px-5 py-5 flex flex-col gap-4">
            <TextInput
              label="Email Address"
              placeholder="family@example.com"
              type="email"
              {...register("email")}
              error={errors.email?.message}
            />
            <TextInput
              label="Relation (optional)"
              placeholder="e.g. Brother, Mother, Spouse…"
              {...register("relation")}
              error={errors.relation?.message}
            />
            <p className="text-xs text-slate-400">
              An invite will be sent to this email. They'll appear in your family
              network once they accept.
            </p>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-slate-100 flex gap-3 shrink-0">
            <Button
              label="Cancel"
              variant="outlined"
              onClick={onClose}
              disabled={isPending}
              className="flex-1"
            />
            <Button
              label="Send Invite"
              variant="contained"
              loading={isPending}
              className="flex-1"
            />
          </div>
        </form>
      </div>
    </>
  );
};

export default InviteMemberPanel;
