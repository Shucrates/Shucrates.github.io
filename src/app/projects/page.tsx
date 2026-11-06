import type { Metadata } from "next";
import { ProjectList } from "@/components/projects/ProjectList";
import { projects } from "@/content/projects";

export const metadata: Metadata = { title: "projects" };

/** Desktop: the Mac (see layout.tsx). Phones: a plain list of the same projects. */
export default function ProjectsPage() {
  return <ProjectList projects={projects} />;
}
