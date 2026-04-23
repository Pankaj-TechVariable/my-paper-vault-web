import type { IconType } from "react-icons";
import {
  FaHouse,
  FaLandmark,
  FaIdCard,
  FaGavel,
  FaDollarSign,
  FaBriefcase,
  FaFileLines,
  FaFolder,
} from "react-icons/fa6";

export interface CategoryStyle {
  icon: IconType;
  bgColor: string;
  iconColor: string;
}

// Typos in the API category.type values are intentional (IDENTY, LEAGAL) —
// match them exactly so nothing falls through to the default.
const CATEGORY_STYLE: Record<string, CategoryStyle> = {
  PROPERTY:   { icon: FaHouse,       bgColor: "bg-green-100",   iconColor: "#16a34a" },
  GOVERNMENT: { icon: FaLandmark,    bgColor: "bg-blue-100",    iconColor: "#2563eb" },
  IDENTY:     { icon: FaIdCard,      bgColor: "bg-purple-100",  iconColor: "#9333ea" },
  LEAGAL:     { icon: FaGavel,       bgColor: "bg-orange-100",  iconColor: "#ea580c" },
  FINANCIAL:  { icon: FaDollarSign,  bgColor: "bg-emerald-100", iconColor: "#059669" },
  BUSINESS:   { icon: FaBriefcase,   bgColor: "bg-slate-200",   iconColor: "#475569" },
  OTHER:      { icon: FaFileLines,   bgColor: "bg-indigo-50",   iconColor: "#6366f1" },
};

const DEFAULT_CATEGORY_STYLE: CategoryStyle = {
  icon: FaFolder,
  bgColor: "bg-slate-100",
  iconColor: "#64748b",
};

export const getCategoryStyle = (type: string): CategoryStyle =>
  CATEGORY_STYLE[type] ?? DEFAULT_CATEGORY_STYLE;
