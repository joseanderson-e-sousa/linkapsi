import { AuthForm } from "@/app/auth/auth-form";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-zinc-50 px-6 py-12 text-zinc-900">
      <h1 className="text-3xl font-semibold">Entrar no Linkapsi</h1>
      {error === "confirmation" && <p role="alert" className="max-w-sm text-red-700">Não foi possível concluir a confirmação neste navegador. Se o email já foi confirmado, entre com sua senha. Caso contrário, verifique o link recebido.</p>}
      <AuthForm mode="login" />
    </main>
  );
}
