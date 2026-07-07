-- Allow anonymous users to suggest/insert bhajans
drop policy if exists "bhajans_insert_authenticated" on public.bhajans;

create policy "bhajans_insert_anyone" on public.bhajans
  for insert with check (true);
