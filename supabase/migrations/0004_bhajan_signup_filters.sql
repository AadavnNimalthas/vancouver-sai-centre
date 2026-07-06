-- Bhajan sign-up sheets: coordinators can limit picks by tempo and
-- beat/taal, in addition to the existing category limit.
-- Empty arrays mean "no limit".

alter table public.bhajan_signup_forms
  add column if not exists allowed_tempos text[] not null default '{}',
  add column if not exists allowed_beats text[] not null default '{}';
