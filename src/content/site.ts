export type SiteLink = {
  label: string;
  href: string;
  external: boolean;
};

export type Credit = {
  label: string;
  href: string;
};

export const site = {
  title: "shubham’s space",
  /** Heading of the opened bag, where the objects are; hovering one swaps in its label. */
  spaceTitle: "shubham’s [bag]",
  role: "Designer & Developer",
  currently: "MSc in CS at UCD",
  name: "Shubham Patil",
  tagline: "Designer × Developer · Dublin",
  /** Third-party models that need attribution (CC BY), shown on the page each one fills. */
  credits: {
    camera: {
      label: "Camera model by Dokono Kinokoda, CC BY 4.0, modified",
      href: "https://sketchfab.com/3d-models/digital-camera-5b2573eab7bf48f2bb8cd5a6026795b1",
    },
    laptop: {
      label: "MacBook Air M2 model by rtql8d, CC BY 4.0, modified",
      href: "https://sketchfab.com/3d-models/macbook-air-m2-786fa23d402a4f90ae36c4168997f9cc",
    },
    folder: {
      label: "Document file folder model by Kami Rapacz, CC BY 4.0, modified",
      href: "https://sketchfab.com/3d-models/document-file-folder-11390179bba7462484d344e2fe22c703",
    },
  } satisfies Record<string, Credit>,
  links: [
    { label: "Resume", href: "/resume.pdf", external: true },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/shubhamnileshpatil/",
      external: true,
    },
    {
      label: "Email",
      href: "mailto:shubhamnileshpatil@gmail.com",
      external: false,
    },
  ] satisfies SiteLink[],
};
