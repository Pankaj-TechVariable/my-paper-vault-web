import { useNavigate } from "react-router-dom";
import StatCard from "@/components/common/StatCard/StatCard";
import {
  MdOutlineArchive,
  MdOutlinePeopleAlt,
  MdOutlineFolderSpecial,
  MdOutlineLink,
  MdOutlineShield,
  MdOutlineLock,
  MdOutlineStorage,
} from "react-icons/md";
import { IoMdDocument } from "react-icons/io";
import { FaShieldAlt } from "react-icons/fa";
import { useDocumentCount } from "@/hooks/useDocuments";

const recentDocs = [
  {
    name: "Certificate of Occupancy",
    category: "Land & Property",
    badgeClass: "bg-blue-100 text-blue-700",
    thumbBg: "bg-green-100 text-green-700",
    date: "Jan 15, 2024",
    access: "Owner",
  },
  {
    name: "National ID Card",
    category: "Identity",
    badgeClass: "bg-purple-100 text-purple-700",
    thumbBg: "bg-purple-100 text-purple-700",
    date: "Jan 12, 2024",
    access: "Link",
  },
  {
    name: "International Passport",
    category: "Government",
    badgeClass: "bg-blue-100 text-blue-700",
    thumbBg: "bg-blue-100 text-blue-700",
    date: "Jan 10, 2024",
    access: "Owner",
  },
  {
    name: "Court Judgment Document",
    category: "Legal",
    badgeClass: "bg-orange-100 text-orange-700",
    thumbBg: "bg-orange-100 text-orange-700",
    date: "Jan 8, 2024",
    access: "Owner",
  },
  {
    name: "Bank Statement",
    category: "Financial",
    badgeClass: "bg-green-100 text-green-700",
    thumbBg: "bg-green-100 text-green-700",
    date: "Jan 5, 2024",
    access: "Owner",
  },
];

const quickActions = [
  {
    icon: <MdOutlineArchive size={22} />,
    title: "Document Archive",
    desc: "Browse all documents",
    to: "/documents",
  },
  {
    icon: <MdOutlinePeopleAlt size={22} />,
    title: "Family Access",
    desc: "Manage sharing",
    to: "/family",
  },
  {
    icon: <MdOutlineFolderSpecial size={22} />,
    title: "Family Vaults",
    desc: "Shared with you",
    to: "/vaults",
  },
  {
    icon: <MdOutlineLink size={22} />,
    title: "Create Link",
    desc: "Secure upload link",
    to: "/links",
  },
];

const securityItems = [
  {
    label: "MFA",
    icon: <MdOutlineLock size={14} />,
    badge: "Enabled",
    badgeClass: "bg-green-100 text-green-700",
  },
  {
    label: "Encryption",
    icon: <MdOutlineShield size={14} />,
    badge: "Active",
    badgeClass: "bg-green-100 text-green-700",
  },
  {
    label: "Active Links",
    icon: <MdOutlineLink size={14} />,
    badge: "4 links",
    badgeClass: "bg-blue-100 text-blue-700",
  },
  {
    label: "Family Access",
    icon: <MdOutlinePeopleAlt size={14} />,
    badge: "3 members",
    badgeClass: "bg-blue-100 text-blue-700",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useDocumentCount();

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
    { label: "Other", count: otherCount },
  ];

  return (
    <div className="px-4 md:px-8 py-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard
          label="Vault Status"
          indicator={<span className="w-2 h-2 rounded-full bg-green-500 inline-block" />}
        >
          <p className="text-sm font-bold text-green-600">Secure</p>
          <p className="text-xs text-slate-400 mt-0.5">All systems operational</p>
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
            {displayStats.map((stat) => (
              <span key={stat.label} className="text-xs text-slate-400">
                {stat.label}: {stat.count}
              </span>
            ))}
          </div>
        </StatCard>

        <StatCard label="Storage Used" icon={<MdOutlineStorage size={16} />}>
          <p className="text-sm font-bold text-slate-900">47%</p>
          <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: "47%" }} />
          </div>
          <p className="text-xs text-slate-400 mt-1">Family Plan · 5 GB</p>
        </StatCard>

        <StatCard label="MFA & Encryption" icon={<FaShieldAlt size={16} />}>
          <p className="text-sm font-bold text-primary">Active</p>
          <p className="text-xs text-slate-400 mt-0.5">Last login: Today</p>
        </StatCard>
      </div>

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Recent Documents */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">
              Recent Documents
            </h2>
            <button className="text-xs text-primary hover:underline cursor-pointer">
              View all →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-slate-100">
                  <th className="pb-2 text-left font-medium w-8"></th>
                  <th className="pb-2 text-left font-medium">Document Name</th>
                  <th className="pb-2 text-left font-medium hidden sm:table-cell">
                    Category
                  </th>
                  <th className="pb-2 text-left font-medium hidden md:table-cell">
                    Date Added
                  </th>
                  <th className="pb-2 text-left font-medium">Access</th>
                </tr>
              </thead>
              <tbody>
                {recentDocs.map((doc) => (
                  <tr
                    key={doc.name}
                    className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 pr-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${doc.thumbBg}`}
                      >
                        PDF
                      </div>
                    </td>
                    <td className="py-2.5 pr-3 font-medium text-slate-800 text-xs md:text-sm">
                      {doc.name}
                    </td>
                    <td className="py-2.5 pr-3 hidden sm:table-cell">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${doc.badgeClass}`}
                      >
                        {doc.category}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-xs text-slate-400 hidden md:table-cell">
                      {doc.date}
                    </td>
                    <td className="py-2.5">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                        {doc.access}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

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
                  onClick={() => navigate(qa.to)}
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
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 cursor-pointer hover:border-amber-300 transition-colors">
            <p className="text-xs font-semibold text-amber-800 mb-2">
              👑 Family Plan — Currently Active
            </p>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-slate-500">6 of 20 documents</span>
              <span className="text-xs font-bold text-amber-600">30%</span>
            </div>
            <div className="h-1.5 bg-amber-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{ width: "30%" }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Renews March 16, 2026 · ₦10,000
            </p>
          </div>

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
  );
};

export default Home;
