import type { Metadata } from "next";
import { Zilla_Slab, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import "./globals.css";

const display = Zilla_Slab({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});
const body = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Gym Chaloklum",
  description: "Suivi des ventes et dépenses — Chaloklum Bay Gym & Bubbas Coffee Roasters",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${display.variable} ${body.variable} ${mono.variable} font-body min-h-screen`}>
        <Nav />
        <main className="mx-auto max-w-5xl px-4 pb-24 pt-6">{children}</main>
      </body>
    </html>
  );
}
