import type { Metadata } from "next";
import "./globals.css";
import MotionEffects from "./motion-effects";

export const metadata: Metadata = {
  title: "Podóloga Valdirene Espindola | Podologia em Penha - SC",
  description:
    "Podologia especializada em Penha - SC. Cuidado, saúde e bem-estar para seus pés, com atendimento humanizado e individualizado. Agende pelo WhatsApp.",
  keywords: [
    "podóloga",
    "podologia",
    "podologia em Penha SC",
    "unha encravada",
    "tratamento de fungos",
    "calosidades",
    "Armação Penha",
  ],
  openGraph: {
    title: "Podóloga Valdirene Espindola",
    description:
      "Cuidado, saúde e bem-estar para seus pés. Podologia especializada em Penha - SC.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body>
        <MotionEffects />
        {children}
      </body>
    </html>
  );
}
