import type { GetDirectoriesParams } from "./endpoints/directories";
import type { GetDocumentsParams } from "./endpoints/documents";

/**
 * Centralised query key factory.
 *
 * Rules:
 *  - `all()` covers every query in the domain — use for broad invalidation.
 *  - `list(params)` scopes to a specific param combination — use for targeted invalidation.
 *
 * Usage:
 *   queryClient.invalidateQueries({ queryKey: queryKeys.directories.all() })
 *   queryClient.invalidateQueries({ queryKey: queryKeys.directories.list({ is_active: 'true' }) })
 */
export const queryKeys = {
  directories: {
    all: () => ["user-directories"] as const,
    list: (params?: GetDirectoriesParams) =>
      [...queryKeys.directories.all(), params] as const,
  },
  documents: {
    all: () => ["documents"] as const,
    list: (params?: GetDocumentsParams) =>
      [...queryKeys.documents.all(), params] as const,
    count: () => [...queryKeys.documents.all(), "count"] as const,
  },
  profilePicture: {
    get: () => ["profile-picture"] as const,
  },
  sessions: {
    all: () => ["sessions"] as const,
  },
  directoryMembers: {
    all: () => ["directory-members"] as const,
    byDirectory: (directoryId: string) =>
      [...queryKeys.directoryMembers.all(), directoryId] as const,
  },
  accessGrants: {
    all: () => ["access-grants"] as const,
  },
  familyMembers: {
    all: () => ["family-members"] as const,
    invites: (direction?: "received" | "sent") =>
      direction
        ? (["family-members", "invites", direction] as const)
        : (["family-members", "invites"] as const),
  },
  myAccess: {
    all: () => ["my-access"] as const,
  },
  uploadLinks: {
    public: (token: string) => ["upload-links", "public", token] as const,
  },
  uploadLinksPrivate: {
    all: () => ["upload-links"] as const,
    list: (params?: { active?: "true" | "false" }) =>
      [...queryKeys.uploadLinksPrivate.all(), params] as const,
    detail: (id: string) =>
      [...queryKeys.uploadLinksPrivate.all(), id] as const,
  },
  subscription: {
    me: () => ["subscription", "me"] as const,
    plans: () => ["subscription", "plans"] as const,
  },
};
