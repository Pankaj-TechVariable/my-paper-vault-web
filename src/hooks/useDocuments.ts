import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getDocuments,
  getDocumentCount,
  renameDocument,
  deleteDocument,
  type GetDocumentsParams,
  type GetDocumentsResponse,
  type DocumentCountResponse,
  type RenameDocumentResponse,
  type DeleteDocumentResponse,
} from '@/api/endpoints/documents';
import { AppError } from '@/errors/AppError';
import { handleApiError } from '@/errors/errorHandler';
import { queryKeys } from '@/api/queryKeys';
import { toast } from '@/utils/toast';

export const useDocumentCount = () => {
  const query = useQuery<DocumentCountResponse, AppError>({
    queryKey: queryKeys.documents.count(),
    queryFn: getDocumentCount,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.code === 'NETWORK_ERROR') return false;
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
    onSuccess: data => {
      if (!data.success) {
        return toast.error('Rename failed', 'Please try again.');
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all() });
      toast.success('Document renamed');
    },
    onError: handleApiError,
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  return useMutation<DeleteDocumentResponse, AppError, string>({
    mutationFn: deleteDocument,
    onSuccess: data => {
      if (!data.success) {
        return toast.error('Delete failed', 'Please try again.');
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all() });
      toast.success('Document deleted');
    },
    onError: handleApiError,
  });
};

export const useDeleteDocuments = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, string[]>({
    mutationFn: async ids => {
      await Promise.all(ids.map(id => deleteDocument(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all() });
      toast.success('Documents deleted');
    },
    onError: handleApiError,
  });
};

export const useDocuments = (params?: GetDocumentsParams) => {
  const query = useQuery<GetDocumentsResponse, AppError>({
    queryKey: queryKeys.documents.list(params),
    queryFn: () => getDocuments(params),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.code === 'NETWORK_ERROR') return false;
      if (error.status && error.status < 500) return false;
      return failureCount < 2;
    },
  });

  useEffect(() => {
    if (query.error) handleApiError(query.error);
  }, [query.error]);

  return query;
};
