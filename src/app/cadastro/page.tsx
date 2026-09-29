import { AuthForm } from "@/app/auth/auth-form";

export default function Cadastro() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-zinc-50 px-6 py-12 text-zinc-900">
      <h1 className="text-3xl font-semibold">Criar conta no Linkapsi</h1>
      <AuthForm mode="signup" />
    </main>
  );
}
