const MemberSkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4">
    <div className="w-11 h-11 rounded-full bg-slate-100 animate-pulse shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 w-36 bg-slate-100 rounded animate-pulse" />
      <div className="h-3 w-48 bg-slate-100 rounded animate-pulse" />
      <div className="h-5 w-20 bg-slate-100 rounded-full animate-pulse" />
    </div>
    <div className="h-7 w-20 rounded-lg bg-slate-100 animate-pulse shrink-0" />
  </div>
);

export default MemberSkeletonCard;
