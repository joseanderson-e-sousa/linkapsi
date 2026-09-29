"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { textFields, validateProfile, type ProfileValues } from "./profile-data";

export type ProfileState = { errors?: string[]; success?: string };

export async function saveProfile(_state: ProfileState, formData: FormData): Promise<ProfileState> {
  const failure = { errors: ["Erro ao salvar. Tente novamente."] };
  const intent = formData.get("intent");
  if (!["draft", "publish", "unpublish"].includes(String(intent))) return failure;

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { errors: ["Sua sessão expirou. Entre novamente para salvar."] };

    if (intent === "unpublish") {
      // Only change publication status; do not persist unsaved form edits.
      const { data, error } = await supabase.from("profiles")
        .update({ is_published: false }).eq("user_id", user.id).select("id").single();
      if (error || !data) return failure;
    } else {
      // Explicit allowlist: ownership and status never come from browser fields.
      const values = Object.fromEntries(textFields.map(([field]) => {
        const value = formData.get(field);
        return [field, typeof value === "string" ? value.trim() : ""];
      })) as ProfileValues;
      const { errors, data } = validateProfile(values, intent === "publish");
      if (errors.length) return { errors };

      // Conflict only on the authenticated owner's unique user_id, never slug.
      const { error } = await supabase.from("profiles").upsert(
        { ...data, user_id: user.id }, { onConflict: "user_id" },
      );
      if (error) {
        if (error.code === "23505") return { errors: ["Slug já está sendo utilizado."] };
        return failure;
      }
    }
  } catch {
    return failure;
  }

  revalidatePath("/dashboard");
  return { success: intent === "publish" ? "Perfil publicado." : intent === "unpublish" ? "Perfil despublicado." : "Perfil salvo." };
}
