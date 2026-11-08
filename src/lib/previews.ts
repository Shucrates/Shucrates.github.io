import "server-only";
import type { Preview } from "./music-types";

/**
 * 30-second previews from public APIs, since Spotify no longer hands them to new apps.
 * Deezer by ISRC first, then an iTunes search. We only ever link to the provider's own
 * preview URL; no audio is downloaded or re-hosted.
 */

export type SongQuery = { isrc?: string; title: string; artist: string };

export type SongMatch = {
  preview: Preview;
  album: string | null;
  artworkUrl: string | null;
  durationMs: number | null;
};

/** Which song matched never changes, so the lookups are cached for a week... */
const MATCH_SECONDS = 7 * 24 * 60 * 60;
/** ...but Deezer's preview URLs are signed and expire, so those are fetched fresh. */
const DEEZER_URL_SECONDS = 300;

export const NO_PREVIEW: Preview = { previewUrl: null, source: null, externalUrl: null };

type DeezerTrack = {
  id: number;
  preview: string;
  link: string;
  duration: number;
  album?: { title: string; cover_xl?: string };
};
type DeezerResponse = DeezerTrack | { error: unknown };

type ItunesSong = {
  trackName: string;
  artistName: string;
  collectionName?: string;
  previewUrl?: string;
  trackViewUrl: string;
  artworkUrl100?: string;
  trackTimeMillis?: number;
};

async function getJson<T>(url: string, revalidate: number): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate } });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

async function deezerTrack(path: string, revalidate: number): Promise<DeezerTrack | null> {
  const body = await getJson<DeezerResponse>(`https://api.deezer.com/track/${path}`, revalidate);
  // Deezer answers misses with 200 and an `error` object.
  return body && !("error" in body) ? body : null;
}

async function fromDeezer(isrc: string): Promise<SongMatch | null> {
  const match = await deezerTrack(`isrc:${encodeURIComponent(isrc)}`, MATCH_SECONDS);
  if (!match) return null;
  const track = await deezerTrack(String(match.id), DEEZER_URL_SECONDS);
  if (!track?.preview) return null;
  return {
    preview: { previewUrl: track.preview, source: "deezer", externalUrl: track.link },
    album: track.album?.title ?? null,
    artworkUrl: track.album?.cover_xl ?? null,
    durationMs: track.duration * 1000,
  };
}

/** Lowercase, no accents, no "(Remastered)", "- Live" or "feat. X": just the words. */
export function normalise(text: string) {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[([].*?[)\]]/g, " ")
    .replace(/\s-\s.*$/, " ")
    .replace(/\b(feat|ft)\.?\s.*$/, " ")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const overlaps = (a: string, b: string) => a.length > 0 && b.length > 0 && (a.includes(b) || b.includes(a));

async function fromItunes(title: string, artist: string): Promise<SongMatch | null> {
  const term = encodeURIComponent(`${title} ${artist}`);
  const body = await getJson<{ results: ItunesSong[] }>(
    `https://itunes.apple.com/search?term=${term}&entity=song&limit=5`,
    MATCH_SECONDS,
  );
  const wantTitle = normalise(title);
  // Spotify joins several artists with ", "; the first is enough to match on.
  const wantArtist = normalise(artist.split(",")[0]);
  let best: { song: ItunesSong; score: number } | null = null;
  for (const song of body?.results ?? []) {
    if (!song.previewUrl || !overlaps(normalise(song.artistName), wantArtist)) continue;
    const got = normalise(song.trackName);
    // The exact title beats a remix or live version that only matches once trimmed.
    const score = song.trackName.toLowerCase() === title.toLowerCase() ? 3 : got === wantTitle ? 2 : overlaps(got, wantTitle) ? 1 : 0;
    if (score > (best?.score ?? 0)) best = { song, score };
  }
  if (!best) return null;
  const { song } = best;
  return {
    preview: { previewUrl: song.previewUrl ?? null, source: "itunes", externalUrl: song.trackViewUrl },
    album: song.collectionName ?? null,
    artworkUrl: song.artworkUrl100?.replace("100x100bb", "600x600bb") ?? null,
    durationMs: song.trackTimeMillis ?? null,
  };
}

/** The best preview we can find for a song, with its album and artwork; `null` if there's none. */
export async function findSong({ isrc, title, artist }: SongQuery): Promise<SongMatch | null> {
  return (isrc ? await fromDeezer(isrc) : null) ?? (await fromItunes(title, artist));
}
