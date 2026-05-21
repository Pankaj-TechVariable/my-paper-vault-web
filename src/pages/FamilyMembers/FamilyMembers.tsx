import { useState } from "react";
import { MdOutlinePersonAdd } from "react-icons/md";
import { useFamilyMembers, usePendingInvites } from "@/hooks/useFamilyMembers";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import Button from "@/components/common/Button/Button";
import MemberCard from "./components/MemberCard";
import PendingInviteCard from "./components/PendingInviteCard";
import SentInviteCard from "./components/SentInviteCard";
import MemberSkeletonCard from "./components/MemberSkeletonCard";
import InviteMemberPanel from "./components/InviteMemberPanel";

type Tab = "members" | "pending" | "sent";

const EMPTY: Record<Tab, { title: string; subtitle: string }> = {
  members: {
    title: "No family members yet",
    subtitle: "Accept an invite or send one to connect with family.",
  },
  pending: {
    title: "No pending invites",
    subtitle: "You have no family invites waiting for your response.",
  },
  sent: {
    title: "No sent invites",
    subtitle: "Invites you send will appear here.",
  },
};

const FamilyMembers = () => {
  const [activeTab, setActiveTab] = useState<Tab>("members");
  const [panelOpen, setPanelOpen] = useState(false);
  const canManageFamily = useSubscriptionStore((s) => s.canManageFamily());

  const { data: membersData, isLoading: membersLoading } = useFamilyMembers();
  const { data: pendingData, isLoading: pendingLoading } =
    usePendingInvites("received");
  const { data: sentData, isLoading: sentLoading } = usePendingInvites("sent");

  const members = membersData?.data ?? [];
  const pending = pendingData?.data ?? [];
  const sent = sentData?.data ?? [];

  const isLoading =
    (activeTab === "members" && membersLoading) ||
    (activeTab === "pending" && pendingLoading) ||
    (activeTab === "sent" && sentLoading);

  const TABS: { key: Tab; label: string; count: number; loading: boolean }[] = [
    {
      key: "members",
      label: "Members",
      count: members.length,
      loading: membersLoading,
    },
    {
      key: "pending",
      label: "Pending",
      count: pending.length,
      loading: pendingLoading,
    },
    { key: "sent", label: "Sent", count: sent.length, loading: sentLoading },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden px-4 md:px-8 py-6">
      {/* Header */}
      <div className="mb-5 shrink-0">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h1 className="text-xl font-bold text-slate-900">Family Members</h1>
          <Button
            label="Invite"
            variant="contained"
            startIcon={<MdOutlinePersonAdd size={16} className="text-white" />}
            className="h-auto! py-1.5! px-3! text-xs! shrink-0"
            disabled={!canManageFamily}
            onClick={() => setPanelOpen(true)}
          />
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Manage your family network and invitations.
        </p>

        {/* Tab chips */}
        <div className="flex gap-2">
          {TABS.map(({ key, label, count, loading }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === key
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {label}
              {!loading && count > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeTab === key
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <MemberSkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <>
            {activeTab === "members" &&
              (members.length === 0 ? (
                <EmptyState tab="members" />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  {members.map((m) => (
                    <MemberCard key={m.id} member={m} />
                  ))}
                </div>
              ))}

            {activeTab === "pending" &&
              (pending.length === 0 ? (
                <EmptyState tab="pending" />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  {pending.map((inv) => (
                    <PendingInviteCard key={inv.id} invite={inv} />
                  ))}
                </div>
              ))}

            {activeTab === "sent" &&
              (sent.length === 0 ? (
                <EmptyState tab="sent" />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  {sent.map((inv) => (
                    <SentInviteCard key={inv.id} invite={inv} />
                  ))}
                </div>
              ))}
          </>
        )}
      </div>

      <InviteMemberPanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
      />
    </div>
  );
};

const EmptyState = ({ tab }: { tab: Tab }) => (
  <div className="text-center py-16 text-slate-400">
    <p className="text-sm font-medium text-slate-500">{EMPTY[tab].title}</p>
    <p className="text-xs mt-1">{EMPTY[tab].subtitle}</p>
  </div>
);

export default FamilyMembers;
