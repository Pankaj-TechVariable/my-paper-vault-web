import { useState, useEffect, createElement, useRef } from "react";
import { MdClose, MdOutlineShare, MdKeyboardArrowDown } from "react-icons/md";
import { useDirectories } from "@/hooks/useDirectories";
import { useFamilyMembers, useGrantAccess } from "@/hooks/useFamilyAccess";
import { useAuthStore } from "@/store/authStore";
import { getCategoryStyle } from "@/constants/categoryStyles";
import Button from "@/components/common/Button/Button";

// ── Custom dropdown ────────────────────────────────────────────────────────────

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownSelectProps {
  placeholder: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const DropdownSelect = ({
  placeholder,
  options,
  value,
  onChange,
  disabled,
}: DropdownSelectProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((p) => !p)}
        className="w-full h-10 pl-3 pr-8 text-sm bg-white border border-slate-200 rounded-lg text-left flex items-center focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className={selected ? "text-slate-800" : "text-slate-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <MdKeyboardArrowDown
          size={18}
          className={`absolute right-2.5 text-slate-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul className="absolute left-0 right-0 top-[calc(100%+4px)] z-60 bg-white border border-slate-200 rounded-lg shadow-lg max-h-52 overflow-y-auto py-1">
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                opt.value === value
                  ? "bg-blue-50 text-primary font-medium"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ── Panel ──────────────────────────────────────────────────────────────────────

interface ShareAccessPanelProps {
  open: boolean;
  onClose: () => void;
}

const ShareAccessPanel = ({ open, onClose }: ShareAccessPanelProps) => {
  const [selectedDirectoryId, setSelectedDirectoryId] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState("");

  const currentUserId = useAuthStore((s) => s.session?.user.id);
  const { data: dirsData, isLoading: dirsLoading } = useDirectories({ is_active: "true" });
  const { data: membersData, isLoading: membersLoading } = useFamilyMembers();
  const { mutate: grantAccess, isPending } = useGrantAccess();

  const directories = dirsData?.data ?? [];
  const acceptedMembers = (membersData?.data ?? []).filter(
    (m) => m.status === "ACCEPTED",
  );

  const getMemberUser = (member: (typeof acceptedMembers)[number]) =>
    member.requester_id === currentUserId ? member.recipient : member.requester;

  const handleSubmit = () => {
    if (!selectedDirectoryId || !selectedMemberId) return;
    grantAccess(
      { directory_id: selectedDirectoryId, member_id: selectedMemberId },
      {
        onSuccess: (data) => {
          if (data.success) {
            setSelectedDirectoryId("");
            setSelectedMemberId("");
            onClose();
          }
        },
      },
    );
  };

  useEffect(() => {
    if (!open) {
      setSelectedDirectoryId("");
      setSelectedMemberId("");
    }
  }, [open]);

  const selectedDir = directories.find((d) => d.id === selectedDirectoryId);
  const selectedDirStyle = selectedDir
    ? getCategoryStyle(selectedDir.category?.type ?? "")
    : null;

  const selectedMember = acceptedMembers.find(
    (x) => getMemberUser(x).id === selectedMemberId,
  );
  const selectedMemberUser = selectedMember
    ? getMemberUser(selectedMember)
    : null;
  const memberInitials = selectedMemberUser
    ? selectedMemberUser.name.trim().split(" ").length > 1
      ? (
          selectedMemberUser.name[0] +
          selectedMemberUser.name.trim().split(" ").pop()![0]
        ).toUpperCase()
      : selectedMemberUser.name[0].toUpperCase()
    : "";

  const directoryOptions: DropdownOption[] = directories.map((d) => ({
    value: d.id,
    label: d.name,
  }));

  const memberOptions: DropdownOption[] = acceptedMembers.map((m) => {
    const user = getMemberUser(m);
    return { value: user.id, label: `${user.name} (${user.email})` };
  });

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-96 bg-white shadow-xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <MdOutlineShare size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Share Access</p>
              <p className="text-xs text-slate-400">
                Grant folder access to a family member
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <MdClose size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">

          {/* Directory */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Folder
            </label>
            {dirsLoading ? (
              <div className="h-10 w-full bg-slate-100 rounded-lg animate-pulse" />
            ) : (
              <DropdownSelect
                placeholder="Select a folder…"
                options={directoryOptions}
                value={selectedDirectoryId}
                onChange={setSelectedDirectoryId}
              />
            )}

            {selectedDir && selectedDirStyle && (
              <div className="flex items-center gap-2 mt-1 px-3 py-2 bg-slate-50 rounded-lg">
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${selectedDirStyle.bgColor}`}
                >
                  {createElement(selectedDirStyle.icon, {
                    size: 12,
                    color: selectedDirStyle.iconColor,
                  })}
                </div>
                <span className="text-xs font-medium text-slate-700">
                  {selectedDir.name}
                </span>
                <span
                  className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: selectedDirStyle.bgColor,
                    color: selectedDirStyle.iconColor,
                  }}
                >
                  {selectedDir.category?.name ?? "—"}
                </span>
              </div>
            )}
          </div>

          {/* Family member */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Family Member
            </label>
            {membersLoading ? (
              <div className="h-10 w-full bg-slate-100 rounded-lg animate-pulse" />
            ) : acceptedMembers.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">
                No accepted family members found.
              </p>
            ) : (
              <DropdownSelect
                placeholder="Select a member…"
                options={memberOptions}
                value={selectedMemberId}
                onChange={setSelectedMemberId}
              />
            )}

            {selectedMemberUser && (
              <div className="flex items-center gap-2 mt-1 px-3 py-2 bg-slate-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold shrink-0">
                  {memberInitials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate">
                    {selectedMemberUser.name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {selectedMemberUser.email}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 shrink-0 flex flex-col gap-2">
          <Button
            label="Share Access"
            variant="contained"
            onClick={handleSubmit}
            loading={isPending}
            disabled={!selectedDirectoryId || !selectedMemberId}
            className="w-full"
          />
          <Button
            label="Cancel"
            variant="outlined"
            onClick={onClose}
            disabled={isPending}
            className="w-full"
          />
        </div>
      </aside>
    </>
  );
};

export default ShareAccessPanel;
