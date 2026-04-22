const steps = [
  {
    n: 1,
    title: "Create Your Vault",
    desc: "Sign up and set up your secure vault with a master password. Your vault is encrypted end-to-end.",
  },
  {
    n: 2,
    title: "Upload Documents",
    desc: "Scan or upload your important documents. Organize by category for easy access.",
  },
  {
    n: 3,
    title: "Access Anytime",
    desc: "View your documents from any device. Share securely with family or authorities when needed.",
  },
  {
    n: 4,
    title: "Stay Protected",
    desc: "Documents are backed up automatically. Even if your device is lost, your vault remains safe.",
  },
];

const HowItWorks = () => {
  return (
    <div className="container py-12 md:py-16 lg:py-20">
      <h2
        className="text-2xl md:text-3xl font-extrabold text-center mb-8 md:mb-10"
        style={{ fontFamily: "'Sora', sans-serif" }}
      >
        How It Works
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {steps.map((step) => (
          <div key={step.n} className="bg-white border border-slate-200 rounded-xl p-5 md:p-6">
            <div
              className="w-8 h-8 md:w-9 md:h-9 bg-blue-800 rounded-full flex items-center justify-center text-xs md:text-sm font-bold text-white mb-3 md:mb-3.5"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              {step.n}
            </div>
            <h4 className="text-sm font-bold mb-1.5">{step.title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;
