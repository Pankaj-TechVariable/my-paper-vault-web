import { useNavigate } from "react-router-dom";
import { HiArrowRight } from "react-icons/hi";

const CTABanner = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0d1b4b] px-6 md:px-16 py-12 md:py-16 lg:py-20 text-center">
      <h2
        className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-3"
        style={{ fontFamily: "'Sora', sans-serif" }}
      >
        Ready to Protect Your Documents?
      </h2>
      <p className="text-sm md:text-base text-white/70 mb-7 max-w-md mx-auto">
        Join thousands of Nigerian families securing their most important records.
      </p>
      <button
        className="inline-flex items-center gap-2 px-6 md:px-7 py-2.5 md:py-3 text-sm font-semibold bg-amber-400 text-white rounded-xl hover:bg-amber-500 hover:-translate-y-px transition-all cursor-pointer"
        onClick={() => navigate("/register")}
      >
        Create Your Free Vault <HiArrowRight />
      </button>
    </div>
  );
};

export default CTABanner;
