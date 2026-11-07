export type CaseStudySection = {
  /** Short label, e.g. "Problem". */
  heading: string;
  /** Optional headline that makes the section's point, e.g. "Hard to find, harder to trust". */
  title?: string;
  /** Paragraphs, in order. */
  body: string[];
  /** Screens shown under the text, side by side on wide screens. Paths under /public. */
  images?: { src: string; alt: string; width: number; height: number }[];
  /** A recording that plays under the text, e.g. a talk. Paths under /public. */
  video?: { src: string; poster: string; title: string; width: number; height: number };
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

export const projects: Project[] = [
  {
    id: "prepbook",
    title: "Prepbook",
    summary: "Redesigning an edtech startup's website, and bringing its mobile-only learning app to the web.",
    year: 2025,
    kind: "Web & product design",
    tags: ["Design", "Web/App"],
    video: "/projects/prepbook/video.mp4",
    poster: "/projects/prepbook/poster.webp",
    caseStudy: {
      role: "Graphic & Web Designer Intern",
      duration: "Jun – Aug 2025",
      tools: ["Figma"],
      sections: [
        {
          heading: "TL;DR",
          body: [
            "Prepbook helps students in India prepare for competitive exams like UPSC, SSC, banking and the State PSCs, mainly through its Current Affairs & GK app. During a summer internship I redesigned the company's website from scratch and designed a web version of the app, which until then only ran on phones.",
          ],
        },
        {
          heading: "Background",
          title: "A product students liked, behind a site that didn't show it",
          body: [
            "The app was doing well, with over 200,000 installs and a 4.7 rating. But the website, usually where a student, parent or investor first met Prepbook, looked dated and didn't explain what the product was or why anyone should trust it.",
            "The app also only existed on mobile. Students who studied at a laptop couldn't use it there.",
          ],
        },
        {
          heading: "Problem",
          title: "Hard to find, harder to trust",
          body: [
            "The old homepage opened on a wall of article cards fighting the headline for attention. Content-heavy sections had no visual hierarchy, and the numbers that proved the app worked (201,000+ installs, a 4.7 rating) sat halfway down the page, after sections whose images often failed to load.",
            "For an edtech brand, a first impression like that costs sign-ups before a student ever reads a single article.",
          ],
          images: [
            { src: "/projects/prepbook/site-before.webp", alt: "The old Prepbook homepage: a headline beside a collage of article cards", width: 1440, height: 900 },
          ],
        },
        {
          heading: "Process",
          title: "Clarity first, then character",
          body: [
            "01 Research. I listed the old site's pain points and studied how other edtech platforms present themselves. Three needs kept coming up: clarity, speed and trust.",
            "02 Structure. I cut the navigation down to four destinations (Home, About Us, Products and Contact) so each page had one job.",
            "03 Proof up front. The numbers students care about (installs, articles read, rating, cities reached) and the programmes backing Prepbook, like Startup India, Google for Startups and AWS Startups, went right under the hero. Trust gets earned in the first scroll, not on the About page.",
            "04 Brand. I took the orange from the logo and used it as a gradient on the words that matter, and kept everything else black, white and calm. A lot of whitespace lets dense exam content breathe.",
          ],
        },
        {
          heading: "The website",
          title: "A new front door",
          body: [
            "The new site leads with one message, \"Empowering learners through smarter education\", and a single call to action. Each product gets its own section with a clear choice: visit the site or download from the Play Store. A teaser for what's next doubles as a hiring call, and the Contact page splits enquiries into three clear routes: general, partnerships and support.",
          ],
          images: [
            { src: "/projects/prepbook/site-home.webp", alt: "The redesigned Prepbook homepage, from hero to footer", width: 1318, height: 3000 },
            { src: "/projects/prepbook/site-contact.webp", alt: "The redesigned Contact page with three enquiry cards and a map", width: 1440, height: 2183 },
          ],
        },
        {
          heading: "The web app",
          title: "The app on a bigger screen",
          body: [
            "For the web app, I brought the mobile reading experience to the browser and reworked it for a wider screen rather than stretching the phone layout. Explore puts daily news cards in a grid, with filters and categories in a sidebar and tabs for Today, Prelims, Mains analysis and MCQs.",
            "The weekly streak and lesson count sit in the header on every page, so the habit stays in view. Articles open with a short summary, can be listened to or saved as a PDF, and end with a question to check understanding. The profile pairs a streak calendar with bookmarked lessons. Every screen also works in dark mode and at phone width.",
          ],
          images: [
            { src: "/projects/prepbook/app-explore.webp", alt: "Web app Explore page with filters, categories and a grid of news cards", width: 1440, height: 1024 },
            { src: "/projects/prepbook/app-mobile-explore.webp", alt: "Explore page at phone width", width: 412, height: 917 },
          ],
        },
        {
          heading: "Reading & progress",
          body: [],
          images: [
            { src: "/projects/prepbook/app-article.webp", alt: "Article page with summary, listen and PDF options, and a quiz at the end", width: 1440, height: 2622 },
            { src: "/projects/prepbook/app-mobile-article.webp", alt: "Article page at phone width", width: 412, height: 1900 },
          ],
        },
        {
          heading: "Dark mode & profile",
          body: [],
          images: [
            { src: "/projects/prepbook/app-explore-dark.webp", alt: "Explore page in dark mode", width: 1440, height: 1024 },
            { src: "/projects/prepbook/app-profile.webp", alt: "Profile page with a streak calendar and bookmarked lessons", width: 1440, height: 938 },
          ],
        },
        {
          heading: "Beyond the brief",
          title: "A seat at the product table",
          body: [
            "Alongside the redesign, I joined a strategy session with the CTO to shape an internal tool for automating content. My part was turning what the content team needed into design requirements that fit the technical constraints.",
          ],
        },
        {
          heading: "Impact",
          title: "A site that finally matches the product",
          body: [
            "Prepbook's founder and CEO, Deepak Rawat, said the redesign \"directly improved the usability of our learning environment\" and \"significantly enhanced user engagement and strengthened Prepbook's digital presence.\"",
          ],
        },
        {
          heading: "Reflections",
          title: "Simple is the hard part",
          body: [
            "Exam prep is information-heavy by nature, and every section wanted to be the loudest. Most of the work was deciding what to leave out.",
            "I also learned that in edtech, trust is a design problem. Students are betting their time on you, so the proof has to come before the pitch.",
          ],
        },
      ],
    },
    href: null,
  },
  {
    id: "su-design9",
    title: "Su-Design 9",
    summary: "A first website for a Mumbai interior design studio, designed and built from the founder's own notes.",
    year: 2026,
    kind: "Web design & development",
    tags: ["Design", "Web/App"],
    video: "/projects/su-design9/video.mp4",
    poster: "/projects/su-design9/poster.webp",
    caseStudy: {
      role: "Sole designer & developer (freelance)",
      duration: "2026",
      tools: ["Figma", "Next.js", "Vercel"],
      sections: [
        {
          heading: "TL;DR",
          body: [
            "Su-Design 9 is an interior design studio in Mumbai, run by designer Sudha Kamble, with 12 years of residential and commercial work across Mumbai and Thane. It had no online presence at all. As the only person on the project, I designed and built its first website, from moodboard to a live Next.js site.",
          ],
        },
        {
          heading: "Background",
          title: "Great work, nowhere to show it",
          body: [
            "The studio's work spoke for itself in person, but there was nowhere to send a prospective client. Projects lived in phone galleries, and the founder's story, a fine arts degree from Sir J.J. School of Art, a scholarship to Sweden, a commended exhibition, was known only to people who'd already met her.",
            "The brief was simple: a site that feels like the studio's interiors, and makes it easy to book a consultation.",
          ],
        },
        {
          heading: "The brief",
          title: "Written by hand",
          body: [
            "The founder wrote the brief herself, in a notebook: her story, the studio's philosophy, and the eight stages of a project, from space planning to on-site supervision. Lines like \"every site we create is a dialogue between spaces, material and emotion\" went almost straight onto the site.",
            "Those pages became the site map. The eight stages became the eight services, and her story became the About page.",
          ],
          images: [{ src: "/projects/su-design9/brief.webp", alt: "Photos of the founder's handwritten notes for the website", width: 1500, height: 680 }],
        },
        {
          heading: "Moodboard",
          title: "Warm, quiet, editorial",
          body: [
            "I collected interior studio sites, hospitality brands and furniture catalogues to find the register. The ones that felt right had the same things in common: warm neutrals and deep browns rather than stark white, a refined serif, and photography given room to breathe, like a magazine spread.",
            "That set the rules: let the rooms be the colour, keep type light and classical, and leave whitespace generous.",
          ],
          images: [{ src: "/projects/su-design9/moodboard.webp", alt: "Moodboard of interior design and hospitality websites in warm neutrals", width: 2400, height: 651 }],
        },
        {
          heading: "Iterations",
          title: "From \"We build to inspire\" to \"Elevating the art of living\"",
          body: [
            "The first drafts were louder: a bold italic sans over the hero, \"You dream it, we build it\", and grey boxes for projects. Over a dozen versions, the homepage moved toward the moodboard. The headline became \"Elevating the art of living\", the serif took over, and sections settled into a rhythm: who we are, featured work, services, the founder, and a closing call to book.",
          ],
          images: [{ src: "/projects/su-design9/iterations.webp", alt: "A row of homepage iterations in Figma, from wireframe to final", width: 2400, height: 867 }],
        },
        {
          heading: "The website",
          title: "Rooms first, words second",
          body: [
            "The homepage opens on a full-bleed bedroom and a single action: book a consultation. A before-and-after slider, \"Vision to Reality\", lets visitors drag between an empty shell and the finished room, which says more about the studio than any paragraph could. Featured work runs as a carousel into full project pages with site photo galleries.",
          ],
          images: [
            { src: "/projects/su-design9/site-home.webp", alt: "Su-Design 9 homepage: hero, intro and the before-and-after slider", width: 1440, height: 3400 },
            { src: "/projects/su-design9/site-mobile.webp", alt: "The homepage at phone width", width: 412, height: 2400 },
          ],
        },
        {
          heading: "Story & services",
          body: [
            "The About page tells the founder's journey as a timeline in phases, from a childhood love of drawing to her own studio. Services lay out the eight stages from the brief, each with a real project photo, followed by a four-step process from consultation to handover.",
          ],
          images: [
            { src: "/projects/su-design9/site-about.webp", alt: "About page with the founder's profile and journey timeline", width: 1440, height: 3050 },
            { src: "/projects/su-design9/site-services.webp", alt: "Services page pairing each service with a project photo", width: 1440, height: 2600 },
          ],
        },
        {
          heading: "Projects",
          body: [
            "Projects can be searched and filtered by residential or commercial, and each opens into its own page with a write-up and a grid of site pictures.",
          ],
          images: [
            { src: "/projects/su-design9/site-projects.webp", alt: "Projects page with search, filters and an FAQ", width: 1440, height: 3887 },
            { src: "/projects/su-design9/site-project.webp", alt: "A project page with a photo gallery", width: 1440, height: 2900 },
          ],
        },
        {
          heading: "Reflections",
          title: "Design for the work, not over it",
          body: [
            "For a studio whose product is a room, the website's job is to get out of the way. Most of the iterations were about removing things: louder type, extra colour, sections that explained what a photo already showed.",
            "Working from the founder's handwritten notes also taught me to keep a client's voice intact. The best lines on the site are hers.",
          ],
        },
      ],
    },
    href: "https://www.su-design9.in",
  },
  {
    id: "iimsc",
    title: "IIMSC",
    summary: "A recruitment site in five languages that sends Indian candidates and European employers down their own paths.",
    year: 2026,
    kind: "Web design & development",
    tags: ["Design", "Web/App"],
    video: "/projects/iimsc/video.mp4",
    poster: "/projects/iimsc/poster.webp",
    caseStudy: {
      role: "Web designer & developer (freelance)",
      duration: "2026",
      tools: ["Figma", "Next.js", "Tailwind CSS", "i18n"],
      sections: [
        {
          heading: "TL;DR",
          body: [
            "IIMSC places skilled Indian professionals, mostly in automotive, with employers across Europe. I designed and built its website: one front door that splits into a portal for candidates and one for employers, in English, German, Swedish, Croatian and Slovenian. It's live and was a paid project, deployed to the client's own hosting.",
          ],
        },
        {
          heading: "Problem",
          title: "Two audiences, one website",
          body: [
            "A recruitment agency talks to two very different people. Candidates want to know if a job in Europe is real, what it costs and whether their family can come too. Employers want to know if the candidates are vetted and how quickly they can start. One homepage trying to speak to both ends up speaking to neither.",
            "And the employers don't all read English.",
          ],
        },
        {
          heading: "Structure",
          title: "Split at the front door",
          body: [
            "The very first wireframe settled the main idea: a short landing page whose only job is to ask who you are. From there, each audience gets its own home, about page and services, written for them. Candidates see open positions, testimonials and support with visas and relocation. Employers see hiring by sector (automotive, IT and skilled workers) and the brands IIMSC already works with.",
          ],
          images: [{ src: "/projects/iimsc/wireframe.webp", alt: "Early wireframe: logo, tagline and two buttons, For candidates and For companies", width: 1440, height: 1024 }],
        },
        {
          heading: "Moodboard",
          title: "Trust over flash",
          body: [
            "I started from the logo's red, blue and yellow and gathered recruitment, consultancy and agency sites for reference. Industrial photography of real workers felt more honest than stock handshakes. The final palette kept the logo's blue as a single indigo accent, so the site reads as calm and corporate rather than loud.",
          ],
          images: [{ src: "/projects/iimsc/moodboard.webp", alt: "Figma board with the logo palette, type scale, references and early hero ideas", width: 2400, height: 753 }],
        },
        {
          heading: "Iterations",
          body: [
            "Early drafts led with a dark hero, \"Your future in Europe starts here\", and big numbered reasons to choose IIMSC. Over many versions the page got lighter, the numbers moved into a single proof section (30+ years of combined expertise, 60+ European partners, 1,200+ placements), and the contact form gave way to clearer paths into each portal.",
          ],
          images: [{ src: "/projects/iimsc/iterations.webp", alt: "A row of homepage iterations in Figma", width: 2400, height: 754 }],
        },
        {
          heading: "The front door",
          title: "Your gateway to global opportunities",
          body: [
            "The landing page is a collage of real tradespeople above one line and two cards: For Candidates and For Employers. Nothing else competes. On a phone, the collage tightens and the cards stack.",
          ],
          images: [
            { src: "/projects/iimsc/site-landing.webp", alt: "IIMSC landing page with a photo collage and two cards, For Candidates and For Employers", width: 1440, height: 1878 },
            { src: "/projects/iimsc/site-mobile.webp", alt: "The landing page at phone width", width: 412, height: 2018 },
          ],
        },
        {
          heading: "Two portals",
          body: [
            "Candidates get \"Build your career across borders\", a zero-fee promise up front, and an FAQ that answers the questions people are actually afraid to ask, from language tests to bringing family along. Employers get \"Hire top talent from India\", a row of automotive brands IIMSC already works with, and sector pages that list the roles they place, from mechanics to body shop technicians.",
          ],
          images: [
            { src: "/projects/iimsc/site-candidates.webp", alt: "Candidate home page with proof numbers and what makes IIMSC different", width: 1440, height: 3000 },
            { src: "/projects/iimsc/site-employers.webp", alt: "Employer home page with client logos and hiring sectors", width: 1440, height: 3132 },
          ],
        },
        {
          heading: "Sectors & services",
          body: [],
          images: [
            { src: "/projects/iimsc/site-automotive.webp", alt: "Automotive hiring page listing the roles IIMSC places", width: 1440, height: 3610 },
            { src: "/projects/iimsc/site-services.webp", alt: "Candidate services: visas, relocation, language training and more", width: 1440, height: 2756 },
          ],
        },
        {
          heading: "Five languages",
          title: "Built to translate",
          body: [
            "Every page exists in English, German, Swedish, Croatian and Slovenian, switched from the header, so employers across Europe can read it in their own language. Layouts had to hold up when the same headline runs much longer in German than in English.",
          ],
          images: [{ src: "/projects/iimsc/site-languages.webp", alt: "The same hero in English and German", width: 2880, height: 820 }],
        },
        {
          heading: "Reflections",
          title: "Know who you're talking to",
          body: [
            "Splitting the site in two felt like more work at first, with double the pages and double the copy. It made everything after easier: every section had one reader, so every decision had an answer.",
          ],
        },
      ],
    },
    href: "https://ii-msc.com",
  },
  {
    id: "rudra-cargo",
    title: "Rudra Cargo",
    summary: "Replacing a transport company's paper lorry receipts with a booking, billing and cash system it runs on every day.",
    year: 2026,
    kind: "Product design & development",
    tags: ["Design", "Web/App"],
    video: "/projects/rudra-cargo/video.mp4",
    poster: "/projects/rudra-cargo/poster.webp",
    caseStudy: {
      role: "Sole designer & developer (freelance)",
      duration: "Dec 2025 – Sept 2026",
      tools: ["Figma", "Next.js", "Tailwind CSS", "Prisma", "PostgreSQL", "Vercel"],
      sections: [
        {
          heading: "TL;DR",
          body: [
            "Rudra Cargo & Transport Nx is a Mumbai transport company moving consignments across India by road, rail and air. Every shipment ran on a handwritten lorry receipt (LR), and the books ran on paper too. As the only person on the project, I designed and built the system that replaced them: an admin app for staff and a public site where customers track their shipments.",
          ],
        },
        {
          heading: "Problem",
          title: "Paper was costing money",
          body: [
            "An LR is the contract for a shipment: who sent it, who receives it, what's inside, what it weighs and who pays. Written by hand from a booklet, LRs got lost, totals were worked out on paper, and cash collected at the counter wasn't tied back to any shipment. Poor bookkeeping and untracked cash were turning into real losses.",
            "The people using the new system would be office staff, not software people. It had to feel as familiar as the booklet it replaced.",
          ],
        },
        {
          heading: "The LR creator",
          title: "Fill the form, watch the docket",
          body: [
            "Instead of one long form, a new LR is built in seven short steps: consignor, consignee, route and date, shipment details, transport, freight charges and payment. Each step asks only a few questions.",
            "Beside the form sits the real docket, the same layout as the printed receipt staff already knew. As each answer goes in, the docket scrolls to that part and fills it, the way Mercury's invoice builder shows the finished invoice while you type. Choosing Air ticks Air, every charge recalculates the subtotal, GST and grand total, and the amount is written out in words. The last step ends in a review before anything is issued.",
          ],
          images: [
            { src: "/projects/rudra-cargo/lr-02.webp", alt: "LR creator, step one: choosing the consignor fills the sender block on the docket", width: 1440, height: 900 },
            { src: "/projects/rudra-cargo/lr-11.webp", alt: "LR creator, freight charges: each charge updates the docket's totals live", width: 1440, height: 900 },
          ],
        },
        {
          heading: "Step by step",
          body: [],
          images: [
            { src: "/projects/rudra-cargo/lr-05.webp", alt: "Shipment details step: packages, weight and invoice fill the docket's goods table", width: 1440, height: 900 },
            { src: "/projects/rudra-cargo/lr-15.webp", alt: "Payment step with a review summary before issuing the docket", width: 1440, height: 900 },
          ],
        },
        {
          heading: "Operations",
          title: "Every LR, bill and rupee in one place",
          body: [
            "The dashboard opens on what the office needs to act on: pending LRs, deliveries, cash collected and what's still owed, with revenue over time. Below it, an audit log records who issued an LR, who collected cash and who voided what, and why.",
            "Shipments can be searched and filtered by payment status: to pay, paid, credit or voided. Voided LRs stay visible, struck through, so nothing quietly disappears.",
          ],
          images: [
            { src: "/projects/rudra-cargo/admin-dashboard.webp", alt: "Admin dashboard with key figures, a revenue chart and the audit log", width: 1440, height: 1381 },
            { src: "/projects/rudra-cargo/admin-shipments.webp", alt: "Shipments list with payment status filters", width: 1440, height: 1337 },
          ],
        },
        {
          heading: "Money",
          title: "Following the cash",
          body: [
            "Each customer has a ledger of what they've been billed, paid and still owe. The cash book separates cash expected (logged by whoever booked the LR) from cash collected (logged by whoever actually received it), because in a busy office those are often different people. That gap was exactly where money used to go missing.",
            "Admins and staff have separate roles, and every staff action is logged.",
          ],
          images: [
            { src: "/projects/rudra-cargo/admin-customers.webp", alt: "Customer directory with billed, outstanding and paid totals", width: 1440, height: 900 },
            { src: "/projects/rudra-cargo/admin-cash-book.webp", alt: "Cash book splitting cash collected from cash expected", width: 1440, height: 900 },
          ],
        },
        {
          heading: "For customers",
          title: "Track it with the LR number",
          body: [
            "The public site does one thing: a customer types their LR or waybill number and follows the shipment from booking to delivery. Because every shipment is now booked against a digital LR, that tracking comes for free.",
          ],
          images: [
            { src: "/projects/rudra-cargo/site-home.webp", alt: "Rudra Cargo's public site with a tracking search over a truck", width: 1440, height: 1339 },
            { src: "/projects/rudra-cargo/site-mobile.webp", alt: "The tracking site at phone width", width: 412, height: 1619 },
          ],
        },
        {
          heading: "Reflections",
          title: "Design for the booklet in their hands",
          body: [
            "The biggest design decision was keeping the docket. Staff didn't need a new mental model, just their familiar receipt that fills itself in and adds up correctly. Showing it live made the form feel safe: you can see exactly what will be printed before you issue it.",
            "Building for a real business also meant the boring parts mattered most. Voids need a reason, cash needs a name against it, and nothing gets deleted without a trace.",
          ],
        },
      ],
    },
    href: "https://www.rudracargo.com",
  },
  {
    id: "norxio",
    title: "Norxio",
    summary: "Designing the dashboard and the website for a fintech that pays suppliers around the world, with AI checking the paperwork behind every payment.",
    year: 2026,
    kind: "Product & web design",
    tags: ["Design", "Web/App"],
    video: "/projects/norxio/video.mp4",
    poster: "/projects/norxio/poster.webp",
    caseStudy: {
      role: "UI/UX & Frontend Design Intern",
      duration: "May – Aug 2026",
      tools: ["Figma"],
      sections: [
        {
          heading: "TL;DR",
          body: [
            "Norxio is a fintech for businesses that import goods. It holds money in several currencies, converts it, and pays suppliers abroad, while AI checks the invoices, approvals and documents behind each payment. Working remotely with the team in the UK, I designed most of the product dashboard in Figma, from the home screen to FX, invoices, documents and reconciliation, and redesigned the website's landing page. All of it is now live.",
          ],
        },
        {
          heading: "Problem",
          title: "A payment is only as good as its paperwork",
          body: [
            "Paying a supplier abroad is never just a transfer. There's an invoice, a purchase order, a shipping receipt, a currency conversion and someone who has to approve it. Usually they live in different places, so finance teams spend their time matching documents by hand and catch mismatches after the money has already gone.",
            "Norxio's promise is that every payment arrives with its paperwork attached. The product had to make that visible: what's been paid, what's waiting, what's missing and why.",
          ],
        },
        {
          heading: "Starting point",
          title: "A dashboard that showed everything at once",
          body: [
            "The earlier dashboard put balances, a send-money form, key metrics, recent transactions and an API key panel side by side, for every customer. A note in the file says the API panel was really meant for enterprise customers. A new user saw a wall of zeros and empty widgets with no sense of where to start.",
          ],
          images: [{ src: "/projects/norxio/dashboard-before.webp", alt: "The earlier Norxio dashboard with balances, a send form, key metrics and an API access panel", width: 1440, height: 1488 }],
        },
        {
          heading: "Process",
          title: "References, versions, then the details",
          body: [
            "Each module started on its own board in Figma: screenshots of how other finance products handle the same job, then version after version beside them, reworked on feedback from the team. The dashboard alone went through more than a dozen layouts, including empty, first-run and fully-loaded states.",
            "Reconciliation went furthest. I listed the statuses a payment can be in, what the summary cards should count and which actions belong in the header, designed the screens, then wrote the functional documentation the frontend and backend engineers built from: what every button, tab, status and drawer section does.",
          ],
          images: [
            { src: "/projects/norxio/dashboard-board.webp", alt: "Figma board of dashboard iterations, tooltips and reference screens", width: 2400, height: 599 },
            { src: "/projects/norxio/reconciliation-board.webp", alt: "Figma board of reconciliation versions, notes on statuses and reference screens", width: 2400, height: 1484 },
          ],
        },
        {
          heading: "The dashboard",
          title: "What moved, what's due, what it saved",
          body: [
            "The new home screen answers three questions in order. How much do I have? Each currency account sits as a card in a row. What's happening? Money in and out this month, with the top sources. What needs me? Bills due this week, flagged as overdue or due in a few days. Alongside, \"Sent this month\" shows what the customer paid in FX fees and what they saved compared with a bank, which is the reason to use Norxio at all. Live exchange rates scroll along the bottom.",
            "A first-time user gets a four-step tour of the navigation and friendly empty states (\"No money in\", \"No upcoming payments\") with one clear action each, instead of a screen of zeros.",
          ],
          images: [
            { src: "/projects/norxio/dashboard.webp", alt: "The redesigned dashboard with currency accounts, monthly savings, payment activity and bills due this week", width: 1440, height: 1232 },
            { src: "/projects/norxio/dashboard-tour.webp", alt: "First-run dashboard with empty states and the last step of the onboarding tour", width: 1440, height: 1199 },
          ],
        },
        {
          heading: "Reconciliation",
          title: "Check the paperwork before the money moves",
          body: [
            "Reconciliation matches invoices, purchase orders and payment confirmations, and shows anything that doesn't add up. Every record is Matched, Needs context or Manual review, and tabs split them into pre-payment, post-payment and exceptions, so problems can be fixed before a supplier is paid rather than found in an audit. Actions only appear on hover, keeping a long table quiet.",
            "Opening a record shows an AI insight in plain language (\"The invoice amount exceeds the approved purchase order by $2,400 (20%)\") with a recommendation, the exact numbers behind it, and the document trail: what's missing, what's linked and what the AI suggests linking.",
          ],
          images: [
            { src: "/projects/norxio/reconciliation.webp", alt: "Reconciliation table filtered to exceptions, with match statuses and summary cards", width: 1440, height: 1151 },
            { src: "/projects/norxio/reconciliation-detail.webp", alt: "Reconciliation overview with an AI insight, issue details and linked documents", width: 1049, height: 1488 },
          ],
        },
        {
          heading: "FX & transactions",
          body: [
            "FX exchange handles both spot and forward contracts. A forward locks today's rate for one, two or three months, and the rate breakdown shows the mid-market rate, the customer's rate and the fee side by side, with a short countdown on the locked rate. In transactions, failed payments are struck through rather than hidden, and every row shows whether it was a transfer, a deposit or an FX conversion.",
          ],
          images: [
            { src: "/projects/norxio/fx.webp", alt: "FX exchange with spot and forward tabs, a rate breakdown and recent exchanges", width: 1440, height: 1347 },
            { src: "/projects/norxio/transactions.webp", alt: "Transactions list with status tabs, filters and payment types", width: 1440, height: 1151 },
          ],
        },
        {
          heading: "Documents & invoices",
          body: [
            "Documents shows every trade document alongside the payment and supplier it belongs to, and counts what's still unlinked. Invoices can be scheduled and sent with automatic reminders, from a week before the due date to after it's overdue, and the preview shows exactly what the customer will receive.",
          ],
          images: [
            { src: "/projects/norxio/documents.webp", alt: "Documents page with each file linked to payments and suppliers", width: 1440, height: 1024 },
            { src: "/projects/norxio/invoice-send.webp", alt: "Review and send step for an invoice, with a reminder schedule and a live preview", width: 1440, height: 1119 },
          ],
        },
        {
          heading: "The website",
          title: "The AI operating layer for global trade payments",
          body: [
            "For the landing page I explored dozens of heroes around one line, \"The AI operating layer for global trade payments\", trying container ports, cranes and aerial shots of cargo ships against dark and light layouts. The final version is light and calm: the headline, two clear actions (Book a Demo, Open an Account) and a wide aerial shot of a container ship, followed by the numbers that matter to an importer, like 190+ countries and 32+ currencies.",
          ],
          images: [{ src: "/projects/norxio/site-iterations.webp", alt: "Figma board of hero iterations with ship and port photography", width: 2400, height: 1313 }],
        },
        {
          heading: "Live site",
          body: [],
          images: [
            { src: "/projects/norxio/site-home.webp", alt: "Norxio's landing page, from the hero to pricing and the footer", width: 1440, height: 6289 },
            { src: "/projects/norxio/site-mobile.webp", alt: "The landing page at phone width", width: 412, height: 6652 },
          ],
        },
        {
          heading: "Reflections",
          title: "Design the states, not just the screens",
          body: [
            "Most of the work in a finance product sits in the in-between: an empty account, a failed transfer, an invoice missing its purchase order. The screens that took longest were the ones with nothing in them, or with something wrong.",
            "Writing the reconciliation documentation changed how I design. Once every button needed a sentence explaining what it does, anything I couldn't explain was usually something that shouldn't be there.",
          ],
        },
      ],
    },
    href: "https://www.norxio.com",
  },
  {
    id: "praman",
    title: "Praman",
    summary: "A loan assistant for borrowers in India, on WhatsApp and the web. It reads a sanction letter in your language and flags what could hurt you. Top 12 at Sarvam AI's hackathon.",
    year: 2026,
    kind: "Hackathon · AI product",
    tags: ["Design", "Web/App", "AI/ML"],
    video: "/projects/praman/video.mp4",
    poster: "/projects/praman/poster.webp",
    caseStudy: {
      role: "Ideation, frontend, dashboard, deck & pitch (team of 4)",
      duration: "12 hours, Aug 2026",
      tools: ["Next.js", "Tailwind CSS", "Sarvam AI", "WhatsApp"],
      sections: [
        {
          heading: "TL;DR",
          body: [
            "Praman (प्रमाण, \"proof\") reads loan documents for people who can't easily read them. A borrower sends a scanned sanction letter or a voice note on WhatsApp, in their own language, and gets a plain-language answer. On the web dashboard they track their loans and get a report that flags risky clauses, each one cited against RBI rules.",
            "We built it in 12 hours at Sarvam BuildIn' Hours, Sarvam AI's in-person hackathon in Bengaluru, where about 100 builders were picked from 6,272 applicants. We made the top 12. I helped shape the idea, built the web frontend and the dashboard, designed the pitch deck, and presented the final demo and pitch to the judges and stakeholders. The team was Yash Varma, Rithvik Shetty, Vinay Pokharkar and me.",
          ],
          images: [{ src: "/projects/praman/deck-cover.webp", alt: "Opening slide: Proof you can read, in a language you understand", width: 1680, height: 945 }],
        },
        {
          heading: "Problem",
          title: "Borrowers sign what they can't parse",
          body: [
            "A loan offer that says \"3.5% per month\" sounds cheap. Over a year it's 42%. Sanction letters often arrive as scanned PDFs, in English legal language, with nobody to ask. Clauses like \"at the sole discretion of the Lender\" get skimmed and signed.",
            "Existing tools didn't help much. Most were built on US models and US rules, and they made legal claims without saying where they came from. For a borrower in India, that's a confident answer that doesn't match RBI's rules.",
          ],
          images: [{ src: "/projects/praman/deck-problem.webp", alt: "Problem slide: jargon hides the cost, no one to ask, built for the US", width: 1680, height: 945 }],
        },
        {
          heading: "Scope",
          title: "One loop, on one profile",
          body: [
            "With 12 hours, we cut everything that didn't serve one flow: KYC onboarding, then tracking loans, then uploading documents, then an AI report. The profile drives everything else. Monthly income and existing EMIs decide whether a new loan is affordable, so the report can say what signing would do to you, not only what the clause says. A standalone EMI calculator and a separate scanner page were merged or dropped.",
            "Every legal claim had to be cited. Instead of fine-tuning a model on Indian lending law, which would never fit in a day, the backend retrieves passages from RBI's Master Directions and the Fair Practices Code, and any finding it can't cite is dropped.",
          ],
          images: [{ src: "/projects/praman/deck-loop.webp", alt: "Product loop: KYC onboarding, track loans, upload documents, AI report", width: 1680, height: 945 }],
        },
        {
          heading: "On WhatsApp",
          title: "Speak or type, in your own language",
          body: [
            "WhatsApp is where our users already were, so the assistant starts there. It asks you to pick one of 11 Indian languages first, each written in its own script. Then you can type or send a voice note. Speech is transcribed and answered in the same language, so someone who can't read English, or can't type comfortably, can still ask what a document means and what to do next.",
          ],
          images: [
            { src: "/projects/praman/whatsapp-languages.webp", alt: "WhatsApp language picker listing Marathi, Hindi, English, Bengali, Tamil, Telugu, Kannada, Gujarati and Malayalam", width: 952, height: 1732 },
            { src: "/projects/praman/whatsapp-chat.webp", alt: "WhatsApp conversation in Hindi with voice notes and Praman's replies", width: 1818, height: 1606 },
          ],
        },
        {
          heading: "The dashboard",
          title: "Your whole portfolio, urgent items first",
          body: [
            "The overview answers the questions a borrower actually has: how much do I owe, how much goes out every month, and how stretched am I? FOIR, the share of income that goes to EMIs, is the number lenders care about most. It gets a coloured gauge with the lenders' thresholds marked, rather than a bare percentage. Every label switches language from the sidebar.",
            "The screens here are the dashboard running from our repo, filled with a sample borrower whose numbers match the ones in our deck.",
          ],
          images: [
            { src: "/projects/praman/dashboard.webp", alt: "Overview with total outstanding, monthly EMI, active loans and a FOIR gauge", width: 1440, height: 900 },
            { src: "/projects/praman/dashboard-hindi.webp", alt: "The same overview in Hindi", width: 1440, height: 900 },
          ],
        },
        {
          heading: "Loans & documents",
          body: [
            "Loans sit in one table with lender, type, rate, EMI and what's still outstanding. Documents are dropped in as a PDF or a photo. Sarvam's document AI reads them page by page, which can take a minute, so each file shows its progress. Once it's read, the extracted interest rate appears next to it before you even open the report.",
          ],
          images: [
            { src: "/projects/praman/loans.webp", alt: "Loans table with four loans", width: 1440, height: 900 },
            { src: "/projects/praman/documents.webp", alt: "Documents list with two read documents and one still processing", width: 1440, height: 900 },
          ],
        },
        {
          heading: "The report",
          title: "Every finding points at its clause",
          body: [
            "The report is the centre of the product, so it shows its working. On the left is the document itself, with each risky clause highlighted in its severity colour. On the right are the findings, ranked from critical to low, each with a plain-language explanation, the exact clause quoted, and the RBI reference behind it. Click a finding and the document scrolls to its clause.",
            "Two more tabs put the loan in context. Policy comparison sets its terms beside typical market terms (42% a year against 11.5–13%). Profile impact shows how your FOIR moves if you sign and what's left over each month.",
          ],
          images: [
            { src: "/projects/praman/report.webp", alt: "Document report with highlighted clauses on the left and ranked findings on the right", width: 1440, height: 900 },
            { src: "/projects/praman/report-comparison.webp", alt: "Policy comparison tab: the loan's terms against typical terms", width: 1440, height: 900 },
          ],
        },
        {
          heading: "The pitch",
          title: "Twelve hours of building, one shot to explain it",
          body: [
            "In the top-12 round I gave the demo and pitch to the judges and stakeholders, showing both the WhatsApp bot and the web dashboard live. I designed the deck to follow the product's loop: the problem, one loop, the report as the centrepiece, why it's built on Sarvam, and a QR code to try the bot live on WhatsApp. The line we ended on was \"Read what you sign. Know what it costs. Trust what it says.\"",
          ],
          images: [
            { src: "/projects/praman/deck-report.webp", alt: "Deck slide: every finding is anchored to the exact clause it came from", width: 1680, height: 945 },
            { src: "/projects/praman/deck-stack.webp", alt: "Deck slide: built on Sarvam, with RAG over RBI regulation", width: 1680, height: 945 },
          ],
        },
        {
          heading: "Reflections",
          title: "Cut until the demo tells one story",
          body: [
            "The hardest part of the day was deciding what not to build. Every feature we dropped made the demo easier to follow. In front of judges, one loop that works end to end beats six pages that half work.",
            "Designing for people who might not read English changed small decisions too: language names written in their own script, voice as a first-class input, and numbers like FOIR shown as a coloured band instead of a bare percentage.",
          ],
        },
      ],
    },
    href: "https://github.com/yashgv/praman",
  },
  {
    id: "seaguard",
    title: "SeaGuard",
    summary: "A safety app for fishermen: weather and sea conditions, an SOS that shares your trail, maritime boundaries and a catch log, in their own language. Most Product Readiness at HackCelestial 2.0, later shown to ISRO's chairman.",
    year: 2025,
    kind: "Hackathon · Mobile app",
    tags: ["Design", "Web/App"],
    video: "/projects/seaguard/video.mp4",
    poster: "/projects/seaguard/poster.webp",
    caseStudy: {
      role: "UI/UX design & frontend (team of 5)",
      duration: "Sep 2025",
      tools: ["Figma", "React Native (Expo)", "FastAPI", "Twilio", "Sarvam AI"],
      sections: [
        {
          heading: "TL;DR",
          body: [
            "SeaGuard is a mobile app for fishermen on India's coast. It puts the things that keep them safe at sea in one place: weather and ocean conditions, an emergency SOS that sends their trail to the coast guard, a map of maritime boundaries and fishing zones, a catch log, and an assistant they can ask in their own language.",
            "We built it at HackCelestial 2.0, hosted by Pillai College of Engineering, where it won the Most Product Readiness award in the software track. A few weeks later we presented it to Dr. V. Narayanan, Chairman of ISRO. I designed the app in Figma and built much of its React Native interface. The team was Rithvik Shetty, Yash Varma, Vinay Pokharkar, Vedant Thakur and me.",
          ],
          images: [{ src: "/projects/seaguard/final-screens.webp", alt: "Final SeaGuard screens: sign up, home with SOS and weather, compass and the map's fishing-zone layer", width: 2400, height: 1129 }],
        },
        {
          heading: "Problem",
          title: "Everything a fisherman needs, behind a dozen icons",
          body: [
            "Going out to sea means checking the weather, the waves, where the fish are and where you're allowed to fish, and knowing who to call if something goes wrong.",
            "Before designing anything we studied Fisher Friend, an existing app from the M. S. Swaminathan Research Foundation that publishes INCOIS data. It has the information, but its home screen is a grid of a dozen equally weighted icons. Weather, SOS and boundary alerts all sit at the same level as \"Other services\", and each one opens a separate page. Someone checking conditions before dawn, on a small screen, has to know where to look.",
          ],
          images: [{ src: "/projects/seaguard/reference-fisher-friend.webp", alt: "Fisher Friend's home screen: a grid of equally weighted feature icons", width: 462, height: 1000 }],
        },
        {
          heading: "Process",
          title: "References, a moodboard, then rounds of drafts",
          body: [
            "The Figma file is the whole journey on one canvas: screenshots of Fisher Friend and other apps at the top, then a moodboard of the sea, storms, boats and the fish people actually catch on this coast (pomfret, mackerel, sardine, prawns), wordmark experiments, and round after round of home-screen drafts, many of them dated.",
            "Our first version stayed close to the reference: a bright blue bar, a red SOS button, and a drawer listing every feature. It worked, but it still read as a list. Later rounds pulled the most important things up to the home screen and moved the rest into a Features tab.",
          ],
          images: [
            { src: "/projects/seaguard/process-board.webp", alt: "The SeaGuard Figma canvas: references, wordmark experiments, moodboard and drafts", width: 2400, height: 2188 },
            { src: "/projects/seaguard/first-version.webp", alt: "The first version: blue header, red SOS button, map and a drawer listing every feature", width: 1654, height: 1197 },
          ],
        },
        {
          heading: "Moodboard",
          body: [
            "The look came from the water rather than from other apps: dark, high-contrast photography of the sea, warm oranges and deep blues from the catch. That became a black home screen over breaking waves, a heavy slab wordmark that holds up on a dim, wet screen, and catch cards coloured by the fish photographed on them.",
          ],
          images: [{ src: "/projects/seaguard/moodboard.webp", alt: "Moodboard of sea photography, fishermen, storms and fish on blue and orange backgrounds", width: 1600, height: 678 }],
        },
        {
          heading: "Home",
          title: "SOS first, then the sea",
          body: [
            "The home screen does two jobs. Emergency SOS is the first thing on it, full width, and sends the user's location trail to the coast guard. Below it are today's weather and the ocean conditions that decide whether to go out (wave height, direction and period) with a single fishing-conditions bar running from low to high risk.",
            "Onboarding asks how you'll use the app, as a hobby or a commercial fisher, so catch tracking and analytics can match. Login is by phone number and a one-time code, so no email address is needed. The language switch sits in the top corner of every screen.",
          ],
          images: [
            { src: "/projects/seaguard/home.webp", alt: "Home screen with Emergency SOS, current weather and ocean conditions", width: 1236, height: 2751 },
            { src: "/projects/seaguard/onboarding.webp", alt: "Onboarding asking whether you're a hobby or commercial fisher", width: 1236, height: 2751 },
            { src: "/projects/seaguard/login.webp", alt: "Login with a phone number and one-time code", width: 478, height: 1064 },
          ],
        },
        {
          heading: "Features",
          title: "One tab, rebuilt until every tile earned its place",
          body: [
            "Everything that isn't urgent lives under Features, as a grid of tiles that each show something live rather than just an icon. Seabot, the assistant, sits at the top. Next to it, geo-fencing shows whether you're safely inside the boundary and how far the nearest one is.",
            "This tab went through the most versions. A compass tile became a catch monitor, a marketplace for rods and nets was cut, and the final version added two tools: a fishing optimizer for personalised strategies and a fish identifier that names a species from a photo.",
          ],
          images: [{ src: "/projects/seaguard/features-iterations.webp", alt: "Five versions of the Features tab, from an early grid to the final layout", width: 2340, height: 1054 }],
        },
        {
          heading: "Catch log",
          body: [
            "Fishermen can log each catch with its time, volume, species, photos and notes, and the location is attached automatically. The log opens on this month's totals, then shows each outing as a card coloured by its catch: pomfret, mackerel, prawns, sardine.",
          ],
          images: [
            { src: "/projects/seaguard/catch-logs.webp", alt: "Catch logs with monthly statistics and a card per outing", width: 297, height: 676 },
            { src: "/projects/seaguard/catch-detail.webp", alt: "A single catch: 45.1 kg of pomfret with photos, location and notes", width: 412, height: 934 },
            { src: "/projects/seaguard/log-new-catch.webp", alt: "Log new catch form with volume, species, media and location", width: 412, height: 1080 },
          ],
        },
        {
          heading: "Reflections",
          title: "Study the app people already use",
          body: [
            "Starting from Fisher Friend gave us a baseline to beat, and the biggest gain came from hierarchy rather than new features: deciding that SOS and today's conditions matter more than everything else, and letting the rest wait one tap away.",
            "It was also my first time designing and building at the same time. Several Figma drafts changed because something was awkward to build in React Native, and several components changed because they didn't match the design. Keeping both in step was most of the job.",
          ],
        },
      ],
    },
    href: "https://github.com/Shucrates/SeaGuard",
  },
  {
    id: "id-card",
    title: "Custom ID",
    summary: "A browser tool for making pop-culture ID cards, built because a video of mine went viral and people kept asking for more. 20,000 visitors in two weeks, and later a talk at Demos Anon in Dublin.",
    year: 2026,
    kind: "Side project · Web app",
    tags: ["Design", "Web/App"],
    video: "/projects/id-card/video.mp4",
    poster: "/projects/id-card/poster.webp",
    caseStudy: {
      role: "Design, build & the videos (solo)",
      duration: "Aug – Oct 2026",
      tools: ["Figma", "React", "Vite", "Tailwind CSS", "HTML Canvas", "Vercel", "Antigravity"],
      sections: [
        {
          heading: "TL;DR",
          body: [
            "Episode 10 of the bored files, my Instagram series, was a tutorial on making a Call Me If You Get Lost ID card with someone else's website. It reached 3.5 million views. My inbox filled with requests for other cards, so I designed and built my own generator: pick a card from a film or series, add your photo and details, and download a print-ready front and back.",
            "It launched with an Oscorp staff ID from The Amazing Spider-Man, then added a TVA ID from Loki and McLovin's licence from Superbad. About 20,000 people visited in its first two weeks, which used up Vercel's free plan. In October I talked about it at Demos Anon at Dogpatch Labs in Dublin.",
          ],
        },
        {
          heading: "Problem",
          title: "Everyone wanted a card I didn't have",
          body: [
            "The tutorial covered one card, made on someone else's site. The comments and DMs asked for more: an Oscorp one from Spider-Man, a TVA one, McLovin's licence, a Hogwarts student ID, and \"do you have a website for this?\"",
            "So the brief was mine to set: one place for every card, where anyone can make their own on a phone in a minute, and where a new card can be added each time a new video goes out.",
          ],
          images: [
            { src: "/projects/id-card/talk-stats.webp", alt: "Slide from the talk: the episode 10 video with 3.5M views, 142K likes, 136K saves and 108K shares", width: 1440, height: 900 },
            { src: "/projects/id-card/talk-inbox.webp", alt: "Slide from the talk: an inbox with 99+ requests asking for more templates", width: 1440, height: 900 },
          ],
        },
        {
          heading: "Process",
          title: "Rebuilding the prop first",
          body: [
            "Every card started as a prop rebuilt in Figma from film stills and reference photos. For the Oscorp ID I redrew the logo, then went through versions of the front with and without a lanyard slot, an empty photo frame for the custom version, and backs with and without a QR code.",
            "The site went through the same rounds. Version one was a plain page titled \"custom id card generator v1 (more layouts soon!)\" with two buttons. Over the next few days it became a landing page with pixel stickers and Windows 95 buttons, a templates page and a thank-you page with a cat.",
          ],
          images: [
            { src: "/projects/id-card/oscorp-process.webp", alt: "Figma canvas of Oscorp staff ID versions: logo, fronts with and without a photo, and backs with a QR code", width: 2400, height: 1776 },
            { src: "/projects/id-card/site-iterations.webp", alt: "The website in Figma, from the plain version one to the landing page, templates, editor, thank-you page and mobile layout", width: 2736, height: 954 },
          ],
        },
        {
          heading: "Cards",
          title: "One card per video",
          body: [
            "The Oscorp and TVA cards each came with a tutorial video, episodes 11 and 13. The TVA ID followed a week after the Oscorp one, and McLovin's licence came about a month later. Every card was built twice, as the film's version and as a blank one waiting for your photo, front and back.",
          ],
          images: [
            { src: "/projects/id-card/loki-process.webp", alt: "Figma canvas of TVA ID fronts and backs, default and custom versions", width: 2400, height: 558 },
            { src: "/projects/id-card/mclovin-process.webp", alt: "Figma canvas of McLovin licence fronts and backs next to reference photos of the prop", width: 2400, height: 1531 },
          ],
        },
        {
          heading: "Landing",
          title: "Made to feel like my videos",
          body: [
            "The site borrows the look of the bored files: one electric blue, Arial Narrow, pixel stickers and grey Windows 95 buttons that click when you press them. The landing page has two buttons, browse templates and buy me a coffee. Later it also pointed to halfbaked.vault, which sells printed cards, with a discount code from our collab.",
          ],
          images: [
            { src: "/projects/id-card/home.webp", alt: "Landing page: create your own (custom id), made by @shuisbored, with browse templates and buy me a coffee buttons", width: 1440, height: 900 },
            { src: "/projects/id-card/home-mobile.webp", alt: "The landing page on a phone", width: 412, height: 900 },
          ],
        },
        {
          heading: "Editor",
          title: "Edit the card, not a form",
          body: [
            "Click a card and you see its front and back as the film had them, with a download. Press create your own and the card empties: click the photo frame to upload and crop, click the name to type over it. There's no form beside the card, so what you see is what prints.",
            "Toggles add the extras a printed card needs, like cutting guides and a working QR code on the back that points wherever you want. Everything is drawn on a canvas in the browser, so your photo is never uploaded anywhere.",
          ],
          images: [
            { src: "/projects/id-card/editor-oscorp.webp", alt: "Oscorp staff ID editor showing the default front and back with download default and create your own buttons", width: 1440, height: 900 },
            { src: "/projects/id-card/crop.webp", alt: "Crop window for the uploaded photo, with zoom and rotate", width: 1440, height: 900 },
            { src: "/projects/id-card/oscorp-custom.webp", alt: "A custom Oscorp ID with my photo and name, cutting lines and a custom QR code on the back", width: 1440, height: 900 },
          ],
        },
        {
          heading: "Details",
          title: "Each card gets its own trick",
          body: [
            "The TVA ID has a photo filter with an intensity slider, so any selfie takes on the show's sepia-green tint. McLovin's licence lets you draw your own signature and puts a scannable PDF417 barcode on the back. Downloading gives you both sides at full resolution in a ZIP, along with a burst of confetti and a thank-you.",
          ],
          images: [
            { src: "/projects/id-card/tva-custom.webp", alt: "A custom TVA ID with the photo filter on at 45%", width: 1440, height: 900 },
            { src: "/projects/id-card/signature.webp", alt: "Signing McLovin's licence in the signature pad", width: 1440, height: 900 },
            { src: "/projects/id-card/thanks.webp", alt: "Thank-you page after downloading, with make another, buy me a coffee and follow me", width: 1440, height: 900 },
          ],
        },
        {
          heading: "Launch",
          title: "The free plan did not survive",
          body: [
            "About 20,000 people visited in the first two weeks (the analytics showed 20,229 visitors and 31,236 page views), and that used up Vercel's free tier. I put one-year cache headers on the card artwork, fonts and sounds and removed the analytics script, which cut repeat requests a lot.",
            "The cards also led to collabs, starting with halfbaked.vault, who make printed pop-culture cards.",
          ],
          images: [{ src: "/projects/id-card/talk-analytics.webp", alt: "Slide from the talk: Vercel analytics showing 20,229 visitors, and a usage warning email", width: 1440, height: 900 }],
        },
        {
          heading: "The talk",
          title: "Demos Anon at Dogpatch Labs",
          body: [
            "On 22 October 2026 I told the story at Demos Anon at Dogpatch Labs in Dublin, thanks to Chinaza Uzoukwu: where the idea came from, how it grew my content and what I learned. The slides were a scrollable web page in the same style as the site, and they're live at id-talk.vercel.app.",
          ],
          video: { src: "/projects/id-card/talk.mp4", poster: "/projects/id-card/talk-poster.webp", title: "My talk about the ID card generator at Demos Anon, Dogpatch Labs", width: 1280, height: 720 },
        },
        {
          heading: "Reflections",
          title: "Just keep creating",
          body: [
            "This is the line I ended the talk on. I made the card tutorial because I'd run out of ideas, and I built the site because people asked. Neither was planned as a product. Make the thing you'd want for yourself. If it gets popular, great. If it doesn't, make the next one.",
            "Shipping one card at a time, alongside the videos, kept the site small enough to build in days and gave people a reason to come back. Some things only showed up after launch, like the hosting bill.",
          ],
        },
      ],
    },
    href: "https://id.patilshubham.me",
  },
  {
    id: "run-club",
    title: "The Run Club Thane",
    summary: "A film and a merch pitch for my town's run club: an episode of the bored files at their anniversary party, then three drop themes, tee designs and a deck to sell them.",
    year: 2026,
    kind: "Merch concepts · Pitch deck",
    tags: ["Design"],
    video: "/projects/run-club/video.mp4",
    poster: "/projects/run-club/poster.webp",
    caseStudy: {
      role: "Creative direction, merch design & video",
      duration: "2026",
      tools: ["Figma", "Figma Slides"],
      sections: [
        {
          heading: "TL;DR",
          body: [
            "The Run Club Thane (TRCT) is the local run club in my town. I filmed their one-year anniversary post-run party for episode 6 of the bored files, one of the series' most-watched videos at 17,900 views.",
            "Out of that collab came a merch pitch: a set of wordmarks, three themes for a drop, rough tee designs built from the club's own lines and a galloping-horse mark, and a deck with two packages of what I'd deliver.",
          ],
          images: [{ src: "/projects/run-club/slide-cover.webp", alt: "Deck cover: TRCT.IN merch pitchdeck by @shuisbored", width: 1440, height: 810 }],
        },
        {
          heading: "The film",
          title: "Starting with the people",
          body: [
            "I went to TRCT's one-year anniversary post-run party with my camera. The episode is about the energy of the people in it more than the running, and that became the brief for the merch too: things the members would actually want to wear after a run.",
          ],
          video: { src: "/videos/bored-files-6.mp4", poster: "/videos/posters/bored-files-6.webp", title: "The bored files, episode 6: run club", width: 720, height: 404 },
        },
        {
          heading: "Wordmarks",
          title: "Finding the club's voice",
          body: [
            "The club goes by its handle, trct.in, so I started there: the same seven characters set in a heavy grotesk, a wide display face, a rounded italic, a script and an oval badge. Next to them sat the long name in an editorial italic with three galloping horses, the mark that ended up on almost every design.",
          ],
          images: [
            { src: "/projects/run-club/wordmarks.webp", alt: "trct.in set in seven typefaces, plus a green oval badge", width: 1600, height: 1600 },
            { src: "/projects/run-club/graphic-wordmark.webp", alt: "The Run Club Thane in italic serif over three galloping horses, est 2025", width: 1000, height: 1000 },
            { src: "/projects/run-club/graphic-real-run-club.webp", alt: "You da real run club, in italic serif on red, over running hares", width: 1000, height: 1000 },
          ],
        },
        {
          heading: "Themes",
          title: "Genesis, Origin, Dawn",
          body: [
            "The deck opens with three directions for a drop, each a colour and a mark. Genesis is forest green with a star. Origin is slate blue with a sun rising over water. Dawn is rust red with a burst of light, for the early starts every runner knows.",
          ],
          images: [{ src: "/projects/run-club/themes.webp", alt: "Three theme slides: Genesis in green, Origin in slate blue and Dawn in rust red", width: 2480, height: 450 }],
        },
        {
          heading: "Tees",
          title: "Lines only a club would print",
          body: [
            "Every tee keeps the front quiet, a small trct.in and the horses at the chest, and puts the statement on the back. \"More than a club. The miles brought us here, the people made us stay\" carries the anniversary date. Others lean into running in-jokes: \"Horses don't stop, they keep going\", \"Who's gonna carry the boats? And the logs?\", \"I'm only here for the post run activities\", and a route traced in Strava orange.",
            "I tried each one on black, cream and red and shot them in the same room, so the club could compare them side by side.",
          ],
          images: [
            { src: "/projects/run-club/tee-more-than-a-club.webp", alt: "Cream tee with red print: More than a club, The Run Club Thane, the miles brought us here, the people made us stay", width: 1257, height: 1400 },
            { src: "/projects/run-club/tee-red.webp", alt: "Red tee with the same back print in white", width: 858, height: 1000 },
            { src: "/projects/run-club/tee-post-run.webp", alt: "Cream tee: I'm only here for the post run activities, with dancing figures", width: 898, height: 1000 },
          ],
        },
        {
          heading: "More drafts",
          body: [
            "The black run has the louder ideas: the Strava tee with the route outline, a TRCT.IN back print with the club's description in small type, and the quote tees in an italic serif.",
          ],
          images: [
            { src: "/projects/run-club/tee-strava.webp", alt: "Black tee with an orange route outline and a Strava joke on the back", width: 1153, height: 1400 },
            { src: "/projects/run-club/tee-trct-in.webp", alt: "Black tee with TRCT.IN across the back, over a blurred photo of runners", width: 824, height: 1000 },
            { src: "/projects/run-club/tees-quotes.webp", alt: "Two black tees: Horses don't stop they keep going, and Who's gonna carry the boats", width: 565, height: 1400 },
          ],
        },
        {
          heading: "The pitch",
          title: "Two packages, one deck",
          body: [
            "The pitch deck walks from the themes to the rough tee drafts, then lays out what the club would get. Package 01 covers the merch itself: creative direction, three tee graphics front and back with two rounds of revisions, a custom hem tag, print-ready files and a mockup of each design. Package 02 is everything needed to sell it: premium mockups for the online store, a website hero banner for mobile and desktop, product page graphics, a merch reveal post and an Instagram story.",
          ],
          images: [
            { src: "/projects/run-club/slide-package-1.webp", alt: "Package 01: creative direction, tee graphics, hem tag, print files and mockups", width: 1440, height: 810 },
            { src: "/projects/run-club/slide-package-2.webp", alt: "Package 02: e-commerce mockups, website banner, product graphics, reveal post and story", width: 1440, height: 810 },
          ],
        },
        {
          heading: "Reflections",
          title: "Sell the drop, not just the shirt",
          body: [
            "Splitting the work into two packages made the ask concrete. The club could choose just the tees, or the tees plus everything needed to launch them online.",
            "Keeping one horse mark and one italic across the tees, the posts and the deck let three very different themes still read as the same club.",
          ],
        },
      ],
    },
    href: null,
  },
  {
    id: "autopharmax",
    title: "AutoPharmaX",
    summary: "My final-year research project: a deep learning model that predicts how well a cancer drug works on a given tumour cell line, even for drugs it has never seen, plus the product around it.",
    year: 2026,
    kind: "Research · AI product",
    tags: ["AI/ML", "Research", "Design"],
    video: "/projects/autopharmax/video.mp4",
    poster: "/projects/autopharmax/poster.webp",
    caseStudy: {
      role: "Co-author & product design (team of 4)",
      duration: "2025 – 2026, final year",
      tools: ["Python", "PyTorch", "RDKit", "SHAP", "FastAPI", "Streamlit", "MLflow", "Figma"],
      sections: [
        {
          heading: "TL;DR",
          body: [
            "Two patients with the same cancer can respond completely differently to the same drug, because their tumours differ at the molecular level. AutoPharmaX takes a cancer cell line's genomics and a drug's chemical structure and predicts ln(IC50), the dose needed to halve the cancer cells' growth.",
            "It was our final-year project in AI & ML at SIES Graduate School of Technology, written up as the paper \"AutoPharmaX: A Multitask Deep Learning System for Cancer Drug Response and Synergy Prediction\" with Rithvik Shetty, Vinay Pokharkar and Srishti Mishra, guided by Prof. Ketki Kausadikar. I designed the product: a landing page in Figma, and here, the rest of the interface that only ever existed as a Streamlit app.",
          ],
        },
        {
          heading: "Problem",
          title: "Models that only remember",
          body: [
            "Most published drug response models are tested on random splits of the data, so every drug and cell line in the test set has already been seen in training. A model can score well just by remembering pairs, and then be useless for a new compound, which is the whole point of drug discovery. The paper calls this the generalisation gap.",
            "So the headline result had to be leave-drug-out: hold back 20% of the drugs entirely and see how the model does on them.",
          ],
        },
        {
          heading: "Model",
          title: "Two encoders, one number",
          body: [
            "Each cell line becomes 1,378 numbers: expression of the 978 LINCS L1000 landmark genes, mutation flags for 200 cancer-critical genes and their copy number. Each drug becomes 2,228: a 2,048-bit Morgan fingerprint and about 180 RDKit physicochemical descriptors. Two separate encoders squeeze each side down to 256 dimensions, and a regression head turns the joined 512 into a single ln(IC50).",
            "Because the drug encoder only sees chemistry, never a drug's name, it can score a molecule it has never met. An optional graph encoder reads the molecule's atoms and bonds directly instead of the fingerprint.",
          ],
          images: [{ src: "/projects/autopharmax/architecture.webp", alt: "Architecture diagram from the paper: data sources, feature vectors, cell line and drug encoders, fusion head and outputs", width: 1200, height: 1691 }],
        },
        {
          heading: "Data",
          body: [
            "Everything comes from free public sources: drug responses from GDSC2 (about 300,000 drug–cell line pairs across 809 cell lines and 198 compounds), genomics from CCLE via DepMap, structures from PubChem and combination scores from DrugComb. About 260,000 fully characterised pairs survive the merge, and every dropped record is written to an audit log rather than silently skipped.",
          ],
        },
        {
          heading: "Before",
          title: "A Streamlit app and one landing page",
          body: [
            "The working tool was a Streamlit dashboard: two dropdowns, a red button and a column of default bar charts. Before the final model, I'd designed a landing page for an earlier XGBoost prototype in Figma: near-black, a silver wave ribbon, a muted gold wordmark and six reasons set against huge metallic numerals.",
          ],
          images: [
            { src: "/projects/autopharmax/streamlit.webp", alt: "The original Streamlit dashboard: single-drug IC50 prediction with dropdowns and blue SHAP bar charts", width: 1440, height: 609 },
            { src: "/projects/autopharmax/landing.webp", alt: "AutoPharmaX landing page in Figma: dark hero with silver waves and a Why Us grid of six numbered cards", width: 1440, height: 2292 },
          ],
        },
        {
          heading: "Predict",
          title: "The answer, then the reasons",
          body: [
            "I carried the landing page's language into the app: the same black, wave ribbon and metallic numerals, with the glowing gold seams between cards as the grid. The prediction gets the biggest type on the screen, with IC50 in micromolar beside it and a scale showing where it falls between sensitive (below −1) and resistant (above +1).",
            "A chip says whether the pair was in the training data, so a researcher knows when the model is generalising. Below, SHAP values explain the result in two columns, genomic features and drug features, which the paper's dashboard section asks for. For vemurafenib, BRAF mutation leads, as the paper found.",
          ],
          images: [
            { src: "/projects/autopharmax/predict.webp", alt: "AutoPharmaX single-drug prediction screen: A375 melanoma and vemurafenib, predicted ln(IC50) of −2.31, sensitive, with SHAP feature bars", width: 1440, height: 1184 },
            { src: "/projects/autopharmax/predict-mobile.webp", alt: "The prediction screen on a phone", width: 412, height: 941 },
          ],
        },
        {
          heading: "Combination",
          title: "Order doesn't matter",
          body: [
            "The synergy extension scores two drugs together on one cell line, as synergistic, additive or antagonistic. Both drugs go through the same weight-shared encoder, so A + B and B + A always give the same score. The screen shows that directly, with the pair written both ways round.",
          ],
          images: [{ src: "/projects/autopharmax/combination.webp", alt: "Drug combination screen: dabrafenib and trametinib on A375, Loewe synergy score +14.2, synergistic", width: 1440, height: 1000 }],
        },
        {
          heading: "Benchmarks",
          title: "Lead with the hard number",
          body: [
            "The benchmarks page shows each model twice, on a random split and with drugs held out. Ridge drops 32% and XGBoost 30% when the drugs are new. AutoPharmaX goes from r = 0.87 to 0.72, a 17% drop, and the graph encoder narrows it to 15%. The paper marks these values as indicative pending full training runs, and so does the page.",
          ],
          images: [
            { src: "/projects/autopharmax/benchmarks.webp", alt: "Benchmarks screen: random split versus leave-drug-out Pearson r for five models, and a −17% drop for AutoPharmaX", width: 1440, height: 1000 },
            { src: "/projects/autopharmax/pipeline.webp", alt: "Pipeline screen: dataset counts and the two encoder branches leading to the fused prediction", width: 1440, height: 1198 },
          ],
        },
        {
          heading: "Reflections",
          title: "Design for the honest number",
          body: [
            "The first landing page led with a 99.22% R² from the XGBoost prototype, a figure from a random split, the kind of evaluation the paper ends up arguing against. Designing the final interface meant putting the less flattering, more useful number first.",
            "Interpretability is a design problem too. SHAP values are only useful to a researcher if they read in plain words, sorted, and split into biology and chemistry.",
          ],
        },
      ],
    },
    href: "https://github.com/Shucrates/autopharmax",
  },
  {
    id: "speaker-encoder",
    title: "Speaker Encoder",
    summary: "A research paper, published by IEEE: replacing the recurrent speaker encoder in a voice-cloning text-to-speech system with a Transformer, so it can copy an unseen voice from a short clip.",
    year: 2025,
    kind: "Research paper · IEEE",
    tags: ["AI/ML", "Research"],
    video: "/projects/speaker-encoder/video.mp4",
    poster: "/projects/speaker-encoder/poster.webp",
    caseStudy: {
      role: "Co-author (team of 6)",
      duration: "Published Aug 2025",
      tools: ["PyTorch", "Transformer", "GE2E loss", "Tacotron 2"],
      sections: [
        {
          heading: "TL;DR",
          body: [
            "\"Attention Enhanced Speaker Representation with Contrastive Learning\" was presented at the 9th International Conference on Computing, Communication, Control and Automation (ICCUBEA 2025) in Pune, on 22–23 August 2025, and is published in IEEE Xplore.",
            "Voice-cloning text-to-speech systems first turn a short clip of someone speaking into a speaker embedding, a vector that captures who is talking. We replaced the usual LSTM-based encoder with a Transformer and plugged its embeddings into a Tacotron 2 synthesiser, so it can speak in a new voice without retraining.",
            "Written with Arundhati Das, Varsha Patil, Jasmin Hirani, Atharva Kaskar and Yash Varma, from the Department of AI & ML at SIES Graduate School of Technology.",
          ],
        },
        {
          heading: "Problem",
          title: "Recurrent encoders read one frame at a time",
          body: [
            "Most neural TTS systems use a recurrent network, an LSTM or GRU, to read the reference speech. Each frame has to wait for the one before it, so the computation can't be parallelised, and patterns that span a long clip are hard to hold on to. Both cost something in a voice-cloning system that has to work from little data.",
          ],
          images: [{ src: "/projects/speaker-encoder/compare.webp", alt: "Diagram: an LSTM reads frames in a chain, while a Transformer links every frame to every other frame at once", width: 2000, height: 525 }],
        },
        {
          heading: "Approach",
          title: "Attention instead of recurrence",
          body: [
            "The speaker encoder is built on the Transformer. Self-attention lets every frame of the clip look at every other frame, which models dependencies across the whole utterance and gives more robust, generalisable speaker representations.",
            "It's trained as a speaker verifier with the Generalized End-to-End (GE2E) loss. The loss pulls clips of the same speaker together and pushes different speakers apart, the contrastive learning in the title. The resulting embeddings condition a Tacotron 2 synthesiser, which gives zero-shot speaker adaptation: a new voice needs only a reference clip, not more training.",
          ],
          images: [{ src: "/projects/speaker-encoder/pipeline.webp", alt: "Pipeline diagram: reference speech into the Transformer speaker encoder, a speaker embedding, then Tacotron 2 producing audio", width: 2000, height: 855 }],
        },
        {
          heading: "Results",
          title: "Faster, smaller, closer to the voice",
          body: [
            "Against an LSTM-based baseline, the Transformer encoder improved speaker similarity, equal error rate (EER), model complexity and inference latency. Removing the recurrent parts also simplified the end-to-end pipeline, and parallel computation sped up both training and inference.",
          ],
        },
        {
          heading: "Reflections",
          title: "Attention earns its place in small-data settings",
          body: [
            "The results support attention-based encoders where data is scarce and voices are unseen, the settings voice cloning actually has to handle. They make a practical replacement for RNN encoders in modern TTS.",
          ],
        },
      ],
    },
    href: "https://ieeexplore.ieee.org/document/11284010",
  },
  {
    id: "irsya",
    title: "Irsya",
    summary: "Launching a clothing label: the wordmark, three tee designs (Mandela, Om and Butterfly), mockups in every colourway, and the posts and reels that teased the drop.",
    year: 2023,
    kind: "Brand & apparel design",
    tags: ["Design"],
    video: "/projects/irsya/video.mp4",
    poster: "/projects/irsya/poster.webp",
    caseStudy: {
      role: "Brand, tee & launch graphics design",
      duration: "Sep – Dec 2023",
      tools: ["Photoshop"],
      sections: [
        {
          heading: "TL;DR",
          body: [
            "Irsya is a clothing label I helped launch. The name is a Sanskrit and Buddhist term for jealousy or envy, and the line became \"where jealousy is a virtue\". I designed the wordmark in Latin and Devanagari, the first three tees (Mandela, Om and Butterfly), the mockups for every colourway, and the posts, stickers and reels that built up to the drop. Everything was made in Photoshop.",
          ],
          images: [{ src: "/projects/irsya/mandela-mockup.webp", alt: "Mandela tee mockup on hangers: a small Irsya mark on the front and a large white mandala on the back of a brown tee", width: 1600, height: 942 }],
        },
        {
          heading: "Name",
          title: "Ir-sya, in two scripts",
          body: [
            "The wordmark spells the name with its transliteration marks, ĪRṢYĀ, set wide in a classic serif so it reads like an inscription. Next to it sits the word in Devanagari, ईर्ष्या, drawn with the same calm, high-contrast strokes. The two appear together across the tees, tags and posts, so the label carries the word's origin with it.",
          ],
          images: [{ src: "/projects/irsya/wordmarks.webp", alt: "The Irsya wordmark in a spaced serif with diacritics, beside the word written in Devanagari", width: 1920, height: 980 }],
        },
        {
          heading: "Tees",
          title: "Mandela, Om, Butterfly",
          body: [
            "Each tee keeps a small mark on the chest and puts the artwork on the back. The Mandela tee is a dense white mandala, with a second panel running down one sleeve. The Om tee circles the symbol with a ring of Devanagari script and red flowers. The Butterfly tee is a cream butterfly melting into drips, with the definition of the word set beneath it.",
          ],
          images: [{ src: "/projects/irsya/prints.webp", alt: "The three back prints on black: a white mandala, an Om inside a ring of script and red flowers, and a dripping cream butterfly", width: 2440, height: 840 }],
        },
        {
          heading: "Mockups",
          title: "Every design, every colour",
          body: [
            "To choose colours before anything was printed, I put each design onto front-and-back mockups in chocolate brown, deep green, lilac and red. Seeing the whole range side by side made it easy to cut the pairings that didn't work, and the same mockups went straight onto the store and Instagram.",
          ],
          images: [
            { src: "/projects/irsya/mandela-colourways.webp", alt: "The Mandela tee in brown, green, lilac and red, front and back", width: 2424, height: 1438 },
            { src: "/projects/irsya/butterfly-colourways.webp", alt: "The Butterfly tee in brown, green, lilac and red, front and back", width: 2424, height: 1438 },
          ],
        },
        {
          heading: "Final three",
          body: [],
          images: [
            { src: "/projects/irsya/om-mockup.webp", alt: "Om tee mockup in black, front and back", width: 1600, height: 942 },
            { src: "/projects/irsya/butterfly-mockup.webp", alt: "Butterfly tee mockup in deep green, front and back", width: 1600, height: 942 },
          ],
        },
        {
          heading: "Launch",
          title: "Building up to the drop",
          body: [
            "Before the first tee went on sale, the account ran a teaser campaign: a crescent moon with \"coming soon\", the name melting through the butterfly, glitchy and holographic \"IRSYA ?????\" posts, and a save-the-date. I also made sticker sheets of evil eyes and hamsas for the orders.",
          ],
          images: [
            { src: "/projects/irsya/launch-posts.webp", alt: "Four teaser posts: a crescent moon coming soon, the butterfly wordmark, a glitch IRSYA and a holographic IRSYA", width: 2720, height: 704 },
            { src: "/projects/irsya/stickers.webp", alt: "Sticker sheets of evil eyes and hamsas, and a red IRSYA poster with a raven and moon", width: 2440, height: 840 },
          ],
        },
        {
          heading: "Reel",
          title: "Presenting Irsya",
          body: [
            "The launch reel spells out the name with each letter switching typefaces, flickering between styles until it settles, then ends on \"launching soon\".",
          ],
          video: { src: "/projects/irsya/teaser.mp4", poster: "/projects/irsya/teaser-poster.webp", title: "Irsya launch teaser reel", width: 1920, height: 1080 },
        },
        {
          heading: "Reflections",
          title: "A name gives you a lot to work with",
          body: [
            "Starting from what the word means gave every design a reason to exist, from the definition printed under the butterfly to the Devanagari on the Om tee.",
            "Mocking up every colourway early was the most useful step. It turned \"which colour?\" from a debate into a glance.",
          ],
        },
      ],
    },
    href: "https://www.instagram.com/irsya.official/",
  },
];

export const findProject = (id: string) => projects.find((project) => project.id === id);
