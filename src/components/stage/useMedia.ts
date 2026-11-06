import { useSyncExternalStore } from "react";

/** Whether the viewport matches `query`; no query always matches. True on the server. */
export const useMedia = (query: string | undefined) =>
  useSyncExternalStore(
    (onChange) => {
      if (!query) return () => {};
      const media = matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => (query ? matchMedia(query).matches : true),
    () => true,
  );
