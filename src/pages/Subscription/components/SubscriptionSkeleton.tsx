const SubscriptionSkeleton = () => (
  <div className="h-full flex flex-col overflow-hidden px-4 md:px-8 py-6">
    <div className="mb-5 shrink-0">
      <div className="h-6 w-36 bg-slate-100 rounded animate-pulse mb-2" />
      <div className="h-3.5 w-52 bg-slate-100 rounded animate-pulse" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-2xl bg-slate-200 animate-pulse h-64" />
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-slate-100 animate-pulse shrink-0" />
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="h-3.5 w-32 bg-slate-100 rounded animate-pulse" />
            <div className="h-3 w-44 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
        {[1, 2, 3, 4].map((j) => (
          <div key={j} className="h-3 w-full bg-slate-100 rounded animate-pulse mb-3" />
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 p-5 lg:col-span-2">
        <div className="h-3.5 w-16 bg-slate-100 rounded animate-pulse mb-3" />
        <div className="h-3 w-full bg-slate-200 rounded animate-pulse mb-1.5" />
        <div className="h-2 w-full bg-slate-100 rounded-full animate-pulse" />
      </div>
    </div>
  </div>
);

export default SubscriptionSkeleton;
