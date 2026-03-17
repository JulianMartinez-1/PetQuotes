# Sprint 6 Release Checklist (Frontend)

## Quality

- [x] `npm run lint --workspace apps/web`
- [x] `npm run build --workspace apps/web`
- [x] Global error boundary implemented (`app/error.tsx`)
- [x] Global loading UI implemented (`app/loading.tsx`)

## Accessibility

- [x] Skip link to main content
- [x] Visible focus state for keyboard navigation
- [x] Form controls with explicit labels in catalog filters
- [x] Buttons with loading/aria-busy in async transitions

## Performance and UX

- [x] Async navigation feedback in catalog detail entry
- [x] Loading states for route-level transitions
- [x] Protected routes validated via middleware policy
- [x] Build output checked for all current routes

## Operational Readiness

- [x] Session refresh and auth handlers working via route handlers
- [x] Role policy centralized (`lib/route-policy.ts`)
- [x] API proxy routes for protected backend calls
- [ ] Optional: run Lighthouse audit in browser for Core Web Vitals evidence
- [ ] Optional: add frontend tests for profile/activity/bookings workflows
