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

export const MUSIC_PATHS: Record<Resource, string> = {
  nowPlaying: "/api/music/now-playing/",
  topTracks: "/api/music/top-tracks/",
  topArtists: "/api/music/top-artists/",
  favourites: "/api/music/favourites/",
};

/**
 * The last answer from each path, so the iPod opens showing what its homepage screen
 * already fetched instead of loading it again.
 */
const latest = new Map<string, Loadable<unknown>>();

export async function load<T>(path: string): Promise<Loadable<T>> {
  try {
    const res = await fetch(path);
    if (res.ok) {
      const loaded: Loadable<T> = { status: "ok", data: (await res.json()) as T };
      latest.set(path, loaded);
      return loaded;
    }
    const body = (await res.json().catch(() => null)) as MusicError | null;
    return { status: body?.error === "not-configured" ? "off" : "error" };
  } catch {
    return { status: "error" };
  }
}

function useResource<T>(path: string, pollMs?: number) {
  const [state, setState] = useState<Loadable<T>>(() => (latest.get(path) as Loadable<T> | undefined) ?? { status: "loading" });
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
  const [nowPlaying, reloadNowPlaying] = useResource<NowPlaying | null>(MUSIC_PATHS.nowPlaying, NOW_PLAYING_POLL_MS);
  const [topTracks, reloadTopTracks] = useResource<Track[]>(MUSIC_PATHS.topTracks);
  const [topArtists, reloadTopArtists] = useResource<Artist[]>(MUSIC_PATHS.topArtists);
  const [favourites, reloadFavourites] = useResource<Track[]>(MUSIC_PATHS.favourites);
  const music: Music = { nowPlaying, topTracks, topArtists, favourites };
  const reloads: Record<Resource, () => void> = {
    nowPlaying: reloadNowPlaying,
    topTracks: reloadTopTracks,
    topArtists: reloadTopArtists,
    favourites: reloadFavourites,
  };
  return { music, retry: (resource: Resource) => reloads[resource]() };
}
