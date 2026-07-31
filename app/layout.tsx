import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "prumo-limpeza.tiagosoutelo.chatgpt.site";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og-v2.png`;

  return {
    title: "McDonald's Imperial — Gestão transversal",
    description: "Tarefas, objetivos mensais e áreas de acompanhamento para todos os departamentos.",
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: {
      title: "McDonald's Imperial — Uma visão comum para toda a empresa",
      description: "Tarefas, objetivos e áreas num único portal transversal.",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: "Portal McDonald's Imperial" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "McDonald's Imperial — Uma visão comum para toda a empresa",
      description: "Tarefas, objetivos e áreas num único portal transversal.",
      images: [imageUrl],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
