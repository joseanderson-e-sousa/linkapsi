import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { ProfileForm } from "./profile-form";
import { textFields, type Profile } from "./profile-data";

export default async function Dashboard() {
  const supabase = await createClient();
  // Validate with Auth on the server, including whether the session was revoked.
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  const { data: profile, error: profileError } = await supabase.from("profiles")
    .select([...textFields.map(([field]) => field), "is_published"].join(","))
    .eq("user_id", user.id).returns<Profile[]>().maybeSingle();

  return (
    <main className="min-h-dvh bg-zinc-50 px-6 py-12 text-zinc-900">
      <div className="mx-auto grid max-w-2xl gap-6">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold">Linkapsi</h1>
          <LogoutButton />
        </header>
        {profileError ? (
          <p role="alert">Não foi possível carregar seu perfil. Recarregue a página para tentar novamente.</p>
        ) : (
          <>
            <h2 className="text-2xl font-semibold">{profile ? "Editar meu Linkapsi" : "Crie seu Linkapsi"}</h2>
            <p className="font-medium">Status: {profile?.is_published ? "Publicado" : "Rascunho"}</p>
            {profile?.is_published && profile.slug && (
              <Link href={`/p/${profile.slug}`} className="w-fit text-sm font-medium underline underline-offset-4">Ver meu Linkapsi</Link>
            )}
            <ProfileForm profile={profile} />
          </>
        )}
      </div>
    </main>
  );
}
