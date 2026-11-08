export type Achievement = {
  id: string;
  title: string;
  /** Who gave it, or where it happened. */
  issuer: string;
  year: number;
  /** Link to the project, certificate or announcement; `null` while there isn't one. */
  href: string | null;
  /** Shown when the entry is opened: what happened, in a paragraph or two. */
  story: string[];
  /** Pictures from it, paths under /public. */
  images: { src: string; alt: string }[];
  /** Further links shown under the story, besides the case study. */
  links?: { label: string; href: string }[];
};

/** Recognition the projects received, newest first. */
export const achievements: Achievement[] = [
  {
    id: "demos-anon",
    title: "Speaker, Demos Anon",
    issuer: "Dogpatch Labs, Dublin",
    year: 2026,
    href: "/projects/id-card/",
    story: [
      "I gave a talk at Demos Anon, held at Dogpatch Labs in Dublin, about the ID card generator: a site I made for fun after a tutorial video of mine passed 3.5 million views, and how it grew my content.",
      "The slides were a scrollable web page in the same style as the site.",
    ],
    images: [
      { src: "/projects/id-card/talk-poster.webp", alt: "Giving the talk at Dogpatch Labs" },
      { src: "/projects/id-card/talk-stats.webp", alt: "Slide: 3.5M views on the card tutorial" },
    ],
    links: [{ label: "The slides", href: "https://id-talk.vercel.app/" }],
  },
  {
    id: "sarvam-top-12",
    title: "Top 12, Sarvam BuildIn' Hours",
    issuer: "Sarvam AI, Bengaluru",
    year: 2026,
    href: "/projects/praman/",
    story: [
      "Praman, a loan assistant for borrowers in India on WhatsApp and the web, made the top 12 at Sarvam AI's in-person hackathon in Bengaluru, where about 100 builders were picked from over 6,000 applicants.",
      "We built it in 12 hours as a team of four. I worked on the idea, the web frontend and dashboard, designed the pitch deck and presented the final demo to the judges.",
    ],
    images: [
      { src: "/projects/praman/deck-cover.webp", alt: "The Praman pitch deck cover" },
      { src: "/projects/praman/dashboard.webp", alt: "The Praman dashboard" },
    ],
  },
  {
    id: "ieee-paper",
    title: "Published paper, ICCUBEA 2025",
    issuer: "IEEE Xplore",
    year: 2025,
    href: "/projects/speaker-encoder/",
    story: [
      "\"Attention Enhanced Speaker Representation with Contrastive Learning\" was presented at ICCUBEA 2025 in Pune and published in IEEE Xplore.",
      "It replaces the recurrent speaker encoder in a voice-cloning text-to-speech system with a Transformer trained with a contrastive (GE2E) loss, giving lower error rates and faster inference than the LSTM baseline.",
    ],
    images: [{ src: "/projects/speaker-encoder/pipeline.webp", alt: "The paper's pipeline: speaker encoder, embedding, Tacotron 2" }],
    links: [{ label: "IEEE Xplore", href: "https://ieeexplore.ieee.org/document/11284010" }],
  },
  {
    id: "isro-chairman",
    title: "Presented SeaGuard to ISRO's Chairman",
    issuer: "Dr. V. Narayanan, ISRO",
    year: 2025,
    href: "/projects/seaguard/",
    story: [
      "After HackCelestial, SeaGuard, a safety app for fishermen with an SOS that shares their trail with the coast guard, was presented to Dr. V. Narayanan, Chairman of ISRO.",
    ],
    images: [{ src: "/projects/seaguard/final-screens.webp", alt: "SeaGuard's final screens" }],
  },
  {
    id: "hackcelestial",
    title: "Most Product Readiness, HackCelestial 2.0",
    issuer: "Pillai College of Engineering",
    year: 2025,
    href: "/projects/seaguard/",
    story: [
      "SeaGuard won the Most Product Readiness award in the software track at HackCelestial 2.0, hosted by Pillai College of Engineering. I designed the app in Figma and built much of its React Native interface, in a team of five.",
    ],
    images: [
      { src: "/projects/seaguard/poster.webp", alt: "SeaGuard" },
      { src: "/projects/seaguard/features-iterations.webp", alt: "Five versions of SeaGuard's Features tab" },
    ],
  },
];
