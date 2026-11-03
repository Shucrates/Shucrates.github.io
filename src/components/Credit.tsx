import type { Credit as CreditType } from "@/content/site";

/** Attribution for a third-party asset (CC BY), tucked into the corner of the page that shows it. */
export function Credit({ credit }: { credit: CreditType }) {
  return (
    <a
      href={credit.href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 left-gutter z-50 rounded-pill bg-bg px-2 py-0.5 font-label text-[10px] uppercase tracking-wider text-ink-muted underline-offset-2 hover:underline"
    >
      {credit.label}
    </a>
  );
}
