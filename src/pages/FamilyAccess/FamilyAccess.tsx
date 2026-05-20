import { useState } from "react";
import {
  MdOutlinePeopleAlt,
  MdOutlineFolderOpen,
  MdOutlineDescription,
  MdOutlineShare,
} from "react-icons/md";
import { useListAccessGrants } from "@/hooks/useFamilyAccess";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import StatCard from "@/components/common/StatCard/StatCard";
import Button from "@/components/common/Button/Button";
import AccessGrantCard from "./components/AccessGrantCard";
import AccessGrantSkeletonCard from "./components/AccessGrantSkeletonCard";
import EmptyGrantsState from "./components/EmptyGrantsState";
import ShareAccessPanel from "./components/ShareAccessPanel";

const FamilyAccess = () => {
  const [panelOpen, setPanelOpen] = useState(false);
  const canManageFamily = useSubscriptionStore((s) => s.canManageFamily());
  const { data, isLoading } = useListAccessGrants();

  const grants = data?.data ?? [];

  const totalMembers = grants.length;
  const totalDirectories = grants.reduce(
    (sum, g) => sum + g.directories.length,
    0,
  );
  const totalDocuments = grants.reduce(
    (sum, g) => sum + g.directories.reduce((s, d) => s + d.document_count, 0),
    0,
  );

  return (
    <div className="px-4 md:px-8 py-6">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Family Access</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage who can view, upload, or download your document folders
          </p>
        </div>
        <Button
          label="Share Access"
          variant="contained"
          onClick={() => setPanelOpen(true)}
          disabled={!canManageFamily}
        />
      </div>

      <ShareAccessPanel open={panelOpen} onClose={() => setPanelOpen(false)} />

      {/* Summary stats */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6">
        <StatCard
          label="Family Members"
          icon={<MdOutlinePeopleAlt size={16} />}
          isLoading={isLoading}
          skeleton={
            <>
              <div className="h-4 w-8 bg-slate-200 rounded animate-pulse mb-1" />
              <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
            </>
          }
        >
          <p className="text-sm font-bold text-slate-900">{totalMembers}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {totalMembers === 1 ? "person has" : "people have"} access
          </p>
        </StatCard>

        <StatCard
          label="Shared Folders"
          icon={<MdOutlineFolderOpen size={16} />}
          isLoading={isLoading}
          skeleton={
            <>
              <div className="h-4 w-8 bg-slate-200 rounded animate-pulse mb-1" />
              <div className="h-3 w-28 bg-slate-100 rounded animate-pulse" />
            </>
          }
        >
          <p className="text-sm font-bold text-slate-900">{totalDirectories}</p>
          <p className="text-xs text-slate-400 mt-0.5">across all members</p>
        </StatCard>

        <StatCard
          label="Documents Accessible"
          icon={<MdOutlineDescription size={16} />}
          isLoading={isLoading}
          skeleton={
            <>
              <div className="h-4 w-8 bg-slate-200 rounded animate-pulse mb-1" />
              <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
            </>
          }
        >
          <p className="text-sm font-bold text-slate-900">{totalDocuments}</p>
          <p className="text-xs text-slate-400 mt-0.5">total shared files</p>
        </StatCard>
      </div>

      {/* Member grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <AccessGrantSkeletonCard key={i} />
          ))
        ) : grants.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-100 p-4">
            <EmptyGrantsState />
          </div>
        ) : (
          grants.map((grant) => (
            <AccessGrantCard key={grant.id} grant={grant} />
          ))
        )}
      </div>
    </div>
  );
};

export default FamilyAccess;
