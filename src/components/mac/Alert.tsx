"use client";

import { motion } from "framer-motion";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { trapTab } from "./focus";

export type AlertAction = { label: string; onClick: () => void; primary?: boolean };

type Props = {
  icon: ReactNode;
  title: string;
  message?: ReactNode;
  actions: AlertAction[];
  /** Escape, as on the Mac. */
  onCancel: () => void;
};

/**
 * A macOS-style alert, centred on the desktop. Modal: it keeps focus (starting on the
 * primary button, which Enter presses) and hands it back when it closes.
 */
export function Alert({ icon, title, message, actions, onCancel }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const messageId = useId();

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLButtonElement>("[data-primary]")?.focus();
    return () => previous?.focus();
  }, []);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onCancel();
    }
    trapTab(event, ref.current);
  };

  return (
    // Catches clicks so the desktop behind can't be used while it's up.
    <div className="absolute inset-0 z-[1500] flex items-center justify-center" onPointerDown={(e) => e.stopPropagation()}>
      <motion.div
        ref={ref}
        role="alertdialog"
        aria-modal
        aria-labelledby={titleId}
        aria-describedby={message ? messageId : undefined}
        onKeyDown={onKeyDown}
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.12 } }}
        transition={{ duration: 0.16, ease: "easeOut" }}
        className="flex w-[260px] flex-col items-center gap-[10px] rounded-[12px] border border-black/10 bg-[#ececec]/95 px-4 pb-4 pt-5 text-center text-[#1d1d1f] shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
      >
        <div className="h-[64px] w-[64px]">{icon}</div>
        <p id={titleId} className="text-[13px] font-bold leading-snug">
          {title}
        </p>
        {message && (
          <p id={messageId} className="text-[11px] leading-snug">
            {message}
          </p>
        )}
        <div className="mt-[6px] flex w-full flex-col gap-[6px]">
          {actions.map(({ label, onClick, primary }) => (
            <button
              key={label}
              type="button"
              data-primary={primary || undefined}
              onClick={onClick}
              className={`h-[28px] rounded-[6px] text-[13px] font-medium shadow-[0_0.5px_1.5px_rgba(0,0,0,0.25)] focus-visible:outline-[#0a84ff]/50! focus-visible:outline-offset-1! ${
                primary ? "bg-[#0a84ff] text-white" : "bg-white text-[#1d1d1f]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
