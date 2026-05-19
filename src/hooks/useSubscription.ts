import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMySubscription } from '@/api/endpoints/subscriptions';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { queryKeys } from '@/api/queryKeys';

export const useSubscription = () => {
  const setData = useSubscriptionStore(s => s.setData);
  const markLoaded = useSubscriptionStore(s => s.markLoaded);

  const query = useQuery({
    queryKey: queryKeys.subscription.me(),
    queryFn: getMySubscription,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (!query.isSuccess) return;
    if (query.data) {
      setData(query.data);
    } else {
      // 404 — no subscription; mark loaded so gates can render
      markLoaded();
    }
  }, [query.isSuccess, query.data, setData, markLoaded]);

  return query;
};
