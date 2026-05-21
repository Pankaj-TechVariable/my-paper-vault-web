import { useAuthStore } from "@/store/authStore";
import ProfileAvatarCard from "./components/ProfileAvatarCard";
import ProfileDetailsCard from "./components/ProfileDetailsCard";

const Profile = () => {
  const user = useAuthStore((s) => s.session?.user);

  if (!user) return null;

  return (
    <div className="h-full flex flex-col overflow-hidden px-4 md:px-8 py-6">
      {/* Header */}
      <div className="mb-5 shrink-0">
        <h1 className="text-xl font-bold text-slate-900 mb-1">Profile</h1>
        <p className="text-xs text-slate-400">Your account details and personal information</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Avatar — narrower left column */}
          <div className="lg:col-span-1">
            <ProfileAvatarCard user={user} />
          </div>

          {/* Details — wider right column */}
          <div className="lg:col-span-2">
            <ProfileDetailsCard user={user} />
          </div>


        </div>
      </div>
    </div>
  );
};

export default Profile;
