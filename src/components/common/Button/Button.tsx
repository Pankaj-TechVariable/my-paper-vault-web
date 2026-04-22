import React from "react";

type Variant = "contained" | "outlined" | "text";

interface ButtonProps {
  label: string;
  variant?: Variant;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  style?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  className?: string;
  labelClassName?: string;
}

const variantStyles: Record<Variant, { container: string; label: string }> = {
  contained: {
    container: "bg-primary rounded-lg px-5 h-10",
    label: "text-white font-semibold",
  },
  outlined: {
    container: "border-2 border-primary rounded-lg px-5 h-10 bg-transparent",
    label: "text-primary font-semibold",
  },
  text: {
    container: "px-3 py-2 bg-transparent",
    label: "text-primary font-semibold",
  },
};

const Spinner = ({ variant }: { variant: Variant }) => (
  <svg
    className="animate-spin w-5 h-5 mr-2 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke={variant === "contained" ? "#ffffff" : "#2563eb"}
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill={variant === "contained" ? "#ffffff" : "#2563eb"}
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);

const Button: React.FC<ButtonProps> = ({
  label,
  variant = "contained",
  onClick,
  loading = false,
  disabled = false,
  startIcon,
  endIcon,
  style,
  labelStyle,
  className,
  labelClassName,
}) => {
  const isDisabled = disabled || loading;
  const { container, label: labelCn } = variantStyles[variant];

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      style={style}
      className={`flex flex-row items-center justify-center cursor-pointer active:opacity-60 transition-opacity ${container} ${isDisabled ? "opacity-40 cursor-not-allowed" : ""} ${className ?? ""}`}
    >
      {loading ? (
        <Spinner variant={variant} />
      ) : startIcon ? (
        <span className="mr-2 flex items-center">{startIcon}</span>
      ) : null}

      <span
        className={`text-sm font-semibold ${labelCn} ${labelClassName ?? ""}`}
        style={labelStyle}
      >
        {label}
      </span>

      {endIcon && !loading ? (
        <span className="ml-2 flex items-center">{endIcon}</span>
      ) : null}
    </button>
  );
};

export default Button;
