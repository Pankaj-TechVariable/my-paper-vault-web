type SessionStatus = "ACTIVE" | "REVOKED" | "EXPIRED";

interface SessionsFilterProps {
  active: SessionStatus;
  counts: Record<SessionStatus, number>;
  onChange: (status: SessionStatus) => void;
}

const FILTERS: { label: string; value: SessionStatus }[] = [
  { label: "Active", value: "ACTIVE" },
  { label: "Revoked", value: "REVOKED" },
  { label: "Expired", value: "EXPIRED" },
];

const SessionsFilter = ({ active, counts, onChange }: SessionsFilterProps) => (
  <div className="flex gap-2">
    {FILTERS.map(({ label, value }) => (
      <button
        key={value}
        type="button"
        onClick={() => onChange(value)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
          active === value
            ? "bg-primary text-white border-primary"
            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
        }`}
      >
        {label}
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
            active === value ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
          }`}
        >
          {counts[value]}
        </span>
      </button>
    ))}
  </div>
);

export default SessionsFilter;
export type { SessionStatus };
