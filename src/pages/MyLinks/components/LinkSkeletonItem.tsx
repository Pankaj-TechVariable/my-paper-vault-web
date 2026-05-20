const LinkSkeletonItem = () => (
  <div className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 bg-white">
    <div className="w-10 h-10 shrink-0 rounded-xl bg-slate-100 animate-pulse" />
    <div className="flex-1 min-w-0 space-y-2">
      <div className="h-3.5 w-44 bg-slate-100 rounded animate-pulse" />
      <div className="flex gap-2">
        <div className="h-5 w-20 bg-slate-100 rounded-full animate-pulse" />
        <div className="h-5 w-14 bg-slate-100 rounded-full animate-pulse" />
      </div>
      <div className="flex gap-3">
        <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
        <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
        <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
      </div>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <div className="w-8 h-8 rounded-lg bg-slate-100 animate-pulse" />
      <div className="h-7 w-24 rounded-lg bg-slate-100 animate-pulse" />
    </div>
  </div>
);

export default LinkSkeletonItem;
