import { parseBytes } from "@/api/endpoints/subscriptions";
import type { StorageThreshold } from "@/api/endpoints/subscriptions";

const BAR_COLOR: Record<StorageThreshold, string> = {
  OK: "bg-blue-600",
  WARNING_80: "bg-amber-400",
  WARNING_95: "bg-orange-500",
  BLOCKED: "bg-red-600",
};

const REMAINING_COLOR: Record<StorageThreshold, string> = {
  OK: "text-slate-500",
  WARNING_80: "text-amber-600",
  WARNING_95: "text-orange-600",
  BLOCKED: "text-red-600",
};

const GiB = 1024 ** 3;
const MiB = 1024 ** 2;
const KiB = 1024;

const formatBytes = (bytes: number): string => {
  if (bytes >= GiB) return `${(bytes / GiB).toFixed(1)} GB`;
  if (bytes >= MiB) return `${(bytes / MiB).toFixed(0)} MB`;
  return `${(bytes / KiB).toFixed(0)} KB`;
};

interface StorageBarProps {
  usedBytes: string;
  totalBytes: string;
  usedPercent: number;
  threshold: StorageThreshold;
}

const StorageBar = ({
  usedBytes,
  totalBytes,
  usedPercent,
  threshold,
}: StorageBarProps) => {
  const used = parseBytes(usedBytes);
  const total = parseBytes(totalBytes);
  const remaining = Math.max(0, total - used);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {formatBytes(used)} of {formatBytes(total)} used
        </p>
        <p className="text-xs font-bold text-slate-700">{usedPercent}%</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all ${BAR_COLOR[threshold]}`}
          style={{ width: `${usedPercent}%` }}
        />
      </div>
      <p className={`mt-1.5 text-xs ${REMAINING_COLOR[threshold]}`}>
        {threshold === "BLOCKED"
          ? "Storage full — delete files or upgrade your plan"
          : `${formatBytes(remaining)} remaining`}
      </p>
    </div>
  );
};

export default StorageBar;
