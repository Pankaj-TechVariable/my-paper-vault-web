# HANDOVER.md — MyPaperVault Web

Developer knowledge-transfer document. Written for someone who has never seen this codebase. It complements `CLAUDE.md` (coding conventions/patterns — read that too) and the root `README.md` (quick-start). This document goes deeper: architecture, data flow, feature-by-feature behavior, what's real vs. stubbed, and exactly what Milestone 4 requires.

---

## 1. Project Overview

**MyPaperVault** is a secure digital document vault for Nigerian users/families — a place to store, organize, and share important personal documents (identity papers, property/legal documents, financial records, etc.) with trusted family members.

This repository is the **web frontend** only. It shares the same backend REST API (OpenAPI-documented) with a separate React Native mobile app — both clients talk to one backend, so any API contract change affects both.

Core product surfaces:
- Personal document vault, organized into category-based **directories** (Property, Government, Identity, Legal, Financial, Business, Other).
- **Family network** — connect with family members (invite/accept), then **share specific directories** with them (view/upload/download permissions).
- **Secure upload links** — generate a public, token-based, optionally PIN-protected link that lets someone *without an account* upload documents into one of your directories.
- **Subscription plans** — feature/limit gating (family seats, storage, upload/download grants) tied to a plan.

**Project status**: Milestones 1–3 are complete (auth, documents/directories, family sharing, upload links, subscription *plumbing*). Milestone 4 — payment gateway integration, QA, and production deployment — is remaining and is the primary gap this document maps out (see §13).

---

## 2. Tech Stack & Rationale

| Layer | Choice | Why |
|---|---|---|
| Framework | React 19 + TypeScript 6 (strict-ish) | Modern React (no class components, concurrent features available); TS for compile-time safety across a large, multi-domain app. |
| Build tool | Vite 8 | Fast dev server + HMR, first-class Tailwind v4 plugin, simple static-asset build for S3/CloudFront deploys. |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) | Utility-first, no separate PostCSS config needed in v4, fast to iterate, keeps design consistent via a small set of conventions (see CLAUDE.md). |
| Routing | React Router v7 | File-adjacent (not file-system) routing with `Outlet` layouts; supports lazy-loaded route components and passing transient context via `location.state`. |
| Server state | TanStack React Query v5 | Caching, deduping, retry/backoff, and invalidation for all API reads/writes — avoids hand-rolled loading/error state per component. |
| Client state | Zustand v5 | Minimal global state for things that aren't server data: auth session, subscription snapshot, toast/error UI state. No boilerplate reducers/providers. |
| Forms | react-hook-form v7 + Zod v4 | Uncontrolled-input performance + schema-based validation shared in one place (`src/schemas/`), consistent error messages. |
| API client | `openapi-fetch` | Fully typed request/response shapes generated directly from the backend's live OpenAPI spec — the two API clients (web/mobile) can never drift from the actual backend contract as long as types are regenerated. |
| PDF/image preview | `react-pdf` | In-browser document viewing without opening a new tab/download for PDFs. |
| Toasts | `sonner` (wrapped by `src/lib/toast.ts`) | Simple, unopinionated toast primitive; wrapped so the app has one call-site convention and can add fullscreen-toast behavior on top. |
| Icons | `react-icons` (`md` + `fa6` subsets) | One npm dependency covering both a Material icon set (UI chrome) and Font Awesome 6 (file/category icons) without shipping a custom icon font. |

---

## 3. Repository Structure

```
my-paper-vault-web/
├── src/
│   ├── api/
│   │   ├── client.ts              # openapi-fetch instance + auth/refresh/error middleware
│   │   ├── types.ts                # AUTO-GENERATED from backend OpenAPI spec — never hand-edit
│   │   ├── queryKeys.ts            # Central query-key factory, one entry per domain
│   │   └── endpoints/              # One file per API domain — thin wrappers around apiClient
│   ├── components/
│   │   ├── common/                 # Reusable UI: Button, TextInput, PasswordInput, StatCard,
│   │   │                           #   DocumentItem, DocumentViewer, ConfirmModal, BottomSheet,
│   │   │                           #   StorageBar, FullscreenToast
│   │   └── layout/                 # AppLayout (public), DashboardLayout (authed), Navbar,
│   │                               #   Footer, SubscriptionBanner
│   ├── config/env.ts                # ONLY place import.meta.env should be read from
│   ├── constants/categoryStyles.ts  # category.type -> icon/color map (has intentional API typos)
│   ├── errors/                     # AppError class, handleApiError, logger.ts (currently empty stub)
│   ├── hooks/                      # useAuth, useDocuments, useDirectories, useFamily*, useSubscription*,
│   │                               #   useUploadLink(s), useProfile, useSessions, useDebounce, useErrorHandler
│   ├── lib/toast.ts                 # Wrapper around sonner — always import toast from here
│   ├── pages/                      # One folder per route (see §10)
│   ├── router/index.tsx             # Route tree + ProtectedRoute/PublicOnlyRoute guards
│   ├── schemas/                    # Zod schemas: auth, document, familyMembers, profile, security, uploadLinks
│   ├── store/                      # Zustand: authStore, subscriptionStore, toastStore, errorStore
│   └── utils/                      # document.utils.ts (mime icon, file size), deviceInfo.utils.ts
├── infra/                          # Separate AWS CDK app (own package.json/tsconfig) — S3 + CloudFront
├── .github/workflows/deploy-dev.yml # CI: build + deploy to dev on push to `dev` branch
├── generate-api-types.cjs           # Fetches `${VITE_API_URL}/openapi.json` live, writes src/api/types.ts
├── CLAUDE.md                        # Coding conventions — read this before writing any code
└── README.md                        # Quick-start (this file goes deeper)
```

