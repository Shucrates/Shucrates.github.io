/** Shapes shared by the music API routes and the iPod that reads them. */

export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  artworkUrl: string | null;
  durationMs: number;
  isrc?: string;
  /** The song on Spotify, or a Spotify search for it when there's no exact link. */
  spotifyUrl: string;
  /** A 30s preview that doesn't expire (iTunes); otherwise looked up when played. */
  previewUrl?: string | null;
  /** Why it's a favourite (src/content/favourites.ts). */
  note?: string;
};

export type Artist = {
  id: string;
  name: string;
  imageUrl: string | null;
  genres: string[];
  spotifyUrl: string;
};

export type NowPlaying = {
  track: Track;
  /** Playing right now; false means it's the last thing I played. */
  isPlaying: boolean;
  progressMs: number;
  /** ISO time it was last played, when it isn't playing now. */
  playedAt: string | null;
  /** When Spotify was asked, so the client can keep the progress ticking. */
  fetchedAt: number;
};

export type PreviewSource = "deezer" | "itunes";

export type Preview = {
  previewUrl: string | null;
  source: PreviewSource | null;
  /** The song on the preview's own site. */
  externalUrl: string | null;
};

/** Body of a failed /api/music response. `not-configured` means the Spotify env vars aren't set. */
export type MusicError = { error: "not-configured" | "upstream" };

/** Spotify search for a song, for when there's no direct link. */
export const spotifySearchUrl = (title: string, artist: string) =>
  `https://open.spotify.com/search/${encodeURIComponent(`${title} ${artist}`)}`;
