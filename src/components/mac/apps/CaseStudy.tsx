import type { Project } from "@/content/projects";

/** The project's case study, as a plain document. */
export function CaseStudy({ project }: { project: Project }) {
  const { caseStudy: study } = project;
  return (
    <article className="h-full overflow-auto px-8 py-7 font-display">
      <p className="text-[11px] uppercase tracking-[0.08em] text-black/40">Case study · {project.year}</p>
      <h2 className="mt-2 text-[34px] font-normal leading-none tracking-[-0.05em]">{project.title}</h2>
      <p className="mt-2 text-[14px] text-black/60">{project.summary}</p>
      <dl className="mt-5 grid grid-cols-[80px_1fr] gap-y-1 border-y border-black/10 py-3 text-[12px]">
        <dt className="text-black/40">Role</dt>
        <dd>{study.role}</dd>
        <dt className="text-black/40">Duration</dt>
        <dd>{study.duration}</dd>
        <dt className="text-black/40">Tools</dt>
        <dd>{study.tools.join(", ")}</dd>
      </dl>
      {study.sections.map((section) => (
        <section key={section.heading} className="mt-5">
          <h3 className="text-[15px] font-semibold tracking-[-0.02em]">{section.heading}</h3>
          <p className="mt-1 text-[13px] leading-relaxed text-black/75">{section.body}</p>
        </section>
      ))}
      {project.href && (
        <a
          href={project.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block text-[13px] text-[#0a64d8] underline-offset-2 hover:underline"
        >
          View the project ↗
        </a>
      )}
    </article>
  );
}
