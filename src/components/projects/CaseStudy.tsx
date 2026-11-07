"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type CSSProperties, useCallback, useEffect } from "react";
import { useLaptopDocks } from "@/components/laptop/stage";
import type { Project } from "@/content/projects";
import { openedFrom } from "./back";
import { ProjectVideo } from "./ProjectMedia";

const pad = (n: number) => String(n).padStart(2, "0");

type Props = {
  project: Project;
  /** Its place among all projects, from 1. */
  number: number;
  total: number;
  previous: Project | null;
  next: Project | null;
};

/** Back to the projects, which have this one selected. In history if that's where we came from. */
export function useBackToProjects() {
  const router = useRouter();
  return useCallback(() => {
    if (openedFrom.gallery) {
      openedFrom.gallery = false;
      router.back();
    } else router.push("/projects/");
  }, [router]);
}

/**
 * A project's case study on a phone, as its own scrolling page. (On desktop it opens in a
 * window on the laptop instead; see Desktop.) The bar along the top stays put with the way
 * back and the projects either side.
 */
export function CaseStudy({ project, number, total, previous, next }: Props) {
  const reducedMotion = useReducedMotion();
  const back = useBackToProjects();
  // Where the laptop opens, the case study is a window on its screen instead.
  const docks = useLaptopDocks();

  useEffect(() => {
    if (docks) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [back, docks]);

  // Each case study opens at its top, including when moving between them.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [project.id]);

  if (docks) return null;
  const sibling = (target: Project | null, direction: "previous" | "next") =>
    target ? (
      <Link
        href={`/projects/${target.id}/`}
        replace
        scroll={false}
        className={`flex min-w-0 items-center gap-2 underline-offset-4 hover:text-blue ${direction === "next" ? "justify-end text-right" : ""}`}
      >
        {direction === "previous" && <span aria-hidden>←</span>}
        <span className="min-w-0 truncate">
          <span className="sr-only">{direction === "previous" ? "Previous project: " : "Next project: "}</span>
          {target.title}
        </span>
        {direction === "next" && <span aria-hidden>→</span>}
      </Link>
    ) : (
      <span />
    );

  return (
    <motion.article
      key={project.id}
      className="min-h-dvh bg-bg"
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Has its own bar, so the site's link bar hides (see LinkBar). */}
      <div data-own-links hidden />
      <nav
        aria-label="Projects"
        className="sticky top-0 z-10 grid grid-cols-2 items-center gap-x-4 gap-y-3 border-b border-line bg-bg/90 px-gutter py-3 font-label text-xs uppercase tracking-wider backdrop-blur-md"
      >
        <button type="button" onClick={back} className="flex w-fit items-center gap-2 underline-offset-4 hover:underline">
          ← All projects
        </button>
        <p className="text-right tabular-nums text-ink-muted">
          {pad(number)} / {pad(total)}
        </p>
        <div className="col-span-2 grid grid-cols-2 gap-6">
          {sibling(previous, "previous")}
          {sibling(next, "next")}
        </div>
      </nav>
      <CaseStudyBody project={project} number={number} next={next} />
    </motion.article>
  );
}

/** The case study itself: title, video, details, then Overview / Problem / Process / Outcome. Shared by the phone page and the Mac window. */
export function CaseStudyBody({ project, number, next }: { project: Project; number: number; next: Project | null }) {
  const { caseStudy } = project;
  const details: [string, React.ReactNode][] = [
    ["Role", caseStudy.role],
    ["Duration", caseStudy.duration],
    ["Tools", caseStudy.tools.join(", ")],
    ["Tags", project.tags.join(", ")],
  ];
  return (
    <>
      <header className="px-gutter pb-10 pt-12 md:pt-14">
        <p className="font-label text-xs uppercase tracking-wider text-ink-muted">
          [{pad(number)}] {project.kind} · {project.year}
        </p>
        <h1 className="mt-3 font-serif text-6xl leading-[0.9] tracking-[-0.02em] text-blue md:text-[8rem]">
          {project.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted md:text-xl">{project.summary}</p>
      </header>

      <div className="px-gutter">
        <ProjectVideo project={project} />
      </div>

      <dl className="mx-gutter mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-y border-line py-6 md:grid-cols-[repeat(4,1fr)_auto]">
        {details.map(([term, detail]) => (
          <div key={term}>
            <dt className="font-label text-xs uppercase tracking-wider text-ink-muted">{term}</dt>
            <dd className="mt-1">{detail}</dd>
          </div>
        ))}
        {project.href && (
          <a
            href={project.href}
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-2 self-center font-label text-sm uppercase tracking-wider text-blue underline-offset-4 hover:underline md:col-span-1"
          >
            View project ↗
          </a>
        )}
      </dl>

      <div className="flex flex-col gap-14 px-gutter py-16 md:gap-20 md:py-20">
        {caseStudy.sections.map((section, i) => (
          <section key={section.heading} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-10">
            <h2 className="font-label text-xs uppercase tracking-wider text-ink-muted md:pt-2">
              {pad(i + 1)} {section.heading}
            </h2>
            <div className="flex max-w-[62ch] flex-col gap-4">
              {section.title && (
                <h3 className="font-serif text-4xl leading-none tracking-[-0.01em] text-ink md:text-5xl">{section.title}</h3>
              )}
              {section.body.map((paragraph) => (
                <p key={paragraph} className="text-lg leading-relaxed md:text-xl">
                  {paragraph}
                </p>
              ))}
            </div>
            {section.images && (
              <div
                className="grid items-start gap-4 md:col-span-2 md:gap-6 md:[grid-template-columns:var(--columns)]"
                // Each screen gets room in proportion to its width, so a phone sits narrow beside a desktop.
                style={{ "--columns": section.images.map((image) => `${image.width}fr`).join(" ") } as CSSProperties}
              >
                {section.images.map((image) => (
                  // Already sized webp screens with dimensions set; next/image would add little here.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={image.src}
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    loading="lazy"
                    className="h-auto w-full rounded-md border border-line"
                  />
                ))}
              </div>
            )}
            {section.video && (
              <video
                src={section.video.src}
                poster={section.video.poster}
                title={section.video.title}
                width={section.video.width}
                height={section.video.height}
                controls
                playsInline
                preload="none"
                className="h-auto w-full rounded-md border border-line bg-ink md:col-span-2"
              />
            )}
          </section>
        ))}
      </div>

      {next && (
        <Link href={`/projects/${next.id}/`} replace scroll={false} className="group block border-t border-line px-gutter py-12 md:py-14">
          <span className="font-label text-xs uppercase tracking-wider text-ink-muted">Next project</span>
          <span className="mt-2 block font-serif text-5xl leading-none tracking-[-0.02em] text-ink transition-colors group-hover:text-blue md:text-7xl">
            {next.title} →
          </span>
        </Link>
      )}
    </>
  );
}
