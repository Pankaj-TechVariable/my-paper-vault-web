const LinkDetailsSkeleton = () => (
  <div className="flex flex-col gap-4">
    {/* Header */}
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-slate-100 rounded-full animate-pulse" />
          <div className="h-5 w-12 bg-slate-100 rounded-full animate-pulse" />
        </div>
      </div>
    </div>

    {/* Info card */}
    <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
      <div className="h-7 w-full bg-slate-100 rounded-lg animate-pulse" />
      <div className="space-y-3 pt-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
            <div className="w-4 h-4 bg-slate-100 rounded animate-pulse shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-2.5 w-14 bg-slate-100 rounded animate-pulse" />
              <div className="h-3.5 w-36 bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Progress card */}
    <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
      <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
      <div className="flex justify-between">
        <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
        <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
      </div>
      <div className="h-2.5 w-full bg-slate-100 rounded-full animate-pulse" />
    </div>

    {/* History card */}
    <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
      <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
          <div className="w-8 h-8 rounded-lg bg-slate-100 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-32 bg-slate-100 rounded animate-pulse" />
            <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
          </div>
          <div className="h-7 w-14 rounded-lg bg-slate-100 animate-pulse" />
        </div>
      ))}
    </div>
  </div>
);

export default LinkDetailsSkeleton;
