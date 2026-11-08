"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import type { Achievement } from "@/content/achievements";

const pad = (n: number) => String(n).padStart(2, "0");

/** The achievements, each opening in place to tell the story, with pictures and links to the project. */
export function AchievementList({ achievements }: { achievements: Achievement[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <ol className="pointer-events-auto">
      {achievements.map((achievement, i) => {
        const expanded = open === achievement.id;
        const panel = `achievement-${achievement.id}`;
        return (
          <li key={achievement.id} className="border-t border-line last:border-b">
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={panel}
              onClick={() => setOpen(expanded ? null : achievement.id)}
              className="group flex w-full items-baseline gap-4 py-4 text-left"
            >
              <span className="w-10 shrink-0 font-label text-xs text-ink-muted">{pad(i + 1)}</span>
              <span className="flex-1 font-display text-2xl tracking-[-0.04em] transition-colors group-hover:text-accent md:text-3xl">
                {achievement.title}
              </span>
              <span className="text-right text-sm text-ink-muted">
                {achievement.issuer}
                <br />
                {achievement.year}
              </span>
              <span aria-hidden className={`w-4 shrink-0 text-ink-muted transition-transform ${expanded ? "rotate-45" : ""}`}>
                +
              </span>
            </button>
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  id={panel}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-4 pb-6 pl-14">
                    {achievement.story.map((paragraph) => (
                      <p key={paragraph} className="max-w-[60ch] leading-relaxed text-ink">
                        {paragraph}
                      </p>
                    ))}
                    {achievement.images.length > 0 && (
                      <div className="flex gap-3 overflow-x-auto">
                        {achievement.images.map((image) => (
                          // Already sized webp images from the case studies.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={image.src}
                            src={image.src}
                            alt={image.alt}
                            loading="lazy"
                            className="h-40 w-auto shrink-0 rounded-md border border-line object-cover md:h-48"
                          />
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-x-6 gap-y-2 font-label text-xs uppercase tracking-wider">
                      {achievement.href && (
                        <Link href={achievement.href} className="text-blue underline-offset-4 hover:underline">
                          read the case study →
                        </Link>
                      )}
                      {achievement.links?.map((link) => (
                        <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
                          {link.label} ↗
                        </a>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ol>
  );
}
