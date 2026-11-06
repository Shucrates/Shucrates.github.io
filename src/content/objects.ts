/** Hover animations; see `hoverVariants` in src/components/space/ObjectLink.tsx. */
export type HoverAnimation = "none" | "lift" | "pulse" | "swing" | "tilt" | "shuffle" | "wobble";

/** Objects with their own art and click behaviour, instead of an image and a plain link. */
export type Interaction = "camera" | "laptop" | "card" | "medal" | "ipod" | "folder";

export type SpaceObject = {
  id: string;
  /** What the object holds, shown in the index, e.g. "my work". */
  label: string;
  /** The object itself, shown in the title while it's hovered: "shubham’s [laptop]". */
  name: string;
  /** Route slug, served at /{section}. */
  section: string;
  /** Short line shown on the section's page. */
  description: string;
  /** Path under /public, e.g. "/objects/posters.png". `null` renders a dashed "TBD" placeholder. */
  image: string | null;
  alt: string;
  /** Intrinsic image size in px; only the aspect ratio affects layout. */
  width: number;
  height: number;
  /** Relative display size; 1 is the default. */
  scale: number;
  /** Number shown as [n]; also sets keyboard tab order. */
  order: number;
  /** Center of the object on desktop, in % of the stage (0–100). */
  x: number;
  y: number;
  hover: HoverAnimation;
  /** Replaces `image` with interactive art; see src/components/space/ObjectLink.tsx. */
  interaction?: Interaction;
};

export const objects: SpaceObject[] = [
  {
    id: "camera",
    label: "content",
    name: "camera",
    section: "shuisbored",
    description: "The Bored Files, my creative channel.",
    image: null,
    alt: "A Canon PowerShot SX510 HS camera",
    width: 319,
    height: 207,
    scale: 1.15,
    order: 2,
    x: 47,
    y: 19,
    hover: "none",
    interaction: "camera",
  },
  {
    id: "laptop",
    label: "my work",
    name: "laptop",
    section: "projects",
    description: "Things I've designed and built.",
    image: null,
    alt: "A silver MacBook Air",
    width: 1200,
    height: 800,
    scale: 1.25,
    order: 1,
    x: 18,
    y: 24,
    hover: "none",
    interaction: "laptop",
  },
  {
    id: "ipod",
    label: "ipod",
    name: "ipod",
    section: "music",
    description: "Who I'm listening to.",
    image: null,
    alt: "A silver iPod classic",
    width: 618,
    height: 1035,
    scale: 0.95,
    order: 3,
    x: 81,
    y: 24,
    hover: "none",
    interaction: "ipod",
  },
  {
    id: "medal",
    label: "achievements",
    name: "medal",
    section: "achievements",
    description: "Awards and milestones.",
    image: null,
    alt: "A gold medal on a ribbon",
    width: 600,
    height: 1116,
    scale: 1.05,
    order: 5,
    x: 37,
    y: 78,
    hover: "none",
    interaction: "medal",
  },
  {
    id: "card",
    label: "contact",
    name: "card",
    section: "contact",
    description: "Say hello.",
    image: null,
    alt: "Shubham's NFC visiting card",
    width: 1050,
    height: 600,
    scale: 1.1,
    order: 7,
    x: 83,
    y: 74,
    hover: "none",
    interaction: "card",
  },
  {
    id: "posters",
    label: "posters",
    name: "posters",
    section: "posters",
    description: "A folder of graphic design posters.",
    image: null,
    alt: "A manila folder stuffed with paper",
    width: 700,
    height: 1000,
    scale: 1.1,
    order: 4,
    x: 14,
    y: 76,
    hover: "none",
    interaction: "folder",
  },
  {
    id: "experience",
    label: "about me",
    name: "experience",
    section: "about",
    description: "Who I am and where I've worked.",
    image: null,
    alt: "Placeholder for the about me object",
    width: 800,
    height: 800,
    scale: 0.85,
    order: 6,
    x: 62,
    y: 76,
    hover: "wobble",
  },
];

export const sortedObjects = [...objects].sort((a, b) => a.order - b.order);

export function findObjectBySection(section: string): SpaceObject | undefined {
  return objects.find((object) => object.section === section);
}
