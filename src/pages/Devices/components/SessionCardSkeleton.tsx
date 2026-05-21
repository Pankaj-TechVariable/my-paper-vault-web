const SessionCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-start gap-3">
    <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse shrink-0" />
    <div className="flex-1 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="h-3 w-36 bg-slate-100 rounded animate-pulse" />
        <div className="h-4 w-14 bg-slate-100 rounded-full animate-pulse" />
      </div>
      <div className="h-2.5 w-24 bg-slate-100 rounded animate-pulse" />
      <div className="flex gap-3">
        <div className="h-2.5 w-20 bg-slate-100 rounded animate-pulse" />
        <div className="h-2.5 w-32 bg-slate-100 rounded animate-pulse" />
      </div>
    </div>
  </div>
);

export default SessionCardSkeleton;
