import { useState } from "react";
import { MdOutlineLink } from "react-icons/md";
import { useUploadLinks } from "@/hooks/useUploadLinks";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import type { GetUploadLinksParams } from "@/api/endpoints/uploadLinksPrivate";
import Button from "@/components/common/Button/Button";
import LinkItem from "./components/LinkItem";
import LinkSkeletonItem from "./components/LinkSkeletonItem";
import EmptyLinksState from "./components/EmptyLinksState";
import GenerateLinkPanel from "./components/GenerateLinkPanel";

type FilterType = "all" | "active" | "inactive";

const FILTERS: { label: string; value: FilterType }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const filterToParams = (filter: FilterType): GetUploadLinksParams | undefined => {
  if (filter === "active") return { active: "true" };
  if (filter === "inactive") return { active: "false" };
  return undefined;
};

const MyLinks = () => {
  const [filter, setFilter] = useState<FilterType>("all");
  const [panelOpen, setPanelOpen] = useState(false);
  const { data, isLoading } = useUploadLinks(filterToParams(filter));
  const canManageFamily = useSubscriptionStore((s) => s.canManageFamily());
  const links = data?.data ?? [];

  return (
    <div className="h-full flex flex-col overflow-hidden px-4 md:px-8 py-6">
      <div className="mb-5 shrink-0">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h1 className="text-xl font-bold text-slate-900">My Upload Links</h1>
          <Button
            label="Generate Link"
            variant="contained"
            startIcon={<MdOutlineLink size={16} className="text-white" />}
            className="h-auto! py-1.5! px-3! text-xs! shrink-0"
            disabled={!canManageFamily}
            onClick={() => setPanelOpen(true)}
          />
        </div>
        <p className="text-xs text-slate-400 mb-4">
          {isLoading
            ? "Loading..."
            : `${links.length} link${links.length !== 1 ? "s" : ""}`}
        </p>

        <div className="flex gap-2">
          {FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                filter === value
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <LinkSkeletonItem key={i} />)
          ) : links.length === 0 ? (
            <EmptyLinksState filter={filter} />
          ) : (
            links.map((link) => <LinkItem key={link.id} link={link} />)
          )}
        </div>
      </div>

      <GenerateLinkPanel isOpen={panelOpen} onClose={() => setPanelOpen(false)} />
    </div>
  );
};

export default MyLinks;
