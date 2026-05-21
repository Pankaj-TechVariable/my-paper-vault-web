# CLAUDE.md — MyPaperVault Web

Complete reference for patterns, conventions, and architecture. Follow everything here exactly.

---

## Tech Stack

- **React 19** + **TypeScript 6** (strict mode)
- **Vite** with `@tailwindcss/vite` — Tailwind CSS v4
- **React Router v7** — file-based routing with Outlet layouts
- **TanStack React Query v5** — server state
- **Zustand v5** — client state
- **react-hook-form v7** + **Zod v4** — form validation
- **openapi-fetch** — type-safe API client generated from OpenAPI spec
- **sonner** — toast notifications
- **react-icons** — icon library

---

## Project Structure

```
src/
├── api/
│   ├── client.ts            # openapi-fetch client + middleware (auth, refresh, error)
│   ├── types.ts             # Auto-generated OpenAPI types (never edit manually)
│   ├── queryKeys.ts         # TanStack Query key factory
│   └── endpoints/           # One file per API domain (auth, documents, directories, users)
├── components/
│   ├── common/              # Reusable UI components (Button, TextInput, StatCard, etc.)
│   └── layout/              # Layout wrappers (AppLayout, DashboardLayout, Navbar, Sidebar)
├── config/
│   └── env.ts               # Env variable access — always use this, never import.meta.env directly
├── constants/
│   └── categoryStyles.ts    # Document category → icon + color mapping
├── errors/
│   ├── AppError.ts          # Custom error class
│   └── errorHandler.ts      # handleApiError — central error dispatcher
├── hooks/                   # Custom hooks (useDocuments, useDirectories, useAuth, etc.)
├── lib/
│   └── toast.ts             # Toast wrapper (source of truth)
├── pages/                   # Page components, each in own folder
├── router/
│   └── index.tsx            # Routes, guards, lazy loading
├── schemas/                 # Zod schemas for forms
├── store/                   # Zustand stores (authStore, toastStore, errorStore)
└── utils/                   # Pure utility functions (document.utils, deviceInfo.utils)
```

---

## Icons

**Preferred:** `react-icons/md` (Material Design outlined) for all UI chrome — nav, buttons, status indicators.

**Use `react-icons/fa6`** for file/document/category icons (FaFileImage, FaFilePdf, FaGavel, etc.).

**Avoid mixing** `react-icons/hi` (Heroicons) or `react-icons/fa` (FA5) into new code — they exist only where not yet replaced.

**Never declare an icon component inside a render function** (causes "Components created during render" error). Use `React.createElement(IconComponent, props)` when the icon is resolved dynamically at runtime:

```tsx
// ✅ Dynamic icon — use createElement
{
  createElement(getMimeIcon(doc.mime_type), {
    size: 14,
    color: style.iconColor,
  });
}

// ✅ Static icon — use JSX directly
<MdOutlineHome size={18} />;
```

---

## Styling

Tailwind CSS v4 — utility-first, mobile-first.

**Primary color:** `--color-primary: oklch(42.4% 0.199 265.638)` — use as `text-primary`, `bg-primary`, `border-primary`. Never hardcode the hex value.

**Typography scale:** `text-xs` (labels, badges, captions), `text-sm` (body, nav), `text-base`+ (headings only).

**Font weights:** `font-medium` (body), `font-semibold` (labels, buttons), `font-bold` (headings).

**Card pattern:**

```tsx
<div className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5">
```

**Active nav item** (sidebar):

```tsx
className={`... border-r-3 ${active ? "bg-blue-50 text-primary border-primary" : "border-transparent text-slate-600 hover:bg-slate-100"}`}
```

**Skeleton loading:** `bg-slate-100 animate-pulse rounded` — match the shape/size of the content it replaces.

**Responsive breakpoints:** `sm` 640, `md` 768, `lg` 1024, `xl` 1280. Mobile-first (no prefix = mobile).