---

## 4. Local Environment Setup

### Prerequisites
- Node.js 18+ (repo CI uses Node 20 — prefer that locally too)
- npm (lockfile is `package-lock.json`)
- A running instance of the MyPaperVault **backend API**, reachable at whatever URL you put in `VITE_API_URL` — the backend must expose `/openapi.json` if you ever need to regenerate types

### Steps
```bash
npm install
cp .env.example .env.local   # then edit values
npm run dev
```

### Environment variables

Only **two** env vars exist in this project, both `VITE_`-prefixed (Vite only exposes prefixed vars to client code):

| Variable | Where consumed | Purpose | Notes |
|---|---|---|---|
| `VITE_API_URL` | `src/config/env.ts` (`env.apiUrl`), `src/api/client.ts` (base URL + refresh-token fetch), `generate-api-types.cjs` (reads it from root `.env`, not `.env.local`) | Backend API base URL | Required — `env.ts` throws synchronously at module load (`Missing environment variable: VITE_API_URL`) if unset, crashing app bootstrap immediately. |
| `VITE_APP_VERSION` | `src/utils/deviceInfo.utils.ts` only, via raw `import.meta.env.VITE_APP_VERSION ?? "0.0.0"` | Sent as the `X-App-Version` device header on sign-in | **Not** routed through `env.ts` (inconsistent with `VITE_API_URL`) — has its own inline default. In CI (`deploy-dev.yml`) this is set to `${{ github.sha }}` at build time, so prod/dev builds effectively tag devices with the deployed commit SHA rather than a semver. |

`.env.example` values: `VITE_API_URL=http://localhost:3000`, `VITE_APP_VERSION=0.0.0`.

There is no `server.proxy` configured in `vite.config.ts` despite the README mentioning a dev-server `/api` proxy — that's stale documentation; point `VITE_API_URL` directly at your backend instead.

### Regenerating API types
```bash
npm run api:types
```
Runs `generate-api-types.cjs`, which reads `VITE_API_URL` from the root `.env` file and runs `npx openapi-typescript ${VITE_API_URL}/openapi.json -o src/api/types.ts`. **Requires a live backend** (spec is fetched over HTTP, not read from a checked-in file). Never hand-edit `src/api/types.ts`.

### Scripts
`npm run dev` / `build` (`tsc -b && vite build`) / `preview` / `lint` / `api:types`.

---

## 5. Authentication System

### Session model
- **Access token**: JWT, stored in `localStorage` under key `auth_session` (as part of a JSON blob), injected as `Authorization: Bearer <token>` by API client middleware. Not an httpOnly cookie — it's readable by JS (standard SPA tradeoff).
- **Refresh token**: **never touches JS** — it's an httpOnly cookie set by the backend. All requests send `credentials: "include"` (`src/api/client.ts`) so it's carried automatically.
- Session shape (`src/store/authStore.ts`): `{ tokens: { access_token, id_token, expires_in, token_type }, user: { id, email, name, gender, phone_number, age, is_verified, is_active, created_at, updated_at } }`.

