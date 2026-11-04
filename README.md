# Shubham's space

Portfolio site: the things I make things with, laid out around a centered title.
Each object opens a section of the portfolio.
Next.js (App Router) + TypeScript + Tailwind CSS + Framer Motion, deployed on Vercel
(patilshubham.me) from `main`.

```sh
pnpm install
pnpm dev     # http://localhost:3000
pnpm lint
pnpm build
```

## Where things live

| What | File |
| --- | --- |
| Objects | `src/content/objects.ts` |
| Title, hashtag, name, tagline, top-bar links | `src/content/site.ts` |
| Colors, fonts, radii, spacing, shadow | `src/app/globals.css` (`@theme` block) |
| Object images | `public/objects/` |
| Camera videos (/shuisbored) | `src/content/shuisbored.ts` |
| Resume | `public/resume.pdf` |
| All-time favourite songs (/music) | `src/content/favourites.ts` |

## Add, remove or replace an object

Every object is one entry in `src/content/objects.ts`; nothing else needs to change.
Its section page (`/{section}`) is generated from the same entry.

- **Replace an image:** drop a transparent PNG/WebP into `public/objects/` under the
  same filename (e.g. `laptop.png`). If its aspect ratio differs from the
  placeholder, update `width` and `height` to the file's pixel size. Images are
  never stretched; they're fitted inside their box.
- **Add an object:** append an entry with a unique `id`, a `section` slug, `image`,
  `alt`, `width`/`height`, `scale` (1 = default size), `order` (the `[n]` label,
  also the keyboard tab order), `x`/`y` and `hover` (see below).
- **Object not decided yet:** set `image: null` to show a dashed "TBD" placeholder.
- **Remove an object:** delete its entry.

## Change the layout

On desktop each object is centered at its `x`/`y` in `src/content/objects.ts`,
as a percentage of the area between the top bar and the index line (`x: 50, y: 50`
is the middle, where the title sits). Keep objects clear of the title band
(roughly `y` 35–65 near the center). Make an object bigger or smaller with `scale`.
On phones (<768px) objects ignore `x`/`y` and fall into a two-column grid in `order`.

## Hover animations

Set `hover` on an object to one of `lift`, `pulse`, `flash`, `swing`, `tilt`,
`shuffle` or `wobble`. They're defined in `hoverVariants` in
`src/components/space/ObjectLink.tsx`; add a new one there and to the
`HoverAnimation` type. Animations are skipped for visitors with reduced motion on.

## Interactive objects

An object with `interaction` set draws its own art and runs its own click
behaviour instead of linking straight to a stub page. Its route lives in its own
folder (e.g. `src/app/shuisbored/`) and is skipped by the generic `[section]` page.

**Camera** (`interaction: "camera"`, code in `src/components/camera/`): a 3D
Canon PowerShot SX510 HS (three.js). One `<CameraStage>` in the root layout draws
it across pages: on `/` it sits in its slot and hovering extends the lens and opens
the lens cover; going to `/shuisbored` turns it around and fills the screen with its
back, where the LCD plays videos and its buttons work; going back flies it home.

| Button | Key | Does |
| --- | --- | --- |
| dial ◂ ▸ | ← → | previous / next video (moves the cursor when the menu is open) |
| dial ▴ ▾ | ↑ ↓ | move the menu cursor |
| FUNC.SET | Enter | play/pause, or pick the highlighted video in the menu |
| ▶ (playback) | Space | play/pause |
| (( )) Wi-Fi | R | restart the video |
| MENU | M | open/close the video list |
| frame button (top left) | I | show/hide the on-screen info |
| | Esc | close the menu, then go back to the space |

Add videos to `src/content/shuisbored.ts` (mp4/webm under `public/videos/` or a URL).
The model is built from a CC BY Sketchfab asset; see `scripts/camera/README.md`.
LCD and button positions (in model coordinates) live in
`src/components/camera/geometry.ts`.

**iPod** (`/music`, code in `src/components/ipod/`): a 3D iPod whose screen runs
an iPod classic-style menu of what I listen to, and whose click wheel works. Drag round
the wheel (or scroll over it) to move, press the centre to select, and the edges for
MENU / ⏮ / ⏭ / ▶❚❚. Cover Flow lines up the album covers of every song it knows;
select one to flip it over to its songs. Keys: ↑ ↓ scroll, Enter selects, Esc or Backspace goes back,
Space plays/pauses, ← → skip. Songs play their 30-second preview from Deezer or iTunes.

## Music (Spotify)

The iPod's Now Playing, Top Songs and Top Artists read my Spotify account through
the `/api/music/*` routes. Visitors never sign in. Without the Spotify env vars the
iPod still works: it just shows All-Time Favourites and About.

1. **Create a Spotify app** at <https://developer.spotify.com/dashboard>. Add
   `http://127.0.0.1:3000/callback` as a redirect URI (Spotify doesn't accept
   `localhost`) and tick "Web API". Copy the client ID and secret.
2. **Get a refresh token.** Put the ID and secret in `.env.local` (git ignores it) as
   `SPOTIFY_CLIENT_ID=...` and `SPOTIFY_CLIENT_SECRET=...` on their own lines,
   stop `pnpm dev` (it uses the same port), then run:

   ```sh
   node scripts/spotify-auth.ts
   ```

   Open the URL it prints, sign in as yourself, and copy the
   `SPOTIFY_REFRESH_TOKEN=...` line it prints into `.env.local`. It asks for
   `user-read-currently-playing`, `user-read-recently-played` and `user-top-read`.
   The token lasts until you remove the app's access in your Spotify account settings.
3. **Set the env vars on Vercel.** In the project's Settings → Environment Variables,
   add `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` and `SPOTIFY_REFRESH_TOKEN` (for
   Production and Preview), then redeploy. They're only read on the server.

Now Playing is cached for 30 seconds and the top lists for an hour. Previews come from
Deezer (by ISRC) or iTunes Search; the iPod only plays their own preview URLs.

**Edit favourites:** change the `{ title, artist, note? }` entries in
`src/content/favourites.ts`. Spell the title and artist as Spotify does; the artwork
and preview are found from them. A song with no match shows "No preview available".

## TODO

- Real Instagram URL in `src/content/site.ts`.
- Real object cutouts and resume.
- Videos for the camera.
- Real all-time favourites in `src/content/favourites.ts`.
