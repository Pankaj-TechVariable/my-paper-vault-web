import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdOutlineStorage } from "react-icons/md";
import { IoMdDocument } from "react-icons/io";
import { FaShieldAlt } from "react-icons/fa";
import { useDocumentCount } from "@/hooks/useDocuments";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import StatCard from "@/components/common/StatCard/StatCard";
import StorageBar from "@/components/common/StorageBar/StorageBar";
import GenerateLinkPanel from "@/pages/MyLinks/components/GenerateLinkPanel";
import RecentDocuments from "./components/RecentDocuments";
import PlanCard from "./components/PlanCard";
import { quickActions, securityItems } from "./homeConstants";

const Home = () => {
  const navigate = useNavigate();
  const [generateLinkOpen, setGenerateLinkOpen] = useState(false);
  const { data, isLoading } = useDocumentCount();
  const storage = useSubscriptionStore((s) => s.storage);
  const isSubscriptionLoaded = useSubscriptionStore((s) => s.isLoaded);

  const total = data?.data.total ?? 0;

  const byDirectory = data?.data.by_directory ?? [];
  const isOther = (name: string) =>
    name.trim().toLowerCase() === "other important documents";

  const ranked = [...byDirectory]
    .filter((d) => !isOther(d.directory_name))
    .sort((a, b) => b.count - a.count);

  const top2 = ranked.slice(0, 2);
  const otherCount =
    ranked.slice(2).reduce((sum, d) => sum + d.count, 0) +
    byDirectory
      .filter((d) => isOther(d.directory_name))
      .reduce((sum, d) => sum + d.count, 0);

  const displayStats = [
    ...top2.map((d) => ({ label: d.directory_name, count: d.count })),
    ...(otherCount > 0 ? [{ label: "Other", count: otherCount }] : []),
  ];

  return (
    <>
    <div className="px-4 md:px-8 py-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard
          label="Vault Status"
          indicator={
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          }
        >
          <p className="text-sm font-bold text-green-600">Secure</p>
          <p className="text-xs text-slate-400 mt-0.5">
            All systems operational
          </p>
        </StatCard>

        <StatCard
          label="Total Documents"
          icon={<IoMdDocument size={16} />}
          isLoading={isLoading}
          skeleton={
            <>
              <div className="h-4 w-8 bg-slate-200 rounded animate-pulse mb-2" />
              <div className="flex gap-2 mt-1.5">
                <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
                <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
                <div className="h-3 w-12 bg-slate-100 rounded animate-pulse" />
              </div>
            </>
          }
        >
          <p className="text-sm font-bold text-slate-900">{total}</p>
          <div className="flex gap-2 mt-1.5 flex-wrap">
            {displayStats.map((stat, i) => (
              <span key={i} className="text-xs text-slate-400">
                {stat.label}: {stat.count}
              </span>
            ))}
          </div>
        </StatCard>

        <StatCard
          label="Storage Used"
          icon={<MdOutlineStorage size={16} />}
          isLoading={!isSubscriptionLoaded}
          skeleton={
            <>
              <div className="h-3 w-28 bg-slate-100 rounded animate-pulse mb-2" />
              <div className="h-1.5 w-full bg-slate-100 rounded-full animate-pulse mb-1.5" />
              <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
            </>
          }
        >
          {storage ? (
            <StorageBar
              usedBytes={storage.used_bytes}
              totalBytes={storage.total_bytes}
              usedPercent={storage.used_percent}
              threshold={storage.threshold}
            />
          ) : (
            <p className="text-xs text-slate-400">No storage data</p>
          )}
        </StatCard>

        <StatCard label="MFA & Encryption" icon={<FaShieldAlt size={16} />}>
          <p className="text-sm font-bold text-primary">Active</p>
          <p className="text-xs text-slate-400 mt-0.5">Last login: Today</p>
        </StatCard>
      </div>

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        <RecentDocuments />

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-3">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((qa) => (
                <button
                  key={qa.title}
                  onClick={() =>
                    qa.action === "generate-link"
                      ? setGenerateLinkOpen(true)
                      : navigate(qa.to)
                  }
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-center"
                >
                  <span className="text-primary">{qa.icon}</span>
                  <span className="text-xs font-semibold text-slate-800">
                    {qa.title}
                  </span>
                  <span className="text-xs text-slate-400">{qa.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Plan card */}
          <PlanCard />

          {/* Security Status */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-3">
              Security Status
            </h2>
            <div className="flex flex-col gap-2.5">
              {securityItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="flex items-center gap-1.5 text-slate-500">
                    {item.icon} {item.label}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-medium ${item.badgeClass}`}
                  >
                    {item.badge}
                  </span>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl py-2 hover:bg-slate-50 transition-colors cursor-pointer">
              Manage Security →
            </button>
          </div>
        </div>
      </div>
    </div>

    <GenerateLinkPanel
      isOpen={generateLinkOpen}
      onClose={() => setGenerateLinkOpen(false)}
    />
    </>
  );
};

export default Home;
