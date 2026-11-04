import type { Artist, NowPlaying, Track } from "@/lib/music-types";
import { SCREEN, TITLE_BAR, coversOf, listLayout, rowsOf, titleOf, type Row } from "../menu";
import { load, MUSIC_PATHS, type Music } from "../useMusic";
import { screenFont } from "./font";
import { MOVES } from "./KenBurns";

/**
 * The main menu drawn onto a canvas, for the 3D iPod's screen while it sits on the
 * homepage. It mirrors what <IpodScreen> first shows on /music (same rows, sizes and
 * first slideshow cover), so opening the iPod doesn't change what's on its screen.
 */

const ROOT = { kind: "root" } as const;
const FONT = screenFont.style.fontFamily;
/** The menu's glossy selection bar, as in MenuList's SELECTED. */
const SELECTED_STOPS: [number, string][] = [
  [0, "#7dbcf7"],
  [0.5, "#3d8fe6"],
  [0.51, "#2b7bd9"],
  [1, "#1f6fd1"],
];

type Home = { rows: Row[]; cover: HTMLImageElement | null };

function gradient(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, stops: [number, string][]) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  stops.forEach(([at, colour]) => g.addColorStop(at, colour));
  return g;
}

function truncate(ctx: CanvasRenderingContext2D, text: string, width: number) {
  if (ctx.measureText(text).width <= width) return text;
  let cut = text;
  while (cut && ctx.measureText(`${cut}…`).width > width) cut = cut.slice(0, -1);
  return `${cut}…`;
}

export function drawHomeScreen(ctx: CanvasRenderingContext2D, { rows, cover }: Home) {
  const { width, height } = SCREEN;
  const half = width / 2;
  const body = height - TITLE_BAR;
  ctx.textBaseline = "middle";

  // Right half: the slideshow's first cover, framed as KenBurns starts it.
  if (cover) {
    const { scale, x, y } = MOVES[0].from;
    const size = Math.max(half, body) * scale;
    ctx.save();
    ctx.beginPath();
    ctx.rect(half, TITLE_BAR, half, body);
    ctx.clip();
    ctx.fillStyle = "#000";
    ctx.fillRect(half, TITLE_BAR, half, body);
    const cx = half + half / 2 + (parseFloat(x) / 100) * half;
    const cy = TITLE_BAR + body / 2 + (parseFloat(y) / 100) * body;
    ctx.drawImage(cover, cx - size / 2, cy - size / 2, size, size);
    ctx.restore();
  } else {
    ctx.fillStyle = gradient(ctx, half, TITLE_BAR, width, height, [
      [0, "#e4e7eb"],
      [1, "#a7aeb8"],
    ]);
    ctx.fillRect(half, TITLE_BAR, half, body);
    ctx.fillStyle = "#fff";
    ctx.font = `48px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillText("♪", half + half / 2, TITLE_BAR + body / 2);
  }
  ctx.fillStyle = gradient(ctx, half, 0, half + 6, 0, [
    [0, "rgba(0,0,0,0.3)"],
    [1, "rgba(0,0,0,0)"],
  ]);
  ctx.fillRect(half, TITLE_BAR, 6, body);

  // Left half: the menu.
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, TITLE_BAR, half, body);
  const { visible, rowHeight } = listLayout(ROOT);
  rows.slice(0, visible).forEach((row, i) => {
    const top = TITLE_BAR + i * rowHeight;
    const selected = i === 0;
    if (selected) {
      ctx.fillStyle = gradient(ctx, 0, top, 0, top + rowHeight, SELECTED_STOPS);
      ctx.fillRect(0, top, half, rowHeight);
    }
    ctx.fillStyle = selected ? "#fff" : "#111";
    ctx.textAlign = "left";
    ctx.font = `700 15px ${FONT}`;
    ctx.fillText(truncate(ctx, row.label, half - 30), 8, top + rowHeight / 2);
    if (row.arrow) {
      ctx.textAlign = "right";
      ctx.font = `700 17px ${FONT}`;
      ctx.fillText("›", half - 8, top + rowHeight / 2);
    }
  });

  // Title bar, as TitleBar draws it with nothing playing.
  ctx.fillStyle = gradient(ctx, 0, 0, 0, TITLE_BAR, [
    [0, "#f7f8fa"],
    [1, "#c6ccd5"],
  ]);
  ctx.fillRect(0, 0, width, TITLE_BAR);
  ctx.fillStyle = "#9aa2ad";
  ctx.fillRect(0, TITLE_BAR - 1, width, 1);
  ctx.fillStyle = "#111";
  ctx.textAlign = "center";
  ctx.font = `700 13px ${FONT}`;
  ctx.fillText(titleOf(ROOT), width / 2, TITLE_BAR / 2);
  const battery = { x: width - 8 - 21, y: (TITLE_BAR - 9) / 2 };
  ctx.fillStyle = gradient(ctx, 0, battery.y, 0, battery.y + 9, [
    [0, "#9be07b"],
    [1, "#3f9e2b"],
  ]);
  ctx.beginPath();
  ctx.roundRect(battery.x, battery.y, 19, 9, 2);
  ctx.fill();
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = "#555";
  ctx.fillRect(battery.x + 19, battery.y + 2.5, 2, 4);
}

/** The main menu with nothing loaded yet: every item, as when Spotify is set up. */
export const defaultHome = (): Home => ({ rows: rowsOf(ROOT, idle()), cover: null });

function idle(): Music {
  return { nowPlaying: { status: "loading" }, topTracks: { status: "loading" }, topArtists: { status: "loading" }, favourites: { status: "loading" } };
}

function image(url: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    // The canvas becomes a WebGL texture, so the image must be CORS-clean.
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/** Fetches everything /music shows (and leaves it cached for it), plus the font. */
export async function loadHome(): Promise<Home> {
  const [nowPlaying, topTracks, topArtists, favourites] = await Promise.all([
    load<NowPlaying | null>(MUSIC_PATHS.nowPlaying),
    load<Track[]>(MUSIC_PATHS.topTracks),
    // Not drawn here, but fetched so /music opens with nothing left to load.
    load<Artist[]>(MUSIC_PATHS.topArtists),
    load<Track[]>(MUSIC_PATHS.favourites),
    document.fonts.load(`700 15px ${FONT}`).catch(() => []),
  ]);
  const music: Music = { nowPlaying, topTracks, topArtists, favourites };
  const first = coversOf(music)[0];
  return { rows: rowsOf(ROOT, music), cover: first ? await image(first) : null };
}

