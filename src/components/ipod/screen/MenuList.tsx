import type { Row } from "../menu";

type Props = {
  label: string;
  rows: Row[];
  cursor: number;
  first: number;
  visible: number;
  rowHeight: number;
  /** Clicked or tapped a row: selects it if it's already highlighted. */
  onPick: (index: number) => void;
  /** Smaller text, for the song list on the back of a Cover Flow album. */
  small?: boolean;
};

/** Highlight on the selected row: the iPod classic's glossy blue bar. */
export const SELECTED = "bg-[linear-gradient(#7dbcf7,#3d8fe6_50%,#2b7bd9_51%,#1f6fd1)] text-white";

/** A list as the iPod draws it, scrolled so the selection stays in view. */
export function MenuList({ label, rows, cursor, first, visible, rowHeight, onPick, small = false }: Props) {
  const overflows = rows.length > visible;
  return (
    <div className="relative h-full overflow-hidden">
      <ul
        role="listbox"
        aria-label={label}
        className="absolute inset-x-0 top-0"
        style={{ right: overflows ? 7 : 0, transform: `translateY(${-first * rowHeight}px)` }}
      >
        {rows.map((row, i) => {
          const on = i === cursor;
          return (
            <li
              key={row.key}
              role="option"
              aria-selected={on}
              onClick={() => onPick(i)}
              className={`flex cursor-default items-center justify-between gap-[6px] px-[8px] ${on ? SELECTED : ""}`}
              style={{ height: rowHeight }}
            >
              <span className="min-w-0">
                <span className={`block truncate font-bold leading-tight ${small ? "text-[12px]" : row.detail ? "text-[14px]" : "text-[15px]"}`}>{row.label}</span>
                {row.detail && (
                  <span className={`block truncate text-[11px] leading-tight ${on ? "text-white/85" : "text-[#6b7078]"}`}>
                    {row.detail}
                  </span>
                )}
              </span>
              {row.arrow && <span className="text-[17px] font-bold leading-none">›</span>}
            </li>
          );
        })}
      </ul>
      {overflows && (
        <div aria-hidden className="absolute inset-y-0 right-0 w-[7px] border-l border-[#9aa2ad] bg-[#e8ebef]">
          <div
            className="absolute inset-x-[1px] rounded-[1px] bg-gradient-to-r from-[#8e96a1] to-[#5d6570]"
            style={{ top: `${(first / rows.length) * 100}%`, height: `${(visible / rows.length) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
