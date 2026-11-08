"use client";

import { useRef } from "react";
import type { Episode } from "@/content/episodes";
import { fileNumber, lcdDate } from "./format";
import { player } from "./player-store";
import { GRID_COLUMNS } from "./useCameraControls";

const PAGE_SIZE = GRID_COLUMNS * 2;

/** Text on the LCD: tiny mono caps, legible from a phone up. */
export const LCD_TEXT = "font-label text-[clamp(8px,2.2cqw,13px)] uppercase leading-none tracking-wider text-white";

export function Battery() {
  return (
    <span aria-hidden className="inline-flex items-center">
      <span className="flex h-[1.1em] w-[2.2em] gap-[0.15em] border border-white p-[0.15em]">
        <span className="flex-1 bg-white" />
        <span className="flex-1 bg-white" />
        <span className="flex-1 bg-white" />
      </span>
      <span className="h-[0.5em] w-[0.2em] bg-white" />
    </span>
  );
}

type Props = { episodes: Episode[]; cursor: number; opening: number | null; onPick: (index: number) => void };

/**
 * The PLAYBACK grid: six thumbnails a page, the highlighted one's details along
 * the bottom. Pointing at a thumbnail highlights it, and the highlighted one
 * plays a silent preview. On touch there's no hover, so the first tap previews
 * and a second tap on the same one opens it.
 */
export function LcdMenu({ episodes, cursor, opening, onPick }: Props) {
  const pointer = useRef("mouse");
  const page = Math.floor(cursor / PAGE_SIZE);
  const pages = Math.max(1, Math.ceil(episodes.length / PAGE_SIZE));
  const shown = episodes.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const current = episodes[cursor];

  return (
    <div className={`absolute inset-0 flex flex-col gap-[2cqw] bg-black p-[2.5cqw] ${LCD_TEXT}`}>
      <div className="flex items-center justify-between">
        <span>▶ play</span>
        <span>{current ? fileNumber(cursor) : "no files"}</span>
        <Battery />
      </div>

      <ul className="grid min-h-0 flex-1 grid-cols-3 grid-rows-2 gap-[1.5cqw]">
        {shown.map((episode, i) => {
          const index = page * PAGE_SIZE + i;
          const selected = index === cursor;
          return (
            <li key={episode.id} className="min-h-0">
              <button
                type="button"
                tabIndex={-1}
                aria-label={`Play ${episode.title}`}
                onPointerDown={(event) => (pointer.current = event.pointerType)}
                onPointerEnter={(event) => event.pointerType === "mouse" && player.setCursor(index)}
                onClick={() => (pointer.current === "touch" && !selected ? player.setCursor(index) : onPick(index))}
                className={`relative h-full w-full overflow-hidden bg-[#161616] outline-offset-0 ${
                  selected ? "outline outline-[0.6cqw] outline-accent" : ""
                }`}
              >
                {episode.poster && (
                  // Posters are small, local and decorative here; next/image would add nothing.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={episode.poster} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
                )}
                {selected && episode.src && (
                  <video
                    src={episode.src}
                    poster={episode.poster}
                    muted
                    loop
                    autoPlay
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                {opening === index && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-[1.3em]">▶ opening</span>
                )}
                <span className="absolute bottom-[0.8cqw] left-[0.8cqw] [text-shadow:0_1px_2px_#000]">
                  {String(index + 1).padStart(4, "0")}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex items-end justify-between gap-[2cqw]">
        <span className="min-w-0 truncate normal-case">{current?.title ?? "nothing here yet"}</span>
        <span className="shrink-0 text-white/70">
          {current && `${current.format} · ${lcdDate(current.date)}`}
          {pages > 1 && ` · ${page + 1}/${pages}`}
        </span>
      </div>
    </div>
  );
}
