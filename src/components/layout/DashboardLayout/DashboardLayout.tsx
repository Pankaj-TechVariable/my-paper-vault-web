import { useState } from "react";
import { Outlet } from "react-router-dom";
import { HiMenu } from "react-icons/hi";
import logo from "@/assets/logo/logo.png";
import { useAuthStore } from "@/store/authStore";
import { useGetProfilePicture } from "@/hooks/useProfile";
import Sidebar from "./Sidebar";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useAuthStore((s) => s.session?.user);
  const { data: profilePictureUrl, isLoading: isAvatarLoading } = useGetProfilePicture();

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Topbar — full width, above sidebar */}
      <header className="z-30 bg-white border-b border-slate-100 px-4 md:px-8 py-3 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
            onClick={() => setSidebarOpen(true)}
          >
            <HiMenu size={20} />
          </button>
          <div className="flex items-center gap-2.5">
            <img
              src={logo}
              alt="MyPaperVault"
              className="w-8 h-8 object-contain"
            />
            <div className="flex flex-col">
              <h1
                className="text-base font-bold text-slate-900 leading-tight"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                MyPaperVault
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block leading-none">
                Your secure document vault
              </p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-medium text-slate-700 hidden sm:block">
            {user?.name}
          </span>
          <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden">
            {isAvatarLoading ? (
              <div className="w-full h-full rounded-full bg-slate-200 animate-pulse" />
            ) : profilePictureUrl ? (
              <img src={profilePictureUrl} alt={user?.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Below topbar: sidebar + page content */}
      <div className="flex flex-1 min-h-0">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
