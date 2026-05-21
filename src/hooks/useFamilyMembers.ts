import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptFamilyInvite,
  deleteFamilyMember,
  getFamilyMembers,
  getPendingInvites,
  rejectFamilyInvite,
  sendFamilyInvite,
  updateFamilyRelation,
  type AcceptFamilyInviteResponse,
  type GetFamilyMembersResponse,
  type GetPendingInvitesResponse,
  type RejectFamilyInviteResponse,
  type RelationValue,
  type RemoveFamilyConnectionResponse,
  type SendFamilyInviteResponse,
  type SetRelationLabelResponse,
} from "@/api/endpoints/familyMembers";
import { AppError } from "@/errors/AppError";
import { handleApiError } from "@/errors/errorHandler";
import { toast } from "@/lib/toast";
import { queryKeys } from "@/api/queryKeys";

export const useFamilyMembers = () => {
  const query = useQuery<GetFamilyMembersResponse, AppError>({
    queryKey: queryKeys.familyMembers.all(),
    queryFn: getFamilyMembers,
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

export const usePendingInvites = (direction: "received" | "sent") => {
  const query = useQuery<GetPendingInvitesResponse, AppError>({
    queryKey: queryKeys.familyMembers.invites(direction),
    queryFn: () => getPendingInvites(direction),
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

export const useSendFamilyInvite = () => {
  const queryClient = useQueryClient();

  return useMutation<
    SendFamilyInviteResponse,
    AppError,
    { email: string; relation?: RelationValue }
  >({
    mutationFn: sendFamilyInvite,
    onSuccess: (data) => {
      if (!data.success) {
        return toast.error("Failed to send invite", "Please try again.");
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.familyMembers.all(),
      });
      toast.success("Invite sent successfully");
    },
    onError: handleApiError,
  });
};

export const useAcceptFamilyInvite = () => {
  const queryClient = useQueryClient();

  return useMutation<AcceptFamilyInviteResponse, AppError, string>({
    mutationFn: acceptFamilyInvite,
    onSuccess: (data) => {
      if (!data.success) {
        return toast.error("Failed to accept invite", "Please try again.");
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.familyMembers.all(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.familyMembers.invites(),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.me() });
      toast.success("Invite accepted");
    },
    onError: handleApiError,
  });
};

export const useRejectFamilyInvite = () => {
  const queryClient = useQueryClient();

  return useMutation<RejectFamilyInviteResponse, AppError, string>({
    mutationFn: rejectFamilyInvite,
    onSuccess: (data) => {
      if (!data.success) {
        return toast.error("Failed to reject invite", "Please try again.");
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.familyMembers.invites(),
      });
      toast.success("Invite rejected");
    },
    onError: handleApiError,
  });
};

export const useUpdateFamilyRelation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    SetRelationLabelResponse,
    AppError,
    { id: string; relation: RelationValue }
  >({
    mutationFn: updateFamilyRelation,
    onSuccess: (data) => {
      if (!data.success) {
        return toast.error("Failed to update relation", "Please try again.");
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.familyMembers.all(),
      });
      toast.success("Relation updated");
    },
    onError: handleApiError,
  });
};

export const useDeleteFamilyMember = () => {
  const queryClient = useQueryClient();

  return useMutation<RemoveFamilyConnectionResponse, AppError, string>({
    mutationFn: deleteFamilyMember,
    onSuccess: (data) => {
      if (!data.success) {
        return toast.error("Failed to remove member", "Please try again.");
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.familyMembers.all(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.familyMembers.invites(),
      });
      toast.success("Member removed");
    },
    onError: handleApiError,
  });
};
