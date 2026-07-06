-- Update existing profile if it already exists
update public.profiles 
set role = 'administrator' 
where email = 'aadavn.sai@gmail.com';

-- Update trigger function for future user signups to automatically assign the administrator role
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  default_role text := 'member';
begin
  if new.email = 'aadavn.sai@gmail.com' then
    default_role := 'administrator';
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id, 
    coalesce(new.email, ''), 
    coalesce(new.raw_user_meta_data->>'full_name', ''), 
    default_role
  );
  return new;
end;
$$;
