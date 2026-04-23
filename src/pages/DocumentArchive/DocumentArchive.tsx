import { useState } from "react";
import { MdOutlineSearch } from "react-icons/md";
import { useDocuments } from "@/hooks/useDocuments";
import { useDirectories } from "@/hooks/useDirectories";
import useDebounce from "@/hooks/useDebounce";
import DocumentItem from "@/components/common/DocumentItem/DocumentItem";
import BottomSheet from "@/components/common/BottomSheet/BottomSheet";
import TextInput from "@/components/common/TextInput/TextInput";
import SkeletonItem from "./components/SkeletonItem";
import DocumentDetail from "./components/DocumentDetail";
import DirectoryChips from "./components/DirectoryChips";
import type { Document } from "@/api/endpoints/documents";

const DocumentArchive = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDirectoryId, setSelectedDirectoryId] = useState<string | null>(
    null,
  );
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  const debouncedSearch = useDebounce(searchQuery);

  const { data: docsData, isLoading: docsLoading } = useDocuments({
    ...(selectedDirectoryId ? { directory_id: selectedDirectoryId } : {}),
    ...(debouncedSearch ? { name: debouncedSearch } : {}),
  });
  const { data: dirsData, isLoading: dirsLoading } = useDirectories();

  const isLoading = docsLoading || dirsLoading;
  const dirMap = new Map((dirsData?.data ?? []).map((d) => [d.id, d]));
  const documents = docsData?.data ?? [];

  const detailProps = selectedDoc
    ? {
        document: selectedDoc,
        directory: dirMap.get(selectedDoc.directory_id),
        onClose: () => setSelectedDoc(null),
        onRename: (doc: Document, newName: string) =>
          console.log("rename", doc, newName),
        onDelete: (doc: Document) => console.log("delete", doc),
      }
    : null;

  return (
    <div className="h-full flex flex-col overflow-hidden px-4 md:px-8 py-6">
      <div className="mb-4 shrink-0">
        <h1 className="text-lg font-bold text-slate-900">Document Archive</h1>
        <p className="text-xs text-slate-400 mt-0.5 mb-4">
          {isLoading
            ? "Loading..."
            : `${documents.length} document${documents.length !== 1 ? "s" : ""} across all categories`}
        </p>
        <TextInput
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          start={<MdOutlineSearch size={16} className="text-slate-400 mr-1" />}
          className="mb-4 max-w-xl"
        />
        <DirectoryChips
          directories={dirsData?.data ?? []}
          selected={selectedDirectoryId}
          isLoading={dirsLoading}
          onSelect={(id) => {
            setSelectedDirectoryId(id);
            setSelectedDoc(null);
          }}
        />
      </div>

      <div
        className={`grid gap-4 flex-1 min-h-0 ${selectedDoc ? "grid-cols-1 lg:grid-cols-12" : "grid-cols-1"}`}
      >
        {/* Desktop side panel */}
        {detailProps && (
          <div className="hidden lg:block lg:col-span-4 lg:order-last overflow-y-auto">
            <DocumentDetail {...detailProps} />
          </div>
        )}

        {/* Document list */}
        <div
          className={`overflow-y-auto ${selectedDoc ? "lg:col-span-8" : ""}`}
        >
          <div className="flex flex-col gap-2">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonItem key={i} />)
            ) : documents.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <p className="text-sm font-medium">No documents yet</p>
                <p className="text-xs mt-1">
                  Uploaded documents will appear here
                </p>
              </div>
            ) : (
              documents.map((doc) => (
                <DocumentItem
                  key={doc.id}
                  document={doc}
                  directory={dirMap.get(doc.directory_id)}
                  onClick={() => setSelectedDoc(doc)}
                  isSelected={selectedDoc?.id === doc.id}
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
          onClose={() => setSelectedDoc(null)}
        >
          {detailProps && <DocumentDetail {...detailProps} />}
        </BottomSheet>
      </div>
    </div>
  );
};

export default DocumentArchive;
