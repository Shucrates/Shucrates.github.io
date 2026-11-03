import type { Artist, Track } from "@/lib/music-types";
import type { Loadable, Music, Resource } from "./useMusic";

/**
 * The iPod's menus as data: which screens exist, what rows each one lists and what
 * selecting a row does. The screen components only draw what this returns.
 */

export type View =
  | { kind: "root" }
  | { kind: "now-playing" }
  | { kind: "songs"; list: "topTracks" | "favourites" }
  | { kind: "artists" }
  | { kind: "artist"; artist: Artist }
  | { kind: "about" }
  | { kind: "cover-flow" }
  /** An album flipped over in Cover Flow, showing its songs. */
  | { kind: "album"; album: Album };

/** Songs grouped by the album they're from, for Cover Flow. */
export type Album = { key: string; title: string; artist: string; artworkUrl: string | null; tracks: Track[] };

/** A screen on the stack, with its selected row and the first row scrolled into view. */
export type Frame = { id: number; view: View; cursor: number; first: number };

export type Action =
  | { type: "open"; view: View }
  | { type: "play"; queue: Track[]; index: number }
  | { type: "retry"; resource: Resource }
  | null;

export type Row = {
  key: string;
  label: string;
  /** Second line on song rows (the artist). */
  detail?: string;
  /** Opens a submenu: draws the "›". */
  arrow?: boolean;
  action: Action;
};

/** The screen is designed at 320×240 and scaled to fit the iPod. */
export const SCREEN = { width: 320, height: 240 };
export const TITLE_BAR = 22;
export const BODY = SCREEN.height - TITLE_BAR;
export const ARTIST_HEADER = 84;
/** Cover Flow's flipped album: a square card with the album's name over its song list. */
export const ALBUM_CARD = 150;
export const ALBUM_HEADER = 30;

export const NAME = "Shubham's iPod";

export function titleOf(view: View) {
  switch (view.kind) {
    case "root":
      return NAME;
    case "now-playing":
      return "Now Playing";
    case "songs":
      return view.list === "topTracks" ? "Top Songs" : "Favourites";
    case "artists":
      return "Top Artists";
    case "artist":
      return view.artist.name;
    case "about":
      return "About";
    case "cover-flow":
      return "Cover Flow";
    case "album":
      return view.album.title;
  }
}

/** How many rows fit, and how tall each one is (in screen px). */
export function listLayout(view: View) {
  if (view.kind === "artist") return { visible: 3, rowHeight: (BODY - ARTIST_HEADER) / 3 };
  if (view.kind === "songs") return { visible: 5, rowHeight: BODY / 5 };
  if (view.kind === "album") return { visible: 4, rowHeight: (ALBUM_CARD - ALBUM_HEADER) / 4 };
  // Cover Flow shows one album at a time.
  if (view.kind === "cover-flow") return { visible: 1, rowHeight: BODY };
  return { visible: 7, rowHeight: BODY / 7 };
}

const ERROR_ROW = "Couldn't load — try again";

function songRows(tracks: Track[]): Row[] {
  return tracks.map((track, index) => ({
    key: track.id,
    label: track.title,
    detail: track.artist,
    action: { type: "play", queue: tracks, index },
  }));
}

/** Rows for a list that's loading (none yet), failed (one retry row) or loaded. */
function fromLoadable<T>(resource: Resource, loadable: Loadable<T>, rows: (data: T) => Row[], empty: string): Row[] {
  if (loadable.status === "error") return [{ key: "retry", label: ERROR_ROW, action: { type: "retry", resource } }];
  if (loadable.status !== "ok") return [];
  const list = rows(loadable.data);
  return list.length ? list : [{ key: "empty", label: empty, action: null }];
}

/** My top songs by this artist; Spotify joins several artists with ", ". */
export function tracksBy(artist: Artist, tracks: Track[]) {
  return tracks.filter((track) => track.artist.split(", ").includes(artist.name));
}

/** Every song the iPod knows, grouped by album, in the order they're first listed. */
export function albumsOf(music: Music): Album[] {
  const albums = new Map<string, Album>();
  const tracks = [music.nowPlaying.status === "ok" ? music.nowPlaying.data?.track : null, ...[music.topTracks, music.favourites].flatMap((l) => (l.status === "ok" ? l.data : []))];
  for (const track of tracks) {
    if (!track) continue;
    // A favourite with no match has no album; it gets a cover of its own.
    const title = track.album || track.title;
    const artist = track.artist.split(", ")[0];
    const key = `${title}|${artist}`.toLowerCase();
    const album = albums.get(key) ?? { key, title, artist, artworkUrl: track.artworkUrl, tracks: [] };
    album.artworkUrl ??= track.artworkUrl;
    if (!album.tracks.some((t) => t.title === track.title)) album.tracks.push(track);
    albums.set(key, album);
  }
  return [...albums.values()];
}

export function rowsOf(view: View, music: Music): Row[] {
  switch (view.kind) {
    case "root": {
      const open = (key: string, label: string, view: View): Row => ({ key, label, arrow: true, action: { type: "open", view } });
      // Without Spotify set up, the iPod just plays the favourites.
      const spotify = music.topTracks.status !== "off";
      return [
        open("now-playing", "Now Playing", { kind: "now-playing" }),
        open("cover-flow", "Cover Flow", { kind: "cover-flow" }),
        ...(spotify
          ? [
              open("top-songs", "Top Songs", { kind: "songs", list: "topTracks" }),
              open("top-artists", "Top Artists", { kind: "artists" }),
            ]
          : []),
        open("favourites", "All-Time Favourites", { kind: "songs", list: "favourites" }),
        open("about", "About", { kind: "about" }),
      ];
    }
    case "songs":
      return fromLoadable(view.list, music[view.list], songRows, "Nothing here yet");
    case "artists":
      return fromLoadable(
        "topArtists",
        music.topArtists,
        (artists) =>
          artists.map((artist) => ({ key: artist.id, label: artist.name, arrow: true, action: { type: "open", view: { kind: "artist", artist } } })),
        "Nothing here yet",
      );
    case "artist":
      return fromLoadable("topTracks", music.topTracks, (tracks) => songRows(tracksBy(view.artist, tracks)), "No top songs by them this month");
    case "cover-flow": {
      const albums = albumsOf(music);
      if (albums.length) {
        return albums.map((album) => ({ key: album.key, label: album.title, detail: album.artist, action: { type: "open", view: { kind: "album", album } } }));
      }
      const loading = Object.values(music).some((l) => l.status === "loading");
      return loading ? [] : [{ key: "empty", label: "No albums yet", action: null }];
    }
    case "album":
      // The artist is already on the card, so rows are just the song titles.
      return songRows(view.album.tracks).map((row) => ({ ...row, detail: undefined }));
    case "now-playing":
    case "about":
      return [];
  }
}

/** Every song the iPod knows, counted once. */
export function songCount(music: Music) {
  const keys = new Set<string>();
  for (const loadable of [music.topTracks, music.favourites]) {
    if (loadable.status === "ok") loadable.data.forEach((t) => keys.add(`${t.title}|${t.artist}`.toLowerCase()));
  }
  return keys.size;
}

/** Moves the cursor to `to` (clamped), scrolling only as far as needed to keep it in view. */
export function moveTo(frame: Frame, to: number, count: number): Frame {
  const { visible } = listLayout(frame.view);
  const cursor = Math.max(0, Math.min(count - 1, to));
  const first = Math.max(0, Math.min(frame.first, cursor, Math.max(0, count - visible)), cursor - visible + 1);
  return { ...frame, cursor, first };
}
