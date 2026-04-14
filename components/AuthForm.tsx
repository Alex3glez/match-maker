"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus, Mail, Lock, User, Briefcase } from "lucide-react";
import { supabaseBrowser } from "../lib/supabase-browser";
import { saveProfile } from "../app/actions";

export default function AuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<"candidate" | "recruiter">("candidate");
  
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const response = await supabaseBrowser.auth.signInWithPassword({ email, password });
        if (response.error) {
          setErrorMessage(response.error.message);
          return;
        }
        router.push("/dashboard");
      } else {
        // Sign up
        const response = await supabaseBrowser.auth.signUp({ email, password });
        if (response.error) {
          setErrorMessage(response.error.message);
          return;
        }
        
        // After successful signup, we need to create the profile
        if (response.data?.user?.id) {
          try {
            await saveProfile({
              role,
              first_name: firstName,
              last_name: lastName,
            });
            router.push("/dashboard");
          } catch (profileError: any) {
            console.error("Error creating profile:", profileError);
            const errText = profileError?.message || "";
            if (errText.includes("Could not find the table") || errText.includes("relation \"public.profiles\" does not exist")) {
              setErrorMessage("Cuenta creada pero falta la tabla 'profiles'. Ejecuta schema.sql en Supabase.");
            } else {
              setErrorMessage("Cuenta creada pero falló al guardar el perfil. Por favor, actualízalo en tu página de perfil.");
            }
            // Add a small delay so they can read it before routing, or just don't route so they see the error
          }
        }
      }
    } catch (error) {
      console.error("[AuthForm] Exception:", error);
      setErrorMessage((error as Error).message || "Error during authentication.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-lg shadow-slate-200/50">
      <div className="mb-8 space-y-3 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-slate-700">
          {mode === "login" ? <LogIn className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">{mode === "login" ? "Iniciar sesión" : "Crear cuenta"}</h1>
          <p className="text-sm text-slate-600">
            {mode === "login" ? "Accede a tu cuenta." : "Únete y descubre nuevas oportunidades."}
          </p>
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {mode === "signup" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-2 text-sm text-slate-700">
                <span className="font-medium">Nombre</span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <User className="h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    className="w-full bg-transparent text-slate-950 outline-none"
                    placeholder="Tu nombre"
                    required
                  />
                </div>
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-700">
                <span className="font-medium">Apellidos</span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <input
                    type="text"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className="w-full bg-transparent text-slate-950 outline-none"
                    placeholder="Tus apellidos"
                    required
                  />
                </div>
              </label>
            </div>

            <label className="flex flex-col gap-2 text-sm text-slate-700">
              <span className="font-medium">¿Qué buscas hacer?</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("candidate")}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-colors ${
                    role === "candidate"
                      ? "border-slate-900 bg-slate-50 text-slate-900 shadow-sm"
                      : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">Candidato</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("recruiter")}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-colors ${
                    role === "recruiter"
                      ? "border-slate-900 bg-slate-50 text-slate-900 shadow-sm"
                      : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <Briefcase className="h-5 w-5" />
                  <span className="font-medium">Reclutador</span>
                </button>
              </div>
            </label>
          </>
        )}

        <label className="flex flex-col gap-2 text-sm text-slate-700">
          <span className="font-medium">Correo electrónico</span>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Mail className="h-4 w-4 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full bg-transparent text-slate-950 outline-none"
              placeholder="ejemplo@correo.com"
              required
            />
          </div>
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-700">
          <span className="font-medium">Contraseña</span>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Lock className="h-4 w-4 text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full bg-transparent text-slate-950 outline-none"
              placeholder="Contraseña segura"
              required
            />
          </div>
        </label>

        {errorMessage ? <p className="text-sm text-rose-600">{errorMessage}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {mode === "login" ? "Entrar" : "Registrarme"}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-600">
        <span>{mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}</span>
        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setErrorMessage(null);
          }}
          className="font-semibold text-slate-950 hover:text-slate-700"
        >
          {mode === "login" ? "Regístrate" : "Iniciar sesión"}
        </button>
      </div>
    </div>
  );
}
