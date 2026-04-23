import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MdClose } from "react-icons/md";
import type { Document } from "@/api/endpoints/documents";
import { RenameDocumentSchema, type RenameDocumentFormData } from "@/schemas/document";
import TextInput from "@/components/common/TextInput/TextInput";
import Button from "@/components/common/Button/Button";

interface RenameDocumentModalProps {
  document: Document;
  onSave: (doc: Document, newName: string) => void;
  onCancel: () => void;
  loading?: boolean;
}

const getNameWithoutExt = (filename: string) =>
  filename.replace(/\.[^/.]+$/, "");

const RenameDocumentModal = ({
  document,
  onSave,
  onCancel,
  loading,
}: RenameDocumentModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RenameDocumentFormData>({
    resolver: zodResolver(RenameDocumentSchema),
    defaultValues: { name: getNameWithoutExt(document.name) },
  });

  useEffect(() => {
    reset({ name: getNameWithoutExt(document.name) });
  }, [document.name, reset]);

  const onSubmit = (data: RenameDocumentFormData) => {
    const ext = document.name.includes(".")
      ? document.name.slice(document.name.lastIndexOf("."))
      : "";
    onSave(document, data.name + ext);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-slate-900">Rename Document</p>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <MdClose size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <TextInput
            label="File Name"
            placeholder="Enter file name"
            {...register("name")}
            error={errors.name?.message}
            autoFocus
          />

          <div className="flex gap-2">
            <Button
              label="Cancel"
              variant="outlined"
              onClick={onCancel}
              className="flex-1"
              disabled={loading}
            />
            <Button
              label="Save"
              variant="contained"
              className="flex-1"
              loading={loading}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenameDocumentModal;
