import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

/** Seconds each cover stays up before the next fades in. */
const HOLD = 5;
/** Start and end framing for each cover; alternated so the pan changes direction. */
export const MOVES = [
  { from: { scale: 1.05, x: "-3%", y: "2%" }, to: { scale: 1.25, x: "3%", y: "-3%" } },
  { from: { scale: 1.25, x: "3%", y: "-2%" }, to: { scale: 1.05, x: "-2%", y: "3%" } },
];

/** The main menu's right half: album covers slowly zooming and panning, cross-fading in turn. */
export function KenBurns({ images }: { images: string[] }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (images.length < 2) return;
    const timer = setInterval(() => setShown((i) => i + 1), HOLD * 1000);
    return () => clearInterval(timer);
  }, [images.length]);

  if (!images.length) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#e4e7eb] to-[#a7aeb8] text-[48px] text-white">
        ♪
      </div>
    );
  }
  const index = shown % images.length;
  const move = MOVES[shown % MOVES.length];
  return (
    <div className="relative h-full overflow-hidden bg-black">
      <AnimatePresence initial={false}>
        <motion.div
          key={shown}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="absolute inset-0"
            initial={move.from}
            animate={move.to}
            transition={{ duration: HOLD + 1, ease: "linear" }}
          >
            <Image src={images[index]} alt="" fill sizes="480px" className="object-cover" />
          </motion.div>
        </motion.div>
      </AnimatePresence>
      {/* The shadow the menu casts across the art. */}
      <div aria-hidden className="absolute inset-y-0 left-0 w-[6px] bg-gradient-to-r from-black/30 to-transparent" />
    </div>
  );
}
