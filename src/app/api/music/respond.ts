import type { MusicError } from "@/lib/music-types";
import { SpotifyNotConfigured } from "@/lib/spotify";

/** JSON the CDN may cache for `seconds`, then serve stale for as long again while it refreshes. */
export function cached<T>(data: T, seconds: number) {
  return Response.json(data, {
    headers: { "Cache-Control": `public, s-maxage=${seconds}, stale-while-revalidate=${seconds}` },
  });
}

/** Failures are never cached, so "try again" on the iPod really tries again. */
export function failed(error: unknown) {
  const notConfigured = error instanceof SpotifyNotConfigured;
  if (!notConfigured) console.error(error);
  const body: MusicError = { error: notConfigured ? "not-configured" : "upstream" };
  return Response.json(body, { status: notConfigured ? 503 : 502, headers: { "Cache-Control": "no-store" } });
}
