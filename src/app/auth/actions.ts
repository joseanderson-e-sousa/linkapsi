"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; success?: string };

function credentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

function validationError(email: string, password: string) {
  if (!email || !password) return "Preencha email e senha.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Informe um email válido.";
}

function authError(code?: string) {
  switch (code) {
    case "invalid_credentials": return "Email ou senha incorretos.";
    case "email_not_confirmed": return "Confirme seu email antes de entrar.";
    case "weak_password": return "Use uma senha mais forte, conforme os requisitos do serviço.";
    case "user_already_exists": return "Não foi possível criar a conta. Tente entrar com seu email.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit": return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
    default: return "Não foi possível concluir. Confira os dados e tente novamente.";
  }
}

export async function signup(_state: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password } = credentials(formData);
  const error = validationError(email, password);
  if (error) return { error };
  if (password.length < 8) return { error: "A senha deve ter pelo menos 8 caracteres." };
  if (password !== formData.get("confirmPassword")) return { error: "As senhas precisam ser iguais." };

  let hasSession = false;
  try {
    const supabase = await createClient();
    // Server Actions validate Origin against Host. Supabase also enforces its
    // configured redirect allowlist before using this confirmation destination.
    const origin = (await headers()).get("origin");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: origin ? { emailRedirectTo: `${origin}/auth/callback` } : undefined,
    });
    if (error) return { error: authError(error.code) };
    hasSession = Boolean(data.session);
  } catch {
    return { error: "Não foi possível conectar. Tente novamente em instantes." };
  }
  if (hasSession) {
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }
  return { success: "Confira seu email para confirmar o cadastro antes de entrar. Se já tiver uma conta, use a opção Entrar." };
}

export async function login(_state: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password } = credentials(formData);
  const error = validationError(email, password);
  if (error) return { error };
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: authError(error.code) };
  } catch {
    return { error: "Não foi possível conectar. Tente novamente em instantes." };
  }
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout(): Promise<AuthState> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) return { error: "Não foi possível sair. Tente novamente." };
  } catch {
    return { error: "Não foi possível conectar. Tente novamente em instantes." };
  }
  revalidatePath("/", "layout");
  redirect("/login");
}
