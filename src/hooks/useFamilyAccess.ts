import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addDirectoryMember,
  getAccessGrants,
  getDirectoryMembers,
  getFamilyMembers,
  removeDirectoryMember,
  type AddDirectoryMemberResponse,
  type GetGrantedAccessResponse,
  type GetDirectoryMembersResponse,
  type GetFamilyMembersResponse,
  type RemoveDirectoryMemberResponse,
} from "@/api/endpoints/familyAccess";
import { AppError } from "@/errors/AppError";
import { handleApiError } from "@/errors/errorHandler";
import { toast } from "@/lib/toast";
import { queryKeys } from "@/api/queryKeys";

export const useFamilyMembers = () => {
  const query = useQuery<GetFamilyMembersResponse, AppError>({
    queryKey: queryKeys.familyMembers.all(),
    queryFn: getFamilyMembers,
    staleTime: 5 * 60 * 1000,
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

export const useDirectoryMembers = (directoryId: string | null) => {
  const query = useQuery<GetDirectoryMembersResponse, AppError>({
    queryKey: queryKeys.directoryMembers.byDirectory(directoryId ?? ""),
    queryFn: () => getDirectoryMembers(directoryId!),
    enabled: !!directoryId,
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

export const useListAccessGrants = () => {
  const query = useQuery<GetGrantedAccessResponse, AppError>({
    queryKey: queryKeys.accessGrants.all(),
    queryFn: getAccessGrants,
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

export const useGrantAccess = () => {
  const queryClient = useQueryClient();

  return useMutation<
    AddDirectoryMemberResponse,
    AppError,
    { directory_id: string; member_id: string }
  >({
    mutationFn: addDirectoryMember,
    onSuccess: (data) => {
      if (!data.success) {
        return toast.error("Failed to share access", "Please try again.");
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.accessGrants.all() });
      toast.success("Access shared successfully");
    },
    onError: handleApiError,
  });
};

export const useRevokeAccess = () => {
  const queryClient = useQueryClient();

  return useMutation<
    RemoveDirectoryMemberResponse,
    AppError,
    { directoryId: string; memberId: string }
  >({
    mutationFn: removeDirectoryMember,
    onSuccess: (data) => {
      if (!data.success) {
        return toast.error("Failed to revoke access", "Please try again.");
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.accessGrants.all() });
      toast.success("Access revoked");
    },
    onError: handleApiError,
  });
};
