"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
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

      <Sections project={project} />

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

type Section = Project["caseStudy"]["sections"][number];
type Image = NonNullable<Section["images"]>[number];

const slug = (project: Project, i: number) => `${project.id}-section-${i + 1}`;

/**
 * The case study's sections, with a contents column down the left on wide screens that
 * follows the reading position and jumps to a section when clicked.
 */
function Sections({ project }: { project: Project }) {
  const { sections } = project.caseStudy;
  const [active, setActive] = useState(0);
  const list = useRef<HTMLDivElement>(null);

  // The section crossing the upper third of the view is the one being read.
  useEffect(() => {
    const elements = [...(list.current?.querySelectorAll<HTMLElement>("[data-section]") ?? [])];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.section));
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [project.id]);

  const jump = (i: number) => document.getElementById(slug(project, i))?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="px-gutter py-16 md:grid md:grid-cols-[180px_minmax(0,1fr)] md:gap-12 md:py-20 lg:grid-cols-[220px_minmax(0,1fr)]">
      <nav aria-label="Sections" className="sticky top-20 hidden self-start md:block">
        <ol className="flex flex-col border-l border-line">
          {sections.map((section, i) => (
            <li key={section.heading}>
              <button
                type="button"
                onClick={() => jump(i)}
                aria-current={active === i ? "location" : undefined}
                className={`-ml-px flex w-full gap-2 border-l-2 py-[6px] pl-4 text-left font-label text-xs uppercase tracking-wider transition-colors ${
                  active === i ? "border-blue text-ink" : "border-transparent text-ink-muted hover:text-ink"
                }`}
              >
                <span className="tabular-nums">{pad(i + 1)}</span>
                {section.heading}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div ref={list} className="flex min-w-0 flex-col gap-16 md:gap-24">
        {sections.map((section, i) => (
          <section key={section.heading} id={slug(project, i)} data-section={i} className="flex scroll-mt-20 flex-col gap-5">
            <h2 className="font-label text-xs uppercase tracking-wider text-ink-muted">
              {pad(i + 1)} {section.heading}
            </h2>
            {section.title && (
              <h3 className="max-w-[24ch] font-display text-3xl font-medium leading-[1.05] tracking-[-0.03em] text-ink md:text-[2.6rem]">
                {section.title}
              </h3>
            )}
            {section.body.length > 0 && (
              <div className="flex max-w-[64ch] flex-col gap-4">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-lg leading-relaxed md:text-xl">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
            {section.images && (
              <div
                className="mt-2 grid items-start gap-4 md:gap-6 md:[grid-template-columns:var(--columns)]"
                // Each screen gets room in proportion to its width, so a phone sits narrow beside a desktop.
                style={{ "--columns": section.images.map((image) => `${Math.min(image.width, 1440)}fr`).join(" ") } as CSSProperties}
              >
                {section.images.map((image) => (
                  <Figure key={image.src} image={image} />
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
                className="mt-2 h-auto w-full rounded-md border border-line bg-ink"
              />
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

/** Phones are shown a screen tall, desktops a little wider than tall; longer pages scroll inside the frame on hover. */
const PHONE_SCREEN = 2.2;
const DESKTOP_SCREEN = 0.8;

/**
 * One screenshot or board. Never drawn wider than it was captured, so small exports stay
 * sharp; full-length pages sit in a frame that pans down them on hover, with a link to the whole thing.
 */
function Figure({ image }: { image: Image }) {
  const phone = image.width < 700;
  const frame = image.width * (phone ? PHONE_SCREEN : DESKTOP_SCREEN);
  const long = image.height > frame * 1.15;
  // Big boards are drawn up to their width; a 1× export is never stretched past it.
  const style = { maxWidth: image.width };
  const img = (
    // Already sized webp screens with dimensions set; next/image would add little here.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      loading="lazy"
      className={long ? "absolute inset-x-0 top-0 h-auto w-full transition-transform ease-in-out group-hover:[transform:translateY(var(--pan))]" : "h-auto w-full rounded-md border border-line"}
      style={long ? ({ transitionDuration: `${Math.round((image.height / frame) * 1.6)}s` } as CSSProperties) : undefined}
    />
  );
  if (!long) return <div className="mx-auto w-full" style={style}>{img}</div>;
  return (
    <figure className="group relative mx-auto w-full" style={style}>
      <div
        className="relative w-full overflow-hidden rounded-md border border-line bg-white"
        style={{ aspectRatio: `${image.width} / ${frame}`, "--pan": `-${(1 - frame / image.height) * 100}%` } as CSSProperties}
      >
        {img}
      </div>
      <figcaption className="mt-2 flex justify-between gap-4 font-label text-[11px] uppercase tracking-wider text-ink-muted">
        <span>hover to scroll</span>
        <a href={image.src} target="_blank" rel="noopener noreferrer" className="hover:text-blue">
          full page ↗
        </a>
      </figcaption>
    </figure>
  );
}
