const PlanCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5">
    <div className="h-4 w-28 bg-slate-100 rounded animate-pulse mb-2" />
    <div className="h-8 w-20 bg-slate-100 rounded animate-pulse mb-5" />
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="h-3 w-full bg-slate-100 rounded animate-pulse mb-2.5" />
    ))}
    <div className="h-10 w-full bg-slate-100 rounded-xl animate-pulse mt-5" />
  </div>
);

export default PlanCardSkeleton;
