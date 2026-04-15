# Prompt log 🤖

Para el desarrollo de este proyecto, mi flujo de trabajo consistió en utilizar **Google Gemini** como mi "ingeniero de prompts". Tras tener clara la idea de lo que quería construir, le describía detalladamente mis objetivos a Gemini para que me generara *prompts* técnicos muy completos y estructurados. Posteriormente, pasaba estos prompts a mis agentes de código (Google Cloud Code y GitHub Copilot) dentro de mi entorno Next.js + Supabase. Esta técnica me permitió ahorrar muchísimos tokens y reducir la cantidad de errores en la generación de código.

A continuación, presento los prompts clave que utilicé.

---

### Prompt 1: El MVP Inicial (Match CV vs Texto)

En un principio, la idea de "Match-Maker" era mucho más simple: un usuario se logueaba, subía su currículum en PDF, pegaba el texto de una oferta de trabajo y la IA hacía el cálculo. Este fue el prompt exacto que utilicé para construir esa base:

> **Rol y Contexto:** Eres un desarrollador Senior Full-Stack experto en Next.js (App Router), React, Tailwind CSS, Supabase y la API de Google Gemini (@google/generative-ai). Vamos a construir "Match-Maker", una aplicación web responsive, limpia y minimalista.
> 
> **Objetivo:** Quiero crear un MVP completo donde los usuarios puedan registrarse, subir su currículum en PDF y compararlo contra descripciones de ofertas de trabajo para obtener un análisis de compatibilidad mediante IA.
> 
> **Arquitectura requerida:**
> - **Frontend:** Usa Tailwind CSS para un diseño moderno (usa colores neutros, mucho espacio en blanco, bordes redondeados y sombras suaves).
> - **Base de Datos & Auth (Supabase):** Crea el código para la autenticación (Login/Register con email y contraseña). Necesitamos una tabla `profiles` vinculada al usuario y un bucket de Storage `resumes` para guardar los PDFs.
> - **Procesamiento de PDF:** Crea un Server Action que reciba un archivo PDF, lo suba a Supabase Storage y use la librería `pdf-parse` para extraer el texto.
> - **Integración con Google Gemini:** Crea un Server Action que tome el texto extraído del CV y un texto de "Oferta de trabajo" (introducido en un textarea por el usuario). Usa el modelo `gemini-1.5-flash` para devolver un objeto JSON con: `match_score` (0-100), `missing_keywords` (array de strings) y `action_plan`. Instruye al modelo para que devuelva estrictamente JSON.
> 
> **Vistas a generar:**
> - `/`: Landing page.
> - `/login`: Formulario de login/registro.
> - `/dashboard`: Vista dividida en "Mi Perfil" (Dropzone para subir PDF) y "Nueva Oferta" (Textarea y botón "Calcular Match"). Abajo, mostrar tarjetas con resultados.

* **Por qué funcionó / Qué tuve que cambiar:** Funcionó muy bien para establecer la infraestructura base (Next.js + Supabase). Sin embargo, en versiones anteriores del prompt, la IA me devolvía la respuesta de Gemini envuelta en etiquetas Markdown (````json ... ````), lo que rompía la aplicación al intentar parsearlo; la instrucción explícita de "devuelve estrictamente JSON" fue clave para estabilizar el proceso.

---

### Evolución de la Web App

Una vez construido el MVP, solucionados los errores iniciales y viendo que el *core* de la IA funcionaba perfectamente, decidí ir más allá. Quise transformar la herramienta en una plataforma real de dos vías (un *marketplace*), añadiendo roles diferenciados (Candidato y Reclutador), creación de ofertas persistentes, flujos de aplicación y notificaciones. 

Para lograr esto, generé los siguientes prompts iterativos:

---

### Prompt 2: Sistema de Roles y Dashboards Específicos