### Bootstrap
`src/App.tsx` calls `useAuthStore(s => s.loadSession)` exactly once in a `useEffect` on mount — this is the **only** call site of `loadSession()` in the app. It reads `auth_session` from `localStorage`, sets `session` if the parsed blob has a valid `tokens.access_token`, then flips `isLoading: false`. Both route guards gate on `isLoading` before checking `session`, so this must run (and finish synchronously — it's a plain localStorage read, not async) before any route renders its real content.

### API client middleware (`src/api/client.ts`)
Built on `openapi-fetch`, middleware order matters (openapi-fetch runs `onRequest` FIFO, `onResponse` LIFO):
1. **Bearer injection** (`onRequest`) — for any path not in `PUBLIC_ENDPOINTS` (`/auth/signin`, `/auth/signup`, `/auth/verify`, `/auth/resend-verification`, `/auth/refresh-token`), reads the access token from `authStore`. If the token's JWT `exp` claim is within 30s of expiring (`isTokenExpired`), proactively calls `refreshAccessToken()` before attaching the header.
2. **401 refresh-and-retry** (`onResponse`, registered last → runs first) — on any `401` (except from the refresh endpoint itself, to avoid a loop), calls `refreshAccessToken()`. Success → clones the failed request with a fresh Bearer header and re-issues it via **raw `fetch`** (bypasses the client's own middleware chain on the retry). Failure → `clearSession()`, returns the original 401.
3. **Generic error mapper** (`onResponse`, registered first → runs last) — any non-2xx becomes `throw new AppError(body.message ?? "An unexpected error occurred", "API_ERROR", status)`.
- `refreshAccessToken()` uses a module-level promise lock so concurrent expired-token checks/401s share one in-flight refresh call rather than firing several.
- Every fetch is wrapped to convert thrown network exceptions into `AppError(..., "NETWORK_ERROR")`.

### Auth flows — what's actually wired to UI

| Flow | API endpoint | Hook (`src/hooks/useAuth.ts`) | UI page/route |
|---|---|---|---|
| Sign in | `POST /auth/signin` | `useSignIn` | `src/pages/Login/Login.tsx` — **the only auth flow with a real page** |
| Sign up | `POST /auth/signup` | `useSignUp` | **None** — no page/route exists |
| Verify OTP | `POST /auth/verify` | `useVerifyUserCode` | **None** |
| Resend verification | `POST /auth/resend-verification` | `useResendCode` | **None** |
| Forgot password | `POST /auth/forgot-password` | `useForgotPassword` | **None** — `Login.tsx` links to `/forgot-password`, which has no matching route (dead link) |
| Reset password | `POST /auth/reset-password` | `useResetPassword` | **None** |
| Change password | `POST /auth/change-password` | `useChangePassword` | `src/pages/Security/Security.tsx` → `ChangePasswordCard` |
| Sign out | `POST /auth/signout` | `useSignOut` | Navbar/Sidebar logout |
| Sign out all devices | `POST /auth/signout-all` | `useSignOutAll` | `src/pages/Devices/Devices.tsx` |
| List/revoke sessions | `GET /auth/sessions`, `DELETE /auth/sessions/{id}` | `src/hooks/useSessions.ts` | `src/pages/Devices/Devices.tsx` |

**Important gap**: signup, OTP verification, forgot-password, and reset-password are fully implemented end-to-end at the endpoint + mutation-hook layer, but have **zero pages, routes, or Zod schemas**. `src/schemas/auth.ts` only defines `SigninSchema`. If Milestone 4 QA surfaces "I can't create an account on web" — that's not a bug, that UI was never built. Confirm with the product owner whether signup is meant to be web-first, mobile-only, or invite-only before building it.

### Logout must clear the query cache
All three logout-adjacent paths (`useSignOut`, `useSignOutAll`, `useChangePassword`) route through a shared `clearAllStores(queryClient)` helper in `useAuth.ts` that calls `queryClient.clear()` **then** `useSubscriptionStore.getState().clear()` **then** `clearSession()`. This is required — skipping it leaks the previous session's cached documents/subscription into the next login. `useChangePassword` additionally force-invalidates all sessions server-side (fire-and-forget `signOutAll()` call) before clearing local state, so changing your password always logs you out of the current tab too.

### Protected vs public routes (`src/router/index.tsx`)
- `ProtectedRoute` — checks `isLoading` (shows `PageLoader`), then `session`; no session → `<Navigate to="/login" replace/>`. Also calls `useSubscription()` here, meaning subscription data is fetched/synced as a side effect of merely being on any protected route.
- `PublicOnlyRoute` — same `isLoading` gate; if a session exists, redirects to `/home`.
- `/upload/:token` (`PublicUpload`) sits **outside both guards**, at the top level — accessible regardless of auth state (see §8).

---

## 6. Document Management

### Data model
A **directory** (`src/api/endpoints/directories.ts`) is a category-typed folder (`category.type`: `PROPERTY`, `GOVERNMENT`, `IDENTY`, `LEAGAL`, `FINANCIAL`, `BUSINESS`, `OTHER` — see §14 for the typo note). A **document** (`src/api/endpoints/documents.ts`) belongs to one directory: `{ id, directory_id, name, file_key, file_size, mime_type, is_deleted, uploaded_by, uploaded_via_link_id, created_at, updated_at }`.

### Browsing
- `src/pages/DocumentArchive/DocumentArchive.tsx` — **despite its name, this is the owner's full document library**, not a trash/soft-delete feature. Search (debounced via `useDebounce`), directory filter chips (`DirectoryChips.tsx`), multiselect (bulk download/delete via `MultiSelectBar.tsx`), single-item detail panel with **rename, delete, download, view** (`DocumentDetail.tsx`). There is no archive/restore endpoint anywhere in the API — `is_deleted` exists on the document record but there's no exposed toggle for it.
- `src/pages/VaultDocuments/VaultDocuments.tsx` — browses one directory, reached from `FamilyVaults` (a shared/granted-access vault). Detail panel (`VaultDocumentDetail.tsx`) is **read-only** — View only, no rename/delete/download — appropriate since the viewer here typically isn't the document owner.

### Upload — ⚠️ not implemented in the vault UI
`src/api/endpoints/documents.ts` defines `getPresignedUrl`, `confirmUpload`, and `uploadToS3` (S3 presigned-URL upload pattern), but **none of them have a hook wrapper or a call site anywhere in `src/pages`**. There is currently no way to upload a document into your own vault from the web app UI. The only working upload path today is the **public upload link** flow (§8), which uses a parallel, separate set of endpoints (`uploadLinks.ts`, not `documents.ts`). If Milestone 4 QA expects "upload a document from the dashboard," that feature needs to be built — the backend contract already supports it (presigned URL → PUT to S3 → confirm), it's just not wired to any component yet.

### Download & viewing
- `useDownloadDocument` / `useDownloadDocuments` (`src/hooks/useDocuments.ts`) — fetch a signed `download_url`, stream the response with a progress-tracked `sonner` loading toast, assemble a `Blob`, trigger a synthetic `<a download>` click.
- `useViewDocument` — fetches the signed URL and hands it to `src/components/common/DocumentViewer/DocumentViewer.tsx`, which renders PDFs via `react-pdf` (zoom 0.5–3.0, page nav) or images via `<img>`, as a full-screen portal overlay.

### Rename
`src/pages/DocumentArchive/components/RenameDocumentModal.tsx` strips the file extension before editing (regex `/\.[^/.]+$/`) so the user only edits the base name, then re-appends the original extension on submit — the extension itself cannot be changed through this modal.

### Category styling
`src/constants/categoryStyles.ts` maps `category.type` → `{icon, bgColor, iconColor}`. **`IDENTY` and `LEAGAL` are intentional typos matching the backend enum exactly** — do not "fix" the spelling here without also changing the backend, or those categories silently fall back to a generic grey folder icon.

---

## 7. Subscription System

### ⚠️ There is currently no payment gateway — read this section before starting Milestone 4

- **Zero references** to Stripe, Paystack, Flutterwave, Razorpay, or PayPal exist anywhere in `src`.
- The generated `webhooks` type in `src/api/types.ts` is `Record<string, never>` — an `openapi-typescript` placeholder confirming the **backend's OpenAPI spec declares zero webhook endpoints**.
- The entire backend subscription contract is: `GET /subscriptions/plans`, `GET /subscriptions/plans/{id}`, `GET /subscriptions/me`, `POST /subscriptions` (body: `{ plan_id, billing_cycle? }` — **no payment token/reference field at all**), `POST /subscriptions/trial` (body: `{ plan_id }`), `DELETE /subscriptions/me`.
- Clicking **"Subscribe"** in `src/pages/SubscriptionPlans/components/PlanCard.tsx` calls `useSubscribeToPlan()` → `POST /subscriptions` directly. **This immediately activates the subscription server-side with no payment step whatsoever.** Same for "Start Trial".
- **Currency inconsistency to resolve before picking a gateway**: `src/pages/Home/components/PlanCard.tsx` formats price with `₦` (Naira), while `src/pages/Subscription/components/PlanHeroCard.tsx` and `BillingCard.tsx` format with `$`. Nail down the actual billing currency early — it affects which gateway makes sense (Paystack/Flutterwave are NGN-first; Stripe is not NGN-native).

### What exists and works today
- **`src/store/subscriptionStore.ts`** (Zustand) — holds `subscription: MySubscription | null`, `storage: MyStorage | null`, `isLoaded: boolean`. Populated exclusively by `useSubscription()` (`src/hooks/useSubscription.ts`), which runs inside `ProtectedRoute` and syncs the store via `setData()`/`markLoaded()` whenever `GET /subscriptions/me` resolves (a 404/no-subscription still calls `markLoaded()`).
- Selectors: `isActive()`, `isWriteBlocked()`, `canUpload()`, `isUploadRestricted()`, `canManageFamily()`, `canAddFamilyMember(n)`, `canAddDirectoryMember(n)`, `canGrantUploadAccess(n)`, `canGrantDownloadAccess(n)`.
- **Only two selectors are actually consumed by UI**: `canManageFamily()` (disables the Invite/Share-Access/Generate-Link buttons in `FamilyMembers.tsx`, `FamilyAccess.tsx`, `MyLinks.tsx`) and `isActive()` (disables `DisableLinksCard` in `Security.tsx`). All count-based limit selectors (`canAddFamilyMember`, etc.) and the upload/write-blocking selectors (`canUpload`, `isWriteBlocked`, `isUploadRestricted`) are defined but have **zero call sites** — plan limits are not actually enforced client-side beyond the family-management gate. Worth flagging to product/QA as a pre-existing gap, separate from Milestone 4's payment scope.
- **`src/pages/Subscription/Subscription.tsx`** — current-plan overview: `PlanHeroCard` (plan, status, feature pills, trial countdown), `BillingCard` (renewal date, price, cancel button gated to `ACTIVE`/`GRACE` status), `StorageCard` (wraps the shared `StorageBar` component).
- **`src/pages/SubscriptionPlans/SubscriptionPlans.tsx`** — plan catalog; `PlanCard` per plan with Subscribe/Start-Trial buttons as described above.
- **`src/components/layout/SubscriptionBanner/SubscriptionBanner.tsx`** — rendered inside `DashboardLayout`, shows status-driven banners (trial ending, renewal due soon, grace period, restricted, cancelled) and storage-threshold banners (80%/95%/blocked); every action button just navigates to `/subscription` (never deep-links to a checkout flow, since none exists).
- No Zod schema exists for subscriptions/plans/payment — all typing is derived straight from generated OpenAPI types.

---

## 8. Family Vault & Secure Upload Links

### Family network vs. directory access — three related but distinct pages
1. **`src/pages/FamilyMembers/FamilyMembers.tsx`** — manages the **relationship graph** (not directory access): tabs for Members (accepted), Pending (received invites), Sent (sent invites). Backed by `src/api/endpoints/familyMembers.ts` (`sendFamilyInvite`, `acceptFamilyInvite`, `rejectFamilyInvite`, `updateFamilyRelation`, `deleteFamilyMember` — the last one doubles as "cancel a sent invite"). This is the prerequisite step — you must be connected before you can share a directory with someone.
2. **`src/pages/FamilyAccess/FamilyAccess.tsx`** — the **owner's** management console for sharing specific directories with accepted family members (`can_view`/`can_upload`/`can_download` per grant). Backed by `src/api/endpoints/familyAccess.ts` (`getAccessGrants`, `getDirectoryMembers`, `addDirectoryMember`, `removeDirectoryMember`). "Share Access" opens `ShareAccessPanel` (pick directory + accepted member) → `useGrantAccess()`; per-directory "Revoke" → `useRevokeAccess()`.
3. **`src/pages/FamilyVaults/FamilyVaults.tsx`** — the **recipient's** read-only mirror: vaults shared *with you*, grouped by grantor, via `useMyAccess()` (`getMyAccess` → `GET /user-directories/my-access`). Clicking a directory navigates to `/vaults/directory/:directoryId` (`VaultDocuments`, §6), passing grantor/category info via `location.state`.

**Required invalidations** (matches the table in CLAUDE.md exactly): both `useGrantAccess()` and `useRevokeAccess()` (`src/hooks/useFamilyAccess.ts`) invalidate `queryKeys.accessGrants.all()` **and** `queryKeys.directoryMembers.all()`.

### Secure upload links — two distinct API surfaces, don't confuse them
- **`src/api/endpoints/uploadLinksPrivate.ts`** — authenticated, owner-facing CRUD (list/create/deactivate links, requires the logged-in user's Bearer token). Backs `src/pages/MyLinks/MyLinks.tsx` (list + filter + create via `GenerateLinkPanel`, expiry/max-file-count/max-file-size/PIN options, Zod-validated via `GenerateLinkSchema` in `src/schemas/uploadLinks.ts`) and `src/pages/LinkDetails/LinkDetails.tsx` (single link detail + upload-slot progress bar + `auditLogs[]` upload history, each with a "View" action wired to `useViewDocument()`).
- **`src/api/endpoints/uploadLinks.ts`** — unauthenticated, token-based public flow: `getPublicUploadLink(token)` → `getPublicPresignedUrl(token, ...)` → `uploadToS3Public(...)` (raw XHR PUT, bypasses `apiClient` entirely since it targets a presigned storage URL, not the app API) → `confirmPublicUpload(token, ...)`. This is exactly the presigned-upload pattern that's missing for the *authenticated* vault upload flow described in §6 — if you build vault upload, this file is the closest working reference implementation.
- **`src/pages/PublicUpload/PublicUpload.tsx`** (route `/upload/:token`, no auth guard in either direction) — the anonymous recipient's page. State machine: loading → not-found (invalid token) → expired → slots-exhausted → success → the upload form (`UploadArea.tsx`). The **only** "authorization" on this page is possession of the opaque token in the URL plus an optional 6-digit PIN the owner shares out-of-band — no login, no rate limiting or captcha visible client-side (any such protection lives server-side, if it exists at all — worth confirming with backend before this goes to production, since it's a fully public write endpoint).

---

## 9. API Integration

- **Client**: `src/api/client.ts`, built on `openapi-fetch`, typed against `paths` from the auto-generated `src/api/types.ts`. Endpoint files (`src/api/endpoints/*.ts`) are the only code allowed to call `apiClient` — never call `fetch` directly, never call `apiClient` from a component or hook.
- **Auth header injection**: automatic, via the `onRequest` middleware in `client.ts`, for every path except `PUBLIC_ENDPOINTS` (`/auth/signin`, `/auth/signup`, `/auth/verify`, `/auth/resend-verification`, `/auth/refresh-token`). Note the public upload-link paths (`/upload-links/public/*`) are **not** in this list — it works out in practice only because an anonymous visitor has no session to attach, but if an already-logged-in user opens a public link in the same tab, their Bearer token *will* be sent to those endpoints too. The backend must authorize purely off the URL token, not off the absence of an Authorization header.
- **Error handling**: any non-2xx response is converted to a thrown `AppError(message, "API_ERROR", status)` inside the client middleware — endpoint functions never need their own try/catch. All hook-level mutations wire `onError: handleApiError` (`src/errors/errorHandler.ts`), which maps `NETWORK_ERROR`/401/403/404/429/other to a `toast.error(...)` with a friendly title+message. Components never see raw error objects.
- **Type extension pattern**: when the backend ships a field ahead of a regenerated OpenAPI spec, extend locally with an intersection type and a `// Extend until npm run api:types picks up the updated spec.` comment (see `documents.ts`'s `Document` type for `uploaded_via_link_id`/`uploaded_by`, and `GetPresignedUrlResponse`'s `required_headers`). Remove the extension once types are regenerated.

---

## 10. Routing & Navigation

All routes are declared in `src/router/index.tsx`, wrapped in one top-level `<Suspense fallback={<PageLoader/>}>`.

| Path | Page | Guard | Layout |
|---|---|---|---|
| `/` | Landing | `PublicOnlyRoute` | `AppLayout` |
| `/login` | Login | `PublicOnlyRoute` | (none — full page) |
| `/upload/:token` | PublicUpload | **none** (fully public) | (none) |
| `/home` | Home | `ProtectedRoute` | `DashboardLayout` |
| `/documents` | DocumentArchive | `ProtectedRoute` | `DashboardLayout` |
| `/vaults/directory/:directoryId` | VaultDocuments | `ProtectedRoute` | `DashboardLayout` |
| `/family-members` | FamilyMembers | `ProtectedRoute` | `DashboardLayout` |
| `/family-access` | FamilyAccess | `ProtectedRoute` | `DashboardLayout` |
| `/family-vaults` | FamilyVaults | `ProtectedRoute` | `DashboardLayout` |
| `/my-links`, `/my-links/:id` | MyLinks, LinkDetails | `ProtectedRoute` | `DashboardLayout` |
| `/profile` | Profile | `ProtectedRoute` | `DashboardLayout` |
| `/subscription`, `/subscription/plans` | Subscription, SubscriptionPlans | `ProtectedRoute` | `DashboardLayout` |
| `/settings/security` | Security | `ProtectedRoute` | `DashboardLayout` |
| `/settings/devices` | Devices | `ProtectedRoute` | `DashboardLayout` |

Notes:
- Most pages are `lazy()`-loaded; a few (`FamilyAccess`, `FamilyVaults`, `MyLinks`, `FamilyMembers`, `Profile`) are imported eagerly — inconsistent with the rest, harmless but worth normalizing if bundle size becomes a concern.
- `/forgot-password` is linked from `Login.tsx` but has no matching route — dead link until the forgot-password UI is built (§5).
- Passing display context (names/types) to a child route via `navigate(path, { state: {...} })` + `useLocation()` on the receiving page is the established pattern for avoiding an extra fetch just to render a header while the real data loads (used by `FamilyVaults`→`VaultDocuments` and `MyLinks`→`LinkDetails`).

---

## 11. State Management

| Store | File | Holds | Persistence |
|---|---|---|---|
| Auth | `src/store/authStore.ts` | `session` (tokens+user), `isLoading`, `tempPassword`/`tempMail` (carries signup credentials into the OTP step) | `session` → `localStorage["auth_session"]`; temp fields → `sessionStorage` |
| Subscription | `src/store/subscriptionStore.ts` | `subscription`, `storage` (usage/threshold), `isLoaded`, plus the gating selectors listed in §7 | In-memory only, repopulated by `useSubscription()` on each protected-route mount |
| Toast | `src/store/toastStore.ts` | Fullscreen-toast state (type/title/message/closable), consumed by `FullscreenToast` | In-memory |
| Error | `src/store/errorStore.ts` | Generic last-error message, set by `handleError` (the non-API-specific fallback path) | In-memory |

React Query owns all server data (documents, directories, family/access/upload-link lists, subscription plans) via the query-key factory in `src/api/queryKeys.ts` — domains: `directories`, `documents`, `profilePicture`, `sessions`, `directoryMembers`, `accessGrants`, `familyMembers`, `myAccess`, `uploadLinks` (public), `uploadLinksPrivate` (owner), `subscription`.

---

## 12. Key Patterns & Conventions

See `CLAUDE.md` for the canonical, exhaustive version of these. Highlights most relevant to onboarding quickly:
- Every named component gets its own file — no inline component definitions, even tiny skeleton rows.
- `useQuery`/`useMutation` hooks always surface errors through `handleApiError`; mutations always check `data.success` before showing a success toast (HTTP 200 does not guarantee logical success in this API).
- Toasts only via `@/lib/toast`, never `sonner` directly.
- Dynamic icons via `React.createElement`, static icons via JSX (avoids "component created during render").
- Tailwind v4 `!important` uses the suffix form (`h-auto!`), never the v3 prefix form.
- Skeleton loaders match the shape/size of the real content, extracted into named components when reused in lists.
- Slide-in side panels (used for Share Access, Generate Link, Invite Member) share one structural pattern: backdrop + fixed-right panel + `useEffect` resetting form state on close.

---

## 13. Milestone 4 — What Needs To Be Built

Based on the current state (§7), Milestone 4's payment-gateway work is **not** wiring an existing checkout UI to a live gateway — it's building the entire payment layer from nothing on both frontend and backend. Concretely, on the **web side**:

1. **Resolve currency first.** Decide NGN vs USD (or multi-currency) before picking a gateway — fix the `₦` vs `$` inconsistency between `Home/components/PlanCard.tsx` and `Subscription/components/{PlanHeroCard,BillingCard}.tsx` as part of this.
2. **New checkout/payment API layer** — a `src/api/endpoints/payments.ts` (or extend `subscriptions.ts`) once the backend exposes checkout-session/payment-intent endpoints and a webhook-confirmed activation flow. The current `POST /subscriptions` (direct, unpaid activation) will need to change to something like: create a checkout session → redirect/open gateway widget → gateway calls backend webhook → backend flips subscription to `ACTIVE` → frontend polls or is redirected back and refetches `useSubscription()`.
3. **Rework `SubscriptionPlans` "Subscribe"/"Start Trial" buttons** (`src/pages/SubscriptionPlans/components/PlanCard.tsx`) — replace the direct `useSubscribeToPlan()` call with: initiate checkout → navigate to gateway (redirect-based, e.g. Paystack/Flutterwave standard checkout) or mount an embedded widget → handle the return/callback URL.
4. **New "payment result" page/route** — e.g. `/subscription/checkout/callback` or similar, to handle the gateway's redirect back (success/failure/cancelled), show appropriate UI, and trigger `queryClient.invalidateQueries({queryKey: queryKeys.subscription.me()})` so `subscriptionStore` picks up the newly-activated plan.
5. **Post-payment subscription refresh** — `useSubscription()` already re-syncs the store on any `subscription.me()` invalidation; make sure the callback page (or a webhook-driven polling fallback, since client-side redirect completion doesn't guarantee the webhook has landed yet) invalidates that key rather than assuming the redirect alone means the subscription is active.
6. **Payment method / billing history UI** — likely new components under `src/pages/Subscription/components/` (e.g., a `PaymentHistoryCard`, saved-card management if the gateway supports tokenization) — scope depends entirely on what the backend/gateway choice supports.
7. **Zod schema** — no `src/schemas/subscription.ts` exists yet; add one once there's an actual client-submitted payment form (e.g., card details if not using a hosted redirect).
8. **Error/edge-case handling** — payment failures, gateway timeouts, webhook-lag ("I paid but my plan still shows inactive") need explicit UI states; none of this exists today since there's no payment step to fail.
9. **QA pass** — once payment exists, also close the pre-existing gaps flagged throughout this doc that QA will likely hit even outside payment scope: the missing signup/OTP/forgot-password UI (§5), the missing vault-upload UI (§6), and the unenforced count-based subscription limits (§7) — confirm with product whether these are in scope for Milestone 4 or explicitly deferred.
10. **Production deployment** — `infra/` CDK app currently has no `deploy-prod` GitHub Actions workflow (only `deploy-dev.yml` exists) and no ACM certificate/custom domain wired into `FrontendStack` (noted as a TODO in `infra/README.md`). Milestone 4's "production deployment" scope likely includes: adding a `deploy-prod.yml` workflow, provisioning a prod AWS account/secrets, and wiring a real domain + TLS cert into the CDK stack.

---

## 14. Known Gotchas & Non-Obvious Decisions

- **`IDENTY` and `LEAGAL` in `src/constants/categoryStyles.ts` are intentional typos**, matching the backend's `category.type` enum exactly. Do not "fix" the spelling without a coordinated backend change — doing so silently breaks category icons/colors for those two categories across `DocumentItem`, `DirectoryChips`, `DocumentDetail`, `VaultDocumentDetail`.
- **"DocumentArchive" is not an archive/trash feature** — it's the owner's full document library page (search, filter, multiselect, rename, delete, download). There is no soft-delete/restore endpoint in the API despite `is_deleted` existing on the document schema.
- **Vault document upload is unimplemented in the UI.** `getPresignedUrl`/`confirmUpload`/`uploadToS3` exist in `documents.ts` with no hook or call site. Don't assume "upload" works anywhere except the public-link flow.
- **Signup/OTP/forgot-password/reset-password have no UI**, only working API/hook plumbing. `Login.tsx` links to a nonexistent `/forgot-password` route.
- **`src/errors/logger.ts` is an empty stub** — zero exports, zero importers. Likely intended for future centralized logging (Sentry or similar); don't be surprised it does nothing today.
- **The 401-refresh retry in `client.ts` re-issues the failed request via raw `fetch`, not through `apiClient`** — meaning the retried request bypasses the client's own middleware chain (won't get error-mapped into an `AppError` the same way, won't recursively re-trigger refresh logic).
- **`VITE_APP_VERSION` bypasses the typed `env.ts` module** — read directly via `import.meta.env` in `deviceInfo.utils.ts` with its own inline default, unlike `VITE_API_URL`. In CI it's set to the git SHA, not a semver.
- **Subscription plan limits are mostly unenforced client-side.** Only `canManageFamily()` and `isActive()` gate any UI; count-based limits (`canAddFamilyMember`, `canAddDirectoryMember`, `canGrantUploadAccess`, `canGrantDownloadAccess`) and upload/write-blocking selectors (`canUpload`, `isWriteBlocked`, `isUploadRestricted`) exist in the store but have no consumers.
- **Two nearly-identical `getFamilyMembers()`/`GetFamilyMembersResponse`** exist verbatim in both `familyAccess.ts` and `familyMembers.ts` (same endpoint, duplicated). Harmless but a maintenance smell.
- **`useFamilyMembers` staleTime differs between two files** — 5 min in `useFamilyAccess.ts`, 2 min in `useFamilyMembers.ts` — both used by different pages under the same query key; whichever mounts sets the effective cache behavior. Worth normalizing.
- **The public upload flow's only "auth" is the unguessable URL token plus an optional owner-set 6-digit PIN.** No client-side rate limiting or captcha. If this is a concern, it needs to be addressed backend-side and confirmed before production.
- **`uploadToS3`/`uploadToS3Public` bypass `apiClient` entirely** — they PUT directly to a presigned storage URL via raw `XMLHttpRequest` (for upload-progress events), since that target host isn't the app's API and doesn't take a Bearer token.
- **No `server.proxy` in `vite.config.ts`** despite README claiming one — point `VITE_API_URL` at your backend directly in dev.
- **`tsconfig.app.json` has no explicit `"strict": true`** — it does set `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `erasableSyntaxOnly`, but confirm strictness expectations before assuming full strict-mode type safety.

---

## 15. Quick Reference: "I want to change X" → file map

| I want to... | Look here |
|---|---|
| Change API base URL / add an env var | `src/config/env.ts`, `.env.example`, `.env.local` |
| Regenerate types after a backend API change | `npm run api:types` → `generate-api-types.cjs` → `src/api/types.ts` |
| Add a new API endpoint | New/existing file in `src/api/endpoints/`, add query key in `src/api/queryKeys.ts`, add hook in `src/hooks/` |
| Change how 401/refresh/auth headers work | `src/api/client.ts` |
| Change login form validation | `src/schemas/auth.ts` (`SigninSchema`), `src/pages/Login/Login.tsx` |
| Build signup/OTP/forgot-password UI | Hooks already exist in `src/hooks/useAuth.ts` and `src/api/endpoints/auth.ts` — need new pages + routes + Zod schemas |
| Change session storage/shape | `src/store/authStore.ts` |
| Add logout side-effects | `clearAllStores` helper in `src/hooks/useAuth.ts` |
| Change toast copy for an error code | `src/errors/errorHandler.ts` (`handleApiError`) |
| Change document list/search/filter behavior | `src/pages/DocumentArchive/DocumentArchive.tsx`, `src/hooks/useDocuments.ts` |
| Change document category icon/color | `src/constants/categoryStyles.ts` (mind the `IDENTY`/`LEAGAL` typos) |
| Build vault document upload | `src/api/endpoints/documents.ts` (`getPresignedUrl`/`confirmUpload`/`uploadToS3` already exist, unused) — model after `src/pages/PublicUpload/components/UploadArea.tsx` |
| Change document rename behavior | `src/pages/DocumentArchive/components/RenameDocumentModal.tsx`, `src/schemas/document.ts` |
| Change PDF/image viewer behavior | `src/components/common/DocumentViewer/DocumentViewer.tsx` |
| Change subscription plan cards / Subscribe button | `src/pages/SubscriptionPlans/SubscriptionPlans.tsx` + `components/PlanCard.tsx` |
| Add real payment gateway integration | See §13 — new `src/api/endpoints/payments.ts`, rework `PlanCard.tsx`, new callback route/page, `useSubscription` invalidation |
| Change plan-based feature gating | `src/store/subscriptionStore.ts` selectors; consumers in `FamilyMembers.tsx`, `FamilyAccess.tsx`, `MyLinks.tsx`, `Security.tsx` |
| Change subscription/storage banner copy | `src/components/layout/SubscriptionBanner/SubscriptionBanner.tsx` |
| Change family invite flow | `src/pages/FamilyMembers/FamilyMembers.tsx`, `src/hooks/useFamilyMembers.ts`, `src/schemas/familyMembers.ts` |
| Change directory-sharing (grant/revoke access) | `src/pages/FamilyAccess/FamilyAccess.tsx`, `src/hooks/useFamilyAccess.ts` |
| Change the "shared with me" vault view | `src/pages/FamilyVaults/FamilyVaults.tsx`, `src/hooks/useFamilyVaults.ts` |
| Change upload-link creation form (expiry/PIN/limits) | `src/pages/MyLinks/components/GenerateLinkPanel.tsx`, `src/schemas/uploadLinks.ts` |
| Change the public upload page | `src/pages/PublicUpload/PublicUpload.tsx` + `components/UploadArea.tsx`, `src/api/endpoints/uploadLinks.ts` |
| Change route structure / add a new protected page | `src/router/index.tsx` (checklist also in `CLAUDE.md`) |
| Change dashboard shell (topbar/sidebar) | `src/components/layout/DashboardLayout/`, `src/components/layout/Navbar/` |
| Change public marketing site | `src/pages/Landing/Landing.tsx` + `components/` |
| Change device/session management | `src/pages/Devices/Devices.tsx`, `src/hooks/useSessions.ts` |
| Change deployment pipeline (dev) | `.github/workflows/deploy-dev.yml` |
| Set up production deployment | `infra/` CDK app (`infra/lib/frontend-stack.ts`, `infra/config/prod.ts`) — no prod GitHub Actions workflow exists yet |
| Change AWS infra (S3/CloudFront/caching) | `infra/lib/frontend-stack.ts` |
