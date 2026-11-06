import type { Metadata } from "next";
import { CameraPlayer } from "@/components/camera/CameraPlayer";
import { Credit } from "@/components/Credit";
import { Story } from "@/components/journey/Story";
import { show } from "@/content/episodes";
import { site } from "@/content/site";

export const metadata: Metadata = { title: show.title };

/**
 * The camera itself is drawn by its <ObjectStage> in the layout (z-40). This page
 * blanks the page behind it (z-30), scrolls the story between the two (z-35), so
 * the camera sits in front of the title, and puts the controls on top (z-50).
 */
export default function ShuIsBoredPage() {
  return (
    <>
      <div aria-hidden className="fixed inset-0 z-30 bg-bg" />
      <Story />
      <CameraPlayer />
      <Credit credit={site.credits.camera} />
    </>
  );
}
