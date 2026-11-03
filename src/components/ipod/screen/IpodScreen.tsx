"use client";

import { AnimatePresence, MotionConfig, motion, type Variants } from "framer-motion";
import { useEffect, useImperativeHandle, useState, type Ref } from "react";
import { BODY, SCREEN, albumsOf, listLayout, moveTo, rowsOf, songCount, titleOf, type Action, type Frame, type View } from "../menu";
import { player, usePlayer } from "../player-store";
import { tick } from "../useClickSound";
import { useMusic } from "../useMusic";
import { About } from "./About";
import { ArtistDetail } from "./ArtistDetail";
import { CoverFlow } from "./CoverFlow";
import { KenBurns } from "./KenBurns";
import { MenuList } from "./MenuList";
import { NowPlaying } from "./NowPlaying";
import { TitleBar } from "./TitleBar";
import { screenFont } from "./font";

/** What the click wheel can tell the screen to do. */
export type IpodControls = {
  scroll: (by: 1 | -1) => void;
  select: () => void;
  /** Back one screen; false when already on the main menu. */
  menu: () => boolean;
  playPause: () => void;
  skip: (by: 1 | -1) => void;
};

type Nav = { stack: Frame[]; direction: 1 | -1 };

let frameIds = 0;
const frame = (view: View): Frame => ({ id: ++frameIds, view, cursor: 0, first: 0 });

/** Forward slides the new screen in from the right; MENU slides back from the left. */
const slide: Variants = {
  enter: (direction: number) => ({ x: `${direction * 100}%` }),
  center: { x: 0 },
  exit: (direction: number) => ({ x: `${direction * -100}%` }),
};

type Props = {
  ref: Ref<IpodControls>;
  /** Size of the iPod's screen on the page; the 320×240 UI is scaled to fill it. */
  width: number;
  height: number;
};

