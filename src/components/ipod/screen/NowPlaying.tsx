import { useEffect, useState } from "react";
import type { NowPlaying as Live, Track } from "@/lib/music-types";
import type { PlayerState } from "../player-store";
import type { Loadable } from "../useMusic";
import { Artwork } from "./Artwork";

const clock = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/** "just now", "5m ago", "2h ago", "3d ago". */
function ago(iso: string, now: number) {
  const minutes = Math.floor((now - Date.parse(iso)) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 60 * 24) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / (60 * 24))}d ago`;
}

/** The clock, ticking each second while `running`. Starts from `from` so rendering stays pure. */
function useNow(from: number, running: boolean) {
  const [now, setNow] = useState(from);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [running]);
  return Math.max(now, from);
}

const SOURCES = { deezer: "Deezer", itunes: "Apple Music" } as const;

type Props = { player: PlayerState; live: Loadable<Live | null> };

/**
 * The song that's loaded in the iPod, or, when nothing is, what I'm playing on Spotify
 * right now (or last played).
 */
export function NowPlaying({ player, live }: Props) {
  const queued = player.queue[player.index];
  if (queued) {
    const note =
      player.status === "no-preview"
        ? "No preview available"
        : player.preview?.source
          ? `preview via ${SOURCES[player.preview.source]}`
          : null;
    return (
      <Layout
        top={`${player.index + 1} of ${player.queue.length}`}
        track={queued}
        note={note}
        progress={player.status === "no-preview" ? null : { elapsed: player.elapsed, total: player.duration }}
      />
    );
  }
  if (live.status === "loading") return null;
  if (live.status === "error") return <Message text="Couldn't load — try again" />;
  if (live.status === "off" || !live.data) return <Message text="Not playing" />;
  return <LiveTrack live={live.data} />;
}

function LiveTrack({ live }: { live: Live }) {
  const now = useNow(live.fetchedAt, live.isPlaying);
  const elapsed = Math.min(live.track.durationMs, live.progressMs + (now - live.fetchedAt)) / 1000;
  return (
    <Layout
      top={live.isPlaying ? "Playing on Spotify" : live.playedAt ? `Last played · ${ago(live.playedAt, now)}` : "Last played"}
      track={live.track}
      note="▶ plays a preview"
      progress={live.isPlaying ? { elapsed, total: live.track.durationMs / 1000 } : null}
    />
  );
}

type LayoutProps = {
  top: string;
  track: Track;
  note: string | null;
  progress: { elapsed: number; total: number } | null;
};

function Layout({ top, track, note, progress }: LayoutProps) {
  return (
    <div className="flex h-full flex-col px-[12px] pt-[7px] pb-[8px]">
      <p className="text-center text-[11px] text-[#4d535b]">{top}</p>
      <div className="mt-[8px] flex min-h-0 flex-1 gap-[12px]">
        <Artwork url={track.artworkUrl} size={104} reflection />
        <div className="flex min-w-0 flex-1 flex-col pt-[6px] leading-tight">
          <p className="line-clamp-2 text-[15px] font-bold">{track.title}</p>
          <p className="mt-[3px] truncate text-[13px]">{track.artist}</p>
          {track.album && <p className="truncate text-[13px] text-[#4d535b]">{track.album}</p>}
          {track.note && <p className="mt-[3px] line-clamp-2 text-[11px] italic text-[#4d535b]">{track.note}</p>}
          <div className="mt-auto text-[9.5px] text-[#6b7078]">
            {note && <p>{note}</p>}
            <a href={track.spotifyUrl} target="_blank" rel="noopener noreferrer" tabIndex={-1} className="cursor-pointer text-[#1f6fd1] underline">
              Open in Spotify ↗
            </a>
          </div>
        </div>
      </div>
      {progress && (
        <div className="mt-[6px]">
          <div className="h-[7px] overflow-hidden border border-[#8b939e] bg-[linear-gradient(#f4f5f7,#d5d9df)]">
            <div
              className="h-full bg-[linear-gradient(#7dbcf7,#2b7bd9)]"
              style={{ width: `${Math.min(100, (progress.elapsed / Math.max(1, progress.total)) * 100)}%` }}
            />
          </div>
          <div className="mt-[2px] flex justify-between text-[10px] font-bold tabular-nums">
            <span>{clock(progress.elapsed)}</span>
            <span>-{clock(progress.total - progress.elapsed)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Message({ text }: { text: string }) {
  return <p className="flex h-full items-center justify-center text-[15px] font-bold text-[#4d535b]">{text}</p>;
}
