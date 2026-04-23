const RecentDocumentSkeletonRow = () => (
  <tr className="border-b border-slate-50">
    <td className="py-2.5 pr-2">
      <div className="w-8 h-8 rounded-lg bg-slate-100 animate-pulse" />
    </td>
    <td className="py-2.5 pr-3">
      <div className="h-3.5 w-40 bg-slate-100 rounded animate-pulse" />
    </td>
    <td className="py-2.5 pr-3 hidden sm:table-cell">
      <div className="h-5 w-20 bg-slate-100 rounded-full animate-pulse" />
    </td>
    <td className="py-2.5 pr-3 hidden md:table-cell">
      <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
    </td>
    <td className="py-2.5 pr-3 hidden md:table-cell">
      <div className="h-3 w-12 bg-slate-100 rounded animate-pulse" />
    </td>
    <td className="py-2.5">
      <div className="h-5 w-14 bg-slate-100 rounded-full animate-pulse" />
    </td>
  </tr>
);

export default RecentDocumentSkeletonRow;
