# MyPaperVault — Web

A secure document vault web application for storing, organizing, and sharing important personal documents with family members.

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React 19 + TypeScript 6 |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Server state | TanStack React Query v5 |
| Client state | Zustand v5 |
| Forms | react-hook-form v7 + Zod v4 |
| API client | openapi-fetch (typed from OpenAPI spec) |
| Toasts | sonner v2 |
| Icons | react-icons v5 |

## Getting Started

### Prerequisites

- Node.js 18+
- A running instance of the MyPaperVault backend API

### Installation

```bash
npm install
```

### Environment

Create a `.env.local` file in the project root:

```env
VITE_API_URL=/api/v1
VITE_APP_VERSION=0.0.0
```

For local development the Vite dev server proxies `/api` to the backend (configured in `vite.config.ts`).

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

### Regenerate API types

Whenever the backend OpenAPI spec changes, regenerate the TypeScript types:

```bash
npm run api:types
```

This runs `generate-api-types.cjs` and overwrites `src/api/types.ts`. Never edit that file manually.

## Project Structure

```
src/
├── api/                  # API client, endpoints, query keys, generated types
├── components/
│   ├── common/           # Reusable UI components (Button, TextInput, StatCard, DocumentItem, …)
│   └── layout/           # Page layout wrappers (AppLayout, DashboardLayout, Sidebar, Navbar)
├── config/               # Environment variable access (env.ts)
├── constants/            # Static mappings (categoryStyles.ts)
├── errors/               # AppError class, central error handler
├── hooks/                # Custom React hooks (useDocuments, useDirectories, useAuth, …)
├── lib/                  # Low-level wrappers (toast.ts)
├── pages/                # Page components, one folder per route
├── router/               # Route definitions, auth guards
├── schemas/              # Zod validation schemas
├── store/                # Zustand stores (authStore, toastStore, errorStore)
└── utils/                # Pure utility functions (document.utils, deviceInfo.utils)
```

## Key Features

- **Secure document storage** — upload and manage personal documents across categorised vaults
- **Family access** — share documents with family members and manage permissions
- **Family vaults** — dedicated shared spaces for household documents
- **Upload links** — generate secure, time-limited links for third-party uploads
- **MFA & encryption** — end-to-end security with multi-factor authentication
- **Subscription management** — plan details and renewal tracking

## Authentication

- Access tokens are stored in `localStorage` and injected automatically by the API client.
- Refresh tokens are stored as **httpOnly cookies** (set by the backend) — never accessible from JavaScript.
- On 401, the API client automatically attempts a silent token refresh before retrying the original request.
- All API requests include `credentials: "include"` so the refresh token cookie is sent automatically.

## Architecture Notes

- **Route guards:** `ProtectedRoute` redirects unauthenticated users to `/login`; `PublicOnlyRoute` redirects authenticated users to `/home`.
- **Error handling:** All API errors flow through `handleApiError` — components never handle raw errors.
- **Toasts:** Always import `toast` from `@/utils/toast`, never from sonner directly.
- **Icons:** Prefer `react-icons/md` (Material Design) for UI elements; use `react-icons/fa6` for file and category icons.
- **Dynamic icons:** Use `React.createElement(IconComponent, props)` instead of JSX when the icon is resolved at runtime to avoid the "Components created during render" error.

For full coding conventions and patterns see [CLAUDE.md](./CLAUDE.md).
