-- Production CMS: posts, wings, site content, books, access requests,
-- Google Photos albums, president role, wing-scoped coordinators.

-- ──────────────────────────────────────────────────────────────
-- Roles: add 'president'; profiles gain wing scoping
-- ──────────────────────────────────────────────────────────────
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('visitor','member','volunteer','wing-lead','executive','president','administrator'));

alter table public.profiles
  add column if not exists wing text
    check (wing in ('devotional','service','education','young-adults')),
  add column if not exists extra_wings text[] not null default '{}';

create or replace function public.is_staff()
returns boolean
language sql stable
as $$
  select public.current_member_role() in ('wing-lead','executive','president','administrator');
$$;

create or replace function public.is_executive()
returns boolean
language sql stable
as $$
  select public.current_member_role() in ('executive','president','administrator');
$$;

-- ──────────────────────────────────────────────────────────────
-- Posts (visual-first: image, video, or Instagram required)
-- ──────────────────────────────────────────────────────────────
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  body text not null default '',
  image_url text,
  video_url text,
  instagram_url text,
  cta_label text,
  cta_url text,
  placements text[] not null default '{}',
  members_only boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  constraint posts_visual_required
    check (image_url is not null or video_url is not null or instagram_url is not null)
);

alter table public.posts enable row level security;
create policy "posts_public_read" on public.posts
  for select using (
    (published and not members_only)
    or (published and auth.uid() is not null)
    or public.is_staff()
  );
create policy "posts_staff_write" on public.posts
  for all using (public.is_staff());

-- ──────────────────────────────────────────────────────────────
-- Wings (editable structure, images, coordinator-created subgroups)
-- ──────────────────────────────────────────────────────────────
create table public.wings (
  slug text primary key,
  name text not null,
  tagline text not null default '',
  description text not null default '',
  activities text[] not null default '{}',
  image_url text,
  subgroups jsonb not null default '[]',
  position integer not null default 0
);

alter table public.wings enable row level security;
create policy "wings_read" on public.wings for select using (true);
create policy "wings_staff_write" on public.wings for all using (public.is_staff());

insert into public.wings (slug, name, tagline, description, position) values
  ('devotional', 'Devotional Wing', 'Bhajans and festivals',
   'The devotional wing organizes Sunday bhajans, festival celebrations, and devotional programs through the year.', 0),
  ('education', 'Education Wing', 'Classes for children and adults',
   'The education wing runs SSE (Sai Spiritual Education) classes for children, the adult study circle, readings, and educational programs.', 1),
  ('service', 'Service Wing', 'Helping around Vancouver',
   'The service wing organizes service projects and volunteer activities in the community.', 2),
  ('young-adults', 'Young Adults', 'Ages 18 to 35',
   'The young adults wing runs YA activities, events, and service projects for members aged 18 to 35.', 3)
on conflict (slug) do nothing;

-- ──────────────────────────────────────────────────────────────
-- Site content (single JSON document, edited from the admin console)
-- ──────────────────────────────────────────────────────────────
create table public.site_content (
  id text primary key,
  content jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;
create policy "site_content_read" on public.site_content for select using (true);
create policy "site_content_exec_write" on public.site_content
  for all using (public.is_executive());

-- ──────────────────────────────────────────────────────────────
-- Physical library books
-- ──────────────────────────────────────────────────────────────
create table public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null default '',
  category text not null default '',
  description text not null default '',
  available boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.books enable row level security;
create policy "books_read" on public.books for select using (true);
create policy "books_staff_write" on public.books for all using (public.is_staff());

-- ──────────────────────────────────────────────────────────────
-- Cross-wing access requests
-- ──────────────────────────────────────────────────────────────
create table public.access_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  wing text not null check (wing in ('devotional','service','education','young-adults')),
  status text not null default 'pending' check (status in ('pending','approved','denied')),
  created_at timestamptz not null default now()
);

alter table public.access_requests enable row level security;
create policy "access_requests_staff_read" on public.access_requests
  for select using (public.is_staff());
create policy "access_requests_insert_own" on public.access_requests
  for insert with check (requester_id = auth.uid() and public.is_staff());
create policy "access_requests_exec_update" on public.access_requests
  for update using (public.is_executive());

-- ──────────────────────────────────────────────────────────────
-- Gallery: Google Photos albums
-- ──────────────────────────────────────────────────────────────
alter table public.albums
  add column if not exists google_photos_url text;
