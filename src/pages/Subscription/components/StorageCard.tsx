import StorageBar from "@/components/common/StorageBar/StorageBar";
import type { MyStorage } from "@/api/endpoints/subscriptions";

const GiB = 1024 ** 3;
const MiB = 1024 ** 2;

const formatStorage = (bytes: number) =>
  bytes >= GiB
    ? `${(bytes / GiB).toFixed(0)} GB`
    : `${(bytes / MiB).toFixed(0)} MB`;

interface StorageCardProps {
  storage: MyStorage;
  totalBytes: number;
}

const StorageCard = ({ storage, totalBytes }: StorageCardProps) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5">
    <p className="text-xs text-slate-400 mb-0.5">Storage</p>
    <p className="text-base font-bold text-slate-900 mb-4">
      {formatStorage(totalBytes)} total
    </p>
    <StorageBar
      usedBytes={storage.used_bytes}
      totalBytes={storage.total_bytes}
      usedPercent={storage.used_percent}
      threshold={storage.threshold}
    />
  </div>
);

export default StorageCard;
