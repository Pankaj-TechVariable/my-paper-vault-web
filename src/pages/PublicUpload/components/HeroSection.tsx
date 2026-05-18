import { MdOutlineCloudUpload, MdOutlineFolder } from 'react-icons/md';

interface HeroSectionProps {
  ownerName: string;
  directoryName: string;
}

const HeroSection = ({ ownerName, directoryName }: HeroSectionProps) => (
  <div className="flex flex-col items-center text-center px-6 pt-8 pb-6 border-b border-slate-100">
    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
      <MdOutlineCloudUpload size={28} className="text-primary" />
    </div>
    <h1 className="text-xl font-bold text-slate-900 mb-1">Secure Document Upload</h1>
    <p className="text-sm text-slate-500">
      You've been invited to upload documents to{' '}
      <span className="font-semibold text-slate-800">{ownerName}</span>'s vault.
    </p>
    <div className="mt-3 inline-flex items-center gap-1.5 bg-blue-50 text-primary border border-blue-100 rounded-full px-3 py-1 text-xs font-medium">
      <MdOutlineFolder size={12} />
      {directoryName}
    </div>
  </div>
);

export default HeroSection;
