const GENDER_OPTIONS = ["Male", "Female", "Other"] as const;

interface GenderSelectProps {
  value: string | null | undefined;
  onChange: (v: string | null) => void;
}

const GenderSelect = ({ value, onChange }: GenderSelectProps) => (
  <div>
    <p className="text-xs font-medium text-slate-600 mb-1.5">Gender</p>
    <div className="flex gap-2">
      {GENDER_OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(value === option ? null : option)}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
            value === option
              ? "bg-primary text-white border-primary"
              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  </div>
);

export default GenderSelect;
