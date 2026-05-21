import { apiClient } from '../client';
import type { components } from '../types';

export type RelationValue = string;

export type GetFamilyMembersResponse =
  components['schemas']['GetFamilyMembersResponse'];
export type FamilyMember = GetFamilyMembersResponse['data'][number];

export type GetPendingInvitesResponse =
  components['schemas']['GetPendingInvitesResponse'];
export type PendingInvite = GetPendingInvitesResponse['data'][number];

export type SendFamilyInviteResponse =
  components['schemas']['SendFamilyInviteResponse'];

export type AcceptFamilyInviteResponse =
  components['schemas']['AcceptFamilyInviteResponse'];

export type RejectFamilyInviteResponse =
  components['schemas']['RejectFamilyInviteResponse'];

export type SetRelationLabelResponse =
  components['schemas']['SetRelationLabelResponse'];

export type RemoveFamilyConnectionResponse =
  components['schemas']['RemoveFamilyConnectionResponse'];

export const getFamilyMembers =
  async (): Promise<GetFamilyMembersResponse> => {
    const { data } = await apiClient.GET('/family-members', {});
    return data!;
  };

export const getPendingInvites = async (
  direction?: 'received' | 'sent',
): Promise<GetPendingInvitesResponse> => {
  const { data } = await apiClient.GET('/family-members/invites', {
    params: { query: direction ? { direction } : undefined },
  });
  return data!;
};

export const sendFamilyInvite = async (body: {
  email: string;
  relation?: RelationValue;
}): Promise<SendFamilyInviteResponse> => {
  const { data } = await apiClient.POST('/family-members/invite', { body: body as never });
  return data!;
};

export const acceptFamilyInvite = async (
  id: string,
): Promise<AcceptFamilyInviteResponse> => {
  const { data } = await apiClient.POST('/family-members/{id}/accept', {
    params: { path: { id } },
  });
  return data!;
};

export const rejectFamilyInvite = async (
  id: string,
): Promise<RejectFamilyInviteResponse> => {
  const { data } = await apiClient.POST('/family-members/{id}/reject', {
    params: { path: { id } },
  });
  return data!;
};

export const updateFamilyRelation = async ({
  id,
  relation,
}: {
  id: string;
  relation: RelationValue;
}): Promise<SetRelationLabelResponse> => {
  const { data } = await apiClient.PATCH('/family-members/{id}/relation', {
    params: { path: { id } },
    body: { relation } as never,
  });
  return data!;
};

export const deleteFamilyMember = async (
  id: string,
): Promise<RemoveFamilyConnectionResponse> => {
  const { data } = await apiClient.DELETE('/family-members/{id}', {
    params: { path: { id } },
  });
  return data!;
};
