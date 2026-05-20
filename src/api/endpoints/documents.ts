import { apiClient } from '../client';
import type { components } from '../types';

type _GeneratedPresignedUrlResponse =
  components['schemas']['GetPresignedUrlResponse'];

// Extend the generated type to include the KMS headers added by the backend.
// Remove this override once `npm run api:types` picks up the updated spec.
export type GetPresignedUrlResponse = Omit<
  _GeneratedPresignedUrlResponse,
  'data'
> & {
  data: _GeneratedPresignedUrlResponse['data'] & {
    required_headers?: Record<string, string>;
  };
};
export type ConfirmUploadResponse =
  components['schemas']['ConfirmUploadResponse'];
export type GetDocumentsResponse =
  components['schemas']['ListDocumentsResponse'];
export type DocumentCountResponse =
  components['schemas']['DocumentCountResponse'];
export type GetDownloadUrlResponse =
  components['schemas']['GetDownloadUrlResponse'];
export type RenameDocumentResponse =
  components['schemas']['RenameDocumentResponse'];
export type DeleteDocumentResponse =
  components['schemas']['DeleteDocumentResponse'];
// Extend until `npm run api:types` picks up the updated spec.
export type Document = GetDocumentsResponse['data'][number] & {
  uploaded_via_link_id?: string | null;
  uploaded_by?: string | null; // uploader name, not a user ID
};

export const getDownloadUrl = async (
  id: string,
): Promise<GetDownloadUrlResponse> => {
  const { data } = await apiClient.GET('/documents/{id}/download', {
    params: { path: { id } },
  });
  return data!;
};

export interface GetDocumentsParams {
  directory_id?: string;
  name?: string;
}

export const getDocumentCount =
  async (): Promise<DocumentCountResponse> => {
    const { data } = await apiClient.GET('/documents/count', {});
    return data!;
  };

export const getDocuments = async (
  params?: GetDocumentsParams,
): Promise<GetDocumentsResponse> => {
  const { data } = await apiClient.GET('/documents', {
    params: { query: params },
  });
  return data!;
};

export const getPresignedUrl = async (body: {
  directory_id: string;
  file_name: string;
  mime_type: string;
  file_size: number;
}): Promise<GetPresignedUrlResponse> => {
  const { data } = await apiClient.POST('/documents/presigned-url', { body });
  return data!;
};

export const confirmUpload = async (body: {
  directory_id: string;
  file_key: string;
  file_name: string;
  mime_type: string;
  file_size: number;
}): Promise<ConfirmUploadResponse> => {
  const { data } = await apiClient.POST('/documents/confirm', { body });
  return data!;
};

export const renameDocument = async (
  id: string,
  name: string,
): Promise<RenameDocumentResponse> => {
  const { data } = await apiClient.PATCH('/documents/{id}/rename', {
    params: { path: { id } },
    body: { name },
  });
  return data!;
};

export const deleteDocument = async (
  id: string,
): Promise<DeleteDocumentResponse> => {
  const { data } = await apiClient.DELETE('/documents/{id}', {
    params: { path: { id } },
  });
  return data!;
};

export const uploadToS3 = (
  uploadUrl: string,
  blob: Blob,
  mimeType: string,
  onProgress: (percent: number) => void,
): Promise<void> =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', mimeType);
    xhr.upload.onprogress = e => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed (${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.ontimeout = () => reject(new Error('Upload timed out'));
    xhr.send(blob);
  });
