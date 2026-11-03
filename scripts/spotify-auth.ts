/**
 * One-time: sign in to Spotify as me and print a refresh token for SPOTIFY_REFRESH_TOKEN.
 *
 *   node scripts/spotify-auth.ts
 *
 * Needs SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET (from the shell or .env.local), and
 * http://127.0.0.1:3000/callback as a redirect URI on the Spotify app. Spotify doesn't
 * accept "localhost". Stop `pnpm dev` first; it uses the same port.
 */
import { randomBytes } from "node:crypto";
import { createServer } from "node:http";

const REDIRECT_URI = "http://127.0.0.1:3000/callback";
const SCOPES = ["user-read-currently-playing", "user-read-recently-played", "user-top-read"];

try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local: use the shell's environment.
}
const id = process.env.SPOTIFY_CLIENT_ID;
const secret = process.env.SPOTIFY_CLIENT_SECRET;
if (!id || !secret) {
  console.error("Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET (in .env.local or the shell) first.");
  process.exit(1);
}

const state = randomBytes(16).toString("hex");
const authorize = new URL("https://accounts.spotify.com/authorize");
authorize.search = new URLSearchParams({
  client_id: id,
  response_type: "code",
  redirect_uri: REDIRECT_URI,
  scope: SCOPES.join(" "),
  state,
}).toString();

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", REDIRECT_URI);
  if (url.pathname !== "/callback") {
    res.writeHead(404).end();
    return;
  }
  const code = url.searchParams.get("code");
  if (url.searchParams.get("state") !== state || !code) {
    res.writeHead(400).end(`Sign-in failed: ${url.searchParams.get("error") ?? "state mismatch"}`);
    return;
  }

  const token = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: REDIRECT_URI }),
  });
  const body = (await token.json()) as { refresh_token?: string; error_description?: string };
  if (!token.ok || !body.refresh_token) {
    res.writeHead(500).end("Couldn't get a refresh token; see the terminal.");
    console.error("Token exchange failed:", body.error_description ?? token.status);
    server.close();
    process.exitCode = 1;
    return;
  }

  res.writeHead(200, { "Content-Type": "text/plain" }).end("Done. Your refresh token is in the terminal; you can close this tab.");
  console.log(`\nSPOTIFY_REFRESH_TOKEN=${body.refresh_token}\n`);
  console.log("Add it to .env.local and to the Vercel project's environment variables.");
  server.close();
});

server.listen(3000, "127.0.0.1", () => {
  console.log(`Open this URL and sign in to Spotify:\n\n${authorize}\n`);
});
