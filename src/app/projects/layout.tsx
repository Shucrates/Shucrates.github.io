import { MacScreen } from "@/components/mac/MacScreen";
import { projects } from "@/content/projects";

/**
 * On desktop the laptop itself is drawn by its <ObjectStage> in the root layout (z-40).
 * <MacScreen> blanks the page behind it (z-30) and puts the screen's contents on top (z-50).
 * It lives here, not in the page, so it stays put while a case study opens in a window on it.
 */
export default function ProjectsLayout({ children }: LayoutProps<"/projects">) {
  return (
    <>
      {children}
      <MacScreen projects={projects} />
    </>
  );
}
