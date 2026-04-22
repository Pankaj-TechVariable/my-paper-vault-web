import {
  MdBadge,
  MdAirplanemodeActive,
  MdDirectionsCar,
  MdLocalHospital,
  MdSchool,
  MdHome,
} from "react-icons/md";

const docTypes = [
  { icon: <MdBadge size={32} />, label: "National ID & Voter's Card", color: "bg-blue-50 text-blue-600" },
  { icon: <MdAirplanemodeActive size={32} />, label: "International Passport", color: "bg-indigo-50 text-indigo-600" },
  { icon: <MdDirectionsCar size={32} />, label: "Driver's License & Vehicle Papers", color: "bg-orange-50 text-orange-600" },
  { icon: <MdLocalHospital size={32} />, label: "NHIS Card & Health Records", color: "bg-red-50 text-red-500" },
  { icon: <MdSchool size={32} />, label: "WAEC/NECO Certificates", color: "bg-purple-50 text-purple-600" },
  { icon: <MdHome size={32} />, label: "C of O & Property Docs", color: "bg-green-50 text-green-600" },
];

const DocumentTypes = () => {
  return (
    <div className="bg-slate-50 border-t border-slate-200 py-12 md:py-16 lg:py-20">
      <div className="container">
        <h2
          className="text-2xl md:text-3xl font-extrabold text-center mb-2"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          Perfect for Nigerian Documents
        </h2>
        <p className="text-center text-slate-500 text-sm md:text-base mb-8 md:mb-10">
          Store and protect everything that matters to you and your family.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {docTypes.map((doc) => (
            <div
              key={doc.label}
              className="bg-white border border-slate-200 rounded-xl px-3 py-4 md:px-4 md:py-5 flex flex-col items-center gap-2 md:gap-2.5 text-center cursor-pointer hover:border-primary hover:shadow-sm transition-all"
            >
              <span className={`p-2 md:p-2.5 rounded-xl ${doc.color}`}>{doc.icon}</span>
              <span className="text-xs md:text-sm font-semibold text-slate-700 leading-snug">
                {doc.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentTypes;
