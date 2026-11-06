/*
 * Graphic design posters, shown at /posters. Images live in public/posters/, built from the
 * source PNGs by scripts/posters/build.mjs: `{id}.webp` (large) and `{id}-thumb.webp`.
 * Order here is the order on the page.
 */

export type Poster = {
  /** Image file name in public/posters/, without ".webp". */
  id: string;
  title: string;
  /** e.g. "Event poster", "Cover art". */
  kind: string;
  /** `null` while unknown; shown as "—". */
  year: number | null;
  /** Who it was for, if anyone. */
  client?: string;
  description: string;
  tools: string[];
  /** Pixel size of the large image; only the aspect ratio matters. */
  width: number;
  height: number;
};

// TODO: years, clients and descriptions are guesses from the artwork; replace with the real story.
export const posters: Poster[] = [
  {
    id: "how-much-a-dollar-cost-poster",
    title: "How Much a Dollar Cost",
    kind: "Typographic poster",
    year: null,
    description: "Riso-blue type stacked over a torn dollar, after the Kendrick Lamar track.",
    tools: ["Photoshop", "Illustrator"],
    width: 1440,
    height: 1800,
  },
  {
    id: "joji-camera-poster-5",
    title: "I Don’t Smile for the Camera",
    kind: "Music poster",
    year: null,
    description: "A halftone camera and a lyric that wraps around it, in blue on paper.",
    tools: ["Photoshop"],
    width: 1440,
    height: 1800,
  },
  {
    id: "ashish-trc-artist-poster",
    title: "The Remix Room",
    kind: "Event poster",
    year: 2026,
    client: "Ashish Rautham",
    description: "Artist poster for a classics-vs-contemporary karaoke night in Parramatta.",
    tools: ["Photoshop"],
    width: 1440,
    height: 1800,
  },
  {
    id: "kanye-west-x-lotr-poster-2",
    title: "Power",
    kind: "Fan poster",
    year: null,
    description: "Kanye West meets The Lord of the Rings: “No one man should have all that power.”",
    tools: ["Photoshop"],
    width: 1800,
    height: 1800,
  },
  {
    id: "art-vs-artist-poster-4",
    title: "Should We Separate Art from the Artist?",
    kind: "Editorial poster",
    year: null,
    description: "A collage essay on paper, asking the question in its title.",
    tools: ["Photoshop", "InDesign"],
    width: 1440,
    height: 1800,
  },
  {
    id: "control-is-an-illusion-poster-mrrobot-shuisbored",
    title: "Control Is an Illusion",
    kind: "Fan poster",
    year: null,
    client: "shuisbored",
    description: "Mr. Robot, in violet: a line from the show over a smoker in profile.",
    tools: ["Photoshop"],
    width: 1080,
    height: 1080,
  },
  {
    id: "shubham-missing-poster-2",
    title: "Missing Purpose",
    kind: "Personal poster",
    year: null,
    description: "A self-portrait as a missing-person flyer, in Hindi and English: लापता.",
    tools: ["Photoshop"],
    width: 1440,
    height: 1800,
  },
  {
    id: "euphoria-poster-1",
    title: "Euphoria",
    kind: "Cover art",
    year: null,
    description: "Duotone portrait on cream, with the title set small and spaced out.",
    tools: ["Photoshop"],
    width: 1800,
    height: 1800,
  },
  {
    id: "whiplash-poster-black-2",
    title: "Whiplash",
    kind: "Film poster",
    year: null,
    description: "A drummer in grain and grey, under the film’s most quoted line.",
    tools: ["Photoshop"],
    width: 1440,
    height: 1800,
  },
  {
    id: "vivid-to-void-poster",
    title: "Vivid to Void",
    kind: "Typographic poster",
    year: null,
    description: "The title repeated three times, fading out against violet and grey.",
    tools: ["Photoshop", "Illustrator"],
    width: 1800,
    height: 1800,
  },
  {
    id: "afterglow-concert-flyer",
    title: "AfterGlow",
    kind: "Concert flyer",
    year: null,
    description: "A clipped paper invite over a sunset crowd, for an evening of music by the coastline.",
    tools: ["Photoshop", "Illustrator"],
    width: 1440,
    height: 1800,
  },
  {
    id: "sidhatek-poster-shuisbored",
    title: "सिद्धटेक (Siddhatek)",
    kind: "Cover art",
    year: null,
    client: "shuisbored",
    description: "Devanagari title in orange over a temple at night.",
    tools: ["Photoshop"],
    width: 1800,
    height: 1800,
  },
  {
    id: "varun-and-soham-poster",
    title: "Varun & Soham",
    kind: "Event poster",
    year: null,
    client: "The Palm Lume",
    description: "Episode 3 of a living-room concert series, starring Varun and Soham.",
    tools: ["Photoshop"],
    width: 1080,
    height: 1350,
  },
  {
    id: "palm-lume-event-poster",
    title: "The Palm Lume",
    kind: "Event poster",
    year: null,
    client: "The Palm Lume",
    description: "A contact sheet of warm-lit moments from the concert series.",
    tools: ["Photoshop", "Lightroom"],
    width: 1440,
    height: 1800,
  },
  {
    id: "aaroha-audition-poster-v1",
    title: "Aaroha Auditions",
    kind: "Event poster",
    year: null,
    client: "Aaroha",
    description: "“The winner takes it all”: audition call in red and yellow.",
    tools: ["Photoshop"],
    width: 1080,
    height: 1350,
  },
  {
    id: "aaroha-audition-poster-v2",
    title: "Aaroha Auditions (alt)",
    kind: "Event poster",
    year: null,
    client: "Aaroha",
    description: "The darker, greener take on the same audition call.",
    tools: ["Photoshop"],
    width: 1080,
    height: 1350,
  },
  {
    id: "bytecamp-theme-poster-utopia-3",
    title: "Utopia",
    kind: "Theme poster",
    year: null,
    client: "ByteCamp",
    description: "A red wireframe head on black, the theme reveal for ByteCamp.",
    tools: ["Photoshop", "Blender"],
    width: 1128,
    height: 1594,
  },
];

export const posterImage = (poster: Poster, size: "large" | "thumb" = "large") =>
  `/posters/${poster.id}${size === "thumb" ? "-thumb" : ""}.webp`;
