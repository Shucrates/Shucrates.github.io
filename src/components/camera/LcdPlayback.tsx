"use client";

import { useEffect, useRef, useState } from "react";
import type { Episode } from "@/content/episodes";
import { fileNumber, lcdDate, lcdTime } from "./format";
import { Battery, LCD_TEXT } from "./LcdMenu";
import { player } from "./player-store";

type Props = {
  episode: Episode;
  index: number;
  playing: boolean;
  muted: boolean;
  hud: boolean;
  restart: number;
  seek: { to: number; n: number };
  /** Hovered in the corner: play/pause and sound buttons on the screen, and a progress bar you can drag. */
  controls?: boolean;
  /** Small in the corner: only the progress bar stays. */
  compact: boolean;
};

/**
 * The episode on the LCD. Its <video> is the only one the camera ever plays: it
 * stays mounted from the title screen to the corner and back, so playback never restarts. Every episode fits whole: wide ones letterboxed in
 * black, vertical ones over a blurred, darkened copy of themselves.
 */
export function LcdPlayback({ episode, index, playing, muted, hud: showHud, restart, seek, compact, controls = false }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const backdrop = useRef<HTMLVideoElement>(null);
  const [elapsed, setElapsed] = useState(0);
  const [loadedDuration, setLoadedDuration] = useState(0);
  const { src, poster } = episode;
  const vertical = episode.orientation === "vertical";
  const hud = showHud && !compact;

  useEffect(() => {
    const videos = [ref.current, backdrop.current];
    for (const video of videos) {
      if (!video || !src) continue;
      if (playing) video.play().catch(() => video === ref.current && player.setPlaying(false));
      else video.pause();
    }
  }, [playing, src]);

  useEffect(() => {
    for (const video of [ref.current, backdrop.current]) if (video && restart > 0) video.currentTime = 0;
  }, [restart]);

  useEffect(() => {
    if (seek.n === 0) return;
    for (const video of [ref.current, backdrop.current]) {
      if (!video) continue;
      if (!Number.isFinite(video.duration)) continue;
      video.currentTime = Math.min(video.duration - 0.1, seek.to * video.duration);
      if (video === ref.current) setElapsed(video.currentTime);
    }
  }, [seek]);

  // A new episode starts the clock again.
  const [shownSrc, setShownSrc] = useState(src);
  if (shownSrc !== src) {
    setShownSrc(src);
    setElapsed(0);
    setLoadedDuration(0);
  }

  const onTime = () => {
    const video = ref.current;
    if (!video) return;
    setElapsed(video.currentTime);
    // Keep the blurred copy roughly in step.
    const copy = backdrop.current;
    if (copy && Math.abs(copy.currentTime - video.currentTime) > 0.3) copy.currentTime = video.currentTime;
  };

  const duration = loadedDuration || episode.durationSec;

  return (
    <div className={`absolute inset-0 overflow-hidden bg-black ${LCD_TEXT}`}>
      {vertical && (src || poster) && (
        <div aria-hidden className="absolute inset-0 scale-110 blur-[4cqw] brightness-[0.45]">
          {src ? (
            <video ref={backdrop} src={src} poster={poster} muted loop playsInline preload="metadata" className="h-full w-full object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster} alt="" className="h-full w-full object-cover" />
          )}
        </div>
      )}

      {src ? (
        <video
          ref={ref}
          src={src}
          poster={poster}
          muted={muted}
          loop
          playsInline
          preload="metadata"
          onTimeUpdate={onTime}
          onLoadedMetadata={(event) => setLoadedDuration(event.currentTarget.duration)}
          className="relative h-full w-full object-contain"
        >
          {episode.captions && <track kind="captions" src={episode.captions} srcLang="en" label="English" default />}
        </video>
      ) : (
        <div className="relative flex h-full w-full flex-col items-center justify-center gap-[1.5cqw]">
          {poster && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={poster}
              alt=""
              className="absolute inset-0 h-full w-full object-contain opacity-60"
            />
          )}
          <span className="relative bg-black/70 px-[1.5cqw] py-[1cqw]">video to be added</span>
        </div>
      )}

      {hud && (
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-[1.5cqw] [text-shadow:0_1px_2px_#000]">
          <button
            type="button"
            onClick={player.toggleMenu}
            className="min-h-11 min-w-11 text-left uppercase"
            aria-label="Episode grid"
          >
            ◂ menu
          </button>
          <span className="@max-sm:hidden">
            {playing ? "▶" : "❚❚"} {fileNumber(index)} · {lcdDate(episode.date)}
          </span>
          <span className="flex items-center gap-[1.5cqw]">
            {muted ? "mute" : "♪"}
            <Battery />
          </span>
        </div>
      )}

      <div className={`absolute inset-x-0 bottom-0 flex flex-col gap-[1cqw] p-[1.5cqw] [text-shadow:0_1px_2px_#000] ${controls ? "bg-gradient-to-t from-black/45 to-transparent" : ""}`}>
        {hud && (
          <div className="flex justify-between gap-[2cqw]">
            <span className="min-w-0 truncate normal-case">{episode.title}</span>
            <span className="shrink-0">
              {src ? lcdTime(elapsed) : "--:--"} / {lcdTime(duration)}
            </span>
          </div>
        )}
        {controls ? (
          <div className="flex items-center gap-[1cqw]">
            <ControlButton
              label={playing ? "Pause" : "Play"}
              onClick={player.togglePlay}
            >
              {playing ? <path d="M8 5v14M16 5v14" strokeWidth={3} /> : <path d="M7 4.5v15l12-7.5z" fill="currentColor" />}
            </ControlButton>
            <ControlButton label={muted ? "Unmute" : "Mute"} pressed={!muted} onClick={player.toggleMute}>
              <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
              {muted ? <path d="M17 9l5 6M22 9l-5 6" /> : <path d="M16.5 8.5a5 5 0 0 1 0 7M19.5 5.5a9 9 0 0 1 0 13" />}
            </ControlButton>
            <div className="min-w-0 flex-1">
              <Scrubber progress={duration ? elapsed / duration : 0} />
            </div>
          </div>
        ) : (
          <div className="h-[max(2px,0.5cqw)] bg-white/30">
            <div className="h-full bg-white" style={{ width: `${duration ? (elapsed / duration) * 100 : 0}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}

/** A small bare icon button for the hover controls, tucked beside the progress bar. */
function ControlButton({ label, pressed, onClick, children }: { label: string; pressed?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="flex size-[7cqw] shrink-0 items-center justify-center text-white/75 drop-shadow-[0_1px_2px_#000] transition-colors hover:text-white"
    >
      <svg aria-hidden viewBox="0 0 24 24" className="size-[4.5cqw]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </button>
  );
}

/** The progress bar, like a video player's: click or drag along it to move through the episode. */
function Scrubber({ progress }: { progress: number }) {
  const [dragging, setDragging] = useState<number | null>(null);
  const at = (event: React.PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    return Math.max(0, Math.min(1, (event.clientX - box.left) / box.width));
  };
  const shown = dragging ?? progress;
  return (
    <div
      role="slider"
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(shown * 100)}
      tabIndex={0}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        event.stopPropagation();
        player.seekTo(progress + (event.key === "ArrowRight" ? 0.05 : -0.05));
      }}
      onPointerDown={(event) => {
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(at(event));
      }}
      onPointerMove={(event) => dragging !== null && setDragging(at(event))}
      onPointerUp={(event) => {
        if (dragging === null) return;
        player.seekTo(at(event));
        setDragging(null);
      }}
      className="group/bar relative flex h-[6cqw] cursor-pointer touch-none items-center"
    >
      <div className="relative h-[1.4cqw] w-full rounded-full bg-white/30">
        <div className="h-full rounded-full bg-white" style={{ width: `${shown * 100}%` }} />
        <span className="absolute top-1/2 size-[4cqw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" style={{ left: `${shown * 100}%` }} />
      </div>
    </div>
  );
}
