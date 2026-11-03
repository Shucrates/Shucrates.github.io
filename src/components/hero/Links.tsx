import { site } from "@/content/site";

/** Resume / LinkedIn / Email, underlined; sits bottom-left on the homepage in place of the link bar. */
export function Links() {
  return (
    <ul className="flex justify-center gap-7 md:gap-[2.6vw]">
      {site.links.map((link) => (
        <li key={link.label}>
          <a
            href={link.href}
            {...(link.external && { target: "_blank", rel: "noopener noreferrer" })}
            className="font-display text-base tracking-[-0.04em] uppercase underline underline-offset-4 hover:text-blue md:text-[min(1.9vw,2.9dvh)]"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
