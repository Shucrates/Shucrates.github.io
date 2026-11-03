import type { NextRequest } from "next/server";
import { findSong, NO_PREVIEW } from "@/lib/previews";
import { cached } from "../respond";

/** /api/music/preview?isrc=&title=&artist= → { previewUrl, source, externalUrl } */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const title = params.get("title")?.trim() ?? "";
  const artist = params.get("artist")?.trim() ?? "";
  const isrc = params.get("isrc")?.trim() || undefined;
  if (!title || !artist) return Response.json({ error: "title and artist are required" }, { status: 400 });
  const song = await findSong({ isrc, title, artist });
  // Short-lived: a Deezer preview URL stops working after a while.
  return cached(song?.preview ?? NO_PREVIEW, 300);
}
