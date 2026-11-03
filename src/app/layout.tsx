import type { Metadata } from "next";
import { Cossette_Titre, IBM_Plex_Mono, Inter_Tight } from "next/font/google";
import { LinkBar } from "@/components/LinkBar";
import { Stages } from "@/components/stage/Stages";
import { site } from "@/content/site";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

const cossette = Cossette_Titre({
  variable: "--font-cossette",
  subsets: ["latin"],
  weight: "400",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: { default: site.title, template: `%s · ${site.title}` },
  description: `${site.name}, ${site.tagline}.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${interTight.variable} ${plexMono.variable} ${cossette.variable} antialiased`}>
      <body className="min-h-dvh font-sans">
        <LinkBar />
        <main>{children}</main>
        <Stages />
      </body>
    </html>
  );
}
