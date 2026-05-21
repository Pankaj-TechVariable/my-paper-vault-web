import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MdOutlineLock, MdOutlineChevronRight } from "react-icons/md";
import { useChangePassword } from "@/hooks/useAuth";
import { ChangePasswordSchema, type ChangePasswordFormData } from "@/schemas/security";
import PasswordInput from "@/components/common/PasswordInput/PasswordInput";
import Button from "@/components/common/Button/Button";

const ChangePasswordCard = () => {
  const [open, setOpen] = useState(false);
  const { mutate: changePassword, isPending } = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(ChangePasswordSchema),
  });

  const handleCancel = () => {
    reset();
    setOpen(false);
  };

  const onSubmit = (data: ChangePasswordFormData) => {
    changePassword({ old_password: data.old_password, new_password: data.new_password });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      {/* Header row */}
      <button
        type="button"
        onClick={() => !isPending && setOpen((o) => !o)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <MdOutlineLock size={18} className="text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800">Change Password</p>
          <p className="text-xs text-slate-400 mt-0.5">Update your account password</p>
        </div>
        <MdOutlineChevronRight
          size={18}
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
        />
      </button>

      {/* Expandable form */}
      {open && (
        <div className="px-5 pb-5 border-t border-slate-50">
          <p className="text-[11px] text-amber-600 bg-amber-50 rounded-xl px-3 py-2 mt-4 mb-4">
            You will be signed out from all devices after changing your password.
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
            <PasswordInput
              label="Current Password"
              placeholder="Enter current password"
              {...register("old_password")}
              error={errors.old_password?.message}
            />
            <PasswordInput
              label="New Password"
              placeholder="At least 8 characters"
              {...register("new_password")}
              error={errors.new_password?.message}
            />
            <PasswordInput
              label="Confirm New Password"
              placeholder="Repeat new password"
              {...register("confirm_password")}
              error={errors.confirm_password?.message}
            />
            <div className="flex gap-2 pt-1">
              <Button
                label="Cancel"
                variant="outlined"
                onClick={handleCancel}
                disabled={isPending}
                className="flex-1"
              />
              <Button
                label="Update Password"
                variant="contained"
                loading={isPending}
                className="flex-1"
              />
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChangePasswordCard;
