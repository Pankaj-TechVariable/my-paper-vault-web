import { createElement } from "react";
import type { Directory } from "@/api/endpoints/directories";
import { getCategoryStyle } from "@/constants/categoryStyles";

interface DirectoryChipsProps {
  directories: Directory[];
  selected: string | null;
  isLoading: boolean;
  onSelect: (id: string | null) => void;
}

const ChipSkeleton = () => (
  <div className="h-7 w-20 rounded-full bg-slate-100 animate-pulse shrink-0" />
);

const DirectoryChips = ({
  directories,
  selected,
  isLoading,
  onSelect,
}: DirectoryChipsProps) => (
  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none shrink-0">
    {isLoading ? (
      <>
        <div className="h-7 w-10 rounded-full bg-slate-100 animate-pulse shrink-0" />
        {Array.from({ length: 5 }).map((_, i) => (
          <ChipSkeleton key={i} />
        ))}
      </>
    ) : (
      <>
        <button
          onClick={() => onSelect(null)}
          className={`shrink-0 h-7 px-3 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
            selected === null
              ? "bg-primary text-white"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          All
        </button>

        {directories.map((dir) => {
          const style = getCategoryStyle(dir.category?.type ?? "");
          const isActive = selected === dir.id;

          return (
            <button
              key={dir.id}
              onClick={() => onSelect(dir.id)}
              className={`shrink-0 h-7 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border-2 ${style.bgColor}`}
              style={{
                color: style.iconColor,
                borderColor: isActive ? style.iconColor : "transparent",
              }}
            >
              {createElement(style.icon, { size: 10, color: style.iconColor })}
              {dir.name}
            </button>
          );
        })}
      </>
    )}
  </div>
);

export default DirectoryChips;
