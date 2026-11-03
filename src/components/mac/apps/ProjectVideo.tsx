import type { Project } from "@/content/projects";

/** The project's demo, playing in a QuickTime-like window. */
export function ProjectVideo({ project }: { project: Project }) {
  return project.video ? (
    <video
      src={project.video}
      poster={project.poster}
      autoPlay
      muted
      loop
      playsInline
      controls
      className="h-full w-full bg-black object-contain"
    />
  ) : (
    <div className="flex h-full flex-col items-center justify-center gap-2 bg-black text-white/60">
      <span className="text-[40px] leading-none text-white/30">▶</span>
      <p className="text-[15px] text-white/80">{project.title}</p>
      <p className="text-[12px]">Demo video coming soon</p>
    </div>
  );
}
