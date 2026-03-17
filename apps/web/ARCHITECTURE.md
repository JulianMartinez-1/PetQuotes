# Frontend Sprint 1 Architecture

## Folder Layout

- `app/`: routing, pages, global layout and styles
- `components/layout/`: app shell and navigation structure
- `components/ui/`: reusable UI primitives (Button, Input, Card, Modal)
- `components/sections/`: page-specific sections
- `components/query-provider.tsx`: React Query provider
- `store/`: global state providers and hooks
- `lib/`: shared utilities and API client/domain calls

## Design System

- Tokens in `app/globals.css`
- Tailwind aliases in `tailwind.config.ts`
- Reusable primitives in `components/ui/`

## State and Data

- Global UI state in `store/app-state.tsx`
- Server interaction via `lib/api-client.ts`
- Domain endpoints in `lib/api.ts`

## Sprint 1 Done Criteria

- App runs with shared shell and base navigation
- Reusable UI primitives available
- Design tokens centralized
- Global state provider wired at root
- API client abstraction available for future modules
