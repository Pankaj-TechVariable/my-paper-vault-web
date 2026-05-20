import { apiClient } from '../client';
import type { components } from '../types';

export type GetMyAccessResponse = components['schemas']['GetMyAccessResponse'];
export type VaultGrantor = GetMyAccessResponse['data'][number];
export type VaultDirectory = VaultGrantor['directories'][number];

export const getMyAccess = async (): Promise<GetMyAccessResponse> => {
  const { data } = await apiClient.GET('/user-directories/my-access', {});
  return data!;
};
