import { apiClient } from '../client';
import type { components } from '../types';

export type CreateLinkResponse = components['schemas']['CreateLinkResponse'];
export type GetLinksResponse = components['schemas']['GetLinksResponse'];
export type GetLinkResponse = components['schemas']['GetLinkResponse'];
export type UpdateLinkResponse = components['schemas']['UpdateLinkResponse'];
export type AuditLog = GetLinkResponse['data']['auditLogs'][number];

export type UploadLink = GetLinksResponse['data'][number];

export interface GetUploadLinksParams {
  active?: 'true' | 'false';
}

export interface CreateUploadLinkParams {
  directory_id: string;
  expires_at: string;
  max_file_count: number;
  max_file_size: number;
  pin?: string;
}

export const getUploadLinks = async (
  params?: GetUploadLinksParams,
): Promise<GetLinksResponse> => {
  const { data } = await apiClient.GET('/upload-links', {
    params: { query: params },
  });
  return data!;
};

export const createUploadLink = async (
  params: CreateUploadLinkParams,
): Promise<CreateLinkResponse> => {
  const { data } = await apiClient.POST('/upload-links', {
    body: params,
  });
  return data!;
};

export const getUploadLink = async (id: string): Promise<GetLinkResponse> => {
  const { data } = await apiClient.GET('/upload-links/{id}', {
    params: { path: { id } },
  });
  return data!;
};

export const deactivateUploadLink = async (
  id: string,
): Promise<UpdateLinkResponse> => {
  const { data } = await apiClient.PATCH('/upload-links/{id}', {
    params: { path: { id } },
    body: { is_active: false },
  });
  return data!;
};
