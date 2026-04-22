import { useNavigate } from "react-router-dom";
import {
  HiLockClosed,
  HiShieldCheck,
  HiArrowRight,
  HiDocumentText,
  HiIdentification,
  HiScale,
} from "react-icons/hi";
import { FaShieldAlt } from "react-icons/fa";
import { MdOutlineDevices } from "react-icons/md";

import Button from "@/components/common/Button/Button";

const heroCards = [
  {
    icon: <HiDocumentText className="text-blue-400 shrink-0" size={22} />,
    title: "Certificate of Occupancy",
    meta: "Land & Property · Uploaded Jan 15, 2024 · Owner",
  },
  {
    icon: <HiIdentification className="text-blue-400 shrink-0" size={22} />,
    title: "International Passport",
    meta: "Government · Uploaded Jan 10, 2024 · Owner",
  },
  {
    icon: <HiScale className="text-blue-400 shrink-0" size={22} />,
    title: "Court Judgment Document",
    meta: "Legal · Uploaded Jan 8, 2024 · Owner",
  },
];

const stats = [
  { num: "47", label: "Documents" },
  { num: "🔐", label: "Encrypted" },
  { num: "5", label: "Family Access" },
];

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center lg:px-16 py-12 lg:py-20">
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-[#c7d7fd] rounded-full px-3.5 py-1.5 mb-5">
            <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
            <span className="text-xs font-semibold text-blue-800">
              Zero-Access Encryption · AWS Hosted
            </span>
          </div>

          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-4"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Protect Your Important
            <br />
            Documents. <span className="text-blue-800">Permanently.</span>
          </h1>

          <p className="text-sm md:text-base text-slate-500 leading-relaxed mb-7 max-w-md">
            A secure digital vault for land records, identity documents,
            financial files, and legal paperwork — built for Nigerian families.
          </p>

          <div className="flex gap-3 flex-wrap mb-7">
            <Button
              label="Create Secure Vault"
              variant="contained"
              endIcon={<HiArrowRight className="text-white" />}
              onClick={() => navigate("/register")}
            />
            <Button
              label="View Plans"
              variant="outlined"
              startIcon={<FaShieldAlt className="text-primary" />}
              onClick={() => navigate("/plans")}
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <HiLockClosed size={13} /> Zero Access Architecture
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <HiShieldCheck size={13} /> End-to-End Encryption
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <MdOutlineDevices size={13} /> Access Anywhere
            </div>
          </div>
        </div>

        {/* Right — Hero visual */}
        <div className="relative bg-linear-to-br from-[#0d1b4b] to-[#1e3fa8] rounded-2xl p-5 md:p-6 lg:p-8 min-h-64 md:min-h-80 lg:min-h-90 flex flex-col gap-3 md:gap-4 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(58,107,239,0.4)_0%,transparent_60%)] pointer-events-none" />

          {heroCards.map((card) => (
            <div
              key={card.title}
              className="relative z-10 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-3 py-3 md:px-4 md:py-3.5 flex items-start gap-2.5 md:gap-3"
            >
              {card.icon}
              <div>
                <p className="text-xs md:text-sm font-semibold text-white mb-0.5">{card.title}</p>
                <p className="text-[10px] md:text-xs text-white/65">{card.meta}</p>
              </div>
            </div>
          ))}

          <div className="relative z-10 flex gap-2 md:gap-2.5 mt-auto">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex-1 bg-white/8 border border-white/10 rounded-xl px-2 py-2 md:px-3.5 md:py-2.5 text-center"
              >
                <div
                  className="text-base md:text-xl font-extrabold text-white leading-none"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  {s.num}
                </div>
                <div className="text-[9px] md:text-[10px] text-white/60 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
