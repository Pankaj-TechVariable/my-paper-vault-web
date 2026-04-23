import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getUserDirectories,
  type GetDirectoriesParams,
  type GetDirectoriesResponse,
} from "@/api/endpoints/directories";
import { AppError } from "@/errors/AppError";
import { handleApiError } from "@/errors/errorHandler";
import { queryKeys } from "@/api/queryKeys";

export const useDirectories = (params?: GetDirectoriesParams) => {
  const query = useQuery<GetDirectoriesResponse, AppError>({
    queryKey: queryKeys.directories.list(params),
    queryFn: () => getUserDirectories(params),
    staleTime: 10 * 60 * 1000,
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
