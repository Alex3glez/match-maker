# Fix para el filtrado de ofertas

## Paso 1: Ejecutar en Supabase SQL Editor

Copia y ejecuta este SQL en tu proyecto Supabase (SQL Editor):

```sql
-- Verificar el estado actual de los jobs
SELECT id, title, status FROM public.jobs LIMIT 20;

-- Asegurar que todos los jobs tienen un status válido
UPDATE public.jobs
SET status = COALESCE(status, 'active')
WHERE status IS NULL OR status NOT IN ('active', 'ended');

-- Verificar que se actualizaron correctamente
SELECT COUNT(*) as total_jobs,
       COUNT(CASE WHEN status = 'active' THEN 1 END) as active_jobs,
       COUNT(CASE WHEN status = 'ended' THEN 1 END) as ended_jobs,
       COUNT(CASE WHEN status IS NULL THEN 1 END) as null_status
FROM public.jobs;
```

## Paso 2: Limpiar cache del navegador

1. Abre DevTools (F12)
2. Ve a Application → Storage
3. Clear all

## Paso 3: Recargar la página

Actualiza `/dashboard/recruiter` y prueba los filtros.

## Si aún no funciona:

1. Abre DevTools Console (F12 → Console)
2. Verifica que ves logs como:
   - `[DEBUG RecruiterDashboard]`
   - `[DEBUG JobStatusTabs]`
3. Revisa si `status` siempre es `null` en los logs

Si ves `status: null`, significa que las ofertas NO tienen status en la BD.
