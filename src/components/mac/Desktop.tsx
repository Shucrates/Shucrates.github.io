"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CaseStudyBody, useBackToProjects } from "@/components/projects/CaseStudy";
import type { Project } from "@/content/projects";
import { Browser, BrowserToolbar } from "./apps/Browser";
import { Finder, FinderToolbar, GalleryToolbar, useGallery, type Filter } from "./apps/Finder";
import { PhotoBooth } from "./apps/PhotoBooth";
import { QuickLook } from "./apps/QuickLook";
import { Trash } from "./apps/Trash";
import { Alert } from "./Alert";
import { irelandMenuBar, useNow } from "./clock";
import { Dock } from "./Dock";
import { AppleLogo, BrowserIcon, FinderIcon, FolderIcon, PhotoBoothIcon, TrashIcon } from "./icons";
import { Window, type Rect } from "./Window";

type App = "finder" | "photobooth" | "browser" | "trash";

type Win = {
  id: string;
  app: App;
  title: string;
  rect: Rect;
  z: number;
  minimised: boolean;
  zoomed: boolean;
};

/** Menu bar name for each app. */
const APP_NAMES: Record<App, string> = {
  finder: "Finder",
  photobooth: "Photo Booth",
  browser: "Firefox",
  trash: "Finder",
};

/** Where each kind of window first opens, in logical px. */
const OPEN_AT: Record<App, Rect> = {
  finder: { x: 300, y: 120, width: 760, height: 440 },
  photobooth: { x: 380, y: 80, width: 680, height: 540 },
  browser: { x: 200, y: 70, width: 980, height: 620 },
  trash: { x: 420, y: 170, width: 600, height: 360 },
};

/** Seconds the shut down dialog waits before shutting down by itself. */
const SHUT_DOWN_COUNTDOWN = 3;

/** The Mac boots with Finder open on Projects, filling the screen. */
const BOOT: Win[] = [
  { id: "finder", app: "finder", title: "Projects", rect: OPEN_AT.finder, z: 1, minimised: false, zoomed: true },
];

/**
 * What the Mac has open. Kept only when it's put to sleep (the Apple menu, the shut down
 * dialog, or a click off the screen): it wakes as it was. Any other way out (shutting down,
 * the browser's Back, another page) and it boots fresh, into Finder.
 */
export type MacState = { windows: Win[]; filter: Filter; selected: string | null; caseStudy: string | null };
let latest: Omit<MacState, "caseStudy"> | null = null;
let asleep: MacState | null = null;
/**
 * The windows to wake into: as they were, but always with Finder open and in front, even if
 * it was closed or minimised before the laptop slept, so the projects are what you see.
 */
const wake = (windows: Win[]): Win[] => {
  const top = Math.max(0, ...windows.map((w) => w.z)) + 1;
  const finder = windows.find((w) => w.app === "finder");
  if (!finder) return [...windows, { ...BOOT[0], z: top }];
  return windows.map((w) => (w === finder ? { ...w, minimised: false, z: top } : w));
};

/** Called as the laptop goes to sleep, with the case study open at the time, if any. */
export const sleepMac = (caseStudy: string | null) => {
  asleep = latest && { ...latest, caseStudy };
};
/** What to wake into, if the laptop was put to sleep last time. Read on opening; `forgetSleep` clears it. */
export const sleepingMac = () => asleep;
export const forgetSleep = () => {
  asleep = null;
};

type Props = {
  projects: Project[];
  size: { width: number; height: number };
  /** Shutting down: every window closes. Keys and clicks stop doing anything. */
  off: boolean;
  /** Where it was when it went to sleep; null to boot fresh. */
  resumed: MacState | null;
  /** The project whose case study is open (from the route), if any; it opens in a window. */
  caseStudy: string | null;
  onOpenProject: (project: Project) => void;
  onSleep: () => void;
  onShutDown: () => void;
};

