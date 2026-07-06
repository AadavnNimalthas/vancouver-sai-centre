# Vancouver Sai Centre

A website and member platform for the Vancouver Sai Centre — devotion,
education, and selfless service, with the operational tools a volunteer-run
organization needs.

## What's inside

**Public site** — Home, Events (with recurring events & categories), Wings,
Library (searchable resources + a dedicated Bhajan library with lyrics,
meanings, language/tempo/category search), photo Gallery (albums, masonry,
lightbox), Watch Live, Contact.

**Member portal** (`/portal`) — dashboard, calendar (month / week / list with
category filters), event registrations with waitlists, volunteer signups,
notification interests, member-only resources.

**Admin console** (`/admin`, role-gated) — event manager with check-in and
attendance stats, drag-and-drop form builder (replaces external form tools),
topic-targeted notifications via Resend, analytics dashboard, member role
management, resource manager.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS 4 · Framer Motion ·
Supabase (Postgres, Auth, Storage, RLS) · Resend.

## Running it

```bash
npm install
npm run dev
```

With no environment variables the site runs in **demo mode**: every page is
browsable with seeded content, the portal is open as a sample administrator,
and writes succeed without persisting. This is intentional so the whole
experience can be reviewed before any infrastructure exists.

## Going live

1. Create a Supabase project.
2. Apply the schema: paste `supabase/migrations/0001_init.sql` into the SQL
   editor (or `supabase db push`), then optionally `supabase/seed.sql`.
3. Copy `.env.example` to `.env.local` and fill in the Supabase URL + anon key.
4. Add a `RESEND_API_KEY` (and verified sending domain) for confirmation
   emails and announcements.
5. In Supabase Auth settings, add your domain to the redirect allow-list
   (`/auth/callback`). Sign-in is passwordless (email magic links).
6. Promote your first administrator:
   `update profiles set role = 'administrator' where email = 'you@…';`

### Roles

`visitor → member → volunteer → wing-lead → executive → administrator`

- **wing-lead+** — admin console: events, forms, resources, check-in
- **executive+** — send notifications, delete events
- **administrator** — change member roles

Row Level Security enforces all of this in the database, not just the UI.

### Storage

Three buckets are created by the migration: `banners` and `gallery` (public),
`resources` (members only). Upload files in the Supabase dashboard or wire the
admin UI to `supabase.storage` uploads.

## Design notes

Palette: cream `#FBF9F6` / sand `#F4EFE8` / terracotta `#E67E52` / gold
`#C8A25A` / ink `#2B2B2B`. Type: Cormorant Garamond (display) + Inter (body).
Signature elements: the breathing *jyoti* glow in the hero, and the five-bead
*mala* divider — one bead per human value. Motion is limited to gentle
fade/rise reveals and respects `prefers-reduced-motion`.
