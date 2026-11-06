import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudy } from "@/components/projects/CaseStudy";
import { findProject, projects } from "@/content/projects";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ id: project.id }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[id]">): Promise<Metadata> {
  const project = findProject((await params).id);
  return { title: project?.title, description: project?.summary };
}

export default async function CaseStudyPage({ params }: PageProps<"/projects/[id]">) {
  const { id } = await params;
  const project = findProject(id);
  if (!project) notFound();
  const at = projects.indexOf(project);
  return (
    <CaseStudy
      project={project}
      number={at + 1}
      total={projects.length}
      previous={projects[at - 1] ?? null}
      next={projects[at + 1] ?? null}
    />
  );
}