/** Everything inside the iPod's screen: menus, Now Playing, and the music behind them. */
export function IpodScreen({ ref, width, height }: Props) {
  const { music, retry } = useMusic();
  const playback = usePlayer();
  const [nav, setNav] = useState<Nav>(() => ({ stack: [frame({ kind: "root" })], direction: 1 }));

  const raw = nav.stack[nav.stack.length - 1];
  const view = raw.view;
  const rows = rowsOf(view, music);
  // Rows can come and go as data loads; keep the cursor on one that exists.
  const top = moveTo(raw, raw.cursor, rows.length);
  const queued = playback.queue[playback.index] ?? null;
  const live = music.nowPlaying.status === "ok" ? music.nowPlaying.data : null;

  // Leaving the page stops the music.
  useEffect(() => () => player.pause(), []);

  const push = (next: View) => {
    const pushed = frame(next);
    setNav((n) => ({ stack: [...n.stack, pushed], direction: 1 }));
  };
  const moveCursor = (to: (cursor: number, count: number) => number) =>
    setNav((n) => {
      const current = n.stack[n.stack.length - 1];
      const count = rowsOf(current.view, music).length;
      if (!count) return n;
      return { ...n, stack: [...n.stack.slice(0, -1), moveTo(current, to(Math.min(current.cursor, count - 1), count), count)] };
    });

  const act = (action: Action) => {
    if (!action) return;
    if (action.type === "open") push(action.view);
    else if (action.type === "retry") retry(action.resource);
    else {
      player.play(action.queue, action.index);
      push({ kind: "now-playing" });
    }
  };

  const select = () => {
    if (view.kind !== "now-playing") return act(rows[top.cursor]?.action ?? null);
    if (!queued && music.nowPlaying.status === "error") return retry("nowPlaying");
    const track = queued ?? live?.track;
    if (track) window.open(track.spotifyUrl, "_blank", "noopener");
  };

  const controls: IpodControls = {
    scroll: (by) => moveCursor((cursor) => cursor + by),
    select,
    menu: () => {
      if (nav.stack.length < 2) return false;
      setNav((n) => (n.stack.length < 2 ? n : { stack: n.stack.slice(0, -1), direction: -1 }));
      return true;
    },
    playPause: () => {
      if (queued) player.toggle();
      // The live Spotify track never plays by itself; ▶ plays its preview.
      else if (view.kind === "now-playing" && live) player.play([live.track], 0);
    },
    skip: (by) => {
      if (view.kind === "now-playing") player.skip(by);
      else moveCursor((_, count) => (by > 0 ? count - 1 : 0));
    },
  };
  useImperativeHandle(ref, () => controls);

  const pick = (index: number) => {
    tick();
    if (index === top.cursor) select();
    else moveCursor(() => index);
  };

  const list = { label: titleOf(view), rows, cursor: top.cursor, first: top.first, ...listLayout(view), onPick: pick };
  const artwork = [live?.track.artworkUrl, ...[music.topTracks, music.favourites].flatMap((l) => (l.status === "ok" ? l.data.map((t) => t.artworkUrl) : []))];
  const covers = [...new Set(artwork.filter((url): url is string => Boolean(url)))];

  // Cover Flow and the album flipped over in it are one screen: the flip replaces the slide.
  const below = nav.stack[nav.stack.length - 2];
  const flow = view.kind === "cover-flow" ? top : view.kind === "album" && below?.view.kind === "cover-flow" ? below : null;
  const albums = flow ? albumsOf(music) : [];
  const flowCursor = flow ? Math.max(0, Math.min(albums.length - 1, flow.cursor)) : 0;

  const content = (() => {
    switch (view.kind) {
      case "root":
        return (
          <div className="flex h-full">
            <div className="w-1/2 shrink-0">
              <MenuList {...list} />
            </div>
            <div className="min-w-0 flex-1">
              <KenBurns images={covers} />
            </div>
          </div>
        );
      case "now-playing":
        return <NowPlaying player={playback} live={music.nowPlaying} />;
      case "artist":
        return <ArtistDetail artist={view.artist} {...list} />;
      case "about":
        return <About songs={songCount(music)} />;
      case "cover-flow":
      case "album":
        if (!albums.length) return <MenuList {...list} />;
        return (
          <CoverFlow
            albums={albums}
            cursor={flowCursor}
            back={view.kind === "album" ? { rows, cursor: top.cursor, first: top.first, ...listLayout(view) } : null}
            onPickAlbum={(index) => {
              if (view.kind === "cover-flow") pick(index);
              // Clicking the flipped album turns it back over.
              else if (index === flowCursor) {
                tick();
                controls.menu();
              }
            }}
            onPickSong={pick}
          />
        );
      default:
        return <MenuList {...list} />;
    }
  })();

  const loading =
    playback.status === "loading" || Object.values(music).some((loadable) => loadable.status === "loading");
  const selected = rows[top.cursor];
  const announcement =
    view.kind === "now-playing"
      ? queued
        ? `Now playing ${queued.title} by ${queued.artist}`
        : live
          ? `${live.isPlaying ? "Playing on Spotify" : "Last played"}: ${live.track.title} by ${live.track.artist}`
          : "Not playing"
      : selected
        ? `${selected.label}${selected.detail ? `, ${selected.detail}` : ""}, ${top.cursor + 1} of ${rows.length}`
        : titleOf(view);

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={`${screenFont.className} relative origin-top-left overflow-hidden bg-white text-[#111] select-none`}
        style={{ ...SCREEN, transform: `scale(${width / SCREEN.width}, ${height / SCREEN.height})` }}
      >
        <TitleBar
          title={titleOf(view)}
          playback={!queued ? null : playback.status === "playing" || playback.status === "loading" ? "playing" : "paused"}
          loading={loading}
        />
        <div className="relative overflow-hidden" style={{ height: BODY }}>
          <AnimatePresence initial={false} custom={nav.direction}>
            <motion.div
              key={flow?.id ?? raw.id}
              custom={nav.direction}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute inset-0 bg-white"
            >
              {content}
            </motion.div>
          </AnimatePresence>
        </div>
        <p aria-live="polite" className="sr-only">
          {announcement}
        </p>
      </div>
    </MotionConfig>
  );
}
