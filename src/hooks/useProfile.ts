import { useQuery } from "@tanstack/react-query";
import { getProfilePicture } from "@/api/endpoints/users";
import { queryKeys } from "@/api/queryKeys";

export const useGetProfilePicture = () =>
  useQuery({
    queryKey: queryKeys.profilePicture.get(),
    queryFn: getProfilePicture,
    select: (res) => res.data?.download_url ?? null,
  });
