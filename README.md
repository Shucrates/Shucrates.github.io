# Shubham's space

Portfolio site: the things I make things with, laid out around a centered title.
Each object opens a section of the portfolio.
Next.js (App Router) + TypeScript + Tailwind CSS + Framer Motion, exported as static files
and deployed to GitHub Pages (patilshubham.me) by `.github/workflows/deploy.yml` on every push to `main`.

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

## TODO

- Real Instagram URL in `src/content/site.ts`.
- Real object cutouts and resume.
- Videos for the camera.
