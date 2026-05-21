import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MdClose,
  MdOutlineLink,
  MdAdd,
  MdRemove,
  MdOutlineExpandMore,
  MdCheck,
} from "react-icons/md";
import { useCreateUploadLink } from "@/hooks/useUploadLinks";
import { useDirectories } from "@/hooks/useDirectories";
import { GenerateLinkSchema, type GenerateLinkFormData } from "@/schemas/uploadLinks";
import Button from "@/components/common/Button/Button";

interface GenerateLinkPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const MB = 1_048_576;

// ── Reusable custom dropdown ───────────────────────────────────────────────────

interface DropdownOption { label: string; value: string | number }

interface DropdownSelectProps {
  placeholder: string;
  options: DropdownOption[];
  value: string | number | undefined;
  onChange: (v: string | number) => void;
  error?: string;
  disabled?: boolean;
}

const DropdownSelect = ({
  placeholder,
  options,
  value,
  onChange,
  error,
  disabled,
}: DropdownSelectProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-xl border transition-colors text-left ${
          error ? "border-red-300" : "border-slate-200 focus:border-primary"
        } ${disabled ? "opacity-40 cursor-not-allowed bg-slate-50" : "bg-white cursor-pointer hover:border-slate-300"}`}
      >
        <span className={selected ? "text-slate-800" : "text-slate-300"}>
          {selected ? selected.label : placeholder}
        </span>
        <MdOutlineExpandMore
          size={18}
          className={`text-slate-400 transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ul className="absolute left-0 right-0 top-[calc(100%+4px)] z-60 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`flex items-center justify-between px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                opt.value === value
                  ? "bg-primary/5 text-primary font-medium"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {opt.label}
              {opt.value === value && <MdCheck size={14} />}
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

// ── Toggle switch ──────────────────────────────────────────────────────────────

const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative w-10 h-6 rounded-full transition-colors duration-200 cursor-pointer shrink-0 ${
      checked ? "bg-primary" : "bg-slate-200"
    }`}
  >
    <span
      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
        checked ? "translate-x-4" : ""
      }`}
    />
  </button>
);

// ── Field label ────────────────────────────────────────────────────────────────

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-semibold text-slate-600 mb-1.5">{children}</p>
);

// ── GenerateLinkPanel ──────────────────────────────────────────────────────────

