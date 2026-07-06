# Vancouver Sai Centre

The website and organization platform for the Vancouver Sai Centre. It is a
full CMS: every public page, portal page, and section is managed from the
admin console by non-technical administrators. Nothing is hardcoded and the
system ships with no sample content; it starts empty and is populated
through the UI.

## What's inside

**Public site** — homepage (featured post carousel, who we are, upcoming
events, values, wings, Baba and SSSIO sections, month calendar, news, photo
albums, contacts, other BC centres), events with month / week / list views,
wings with coordinator-created subgroups, gallery backed by Google Photos,
library (physical book catalogue, Google Drive resource library, bhajan
book), livestream page, contact page.

**Member portal** (`/portal`) — dashboard, calendar, active registrations
(past events drop off automatically), volunteering, bhajan sign-ups,
notification interests, member resources.

**Admin console** (`/admin`) — analytics computed from real records, posts
(visual-first, placed anywhere on the site), events with check-in, form
builder, bhajan coordinator console, gallery publishing from Google Photos
links, Drive-backed resources, book catalogue, the Site content console
(every text on the site), coordination area (shared org calendar +
cross-wing access requests), notifications, and member/role management.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS 4 · Framer Motion ·
Supabase (Postgres, Auth, Storage, RLS) · Resend.

## Running locally

```bash
npm install
npm run dev
```

Without Supabase env vars the app uses a file-backed local database
(`.local-db.json`, gitignored) and signs you in as a built-in Web Team
administrator. Everything works: create events, posts, forms, books, and
albums from the admin console and they appear on the public site
immediately. Delete `.local-db.json` to reset. There is no sample content;
empty sections show admin-only setup prompts (the public sees nothing
unfinished).

## Going live

1. Create a Supabase project.
2. Apply migrations in order from `supabase/migrations/` (SQL editor or
   `supabase db push`): `0001_init.sql`, `0002_bhajan_management.sql`,
   `0003_production_cms.sql`.
3. Copy `.env.example` to `.env.local` and fill in the Supabase URL and anon
   key.
4. Add `RESEND_API_KEY` and a verified sending domain for emails.
5. In Supabase Auth settings, enable email confirmations and add your domain
   to the redirect allow-list (`/auth/callback`).
6. Sign up through `/signup`, then promote your account:
   `update profiles set role = 'administrator' where email = 'you@…';`

Authentication supports password sign-in, emailed magic links, sign-up with
email verification, and password reset. Sessions are persistent; members
stay signed in until they sign out.

### Roles

| Role | Access |
| --- | --- |
| Web Team (administrator) | everything, including roles and site settings |
| President | full content and operations access |
| Executive | all content, notifications, approvals |
| Wing Coordinator | content, events, posts, and resources in their own wing only |
| Volunteer / Member | portal |
| Visitor | public site |

Wing coordinators are assigned a wing in Members. They can request
visibility into another wing from the Coordination page; executives approve
or decline. Row Level Security enforces permissions in the database, not
just the UI.

### Content workflows

- **Posts** power the homepage carousel, announcements, wing pages, and the
  portal. Every post needs an image, video, or Instagram link.
- **Gallery**: paste a shared Google Photos album link, add a title,
  description, and cover, and publish.
- **Resources** live in Google Drive: paste the link and the site embeds
  Drive's preview.
- **Site content** console edits every remaining text: hero, intro,
  schedule, values, Baba and SSSIO sections, contacts, BC centres, parking,
  map, and the four wings (including coordinator-created subgroups).
