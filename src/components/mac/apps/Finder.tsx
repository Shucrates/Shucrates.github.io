"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { experience } from "@/content/experience";
import { projects as allProjects, TAGS, type Project, type Tag } from "@/content/projects";

/** A tag, all projects, or the Experience folder (roles, not projects). */
export type Filter = Tag | "All" | "Experience";

/** Finder's tag colours. */
const TAG_COLOURS: Record<Tag, string> = {
  Design: "bg-[#bf5af2]",
  "Web/App": "bg-[#0a84ff]",
  "AI/ML": "bg-[#30d158]",
  Research: "bg-[#ff9f0a]",
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Which projects the gallery shows (by tag) and which one is selected. Shared by Finder's toolbar
 * and window. `open` is the case study on screen, if any: coming back, the gallery has it selected.
 * `from` is where it was when the laptop went to sleep, if it did.
 */
export function useGallery(projects: Project[], open: string | null, from: { filter: Filter; selected: string | null } | null) {
  const [filter, setFilter] = useState<Filter>(from?.filter ?? "All");
  const [chosen, setChosen] = useState<string | null>(open ?? from?.selected ?? null);
  // Following the case study as it moves on, even to a project the filter hides.
  const [followed, setFollowed] = useState(open);
  if (open !== followed) {
    setFollowed(open);
    if (open) {
      setChosen(open);
      const project = projects.find((p) => p.id === open);
      if (project && filter !== "All" && !project.tags.includes(filter as Tag)) setFilter("All");
    }
  }
  const list = filter === "Experience" ? [] : filter === "All" ? projects : projects.filter((project) => project.tags.includes(filter as Tag));
  // A filter that hides the selection selects its first project instead.
  const index = Math.max(0, list.findIndex((project) => project.id === chosen));
  const project = list[index] ?? null;

  const go = (step: number) => {
    const next = list[index + step];
    if (next) setChosen(next.id);
  };
  return {
    filter,
    setFilter,
    list,
    index,
    project,
    select: (project: Project) => setChosen(project.id),
    /** Shows a project in the Projects folder, from the Experience folder. */
    reveal: (id: string) => {
      setFilter("All");
      setChosen(id);
    },
    previous: () => go(-1),
    next: () => go(1),
  };
}

export type Gallery = ReturnType<typeof useGallery>;

type ToolbarProps = {
  title: string;
  onBack?: () => void;
  onForward?: () => void;
  /** Right-hand end, e.g. the gallery's "03 / 12". */
  trailing?: ReactNode;
};

/** Finder's title bar: back and forward, the folder's name, and anything on the right. */
export function FinderToolbar({ title, onBack, onForward, trailing }: ToolbarProps) {
  const chevron = "flex h-[26px] w-[22px] items-center justify-center rounded-[5px] text-[20px] leading-none enabled:hover:bg-black/5 disabled:text-black/20";
  return (
    <div className="flex flex-1 items-center gap-1 pl-[110px] pr-2">
      <button type="button" aria-label="Previous project" disabled={!onBack} onClick={onBack} className={`${chevron} text-black/60`}>
        ‹
      </button>
      <button type="button" aria-label="Next project" disabled={!onForward} onClick={onForward} className={`${chevron} text-black/60`}>
        ›
      </button>
      <p className="ml-2 text-[13px] font-semibold">{title}</p>
      {trailing && <div className="ml-auto">{trailing}</div>}
    </div>
  );
}

/** The gallery's toolbar: back and forward step through projects, with where you are on the right. */
export function GalleryToolbar({ gallery }: { gallery: Gallery }) {
  const { filter, list, index, previous, next } = gallery;
  return (
    <FinderToolbar
      title={filter === "All" ? "Projects" : filter}
      onBack={index > 0 ? previous : undefined}
      onForward={index < list.length - 1 ? next : undefined}
      trailing={
        <p className="font-mono text-[12px] tabular-nums text-black/50" aria-live="polite">
          {filter === "Experience" ? "" : list.length ? `${pad(index + 1)} / ${pad(list.length)}` : "00 / 00"}
        </p>
      }
    />
  );
}

type Props = {
  gallery: Gallery;
  /** The front window, with nothing over it: arrow keys, Space and Return are its. */
  active: boolean;
  /** Hidden behind Quick Look or a case study: the preview stops playing. */
  paused: boolean;
  onOpen: (project: Project) => void;
  onQuickLook: (project: Project) => void;
};

/**
 * Finder in Gallery view on the Projects folder: tags down the side, the selected project
 * playing big, a filmstrip of the rest under it, and its details on the right.
 * ←/→ step through, Space takes a quick look, Return (or a double click) opens it.
 */
export function Finder({ gallery, active, paused, onOpen, onQuickLook }: Props) {
  const { filter, setFilter, list, select, previous, next } = gallery;
  const project = filter === "Experience" ? null : gallery.project;
  const strip = useRef<HTMLDivElement>(null);
  const thumbs = useRef<Record<string, HTMLDivElement | null>>({});
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        if (event.key === "ArrowLeft") previous();
        else next();
        return;
      }
      // Buttons keep their own Space and Return.
      if (!project || (event.target as HTMLElement).closest("button, a")) return;
      if (event.key === " ") {
        event.preventDefault();
        onQuickLook(project);
      } else if (event.key === "Enter" || (event.metaKey && event.key === "ArrowDown")) {
        event.preventDefault();
        onOpen(project);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, project, previous, next, onOpen, onQuickLook]);

  // Keep the selected thumbnail in the middle of the filmstrip. Not scrollIntoView, which
  // would also scroll the screen itself.
  useEffect(() => {
    const thumb = project && thumbs.current[project.id];
    const container = strip.current;
    if (!thumb || !container) return;
    container.scrollTo({
      left: thumb.offsetLeft - container.clientWidth / 2 + thumb.offsetWidth / 2,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [project, reducedMotion]);

  return (
    <div className="flex h-full text-[13px]">
      <nav aria-label="Tags" className="flex w-[180px] shrink-0 flex-col gap-4 bg-[#f1f1f3]/90 px-2 py-3">
        <div>
          <p className="px-2 pb-1 text-[11px] font-semibold text-black/40">Favourites</p>
          {["Recents", "Applications", "Desktop", "Downloads"].map((item) => (
            <p key={item} className="px-2 py-[3px] text-black/35">
              {item}
            </p>
          ))}
        </div>
        <div>
          <p className="px-2 pb-1 text-[11px] font-semibold text-black/40">Locations</p>
          <button
            type="button"
            aria-pressed={filter === "Experience"}
            onClick={() => setFilter("Experience")}
            className={`flex w-full items-center gap-2 rounded-[5px] px-2 py-[3px] text-left ${
              filter === "Experience" ? "bg-black/10 font-medium" : "text-black/80 hover:bg-black/5"
            }`}
          >
            <span aria-hidden className="text-[12px] text-[#0a84ff]">▣</span>
            Experience
          </button>
        </div>
        <div>
          <p className="px-2 pb-1 text-[11px] font-semibold text-black/40">Tags</p>
          {(["All", ...TAGS] as const).map((tag) => (
            <button
              key={tag}
              type="button"
              aria-pressed={filter === tag}
              onClick={() => setFilter(tag)}
              className={`flex w-full items-center gap-2 rounded-[5px] px-2 py-[3px] text-left ${
                filter === tag ? "bg-black/10 font-medium" : "text-black/80 hover:bg-black/5"
              }`}
            >
              <span
                aria-hidden
                className={`h-[10px] w-[10px] rounded-full ${tag === "All" ? "border border-black/40" : TAG_COLOURS[tag]}`}
              />
              {tag === "All" ? "All Projects" : tag}
            </button>
          ))}
        </div>
      </nav>

      <div className="flex min-w-0 flex-1 flex-col bg-white">
        {filter === "Experience" ? (
          <Experience
            onPick={gallery.reveal}
          />
        ) : project ? (
          <>
            <div className="relative min-h-0 flex-1 p-6">
              <AnimatePresence initial={false}>
                <motion.div
                  key={project.id}
                  className="absolute inset-6 flex items-center justify-center [container-type:size]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <button
                    type="button"
                    aria-label={`Open ${project.title}`}
                    onClick={() => onOpen(project)}
                    className="aspect-video w-[min(100cqw,calc(100cqh*16/9))] overflow-hidden rounded-[8px] bg-black shadow-[0_8px_30px_rgba(0,0,0,0.18)]"
                  >
                    <Preview project={project} still={!!reducedMotion} paused={paused} />
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>
            <div
              ref={strip}
              role="listbox"
              aria-label="Projects"
              aria-activedescendant={`thumb-${project.id}`}
              tabIndex={0}
              className="relative shrink-0 overflow-x-auto border-t border-black/10 px-4 py-3 [scrollbar-width:none] focus-visible:outline-offset-[-3px]!"
            >
              <div className="mx-auto flex w-max gap-[10px]">
                {list.map((item) => (
                  <div
                    key={item.id}
                    id={`thumb-${item.id}`}
                    ref={(element) => {
                      thumbs.current[item.id] = element;
                    }}
                    role="option"
                    aria-selected={item.id === project.id}
                    aria-label={item.title}
                    onClick={() => select(item)}
                    onDoubleClick={() => onOpen(item)}
                    className={`h-[72px] w-[128px] cursor-default overflow-hidden rounded-[6px] border-[3px] ${
                      item.id === project.id ? "border-[#0a84ff]" : "border-transparent opacity-80 hover:opacity-100"
                    }`}
                  >
                    <Still project={item} />
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <p className="m-auto text-black/40">No projects tagged {filter} yet</p>
        )}
      </div>

      {project && <Info project={project} onOpen={() => onOpen(project)} onQuickLook={() => onQuickLook(project)} />}
    </div>
  );
}

/** Finder's Experience folder: where I've worked, each role linking to its case studies in Projects. */
function Experience({ onPick }: { onPick: (id: string) => void }) {
  return (
    <div className="h-full overflow-y-auto px-8 py-7">
      <h2 className="text-[22px] font-semibold tracking-[-0.02em]">Experience</h2>
      <ol className="mt-5">
        {experience.map((role) => (
          <li key={role.id} className="grid grid-cols-[160px_minmax(0,1fr)] gap-6 border-t border-black/10 py-5">
            <div className="text-[12px] text-black/50">
              <p className="font-medium text-black/70">{role.dates}</p>
              <p>{role.place}</p>
            </div>
            <div>
              <p className="text-[15px] font-semibold">{role.title}</p>
              <p className="text-black/55">{role.company}</p>
              <p className="mt-2 max-w-[60ch] leading-relaxed text-black/75">{role.summary}</p>
              {role.projects.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {role.projects.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onPick(id)}
                      className="flex items-center gap-1 rounded-[6px] border border-black/10 bg-[#f5f5f7] px-[10px] py-[4px] font-medium hover:bg-[#0a84ff] hover:text-white"
                    >
                      <span aria-hidden>📁</span> {projectTitle(id)} →
                    </button>
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

const projectTitle = (id: string) => allProjects.find((project) => project.id === id)?.title ?? id;

/** The selected project, playing muted on a loop; a still under reduced motion. */
function Preview({ project, still, paused }: { project: Project; still: boolean; paused: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (paused) video.current?.pause();
    else video.current?.play().catch(() => {});
  }, [paused]);

  if (!project.video || still) return <Still project={project} large />;
  return (
    <video
      ref={video}
      src={project.video}
      poster={project.poster}
      muted
      loop
      playsInline
      className="h-full w-full object-cover"
    />
  );
}

/** A frame of the project's video: its poster, or the video's first frame, or a title card until there's either. */
function Still({ project, large = false }: { project: Project; large?: boolean }) {
  if (project.poster) {
    // eslint-disable-next-line @next/next/no-img-element -- poster frames are already sized
    return <img src={project.poster} alt="" className="h-full w-full object-cover" draggable={false} />;
  }
  if (project.video) {
    return <video src={`${project.video}#t=0.1`} preload="metadata" muted playsInline className="h-full w-full object-cover" />;
  }
  return (
    <div className="flex h-full w-full flex-col items-start justify-end bg-[linear-gradient(135deg,#2a2a2e,#121214)] text-left text-white">
      <div className={large ? "p-8" : "p-[6px]"}>
        <p className={large ? "text-[13px] text-white/45" : "hidden"}>{project.kind}</p>
        <p className={`font-semibold tracking-[-0.02em] ${large ? "text-[44px] leading-none" : "text-[11px] leading-tight"}`}>
          {project.title}
        </p>
        <p className={large ? "mt-3 text-[12px] text-white/35" : "hidden"}>Video coming soon</p>
      </div>
    </div>
  );
}

/** Finder's preview pane: what the project is, then the details, then ways in. */
function Info({ project, onOpen, onQuickLook }: { project: Project; onOpen: () => void; onQuickLook: () => void }) {
  const { caseStudy } = project;
  const rows: [string, ReactNode][] = [
    ["Kind", project.kind],
    ["Year", project.year],
    ["Role", caseStudy.role],
    ["Duration", caseStudy.duration],
    ["Tools", caseStudy.tools.join(", ")],
    [
      "Tags",
      <span key="tags" className="flex flex-wrap gap-x-3 gap-y-1">
        {project.tags.map((tag) => (
          <span key={tag} className="flex items-center gap-[5px]">
            <span aria-hidden className={`h-[8px] w-[8px] rounded-full ${TAG_COLOURS[tag]}`} />
            {tag}
          </span>
        ))}
      </span>,
    ],
  ];
  return (
    <aside aria-label="Details" className="flex w-[300px] shrink-0 flex-col border-l border-black/10 bg-white px-5 py-6">
      <h2 className="text-[20px] font-semibold leading-tight tracking-[-0.02em]">{project.title}</h2>
      <p className="mt-1 text-black/55">{project.summary}</p>
      <p className="mt-6 border-b border-black/10 pb-1 text-[11px] font-semibold text-black/40">Information</p>
      <dl className="mt-2 grid grid-cols-[72px_1fr] gap-x-3 gap-y-[6px] text-[12px]">
        {rows.map(([term, detail]) => (
          <div key={term} className="contents">
            <dt className="text-black/40">{term}</dt>
            <dd>{detail}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-auto flex flex-col gap-2">
        <button
          type="button"
          onClick={onOpen}
          className="flex h-[30px] items-center justify-center gap-2 rounded-[6px] bg-[#0a84ff] font-medium text-white"
        >
          Open Case Study <kbd className="font-sans text-white/60">⏎</kbd>
        </button>
        <button
          type="button"
          onClick={onQuickLook}
          className="flex h-[30px] items-center justify-center gap-2 rounded-[6px] border border-black/10 bg-[#f5f5f7] font-medium"
        >
          Quick Look <kbd className="font-sans text-black/40">space</kbd>
        </button>
      </div>
    </aside>
  );
}
