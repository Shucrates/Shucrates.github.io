import type { Metadata } from "next";
import Link from "next/link";
import { IpodPlayer } from "@/components/ipod/IpodPlayer";

export const metadata: Metadata = { title: "music" };

/**
 * The iPod itself is drawn by its <ObjectStage> in the layout (z-40). This page
 * blanks the page behind it (z-30) and puts the screen and click wheel on top (z-50).
 */
export default function MusicPage() {
  return (
    <>
      <div aria-hidden className="fixed inset-0 z-30 bg-bg" />
      <h1 className="sr-only">Music: my favourite artists and what I have on repeat</h1>
      <IpodPlayer />
      <Link
        href="/"
        className="fixed left-gutter top-6 z-50 font-label text-sm uppercase tracking-wider underline-offset-4 hover:underline"
      >
        ← back to the space
      </Link>
      <p className="fixed inset-x-0 bottom-6 z-50 text-center font-label text-xs uppercase tracking-wider text-ink-muted">
        drag round the wheel to scroll · centre to select · menu to go back
      </p>
    </>
  );
}
