"use client";

import { useState } from "react";
import type { Project } from "@/content/projects";
import { FolderIcon } from "../icons";

const SIDEBAR = [
  { group: "Favourites", items: ["Recents", "Applications", "Desktop", "Projects", "Downloads"] },
  { group: "Locations", items: ["Macintosh HD"] },
];

export function FinderToolbar({ title }: { title: string }) {
  return (
    <div className="flex flex-1 items-center gap-3 pl-[118px]">
      <span className="text-[18px] leading-none text-black/30">‹</span>
      <span className="text-[18px] leading-none text-black/20">›</span>
      <p className="text-[13px] font-semibold">{title}</p>
    </div>
  );
}

/** Finder, open on the Projects folder: one folder per project. Click a folder to open it. */
export function Finder({ projects, onOpen }: { projects: Project[]; onOpen: (project: Project) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="flex h-full text-[13px]">
      <nav aria-label="Sidebar" className="w-[150px] shrink-0 bg-[#f1f1f3]/90 px-2 py-3">
        {SIDEBAR.map(({ group, items }) => (
          <div key={group} className="mb-3">
            <p className="px-2 pb-1 text-[11px] font-semibold text-black/40">{group}</p>
            {items.map((item) => (
              <p
                key={item}
                className={`rounded-[5px] px-2 py-[3px] ${item === "Projects" ? "bg-black/10 font-medium" : "text-black/80"}`}
              >
                {item}
              </p>
            ))}
          </div>
        ))}
      </nav>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="grid grid-cols-[1fr_120px_70px_130px] border-b border-black/10 px-3 py-1 text-[11px] text-black/50">
          <span>Name</span>
          <span>Date Modified</span>
          <span>Size</span>
          <span>Kind</span>
        </div>
        <ul className="flex-1 overflow-auto py-1">
          {projects.map((project, i) => (
            <li key={project.id}>
              <button
                type="button"
                onClick={() => {
                  setSelected(project.id);
                  onOpen(project);
                }}
                className={`grid w-full grid-cols-[1fr_120px_70px_130px] items-center px-3 py-[3px] text-left ${
                  selected === project.id ? "bg-[#0a64d8] text-white" : i % 2 ? "bg-[#f4f5f5]" : ""
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <FolderIcon className="h-[15px] w-[18px] shrink-0" />
                  {project.title}
                </span>
                <span className={selected === project.id ? "" : "text-black/50"}>{project.year}</span>
                <span className={selected === project.id ? "" : "text-black/50"}>--</span>
                <span className={selected === project.id ? "" : "text-black/50"}>Folder</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="border-t border-black/10 px-3 py-1 text-center text-[11px] text-black/50">
          {projects.length} items
        </p>
      </div>
    </div>
  );
}