**Tailwind v4 `!important` modifier:** Use the **suffix** form `class!` — never the `!class` prefix form (that's v3 syntax and the linter will flag it):

```tsx
// ✅ Correct (v4)
className = "h-auto! py-1! px-2.5! rounded-lg! text-xs!";

// ❌ Wrong (v3 — do not use)
className = "!h-auto !py-1 !px-2.5";
```

**Stats/details sections hidden on mobile:** Use `hidden md:grid` (or `hidden md:flex`) to hide dashboard stat grids on small screens where they add noise.

---

## API Client

`src/api/client.ts` — never import `fetch` directly in endpoints; always use `apiClient`.

- All requests include `credentials: "include"` (for httpOnly refresh token cookie).
- Middleware runs in LIFO order:
  1. **401 refresh** (runs first): refreshes token, retries request, or clears session.
  2. **Error handler** (runs second): throws `AppError` on non-2xx.
  3. **Bearer injection** (runs third): adds `Authorization: Bearer {token}` for non-public routes.

**Public endpoints** (no token): `/auth/signin`, `/auth/signup`, `/auth/verify`, `/auth/resend-verification`, `/auth/refresh-token`.

**Endpoint function pattern:**

```ts
export const getDocuments = async (
  params?: GetDocumentsParams,
): Promise<GetDocumentsResponse> => {
  const { data } = await apiClient.GET("/documents", {
    params: { query: params },
  });
  return data!;
};
```

**API types** are auto-generated. Run `npm run api:types` to regenerate. Never manually edit `src/api/types.ts`. Derive exported types from the schema:

```ts
export type Document = GetDocumentsResponse["data"][number];
```

---

## Query Keys

All query keys go in `src/api/queryKeys.ts`. Use the factory pattern:

```ts
queryKeys.documents.all(); // broad invalidation
queryKeys.documents.list(params); // scoped to specific params
queryKeys.documents.count();
```

When adding a new domain, follow the same `all()` / `list(params)` pattern.

---

## Hooks

### useQuery pattern

```ts
export const useDocuments = (params?: GetDocumentsParams) => {
  const query = useQuery<GetDocumentsResponse, AppError>({
    queryKey: queryKeys.documents.list(params),
    queryFn: () => getDocuments(params),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.code === "NETWORK_ERROR") return false;
      if (error.status && error.status < 500) return false;
      return failureCount < 2;
    },
  });

  useEffect(() => {
    if (query.error) handleApiError(query.error);
  }, [query.error]);

  return query;
};
```

### useMutation pattern

```ts
export const useRenameDocument = () => {
  const queryClient = useQueryClient();
  return useMutation<
    RenameDocumentResponse,
    AppError,
    { id: string; name: string }
  >({
    mutationFn: ({ id, name }) => renameDocument(id, name),
    onSuccess: (data) => {
      if (!data.success)
        return toast.error("Rename failed", "Please try again.");
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all() });
      toast.success("Document renamed");
    },
    onError: handleApiError,
  });
};
```

**Rules:**

- Always check `if (!data.success)` before `toast.success` — don't assume success on 200.
- `onError: handleApiError` — always, no custom error handling in components.
- `staleTime`: 5 min for documents/family data, 10 min for directories.
- No retry on network errors or 4xx responses.

**Required invalidations (must not be omitted):**
| Mutation | Keys to invalidate |
|---|---|
| Delete document | `documents.all()` + `documents.count()` |
| Delete documents (bulk) | `documents.all()` + `documents.count()` |
| Grant access | `accessGrants.all()` + `directoryMembers.all()` |
| Revoke access | `accessGrants.all()` + `directoryMembers.all()` |

---

## Error Handling

**Never** show raw error messages in components. All errors go through `handleApiError`:

```ts
import { handleApiError } from "@/errors/errorHandler";
```

`AppError` has `code?: string` and `status?: number`. Error codes: `NETWORK_ERROR`, `API_ERROR`.

`handleApiError` maps status codes to user-friendly toast messages:

- Network error → "No connection"
- 401 → "Session expired"
- 403 → "Access denied"
- 404 → "Not found"
- 429 → "Too many requests"
- Other → error.message

---

## Toast

Import from `@/lib/toast` (re-exports from `@/lib/toast`):

```ts
import { toast } from "@/lib/toast";

toast.success("Title");
toast.success("Title", "Message string");
toast.success("Title", { message: "Details", duration: 0 }); // duration: 0 → sticky
toast.error("Title", "Something went wrong");
toast.fullscreen({
  type: "success",
  title: "Done",
  message: "Details",
  closable: true,
});
```

---

## Forms

Schemas live in `src/schemas/`. Always use Zod v4 + react-hook-form:

```ts
// src/schemas/auth.ts
export const SigninSchema = z.object({
  email: z.email({ error: ... }).trim(),
  password: z.string({ error: ... }).trim().min(2, { message: '...' }),
});
export type SigninFormData = z.infer<typeof SigninSchema>;

// Component
const { register, handleSubmit, formState: { errors } } = useForm<SigninFormData>({
  resolver: zodResolver(SigninSchema),
});
```

Pass `...register("fieldName")` directly to `TextInput`/`PasswordInput`. Error messages come from `errors.fieldName?.message`.

---

## Components

### Button

```tsx
<Button label="Save" variant="contained" onClick={fn} loading={isPending} />
<Button label="Cancel" variant="outlined" />
<Button label="View all" variant="text" endIcon={<FaArrowRight size={12} />} />
<Button label="Log Out" variant="text" startIcon={<MdOutlineLogout size={18} />}
  className="border-red-500 text-red-500 hover:bg-red-50" labelClassName="text-red-500!" />
```

Variants: `contained` (bg-primary, white text), `outlined` (border-primary), `text` (transparent).
`loading` replaces startIcon with a spinner. `disabled` + `loading` both add `opacity-40 cursor-not-allowed`.

### TextInput

```tsx
<TextInput
  label="Email Address"
  {...register("email")}
  error={errors.email?.message}
/>
```

### PasswordInput

```tsx
<PasswordInput
  label="Password"
  {...register("password")}
  error={errors.password?.message}
/>
```

### StatCard

```tsx
<StatCard
  label="Total Documents"
  icon={<IoMdDocument size={16} />}
  isLoading={isLoading}
  skeleton={<div className="h-4 w-8 bg-slate-200 rounded animate-pulse" />}
>
  <p className="text-sm font-bold text-slate-900">{count}</p>
</StatCard>

// With dot indicator instead of icon
<StatCard label="Vault Status" indicator={<span className="w-2 h-2 rounded-full bg-green-500 inline-block" />}>
  <p className="text-sm font-bold text-green-600">Secure</p>
</StatCard>
```

### DocumentItem

```tsx
<DocumentItem
  document={doc}
  directory={dir}
  onClick={(doc) => navigate(`/documents/${doc.id}`)}
/>
```

Renders: mime icon (category-colored), name, category badge (icon + dir name), date, file size, owner, chevron.

Automatically shows a **"Via Link"** badge (`FaLink` icon, indigo color) when `document.uploaded_via_link_id` is non-null, and displays the uploader name from `document.uploaded_by`.

### ConfirmModal

Use for all destructive confirmations — never inline confirm/cancel buttons in the list UI:

```tsx
import ConfirmModal from "@/components/common/ConfirmModal/ConfirmModal";

<ConfirmModal
  title="Revoke Access"
  message={`Remove access for ${memberName} to "${dirName}"?`}
  confirmLabel="Revoke"
  onConfirm={handleRevoke}
  onCancel={() => setConfirming(false)}
  loading={isRevoking}
  destructive
/>;
```

`destructive` prop styles the confirm button in red. `loading` disables both buttons and shows a spinner.

### Button — compact/inline variant

`contained` variant defaults to `h-10`. Override with Tailwind v4 `!` suffix for inline/row buttons:

```tsx
<Button
  label="Revoke"
  variant="contained"
  className="shrink-0 h-auto! py-1! px-2.5! rounded-lg! bg-red-600 text-xs!"
  loading={isRevoking}
  onClick={handleRevoke}
/>
```

### Slide-in Panel (right drawer)

Full-screen on mobile, fixed-width on desktop. Use this structure:

```tsx
{
  /* Backdrop */
}
{
  isOpen && (
    <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
  );
}
{
  /* Panel */
}
<div
  className={`fixed top-0 right-0 z-50 h-full w-full sm:w-96 bg-white shadow-xl
    flex flex-col transition-transform duration-300
    ${isOpen ? "translate-x-0" : "translate-x-full"}`}
>
  {/* header + scrollable body + footer */}
</div>;
```

Reset form state when the panel closes via `useEffect(() => { if (!isOpen) resetForm(); }, [isOpen])`.

### Custom DropdownSelect (for fixed/overflow panels)

**Never use native `<select>` inside a `position: fixed` or `overflow: hidden` container** — the browser renders the native dropdown relative to the viewport, making it appear in the wrong position.

Use a custom dropdown instead:

```tsx
const DropdownSelect = ({ placeholder, options, value, onChange, disabled }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => !disabled && setOpen((o) => !o)} ...>
        {/* selected label or placeholder */}
      </button>
      {open && (
        <ul className="absolute left-0 right-0 top-[calc(100%+4px)] z-60 bg-white border rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {options.map((opt) => (
            <li key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }} ...>
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

---

## Zustand Stores

### subscriptionStore

```ts
const canManageFamily = useSubscriptionStore((s) => s.canManageFamily());
```

Use `canManageFamily()` (and similar selectors) to gate features behind active subscription. Pass the result as `disabled` to buttons:

```tsx
<Button label="Share Access" disabled={!canManageFamily()} ... />
```

### authStore

```ts
const session = useAuthStore((s) => s.session); // { tokens, user }
const isLoading = useAuthStore((s) => s.isLoading); // hydration flag
const setSession = useAuthStore((s) => s.setSession);
const clearSession = useAuthStore((s) => s.clearSession);
```

`session.tokens.access_token` — JWT access token (localStorage).
`refresh_token` — **never stored in JS**, sent as httpOnly cookie by the backend automatically via `credentials: "include"`.

`loadSession()` is called once in `App.tsx` on mount. Guards check `isLoading` before `session`.

### toastStore

Not used directly in components — use `toast.fullscreen(...)` from `@/lib/toast`.

---

## Routing

```tsx
// Public only (redirects to /home if logged in)
<Route element={<PublicOnlyRoute />}>
  <Route element={<AppLayout />}>
    <Route path="/" element={<Landing />} />
  </Route>
  <Route path="/login" element={<Login />} />
</Route>

// Private (redirects to /login if not logged in)
<Route element={<ProtectedRoute />}>
  <Route element={<DashboardLayout />}>
    <Route path="/home" element={<Home />} />
  </Route>
</Route>
```

All page components are `lazy()` loaded. `Suspense` wraps all routes with `PageLoader` fallback.

**Adding a new private page:**

1. Create `src/pages/MyPage/MyPage.tsx` + `index.ts`
2. `lazy(() => import("@/pages/MyPage"))`
3. Add inside `<ProtectedRoute><DashboardLayout>` block

**Passing context to child routes via location state:**

```tsx
// Sender (parent page)
navigate(`/vaults/directory/${dir.id}`, {
  state: {
    directoryName: dir.name,
    grantorName,
    categoryType: dir.category?.type,
  },
});

// Receiver (child page)
interface MyPageState {
  directoryName?: string;
  grantorName?: string;
  categoryType?: string;
}
const { state } = useLocation() as { state: MyPageState | null };
const directoryName = state?.directoryName ?? "Fallback Name";
```

Use this pattern to pass display context (names, types) when navigating to a detail/sub-page so the child doesn't need an extra API call just to render a title.

---

## Layouts

### DashboardLayout (authenticated pages)

- Topbar: full width, logo (mobile only), username + avatar
- Sidebar desktop: fixed left, 240px, `border-r border-slate-100`
- Sidebar mobile: full-height overlay drawer, backdrop, close button
- `<Outlet />` renders the page inside the main scrollable area

### AppLayout (public pages)

- `Navbar` + `<Outlet />` (flex-1) + `Footer`

---

## Page Organisation

Each page gets its own folder under `src/pages/`:

```
src/pages/Home/
├── Home.tsx                   # Top-level page — layout + stat cards + imports sub-components
├── homeConstants.tsx          # Static data arrays (quickActions, securityItems) — JSX allowed
├── index.ts                   # export { default } from "./Home"
└── components/
    ├── RecentDocuments.tsx    # Screen-level sub-component
    └── RecentDocumentSkeletonRow.tsx
```

**Rules:**

- Page constants (static arrays with JSX icons) → `homeConstants.tsx` in the page folder.
- Screen-level sub-sections (large blocks) → `components/` folder inside the page.
- Reusable across pages → `src/components/common/`.
- No business logic in page constants files — pure data.
- **Every named component must live in its own file.** Never define a component inline inside a page file or another component file — not even small ones like skeletons, rows, or cards. If it has a name, it gets its own file under `components/`. The page file is a thin orchestrator: state, data fetching, and layout only.

---

## Category Styles

`src/constants/categoryStyles.ts` maps API `category.type` strings to display styles:

```ts
import { getCategoryStyle } from "@/constants/categoryStyles";
const style = getCategoryStyle(dir?.category?.type ?? "");
// style.icon    — IconType (react-icons/fa6)
// style.bgColor — Tailwind class string ("bg-green-100")
// style.iconColor — hex string ("#16a34a")
```

**Important:** API typos `IDENTY` and `LEAGAL` are intentional — the backend sends these exact strings. Never "fix" them.

---

## Utilities

### document.utils.ts

```ts
import { getMimeIcon, formatFileSize } from "@/utils/document.utils";
getMimeIcon("application/pdf"); // → FaFilePdf (IconType)
formatFileSize(1048576); // → "1.0 MB"
```

### deviceInfo.utils.ts

Used only in `auth.ts` sign-in to attach device headers. Do not use elsewhere.

### env.ts

```ts
import { env } from "@/config/env";
env.apiUrl; // VITE_API_URL — throws if missing
```

Never access `import.meta.env` directly outside `src/config/env.ts`.

---

## TypeScript Rules

- `import type { ... }` for types that are not used at runtime.
- Explicit `interface XProps` for component props — never inline types in function signatures.
- `noUnusedLocals` and `noUnusedParameters` are enforced — remove unused imports immediately.
- Derive API types from generated schema: `type Document = GetDocumentsResponse['data'][number]`.
- Store interfaces split into data + actions: `interface AuthState extends AuthData, AuthActions`.

**Extending generated types for fields not yet in the spec:**
When the API returns fields that `npm run api:types` hasn't picked up yet, extend locally with an intersection type and a comment:

```ts
// Extend until `npm run api:types` picks up the updated spec.
export type Document = GetDocumentsResponse["data"][number] & {
  uploaded_via_link_id: string | null;
  uploaded_by: string | null;
};
```

Remove the extension (and the comment) after regenerating types.

**Document upload source fields:**

- `uploaded_via_link_id: string | null` — non-null means the document was uploaded via a public share link
- `uploaded_by: string | null` — the uploader's display name (not a user ID); null when uploaded by the vault owner themselves

---

## Skeleton Loading Pattern

Match the shape and approximate size of the real content:

```tsx
// Text line
<div className="h-3.5 w-40 bg-slate-100 rounded animate-pulse" />

// Badge / pill
<div className="h-5 w-20 bg-slate-100 rounded-full animate-pulse" />

// Icon square
<div className="w-8 h-8 rounded-lg bg-slate-100 animate-pulse" />

// Number (bold stat)
<div className="h-4 w-8 bg-slate-200 rounded animate-pulse" />
```

Always extract skeleton rows/items into a named component (e.g. `SkeletonRow`, `RecentDocumentSkeletonRow`) when used in lists.

---

## Session & Auth Flow

1. `App.tsx` calls `loadSession()` on mount → reads localStorage → sets `isLoading: false`.
2. Route guards check `isLoading` first (show spinner), then `session`.
3. Access token injected automatically by `apiClient` middleware.
4. On 401, middleware attempts token refresh via `/auth/refresh-token` (cookie sent automatically).
5. If refresh fails → `clearSession()` → user redirected to `/login` by guard.
6. Sign-out calls `/auth/signout` then `clearSession()`.

**Logout must clear the query cache.** All three logout paths (`useSignOut`, `useSignOutAll`, `useChangePassword`) must call `queryClient.clear()` before `clearSession()` — otherwise stale data from the previous session leaks into the next login:

```ts
onSuccess: (data) => {
  if (!data.success) return toast.error(...);
  queryClient.clear();   // ← required on every logout path
  clearSession();
},
```

---

## Adding New Features Checklist

**New API domain:**

1. Add endpoint functions in `src/api/endpoints/<domain>.ts`
2. Export types derived from generated schema
3. Add query keys in `src/api/queryKeys.ts`
4. Add hook(s) in `src/hooks/use<Domain>.ts`

**New page:**

1. `src/pages/<Page>/<Page>.tsx` + `index.ts`
2. Lazy-import in `src/router/index.tsx`
3. Add route under correct guard + layout

**New common component:**

1. `src/components/common/<Name>/<Name>.tsx`
2. Props interface at the top of the file
3. Export default at the bottom

**New form:**

1. Zod schema in `src/schemas/<domain>.ts`
2. Infer type: `export type FormData = z.infer<typeof Schema>`
3. Use `useForm({ resolver: zodResolver(Schema) })`
