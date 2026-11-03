import "server-only";
import type { Artist, NowPlaying, Track } from "./music-types";

/**
 * My Spotify, read with a long-lived refresh token (see scripts/spotify-auth.ts).
 * Visitors never sign in; they only ever see what this account has been playing.
 */

export class SpotifyNotConfigured extends Error {
  constructor() {
    super("SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET and SPOTIFY_REFRESH_TOKEN must be set");
  }
}

type SpotifyImage = { url: string; width: number | null; height: number | null };
type SpotifyTrack = {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: SpotifyImage[] };
  duration_ms: number;
  external_ids?: { isrc?: string };
  external_urls: { spotify: string };
};
type SpotifyArtist = {
  id: string;
  name: string;
  genres?: string[];
  images?: SpotifyImage[];
  external_urls: { spotify: string };
};
type CurrentlyPlaying = {
  is_playing: boolean;
  progress_ms: number | null;
  currently_playing_type: string;
  item: SpotifyTrack | null;
};
type RecentlyPlayed = { items: { track: SpotifyTrack; played_at: string }[] };
type Paged<T> = { items: T[] };

let token: { value: string; expiresAt: number } | null = null;

async function accessToken(): Promise<string> {
  if (token && Date.now() < token.expiresAt) return token.value;
  const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret, SPOTIFY_REFRESH_TOKEN: refresh } = process.env;
  if (!id || !secret || !refresh) throw new SpotifyNotConfigured();

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refresh }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Spotify token refresh failed: ${res.status}`);
  const body = (await res.json()) as { access_token: string; expires_in: number };
  // Refresh a minute early so a token never expires mid-request.
  token = { value: body.access_token, expiresAt: Date.now() + (body.expires_in - 60) * 1000 };
  return token.value;
}

/** GET a Web API path; `null` for 204 No Content (e.g. nothing playing). */
async function api<T>(path: string): Promise<T | null> {
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${await accessToken()}` },
    cache: "no-store",
  });
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`Spotify ${path} failed: ${res.status}`);
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : null;
}

/** Spotify lists images largest first. */
const largest = (images: SpotifyImage[] | undefined) => images?.[0]?.url ?? null;

function toTrack(track: SpotifyTrack): Track {
  return {
    id: track.id,
    title: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    album: track.album.name,
    artworkUrl: largest(track.album.images),
    durationMs: track.duration_ms,
    isrc: track.external_ids?.isrc,
    spotifyUrl: track.external_urls.spotify,
  };
}

/** What I'm playing now, or else the last thing I played; `null` if Spotify has neither. */
export async function getNowPlaying(): Promise<NowPlaying | null> {
  const fetchedAt = Date.now();
  const current = await api<CurrentlyPlaying>("/me/player/currently-playing");
  // Podcasts and ads come back without a track; treat them as nothing playing.
  if (current?.item && current.currently_playing_type === "track") {
    return {
      track: toTrack(current.item),
      isPlaying: current.is_playing,
      progressMs: current.progress_ms ?? 0,
      playedAt: null,
      fetchedAt,
    };
  }
  const recent = await api<RecentlyPlayed>("/me/player/recently-played?limit=1");
  const last = recent?.items[0];
  if (!last) return null;
  return { track: toTrack(last.track), isPlaying: false, progressMs: 0, playedAt: last.played_at, fetchedAt };
}

export async function getTopTracks(): Promise<Track[]> {
  const page = await api<Paged<SpotifyTrack>>("/me/top/tracks?time_range=short_term&limit=20");
  return page?.items.map(toTrack) ?? [];
}

export async function getTopArtists(): Promise<Artist[]> {
  const page = await api<Paged<SpotifyArtist>>("/me/top/artists?time_range=short_term&limit=10");
  return (
    page?.items.map((artist) => ({
      id: artist.id,
      name: artist.name,
      imageUrl: largest(artist.images),
      genres: artist.genres ?? [],
      spotifyUrl: artist.external_urls.spotify,
    })) ?? []
  );
}
