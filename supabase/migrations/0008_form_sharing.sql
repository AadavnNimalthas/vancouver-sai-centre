-- Create an is_admin function for top-level access (executive, president, administrator)
create or replace function public.is_admin()
returns boolean as $$
declare
  r text;
begin
  select role into r from public.profiles where id = auth.uid();
  return r in ('executive', 'president', 'administrator');
end;
$$ language plpgsql security definer;

-- Add tracking to forms
alter table public.forms
  add column if not exists created_by uuid references public.profiles(id) on delete set null,
  add column if not exists wing text;

-- Add tracking to bhajan_signup_forms
alter table public.bhajan_signup_forms
  add column if not exists created_by uuid references public.profiles(id) on delete set null,
  add column if not exists wing text default 'devotional';

-- Create form_shares table
create table public.form_shares (
  id uuid primary key default gen_random_uuid(),
  general_form_id uuid references public.forms(id) on delete cascade,
  bhajan_form_id uuid references public.bhajan_signup_forms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  shared_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  check (
    (general_form_id is not null and bhajan_form_id is null) or
    (general_form_id is null and bhajan_form_id is not null)
  ),
  unique (general_form_id, user_id),
  unique (bhajan_form_id, user_id)
);

alter table public.form_shares enable row level security;

-- Share visibility: Users can see shares directed to them, staff can see all shares
create policy "form_shares_select" on public.form_shares
  for select using (user_id = auth.uid() or public.is_staff());

create policy "form_shares_insert" on public.form_shares
  for insert with check (public.is_staff());

create policy "form_shares_delete" on public.form_shares
  for delete using (public.is_staff());

-- Update bhajan_submissions RLS to allow shared users to view them
drop policy if exists "submissions_select_staff" on public.bhajan_submissions;
create policy "submissions_select_staff_or_shared" on public.bhajan_submissions
  for select using (
    public.is_staff() or
    exists (
      select 1 from public.form_shares fs 
      where fs.bhajan_form_id = form_id and fs.user_id = auth.uid()
    )
  );

-- Update form_responses RLS to allow shared users to view them
drop policy if exists "form_responses_select_own" on public.form_responses;
create policy "form_responses_select_own_or_shared" on public.form_responses
  for select using (
    user_id = auth.uid() or 
    public.is_staff() or
    exists (
      select 1 from public.form_shares fs 
      where fs.general_form_id = form_id and fs.user_id = auth.uid()
    )
  );

-- Note: We are keeping the existing staff write policies for forms and bhajan_signup_forms for now,
-- but the application layer will enforce that coordinators only modify their own forms.
-- The RLS above allows users to VIEW submissions for forms shared with them.
