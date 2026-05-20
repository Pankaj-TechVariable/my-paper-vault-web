import { MdOutlinePeopleAlt } from "react-icons/md";

const EmptyGrantsState = () => {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
        <MdOutlinePeopleAlt size={28} className="text-primary" />
      </div>
      <p className="text-sm font-semibold text-slate-800 mb-1">
        No family members added yet
      </p>
      <p className="text-xs text-slate-400 max-w-xs">
        Share access to your document folders with trusted family members so
        they can view, upload, or download important files.
      </p>
    </div>
  );
};

export default EmptyGrantsState;
