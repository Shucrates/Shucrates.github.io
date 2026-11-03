import { useEffect, useState } from "react";

const ZONE = "Europe/Dublin";
const time = new Intl.DateTimeFormat("en-IE", { timeZone: ZONE, hour: "2-digit", minute: "2-digit", hour12: false });
const date = new Intl.DateTimeFormat("en-IE", { timeZone: ZONE, weekday: "long", day: "numeric", month: "long" });
const short = new Intl.DateTimeFormat("en-IE", { timeZone: ZONE, weekday: "short", day: "numeric", month: "short" });

/** "21:04" in Ireland. */
export const irelandTime = (now: Date) => time.format(now);
/** "Monday 2 November" in Ireland. */
export const irelandDate = (now: Date) => date.format(now).replace(",", "");
/** "Mon 2 Nov 21:04", as in the menu bar. */
export const irelandMenuBar = (now: Date) => `${short.format(now).replace(",", "")} ${time.format(now)}`;

/** The current time, ticking on the minute; null until mounted, so server and client agree. */
export function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const current = new Date();
      setNow(current);
      timer = setTimeout(tick, 60_000 - (current.getTime() % 60_000) + 50);
    };
    tick();
    return () => clearTimeout(timer);
  }, []);
  return now;
}
