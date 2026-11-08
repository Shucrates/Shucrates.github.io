export type Role = {
  id: string;
  title: string;
  company: string;
  place: string;
  dates: string;
  /** What I did there, in a line or two. */
  summary: string;
  /** Case studies from this role, by project id. */
  projects: string[];
};

/** Where I've worked, newest first. Shown in Finder's Experience folder. */
export const experience: Role[] = [
  {
    id: "freelance",
    title: "Freelance Full-Stack Developer",
    company: "Self-employed",
    place: "Remote",
    dates: "Dec 2025 – Sept 2026",
    summary:
      "Built production Next.js apps for paying clients: a digital lorry-receipt and billing platform for a logistics company, a multilingual recruitment platform, and an online presence for an interior design firm.",
    projects: ["rudra-cargo", "iimsc", "su-design9"],
  },
  {
    id: "norxio",
    title: "UI/UX & Frontend Design Intern",
    company: "Norxio (Fintech)",
    place: "UK, remote",
    dates: "May – Aug 2026",
    summary: "Designed the product dashboard and the website landing page in Figma, iterating on feedback with the UK team.",
    projects: ["norxio"],
  },
  {
    id: "prepbook",
    title: "Graphic & Web Designer Intern",
    company: "Prepbook (Edtech)",
    place: "Mumbai",
    dates: "June – Aug 2025",
    summary: "Redesigned the website and contributed to the learner web app, improving navigation, accessibility and usability.",
    projects: ["prepbook"],
  },
  {
    id: "ion-chemicals",
    title: "Python Developer Intern",
    company: "Ion Chemicals",
    place: "Navi Mumbai",
    dates: "Jan – Apr 2025",
    summary:
      "Built and optimised a Python/OpenCV anomaly-detection model for fluid and gas flow in industrial pipelines using real-time monitoring data, and integrated it into existing monitoring workflows with engineers.",
    projects: [],
  },
];
