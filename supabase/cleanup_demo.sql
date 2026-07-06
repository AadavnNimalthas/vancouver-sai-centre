-- OPTIONAL: removes rows that came from the old demo seed
-- (events at the Albert St address, sample bhajans, sample resources,
-- sample announcements). Review before running; this deletes data.
--
-- Run AFTER 0003_production_cms.sql, in the Supabase SQL editor.

delete from public.registrations
where event_id in (select id from public.events where location like '%Albert St%');

delete from public.events where location like '%Albert St%';

-- Old sample events regardless of address (uncomment to remove everything
-- and start the calendar completely fresh):
-- delete from public.registrations;
-- delete from public.events;

delete from public.announcements where title in (
  'Guru Purnima — registration now open',
  'Guru Purnima registration is open'
);

delete from public.resources where url = '#';

-- Sample bhajans from the old seed (only ones with no creator):
-- delete from public.bhajans where created_by is null;
