-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 1. Create PROFILES table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  role text check (role in ('candidate', 'recruiter')) not null,
  first_name text,
  last_name text,
  resume_path text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 2. Create JOBS table
create table if not exists public.jobs (
  id uuid default uuid_generate_v4() primary key,
  recruiter_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on jobs
alter table public.jobs enable row level security;

create policy "Jobs are viewable by everyone."
  on jobs for select
  using ( true );

create policy "Recruiters can insert jobs"
  on jobs for insert
  with check (
    auth.uid() = recruiter_id and
    exists (select 1 from profiles where id = auth.uid() and role = 'recruiter')
  );

create policy "Recruiters can update own jobs"
  on jobs for update
  using ( auth.uid() = recruiter_id );

create policy "Recruiters can delete own jobs"
  on jobs for delete
  using ( auth.uid() = recruiter_id );

-- 3. Create APPLICATIONS table (Matches and Applications)
create table if not exists public.applications (
  id uuid default uuid_generate_v4() primary key,
  job_id uuid references public.jobs(id) on delete cascade not null,
  candidate_id uuid references public.profiles(id) on delete cascade not null,
  match_score integer not null,
  missing_keywords jsonb not null default '[]'::jsonb,
  action_plan text not null,
  status text check (status in ('calculated', 'applied')) not null default 'calculated',
  is_new boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (job_id, candidate_id) -- one application/match per job per candidate
);

-- Enable RLS on applications
alter table public.applications enable row level security;

-- Candidates can see their own applications, recruiters can see applications for their jobs
create policy "Candidates can view own applications"
  on applications for select
  using ( auth.uid() = candidate_id );

create policy "Recruiters can view applications for their jobs"
  on applications for select
  using (
    exists (
      select 1 from jobs where id = applications.job_id and recruiter_id = auth.uid()
    )
  );

-- Candidates can insert their own applications
create policy "Candidates can insert applications"
  on applications for insert
  with check (
    auth.uid() = candidate_id and
    exists (select 1 from profiles where id = auth.uid() and role = 'candidate')
  );

-- Candidates can update their own applications (e.g. from 'calculated' to 'applied')
-- Recruiters can update applications for their jobs (e.g. mark as read `is_new = false`)
create policy "Candidates can update own applications"
  on applications for update
  using ( auth.uid() = candidate_id );

create policy "Recruiters can update applications for their jobs"
  on applications for update
  using (
    exists (
      select 1 from jobs where id = applications.job_id and recruiter_id = auth.uid()
    )
  );

-- Create a trigger to automatically insert a profile row when a new user signs up (Optional, but good practice if not handled in code)
-- Actually, since we want the user to provide role/name during signup or via a UI form, we will handle `profiles` insertion via our application code or Supabase auth triggers.
-- Here we'll just rely on application code inserting/updating the profile.

-- Function to handle user creation and set a default profile if needed (Optional)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- We don't know the role yet unless passed in user_metadata, so we'll leave it out or let app handle it.
  -- But to avoid foreign key issues, let's just let the app insert the profile.
  return new;
end;
$$ language plpgsql security definer;
