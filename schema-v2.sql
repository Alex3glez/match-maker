-- 4. Create RESUMES table
create table if not exists public.resumes (
  id uuid default uuid_generate_v4() primary key,
  candidate_id uuid references public.profiles(id) on delete cascade not null,
  file_name text not null,
  file_path text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on resumes
alter table public.resumes enable row level security;

create policy "Candidates can view own resumes"
  on resumes for select
  using ( auth.uid() = candidate_id );

create policy "Candidates can insert own resumes"
  on resumes for insert
  with check ( auth.uid() = candidate_id );

create policy "Candidates can delete own resumes"
  on resumes for delete
  using ( auth.uid() = candidate_id );

-- We also need to add resume_id to applications to track which resume was used
alter table public.applications add column if not exists resume_id uuid references public.resumes(id) on delete set null;

-- Optionally remove the resume_path from profiles as it's no longer the single source of truth,
-- but we can leave it for backwards compatibility or drop it.
-- alter table public.profiles drop column if exists resume_path;
