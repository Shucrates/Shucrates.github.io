"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { irelandDate, irelandTime, useNow } from "./clock";

const NAME = "Shubham Patil";
const PASSWORD_LENGTH = 9;

/** The lock screen: Irish date and time up top, my photo below. Click (or Enter) to log in. */
export function LoginScreen({ onUnlock }: { onUnlock: () => void }) {
  const router = useRouter();
  const now = useNow();
  const [typed, setTyped] = useState<number | null>(null);

  const unlock = () => setTyped((t) => t ?? 0);

  // "Types" the password, then lets you in.
  useEffect(() => {
    if (typed === null) return;
    const timer = setTimeout(() => (typed >= PASSWORD_LENGTH ? onUnlock() : setTyped(typed + 1)), typed >= PASSWORD_LENGTH ? 260 : 55);
    return () => clearTimeout(timer);
  }, [typed, onUnlock]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") unlock();
      if (event.key === "Escape") router.push("/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <motion.div
      className="absolute inset-0 flex cursor-default flex-col items-center text-white"
      exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)", transition: { duration: 0.45 } }}
      onClick={unlock}
    >
      <div className="mt-[70px] text-center [text-shadow:0_1px_12px_rgba(0,0,0,0.25)]">
        <p className="text-[24px] font-semibold tracking-[-0.01em] text-white/85">{now && irelandDate(now)}</p>
        <p className="mt-[-6px] font-display text-[150px] font-semibold leading-none tracking-[-0.04em] text-white/90">
          {now && irelandTime(now)}
        </p>
      </div>
      <div className="mt-auto mb-[64px] flex flex-col items-center gap-[10px]">
        <button type="button" aria-label={`Log in as ${NAME}`} className="rounded-full" onClick={unlock}>
          <Image
            src="/mac/profile.webp"
            alt=""
            width={78}
            height={78}
            className="h-[78px] w-[78px] rounded-full object-cover shadow-[0_4px_20px_rgba(0,0,0,0.35)]"
          />
        </button>
        <p className="text-[16px] font-semibold [text-shadow:0_1px_6px_rgba(0,0,0,0.3)]">{NAME}</p>
        <div className="flex h-[30px] w-[170px] items-center justify-center rounded-full bg-white/25 px-3 text-[13px] text-white/75 backdrop-blur-md">
          {typed === null ? "Enter Password" : <span className="tracking-[0.2em]">{"•".repeat(typed)}</span>}
        </div>
        <p className="text-[12px] text-white/60">Click to log in</p>
      </div>
    </motion.div>
  );
}
