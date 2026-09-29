"use client";

import { useActionState } from "react";
import { logout, type AuthState } from "@/app/auth/actions";

export function LogoutButton() {
  const [state, action, pending] = useActionState<AuthState>(logout, {});
  return (
    <form action={action} className="grid gap-2">
      <button disabled={pending} className="rounded border border-zinc-400 px-4 py-2 disabled:opacity-50">{pending ? "Saindo…" : "Sair"}</button>
      {state.error && <p role="alert" className="text-red-700">{state.error}</p>}
    </form>
  );
}
