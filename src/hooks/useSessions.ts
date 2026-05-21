import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserSessions, revokeSession, type UserSession } from "@/api/endpoints/auth";
import { AppError } from "@/errors/AppError";
import { handleApiError } from "@/errors/errorHandler";
import { toast } from "@/lib/toast";
import { queryKeys } from "@/api/queryKeys";

export type { UserSession };

export const useGetSessions = () => {
  const query = useQuery({
    queryKey: queryKeys.sessions.all(),
    queryFn: getUserSessions,
    select: (res) => res.data ?? [],
    staleTime: 2 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (query.error) handleApiError(query.error as AppError);
  }, [query.error]);

  return query;
};

export const useRevokeSession = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, AppError, string>({
    mutationFn: revokeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all() });
      toast.success("Session revoked");
    },
    onError: handleApiError,
  });
};
