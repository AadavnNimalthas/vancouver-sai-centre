-- Add new columns to bhajans table
alter table public.bhajans 
  add column beat_taal text not null default '',
  add column source_link text,
  add column status text not null default 'approved' check (status in ('pending', 'approved', 'rejected', 'archived')),
  add column created_by uuid references public.profiles(id) on delete set null,
  add column additional_metadata jsonb not null default '{}'::jsonb;

-- Adjust default status for newly created bhajans to be 'pending'
alter table public.bhajans alter column status set default 'pending';

-- Create bhajan signup forms table
create table public.bhajan_signup_forms (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  open_date timestamptz not null,
  close_date timestamptz not null,
  bhajans_required integer not null default 1 check (bhajans_required > 0),
  allowed_categories text[] not null default '{}',
  published boolean not null default false,
  created_at timestamptz not null default now()
);

-- Create bhajan submissions table
create table public.bhajan_submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.bhajan_signup_forms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  bhajan_ids uuid[] not null check (cardinality(bhajan_ids) > 0),
  created_at timestamptz not null default now(),
  constraint bhajan_submissions_unique_user unique (form_id, user_id)
);

-- Create member bhajan favorites table
create table public.member_bhajan_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  bhajan_id uuid not null references public.bhajans(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint member_bhajan_favorites_unique unique (user_id, bhajan_id)
);

-- Enable RLS on new tables
alter table public.bhajan_signup_forms enable row level security;
alter table public.bhajan_submissions enable row level security;
alter table public.member_bhajan_favorites enable row level security;

-- RLS Policies for public.bhajans (replacing old ones or adding to them)
drop policy if exists "bhajans_select" on public.bhajans;
drop policy if exists "bhajans_all_staff" on public.bhajans;

create policy "bhajans_select_approved" on public.bhajans
  for select using (status = 'approved');

create policy "bhajans_select_own_pending" on public.bhajans
  for select using (auth.uid() = created_by);

create policy "bhajans_select_staff" on public.bhajans
  for select using (public.is_staff());

create policy "bhajans_insert_authenticated" on public.bhajans
  for insert with check (auth.uid() is not null);

create policy "bhajans_write_staff" on public.bhajans
  for all using (public.is_staff());

-- RLS Policies for public.bhajan_signup_forms
create policy "forms_select_published" on public.bhajan_signup_forms
  for select using (published = true);

create policy "forms_select_staff" on public.bhajan_signup_forms
  for select using (public.is_staff());

create policy "forms_write_staff" on public.bhajan_signup_forms
  for all using (public.is_staff());

-- RLS Policies for public.bhajan_submissions
create policy "submissions_select_own" on public.bhajan_submissions
  for select using (auth.uid() = user_id);

create policy "submissions_select_staff" on public.bhajan_submissions
  for select using (public.is_staff());

create policy "submissions_insert_own" on public.bhajan_submissions
  for insert with check (auth.uid() = user_id);

create policy "submissions_update_own" on public.bhajan_submissions
  for update using (auth.uid() = user_id);

create policy "submissions_delete_own" on public.bhajan_submissions
  for delete using (auth.uid() = user_id);

create policy "submissions_all_staff" on public.bhajan_submissions
  for all using (public.is_staff());

-- RLS Policies for public.member_bhajan_favorites
create policy "favorites_all_own" on public.member_bhajan_favorites
  for all using (auth.uid() = user_id);
