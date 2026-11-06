// Plain module so server components (the story) can use these too.

/** Digicam file number: the first episode is "100-0001". */
export const fileNumber = (index: number) => `100-${String(index + 1).padStart(4, "0")}`;

/** "2026-06-14" → "06.2026"; no date → "--.----". */
export const lcdDate = (iso?: string) => (iso ? `${iso.slice(5, 7)}.${iso.slice(0, 4)}` : "--.----");

/** 75 → "01:15". */
export const lcdTime = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};
