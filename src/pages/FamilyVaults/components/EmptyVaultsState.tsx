import { MdOutlineFolderSpecial } from "react-icons/md";

const EmptyVaultsState = () => (
  <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
      <MdOutlineFolderSpecial size={28} className="text-primary" />
    </div>
    <p className="text-sm font-semibold text-slate-800 mb-1">
      No shared vaults yet
    </p>
    <p className="text-xs text-slate-400 max-w-xs">
      When a family member shares their document folders with you, they will
      appear here.
    </p>
  </div>
);

export default EmptyVaultsState;
