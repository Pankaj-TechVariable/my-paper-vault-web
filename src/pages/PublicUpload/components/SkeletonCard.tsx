const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="px-6 pt-8 pb-6 flex flex-col items-center border-b border-slate-100">
      <div className="w-14 h-14 rounded-full bg-slate-100 mb-4" />
      <div className="h-6 w-48 bg-slate-100 rounded mb-2" />
      <div className="h-4 w-56 bg-slate-100 rounded mb-3" />
      <div className="h-6 w-32 bg-slate-100 rounded-full" />
    </div>
    <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col items-center gap-2 py-4">
          <div className="w-8 h-8 bg-slate-100 rounded-lg" />
          <div className="h-3 w-12 bg-slate-100 rounded" />
          <div className="h-4 w-10 bg-slate-100 rounded" />
        </div>
      ))}
    </div>
    <div className="p-6">
      <div className="h-32 bg-slate-50 border-2 border-dashed border-slate-100 rounded-xl" />
    </div>
  </div>
);

export default SkeletonCard;
