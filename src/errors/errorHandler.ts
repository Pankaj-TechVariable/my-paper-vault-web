import useErrorStore from "@/store/errorStore";
import { toast } from "@/utils/toast";
import { AppError } from "./AppError";

export const handleError = (error: Error) => {
  const message =
    error instanceof Error
      ? error.message
      : String(error || "Unexpected error");
  useErrorStore.getState().setError(message);
};

/**
 * Central handler for AppError instances thrown by API calls.
 * Covers network failures, common HTTP status codes, and a generic fallback.
 * Use this in every hook's onError / useEffect instead of duplicating the logic.
 */
export const handleApiError = (error: AppError) => {
  if (error.code === "NETWORK_ERROR") {
    toast.error(
      error.message || "No connection",
      "Check your internet and try again.",
    );
    return;
  }

  if (error.status === 401) {
    toast.error(error.message || "Session expired", "Please sign in again.");
    return;
  }

  if (error.status === 403) {
    toast.error(
      error.message || "Access denied",
      "You do not have permission to perform this action.",
    );
    return;
  }

  if (error.status === 404) {
    toast.error(
      error.message || "Not found",
      "The resource could not be found.",
    );
    return;
  }

  if (error.status === 429) {
    toast.error(
      error.message || "Too many requests",
      "Please wait a moment and try again.",
    );
    return;
  }

  toast.error(error.message || "Something went wrong", "Please try again.");
};
