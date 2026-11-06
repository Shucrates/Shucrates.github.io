import { numbers } from "./numbers";

export type EpisodeFormat = "bored files" | "shubham notices" | "nowhere in particular" | "idk i made this" | "cmiygl" | "collab";

export type Episode = {
  id: string;
  /** The big heading next to the camera, e.g. "episode 10" or "philips collab". */
  label: string;
  title: string;
  format: EpisodeFormat;
  /** ISO date it was posted, e.g. "2026-06-14". Left out until known; the LCD shows "--.----". */
  date?: string;
  /** Path under /public (e.g. "/videos/id-card.mp4") or a full URL to an mp4. `null` shows "video to be added". */
  src: string | null;
  /** Still shown before the video loads, e.g. "/videos/posters/id-card.webp". */
  poster?: string;
  durationSec: number;
  orientation: "vertical" | "horizontal";
  /** WebVTT captions, e.g. "/videos/captions/id-card.vtt". */
  captions?: string;
  instagramUrl: string;
  stats?: { views?: number; likes?: number; saves?: number; shares?: number };
  /** The story next to the camera, a paragraph per entry. */
  story: string[];
  /** A link under the story, e.g. the ID generator. */
  link?: { label: string; href: string };
};

const instagram = "https://www.instagram.com/shuisbored/";

/** The page around the camera. */
export const show = {
  title: "the bored files",
  handle: "@shuisbored",
  presents: "presents",
  intro: ["This is the place on the internet, where i let my creativity splurge.", "Click on a video to learn more about it"],
  hint: "(scroll down or pick an episode)",
  instagram,
};

/** The compressed copy in /public/videos and its poster. */
const video = (slug: string) => ({ src: `/videos/${slug}.mp4`, poster: `/videos/posters/${slug}.webp` });

/**
 * Only the episodes that moved the story along, in order; each gets its own
 * screen next to the camera.
 */
