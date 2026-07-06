-- Vancouver Sai Centre — initial schema
-- Run with: supabase db push   (or paste into the Supabase SQL editor)

create extension if not exists "pgcrypto";

-- ──────────────────────────────────────────────────────────────
-- Profiles (one per auth user)
-- ──────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  role text not null default 'member'
    check (role in ('visitor','member','volunteer','wing-lead','executive','administrator')),
  interests text[] not null default '{}',
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Create a profile automatically when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Role helper used by RLS policies (security definer avoids recursive RLS)
create or replace function public.current_member_role()
returns text
language sql security definer stable set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'visitor');
$$;

create or replace function public.is_staff()
returns boolean
language sql stable
as $$
  select public.current_member_role() in ('wing-lead','executive','administrator');
$$;

-- ──────────────────────────────────────────────────────────────
-- Forms (admin-built, attached to events)
-- ──────────────────────────────────────────────────────────────
create table public.forms (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  fields jsonb not null default '[]',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────────
-- Events
-- ──────────────────────────────────────────────────────────────
create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  banner_url text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text not null default '',
  capacity integer,
  registration_enabled boolean not null default false,
  volunteer_signup_enabled boolean not null default false,
  livestream_url text,
  category text not null default 'devotional'
    check (category in ('devotional','service','education','sse','young-adults','special','retreat')),
  recurrence text not null default 'none'
    check (recurrence in ('none','weekly','biweekly','monthly')),
  recurrence_until date,
  form_id uuid references public.forms (id) on delete set null,
  registered_count integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────────
-- Registrations (attendees + volunteers, members + guests)
-- ──────────────────────────────────────────────────────────────
create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  guest_email text,
  guest_name text,
  kind text not null default 'attendee' check (kind in ('attendee','volunteer')),
  status text not null default 'registered'
    check (status in ('registered','waitlisted','checked-in','cancelled')),
  answers jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create unique index registrations_unique_member
  on public.registrations (event_id, user_id, kind)
  where user_id is not null and status <> 'cancelled';

-- Keep events.registered_count in sync (attendees, not cancelled/waitlisted)
create or replace function public.sync_registered_count()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  target uuid := coalesce(new.event_id, old.event_id);
begin
  update public.events e
  set registered_count = (
    select count(*) from public.registrations r
    where r.event_id = target
      and r.kind = 'attendee'
      and r.status in ('registered','checked-in')
  )
  where e.id = target;
  return coalesce(new, old);
end;
$$;

create trigger registrations_count
  after insert or update or delete on public.registrations
  for each row execute function public.sync_registered_count();

-- ──────────────────────────────────────────────────────────────
-- Library: resources & bhajans
-- ──────────────────────────────────────────────────────────────
create table public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  kind text not null default 'pdf'
    check (kind in ('pdf','video','audio','bhajan','study','discourse')),
  url text not null default '#',
  tags text[] not null default '{}',
  members_only boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.bhajans (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  meaning text not null default '',
  language text not null default 'Sanskrit',
  tempo text not null default 'medium' check (tempo in ('slow','medium','fast')),
  category text not null default '',
  notes text not null default '',
  lyrics text not null default '',
  audio_url text,
  video_url text,
  created_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────────
-- Gallery
-- ──────────────────────────────────────────────────────────────
create table public.albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  event_id uuid references public.events (id) on delete set null,
  cover_url text not null default '',
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums (id) on delete cascade,
  url text not null,
  caption text not null default '',
  width integer not null default 1200,
  height integer not null default 800,
  created_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────────
-- Announcements & contact messages
-- ──────────────────────────────────────────────────────────────
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  topics text[] not null default '{}',
  sent_at timestamptz,
  recipients integer not null default 0,
  open_rate real,
  created_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null default '',
  message text not null,
  created_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────────
-- Row Level Security
-- ──────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.forms enable row level security;
alter table public.events enable row level security;
alter table public.registrations enable row level security;
alter table public.resources enable row level security;
alter table public.bhajans enable row level security;
alter table public.albums enable row level security;
alter table public.photos enable row level security;
alter table public.announcements enable row level security;
alter table public.contact_messages enable row level security;

-- Profiles: read own; staff read all; update own (but not own role);
-- administrators update anyone.
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid() or public.is_staff());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));
create policy "profiles_admin_update" on public.profiles
  for update using (public.current_member_role() = 'administrator');

-- Events: anyone reads published; staff full access.
create policy "events_public_read" on public.events
  for select using (published or public.is_staff());
create policy "events_staff_write" on public.events
  for all using (public.is_staff());

-- Forms: anyone reads published (needed to render registration forms); staff full.
create policy "forms_public_read" on public.forms
  for select using (published or public.is_staff());
create policy "forms_staff_write" on public.forms
  for all using (public.is_staff());

-- Registrations: signed-in users insert their own; guests insert with email;
-- users see & cancel their own; staff manage all.
create policy "registrations_insert" on public.registrations
  for insert with check (
    (auth.uid() is not null and user_id = auth.uid())
    or (auth.uid() is null and user_id is null and guest_email is not null)
  );
create policy "registrations_select_own" on public.registrations
  for select using (user_id = auth.uid() or public.is_staff());
create policy "registrations_update_own" on public.registrations
  for update using (user_id = auth.uid() or public.is_staff());

-- Resources: public ones readable by all; members-only requires sign-in; staff write.
create policy "resources_read" on public.resources
  for select using ((not members_only) or auth.uid() is not null);
create policy "resources_staff_write" on public.resources
  for all using (public.is_staff());

-- Bhajans, albums, photos: public read; staff write.
create policy "bhajans_read" on public.bhajans for select using (true);
create policy "bhajans_staff_write" on public.bhajans for all using (public.is_staff());
create policy "albums_read" on public.albums for select using (true);
create policy "albums_staff_write" on public.albums for all using (public.is_staff());
create policy "photos_read" on public.photos for select using (true);
create policy "photos_staff_write" on public.photos for all using (public.is_staff());

-- Announcements: sent ones are public (homepage); executives+ manage.
create policy "announcements_read" on public.announcements
  for select using (sent_at is not null or public.is_staff());
create policy "announcements_exec_write" on public.announcements
  for all using (public.current_member_role() in ('executive','administrator'));

-- Contact messages: anyone can write; staff read.
create policy "contact_insert" on public.contact_messages
  for insert with check (true);
create policy "contact_staff_read" on public.contact_messages
  for select using (public.is_staff());

-- ──────────────────────────────────────────────────────────────
-- Storage buckets (banners, gallery photos, resources)
-- ──────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public) values
  ('banners', 'banners', true),
  ('gallery', 'gallery', true),
  ('resources', 'resources', false)
on conflict (id) do nothing;

create policy "storage_public_read" on storage.objects
  for select using (bucket_id in ('banners','gallery'));
create policy "storage_resources_member_read" on storage.objects
  for select using (bucket_id = 'resources' and auth.uid() is not null);
create policy "storage_staff_write" on storage.objects
  for insert with check (public.is_staff());
create policy "storage_staff_update" on storage.objects
  for update using (public.is_staff());
create policy "storage_staff_delete" on storage.objects
  for delete using (public.is_staff());
