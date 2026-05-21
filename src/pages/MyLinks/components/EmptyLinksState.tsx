import { MdOutlineLink } from "react-icons/md";

interface EmptyLinksStateProps {
  filter: "all" | "active" | "inactive";
}

const MESSAGES: Record<EmptyLinksStateProps["filter"], string> = {
  all: "No upload links yet.",
  active: "No active upload links.",
  inactive: "No inactive upload links.",
};

const EmptyLinksState = ({ filter }: EmptyLinksStateProps) => (
  <div className="col-span-full flex flex-col items-center justify-center py-24">
    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
      <MdOutlineLink size={22} className="text-slate-300" />
    </div>
    <p className="text-sm font-medium text-slate-500">{MESSAGES[filter]}</p>
    {filter === "all" && (
      <p className="text-xs text-slate-400 mt-1">
        Generate a secure link to let family members upload documents.
      </p>
    )}
  </div>
);

export default EmptyLinksState;