// TODO: dates and each video's own Instagram link.
export const episodes: Episode[] = [
  {
    id: "first-bored-file",
    label: "episode 0",
    title: "the first bored file",
    format: "bored files",
    date: "2026-05-25",
    ...video("bored-files-0"),
    durationSec: 50,
    orientation: "horizontal",
    instagramUrl: instagram,
    stats: { views: 11_600, likes: 441 },
    story: [
      "i've always wanted to create content, ever since i was very young. i grew up watching so many creatives on youtube.",
      "i started out editing and making content for my college's technical club, then slowly started my own creative space on instagram, @shuisbored, where i used to post poster designs i made in photoshop.",
      "episode 0 is when i finally decided to start creating content and got the courage to talk in front of the camera. i called it the bored files, where i document moments from my life.",
      "this is me finally letting my inner creative child out. i hope you enjoy your stay :)",
    ],
  },
  {
    id: "coffee",
    label: "episode 1",
    title: "coffee",
    format: "bored files",
    ...video("bored-files-1"),
    durationSec: 36,
    orientation: "horizontal",
    instagramUrl: instagram,
    stats: { views: 7_000, likes: 247 },
    story: [
      "this is me testing the waters with different types of content. i had a rough script for a video with a hidden, philosophical-ish meaning.",
      "i also wanted to make a coffee making video, so i just combined the two lol",
    ],
  },
  {
    id: "leg-day",
    label: "episode 2",
    title: "leg day",
    format: "bored files",
    ...video("bored-files-2"),
    durationSec: 53,
    orientation: "horizontal",
    instagramUrl: instagram,
    stats: { views: 6_400, likes: 246 },
    story: [
      "again, documenting life frame by frame. i made a gym vlog with my friend, with cool ahh transitions we thought of on the spot.",
      "i also gained some courage to shoot in public.",
    ],
  },
  {
    id: "the-boy-at-the-signal",
    label: "episode 3",
    title: "the boy at the signal",
    format: "bored files",
    ...video("bored-files-3"),
    durationSec: 55,
    orientation: "horizontal",
    instagramUrl: instagram,
    stats: { views: 5_800, likes: 227 },
    story: [
      "this video is about an experience i had with a child at a traffic signal.",
      "the shots were mostly taken after the incident. it happened in the morning, i took shots on my evening walk, and somehow stitched the clips together to make them feel coherent.",
      "also, made my mom say something in the intro hehe",
    ],
  },
  {
    id: "shawarma",
    label: "episode 5",
    title: "shawarma",
    format: "bored files",
    ...video("bored-files-5"),
    durationSec: 97,
    orientation: "horizontal",
    instagramUrl: instagram,
    stats: { views: 8_400, likes: 235 },
    story: [
      "one of my fav videos. it's a vlog of me and my friends eating at our fav shawarma spot near college and reviewing the food.",
      "had lots of fun with the sound effects. sometimes you don't need a script to make a good video.",
    ],
  },
  {
    id: "run-club",
    label: "episode 6",
    title: "run club",
    format: "bored files",
    ...video("bored-files-6"),
    durationSec: 40,
    orientation: "horizontal",
    instagramUrl: instagram,
    stats: { views: 17_900, likes: 335 },
    story: [
      "another banger: a collaboration with trct (the run club thane), my town's local run club.",
      "i went to their 1 year anniversary post-run party with my camera, and the rest is history. really loved the energy of everyone in the video. missing my sunday mornings back home.",
    ],
  },
  {
    id: "keychain",
    label: "episode 10",
    title: "the keychain",
    format: "bored files",
    ...video("bored-files-10"),
    durationSec: 36,
    orientation: "vertical",
    instagramUrl: instagram,
    stats: numbers.keychain,
    story: [
      "i'd been making diary vlogs for a while and ran out of ideas. so i tried something more diy: a keychain i'd made, and how i made it.",
      "and it blew up. like, actually blew up.",
    ],
  },
  {
    id: "oscorp-id-card",
    label: "episode 11",
    title: "oscorp id card",
    format: "bored files",
    ...video("bored-files-11"),
    durationSec: 44,
    orientation: "vertical",
    instagramUrl: instagram,
    story: [
      "people wanted more, so i followed up with another tutorial: custom id cards inspired by pop culture.",
      "then i went further and built my own website so anyone could make one from my templates.",
    ],
    link: { label: "make your own id", href: "https://id.patilshubham.me" },
  },
  {
    id: "halfbaked-vault",
    label: "halfbaked collab",
    title: "halfbaked vault collab",
    format: "collab",
    ...video("halfbaked-collab"),
    durationSec: 42,
    orientation: "horizontal",
    instagramUrl: instagram,
    story: [
      "halfbaked vault saw the id card videos. they were doing a similar thing, creative pop culture cards, and reached out to collab.",
      "i made a fun, creative video for the collab on how to use my code to get a discount.",
    ],
  },
  {
    id: "philips",
    label: "philips collab",
    title: "philips oneblade collab",
    format: "collab",
    ...video("philips-collab"),
    durationSec: 62,
    orientation: "vertical",
    instagramUrl: instagram,
    story: [
      "my first proper brand collab: philips, for raksha bandhan.",
      "the brief was to include the brand smoothly within an otherwise normal-seeming video, but make it funny as well.",
    ],
  },
  {
    id: "last-night-in-mumbai",
    label: "episode 16",
    title: "last night in mumbai",
    format: "bored files",
    ...video("bored-files-16"),
    durationSec: 46,
    orientation: "horizontal",
    instagramUrl: instagram,
    story: [
      "probably my favourite episode ever. my last night out in mumbai before moving to dublin.",
      "me and my friends roaming the city at night and ending up at our favourite place, miya kebabs. a love letter to the city and the people in it.",
    ],
  },
  {
    id: "tattoo",
    label: "episode 17",
    title: "tattoo",
    format: "bored files",
    ...video("bored-files-17"),
    durationSec: 35,
    orientation: "horizontal",
    instagramUrl: instagram,
    story: [
      "i had plans to get tattoos, so i thought i might as well make a vlog out of it.",
      "i had this anthony bourdain quote about getting tattoos stuck in my mind, so i took shots that would fit the quote, then overlaid the audio over them.",
      "ps: the ascii art on the home page is one of the tats :)",
    ],
  },
  {
    id: "farewell",
    label: "episode 18",
    title: "farewell",
    format: "bored files",
    ...video("bored-files-18"),
    durationSec: 46,
    orientation: "horizontal",
    instagramUrl: instagram,
    story: [
      "saying goodbye to my family, then finally landing in dublin.",
      "this one is about missing everybody and remembering home, while being ready for whatever comes next.",
      "what's next? more videos, more experiments, more of life written down one bored file at a time. i just love making stuff. follow along to see what happens next.",
    ],
    link: { label: "follow @shuisbored", href: instagram },
  },
];
