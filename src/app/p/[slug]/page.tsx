import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "./avatar";
import { getPublicProfile, safeExternalUrl } from "./profile";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await getPublicProfile((await params).slug);
  const bio = profile.bio?.replace(/\s+/g, " ").trim();
  return {
    title: profile.professional_name?.trim() ? `${profile.professional_name.trim()} | Linkapsi` : "Linkapsi",
    description: bio ? Array.from(bio).slice(0, 160).join("") : null,
  };
}

function Tags({ title, values }: { title: string; values: string[] | null }) {
  const items = [...new Set(values?.map((value) => value.trim()).filter(Boolean))];
  if (!items.length) return null;
  return (
    <section>
      <h2 className="mb-2.5 text-sm font-semibold text-[#6B4A35]">{title}</h2>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => <li key={item} className="max-w-full rounded-full bg-[#F4EEE7] px-3 py-1.5 text-sm leading-5 [overflow-wrap:anywhere]">{item}</li>)}
      </ul>
    </section>
  );
}

const buttonClass = "flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 font-medium transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6B4A35] [overflow-wrap:anywhere]";

export default async function PublicProfile({ params }: Props) {
  const profile = await getPublicProfile((await params).slug);
  const name = profile.professional_name?.trim() ?? "";
  const whatsapp = profile.whatsapp?.trim();
  const whatsappUrl = whatsapp && /^\d{10,15}$/.test(whatsapp) ? `https://wa.me/${whatsapp}` : undefined;
  const primaryUrl = safeExternalUrl(profile.primary_cta_url) ?? whatsappUrl;
  const instagramUrl = safeExternalUrl(profile.instagram_url);
  const ctaLabel = profile.primary_cta_label?.trim();
  const serviceModes = [...new Set<string>(profile.service_modes?.map((value: string) => value.trim()).filter(Boolean))];

  return (
    <main className="min-h-dvh bg-[#FCFAF7] px-5 py-7 text-[#3E2B22] min-[375px]:px-6 sm:py-10">
      <div className="mx-auto max-w-[544px] [overflow-wrap:anywhere]">
        <header className="text-center">
          <Avatar name={name} photoUrl={safeExternalUrl(profile.photo_url)} />
          {name && <h1 className="mt-4 text-[1.75rem] leading-tight font-semibold tracking-tight text-balance sm:text-[2rem]">{name}</h1>}
          {profile.crp?.trim() && <p className="mt-1.5 text-xs tracking-wide text-[#6B4A35]">CRP {profile.crp.trim()}</p>}
          {profile.bio?.trim() && <p className="mt-5 whitespace-pre-line text-left text-[15px] leading-relaxed">{profile.bio.trim()}</p>}
        </header>

        {primaryUrl && ctaLabel && <a href={primaryUrl} target="_blank" rel="noopener noreferrer"
          className={`${buttonClass} mt-5 min-h-14 bg-[#6B4A35] text-[#FCFAF7] shadow-sm hover:bg-[#3E2B22]`}><span className="min-w-0 flex-1 text-center">{ctaLabel}</span><span aria-hidden="true" className="shrink-0 text-xl">→</span></a>}

        {(serviceModes.length > 0 || profile.city?.trim()) && <section aria-label="Modalidades e localização" className="mt-4 text-sm leading-6 text-[#6B4A35]">
          <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            {serviceModes.map((mode) => <li key={mode} className="flex min-w-0 max-w-full items-center gap-2"><span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-[#B98A64]" /><span>{mode}</span></li>)}
            {profile.city?.trim() && <li className="flex min-w-0 max-w-full items-center gap-2">
              <svg aria-hidden="true" className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
              <span>{profile.city.trim()}</span>
            </li>}
          </ul>
        </section>}

        <div className="grid gap-5 not-empty:mt-6">
          <Tags title="Áreas de atuação" values={profile.areas_of_practice} />
          <Tags title="Atendimento para" values={profile.audience} />
        </div>

        {(whatsappUrl || instagramUrl) && <nav aria-label="Outros canais" className="mt-6 grid gap-2.5">
          <h2 className="text-sm font-semibold text-[#6B4A35]">Outros canais</h2>
          {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
            className={`${buttonClass} border border-[#E4D5C5] bg-white/40 text-sm text-[#6B4A35] hover:bg-[#F4EEE7]`}><span>WhatsApp</span><span aria-hidden="true" className="text-lg">↗</span></a>}
          {instagramUrl && <a href={instagramUrl} target="_blank" rel="noopener noreferrer"
            className={`${buttonClass} border border-[#E4D5C5] bg-white/40 text-sm text-[#6B4A35] hover:bg-[#F4EEE7]`}><span>Instagram</span><span aria-hidden="true" className="text-lg">↗</span></a>}
        </nav>}

        <footer className="mt-7 border-t border-[#E4D5C5]/70 pt-5 text-center text-xs text-[#6B4A35]">
          <p>Criado com <span className="font-semibold">PsicoMachine</span></p>
          <Link href="/cadastro" className="mt-1 inline-flex min-h-11 items-center rounded px-2 underline decoration-[#B98A64] underline-offset-4 transition-colors hover:text-[#3E2B22] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6B4A35]">Crie seu Linkapsi gratuitamente</Link>
        </footer>
      </div>
    </main>
  );
}
