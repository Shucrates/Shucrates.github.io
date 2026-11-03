import { site } from "@/content/site";

export function LinkBar() {
  return (
    <header className="[body:has([data-own-links])_&]:hidden sticky top-0 z-20 flex h-header items-center justify-center bg-bg px-gutter">
      <nav aria-label="Links">
        <ul className="flex flex-wrap justify-center gap-7">
          {site.links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                {...(link.external && { target: "_blank", rel: "noopener noreferrer" })}
                className="font-display text-base uppercase tracking-[-0.04em] text-ink-muted transition-colors hover:text-ink"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
