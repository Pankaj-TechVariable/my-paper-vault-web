import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppError } from '@/errors/AppError';
import { handleApiError } from '@/errors/errorHandler';
import { queryKeys } from '@/api/queryKeys';
import { getPublicUploadLink } from '@/api/endpoints/uploadLinks';
import type { PublicLinkInfoResponse } from '@/api/endpoints/uploadLinks';

export const usePublicUploadLink = (token: string) => {
  const query = useQuery<PublicLinkInfoResponse, AppError>({
    queryKey: queryKeys.uploadLinks.public(token),
    queryFn: () => getPublicUploadLink(token),
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
