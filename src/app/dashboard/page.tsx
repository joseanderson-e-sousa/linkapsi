import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export default async function Dashboard() {
  const supabase = await createClient();
  // Validate with Auth on the server, including whether the session was revoked.
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-zinc-50 px-6 py-12 text-center text-zinc-900">
      <h1 className="text-4xl font-semibold">Linkapsi</h1>
      <h2 className="text-2xl">Seu painel</h2>
      <p>Você está autenticado.</p>
      <button disabled className="rounded bg-zinc-200 px-4 py-2 text-zinc-500">Criar meu perfil</button>
      <p className="text-sm text-zinc-600">Criação do perfil disponível na próxima etapa.</p>
      <LogoutButton />
    </main>
  );
}
