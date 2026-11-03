import { NAME } from "../menu";

/** The Settings › About screen, more or less. */
export function About({ songs }: { songs: number }) {
  const rows = [
    ["Name", NAME],
    ["Songs", String(songs)],
    ["Version", "2026"],
  ];
  return (
    <dl className="px-[10px] pt-[6px]">
      {rows.map(([label, value]) => (
        <div key={label} className="flex h-[30px] items-center justify-between border-b border-[#dfe2e6] text-[14px]">
          <dt className="font-bold">{label}</dt>
          <dd className="text-[#4d535b]">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
