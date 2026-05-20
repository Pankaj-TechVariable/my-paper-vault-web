import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getMyAccess,
  type GetMyAccessResponse,
} from "@/api/endpoints/familyVaults";
import { AppError } from "@/errors/AppError";
import { handleApiError } from "@/errors/errorHandler";
import { queryKeys } from "@/api/queryKeys";

export const useMyAccess = () => {
  const query = useQuery<GetMyAccessResponse, AppError>({
    queryKey: queryKeys.myAccess.all(),
    queryFn: getMyAccess,
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