const GenerateLinkPanel = ({ isOpen, onClose }: GenerateLinkPanelProps) => {
  const { mutate: createLink, isPending } = useCreateUploadLink();
  const { data: dirsData, isLoading: dirsLoading } = useDirectories({ is_active: "true" });
  const directories = dirsData?.data ?? [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<GenerateLinkFormData>({
    resolver: zodResolver(GenerateLinkSchema),
    defaultValues: {
      directory_id: "",
      expires_at: "",
      max_file_count: 1,
      max_file_size_mb: 5,
      pin_enabled: false,
      pin: "",
    },
  });

  const maxFileCount = watch("max_file_count");
  const maxFileSizeMb = watch("max_file_size_mb");
  const pinEnabled = watch("pin_enabled");

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const directoryOptions: DropdownOption[] = directories.map((d) => ({
    label: d.name,
    value: d.id,
  }));

  const minExpiry = new Date(Date.now() + 60_000).toISOString().slice(0, 16);

  const onSubmit = (data: GenerateLinkFormData) => {
    createLink(
      {
        directory_id: data.directory_id,
        expires_at: new Date(data.expires_at).toISOString(),
        max_file_count: data.max_file_count,
        max_file_size: data.max_file_size_mb * MB,
        ...(data.pin_enabled && data.pin ? { pin: data.pin } : {}),
      },
      { onSuccess: onClose },
    );
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      )}

      <div
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] bg-white shadow-xl
          flex flex-col transition-transform duration-300
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <MdOutlineLink size={18} className="text-primary" />
            <p className="text-sm font-bold text-slate-900">Generate Upload Link</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <MdClose size={16} />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">

            {/* Directory */}
            <div>
              <FieldLabel>Directory</FieldLabel>
              <DropdownSelect
                placeholder={dirsLoading ? "Loading…" : "Select a directory"}
                options={directoryOptions}
                value={watch("directory_id") || undefined}
                onChange={(v) => setValue("directory_id", v as string, { shouldValidate: true })}
                error={errors.directory_id?.message}
                disabled={dirsLoading}
              />
            </div>

            {/* Expires at */}
            <div>
              <FieldLabel>Expires At</FieldLabel>
              <input
                type="datetime-local"
                min={minExpiry}
                {...register("expires_at")}
                className={`w-full px-3 py-2.5 text-sm rounded-xl border transition-colors outline-none focus:border-primary ${
                  errors.expires_at ? "border-red-300" : "border-slate-200"
                }`}
              />
              {errors.expires_at && (
                <p className="text-xs text-red-500 mt-1">{errors.expires_at.message}</p>
              )}
            </div>

            {/* Max file count */}
            <div>
              <FieldLabel>Max File Count</FieldLabel>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setValue("max_file_count", Math.max(1, maxFileCount - 1), { shouldValidate: true })}
                  disabled={maxFileCount <= 1}
                  className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <MdRemove size={16} />
                </button>
                <span className="text-sm font-bold text-slate-800 w-6 text-center">
                  {maxFileCount}
                </span>
                <button
                  type="button"
                  onClick={() => setValue("max_file_count", Math.min(5, maxFileCount + 1), { shouldValidate: true })}
                  disabled={maxFileCount >= 5}
                  className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <MdAdd size={16} />
                </button>
                <span className="text-xs text-slate-400">files (max 5)</span>
              </div>
            </div>

            {/* Max file size */}
            <div>
              <FieldLabel>Max File Size</FieldLabel>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setValue("max_file_size_mb", Math.max(1, maxFileSizeMb - 1), { shouldValidate: true })}
                  disabled={maxFileSizeMb <= 1}
                  className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <MdRemove size={16} />
                </button>
                <span className="text-sm font-bold text-slate-800 w-10 text-center">
                  {maxFileSizeMb} MB
                </span>
                <button
                  type="button"
                  onClick={() => setValue("max_file_size_mb", Math.min(10, maxFileSizeMb + 1), { shouldValidate: true })}
                  disabled={maxFileSizeMb >= 10}
                  className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <MdAdd size={16} />
                </button>
                <span className="text-xs text-slate-400">max 10 MB</span>
              </div>
            </div>

            {/* PIN toggle */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <FieldLabel>PIN Protection</FieldLabel>
                  <p className="text-xs text-slate-400 -mt-1">
                    Require a PIN to upload via this link
                  </p>
                </div>
                <Toggle
                  checked={pinEnabled}
                  onChange={(v) => {
                    setValue("pin_enabled", v, { shouldValidate: true });
                    if (!v) setValue("pin", "", { shouldValidate: false });
                  }}
                />
              </div>

              {pinEnabled && (
                <div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6-digit PIN"
                    {...register("pin", {
                      onChange: (e) => {
                        e.target.value = e.target.value.replace(/\D/g, "");
                      },
                    })}
                    className={`w-full px-3 py-2.5 text-sm rounded-xl border outline-none tracking-[0.3em] font-mono transition-colors focus:border-primary ${
                      errors.pin ? "border-red-300" : "border-slate-200"
                    }`}
                  />
                  {errors.pin && (
                    <p className="text-xs text-red-500 mt-1">{errors.pin.message}</p>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-slate-100 flex gap-3 shrink-0">
            <Button
              label="Cancel"
              variant="outlined"
              onClick={onClose}
              disabled={isPending}
              className="flex-1"
            />
            <Button
              label="Generate Link"
              variant="contained"
              loading={isPending}
              className="flex-1"
            />
          </div>
        </form>
      </div>
    </>
  );
};

export default GenerateLinkPanel;
