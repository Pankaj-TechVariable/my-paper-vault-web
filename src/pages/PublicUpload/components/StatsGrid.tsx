import { MdOutlineTimer, MdOutlineStorage, MdOutlineStackedBarChart } from 'react-icons/md';
import { formatFileSize } from '@/utils/document.utils';

interface StatsGridProps {
  expiresAt: string;
  maxFileSize: number;
  slotsRemaining: number;
  maxFileCount: number;
}

const getTimeRemaining = (expiresAt: string): string => {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return 'Expired';
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''}`;
};

interface StatCellProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const StatCell = ({ icon, label, value }: StatCellProps) => (
  <div className="flex flex-col items-center gap-1.5 py-4 px-2">
    <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center text-primary">
      {icon}
    </div>
    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</span>
    <span className="text-sm font-bold text-slate-800 text-center leading-tight">{value}</span>
  </div>
);

const StatsGrid = ({ expiresAt, maxFileSize, slotsRemaining, maxFileCount }: StatsGridProps) => (
  <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
    <StatCell
      icon={<MdOutlineTimer size={16} />}
      label="Expires in"
      value={getTimeRemaining(expiresAt)}
    />
    <StatCell
      icon={<MdOutlineStorage size={16} />}
      label="Max size"
      value={formatFileSize(maxFileSize)}
    />
    <StatCell
      icon={<MdOutlineStackedBarChart size={16} />}
      label="Slots left"
      value={`${slotsRemaining} of ${maxFileCount}`}
    />
  </div>
);

export default StatsGrid;
