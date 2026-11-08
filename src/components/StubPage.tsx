import { HomeLink } from "@/components/HomeLink";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
};

export function StubPage({ eyebrow, title, description }: Props) {
  return (
    <section className="flex min-h-[calc(100dvh-var(--spacing-header))] flex-col justify-center gap-6 px-gutter py-16">
      <p className="font-label text-xs uppercase tracking-wider text-ink-muted">{eyebrow}</p>
      <h1 className="font-display text-5xl font-semibold tracking-tight md:text-7xl">{title}</h1>
      <p className="max-w-prose text-lg text-ink-muted">{description}</p>
      <HomeLink
        className="w-fit font-label text-sm uppercase tracking-wider underline-offset-4 hover:underline"
      >
        ← back to the space
      </HomeLink>
    </section>
  );
}
