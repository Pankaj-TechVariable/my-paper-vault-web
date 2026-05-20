import { apiClient } from '../client';
import type { components } from '../types';

export type GetFamilyMembersResponse =
  components['schemas']['GetFamilyMembersResponse'];
export type FamilyMember = GetFamilyMembersResponse['data'][number];

export const getFamilyMembers =
  async (): Promise<GetFamilyMembersResponse> => {
    const { data } = await apiClient.GET('/family-members', {});
    return data!;
  };

export type GetGrantedAccessResponse =
  components['schemas']['GetGrantedAccessResponse'];
export type AccessGrant = GetGrantedAccessResponse['data'][number];
export type AccessGrantDirectory = AccessGrant['directories'][number];

export const getAccessGrants =
  async (): Promise<GetGrantedAccessResponse> => {
    const { data } = await apiClient.GET('/user-directories/access-grants', {});
    return data as GetGrantedAccessResponse;
  };

export type GetDirectoryMembersResponse =
  components['schemas']['GetDirectoryMembersResponse'];
export type DirectoryMember = GetDirectoryMembersResponse['data'][number];

export const getDirectoryMembers = async (
  directoryId: string,
): Promise<GetDirectoryMembersResponse> => {
  const { data } = await apiClient.GET(
    '/user-directories/{directoryId}/access-grants',
    { params: { path: { directoryId } } },
  );
  return data!;
};

export type AddDirectoryMemberResponse =
  components['schemas']['AddDirectoryMemberResponse'];

export const addDirectoryMember = async ({
  directory_id,
  member_id,
}: {
  directory_id: string;
  member_id: string;
}): Promise<AddDirectoryMemberResponse> => {
  const { data } = await apiClient.POST(
    '/user-directories/{directoryId}/access-grants',
    {
      params: { path: { directoryId: directory_id } },
      body: { member_id },
    },
  );
  return data as AddDirectoryMemberResponse;
};

export type RemoveDirectoryMemberResponse =
  components['schemas']['RemoveDirectoryMemberResponse'];

export const removeDirectoryMember = async ({
  directoryId,
  memberId,
}: {
  directoryId: string;
  memberId: string;
}): Promise<RemoveDirectoryMemberResponse> => {
  const { data } = await apiClient.DELETE(
    '/user-directories/{directoryId}/access-grants/{memberId}',
    { params: { path: { directoryId, memberId } } },
  );
  return data!;
};
