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
export const favourites: Favourite[] = [
  { title: "Godspeed", artist: "Frank Ocean" },
  { title: "Gravity", artist: "John Mayer" },
  { title: "SLOW DANCING IN THE DARK", artist: "Joji" },
  { title: "Choo Lo", artist: "The Local Train" },
  { title: "Fix You", artist: "Coldplay" },
  { title: "SUMMER", artist: "BROCKHAMPTON" },
  { title: "Count Me Out", artist: "Kendrick Lamar" },
  { title: "Leaving Toronto", artist: "Mustafa" },
];
