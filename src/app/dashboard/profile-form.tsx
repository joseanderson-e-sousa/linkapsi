"use client";

import { useActionState, useState } from "react";
import { saveProfile } from "./actions";
import { textFields, type Profile, type ProfileValues } from "./profile-data";

const listHints: Record<string, string> = {
  areas_of_practice: "Ansiedade\nRelacionamentos\nAutoestima",
  audience: "Adultos\nAdolescentes",
  service_modes: "Online\nPresencial",
};

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const [state, action, pending] = useActionState(saveProfile, {});
  const [values, setValues] = useState<ProfileValues>(() => Object.fromEntries(
    textFields.map(([field]) => {
      const value = profile?.[field];
      return [field, Array.isArray(value) ? value.join("\n") : value ?? ""];
    }),
  ) as ProfileValues);
  const inputClass = "w-full rounded border border-zinc-300 bg-white px-3 py-2";

  return (
    <form action={action} noValidate className="grid gap-5">
      <p className="text-sm text-zinc-600">Para salvar um rascunho, escolha um slug válido. Para publicar, preencha nome profissional, CRP, apresentação, modalidade e WhatsApp ou URL do CTA principal.</p>
      <fieldset disabled={pending} className="grid gap-4 disabled:opacity-60">
        {textFields.map(([field, label]) => (
          <label key={field} className="grid gap-1">
            <span className="font-medium">{label}</span>
            {field === "bio" || field in listHints ? (
              <textarea className={inputClass} name={field} rows={field === "bio" ? 5 : 3}
                placeholder={listHints[field]} value={values[field]}
                onChange={(event) => setValues({ ...values, [field]: event.target.value })} />
            ) : (
              <input className={inputClass} name={field} value={values[field]}
                type={field.endsWith("_url") ? "url" : field === "whatsapp" ? "tel" : "text"}
                autoCapitalize={field === "slug" ? "none" : undefined}
                spellCheck={field === "slug" ? false : undefined}
                onChange={(event) => setValues({ ...values, [field]: event.target.value })} />
            )}
            {field in listHints && <span className="text-sm text-zinc-600">Digite um item por linha.</span>}
            {field === "slug" && <span className="break-all text-sm text-zinc-600">Prévia: psicomachine.com/p/{values.slug || "seu-slug"}. Use letras minúsculas, números e hífens entre palavras.</span>}
            {field === "whatsapp" && <span className="text-sm text-zinc-600">Com DDD, ex.: (11) 99999-9999. Números brasileiros sem código recebem 55; internacionais devem começar com + e código do país.</span>}
          </label>
        ))}
        <div className="flex flex-wrap gap-3">
          <button name="intent" value="draft" className="rounded border border-zinc-400 px-4 py-2">Salvar como rascunho</button>
          <button name="intent" value="publish" className="rounded bg-zinc-900 px-4 py-2 text-white">{profile?.is_published ? "Salvar e manter publicado" : "Publicar"}</button>
          {profile?.is_published && <button name="intent" value="unpublish" className="rounded border border-zinc-400 px-4 py-2">Despublicar</button>}
        </div>
      </fieldset>
      {profile?.is_published && <p className="text-sm text-zinc-600">Salvar como rascunho também retira a publicação. Despublicar altera apenas o status e não salva alterações nos campos.</p>}
      {pending && <p role="status">Salvando…</p>}
      {state.errors && <ul role="alert" className="list-inside list-disc text-red-700">{state.errors.map((error) => <li key={error}>{error}</li>)}</ul>}
      {state.success && <p role="status" className="text-emerald-800">{state.success}</p>}
    </form>
  );
}
