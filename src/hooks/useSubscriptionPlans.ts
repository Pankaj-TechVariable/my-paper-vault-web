import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import {
  getSubscriptionPlans,
  subscribeToPlan,
  startTrial,
  cancelSubscription,
} from '@/api/endpoints/subscriptions';
import { handleApiError } from '@/errors/errorHandler';

export const useSubscriptionPlans = () => {
  const query = useQuery({
    queryKey: queryKeys.subscription.plans(),
    queryFn: getSubscriptionPlans,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (query.error) handleApiError(query.error);
  }, [query.error]);

  return query;
};

export const useSubscribeToPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, billingCycle }: { planId: string; billingCycle: 'MONTHLY' | 'YEARLY' }) =>
      subscribeToPlan(planId, billingCycle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.me() });
    },
    onError: handleApiError,
  });
};

export const useStartTrial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => startTrial(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.me() });
    },
    onError: handleApiError,
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.me() });
    },
    onError: handleApiError,
  });
};
