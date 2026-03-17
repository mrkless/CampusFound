-- 1. Create Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text unique,
  phone text,
  bio text,
  instagram text,
  telegram text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Items table
create table public.items (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  category text,
  status text check (status in ('lost', 'found')),
  location text,
  lost_found_date date,
  image_url text,
  user_id uuid references public.profiles(id) on delete cascade not null,
  resolved boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Set up Storage
-- Manual step: Create a bucket named 'item-images' with public access in Supabase Dashboard

-- 4. Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.items enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Items Policies
create policy "Items are viewable by everyone." on public.items
  for select using (true);

create policy "Authenticated users can insert items." on public.items
  for insert with check (auth.role() = 'authenticated');

create policy "Users can update own items." on public.items
  for update using (auth.uid() = user_id);

create policy "Users can delete own items." on public.items
  for delete using (auth.uid() = user_id);

-- 5. Trigger for creating profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, new.raw_user_meta_data->>'name', new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
