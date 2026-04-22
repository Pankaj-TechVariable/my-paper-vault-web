import { apiClient } from '../client';
import type { components } from '../types';

export type ProfilePicturePresignedUrlResponse =
  components['schemas']['ProfilePicturePresignedUrlResponse'];
export type ConfirmProfilePictureResponse =
  components['schemas']['ConfirmProfilePictureResponse'];
export type ProfilePictureDownloadUrlResponse =
  components['schemas']['ProfilePictureDownloadUrlResponse'];

export const getProfilePicturePresignedUrl = async (body: {
  mime_type: 'image/jpeg' | 'image/png' | 'image/webp';
  file_size: number;
}): Promise<ProfilePicturePresignedUrlResponse> => {
  const { data } = await apiClient.POST(
    '/users/profile-picture/presigned-url',
    { body },
  );
  return data!;
};

export const confirmProfilePictureUpload = async (body: {
  file_key: string;
  mime_type: 'image/jpeg' | 'image/png' | 'image/webp';
}): Promise<ConfirmProfilePictureResponse> => {
  const { data } = await apiClient.POST('/users/profile-picture/confirm', {
    body,
  });
  return data!;
};

export const getProfilePicture =
  async (): Promise<ProfilePictureDownloadUrlResponse> => {
    const { data } = await apiClient.GET('/users/profile-picture', {});
    return data!;
  };

export type UpdateProfileResponse =
  components['schemas']['UpdateProfileResponse'];

export const updateProfile = async (body: {
  name?: string;
  gender?: string | null;
  phone_number?: string | null;
  age?: number | null;
}): Promise<UpdateProfileResponse> => {
  const { data } = await apiClient.PATCH('/users/profile', { body });
  return data!;
};
