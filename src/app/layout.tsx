import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Linkapsi",
  description: "Página profissional para psicólogos",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