/** The desktop: menu bar, one Projects folder, windows, and the Dock. */
export function Desktop({ projects, size, off, resumed, caseStudy, onOpenProject, onSleep, onShutDown }: Props) {
  const now = useNow();
  const [windows, setWindows] = useState<Win[]>(() => (resumed ? wake(resumed.windows) : BOOT));
  const [appleMenu, setAppleMenu] = useState(false);
  const [alert, setAlert] = useState<"shut-down" | "quit" | null>(null);
  const [countdown, setCountdown] = useState(SHUT_DOWN_COUNTDOWN);
  const gallery = useGallery(projects, caseStudy, resumed);
  const [lookingAt, setLookingAt] = useState(false);
  const study = projects.find((project) => project.id === caseStudy) ?? null;
  // Nothing on the Mac takes keys or plays while it's shutting down.
  const idle = off;
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

  const open = (app: App, title: string, id: string = app) => {
    if (windows.some((w) => w.id === id)) return raise(id);
    setWindows((ws) => [...ws, { id, app, title, rect: OPEN_AT[app], z: above(ws), minimised: false, zoomed: false }]);
    if (app in DOCK_APPS) setBounces((b) => ({ ...b, [app]: (b[app] ?? 0) + 1 }));
  };

  const quickLook = () => setLookingAt(true);
  const openProject = (project: Project) => {
    setLookingAt(false);
    onOpenProject(project);
  };

  useEffect(() => {
    latest = { windows, filter: gallery.filter, selected: gallery.project?.id ?? null };
  }, [windows, gallery.filter, gallery.project]);

  // Escape steps back one level at a time: a menu, then the front window, and at Finder it
  // asks to shut down. ⌘Q quits the front app, except Finder, which can't be quit.
  useEffect(() => {
    if (idle || alert || lookingAt) return;
    // The case study window handles its own keys.
    if (study) return;
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "q") {
        event.preventDefault();
        if (focused && focused.app !== "finder") setWindows((ws) => ws.filter((w) => w.app !== focused.app));
        else setAlert("quit");
      }
      if (event.key !== "Escape") return;
      if (appleMenu) setAppleMenu(false);
      else if (focused && focused.app !== "finder") close(focused.id);
      else {
        setCountdown(SHUT_DOWN_COUNTDOWN);
        setAlert("shut-down");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focused, idle, alert, appleMenu, lookingAt, study]);

  // Left alone, the shut down dialog shuts down, as the Mac's does (after a minute there).
  useEffect(() => {
    if (alert !== "shut-down") return;
    if (countdown === 0) return onShutDown();
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [alert, countdown, onShutDown]);

  const content = (w: Win): { body: ReactNode; toolbar?: ReactNode; dark?: boolean } => {
    switch (w.app) {
      case "finder":
        return {
          body: (
            <Finder
              gallery={gallery}
              active={w.id === focused?.id && !alert && !appleMenu && !lookingAt && !idle && !study}
              paused={lookingAt || idle || !!study}
              onOpen={openProject}
              onQuickLook={quickLook}
            />
          ),
          toolbar: <GalleryToolbar gallery={gallery} />,
        };
      case "photobooth":
        return { body: <PhotoBooth />, dark: true };
      case "browser":
        return { body: <Browser />, toolbar: <BrowserToolbar /> };
      case "trash":
        return { body: <Trash />, toolbar: <FinderToolbar title="Trash" /> };
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
    <div
      className={`absolute inset-0 ${off ? "pointer-events-none" : ""}`}
      onPointerDown={() => {
        setFolderSelected(false);
        setAppleMenu(false);
      }}
    >
      {/* Menu bar */}
      <motion.div
        animate={{ opacity: off ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-x-0 top-0 z-[1000] flex h-[30px] items-center gap-5 bg-white/25 px-4 text-[13px] text-white backdrop-blur-2xl [text-shadow:0_0_6px_rgba(0,0,0,0.2)]"
      >
        <AppleMenu
          open={appleMenu}
          onToggle={() => setAppleMenu(!appleMenu)}
          onClose={() => setAppleMenu(false)}
          onSleep={onSleep}
          onShutDown={onShutDown}
        />
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
      </motion.div>

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
          .filter((w) => !w.minimised && !off)
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

      <motion.div
        animate={{ opacity: off ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 z-[999] pointer-events-none"
      >
        <Dock
          apps={(["finder", "photobooth", "browser"] as const).map(dockItem)}
          trash={dockItem("trash")}
        />
      </motion.div>

      <AnimatePresence>
        {study && !off && (
          <CaseStudyWindow key="case-study" project={study} projects={projects} bounds={size} menuOpen={appleMenu || !!alert} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lookingAt && !idle && !study && (
          <QuickLook key="quick-look" gallery={gallery} onClose={() => setLookingAt(false)} onOpen={openProject} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {alert === "shut-down" && !off && (
          <Alert
            key="shut-down"
            icon={<AppleLogo className="h-full w-full text-[#1d1d1f]" />}
            title="Are you sure you want to shut down your computer now?"
            message={`If you do nothing, the computer will shut down automatically in ${countdown} second${countdown === 1 ? "" : "s"}.`}
            actions={[
              { label: "Shut Down", onClick: onShutDown, primary: true },
              { label: "Sleep", onClick: onSleep },
              { label: "Cancel", onClick: () => setAlert(null) },
            ]}
            onCancel={() => setAlert(null)}
          />
        )}
        {alert === "quit" && !off && (
          <Alert
            key="quit"
            icon={<FinderIcon className="h-full w-full" />}
            title="Finder can’t be quit."
            message="It keeps the desktop running."
            actions={[
              { label: "OK", onClick: () => setAlert(null), primary: true },
              { label: "Shut Down Instead", onClick: onShutDown },
            ]}
            onCancel={() => setAlert(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

type CaseStudyWindowProps = {
  project: Project;
  projects: Project[];
  bounds: { width: number; height: number };
  /** A menu or dialog is up: keys are its. */
  menuOpen: boolean;
};

/**
 * A project's case study, in a window over the gallery: it scrolls inside, ‹ › in the toolbar
 * move to the projects either side, and closing it (or Escape) goes back to the gallery.
 * Opened from the route (/projects/[id]), so every case study has its own link.
 */
function CaseStudyWindow({ project, projects, bounds, menuOpen }: CaseStudyWindowProps) {
  const router = useRouter();
  const back = useBackToProjects();
  const [rect, setRect] = useState<Rect>({ x: 120, y: 60, width: 1200, height: 720 });
  const [zoomed, setZoomed] = useState(true);
  const at = projects.indexOf(project);
  const previous = projects[at - 1] ?? null;
  const next = projects[at + 1] ?? null;
  const go = (target: Project | null) => target && router.replace(`/projects/${target.id}/`, { scroll: false });
  const pad = (n: number) => String(n).padStart(2, "0");

  useEffect(() => {
    if (menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [back, menuOpen]);

  return (
    <Window
      title={`${project.title} — Case Study`}
      rect={rect}
      z={900}
      focused
      zoomed={zoomed}
      bounds={bounds}
      toolbar={
        <FinderToolbar
          title={`${project.title} — Case Study`}
          onBack={previous ? () => go(previous) : undefined}
          onForward={next ? () => go(next) : undefined}
          trailing={
            <p className="font-mono text-[12px] tabular-nums text-black/50">
              {pad(at + 1)} / {pad(projects.length)}
            </p>
          }
        />
      }
      onFocus={() => {}}
      onMove={setRect}
      onClose={back}
      onMinimise={back}
      onZoom={() => setZoomed(!zoomed)}
    >
      {/* Keyed, so each case study opens scrolled to its top. */}
      <div key={project.id} className="h-full overflow-y-auto overscroll-contain bg-bg font-sans text-ink">
        <CaseStudyBody project={project} number={at + 1} next={next} />
      </div>
    </Window>
  );
}

type AppleMenuProps = {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSleep: () => void;
  onShutDown: () => void;
};

/** The Apple menu: just the ways out. Arrow keys move between items, Escape closes it. */
function AppleMenu({ open, onToggle, onClose, onSleep, onShutDown }: AppleMenuProps) {
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const items = [
    { label: "Sleep", action: onSleep },
    { label: "Shut Down…", action: onShutDown },
  ];

  useEffect(() => {
    if (open) menu.current?.querySelector("button")?.focus();
  }, [open]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const buttons = [...(menu.current?.querySelectorAll("button") ?? [])];
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      buttons[(at + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length]?.focus();
    }
    if (event.key === "Escape" || event.key === "Tab") {
      // Escape is handled here rather than by the desktop, so focus can go back to the button.
      event.stopPropagation();
      if (event.key === "Escape") button.current?.focus();
      onClose();
    }
  };

  return (
    <div className="relative flex" onPointerDown={(e) => e.stopPropagation()}>
      <button
        ref={button}
        type="button"
        aria-label="Apple menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={onToggle}
        className={`-mx-[8px] flex h-[24px] items-center rounded-[5px] px-[8px] ${open ? "bg-white/25" : ""}`}
      >
        <AppleLogo className="h-[16px] w-[16px]" />
      </button>
      {open && (
        <div
          ref={menu}
          role="menu"
          aria-label="Apple"
          onKeyDown={onKeyDown}
          className="absolute left-[-8px] top-[27px] w-[220px] rounded-[8px] border border-black/10 bg-[#f0f0f0]/90 p-[5px] text-[#1d1d1f] shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-2xl [text-shadow:none]"
        >
          {items.map(({ label, action }) => (
            <button
              key={label}
              type="button"
              role="menuitem"
              onClick={() => {
                onClose();
                action();
              }}
              className="block w-full rounded-[4px] px-[10px] py-[3px] text-left text-[13px] outline-none hover:bg-[#0a64d8] hover:text-white focus-visible:bg-[#0a64d8] focus-visible:text-white"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const DOCK_APPS = {
  finder: { label: "Finder", title: "Projects", icon: <FinderIcon className="h-full w-full" /> },
  photobooth: { label: "Photo Booth", title: "Photo Booth", icon: <PhotoBoothIcon className="h-full w-full" /> },
  browser: { label: "Firefox", title: "Firefox", icon: <BrowserIcon className="h-full w-full" /> },
  trash: { label: "Trash", title: "Trash", icon: <TrashIcon className="h-full w-full" /> },
};
