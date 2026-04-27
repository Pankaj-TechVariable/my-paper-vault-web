import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDocuments,
  getDocumentCount,
  getDownloadUrl,
  renameDocument,
  deleteDocument,
  type GetDocumentsParams,
  type GetDocumentsResponse,
  type DocumentCountResponse,
  type GetDownloadUrlResponse,
  type RenameDocumentResponse,
  type DeleteDocumentResponse,
} from "@/api/endpoints/documents";
import { AppError } from "@/errors/AppError";
import { handleApiError } from "@/errors/errorHandler";
import { queryKeys } from "@/api/queryKeys";
import { toast } from "@/lib/toast";
import { toast as sonner } from "sonner";

export const useDocumentCount = () => {
  const query = useQuery<DocumentCountResponse, AppError>({
    queryKey: queryKeys.documents.count(),
    queryFn: getDocumentCount,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.code === "NETWORK_ERROR") return false;
      if (error.status && error.status < 500) return false;
      return failureCount < 2;
    },
  });

  useEffect(() => {
    if (query.error) handleApiError(query.error);
  }, [query.error]);

  return query;
};

export const useRenameDocument = () => {
  const queryClient = useQueryClient();
  return useMutation<
    RenameDocumentResponse,
    AppError,
    { id: string; name: string }
  >({
    mutationFn: ({ id, name }) => renameDocument(id, name),
    onSuccess: (data) => {
      if (!data.success) {
        return toast.error("Rename failed", "Please try again.");
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all() });
      toast.success("Document renamed");
    },
    onError: handleApiError,
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  return useMutation<DeleteDocumentResponse, AppError, string>({
    mutationFn: deleteDocument,
    onSuccess: (data) => {
      if (!data.success) {
        return toast.error("Delete failed", "Please try again.");
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all() });
      toast.success("Document deleted");
    },
    onError: handleApiError,
  });
};

export const useDeleteDocuments = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, string[]>({
    mutationFn: async (ids) => {
      await Promise.all(ids.map((id) => deleteDocument(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all() });
      toast.success("Documents deleted");
    },
    onError: handleApiError,
  });
};

const downloadFile = async (url: string, name: string, toastId: string | number) => {
  const res = await fetch(url);
  const contentLength = res.headers.get("Content-Length");
  const total = contentLength ? parseInt(contentLength) : 0;
  const reader = res.body!.getReader();
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    const percent = total
      ? Math.round((received / total) * 100)
      : Math.round(received / 1024);
    sonner.loading(
      total ? `${name} — ${percent}%` : `${name} — ${percent} KB`,
      { id: toastId },
    );
  }

  const blob = new Blob(chunks);
  const objectUrl = URL.createObjectURL(blob);
  const a = window.document.createElement("a");
  a.href = objectUrl;
  a.download = name;
  a.click();
  URL.revokeObjectURL(objectUrl);
};

export const useDownloadDocument = () =>
  useMutation<GetDownloadUrlResponse, AppError, { id: string; name: string }>({
    mutationFn: ({ id }) => getDownloadUrl(id),
    onSuccess: async (data, { name }) => {
      if (!data.success || !data.data?.download_url) {
        return toast.error("Download failed", "Please try again.");
      }
      const toastId = sonner.loading(`${name} — 0%`);
      try {
        await downloadFile(data.data.download_url, name, toastId);
        sonner.dismiss(toastId);
      } catch {
        sonner.dismiss(toastId);
        toast.error("Download failed", "Please try again.");
      }
    },
    onError: handleApiError,
  });

export const useDownloadDocuments = () =>
  useMutation<void, AppError, { id: string; name: string }[]>({
    mutationFn: async (docs) => {
      const urls = await Promise.all(docs.map(({ id }) => getDownloadUrl(id)));
      await Promise.all(
        urls.map(async (res, i) => {
          if (!res.success || !res.data?.download_url) {
            toast.error(`Failed to download "${docs[i].name}"`);
            return;
          }
          const toastId = sonner.loading(`${docs[i].name} — 0%`);
          try {
            await downloadFile(res.data.download_url, docs[i].name, toastId);
            sonner.dismiss(toastId);
          } catch {
            sonner.dismiss(toastId);
            toast.error(`Failed to download "${docs[i].name}"`);
          }
        }),
      );
    },
    onError: handleApiError,
  });

export const useViewDocument = () =>
  useMutation<GetDownloadUrlResponse, AppError, string>({
    mutationFn: (id) => getDownloadUrl(id),
    onSuccess: (data) => {
      if (!data.success || !data.data?.download_url) {
        toast.error("Failed to open document", "Please try again.");
      }
    },
    onError: handleApiError,
  });

export const useDocuments = (params?: GetDocumentsParams) => {
  const query = useQuery<GetDocumentsResponse, AppError>({
    queryKey: queryKeys.documents.list(params),
    queryFn: () => getDocuments(params),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.code === "NETWORK_ERROR") return false;
      if (error.status && error.status < 500) return false;
      return failureCount < 2;
    },
  });

  useEffect(() => {
    if (query.error) handleApiError(query.error);
  }, [query.error]);

  return query;
};
