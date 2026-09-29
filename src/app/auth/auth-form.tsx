"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup, type AuthState } from "./actions";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const isSignup = mode === "signup";
  const [state, action, pending] = useActionState<AuthState, FormData>(isSignup ? signup : login, {});
  const inputClass = "w-full rounded border border-zinc-300 px-3 py-2";

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
      <label className="grid gap-1">
        Email
        <input className={inputClass} name="email" type="email" autoComplete="email" required maxLength={254} />
      </label>
      <label className="grid gap-1">
        Senha
        <input className={inputClass} name="password" type="password" autoComplete={isSignup ? "new-password" : "current-password"} required minLength={isSignup ? 8 : undefined} />
      </label>
      {isSignup && (
        <label className="grid gap-1">
          Confirmar senha
          <input className={inputClass} name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} />
          <span className="text-sm text-zinc-600">Use pelo menos 8 caracteres.</span>
        </label>
      )}
      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      {state.success && <p role="status" className="text-sm text-emerald-800">{state.success}</p>}
      <button disabled={pending} className="rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-50">
        {pending ? "Aguarde…" : isSignup ? "Criar conta" : "Entrar"}
      </button>
      <Link className="text-center underline" href={isSignup ? "/login" : "/cadastro"}>
        {isSignup ? "Já tenho conta: Entrar" : "Criar conta"}
      </Link>
      <Link className="text-center text-sm underline" href="/">Voltar ao início</Link>
    </form>
  );
}
