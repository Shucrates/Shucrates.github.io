export type Video = {
  id: string;
  title: string;
  /** Path under /public (e.g. "/videos/intro.mp4") or a full URL to an mp4/webm. `null` shows a placeholder. */
  src: string | null;
  /** Optional still shown before the video loads. */
  poster?: string;
};

export const shuisbored = {
  title: "The Bored Files",
  handle: "@shuisbored",
  // TODO: replace with the real videos.
  videos: [
    { id: "video-1", title: "Bored File 01", src: null },
    { id: "video-2", title: "Bored File 02", src: null },
    { id: "video-3", title: "Bored File 03", src: null },
  ] satisfies Video[],
};
