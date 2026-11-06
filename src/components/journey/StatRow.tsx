import { compact } from "@/content/numbers";
import type { Episode } from "@/content/episodes";
import { lcdDate, lcdTime } from "@/components/camera/format";

/** What the episode is and how it did: "cmiygl · 03.2025 · 0:27 · 3.5M views · 142K likes ...". */
export function StatRow({ episode }: { episode: Episode }) {
  const stats = Object.entries(episode.stats ?? {}).flatMap(([label, n]) =>
    n === undefined ? [] : [`${compact(n)} ${label}`],
  );
  const date = episode.date ? [lcdDate(episode.date)] : [];
  const items = [episode.format, ...date, lcdTime(episode.durationSec), ...stats];
  return (
    <ul className="flex flex-wrap gap-x-[0.9em] gap-y-[0.2em]">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
