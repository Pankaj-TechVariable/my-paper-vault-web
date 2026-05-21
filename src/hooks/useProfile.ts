import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProfilePicture,
  getProfilePicturePresignedUrl,
  confirmProfilePictureUpload,
  updateProfile,
} from "@/api/endpoints/users";
import type { AppError } from "@/errors/AppError";
import { useAuthStore } from "@/store/authStore";
import { handleApiError } from "@/errors/errorHandler";
import { toast } from "@/lib/toast";
import { queryKeys } from "@/api/queryKeys";

export const useGetProfilePicture = () =>
  useQuery({
    queryKey: queryKeys.profilePicture.get(),
    queryFn: getProfilePicture,
    select: (res) => res.data?.download_url ?? null,
    retry: false,
    throwOnError: false,
  });

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export const useUploadProfilePicture = () => {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const upload = async (file: File) => {
    if (!ALLOWED_MIME_TYPES.includes(file.type as AllowedMimeType)) {
      toast.error("Unsupported format", "Please use JPEG, PNG, or WebP.");
      return;
    }
    if (file.size > 1024 * 1024) {
      toast.error("File too large", "Maximum file size is 1 MB.");
      return;
    }

    setIsUploading(true);
    try {
      const mime_type = file.type as AllowedMimeType;

      const presigned = await getProfilePicturePresignedUrl({ mime_type, file_size: file.size });
      if (!presigned.success) {
        toast.error("Upload failed", presigned.message);
        return;
      }

      const s3Res = await fetch(presigned.data.upload_url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": mime_type },
      });
      if (!s3Res.ok) {
        toast.error("Upload failed", "Could not upload the image.");
        return;
      }

      const confirmed = await confirmProfilePictureUpload({
        file_key: presigned.data.file_key,
        mime_type,
      });
      if (!confirmed.success) {
        toast.error("Upload failed", confirmed.message);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: queryKeys.profilePicture.get() });
      toast.success("Profile picture updated");
    } catch (err) {
      handleApiError(err as AppError);
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading };
};

export const useUpdateProfile = () =>
  useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      if (!data.success) return toast.error("Update failed", "Please try again.");
      const session = useAuthStore.getState().session;
      if (session) {
        useAuthStore.getState().setSession({
          tokens: session.tokens,
          user: { ...session.user, ...data.data },
        });
      }
      toast.success("Profile updated");
    },
    onError: handleApiError,
  });
