export type Favourite = {
  title: string;
  artist: string;
  /** A line about why it's here; shown on the iPod's Now Playing screen. */
  note?: string;
};

/**
 * All-time favourites, in the order the iPod lists them. Artwork and a 30s preview
 * are looked up from the title and artist, so spell them as they appear on Spotify.
 */
// TODO: replace with my real favourites.
export const favourites: Favourite[] = [
  { title: "Replace Me", artist: "Placeholder Artist", note: "Swap in a real song in src/content/favourites.ts" },
  { title: "Another Song", artist: "Placeholder Artist" },
  { title: "One More Song", artist: "Placeholder Artist" },
];
