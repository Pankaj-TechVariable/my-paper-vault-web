import { useState } from "react";
import { MdOutlineDevices, MdOutlineLogout } from "react-icons/md";
import { useGetSessions, useRevokeSession } from "@/hooks/useSessions";
import { useSignOutAll } from "@/hooks/useAuth";
import { getDeviceId } from "@/utils/deviceInfo.utils";
import ConfirmModal from "@/components/common/ConfirmModal/ConfirmModal";
import Button from "@/components/common/Button/Button";
import SessionsFilter, { type SessionStatus } from "./components/SessionsFilter";
import SessionCard from "./components/SessionCard";
import SessionCardSkeleton from "./components/SessionCardSkeleton";

const currentDeviceId = getDeviceId();

const Devices = () => {
  const [filter, setFilter] = useState<SessionStatus>("ACTIVE");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [confirmSignOutAll, setConfirmSignOutAll] = useState(false);

  const { data: sessions = [], isLoading } = useGetSessions();

  // Among all active sessions from this device, the one with the latest
  // last_active_at is the current session (it gets updated on every API call).
  // This handles stale sessions that were never revoked on previous sign-ins.
  const currentSessionId = sessions
    .filter((s) => s.device_id === currentDeviceId && s.session_status === "ACTIVE")
    .sort((a, b) => {
      const at = a.last_active_at ? new Date(a.last_active_at).getTime() : 0;
      const bt = b.last_active_at ? new Date(b.last_active_at).getTime() : 0;
      return bt - at;
    })[0]?.id ?? null;
  const { mutate: revokeSession, isPending: isRevoking } = useRevokeSession();
  const { mutate: signOutAll, isPending: isSigningOutAll } = useSignOutAll();

  const counts: Record<SessionStatus, number> = {
    ACTIVE: sessions.filter((s) => s.session_status === "ACTIVE").length,
    REVOKED: sessions.filter((s) => s.session_status === "REVOKED").length,
    EXPIRED: sessions.filter((s) => s.session_status === "EXPIRED").length,
  };

  const filtered = sessions.filter((s) => s.session_status === filter);

  const handleConfirmRevoke = () => {
    if (!confirmingId) return;
    revokeSession(confirmingId, { onSuccess: () => setConfirmingId(null) });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden px-4 md:px-8 py-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900 mb-1">Devices</h1>
          <p className="text-xs text-slate-400">View and manage devices signed in to your account</p>
        </div>
        <Button
          label="Sign out all"
          variant="outlined"
          startIcon={<MdOutlineLogout size={14} />}
          onClick={() => setConfirmSignOutAll(true)}
          disabled={isSigningOutAll}
          className="shrink-0 h-auto! py-1.5! px-3! rounded-xl! border-red-300 text-red-500 hover:bg-red-50 text-xs!"
          labelClassName="text-red-500!"
        />
      </div>

      {/* Filter */}
      <div className="mb-4 shrink-0">
        <SessionsFilter active={filter} counts={counts} onChange={setFilter} />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SessionCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
              <MdOutlineDevices size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-500">
              No {filter.toLowerCase()} sessions
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                isCurrentDevice={session.id === currentSessionId}
                isRevoking={isRevoking && confirmingId === session.id}
                onRevoke={(id) => setConfirmingId(id)}
              />
            ))}
          </div>
        )}
      </div>

      {confirmingId && (
        <ConfirmModal
          title="Revoke Session"
          message="This will sign out the device immediately. You cannot undo this."
          confirmLabel="Revoke"
          onConfirm={handleConfirmRevoke}
          onCancel={() => setConfirmingId(null)}
          loading={isRevoking}
          destructive
        />
      )}

      {confirmSignOutAll && (
        <ConfirmModal
          title="Sign out all devices"
          message="This will immediately revoke all active sessions including this device. You will be logged out."
          confirmLabel="Sign out all"
          onConfirm={() => signOutAll()}
          onCancel={() => setConfirmSignOutAll(false)}
          loading={isSigningOutAll}
          destructive
        />
      )}
    </div>
  );
};

export default Devices;
