interface ActionIconButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
  loading?: boolean;
}

const Spinner = () => (
  <svg className="animate-spin w-4.5 h-4.5" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);

const ActionIconButton = ({
  icon,
  label,
  onClick,
  destructive,
  loading,
}: ActionIconButtonProps) => (
  <button
    onClick={onClick}
    disabled={loading}
    title={label}
    className={`flex flex-col items-center gap-1 flex-1 py-3 rounded-xl transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
      destructive
        ? "text-red-500 hover:bg-red-50"
        : "text-slate-500 hover:bg-slate-100"
    }`}
  >
    {loading ? <Spinner /> : icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default ActionIconButton;
