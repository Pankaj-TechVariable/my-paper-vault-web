import { MdOutlineShield } from "react-icons/md";

const TwoFactorCard = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
      <MdOutlineShield size={18} className="text-green-500" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-0.5">
        <p className="text-sm font-semibold text-slate-800">Two-Factor Authentication</p>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">
          Coming soon
        </span>
      </div>
      <p className="text-xs text-slate-400">Add an extra layer of security to your account</p>
    </div>
    {/* Disabled toggle */}
    <div className="shrink-0 opacity-40 cursor-not-allowed">
      <div className="w-9 h-5 rounded-full bg-slate-200 relative">
        <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
      </div>
    </div>
  </div>
);

export default TwoFactorCard;
