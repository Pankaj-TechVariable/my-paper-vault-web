import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { HiArrowRight, HiMenu, HiX } from "react-icons/hi";
import logo from "@/assets/logo/logo.png";
import Button from "@/components/common/Button/Button";

const navLinks = [
  { label: "Plans", to: "/plans" },
  { label: "Security", to: "/security" },
  { label: "About", to: "/about" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const close = () => setMenuOpen(false);

  return (
    <>
      <nav className="border-b border-slate-100">
        <div className="flex items-center justify-between px-6 md:px-16 py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="MyPaperVault" className="w-12 h-12 object-contain" />
            <span
              className="font-extrabold text-base text-slate-900 tracking-tight"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              MyPaperVault
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-slate-500 hover:text-slate-800 no-underline"
              >
                {link.label}
              </Link>
            ))}
            <Button
              label="Log In"
              variant="contained"
              endIcon={<HiArrowRight className="text-white" />}
              onClick={() => navigate("/login")}
            />
          </div>

          {/* Burger button */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <HiX size={22} /> : <HiMenu size={22} />}
          </button>
        </div>
      </nav>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 md:hidden ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={close}
      />

      {/* Slide-in drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-xl flex flex-col transition-transform duration-300 ease-in-out md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <img src={logo} alt="MyPaperVault" className="w-8 h-8 object-contain" />
            <span className="font-extrabold text-sm text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>
              MyPaperVault
            </span>
          </div>
          <button
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
            onClick={close}
            aria-label="Close menu"
          >
            <HiX size={20} />
          </button>
        </div>

        {/* Links */}
        <div className="flex flex-col px-6 py-6 gap-1 flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 no-underline px-3 py-2.5 rounded-lg transition-colors"
              onClick={close}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="px-6 py-6 border-t border-slate-100">
          <Button
            label="Log In"
            variant="contained"
            endIcon={<HiArrowRight className="text-white" />}
            onClick={() => { navigate("/login"); close(); }}
            className="w-full justify-center"
          />
        </div>
      </div>
    </>
  );
};

export default Navbar;
