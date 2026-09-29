"use client";

import { useState } from "react";

export function Avatar({ name, photoUrl }: { name: string; photoUrl?: string }) {
  const [failedUrl, setFailedUrl] = useState<string>();
  const words = name.trim().split(/\s+/).filter(Boolean);
  const initials = (words.length > 1 ? words[0][0] + words[words.length - 1][0] : words[0]?.[0] ?? "").toLocaleUpperCase("pt-BR");

  return (
    <div className="relative mx-auto flex size-[104px] items-center justify-center overflow-hidden rounded-full border-4 border-[#FCFAF7] bg-[#F4EEE7] text-3xl font-medium text-[#6B4A35] ring-1 ring-[#E4D5C5]">
      <span aria-label={name ? `Iniciais de ${name}` : "Avatar"}>{initials || "·"}</span>
      {photoUrl && failedUrl !== photoUrl && (
        // Native image avoids a server image proxy for arbitrary professional URLs.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt={name ? `Foto de ${name}` : "Foto profissional"}
          width={96} height={96} referrerPolicy="no-referrer" decoding="async"
          onError={() => setFailedUrl(photoUrl)} className="absolute inset-0 size-full object-cover" />
      )}
    </div>
  );
}
