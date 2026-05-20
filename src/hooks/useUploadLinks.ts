import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUploadLink,
  deactivateUploadLink,
  getUploadLink,
  getUploadLinks,
  type CreateLinkResponse,
  type CreateUploadLinkParams,
  type GetLinkResponse,
  type GetLinksResponse,
  type GetUploadLinksParams,
  type UpdateLinkResponse,
} from "@/api/endpoints/uploadLinksPrivate";
import { AppError } from "@/errors/AppError";
import { handleApiError } from "@/errors/errorHandler";
import { toast } from "@/lib/toast";
import { queryKeys } from "@/api/queryKeys";

export const useUploadLinks = (params?: GetUploadLinksParams) => {
  const query = useQuery<GetLinksResponse, AppError>({
    queryKey: queryKeys.uploadLinksPrivate.list(params),
    queryFn: () => getUploadLinks(params),
    staleTime: 2 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.status && error.status < 500) return false;
      return failureCount < 2;
    },
  });

  useEffect(() => {
    if (query.error) handleApiError(query.error);
  }, [query.error]);

  return query;
};

export const useUploadLink = (id: string) => {
  const query = useQuery<GetLinkResponse, AppError>({
    queryKey: queryKeys.uploadLinksPrivate.detail(id),
    queryFn: () => getUploadLink(id),
    staleTime: 60 * 1000,
    retry: (failureCount, error) => {
      if (error.status && error.status < 500) return false;
      return failureCount < 2;
    },
  });

  useEffect(() => {
    if (query.error) handleApiError(query.error);
  }, [query.error]);

  return query;
};

export const useCreateUploadLink = (
  onSuccess?: (data: CreateLinkResponse) => void,
) => {
  const queryClient = useQueryClient();

  return useMutation<CreateLinkResponse, AppError, CreateUploadLinkParams>({
    mutationFn: createUploadLink,
    onSuccess: (data) => {
      if (!data.success) {
        return toast.error("Failed to generate link", "Please try again.");
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.uploadLinksPrivate.all(),
      });
      toast.success("Secure link generated");
      onSuccess?.(data);
    },
    onError: handleApiError,
  });
};

export const useDeactivateUploadLink = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateLinkResponse, AppError, string>({
    mutationFn: deactivateUploadLink,
    onSuccess: (data) => {
      if (!data.success) {
        return toast.error("Failed to deactivate link", "Please try again.");
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.uploadLinksPrivate.all(),
      });
      toast.success("Link deactivated");
    },
    onError: handleApiError,
  });
};
