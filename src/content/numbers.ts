/**
 * Every number the journey and episodes quote. Update them here; the copy reads
 * from this file, so nothing else needs to change.
 */
export const numbers = {
  // UPDATE: where it started (sept 2024).
  start: { posts: 1, followers: 50 },
  // UPDATE: the keychain video's stats (episode 10).
  keychain: { views: 3_500_000, likes: 142_000, saves: 136_000, shares: 108_000 },
  // UPDATE: followers before and after the ID card video and generator.
  followers: { before: 150, after: 5_500 },
};

/** 3500000 → "3.5M", 142000 → "142K". */
export const compact = (n: number) =>
  new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
