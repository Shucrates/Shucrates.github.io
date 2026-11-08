import type { Metadata } from "next";
import { HomeLink } from "@/components/HomeLink";
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
      {/* Behind the iPod (z-40), over the blank page. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[35] font-serif max-md:hidden">
        <p className="absolute inset-x-0 top-[4%] text-center text-[min(33vw,49dvh)] leading-[0.8] text-blue">my ipod</p>
        <p className="absolute right-[7%] top-[44%] text-[min(3.4vw,5.3dvh)] leading-none">explore my taste</p>
      </div>
      <h1 className="sr-only">My iPod: explore my taste in music</h1>
      <IpodPlayer />
      <HomeLink
        className="fixed left-gutter top-6 z-50 md:hidden font-label text-sm uppercase tracking-wider underline-offset-4 hover:underline"
      >
        ← back to the space
      </HomeLink>
      <p className="pointer-events-none fixed inset-x-0 bottom-6 z-50 text-center font-label text-xs uppercase tracking-wider text-ink-muted md:bottom-[2.5dvh] md:text-[10px]">
        <span className="max-md:hidden">drag round the wheel to scroll · centre to select · menu to go back</span>
        <span className="md:hidden">turn the wheel · tap the centre</span>
      </p>
    </>
  );
}
