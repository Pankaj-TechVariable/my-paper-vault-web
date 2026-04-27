import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  MdClose,
  MdAdd,
  MdRemove,
  MdChevronLeft,
  MdChevronRight,
  MdOutlineRestartAlt,
} from "react-icons/md";

interface DocumentViewerProps {
  url: string;
  filename: string;
  mimeType: string;
  onClose: () => void;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 3.0;
const SCALE_STEP = 0.25;
const DEFAULT_SCALE = 1.0;

const isImage = (mimeType: string) => mimeType.startsWith("image/");

const DocumentViewer = ({
  url,
  filename,
  mimeType,
  onClose,
}: DocumentViewerProps) => {
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfLoading, setPdfLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const zoomIn = () => setScale((s) => Math.min(+(s + SCALE_STEP).toFixed(2), MAX_SCALE));
  const zoomOut = () => setScale((s) => Math.max(+(s - SCALE_STEP).toFixed(2), MIN_SCALE));
  const resetZoom = () => setScale(DEFAULT_SCALE);

  const containerWidth = containerRef.current?.clientWidth ?? 600;
  const pageWidth = containerWidth * scale;

  return createPortal(
    <div className="fixed inset-0 z-100 flex flex-col bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-800 border-b border-slate-700 shrink-0">
        <p className="text-sm font-semibold text-white truncate min-w-0 flex-1">
          {filename}
        </p>

        <div className="flex items-center gap-1 shrink-0">
          {/* Page navigation — PDF only */}
          {!isImage(mimeType) && numPages > 0 && (
            <div className="flex items-center gap-1 mr-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-700 disabled:opacity-30 transition-colors cursor-pointer"
              >
                <MdChevronLeft size={18} />
              </button>
              <span className="text-xs text-slate-300 min-w-15 text-center">
                {currentPage} / {numPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, numPages))}
                disabled={currentPage >= numPages}
                className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-700 disabled:opacity-30 transition-colors cursor-pointer"
              >
                <MdChevronRight size={18} />
              </button>
            </div>
          )}

          {/* Zoom controls */}
          <button
            onClick={zoomOut}
            disabled={scale <= MIN_SCALE}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-700 disabled:opacity-30 transition-colors cursor-pointer"
          >
            <MdRemove size={18} />
          </button>
          <button
            onClick={resetZoom}
            className="px-2 py-1 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer min-w-12 text-center"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            onClick={zoomIn}
            disabled={scale >= MAX_SCALE}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-700 disabled:opacity-30 transition-colors cursor-pointer"
          >
            <MdAdd size={18} />
          </button>

          <button
            onClick={resetZoom}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer ml-1"
            title="Reset zoom"
          >
            <MdOutlineRestartAlt size={18} />
          </button>

          <div className="w-px h-5 bg-slate-600 mx-1" />

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <MdClose size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex items-start justify-center p-4"
      >
        {isImage(mimeType) ? (
          <img
            src={url}
            alt={filename}
            style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
            className="max-w-full rounded shadow-lg transition-transform duration-150"
          />
        ) : (
          <div>
            {pdfLoading && (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            )}
            <Document
              file={url}
              onLoadSuccess={({ numPages }) => {
                setNumPages(numPages);
                setPdfLoading(false);
              }}
              loading={null}
              className={pdfLoading ? "invisible" : ""}
            >
              <Page
                pageNumber={currentPage}
                width={pageWidth}
                renderTextLayer
                renderAnnotationLayer
              />
            </Document>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default DocumentViewer;
