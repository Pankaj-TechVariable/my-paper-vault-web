import { createElement } from "react";
import { FaArrowRight } from "react-icons/fa6";
import { useDocuments } from "@/hooks/useDocuments";
import { useDirectories } from "@/hooks/useDirectories";
import { getCategoryStyle } from "@/constants/categoryStyles";
import { formatFileSize, getMimeIcon } from "@/utils/document.utils";
import Button from "@/components/common/Button/Button";
import RecentDocumentSkeletonRow from "./RecentDocumentSkeletonRow";

const RecentDocuments = () => {
  const { data: docsData, isLoading: docsLoading } = useDocuments();
  const { data: dirsData, isLoading: dirsLoading } = useDirectories();

  const isLoading = docsLoading || dirsLoading;
  const dirMap = new Map((dirsData?.data ?? []).map((d) => [d.id, d]));
  const documents = (docsData?.data ?? []).slice(0, 5);

  return (
    <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-900">Recent Documents</h2>
        <Button
          label="View all"
          variant="text"
          className="text-xs text-primary"
          endIcon={<FaArrowRight size={12} className="text-primary" />}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-400 border-b border-slate-100">
              <th className="pb-2 text-left font-medium w-8" />
              <th className="pb-2 text-left font-medium">Document Name</th>
              <th className="pb-2 text-left font-medium hidden sm:table-cell">
                Category
              </th>
              <th className="pb-2 text-left font-medium hidden md:table-cell">
                Date Added
              </th>
              <th className="pb-2 text-left font-medium hidden md:table-cell">
                Size
              </th>
              <th className="pb-2 text-left font-medium">Access</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <RecentDocumentSkeletonRow key={i} />
                ))
              : documents.map((doc) => {
                  const dir = dirMap.get(doc.directory_id);
                  const style = getCategoryStyle(dir?.category?.type ?? "");
                  const date = new Date(doc.created_at).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    },
                  );

                  return (
                    <tr
                      key={doc.id}
                      className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 pr-2">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${style.bgColor}`}
                        >
                          {createElement(getMimeIcon(doc.mime_type), {
                            size: 14,
                            color: style.iconColor,
                          })}
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 font-medium text-slate-800 text-xs md:text-sm max-w-40 truncate">
                        {doc.name}
                      </td>
                      <td className="py-2.5 pr-3 hidden sm:table-cell">
                        {dir ? (
                          <span
                            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${style.bgColor}`}
                            style={{ color: style.iconColor }}
                          >
                            {createElement(style.icon, {
                              size: 10,
                              color: style.iconColor,
                            })}
                            {dir.name}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-3 text-xs text-slate-400 hidden md:table-cell">
                        {date}
                      </td>
                      <td className="py-2.5 pr-3 text-xs text-slate-400 hidden md:table-cell">
                        {formatFileSize(doc.file_size)}
                      </td>
                      <td className="py-2.5">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                          Owner
                        </span>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>

        {!isLoading && documents.length === 0 && (
          <p className="text-center text-xs text-slate-400 py-6">
            No documents yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default RecentDocuments;
