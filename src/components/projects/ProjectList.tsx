"use client";

import Link from "next/link";
import { HomeLink } from "@/components/HomeLink";
import { useState } from "react";
import { useLaptopDocks } from "@/components/laptop/stage";
import { TAGS, type Project, type Tag } from "@/content/projects";
import { openedFrom } from "./back";
import { ProjectStill } from "./ProjectMedia";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * /projects on a phone, where there's no laptop to open: the same projects and tags as the
 * desktop's gallery, as a list. Each opens the same case study page.
 * Where the laptop opens, only its heading stays, for screen readers.
 */
export function ProjectList({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<Tag | "All">("All");
  const docks = useLaptopDocks();
  const list = filter === "All" ? projects : projects.filter((project) => project.tags.includes(filter));

  return (
    <section className="px-gutter pb-16 pt-6">
      <h1 className={docks ? "sr-only" : "font-condensed text-6xl leading-none text-blue"}>Projects</h1>
      <div hidden={docks}>
        <HomeLink className="mt-3 block w-fit font-label text-xs uppercase tracking-wider underline-offset-4 hover:underline">
          ← back to the space
        </HomeLink>
        <div role="group" aria-label="Filter by tag" className="-mx-gutter mt-6 flex gap-2 overflow-x-auto px-gutter [scrollbar-width:none]">
          {(["All", ...TAGS] as const).map((tag) => (
            <button
              key={tag}
              type="button"
              aria-pressed={filter === tag}
              onClick={() => setFilter(tag)}
              className={`shrink-0 rounded-pill border px-3 py-1 font-label text-xs uppercase tracking-wider ${
                filter === tag ? "border-ink bg-ink text-bg" : "border-line text-ink-muted"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {list.map((project) => (
            <li key={project.id}>
              <Link
                href={`/projects/${project.id}/`}
                onClick={() => (openedFrom.gallery = true)}
                className="flex items-center gap-4 py-4"
              >
                <span className="aspect-video w-28 shrink-0 overflow-hidden rounded-[10px] [container-type:inline-size]">
                  <ProjectStill project={project} className="h-full w-full" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-label text-[10px] uppercase tracking-wider text-ink-muted">
                    [{pad(projects.indexOf(project) + 1)}] {project.kind} · {project.year}
                  </span>
                  <span className="mt-1 block truncate text-lg font-medium leading-tight">{project.title}</span>
                  <span className="block truncate text-sm text-ink-muted">{project.summary}</span>
                </span>
                <span aria-hidden className="text-ink-muted">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {list.length === 0 && <p className="py-10 text-center text-ink-muted">No projects tagged {filter} yet.</p>}
      </div>
    </section>
  );
}
