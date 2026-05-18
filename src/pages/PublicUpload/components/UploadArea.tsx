import { useState, useRef, useCallback, createElement } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  MdOutlineCloudUpload,
  MdOutlineLock,
  MdErrorOutline,
  MdArrowForward,
  MdShield,
  MdEdit,
  MdClose,
  MdAdd,
} from 'react-icons/md';
import Button from '@/components/common/Button/Button';
import TextInput from '@/components/common/TextInput/TextInput';
import {
  getPublicPresignedUrl,
  confirmPublicUpload,
  uploadToS3Public,
} from '@/api/endpoints/uploadLinks';
import type { PublicLinkInfo } from '@/api/endpoints/uploadLinks';
import { formatFileSize, getMimeIcon } from '@/utils/document.utils';
import { queryKeys } from '@/api/queryKeys';

interface FileEntry {
  id: string;
  file: File;
  baseName: string;
  ext: string;
  sizeError: string | null;
}

interface UploadAreaProps {
  token: string;
  info: PublicLinkInfo;
  slotsRemaining: number;
  onSuccess: (count: number) => void;
}

const getFileParts = (name: string): { base: string; ext: string } => {
  const lastDot = name.lastIndexOf('.');
  if (lastDot <= 0) return { base: name, ext: '' };
  return { base: name.slice(0, lastDot), ext: name.slice(lastDot) };
};

const isAllowedType = (type: string) =>
  type.startsWith('image/') || type === 'application/pdf';

