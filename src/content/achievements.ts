export type Achievement = {
  id: string;
  title: string;
  /** Who gave it, or where it happened. */
  issuer: string;
  year: number;
  /** Link to the project, certificate or announcement; `null` while there isn't one. */
  href: string | null;
};

/** Recognition the projects received, newest first. */
export const achievements: Achievement[] = [
  {
    id: "demos-anon",
    title: "Speaker, Demos Anon",
    issuer: "Dogpatch Labs, Dublin",
    year: 2026,
    href: "/projects/id-card/",
  },
  {
    id: "sarvam-top-12",
    title: "Top 12, Sarvam BuildIn' Hours",
    issuer: "Sarvam AI, Bengaluru",
    year: 2026,
    href: "/projects/praman/",
  },
  {
    id: "ieee-paper",
    title: "Published paper, ICCUBEA 2025",
    issuer: "IEEE Xplore",
    year: 2025,
    href: "/projects/speaker-encoder/",
  },
  {
    id: "isro-chairman",
    title: "Presented SeaGuard to ISRO's Chairman",
    issuer: "Dr. V. Narayanan, ISRO",
    year: 2025,
    href: "/projects/seaguard/",
  },
  {
    id: "hackcelestial",
    title: "Most Product Readiness, HackCelestial 2.0",
    issuer: "Pillai College of Engineering",
    year: 2025,
    href: "/projects/seaguard/",
  },
];
