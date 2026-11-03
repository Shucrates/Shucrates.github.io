export type Achievement = {
  id: string;
  title: string;
  /** Who gave it, or where it happened. */
  issuer: string;
  year: number;
  /** Link to the project, certificate or announcement; `null` while there isn't one. */
  href: string | null;
};

// TODO: replace with the real achievements.
export const achievements: Achievement[] = [
  { id: "achievement-1", title: "Achievement One", issuer: "Organisation", year: 2026, href: null },
  { id: "achievement-2", title: "Achievement Two", issuer: "Organisation", year: 2025, href: null },
  { id: "achievement-3", title: "Achievement Three", issuer: "Organisation", year: 2025, href: null },
  { id: "achievement-4", title: "Achievement Four", issuer: "Organisation", year: 2024, href: null },
  { id: "achievement-5", title: "Achievement Five", issuer: "Organisation", year: 2023, href: null },
];
