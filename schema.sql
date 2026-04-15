-- Unified schema for MatchMaker
-- Este archivo consolida todos los cambios de schema-v2.sql y schema-v3.sql.

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

alter table public.profiles enable row level security;

create policy if not exists "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy if not exists "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy if not exists "Users can update own profile."
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

alter table public.jobs enable row level security;

create policy if not exists "Jobs are viewable by everyone."
  on jobs for select
  using ( true );

create policy if not exists "Recruiters can insert jobs"
  on jobs for insert
  with check (
    auth.uid() = recruiter_id and
    exists (select 1 from profiles where id = auth.uid() and role = 'recruiter')
  );

create policy if not exists "Recruiters can update own jobs"
  on jobs for update
  using ( auth.uid() = recruiter_id );

create policy if not exists "Recruiters can delete own jobs"
  on jobs for delete
  using ( auth.uid() = recruiter_id );

-- 3. Create RESUMES table
create table if not exists public.resumes (
  id uuid default uuid_generate_v4() primary key,
  candidate_id uuid references public.profiles(id) on delete cascade not null,
  file_name text not null,
  file_path text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.resumes enable row level security;

create policy if not exists "Candidates can view own resumes"
  on resumes for select
  using ( auth.uid() = candidate_id );

create policy if not exists "Candidates can insert own resumes"
  on resumes for insert
  with check ( auth.uid() = candidate_id );

create policy if not exists "Candidates can delete own resumes"
  on resumes for delete
  using ( auth.uid() = candidate_id );

-- 4. Create APPLICATIONS table (Matches and Applications)
create table if not exists public.applications (
  id uuid default uuid_generate_v4() primary key,
  job_id uuid references public.jobs(id) on delete cascade not null,
  candidate_id uuid references public.profiles(id) on delete cascade not null,
  match_score integer not null,
  missing_keywords jsonb not null default '[]'::jsonb,
  action_plan text not null,
  status text check (status in ('calculated', 'applied', 'viewed', 'in_progress', 'rejected')) not null default 'calculated',
  is_new boolean default true not null,
  recruiter_message text,
  resume_id uuid references public.resumes(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (job_id, candidate_id)
);

alter table public.applications enable row level security;

create policy if not exists "Candidates can view own applications"
  on applications for select
  using ( auth.uid() = candidate_id );

create policy if not exists "Recruiters can view applications for their jobs"
  on applications for select
  using (
    exists (
      select 1 from jobs where id = applications.job_id and recruiter_id = auth.uid()
    )
  );

create policy if not exists "Candidates can insert applications"
  on applications for insert
  with check (
    auth.uid() = candidate_id and
    exists (select 1 from profiles where id = auth.uid() and role = 'candidate')
  );

create policy if not exists "Candidates can update own applications"
  on applications for update
  using ( auth.uid() = candidate_id );

create policy if not exists "Recruiters can update applications for their jobs"
  on applications for update
  using (
    exists (
      select 1 from jobs where id = applications.job_id and recruiter_id = auth.uid()
    )
  );

create policy if not exists "Recruiters can view resumes for applications on their jobs"
  on resumes for select
  using (
    exists (
      select 1 from applications
      where applications.resume_id = resumes.id
      and exists (
        select 1 from jobs where id = applications.job_id and recruiter_id = auth.uid()
      )
    )
  );

-- Safe migration helpers for existing databases
-- Estas sentencias se ejecutan sin fallar si ya existen.
alter table public.applications add column if not exists recruiter_message text;
alter table public.applications add column if not exists is_new boolean default true not null;
alter table public.applications add column if not exists resume_id uuid references public.resumes(id) on delete set null;

alter table public.applications drop constraint if exists applications_status_check;
alter table public.applications add constraint applications_status_check
  check (status in ('calculated', 'applied', 'viewed', 'in_progress', 'rejected'));

create policy if not exists "Recruiters can view resumes of their applicants"
  on resumes for select
  using (
    exists (
      select 1 from applications
      join jobs on applications.job_id = jobs.id
      where applications.candidate_id = resumes.candidate_id
      and jobs.recruiter_id = auth.uid()
    )
  );

-- Optional helper for auth triggers
create or replace function public.handle_new_user()
returns trigger as $$
begin
  return new;
end;
$$ language plpgsql security definer;
