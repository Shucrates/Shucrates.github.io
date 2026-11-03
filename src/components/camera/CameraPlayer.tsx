"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStage, type Box } from "@/components/stage/store";
import type { Video } from "@/content/shuisbored";
import { CameraScreen } from "./CameraScreen";
import type { CameraButton } from "./geometry";
import { cameraStore } from "./stage";

const KEYS: Record<string, CameraButton> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
  Enter: "set",
  " ": "play",
  m: "menu",
  i: "disp",
  r: "record",
};

/** Turns the docked camera into a video player: dial to browse, FUNC.SET/PLAY to pause, MENU to pick. */
export function CameraPlayer({ videos }: { videos: Video[] }) {
  const router = useRouter();
  // Where the 3D camera's LCD and buttons are on screen; null until it has landed.
  const layout = useStage(cameraStore, (s) => s.layout);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hud, setHud] = useState(true);
  const [menuCursor, setMenuCursor] = useState<number | null>(null);
  const [restart, setRestart] = useState(0);

  const count = videos.length;
  const wrap = (n: number) => (n + count) % count;

  const select = (i: number) => {
    setIndex(i);
    setPlaying(true);
    setMenuCursor(null);
  };

  const press = (button: CameraButton) => {
    if (count === 0) return;
    const menuOpen = menuCursor !== null;
    switch (button) {
      case "left":
      case "right": {
        const step = button === "left" ? -1 : 1;
        if (menuOpen) setMenuCursor(wrap(menuCursor + step));
        else select(wrap(index + step));
        break;
      }
      case "up":
      case "down":
        if (menuOpen) setMenuCursor(wrap(menuCursor + (button === "up" ? -1 : 1)));
        break;
      case "set":
        if (menuOpen) select(menuCursor);
        else setPlaying((p) => !p);
        break;
      case "play":
        setPlaying((p) => !p);
        break;
      case "record":
        setRestart((n) => n + 1);
        setPlaying(true);
        break;
      case "menu":
        setMenuCursor(menuOpen ? null : index);
        break;
      case "disp":
        setHud((h) => !h);
        break;
    }
  };

  // Keyboard mirrors the buttons; Escape closes the menu, then leaves.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (menuCursor !== null) setMenuCursor(null);
        else router.push("/");
        return;
      }
      const button = KEYS[event.key];
      if (!button || (event.target instanceof HTMLButtonElement && (event.key === "Enter" || event.key === " "))) return;
      event.preventDefault();
      press(button);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!layout) return null;
  const at = ({ left, top, width, height }: Box) => ({ left, top, width, height });
  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <div
        className="pointer-events-auto absolute overflow-hidden bg-black [container-type:inline-size]"
        style={at(layout.lcd)}
      >
        <CameraScreen
          videos={videos}
          index={index}
          playing={playing}
          hud={hud}
          menuCursor={menuCursor}
          restart={restart}
          onSelect={select}
        />
      </div>
      {layout.buttons.map(({ id, label, box }) => (
        <button
          key={id}
          type="button"
          aria-label={label}
          onClick={() => press(id)}
          className="pointer-events-auto absolute rounded-full transition-colors duration-75 hover:bg-white/10 focus-visible:outline-offset-1 active:bg-white/20"
          style={at(box)}
        />
      ))}
    </div>
  );
}
