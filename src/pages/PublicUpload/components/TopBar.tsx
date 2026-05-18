import logo from "@/assets/logo/logo.png";

const TopBar = () => (
  <header className="w-full bg-white border-b border-slate-100 px-5 py-3.5 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <img
        src={logo}
        alt="MyPaperVault"
        className="w-10 h-auto object-contain"
      />
      <span
        className="font-extrabold text-base text-slate-900 tracking-tight"
        style={{ fontFamily: "'Sora', sans-serif" }}
      >
        MyPaperVault
      </span>
    </div>
    <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-full px-3 py-1">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
      <span className="text-xs font-medium text-green-700">
        Secure Connection
      </span>
    </div>
  </header>
);

export default TopBar;
