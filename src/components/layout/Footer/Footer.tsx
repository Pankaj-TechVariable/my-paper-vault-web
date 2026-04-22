import { Link } from "react-router-dom";
import logo from "@/assets/logo/logo.png";

const links = {
  Product: [
    { label: "Plans", to: "/plans" },
    { label: "Security", to: "/security" },
    { label: "How It Works", to: "/#how-it-works" },
  ],
  Company: [
    { label: "About", to: "/about" },
    { label: "Blog", to: "/blog" },
    { label: "Contact", to: "/contact" },
  ],
  Legal: [
    { label: "Privacy", to: "/privacy" },
    { label: "Terms", to: "/terms" },
    { label: "Support", to: "/support" },
  ],
};

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white">
      {/* Main footer */}
      <div className="container py-10 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img src={logo} alt="MyPaperVault" className="w-8 h-8 object-contain" />
              <span
                className="font-extrabold text-sm text-white"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                MyPaperVault
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-52">
              A secure digital vault for land records, identity documents, and
              legal paperwork — built for Nigerian families.
            </p>
          </div>

          {/* Link groups */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                {group}
              </h4>
              <ul className="flex flex-col gap-2">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="text-sm text-slate-300 hover:text-white no-underline transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="container py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span className="text-xs text-slate-500">
            © {new Date().getFullYear()} MyPaperVault. All rights reserved.
          </span>
          <span className="text-xs text-slate-500">
            Built for Nigerian families.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
