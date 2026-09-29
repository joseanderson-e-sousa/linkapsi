import { createClient } from "@supabase/supabase-js";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getSupabaseEnv } from "@/lib/supabase/env";

// Request-scoped memoization shares the public lookup with metadata.
// No session cookies or persistent cache: unpublishing applies on the next request.
export const getPublicProfile = cache(async (slug: string) => {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) notFound();
  const { url, publishableKey } = getSupabaseEnv();
  const supabase = createClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
  const { data, error } = await supabase.from("profiles")
    .select("professional_name,crp,bio,photo_url,areas_of_practice,audience,service_modes,city,instagram_url,whatsapp,primary_cta_label,primary_cta_url")
    .eq("slug", slug).eq("is_published", true).maybeSingle();

  if (error || !data) notFound();
  return data;
});

export function safeExternalUrl(value: string | null): string | undefined {
  if (!value?.trim()) return undefined;
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol) || !url.hostname || url.username || url.password) return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}
