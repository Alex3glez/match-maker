"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus, Mail, Lock } from "lucide-react";
import { supabaseBrowser } from "../lib/supabase-browser";

export default function AuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      console.log(`[AuthForm] Attempting ${mode} with email:`, email);
      
      const response =
        mode === "login"
          ? await supabaseBrowser.auth.signInWithPassword({ email, password })
          : await supabaseBrowser.auth.signUp({ email, password });

      console.log(`[AuthForm] ${mode} response:`, response);

      if (response.error) {
        console.error(`[AuthForm] Auth error:`, response.error);
        setErrorMessage(response.error.message);
        return;
      }

      console.log(`[AuthForm] ${mode} successful, redirecting to /dashboard`);
      router.push("/dashboard");
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
          <p className="text-sm text-slate-600">Accede y compara tu currículum con ofertas de trabajo.</p>
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
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
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="font-semibold text-slate-950 hover:text-slate-700"
        >
          {mode === "login" ? "Regístrate" : "Iniciar sesión"}
        </button>
      </div>
    </div>
  );
}
