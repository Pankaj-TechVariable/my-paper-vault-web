import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MdOutlinePerson,
  MdOutlinePhone,
  MdOutlineCake,
  MdOutlineWc,
  MdOutlineEdit,
} from "react-icons/md";
import type { AuthUser } from "@/store/authStore";
import { useUpdateProfile } from "@/hooks/useProfile";
import { UpdateProfileSchema, type UpdateProfileFormData } from "@/schemas/profile";
import TextInput from "@/components/common/TextInput/TextInput";
import Button from "@/components/common/Button/Button";
import GenderSelect from "./GenderSelect";

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
}

const DetailRow = ({ icon, label, value }: DetailRowProps) => (
  <div className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 text-slate-400">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] text-slate-400 mb-0.5">{label}</p>
      <p className={`text-xs font-semibold truncate ${value ? "text-slate-800" : "text-slate-300"}`}>
        {value ?? "Not provided"}
      </p>
    </div>
  </div>
);

interface ProfileDetailsCardProps {
  user: AuthUser;
}

const ProfileDetailsCard = ({ user }: ProfileDetailsCardProps) => {
  const [editing, setEditing] = useState(false);
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      name: user.name,
      phone_number: user.phone_number ?? "",
      gender: user.gender ?? "",
      age: user.age ?? undefined,
    },
  });

  const handleCancel = () => {
    reset({
      name: user.name,
      phone_number: user.phone_number ?? "",
      gender: user.gender ?? "",
      age: user.age ?? undefined,
    });
    setEditing(false);
  };

  const onSubmit = (data: UpdateProfileFormData) => {
    updateProfile(
      {
        name: data.name,
        phone_number: data.phone_number || null,
        gender: data.gender || null,
        age: data.age ?? null,
      },
      { onSuccess: () => setEditing(false) },
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 h-full">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-slate-500">Personal Information</p>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            <MdOutlineEdit size={13} />
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <TextInput
            label="Full Name"
            placeholder="Your name"
            {...register("name")}
            error={errors.name?.message}
          />
          <TextInput
            label="Phone Number"
            placeholder="+1 234 567 8900"
            {...register("phone_number")}
            error={errors.phone_number?.message}
          />
          <GenderSelect
            value={watch("gender")}
            onChange={(v) => setValue("gender", v, { shouldValidate: true })}
          />
          <TextInput
            label="Age"
            placeholder="Your age"
            type="number"
            {...register("age", {
              setValueAs: (v) => (v === "" || v === null || v === undefined ? null : parseInt(v, 10)),
            })}
            error={errors.age?.message}
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
              label="Save Changes"
              variant="contained"
              loading={isPending}
              className="flex-1"
            />
          </div>
        </form>
      ) : (
        <>
          <DetailRow icon={<MdOutlinePerson size={16} />} label="Full Name" value={user.name} />
          <DetailRow icon={<MdOutlinePhone size={16} />} label="Phone Number" value={user.phone_number} />
          <DetailRow icon={<MdOutlineWc size={16} />} label="Gender" value={user.gender} />
          <DetailRow icon={<MdOutlineCake size={16} />} label="Age" value={user.age !== null ? String(user.age) : null} />
        </>
      )}
    </div>
  );
};

export default ProfileDetailsCard;
