import {
  MdOutlinePeopleAlt,
  MdOutlineFolderSpecial,
  MdOutlineDescription,
} from "react-icons/md";
import { useMyAccess } from "@/hooks/useFamilyVaults";
import StatCard from "@/components/common/StatCard/StatCard";
import VaultCard from "./components/VaultCard";
import VaultSkeletonCard from "./components/VaultSkeletonCard";
import EmptyVaultsState from "./components/EmptyVaultsState";

const FamilyVaults = () => {
  const { data, isLoading } = useMyAccess();

  const grantors = data?.data ?? [];

  const totalDirectories = grantors.reduce(
    (sum, g) => sum + g.directories.length,
    0,
  );
  const totalDocuments = grantors.reduce(
    (sum, g) => sum + g.directories.reduce((s, d) => s + d.document_count, 0),
    0,
  );

  return (
    <div className="px-4 md:px-8 py-6">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-lg font-bold text-slate-900">My Family Vaults</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Document folders shared with you by your family members
        </p>
      </div>

      {/* Summary stats — hidden on mobile */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6">
        <StatCard
          label="Shared by"
          icon={<MdOutlinePeopleAlt size={16} />}
          isLoading={isLoading}
          skeleton={
            <>
              <div className="h-4 w-8 bg-slate-200 rounded animate-pulse mb-1" />
              <div className="h-3 w-28 bg-slate-100 rounded animate-pulse" />
            </>
          }
        >
          <p className="text-sm font-bold text-slate-900">{grantors.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {grantors.length === 1 ? "family member" : "family members"}
          </p>
        </StatCard>

        <StatCard
          label="Accessible Folders"
          icon={<MdOutlineFolderSpecial size={16} />}
          isLoading={isLoading}
          skeleton={
            <>
              <div className="h-4 w-8 bg-slate-200 rounded animate-pulse mb-1" />
              <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
            </>
          }
        >
          <p className="text-sm font-bold text-slate-900">{totalDirectories}</p>
          <p className="text-xs text-slate-400 mt-0.5">across all members</p>
        </StatCard>

        <StatCard
          label="Total Documents"
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
          <p className="text-xs text-slate-400 mt-0.5">in shared folders</p>
        </StatCard>
      </div>

      {/* Vault grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <VaultSkeletonCard key={i} />
          ))
        ) : grantors.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-100 p-4">
            <EmptyVaultsState />
          </div>
        ) : (
          grantors.map((grantor) => (
            <VaultCard key={grantor.id} grantor={grantor} />
          ))
        )}
      </div>
    </div>
  );
};

export default FamilyVaults;
