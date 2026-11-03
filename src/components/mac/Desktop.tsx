"use client";

import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import type { Project } from "@/content/projects";
import { Browser, BrowserToolbar } from "./apps/Browser";
import { CaseStudy } from "./apps/CaseStudy";
import { Finder, FinderToolbar } from "./apps/Finder";
import { PhotoBooth } from "./apps/PhotoBooth";
import { ProjectVideo } from "./apps/ProjectVideo";
import { Trash } from "./apps/Trash";
import { irelandMenuBar, useNow } from "./clock";
import { Dock } from "./Dock";
import { AppleLogo, BrowserIcon, FinderIcon, FolderIcon, PhotoBoothIcon, TrashIcon } from "./icons";
import { Window, type Rect } from "./Window";

type App = "finder" | "photobooth" | "browser" | "trash" | "video" | "study";

type Win = {
  id: string;
  app: App;
  title: string;
  rect: Rect;
  z: number;
  minimised: boolean;
  zoomed: boolean;
  project?: Project;
};

/** Menu bar name for each app. */
const APP_NAMES: Record<App, string> = {
  finder: "Finder",
  photobooth: "Photo Booth",
  browser: "Firefox",
  trash: "Finder",
  video: "QuickTime Player",
  study: "TextEdit",
};

/** Where each kind of window first opens, in logical px. */
const OPEN_AT: Record<App, Rect> = {
  finder: { x: 300, y: 120, width: 760, height: 440 },
  photobooth: { x: 380, y: 80, width: 680, height: 540 },
  browser: { x: 200, y: 70, width: 980, height: 620 },
  trash: { x: 420, y: 170, width: 600, height: 360 },
  video: { x: 90, y: 90, width: 840, height: 520 },
  study: { x: 960, y: 70, width: 420, height: 600 },
};

type Props = {
  projects: Project[];
  size: { width: number; height: number };
};

