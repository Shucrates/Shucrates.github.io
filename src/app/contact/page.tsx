import type { Metadata } from "next";
import Link from "next/link";
import { CardControls } from "@/components/card/CardControls";
import { site } from "@/content/site";

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
      <Link
        href="/"
        className="fixed left-gutter top-6 z-50 font-label text-sm uppercase tracking-wider underline-offset-4 hover:underline"
      >
        ← back to the space
      </Link>
      <nav aria-label="Contact links" className="fixed inset-x-0 bottom-8 z-50 text-center">
        <p className="mb-3 font-label text-xs uppercase tracking-wider text-ink-muted">drag to turn the card</p>
        <ul className="inline-flex flex-wrap justify-center gap-7">
          {site.links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                {...(link.external && { target: "_blank", rel: "noopener noreferrer" })}
                className="font-display text-base uppercase tracking-[-0.04em] text-ink-muted transition-colors hover:text-ink"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
