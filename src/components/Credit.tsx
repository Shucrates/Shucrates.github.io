import type { Credit as CreditType } from "@/content/site";

/**
 * Attribution for a third-party asset (CC BY), tucked into the corner of the page that shows it.
 * `className` places and colours it somewhere else.
 */
export function Credit({
  credit,
  className = "bottom-4 left-gutter rounded-pill bg-bg px-2 py-0.5 text-ink-muted",
}: {
  credit: CreditType;
  className?: string;
}) {
  return (
    <a
      href={credit.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed z-50 font-label text-[10px] uppercase tracking-wider underline-offset-2 hover:underline ${className}`}
    >
      {credit.label}
    </a>
  );
}
