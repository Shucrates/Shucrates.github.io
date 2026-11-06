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
  /** Small in the corner: only the progress bar stays. */
  compact: boolean;
};

/**
 * The episode on the LCD. Its <video> is the only one the camera ever plays: it
 * stays mounted from the title screen to the corner and back, so playback never restarts. Every episode fits whole: wide ones letterboxed in
 * black, vertical ones over a blurred, darkened copy of themselves.
 */
export function LcdPlayback({ episode, index, playing, muted, hud: showHud, restart, compact }: Props) {
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

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-[1cqw] p-[1.5cqw] [text-shadow:0_1px_2px_#000]">
        {hud && (
          <div className="flex justify-between gap-[2cqw]">
            <span className="min-w-0 truncate normal-case">{episode.title}</span>
            <span className="shrink-0">
              {src ? lcdTime(elapsed) : "--:--"} / {lcdTime(duration)}
            </span>
          </div>
        )}
        <div className="h-[max(2px,0.5cqw)] bg-white/30">
          <div className="h-full bg-white" style={{ width: `${duration ? (elapsed / duration) * 100 : 0}%` }} />
        </div>
      </div>
    </div>
  );
}
