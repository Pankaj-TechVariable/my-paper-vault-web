import { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { MdOutlineSearch, MdOutlineArrowBack } from "react-icons/md";
import { createElement } from "react";
import { useDocuments } from "@/hooks/useDocuments";
import useDebounce from "@/hooks/useDebounce";
import { getCategoryStyle } from "@/constants/categoryStyles";
import DocumentItem from "@/components/common/DocumentItem/DocumentItem";
import TextInput from "@/components/common/TextInput/TextInput";
import BottomSheet from "@/components/common/BottomSheet/BottomSheet";
import SkeletonItem from "@/pages/DocumentArchive/components/SkeletonItem";
import type { Document } from "@/api/endpoints/documents";
import VaultDocumentDetail from "./components/VaultDocumentDetail";

interface VaultDirState {
  grantorName?: string;
  directoryName?: string;
  categoryType?: string;
  categoryName?: string;
}

const VaultDocuments = () => {
  const { directoryId } = useParams<{ directoryId: string }>();
  const { state } = useLocation() as { state: VaultDirState | null };
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchQuery);

  const { data, isLoading } = useDocuments({
    directory_id: directoryId,
    ...(debouncedSearch ? { name: debouncedSearch } : {}),
  });

  const documents = data?.data ?? [];
  const selectedDoc = documents.find((d) => d.id === selectedDocId) ?? null;

  const directoryName = state?.directoryName ?? "Shared Folder";
  const grantorName = state?.grantorName;
  const categoryType = state?.categoryType ?? "";
  const style = getCategoryStyle(categoryType);

  const handleItemClick = (doc: Document) => {
    setSelectedDocId((prev) => (prev === doc.id ? null : doc.id));
  };

  const showRightPanel = !!selectedDoc;

  return (
    <div className="h-full flex flex-col overflow-hidden px-4 md:px-8 py-6">
      {/* Header */}
      <div className="mb-4 shrink-0">
        <button
          onClick={() => navigate("/family-vaults")}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 mb-3 transition-colors cursor-pointer"
        >
          <MdOutlineArrowBack size={14} />
          Back to Family Vaults
        </button>

        <div className="flex items-center gap-3 mb-1">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${style.bgColor}`}
          >
            {createElement(style.icon, { size: 16, color: style.iconColor })}
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-900 truncate">
              {directoryName}
            </h1>
            {grantorName && (
              <p className="text-xs text-slate-400">Shared by {grantorName}</p>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-2 mb-4">
          {isLoading
            ? "Loading..."
            : `${documents.length} document${documents.length !== 1 ? "s" : ""}`}
        </p>

        <TextInput
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          start={<MdOutlineSearch size={16} className="text-slate-400 mr-1" />}
          className="max-w-xl"
        />
      </div>

      {/* Main grid */}
      <div
        className={`grid gap-4 flex-1 min-h-0 ${showRightPanel ? "grid-cols-1 lg:grid-cols-12" : "grid-cols-1"}`}
      >
        {/* Desktop right panel */}
        {showRightPanel && (
          <div className="hidden lg:block lg:col-span-4 lg:order-last overflow-y-auto">
            {selectedDoc && (
              <VaultDocumentDetail
                document={selectedDoc}
                directoryName={directoryName}
                categoryType={categoryType}
                onClose={() => setSelectedDocId(null)}
              />
            )}
          </div>
        )}

        {/* Document list */}
        <div
          className={`overflow-y-auto ${showRightPanel ? "lg:col-span-8" : ""}`}
        >
          <div className={`grid gap-2 ${showRightPanel ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonItem key={i} />)
            ) : documents.length === 0 ? (
              <div className="col-span-full text-center py-16 text-slate-400">
                <p className="text-sm font-medium">No documents found</p>
                <p className="text-xs mt-1">
                  {searchQuery
                    ? "Try a different search term"
                    : "This folder is empty"}
                </p>
              </div>
            ) : (
              documents.map((doc) => (
                <DocumentItem
                  key={doc.id}
                  document={doc}
                  onClick={handleItemClick}
                  isSelected={selectedDocId === doc.id}
                  hideCheckbox
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom sheet */}
      <div className="lg:hidden">
        <BottomSheet
          isOpen={!!selectedDoc}
          onClose={() => setSelectedDocId(null)}
        >
          {selectedDoc && (
            <VaultDocumentDetail
              document={selectedDoc}
              directoryName={directoryName}
              categoryType={categoryType}
              onClose={() => setSelectedDocId(null)}
            />
          )}
        </BottomSheet>
      </div>
    </div>
  );
};

export default VaultDocuments;
