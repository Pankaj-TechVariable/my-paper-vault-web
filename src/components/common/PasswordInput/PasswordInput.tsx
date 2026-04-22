import React, { useState } from "react";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import TextInput from "@/components/common/TextInput";

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className" | "type"> {
  label?: string;
  error?: string;
  start?: React.ReactNode;
  className?: string;
  inputClassName?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  error,
  start,
  className,
  inputClassName,
  ...props
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <TextInput
      type={visible ? "text" : "password"}
      error={error}
      start={start}
      end={
        <button
          type="button"
          className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0 ml-2"
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <HiOutlineEyeOff size={16} /> : <HiOutlineEye size={16} />}
        </button>
      }
      className={className}
      inputClassName={inputClassName}
      {...props}
    />
  );
};

export default PasswordInput;
