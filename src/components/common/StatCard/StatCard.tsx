import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  icon?: ReactNode;
  indicator?: ReactNode;
  isLoading?: boolean;
  skeleton?: ReactNode;
  children: ReactNode;
}

const StatCard = ({
  label,
  icon,
  indicator,
  isLoading,
  skeleton,
  children,
}: StatCardProps) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-4">
    <p className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
      {indicator}
      {icon}
      {label}
    </p>
    {isLoading ? skeleton : children}
  </div>
);

export default StatCard;
