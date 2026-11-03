import type { Metadata } from "next";
import Link from "next/link";
import { CameraPlayer } from "@/components/camera/CameraPlayer";
import { Credit } from "@/components/Credit";
import { shuisbored } from "@/content/shuisbored";
import { site } from "@/content/site";

export const metadata: Metadata = { title: shuisbored.title };

/**
 * The camera itself is drawn by its <ObjectStage> in the layout (z-40). This page
 * blanks the page behind it (z-30) and puts the controls on top (z-50).
 */
export default function ShuIsBoredPage() {
  return (
    <>
      <div aria-hidden className="fixed inset-0 z-30 bg-bg" />
      <h1 className="sr-only">
        {shuisbored.title} ({shuisbored.handle})
      </h1>
      <CameraPlayer videos={shuisbored.videos} />
      <Link
        href="/"
        className="fixed left-gutter top-6 z-50 font-label text-sm uppercase tracking-wider underline-offset-4 hover:underline"
      >
        ← back to the space
      </Link>
      <Credit credit={site.credits.camera} />
    </>
  );
}