> **Contexto:** Ahora que el MVP funciona, vamos a escalar la aplicación a una plataforma de reclutamiento real. Necesitamos diferenciar a los usuarios en dos roles: "Candidato" y "Reclutador".
> 
> **Acciones:**
> 1. Modifica la tabla `profiles` para incluir un campo `role`.
> 2. Crea una tabla `jobs` donde los reclutadores puedan publicar ofertas (título, descripción, estado activo/terminado).
> 3. Modifica el enrutamiento: 
>    - Los reclutadores tendrán su panel en `/dashboard/recruiter` donde verán sus ofertas creadas y tendrán un botón para "Crear Oferta".
>    - Los candidatos tendrán su vista en `/jobs` para explorar todas las ofertas activas, y su gestión de CVs pasará a la vista `/profile`.
> 4. Actualiza las políticas RLS de Supabase para que los reclutadores solo puedan editar sus propios `jobs`.

* **Por qué funcionó / Qué tuve que cambiar:** El cambio de arquitectura fue grande. Al principio hubo problemas porque las rutas chocaban entre sí. Tuve que pedirle al agente de código que modularizara mejor las vistas y que usara redirecciones en el lado del servidor (`redirect` en Next.js) si un candidato intentaba entrar a la ruta de un reclutador.

---

### Prompt 3: Flujo de Solicitudes (Applications) y Automatización del Match

> **Contexto:** Vamos a conectar a los candidatos con las ofertas de los reclutadores automatizando el Server Action de Gemini que ya tenemos.
> 
> **Acciones:**
> 1. Crea una tabla `applications` que una a un candidato, una oferta (`job_id`), el `match_score` y el estado de la solicitud (pendiente, visto, en proceso, rechazado).
> 2. En la vista de una oferta (`/jobs/[jobId]`), el candidato ya no pega un texto. Selecciona uno de sus PDFs subidos y hace clic en "Analizar Match". Esto debe ejecutar la llamada a Gemini contra la descripción de la oferta guardada en la base de datos y guardar el resultado en `applications`.
> 3. En el dashboard del reclutador, al entrar a una oferta, debe ver tarjetas (`ApplicationCard`) con los candidatos ordenados por `match_score`.
> 4. Añade botones para que el reclutador cambie el estado de la solicitud y añade un sistema de notificaciones simple en la base de datos que avise al candidato de estos cambios.

* **Por qué funcionó / Qué tuve que cambiar:** Desacoplar la subida del PDF de la evaluación con IA mejoró muchísimo la experiencia de usuario. Tuve que iterar sobre este prompt para pedirle que añadiera `useTransition` en los botones de "Analizar", ya que la llamada a Gemini tomaba un par de segundos y sin *feedback* visual parecía que la app se había congelado.

---

### Prompt 4: Refactorización, Buenas Prácticas y Seguridad (IDOR)

> **Contexto:** La plataforma está funcional, pero necesitamos hacer una revisión final de seguridad y pulir la experiencia de usuario antes de entregar la prueba técnica.
> 
> **Acciones:**
> 1. **Seguridad (Vulnerabilidad IDOR):** Actualmente, si un reclutador intenta ver el currículum de un candidato mediante `getResumeUrl`, el RLS de Storage lo bloquea. Si usamos la `SUPABASE_SERVICE_ROLE_KEY` para solucionarlo, abrimos una brecha donde cualquiera podría leer cualquier CV. Refactoriza `getResumeUrl` para que, antes de usar la Service Key, haga una consulta `SELECT` a la tabla `resumes` con el cliente autenticado normal. Si el RLS de la base de datos no le permite ver ese registro (porque no es su CV ni aplicó a su oferta), devuelve un error `{ error: "Sin acceso" }`.
> 2. **Buenas Prácticas:** Asegúrate de que las Server Actions devuelvan objetos controlados con errores en lugar de lanzar excepciones que rompan el cliente (Error 500).
> 3. **UI Polish:** Revisa componentes como botones de borrado y asegúrate de que tengan los estados correctos (`cursor-pointer`, `disabled:opacity-50`).

* **Por qué funcionó / Qué tuve que cambiar:** Fue la pieza clave para asegurar un código robusto para producción. Al principio intenté relajar las políticas RLS de Storage, pero era muy inseguro. La lógica de verificar permisos en la base de datos primero antes de escalar privilegios temporalmente resultó ser la solución arquitectónica perfecta.