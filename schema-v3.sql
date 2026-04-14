-- 1. Actualizar el constraint de la tabla applications
-- Primero debemos eliminar la restricción actual que solo permite 'calculated' y 'applied'
alter table public.applications drop constraint if exists applications_status_check;

-- Luego añadimos la nueva restricción con todos los estados del flujo de contratación
alter table public.applications add constraint applications_status_check 
check (status in ('calculated', 'applied', 'viewed', 'rejected', 'in_progress'));

-- 2. Añadir columna para mensajes del reclutador
alter table public.applications add column if not exists recruiter_message text;

-- 3. Permitir a los reclutadores leer los curriculums (la tabla resumes) de los candidatos que han aplicado a sus ofertas
create policy "Recruiters can view resumes of their applicants"
  on resumes for select
  using (
    exists (
      select 1 from applications 
      join jobs on applications.job_id = jobs.id
      where applications.candidate_id = resumes.candidate_id 
      and jobs.recruiter_id = auth.uid()
    )
  );

-- Actualizar función de RLS si es necesario o simplemente dejar la política añadida
