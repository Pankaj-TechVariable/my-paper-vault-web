import type { IconType } from "react-icons";
import {
  FaFile,
  FaFileImage,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
} from "react-icons/fa6";

export const getMimeIcon = (mimeType: string): IconType => {
  if (mimeType.startsWith("image/")) return FaFileImage;
  if (mimeType === "application/pdf") return FaFilePdf;
  if (mimeType.includes("word") || mimeType.includes("document"))
    return FaFileWord;
  if (mimeType.includes("sheet") || mimeType.includes("excel"))
    return FaFileExcel;
  return FaFile;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
