const VaultSkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5">
    {/* Grantor header */}
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="h-3.5 w-32 bg-slate-100 rounded animate-pulse mb-2" />
        <div className="h-3 w-44 bg-slate-100 rounded animate-pulse" />
      </div>
      <div className="h-5 w-16 bg-slate-100 rounded-full animate-pulse shrink-0" />
    </div>

    <div className="h-px bg-slate-100 mb-3" />

    {/* Directory rows */}
    <div className="flex flex-col gap-3">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-100 animate-pulse shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="h-3 w-28 bg-slate-100 rounded animate-pulse" />
              <div className="h-3 w-10 bg-slate-100 rounded-full animate-pulse" />
              <div className="h-3 w-14 bg-slate-100 rounded-full animate-pulse" />
            </div>
            <div className="h-2.5 w-16 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>

    {/* Footer */}
    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between">
      <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
      <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
    </div>
  </div>
);

export default VaultSkeletonCard;
