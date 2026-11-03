import { useCallback, useEffect, useState } from "react";
import type { Artist, MusicError, NowPlaying, Track } from "@/lib/music-types";

/** One piece of music data on its way from /api/music. `off` means Spotify isn't set up. */
export type Loadable<T> = { status: "loading" } | { status: "ok"; data: T } | { status: "error" } | { status: "off" };

export type Music = {
  nowPlaying: Loadable<NowPlaying | null>;
  topTracks: Loadable<Track[]>;
  topArtists: Loadable<Artist[]>;
  favourites: Loadable<Track[]>;
};

export type Resource = keyof Music;

/** How often the live Now Playing is asked for again; the route is cached for as long. */
const NOW_PLAYING_POLL_MS = 30_000;

async function load<T>(path: string): Promise<Loadable<T>> {
  try {
    const res = await fetch(path);
    if (res.ok) return { status: "ok", data: (await res.json()) as T };
    const body = (await res.json().catch(() => null)) as MusicError | null;
    return { status: body?.error === "not-configured" ? "off" : "error" };
  } catch {
    return { status: "error" };
  }
}

function useResource<T>(path: string, pollMs?: number) {
  const [state, setState] = useState<Loadable<T>>({ status: "loading" });
  useEffect(() => {
    let live = true;
    // A failed refresh keeps what's already showing.
    const run = () =>
      load<T>(path).then((next) => live && setState((prev) => (next.status === "error" && prev.status === "ok" ? prev : next)));
    void run();
    const timer = pollMs ? setInterval(run, pollMs) : undefined;
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, [path, pollMs]);
  const reload = useCallback(() => {
    setState({ status: "loading" });
    void load<T>(path).then(setState);
  }, [path]);
  return [state, reload] as const;
}

/** Everything the iPod shows, fetched once (Now Playing kept fresh), with a retry per piece. */
export function useMusic() {
  const [nowPlaying, reloadNowPlaying] = useResource<NowPlaying | null>("/api/music/now-playing/", NOW_PLAYING_POLL_MS);
  const [topTracks, reloadTopTracks] = useResource<Track[]>("/api/music/top-tracks/");
  const [topArtists, reloadTopArtists] = useResource<Artist[]>("/api/music/top-artists/");
  const [favourites, reloadFavourites] = useResource<Track[]>("/api/music/favourites/");
  const music: Music = { nowPlaying, topTracks, topArtists, favourites };
  const reloads: Record<Resource, () => void> = {
    nowPlaying: reloadNowPlaying,
    topTracks: reloadTopTracks,
    topArtists: reloadTopArtists,
    favourites: reloadFavourites,
  };
  return { music, retry: (resource: Resource) => reloads[resource]() };
}
