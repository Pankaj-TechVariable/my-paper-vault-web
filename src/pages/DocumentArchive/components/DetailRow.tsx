const DetailRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
    <span className="text-slate-400 mt-0.5 shrink-0">{icon}</span>
    <div className="min-w-0">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-medium text-slate-800 truncate">{value}</p>
    </div>
  </div>
);

export default DetailRow;
