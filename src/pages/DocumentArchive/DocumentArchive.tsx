import { useState } from "react";
import { MdOutlineSearch } from "react-icons/md";
import { useDocuments, useRenameDocument, useDeleteDocument, useDeleteDocuments, useDownloadDocuments } from "@/hooks/useDocuments";
import { useDirectories } from "@/hooks/useDirectories";
import useDebounce from "@/hooks/useDebounce";
import DocumentItem from "@/components/common/DocumentItem/DocumentItem";
import BottomSheet from "@/components/common/BottomSheet/BottomSheet";
import TextInput from "@/components/common/TextInput/TextInput";
import SkeletonItem from "./components/SkeletonItem";
import DocumentDetail from "./components/DocumentDetail";
import DirectoryChips from "./components/DirectoryChips";
import MultiSelectBar from "./components/MultiSelectBar";
import type { Document } from "@/api/endpoints/documents";

const DocumentArchive = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDirectoryId, setSelectedDirectoryId] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const rename = useRenameDocument();
  const deleteDoc = useDeleteDocument();
  const deleteDocs = useDeleteDocuments();
  const downloadDocs = useDownloadDocuments();

  const debouncedSearch = useDebounce(searchQuery);
  const isMultiSelect = checkedIds.size > 0;

  const { data: docsData, isLoading: docsLoading } = useDocuments({
    ...(selectedDirectoryId ? { directory_id: selectedDirectoryId } : {}),
    ...(debouncedSearch ? { name: debouncedSearch } : {}),
  });
  const { data: dirsData, isLoading: dirsLoading } = useDirectories();

  const isLoading = docsLoading || dirsLoading;
  const dirMap = new Map((dirsData?.data ?? []).map((d) => [d.id, d]));
  const documents = docsData?.data ?? [];

  // Always derive selectedDoc from fresh query data — never stale
  const selectedDoc = documents.find((d) => d.id === selectedDocId) ?? null;

  const toggleCheck = (doc: Document) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(doc.id)) { next.delete(doc.id); } else { next.add(doc.id); }
      return next;
    });
  };

  const clearAll = () => setCheckedIds(new Set());

  const handleItemClick = (doc: Document) => {
    if (isMultiSelect) {
      toggleCheck(doc);
    } else {
      setSelectedDocId((prev) => (prev === doc.id ? null : doc.id));
    }
  };

  const multiSelectProps = {
    count: checkedIds.size,
    onClearAll: clearAll,
    onDownload: () =>
      downloadDocs.mutate(
        documents.filter((d) => checkedIds.has(d.id)).map(({ id, name }) => ({ id, name })),
      ),
    onDelete: () => deleteDocs.mutate([...checkedIds], { onSuccess: clearAll }),
    deleteLoading: deleteDocs.isPending,
  };

  const detailProps =
    !isMultiSelect && selectedDoc
      ? {
          document: selectedDoc,
          directory: dirMap.get(selectedDoc.directory_id),
          onClose: () => setSelectedDocId(null),
          onRename: (doc: Document, newName: string, onSuccess: () => void) =>
            rename.mutate(
              { id: doc.id, name: newName },
              { onSuccess: (data) => { if (data.success) onSuccess(); } },
            ),
          renameLoading: rename.isPending,
          onDelete: (doc: Document, onSuccess: () => void) =>
            deleteDoc.mutate(doc.id, { onSuccess: (data) => { if (data.success) { onSuccess(); setSelectedDocId(null); } } }),
          deleteLoading: deleteDoc.isPending,
        }
      : null;

  const showRightPanel = isMultiSelect || !!detailProps;

  return (
    <div className="h-full flex flex-col overflow-hidden px-4 md:px-8 py-6">
      {/* Header */}
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
            setSelectedDocId(null);
          }}
        />
      </div>

      {/* Main grid */}
      <div
        className={`grid gap-4 flex-1 min-h-0 ${showRightPanel ? "grid-cols-1 lg:grid-cols-12" : "grid-cols-1"}`}
      >
        {/* Desktop right panel */}
        {showRightPanel && (
          <div className="hidden lg:block lg:col-span-4 lg:order-last overflow-y-auto">
            {isMultiSelect ? (
              <MultiSelectBar {...multiSelectProps} variant="panel" />
            ) : (
              detailProps && <DocumentDetail {...detailProps} />
            )}
          </div>
        )}

        {/* Document list */}
        <div className={`overflow-y-auto ${showRightPanel ? "lg:col-span-8" : ""}`}>
          <div className={`flex flex-col gap-2 ${isMultiSelect ? "pb-20 lg:pb-0" : ""}`}>
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
                  onClick={handleItemClick}
                  onCheckToggle={toggleCheck}
                  isSelected={!isMultiSelect && selectedDocId === doc.id}
                  showCheckbox={isMultiSelect}
                  isChecked={checkedIds.has(doc.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom sheet — detail */}
      <div className="lg:hidden">
        <BottomSheet
          isOpen={!isMultiSelect && !!selectedDoc}
          onClose={() => setSelectedDocId(null)}
        >
          {detailProps && <DocumentDetail {...detailProps} />}
        </BottomSheet>
      </div>

      {/* Mobile bottom bar — multiselect */}
      {isMultiSelect && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
          <MultiSelectBar {...multiSelectProps} variant="bar" />
        </div>
      )}
    </div>
  );
};

export default DocumentArchive;
