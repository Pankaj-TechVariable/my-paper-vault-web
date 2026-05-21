import { useRef } from "react";
import {
  MdOutlineVerified,
  MdOutlineMarkEmailUnread,
  MdOutlineCalendarToday,
  MdOutlineUpdate,
  MdOutlineCameraAlt,
} from "react-icons/md";
import type { AuthUser } from "@/store/authStore";
import { useGetProfilePicture, useUploadProfilePicture } from "@/hooks/useProfile";

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

interface ProfileAvatarCardProps {
  user: AuthUser;
}

const ProfileAvatarCard = ({ user }: ProfileAvatarCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: pictureUrl } = useGetProfilePicture();
  const { upload, isUploading } = useUploadProfilePicture();

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    upload(file);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col items-center text-center">
      {/* Avatar with upload overlay */}
      <div className="relative mb-4">
        <div className="w-20 h-20 rounded-full overflow-hidden">
          {pictureUrl ? (
            <img src={pictureUrl} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center text-2xl font-bold ${getAvatarColor(user.email)}`}
            >
              {initials}
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MdOutlineCameraAlt size={14} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Name */}
      <p className="text-base font-bold text-slate-900 mb-0.5">{user.name}</p>

      {/* Email */}
      <p className="text-xs text-slate-400 mb-4">{user.email}</p>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap justify-center mb-5">
        {user.is_verified ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
            <MdOutlineVerified size={12} />
            Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
            <MdOutlineMarkEmailUnread size={12} />
            Unverified
          </span>
        )}
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
            user.is_active
              ? "bg-blue-100 text-blue-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {user.is_active ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Dates */}
      <div className="w-full border-t border-slate-50 pt-4 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-slate-400">
            <MdOutlineCalendarToday size={13} />
            Member Since
          </span>
          <span className="font-semibold text-slate-700">
            {new Date(user.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-slate-400">
            <MdOutlineUpdate size={13} />
            Last Updated
          </span>
          <span className="font-semibold text-slate-700">
            {new Date(user.updated_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileAvatarCard;
