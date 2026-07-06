-- ──────────────────────────────────────────────────────────────
-- Responses to stand-alone published forms (form builder forms
-- opened from the member portal, not attached to an event).
-- ──────────────────────────────────────────────────────────────

create table public.form_responses (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  user_name text not null default '',
  user_email text not null default '',
  answers jsonb not null default '{}',
  created_at timestamptz not null default now(),
  -- one response per member per form; resubmitting updates it
  unique (form_id, user_id)
);

create index form_responses_form_idx on public.form_responses (form_id, created_at desc);

alter table public.form_responses enable row level security;

-- Signed-in members submit as themselves; they can read and update
-- their own response. Staff see and manage everything.
create policy "form_responses_insert_own" on public.form_responses
  for insert with check (auth.uid() is not null and user_id = auth.uid());
create policy "form_responses_select_own" on public.form_responses
  for select using (user_id = auth.uid() or public.is_staff());
create policy "form_responses_update_own" on public.form_responses
  for update using (user_id = auth.uid() or public.is_staff());
create policy "form_responses_staff_delete" on public.form_responses
  for delete using (public.is_staff());
