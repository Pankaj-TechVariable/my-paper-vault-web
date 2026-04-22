import { apiClient } from '../client';
import type { components } from '../types';

export type GetDirectoriesResponse =
  components['schemas']['GetDirectoriesResponse'];
export type InitializeDirectoriesResponse =
  components['schemas']['InitializeDirectoriesResponse'];

export type Directory = GetDirectoriesResponse['data'][number];

export interface GetDirectoriesParams {
  is_active?: 'true' | 'false';
  category_id?: string;
}

export const getUserDirectories = async (
  params?: GetDirectoriesParams,
): Promise<GetDirectoriesResponse> => {
  const { data } = await apiClient.GET('/user-directories', {
    params: { query: params },
  });
  return data!;
};

export const initializeUserDirectories =
  async (): Promise<InitializeDirectoriesResponse> => {
    const { data } = await apiClient.POST('/user-directories/initialize', {});
    return data!;
  };
