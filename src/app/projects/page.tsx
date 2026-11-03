import type { Metadata } from "next";
import Link from "next/link";
import { Credit } from "@/components/Credit";
import { MacScreen } from "@/components/mac/MacScreen";
import { projects } from "@/content/projects";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "projects" };

/**
 * The laptop itself is drawn by its <ObjectStage> in the layout (z-40). This page
 * blanks the page behind it (z-30) and puts the screen's contents on top (z-50).
 */
export default function ProjectsPage() {
  return (
    <>
      <div aria-hidden className="fixed inset-0 z-30 bg-bg" />
      <h1 className="sr-only">Projects</h1>
      <MacScreen projects={projects} />
      <Link
        href="/"
        className="fixed left-gutter top-5 z-50 rounded-pill bg-bg px-3 py-1 font-label text-sm uppercase tracking-wider underline-offset-4 hover:underline"
      >
        ← back to the space
      </Link>
      <Credit credit={site.credits.laptop} />
    </>
  );
}
