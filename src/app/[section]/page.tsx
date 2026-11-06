import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StubPage } from "@/components/StubPage";
import { findObjectBySection, objects } from "@/content/objects";

export const dynamicParams = false;

/** Interactive and drawn objects have their own route folder, e.g. src/app/shuisbored. */
export function generateStaticParams() {
  return objects.filter((object) => !object.interaction).map((object) => ({ section: object.section }));
}

export async function generateMetadata({ params }: PageProps<"/[section]">): Promise<Metadata> {
  const { section } = await params;
  return { title: findObjectBySection(section)?.section };
}

export default async function SectionPage({ params }: PageProps<"/[section]">) {
  const { section } = await params;
  const object = findObjectBySection(section);
  if (!object) notFound();

  return (
    <StubPage
      eyebrow={`[${object.order}] ${object.label}`}
      title={object.section}
      description={object.description}
    />
  );
}
