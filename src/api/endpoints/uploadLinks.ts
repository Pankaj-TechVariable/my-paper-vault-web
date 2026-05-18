import { apiClient } from '../client';
import type { components } from '../types';

export type PublicLinkInfoResponse = components['schemas']['PublicLinkInfoResponse'];
export type PublicPresignedUrlResponse = components['schemas']['PublicPresignedUrlResponse'];
export type PublicConfirmUploadResponse = components['schemas']['PublicConfirmUploadResponse'];
export type PublicLinkInfo = PublicLinkInfoResponse['data'];

export const getPublicUploadLink = async (
  token: string,
): Promise<PublicLinkInfoResponse> => {
  const { data } = await apiClient.GET('/upload-links/public/{token}', {
    params: { path: { token } },
  });
  return data!;
};

export const getPublicPresignedUrl = async (
  token: string,
  body: {
    file_name: string;
    mime_type: string;
    file_size: number;
    pin?: string;
    uploader_name?: string;
  },
): Promise<PublicPresignedUrlResponse> => {
  const { data } = await apiClient.POST(
    '/upload-links/public/{token}/presigned-url',
    { params: { path: { token } }, body },
  );
  return data!;
};

export const confirmPublicUpload = async (
  token: string,
  body: {
    file_key: string;
    file_name: string;
    mime_type: string;
    file_size: number;
    pin?: string;
    uploader_name?: string;
  },
): Promise<PublicConfirmUploadResponse> => {
  const { data } = await apiClient.POST(
    '/upload-links/public/{token}/confirm',
    { params: { path: { token } }, body },
  );
  return data!;
};

export const uploadToS3Public = (
  uploadUrl: string,
  blob: Blob,
  requiredHeaders: Record<string, string>,
  onProgress: (percent: number) => void,
): Promise<void> =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    Object.entries(requiredHeaders).forEach(([k, v]) => {
      xhr.setRequestHeader(k, v);
    });
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.ontimeout = () => reject(new Error('Upload timed out'));
    xhr.send(blob);
  });
