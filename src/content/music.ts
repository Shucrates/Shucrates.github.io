export type Track = {
  title: string;
  artist: string;
  /** Spotify (or any) link to the song; `null` while there isn't one. */
  href: string | null;
};

export type Artist = {
  name: string;
  /** The song of theirs I'd play you first. */
  favourite: string;
  /** Spotify (or any) link to the artist; `null` while there isn't one. */
  href: string | null;
};

// TODO: replace with my real favourites.
export const music = {
  artists: [
    { name: "Artist One", favourite: "Song A", href: null },
    { name: "Artist Two", favourite: "Song B", href: null },
    { name: "Artist Three", favourite: "Song C", href: null },
    { name: "Artist Four", favourite: "Song D", href: null },
    { name: "Artist Five", favourite: "Song E", href: null },
    { name: "Artist Six", favourite: "Song F", href: null },
  ] satisfies Artist[],
  onRepeat: [
    { title: "Track One", artist: "Artist One", href: null },
    { title: "Track Two", artist: "Artist Two", href: null },
    { title: "Track Three", artist: "Artist Three", href: null },
    { title: "Track Four", artist: "Artist Four", href: null },
    { title: "Track Five", artist: "Artist Five", href: null },
  ] satisfies Track[],
  /** Full profile or playlist link; `null` hides the menu entry. */
  // TODO: add the Spotify profile link.
  profile: null as string | null,
};

export type Music = typeof music;
