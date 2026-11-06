export type CaseStudySection = {
  heading: string;
  body: string;
};

/** Filters in the Finder sidebar, in order. A project can have several. */
export const TAGS = ["Design", "Web/App", "AI/ML", "Research"] as const;
export type Tag = (typeof TAGS)[number];

export type Project = {
  id: string;
  title: string;
  /** One line on what it is and what I did. */
  summary: string;
  year: number;
  /** e.g. "Brand identity", "Product design"; shown as the folder's kind in Finder. */
  kind: string;
  tags: Tag[];
  /** Demo video: path under /public (e.g. "/projects/one.mp4") or a full URL. `null` shows a placeholder. */
  video: string | null;
  /** Optional still shown before the video loads. */
  poster?: string;
  caseStudy: {
    role: string;
    /** e.g. "6 weeks", "2025–2026". */
    duration: string;
    tools: string[];
    sections: CaseStudySection[];
  };
  /** Live site or repo; `null` while there isn't one. */
  href: string | null;
};

const placeholderStudy = (role: string): Project["caseStudy"] => ({
  role,
  duration: "TBD",
  tools: ["Figma", "Next.js"],
  sections: [
    { heading: "Overview", body: "What the project is, who it was for, and my part in it." },
    { heading: "Problem", body: "What wasn't working, and why it mattered." },
    { heading: "Process", body: "How I got there: research, sketches, the dead ends and the turns." },
    { heading: "Outcome", body: "What shipped, and what changed because of it." },
  ],
});

// TODO: replace with the real projects.
export const projects: Project[] = [
  {
    id: "project-1",
    title: "Project One",
    summary: "Brand identity and website",
    year: 2026,
    kind: "Brand identity",
    tags: ["Design", "Web/App"],
    video: null,
    caseStudy: placeholderStudy("Designer and developer"),
    href: null,
  },
  {
    id: "project-2",
    title: "Project Two",
    summary: "Product design for a mobile app",
    year: 2025,
    kind: "Product design",
    tags: ["Design", "Web/App"],
    video: null,
    caseStudy: placeholderStudy("Product designer"),
    href: null,
  },
  {
    id: "project-3",
    title: "Project Three",
    summary: "Creative coding experiment",
    year: 2025,
    kind: "Creative coding",
    tags: ["Web/App", "AI/ML"],
    video: null,
    caseStudy: placeholderStudy("Developer"),
    href: null,
  },
  {
    id: "project-4",
    title: "Project Four",
    summary: "Editorial design system",
    year: 2024,
    kind: "Design system",
    tags: ["Design", "Research"],
    video: null,
    caseStudy: placeholderStudy("Designer"),
    href: null,
  },
];

export const findProject = (id: string) => projects.find((project) => project.id === id);
