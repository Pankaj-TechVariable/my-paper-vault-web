import createFetchClient from "openapi-fetch";
import type { paths } from "./types";
import { env } from "@/config/env";
import { AppError } from "@/errors/AppError";
import { useAuthStore } from "@/store/authStore";

const PUBLIC_ENDPOINTS = [
  "/auth/signin",
  "/auth/signup",
  "/auth/verify",
  "/auth/resend-verification",
  "/auth/refresh-token",
];

const fetchWithNetworkError: typeof fetch = async (input, init) => {
  try {
    return await fetch(input, init);
  } catch {
    throw new AppError("Network error", "NETWORK_ERROR");
  }
};

export const apiClient = createFetchClient<paths>({
  baseUrl: env.apiUrl,
  fetch: fetchWithNetworkError,
});

// ─── Token refresh lock ────────────────────────────────────────────────────
// Ensures only one refresh call is in-flight at a time.
// Concurrent 401s all await the same promise instead of each triggering a refresh.
let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const session = useAuthStore.getState().session;
    if (!session) return null;

    try {
      // refresh_token is an httpOnly cookie — sent automatically via credentials: "include"
      const res = await fetch(`${env.apiUrl}/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) return null;

      const body = await res.json();
      if (!body?.data?.access_token) return null;

      useAuthStore.getState().setSession({
        user: session.user,
        tokens: {
          access_token: body.data.access_token,
          id_token: body.data.id_token,
          expires_in: body.data.expires_in,
          token_type: body.data.token_type,
        },
      });

      return body.data.access_token as string;
    } catch {
      return null;
    }
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
};

// ─── Inject Bearer token ───────────────────────────────────────────────────
apiClient.use({
  onRequest({ request }) {
    const url = new URL(request.url);
    const isPublic = PUBLIC_ENDPOINTS.some((ep) => url.pathname.endsWith(ep));
    if (!isPublic) {
      const token = useAuthStore.getState().session?.tokens.access_token;
      if (token) {
        request.headers.set("Authorization", `Bearer ${token}`);
      }
    }
    return request;
  },
});

// ─── Catch API-level errors ────────────────────────────────────────────────
// Registered BEFORE refresh so it runs AFTER (openapi-fetch onResponse is LIFO).
apiClient.use({
  async onResponse({ response }) {
    if (!response.ok) {
      const body = await response
        .clone()
        .json()
        .catch(() => ({}));
      throw new AppError(
        body.message ?? "An unexpected error occurred",
        "API_ERROR",
        response.status,
      );
    }
    return response;
  },
});

// ─── Token refresh on 401 ─────────────────────────────────────────────────
// Registered LAST so it runs FIRST on every response (LIFO order).
apiClient.use({
  async onResponse({ response, request }) {
    if (response.status !== 401) return response;

    const url = new URL(request.url);
    if (url.pathname.endsWith("/auth/refresh-token")) return response;

    const newToken = await refreshAccessToken();

    if (!newToken) {
      useAuthStore.getState().clearSession();
      return response;
    }

    const retried = new Request(request, {
      headers: new Headers(request.headers),
    });
    retried.headers.set("Authorization", `Bearer ${newToken}`);
    return fetch(retried);
  },
});
