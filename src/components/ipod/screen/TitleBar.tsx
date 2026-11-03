import { TITLE_BAR } from "../menu";

type Props = { title: string; playback: "playing" | "paused" | null; loading: boolean };

/** Grey strip across the top: ▶/❚❚ while something's loaded, the title, and the battery. */
export function TitleBar({ title, playback, loading }: Props) {
  return (
    <div
      className="relative flex items-center justify-center border-b border-[#9aa2ad] bg-gradient-to-b from-[#f7f8fa] to-[#c6ccd5] px-[8px] text-[13px] font-bold"
      style={{ height: TITLE_BAR }}
    >
      <span className="absolute left-[8px] flex items-center gap-[5px] text-[9px]" aria-hidden>
        {playback === "playing" ? "▶" : playback === "paused" ? "❚❚" : null}
        {loading && (
          <span className="size-[10px] animate-spin rounded-full border-[1.5px] border-[#6b7480] border-t-transparent" />
        )}
      </span>
      <span className="max-w-[220px] truncate">{title}</span>
      <span className="absolute right-[8px] flex items-center" aria-hidden>
        <span className="h-[9px] w-[19px] rounded-[2px] border border-[#555] bg-gradient-to-b from-[#9be07b] to-[#3f9e2b]" />
        <span className="h-[4px] w-[2px] rounded-r-[1px] bg-[#555]" />
      </span>
    </div>
  );
}
