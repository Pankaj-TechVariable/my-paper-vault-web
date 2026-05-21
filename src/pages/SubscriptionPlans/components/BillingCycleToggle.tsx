import type { BillingCycle } from "./PlanCard";

interface BillingCycleToggleProps {
  value: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
}

const CYCLES: { value: BillingCycle; label: string }[] = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
];

const BillingCycleToggle = ({ value, onChange }: BillingCycleToggleProps) => (
  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-full self-start sm:self-auto">
    {CYCLES.map((cycle) => (
      <button
        key={cycle.value}
        onClick={() => onChange(cycle.value)}
        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
          value === cycle.value
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        {cycle.label}
      </button>
    ))}
  </div>
);

export default BillingCycleToggle;
