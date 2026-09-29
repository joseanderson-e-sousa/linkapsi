import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-zinc-50 px-6 py-12 text-center text-zinc-900">
      <h1 className="text-4xl font-semibold tracking-tight">Linkapsi</h1>
      <p className="text-base text-zinc-600">Uma ferramenta da PsicoMachine</p>
      <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
        <span aria-hidden="true" className="size-2 rounded-full bg-emerald-600" />
        Projeto funcionando
      </p>
      <nav aria-label="Acesso à conta" className="flex gap-4">
        <Link href="/login" className="underline">Entrar</Link>
        <Link href="/cadastro" className="underline">Criar conta</Link>
      </nav>
    </main>
  );
}
