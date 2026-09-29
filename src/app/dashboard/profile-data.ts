export const textFields = [
  ["professional_name", "Nome profissional"],
  ["crp", "CRP"],
  ["slug", "Slug"],
  ["bio", "Apresentação"],
  ["areas_of_practice", "Áreas de atuação"],
  ["audience", "Público atendido"],
  ["service_modes", "Modalidade de atendimento"],
  ["city", "Cidade"],
  ["whatsapp", "WhatsApp"],
  ["instagram_url", "Instagram"],
  ["primary_cta_label", "Texto do CTA principal"],
  ["primary_cta_url", "URL do CTA principal"],
] as const;

export type Field = (typeof textFields)[number][0];
export type ProfileValues = Record<Field, string>;
export type Profile = Record<Exclude<Field, "areas_of_practice" | "audience" | "service_modes">, string | null> & {
  areas_of_practice: string[] | null;
  audience: string[] | null;
  service_modes: string[] | null;
  is_published: boolean;
};

export function listValues(value: string) {
  return [...new Set(value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean))];
}

export function validateProfile(values: ProfileValues, publish: boolean) {
  const errors: string[] = [];
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(values.slug)) {
    errors.push("Informe um slug com letras minúsculas sem acentos e/ou números, separados por hífen, sem espaços (ex.: ana-silva).");
  }
  for (const [field, label] of [["instagram_url", "Instagram"], ["primary_cta_url", "URL do CTA principal"]] as const) {
    if (!values[field]) continue;
    try {
      const url = new URL(values[field]);
      if (!["http:", "https:"].includes(url.protocol) || !url.hostname || url.username || url.password) throw new Error();
    } catch {
      errors.push(`${label}: informe uma URL válida começando com https:// ou http://.`);
    }
  }
  let whatsapp = values.whatsapp.replace(/\D/g, "");
  if (values.whatsapp) {
    if (!/^\+?[\d\s().-]+$/.test(values.whatsapp) || whatsapp.length < 10 || whatsapp.length > 15) {
      errors.push("WhatsApp: informe de 10 a 15 dígitos, com DDD e, para números internacionais, código do país.");
    } else if (!values.whatsapp.startsWith("+") && [10, 11].includes(whatsapp.length)) {
      whatsapp = `55${whatsapp}`;
    }
  }
  const arrays = {
    areas_of_practice: listValues(values.areas_of_practice),
    audience: listValues(values.audience),
    service_modes: listValues(values.service_modes),
  };
  if (publish) {
    const missing = [];
    if (!values.professional_name) missing.push("nome profissional");
    if (!values.crp) missing.push("CRP");
    if (!values.slug) missing.push("slug");
    if (!values.bio) missing.push("apresentação");
    if (!arrays.service_modes.length) missing.push("pelo menos uma modalidade de atendimento");
    if (!values.whatsapp && !values.primary_cta_url) missing.push("WhatsApp ou URL do CTA principal");
    if (missing.length) errors.push(`Para publicar, preencha: ${missing.join(", ")}.`);
  }
  return { errors, data: { ...values, ...arrays, whatsapp, is_published: publish } };
}
