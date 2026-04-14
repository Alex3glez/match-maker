"use client";

import AuthForm from "../../components/AuthForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
        <div className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Match-Maker</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Accede para analizar compatibilidad de CVs.</h1>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-600">Regístrate con correo y contraseña para comenzar a subir tu currículum en PDF y comparar con ofertas de trabajo.</p>
        </div>
        <AuthForm />
      </div>
    </main>
  );
}