/** The desktop: menu bar, one Projects folder, windows, and the Dock. */
export function Desktop({ projects, size }: Props) {
  const router = useRouter();
  const now = useNow();
  const [windows, setWindows] = useState<Win[]>([]);
  const [bounces, setBounces] = useState<Partial<Record<App, number>>>({});
  const [folderSelected, setFolderSelected] = useState(false);

  const focused = windows.filter((w) => !w.minimised).sort((a, b) => b.z - a.z)[0];
  const update = (id: string, patch: Partial<Win>) =>
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  // Stacking order: raising or opening a window puts it above everything else.
  const above = (ws: Win[]) => Math.max(0, ...ws.map((w) => w.z)) + 1;
  const raise = (id: string) =>
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, z: above(ws), minimised: false } : w)));
  const close = (id: string) => setWindows((ws) => ws.filter((w) => w.id !== id));

  const open = (app: App, title: string, id: string = app, project?: Project) => {
    if (windows.some((w) => w.id === id)) return raise(id);
    setWindows((ws) => [
      ...ws,
      { id, app, title, rect: OPEN_AT[app], z: above(ws), minimised: false, zoomed: false, project },
    ]);
    if (app in DOCK_APPS) setBounces((b) => ({ ...b, [app]: (b[app] ?? 0) + 1 }));
  };

  const openProject = (project: Project) => {
    open("video", `${project.title} — Demo.mp4`, `video-${project.id}`, project);
    open("study", `${project.title} — Case Study`, `study-${project.id}`, project);
  };

  // Escape closes the front window; with none open, it leaves the Mac.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (focused) close(focused.id);
      else router.push("/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focused, router]);

  const content = (w: Win): { body: ReactNode; toolbar?: ReactNode; dark?: boolean } => {
    switch (w.app) {
      case "finder":
        return { body: <Finder projects={projects} onOpen={openProject} />, toolbar: <FinderToolbar title="Projects" /> };
      case "photobooth":
        return { body: <PhotoBooth />, dark: true };
      case "browser":
        return { body: <Browser />, toolbar: <BrowserToolbar /> };
      case "trash":
        return { body: <Trash />, toolbar: <FinderToolbar title="Trash" /> };
      case "video":
        return { body: <ProjectVideo project={w.project!} />, dark: true };
      case "study":
        return { body: <CaseStudy project={w.project!} /> };
    }
  };

  const running = (app: App) => windows.some((w) => w.app === app);
  const dockItem = (app: keyof typeof DOCK_APPS) => ({
    id: app,
    label: DOCK_APPS[app].label,
    icon: DOCK_APPS[app].icon,
    running: running(app),
    bounce: bounces[app] ?? 0,
    onClick: () => open(app, DOCK_APPS[app].title),
  });

  return (
    <div className="absolute inset-0" onPointerDown={() => setFolderSelected(false)}>
      {/* Menu bar */}
      <div className="absolute inset-x-0 top-0 z-[1000] flex h-[30px] items-center gap-5 bg-white/25 px-4 text-[13px] text-white backdrop-blur-2xl [text-shadow:0_0_6px_rgba(0,0,0,0.2)]">
        <AppleLogo className="h-[16px] w-[16px]" />
        <span className="font-bold">{APP_NAMES[focused?.app ?? "finder"]}</span>
        {["File", "Edit", "View", "Go", "Window", "Help"].map((item) => (
          <span key={item}>{item}</span>
        ))}
        <span className="ml-auto flex items-center gap-4">
          <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="currentColor" aria-hidden>
            <path d="M12 18.5a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2zm-4.6-3.4a6.6 6.6 0 0 1 9.2 0l-1.4 1.5a4.6 4.6 0 0 0-6.4 0zM4 11.7a11.4 11.4 0 0 1 16 0l-1.4 1.4a9.4 9.4 0 0 0-13.2 0zM.6 8.3a16.2 16.2 0 0 1 22.8 0L22 9.7a14.2 14.2 0 0 0-20 0z" />
          </svg>
          <span className="flex h-[11px] w-[22px] items-center rounded-[3px] border border-current p-[1px]">
            <span className="h-full w-[75%] rounded-[1px] bg-current" />
          </span>
          <span>{now && irelandMenuBar(now)}</span>
        </span>
      </div>

      {/* The one thing on the desktop */}
      <button
        type="button"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => {
          setFolderSelected(true);
          open("finder", "Projects");
        }}
        className="absolute right-[24px] top-[48px] flex w-[96px] flex-col items-center gap-[4px]"
      >
        <span className={`rounded-[6px] p-[4px] ${folderSelected ? "bg-black/25" : ""}`}>
          <FolderIcon className="h-[56px] w-[68px] drop-shadow-[0_2px_3px_rgba(0,0,0,0.25)]" />
        </span>
        <span
          className={`rounded-[4px] px-[5px] text-[13px] font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)] ${
            folderSelected ? "bg-[#0a64d8] [text-shadow:none]" : ""
          }`}
        >
          Projects
        </span>
      </button>

      <AnimatePresence>
        {windows
          .filter((w) => !w.minimised)
          .map((w) => {
            const { body, toolbar, dark } = content(w);
            return (
              <Window
                key={w.id}
                title={w.title}
                rect={w.rect}
                z={w.z}
                focused={w.id === focused?.id}
                zoomed={w.zoomed}
                bounds={size}
                dark={dark}
                toolbar={toolbar}
                onFocus={() => w.id !== focused?.id && raise(w.id)}
                onMove={(rect) => update(w.id, { rect })}
                onClose={() => close(w.id)}
                onMinimise={() => update(w.id, { minimised: true })}
                onZoom={() => update(w.id, { zoomed: !w.zoomed })}
              >
                {body}
              </Window>
            );
          })}
      </AnimatePresence>

      <div className="absolute inset-0 z-[999] pointer-events-none">
        <Dock
          apps={(["finder", "photobooth", "browser"] as const).map(dockItem)}
          trash={dockItem("trash")}
        />
      </div>
    </div>
  );
}

const DOCK_APPS = {
  finder: { label: "Finder", title: "Projects", icon: <FinderIcon className="h-full w-full" /> },
  photobooth: { label: "Photo Booth", title: "Photo Booth", icon: <PhotoBoothIcon className="h-full w-full" /> },
  browser: { label: "Firefox", title: "Firefox", icon: <BrowserIcon className="h-full w-full" /> },
  trash: { label: "Trash", title: "Trash", icon: <TrashIcon className="h-full w-full" /> },
};
