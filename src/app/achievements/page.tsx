import type { Metadata } from "next";
import Link from "next/link";
import { MedalSwing } from "@/components/medal/MedalSwing";
import { achievements } from "@/content/achievements";

export const metadata: Metadata = { title: "achievements" };

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The medal itself is drawn by its <ObjectStage> in the layout (z-40), swung by
 * <MedalSwing>. This page blanks the page behind it (z-30) and lists the
 * achievements on top (z-50), clear of where the medal comes to rest.
 */
export default function AchievementsPage() {
  return (
    <>
      <div aria-hidden className="fixed inset-0 z-30 bg-bg" />
      <MedalSwing />
      <Link
        href="/"
        className="fixed left-gutter top-6 z-50 font-label text-sm uppercase tracking-wider underline-offset-4 hover:underline"
      >
        ← back to the space
      </Link>
      <section className="pointer-events-none relative z-50 flex min-h-[calc(100dvh-var(--spacing-header))] flex-col justify-center px-gutter pb-16 pt-[220px] md:w-3/5 md:pt-16">
        <h1 className="mb-10 font-display text-5xl font-normal tracking-[-0.06em] md:text-7xl">achievements</h1>
        <ol className="pointer-events-auto">
          {achievements.map((achievement, i) => {
            const row = (
              <>
                <span className="w-10 shrink-0 font-label text-xs text-ink-muted">{pad(i + 1)}</span>
                <span className="flex-1 font-display text-2xl tracking-[-0.04em] md:text-3xl">{achievement.title}</span>
                <span className="text-right text-sm text-ink-muted">
                  {achievement.issuer}
                  <br />
                  {achievement.year}
                </span>
              </>
            );
            const className = "flex items-baseline gap-4 border-t border-line py-4";
            return (
              <li key={achievement.id}>
                {achievement.href ? (
                  <a href={achievement.href} className={`${className} transition-colors hover:text-accent`}>
                    {row}
                  </a>
                ) : (
                  <div className={className}>{row}</div>
                )}
              </li>
            );
          })}
        </ol>
      </section>
    </>
  );
}
