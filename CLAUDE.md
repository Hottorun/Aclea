# CLAUDE.md — Aclea / Leed Optimizer

## Project Overview

Aclea is a lead qualification and management SaaS platform. Businesses receive leads from channels like WhatsApp and email, qualify them with AI-powered rating, and auto-approve or decline them based on configurable rules. Approved/declined responses are sent back to a chatbot via webhook.

## Tech Stack

- **Framework:** Next.js (App Router) with React 18, TypeScript
- **Styling:** Tailwind CSS v4, shadcn/ui (Radix UI primitives), Lucide icons, Framer Motion
- **Backend:** Supabase (PostgreSQL), bcryptjs for password hashing
- **Data fetching:** SWR (30s polling interval for leads; also used for `/api/auth` user data)
- **Forms:** React Hook Form + Zod
- **Email:** Resend API
- **Charts:** Recharts
- **PDF:** html2canvas + pdfmake
- **i18n:** Custom translations in `/lib/translations.ts` — default language is German (`de`)

## Project Structure

```
/app              # Next.js App Router pages & API routes
  /api            # Route handlers: /auth, /leads, /settings, /users, /teams, /appointments, /calendar, /cron
  /dashboard      # Main dashboard
  /leads          # Lead management UI
  /login          # Auth page
  /settings       # Settings pages (profile, password, privacy, etc.)
  /messages       # Messaging page
  /privacy        # Privacy policy (legal)
  /terms          # Terms & conditions (legal)
  /imprint        # Imprint / Impressum (legal)
  /about          # About page
  /solution       # Solution page
  /contact        # Contact page
/components       # React components
  /ui             # shadcn/ui primitives (60+ files, do not modify directly)
  aclea-logo.tsx  # AcleaLogo component — the canonical brand logo (2-box mark + wordmark)
  app-header.tsx  # Sticky header with logo, nav, notifications, user menu
  landing-page.tsx# Full landing page component
/lib              # Core business logic
  supabase.ts     # Supabase client + all DB queries (large file, ~36KB)
  auth.ts         # Auth helpers, getCurrentUser()
  types.ts        # All TypeScript interfaces (Lead, Team, Settings, etc.)
  lead-utils.ts   # Lead-specific utilities
  translations.ts # i18n strings (de/en)
  use-user.ts     # useUser() hook — fetches /api/auth via SWR
/hooks            # Custom React hooks
/scripts          # SQL schema + seed scripts
/public           # Static assets (icon.svg = 2-box favicon)
```

## Key Files

| File | Purpose |
|------|---------|
| `lib/types.ts` | All shared TypeScript types — check here before defining new ones |
| `lib/supabase.ts` | All database operations — keep DB logic centralized here |
| `lib/auth.ts` | Auth helpers; use `getCurrentUser()` for server-side auth checks |
| `lib/translations.ts` | All UI strings — add new strings here, don't hardcode German/English in components |
| `lib/use-user.ts` | `useUser()` SWR hook — call `mutate('/api/auth')` after profile changes |
| `components/aclea-logo.tsx` | Brand logo component — use this everywhere, never recreate ad-hoc logos |
| `scripts/supabase-schema.sql` | Database schema reference |

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SECRET_KEY
RESEND_API_KEY
RESEND_FROM_EMAIL          # e.g. "Aclea <noreply@aclea.de>"
NEXT_PUBLIC_APP_URL        # e.g. http://localhost:3000
CHATBOT_WEBHOOK_URL        # Webhook for sending approval/decline back to chatbot
```

## Dev Commands

```bash
pnpm install
pnpm dev        # Start dev server
pnpm build      # Production build
pnpm lint       # ESLint
```

## Architecture & Patterns

### Authentication
- Cookie-based JWT (`auth_token` cookie stores the full user object as JSON)
- **Important:** `GET /api/auth` reads the name from the cookie — it does NOT re-query the DB for the name. After a profile name update, the `PATCH /api/settings/profile` handler must also update the cookie so the name stays in sync.
- Team-based multi-tenancy: users belong to teams with roles (`owner` / `admin` / `member`)

### User Data / useUser()
- `lib/use-user.ts` uses SWR with key `/api/auth` — shared global cache
- After any profile change that affects the displayed name, call `mutate('/api/auth')` to revalidate all consumers (header, dashboard greeting, etc.)
- The profile PATCH API also writes the updated name back into the `auth_token` cookie

### Lead Workflow
1. Lead arrives via `POST /api/leads` (from chatbot/webhook)
2. System rates/qualifies the lead
3. User approves or declines (with optional custom message)
4. Response posted back to `CHATBOT_WEBHOOK_URL`

### Data Fetching
- SWR with 30s refresh interval for leads list
- SWR for `/api/auth` (user data) — revalidate with `mutate('/api/auth')` after profile edits
- All Supabase queries go through `/lib/supabase.ts`

### UI Conventions
- Components use `"use client"` where needed; prefer server components otherwise
- shadcn/ui primitives live in `/components/ui` — use them, don't rewrite
- Dark mode via `next-themes`
- Responsive layouts with grid/list view toggle
- Notifications via `sonner` toast

### Database
- Tables: `leads`, `lead_sessions`, `messages`, `teams`, `users`, `team_members`, `settings`
- Supabase RLS enabled
- Use RPC functions for complex queries (e.g. `get_user_by_email`)

### Path Aliases
`@/*` maps to the project root (configured in `tsconfig.json`).

## Branding & Design System

### Logo
- **Component:** `<AcleaLogo />` in `components/aclea-logo.tsx` — always use this, never recreate ad-hoc logos
- **Mark:** Two squares — top-left outlined, bottom-right solid accent (`#5c3fff`)
- **Wordmark:** "aclea" in Space Grotesk, weight 700
- **Favicon:** `public/icon.svg` — same 2-box design on a rounded-rect background
- Standard sizes: `markSize={24} fontSize={20} gap={9}` (landing/legal nav), `markSize={22} fontSize={20} gap={8}` (app header)
- On dark backgrounds pass `fg="#f5f4f0"`; on light backgrounds omit `fg` (defaults to `currentColor`)

### Colors
- Dark text: `#0B0B16`
- Secondary text: `#6B728C`
- Muted text: `#9AA0B5`
- Accent (logo, links, icons): `#5c3fff`
- Backgrounds: white (`#ffffff`) for public pages; theme-aware for app pages

### Public Pages (landing, legal, about, solution, contact)
- White background, light frosted-glass nav pill: `bg-white/60 backdrop-blur-xl border border-white/70 rounded-2xl`
- No emerald green — replaced with `#5c3fff` accent
- Footer: `border-t border-gray-100 bg-white`

### App Pages (dashboard, leads, settings, etc.)
- Theme-aware via `ThemeBackground` and CSS variables
- Header: `AppHeader` component — sticky, includes logo, nav links, notifications, user menu

### Fonts
- Body: DM Sans (`--font-dm-sans`)
- Display/logo: Space Grotesk (`--font-space-grotesk`)

## Known Gotchas

- **Logo spinner bug (fixed):** `AppHeader` logo click only sets `isLoading` when navigating away from the current page. Clicking the logo while already on `/dashboard` used to leave the spinner stuck because `pathname` never changed.
- **Profile name sync:** The `auth_token` cookie must be updated in `PATCH /api/settings/profile` whenever the name changes, otherwise `GET /api/auth` returns the stale name from the cookie.
- **Legal pages** (`/privacy`, `/terms`, `/imprint`) use the light public-page design system, not the dark legacy design.
