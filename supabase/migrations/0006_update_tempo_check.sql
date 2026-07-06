-- Drop the old constraint that only allowed 'slow', 'medium', 'fast'
alter table public.bhajans drop constraint if exists bhajans_tempo_check;

-- Add the new updated check constraint to support the new tempo options
alter table public.bhajans add constraint bhajans_tempo_check check (
  tempo in ('melodic', 'slow', 'medium', 'fast', 'very_fast')
);
