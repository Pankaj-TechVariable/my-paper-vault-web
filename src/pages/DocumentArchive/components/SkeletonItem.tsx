const SkeletonItem = () => (
  <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100">
    <div className="w-11 h-11 shrink-0 rounded-xl bg-slate-100 animate-pulse" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 w-48 bg-slate-100 rounded animate-pulse" />
      <div className="h-5 w-24 bg-slate-100 rounded-xl animate-pulse" />
      <div className="flex gap-3">
        <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
        <div className="h-3 w-14 bg-slate-100 rounded animate-pulse" />
      </div>
    </div>
  </div>
);

export default SkeletonItem;
