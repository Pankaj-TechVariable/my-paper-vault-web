import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MdOutlineHome,
  MdOutlineArchive,
  MdOutlinePeopleAlt,
  MdOutlineFolderSpecial,
  MdOutlineLink,
  MdOutlineCreditCard,
  MdOutlineLogout,
  MdClose,
  MdOutlineSettings,
  MdOutlineLock,
  MdOutlineDevices,
  MdOutlineChevronRight,
  MdPersonOutline,
} from "react-icons/md";
import { BsPersonLock } from "react-icons/bs";

import logo from "@/assets/logo/logo.png";
import Button from "@/components/common/Button/Button";
import { useSignOut } from "@/hooks/useAuth";

const navItems = [
  { icon: MdOutlineHome, label: "Dashboard", to: "/home" },
  { icon: MdOutlineArchive, label: "Documents", to: "/documents" },
  { icon: MdOutlineLink, label: "My Links", to: "/my-links" },
  { icon: MdOutlinePeopleAlt, label: "Family Members", to: "/family-members" },
  { icon: BsPersonLock, label: "Family Access", to: "/family-access" },
  {
    icon: MdOutlineFolderSpecial,
    label: "My Family Vaults",
    to: "/family-vaults",
  },
  { icon: MdPersonOutline, label: "Profile", to: "/profile" },
  { icon: MdOutlineCreditCard, label: "Subscription", to: "/subscription" },
];

const settingsSubItems = [
  { icon: MdOutlineLock, label: "Security", to: "/settings/security" },
  { icon: MdOutlineDevices, label: "Devices", to: "/settings/devices" },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const NavContent = ({ onClose }: { onClose: () => void }) => {
  const { pathname } = useLocation();
  const { mutate: signOut, isPending } = useSignOut();

  const isOnSettingsRoute = pathname.startsWith("/settings");
  const [settingsOpen, setSettingsOpen] = useState(isOnSettingsRoute);

  return (
    <div className="flex flex-col h-full">
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="flex flex-col gap-0.5">
          {navItems.map(({ icon: Icon, label, to }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium no-underline transition-colors border-r-3 ${
                  active
                    ? "bg-blue-50 text-primary border-primary"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-transparent"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                {label}
              </Link>
            );
          })}

          {/* Settings expandable item */}
          <button
            type="button"
            onClick={() => setSettingsOpen((o) => !o)}
            className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors border-r-3 cursor-pointer w-full text-left ${
              isOnSettingsRoute
                ? "bg-blue-50 text-primary border-primary"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-transparent"
            }`}
          >
            <MdOutlineSettings size={18} className="shrink-0" />
            <span className="flex-1">Settings</span>
            <MdOutlineChevronRight
              size={16}
              className={`shrink-0 transition-transform duration-200 ${settingsOpen ? "rotate-90" : ""}`}
            />
          </button>

          {/* Sub-items */}
          {settingsOpen && (
            <div className="flex flex-col gap-0.5">
              {settingsSubItems.map(({ icon: Icon, label, to }) => {
                const active = pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={onClose}
                    className={`flex items-center gap-3 pl-9 pr-3 py-2 text-sm font-medium no-underline transition-colors border-r-3 ${
                      active
                        ? "bg-blue-50 text-primary border-primary"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 border-transparent"
                    }`}
                  >
                    <Icon size={16} className="shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      <div className="px-3 pb-5 flex flex-col gap-3">
        <Button
          label="Sign Out"
          variant="text"
          startIcon={<MdOutlineLogout size={18} />}
          onClick={() => signOut()}
          loading={isPending}
          className="border-red-500 text-red-500 hover:bg-red-50"
          labelClassName="text-red-500!"
        />
      </div>
    </div>
  );
};

const Sidebar = ({ open, onClose }: SidebarProps) => {
  return (
    <>
      {/* Desktop — no logo (topbar has it) */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-slate-100 bg-white h-full overflow-y-auto">
        <NavContent onClose={onClose} />
      </aside>

      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 lg:hidden ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Mobile drawer — logo + close button + nav */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-xl flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <img
              src={logo}
              alt="MyPaperVault"
              className="w-8 h-8 object-contain"
            />
            <span
              className="font-extrabold text-sm text-slate-900"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              MyPaperVault
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <MdClose size={18} />
          </button>
        </div>
        <div className="flex-1 min-h-0">
          <NavContent onClose={onClose} />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
