# MatchMaker 🚀

MatchMaker es una plataforma diseñada para conectar a reclutadores y candidatos mediante el uso de Inteligencia Artificial. La aplicación permite a los candidatos subir su currículum en PDF y a los reclutadores publicar ofertas de empleo. Utilizando la IA de Google Gemini, el sistema evalúa automáticamente la compatibilidad entre el perfil del candidato y la oferta, devolviendo un "Match Score", palabras clave faltantes y un plan de acción sugerido.

---

## ⚙️ Cómo ejecutar el proyecto localmente

Sigue estos pasos para levantar la aplicación en tu entorno local.

### 1. Requisitos Previos
Asegúrate de tener instalados:
- [Node.js](https://nodejs.org/es/) (v18 o superior)
- [Git](https://git-scm.com/)

### 2. Clonar e instalar dependencias

Abre tu terminal y ejecuta:

```bash
git clone <url-del-repositorio>
cd match-maker
npm install
```
*(También puedes usar `pnpm install` o `yarn install` si lo prefieres).*

### 3. Variables de Entorno (`.env.local`)

**⚠️ IMPORTANTE:** Para facilitarte la revisión de esta prueba técnica, **he adjuntado en el correo de entrega el archivo `.env.local` ya configurado** con las credenciales de prueba. Simplemente copia ese archivo y pégalo en la raíz de este proyecto.

#### ¿Quieres usar tu propia base de datos y API de IA?
Si prefieres probarlo con tu propio entorno desde cero, crea un archivo `.env.local` en la raíz del proyecto con la siguiente estructura:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<TU-PROYECTO>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<TU-ANON-KEY>
SUPABASE_SERVICE_ROLE_KEY=<TU-SERVICE-ROLE-KEY>
GEMINI_API_KEY=<TU-GEMINI-API-KEY>
```

- **Supabase:** Crea un proyecto en [Supabase](https://supabase.com/). Ve a *Project Settings -> API* para obtener la URL, la Anon Key y la Service Role Key.
- **Gemini:** Obtén tu API Key gratuita desde [Google AI Studio](https://aistudio.google.com/app/apikey).

### 4. Configurar la Base de Datos (Supabase)

Si estás utilizando el archivo `.env.local` que adjunté en el correo, **puedes saltarte este paso**, ya que la base de datos de prueba ya está configurada.

Si creaste un proyecto de Supabase nuevo:
1. Ve a la sección **SQL Editor** en el panel de tu proyecto Supabase.
2. Copia todo el contenido del archivo `schema.sql` (ubicado en la raíz de este repositorio).
3. Pégalo y ejecútalo. Esto creará automáticamente todas las tablas (`profiles`, `jobs`, `resumes`, etc.), configurará las políticas de seguridad (RLS) y creará el bucket de *Storage* para los PDFs.

### 5. Iniciar la aplicación

Ejecuta el servidor de desarrollo:

```bash
npm run dev
```

Abre tu navegador y entra en [http://localhost:3000](http://localhost:3000). 
¡Ya puedes probar la plataforma!
