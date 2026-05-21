import { createElement } from "react";
import { FaApple, FaAndroid, FaWindows, FaLinux } from "react-icons/fa6";
import {
  MdOutlineLanguage,
  MdOutlineSmartphone,
  MdOutlineComputer,
  MdOutlineDevices,
  MdOutlineAccessTime,
  MdOutlineLocationOn,
} from "react-icons/md";
import type { IconType } from "react-icons";
import type { UserSession } from "@/hooks/useSessions";

interface DeviceStyle {
  icon: IconType;
  bg: string;
  color: string;
}

const getDeviceStyle = (os: string | null, type: string | null): DeviceStyle => {
  const o = (os ?? "").toLowerCase();
  const t = (type ?? "").toLowerCase();

  // Android / iOS always get their own icon regardless of device_type
  if (o.includes("android"))
    return { icon: FaAndroid, bg: "bg-green-100", color: "#16a34a" };
  if (o.includes("ios") || o.includes("iphone") || o.includes("ipad"))
    return { icon: FaApple, bg: "bg-slate-100", color: "#475569" };

  // For everything else (macOS, Windows, Linux…) check device_type first:
  // a desktop OS accessed via a web browser shows the web icon
  if (t === "web" || t.includes("browser"))
    return { icon: MdOutlineLanguage, bg: "bg-indigo-100", color: "#4f46e5" };

  // Non-browser desktop OS icons
  if (o.includes("mac"))
    return { icon: FaApple, bg: "bg-slate-100", color: "#475569" };
  if (o.includes("windows"))
    return { icon: FaWindows, bg: "bg-blue-100", color: "#2563eb" };
  if (o.includes("linux"))
    return { icon: FaLinux, bg: "bg-orange-100", color: "#ea580c" };

  // Generic type fallbacks
  if (t.includes("mobile") || t.includes("phone"))
    return { icon: MdOutlineSmartphone, bg: "bg-purple-100", color: "#7c3aed" };
  if (t.includes("desktop") || t.includes("computer"))
    return { icon: MdOutlineComputer, bg: "bg-slate-100", color: "#475569" };

  return { icon: MdOutlineDevices, bg: "bg-slate-100", color: "#94a3b8" };
};

const STATUS_STYLES = {
  ACTIVE: "bg-green-100 text-green-700",
  REVOKED: "bg-red-100 text-red-700",
  EXPIRED: "bg-slate-100 text-slate-500",
};

const formatDate = (iso: string | null) => {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface SessionCardProps {
  session: UserSession;
  isCurrentDevice: boolean;
  isRevoking: boolean;
  onRevoke: (id: string) => void;
}

const SessionCard = ({ session, isCurrentDevice, isRevoking, onRevoke }: SessionCardProps) => {
  const style = getDeviceStyle(session.device_os, session.device_type);

  const deviceLabel =
    session.device_name ||
    [session.device_os, session.device_version].filter(Boolean).join(" ") ||
    session.device_type ||
    "Unknown Device";

  const deviceMeta = [session.device_os, session.device_version]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`bg-white rounded-2xl border p-4 flex items-start gap-3 ${
        isCurrentDevice ? "border-primary/30 bg-blue-50/30" : "border-slate-100"
      }`}
    >
      {/* Device icon */}
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.bg}`}
      >
        {createElement(style.icon, { size: 18, color: style.color })}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">{deviceLabel}</p>
            {isCurrentDevice && (
              <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                This device
              </span>
            )}
          </div>
          <span
            className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[session.session_status]}`}
          >
            {session.session_status}
          </span>
        </div>

        {deviceMeta && deviceLabel !== deviceMeta && (
          <p className="text-[11px] text-slate-400 mb-1.5">{deviceMeta}</p>
        )}

        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
          {session.ip_address && (
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <MdOutlineLocationOn size={12} />
              {session.ip_address}
            </span>
          )}
          {session.last_active_at && (
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <MdOutlineAccessTime size={12} />
              {formatDate(session.last_active_at)}
            </span>
          )}
        </div>

        {session.session_status === "REVOKED" && session.revoked_at && (
          <p className="text-[11px] text-red-400 mt-1">
            Revoked {formatDate(session.revoked_at)}
          </p>
        )}

        {session.session_status === "EXPIRED" && session.expires_at && (
          <p className="text-[11px] text-slate-400 mt-1">
            Expired {formatDate(session.expires_at)}
          </p>
        )}
      </div>

      {/* Revoke button — active non-current sessions only */}
      {session.session_status === "ACTIVE" && !isCurrentDevice && (
        <button
          type="button"
          onClick={() => onRevoke(session.id)}
          disabled={isRevoking}
          className="shrink-0 text-[11px] font-semibold text-red-500 hover:text-red-600 border border-red-200 hover:border-red-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Revoke
        </button>
      )}
    </div>
  );
};

export default SessionCard;