const UploadArea = ({ token, info, slotsRemaining, onSuccess }: UploadAreaProps) => {
  const queryClient = useQueryClient();

  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [uploaderName, setUploaderName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [typeError, setTypeError] = useState<string | null>(null);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(0);
  const [fileProgress, setFileProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasErrors = entries.some((e) => e.sizeError !== null);
  const canAddMore = entries.length < slotsRemaining && !isUploading;

  const addFiles = useCallback(
    (incoming: File[]) => {
      setTypeError(null);
      setSlotError(null);

      const validType = incoming.filter((f) => isAllowedType(f.type));
      const skipped = incoming.length - validType.length;
      if (skipped > 0) {
        setTypeError(
          `${skipped} file${skipped > 1 ? 's were' : ' was'} skipped — only images and PDFs are allowed.`,
        );
      }

      const available = slotsRemaining - entries.length;
      const toAdd = validType.slice(0, available);
      if (validType.length > available) {
        setSlotError(
          `Only ${available} more file${available !== 1 ? 's' : ''} can be added (${slotsRemaining}-file limit).`,
        );
      }

      const newEntries: FileEntry[] = toAdd.map((f) => {
        const { base, ext } = getFileParts(f.name);
        return {
          id: crypto.randomUUID(),
          file: f,
          baseName: base,
          ext,
          sizeError:
            f.size > info.max_file_size
              ? `Exceeds ${formatFileSize(info.max_file_size)} limit`
              : null,
        };
      });

      setEntries((prev) => [...prev, ...newEntries]);
    },
    [entries.length, slotsRemaining, info.max_file_size],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) addFiles(files);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) addFiles(files);
  };

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setSlotError(null);
    setUploadError(null);
  };

  const commitEdit = () => {
    if (!editingId) return;
    const trimmed = editingValue.trim();
    if (trimmed) {
      setEntries((prev) =>
        prev.map((e) => (e.id === editingId ? { ...e, baseName: trimmed } : e)),
      );
    }
    setEditingId(null);
  };

  const validate = (): boolean => {
    let ok = true;
    if (!uploaderName.trim()) {
      setNameError('Your name is required');
      ok = false;
    }
    if (info.is_pin_protected && !pin.trim()) {
      setPinError('PIN is required');
      ok = false;
    }
    return ok;
  };

  const handleUpload = async () => {
    if (!validate() || entries.length === 0 || hasErrors || isUploading) return;

    setIsUploading(true);
    setUploadError(null);

    const baseBody = {
      uploader_name: uploaderName.trim(),
      ...(pin.trim() ? { pin: pin.trim() } : {}),
    };

    try {
      for (let i = 0; i < entries.length; i++) {
        setUploadingIndex(i);
        setFileProgress(0);
        const entry = entries[i];
        const fileName = entry.baseName + entry.ext;
        const mimeType = entry.file.type || 'application/octet-stream';
        const body = { file_name: fileName, mime_type: mimeType, file_size: entry.file.size, ...baseBody };

        const presignedRes = await getPublicPresignedUrl(token, body);
        if (!presignedRes.success) throw new Error(presignedRes.message);

        const { upload_url, file_key, required_headers } = presignedRes.data;
        await uploadToS3Public(upload_url, entry.file, required_headers, setFileProgress);

        const confirmRes = await confirmPublicUpload(token, { ...body, file_key });
        if (!confirmRes.success) throw new Error(confirmRes.message);
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.uploadLinks.public(token) });
      onSuccess(entries.length);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
      setIsUploading(false);
    }
  };

  const clearAll = () => {
    setEntries([]);
    setUploadError(null);
    setTypeError(null);
    setSlotError(null);
  };

  const overallProgress = isUploading
    ? Math.round(((uploadingIndex + fileProgress / 100) / entries.length) * 100)
    : 0;

  return (
    <div className="px-5 py-5 flex flex-col gap-4">
      {/* Security notice */}
      <div className="flex items-start gap-2.5 bg-green-50 border border-green-100 rounded-xl px-3.5 py-2.5">
        <MdShield size={14} className="text-green-600 shrink-0 mt-0.5" />
        <p className="text-xs text-green-700 leading-relaxed">
          Files are encrypted before storage. Access is controlled by the vault owner.
        </p>
      </div>

      {info.is_pin_protected && (
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-2.5">
          <MdOutlineLock size={14} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            This link is PIN-protected. You'll need the PIN provided by the sender.
          </p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Drop zone (empty state) */}
      {entries.length === 0 && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl px-6 py-8 cursor-pointer transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-slate-200 bg-slate-50 hover:border-primary/40 hover:bg-primary/5'
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <MdOutlineCloudUpload size={22} className="text-slate-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700">Drag & drop files here</p>
            <p className="text-xs text-slate-400 mt-0.5">
              or click to browse — up to {slotsRemaining} file{slotsRemaining !== 1 ? 's' : ''}
            </p>
          </div>
          <p className="text-xs text-slate-400">Images & PDFs · Max {formatFileSize(info.max_file_size)} each</p>
        </div>
      )}

      {/* File list */}
      {entries.length > 0 && (
        <div className="flex flex-col gap-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className={`rounded-xl border px-3 py-2.5 ${
                entry.sizeError ? 'border-red-200 bg-red-50' : 'border-slate-100 bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {/* File icon */}
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0">
                  {createElement(getMimeIcon(entry.file.type), {
                    size: 15,
                    className: entry.file.type === 'application/pdf' ? 'text-red-400' : 'text-blue-400',
                  })}
                </div>

                {/* Name + size */}
                <div className="flex-1 min-w-0">
                  {editingId === entry.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        autoFocus
                        className="flex-1 min-w-0 text-sm font-medium text-slate-800 bg-white border border-primary rounded px-1.5 py-0.5 outline-none"
                        value={editingValue}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitEdit();
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        onBlur={commitEdit}
                      />
                      {entry.ext && (
                        <span className="text-sm text-slate-400 shrink-0">{entry.ext}</span>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => {
                        setEditingId(entry.id);
                        setEditingValue(entry.baseName);
                      }}
                      className="flex items-center gap-1 group w-full text-left disabled:pointer-events-none"
                    >
                      <span className="text-sm font-medium text-slate-800 truncate">
                        {entry.baseName}
                        <span className="text-slate-400">{entry.ext}</span>
                      </span>
                      {!isUploading && (
                        <MdEdit
                          size={12}
                          className="text-slate-300 group-hover:text-primary shrink-0 transition-colors"
                        />
                      )}
                    </button>
                  )}
                  <p className="text-xs text-slate-400 mt-0.5">{formatFileSize(entry.file.size)}</p>
                </div>

                {/* Remove button */}
                {!isUploading && (
                  <button
                    type="button"
                    onClick={() => removeEntry(entry.id)}
                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                  >
                    <MdClose size={14} />
                  </button>
                )}
              </div>

              {entry.sizeError && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <MdErrorOutline size={12} className="shrink-0" />
                  {entry.sizeError}
                </p>
              )}
            </div>
          ))}

          {/* Add more */}
          {canAddMore && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-slate-200 text-slate-400 hover:border-primary/40 hover:text-primary hover:bg-primary/5'
              }`}
            >
              <MdAdd size={16} />
              Add more ({slotsRemaining - entries.length} slot
              {slotsRemaining - entries.length !== 1 ? 's' : ''} left)
            </button>
          )}
        </div>
      )}

      {/* Type / slot warnings */}
      {typeError && (
        <p className="text-xs text-amber-600 flex items-center gap-1 -mt-2">
          <MdErrorOutline size={13} className="shrink-0" />
          {typeError}
        </p>
      )}
      {slotError && (
        <p className="text-xs text-amber-600 flex items-center gap-1 -mt-2">
          <MdErrorOutline size={13} className="shrink-0" />
          {slotError}
        </p>
      )}

      {/* PIN */}
      {info.is_pin_protected && (
        <TextInput
          label="PIN"
          type="text"
          inputMode="numeric"
          placeholder="Enter the PIN provided by the sender"
          value={pin}
          error={pinError ?? undefined}
          onChange={(e) => {
            setPin(e.target.value);
            if (pinError) setPinError(null);
          }}
        />
      )}

      {/* Uploader name — required */}
      <TextInput
        label="Your name"
        type="text"
        placeholder="So the recipient knows who sent this"
        value={uploaderName}
        error={nameError ?? undefined}
        onChange={(e) => {
          setUploaderName(e.target.value);
          if (nameError) setNameError(null);
        }}
      />

      {/* Upload progress */}
      {isUploading && (
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-medium">
              Uploading file {uploadingIndex + 1} of {entries.length}…
            </span>
            <span className="font-semibold text-primary">{overallProgress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-200"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload error */}
      {uploadError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3.5 py-3">
          <MdErrorOutline size={15} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">{uploadError}</p>
        </div>
      )}

      {/* CTA */}
      <div className="flex gap-2 pt-1">
        <Button
          label={
            uploadError
              ? 'Retry'
              : entries.length > 1
                ? `Send Securely (${entries.length})`
                : 'Send Securely'
          }
          variant="contained"
          endIcon={!isUploading ? <MdArrowForward size={16} /> : undefined}
          className="flex-1 justify-center h-11 rounded-xl"
          loading={isUploading}
          disabled={entries.length === 0 || hasErrors}
          onClick={handleUpload}
        />
        {entries.length > 0 && !isUploading && (
          <Button label="Clear" variant="outlined" className="rounded-xl" onClick={clearAll} />
        )}
      </div>
    </div>
  );
};

export default UploadArea;
