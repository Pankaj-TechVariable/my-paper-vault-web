interface ActionIconButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}

const ActionIconButton = ({
  icon,
  label,
  onClick,
  destructive,
}: ActionIconButtonProps) => (
  <button
    onClick={onClick}
    title={label}
    className={`flex flex-col items-center gap-1 flex-1 py-3 rounded-xl transition-colors cursor-pointer ${
      destructive
        ? "text-red-500 hover:bg-red-50"
        : "text-slate-500 hover:bg-slate-100"
    }`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default ActionIconButton;
