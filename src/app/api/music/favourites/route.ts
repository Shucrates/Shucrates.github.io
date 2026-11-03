import { favourites } from "@/content/favourites";
import { spotifySearchUrl, type Track } from "@/lib/music-types";
import { findSong, normalise } from "@/lib/previews";
import { cached } from "../respond";

/** The hand-picked favourites with artwork and iTunes previews filled in. Needs no Spotify. */
export async function GET() {
  const tracks = await Promise.all(
    favourites.map(async ({ title, artist, note }): Promise<Track> => {
      const song = await findSong({ title, artist });
      return {
        id: `fav-${normalise(`${title} ${artist}`).replace(/ /g, "-")}`,
        title,
        artist,
        album: song?.album ?? "",
        artworkUrl: song?.artworkUrl ?? null,
        durationMs: song?.durationMs ?? 0,
        spotifyUrl: spotifySearchUrl(title, artist),
        // iTunes previews don't expire, so they can travel with the list.
        previewUrl: song?.preview.source === "itunes" ? song.preview.previewUrl : undefined,
        note,
      };
    }),
  );
  return cached(tracks, 86400);
}
