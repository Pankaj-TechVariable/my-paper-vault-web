import { MdOutlineLock } from "react-icons/md";

const Security = () => (
  <div className="h-full flex flex-col px-4 md:px-8 py-6">
    <div className="mb-5 shrink-0">
      <h1 className="text-xl font-bold text-slate-900 mb-1">Security</h1>
      <p className="text-xs text-slate-400">Manage your password, sessions, and account security</p>
    </div>
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
          <MdOutlineLock size={24} />
        </div>
        <p className="text-sm font-semibold text-slate-500">Coming soon</p>
        <p className="text-xs text-slate-400">Security settings will be available here.</p>
      </div>
    </div>
  </div>
);

export default Security;
