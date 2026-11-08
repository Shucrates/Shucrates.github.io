import type { Metadata } from "next";
import { HomeLink } from "@/components/HomeLink";
import { CardControls } from "@/components/card/CardControls";

export const metadata: Metadata = { title: "contact" };

/**
 * The card itself is drawn by its <ObjectStage> in the layout (z-40). This page
 * blanks the page behind it (z-30) and puts the controls and links on top (z-50).
 */
export default function ContactPage() {
  return (
    <>
      <div aria-hidden className="fixed inset-0 z-30 bg-bg" />
      <h1 className="sr-only">Contact</h1>
      <CardControls />
      <HomeLink
        className="fixed left-gutter top-6 z-50 font-label text-sm uppercase tracking-wider underline-offset-4 hover:underline"
      >
        ← back to the space
      </HomeLink>
      <p className="pointer-events-none fixed inset-x-0 bottom-8 z-50 text-center font-label text-xs uppercase tracking-wider text-ink-muted max-md:hidden">
        drag to turn the card · click it to hide the details
      </p>
    </>
  );
}
