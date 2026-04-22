import React from "react";

interface TextInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "className"
> {
  label?: string;
  error?: string;
  start?: React.ReactNode;
  end?: React.ReactNode;
  className?: string;
  inputClassName?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  start,
  end,
  className,
  inputClassName,
  ...inputProps
}) => {
  return (
    <div>
      {label && (
        <label className="block mb-2 text-sm font-semibold text-slate-900">
          {label}
        </label>
      )}
      <div
        className={`mb-1 h-10 flex flex-row items-center rounded-lg border px-4 transition-colors ${
          error ? "border-red-500" : "border-slate-200"
        } ${className ?? ""}`}
      >
        {start}
        <input
          className={`flex-1 px-1.5 text-sm text-slate-900 placeholder:text-slate-400 bg-transparent outline-none border-none ${inputClassName ?? ""}`}
          {...inputProps}
        />
        {end}
      </div>
      {error && <p className="ml-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default TextInput;
