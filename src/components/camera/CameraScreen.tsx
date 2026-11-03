"use client";

import { useEffect, useRef } from "react";
import type { Video } from "@/content/shuisbored";

type Props = {
  videos: Video[];
  index: number;
  playing: boolean;
  hud: boolean;
  /** Highlighted row while the menu is open; `null` when closed. */
  menuCursor: number | null;
  /** Changes to restart the current video from the beginning. */
  restart: number;
  onSelect?: (index: number) => void;
};

const pad = (n: number) => String(n).padStart(3, "0");

/** What the LCD shows: the current video, a playback HUD and the video menu. */
export function CameraScreen({ videos, index, playing, hud, menuCursor, restart, onSelect }: Props) {
  const video = videos[index];
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (playing) element.play().catch(() => {});
    else element.pause();
  }, [playing, video?.src]);

  useEffect(() => {
    if (ref.current && restart > 0) ref.current.currentTime = 0;
  }, [restart]);

  return (
    <div className="relative h-full w-full font-label text-[1.5cqw] uppercase tracking-wider text-white">
      {video?.src ? (
        <video
          key={video.id}
          ref={ref}
          src={video.src}
          poster={video.poster}
          muted
          loop
          playsInline
          autoPlay={playing}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-[0.6cqw] bg-[#111] text-white/60">
          <span className="text-[2cqw] text-white/80">{video?.title ?? "No videos"}</span>
          <span>Video coming soon</span>
        </div>
      )}

      {hud && video && menuCursor === null && (
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-[1.2cqw] [text-shadow:0_1px_2px_#000]">
          <div className="flex justify-between">
            <span>
              {playing ? "▶" : "❚❚"} {index + 1}/{videos.length}
            </span>
            <span>100-{pad(index + 1)}</span>
          </div>
          <div className="flex justify-between">
            <span className="normal-case">{video.title}</span>
            <span>◂ ▸ change · func.set {playing ? "pause" : "play"}</span>
          </div>
        </div>
      )}

      {menuCursor !== null && (
        <div className="absolute inset-0 flex flex-col bg-black/85 p-[1.5cqw]">
          <p className="mb-[1cqw] text-white/60">Playback · {videos.length} videos</p>
          <ul className="flex flex-col gap-[0.4cqw]">
            {videos.map((item, i) => (
              <li key={item.id}>
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => onSelect?.(i)}
                  className={`w-full px-[0.8cqw] py-[0.4cqw] text-left normal-case ${
                    i === menuCursor ? "bg-accent text-white" : "text-white/80"
                  }`}
                >
                  {pad(i + 1)} {item.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
