import type { Metadata } from "next";
import { HomeLink } from "@/components/HomeLink";
import { AchievementList } from "@/components/achievements/AchievementList";
import { MedalSwing } from "@/components/medal/MedalSwing";
import { achievements } from "@/content/achievements";

export const metadata: Metadata = { title: "achievements" };

/**
 * The medal itself is drawn by its <ObjectStage> in the layout (z-40), swung by
 * <MedalSwing>. This page blanks the page behind it (z-30) and lists the
 * achievements on top (z-50), clear of where the medal comes to rest. On a phone the list starts
 * under the medal, and the medal and the way back scroll away with the page instead of sitting over it.
 */
export default function AchievementsPage() {
  return (
    <>
      <div aria-hidden className="fixed inset-0 z-30 bg-bg" />
      <MedalSwing />
      <HomeLink
        className="fixed left-gutter top-6 z-50 font-label max-md:absolute text-sm uppercase tracking-wider underline-offset-4 hover:underline"
      >
        ← back to the space
      </HomeLink>
      <section className="pointer-events-none relative z-50 flex min-h-[calc(100dvh-var(--spacing-header))] flex-col overflow-y-auto md:justify-center px-gutter pb-16 pt-[220px] md:w-3/5 md:pt-16">
        <h1 className="mb-10 font-display text-5xl font-normal tracking-[-0.06em] md:text-7xl">achievements</h1>
        <AchievementList achievements={achievements} />
      </section>
    </>
  );
}
