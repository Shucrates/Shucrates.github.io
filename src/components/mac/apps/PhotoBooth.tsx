"use client";

import { useEffect, useRef, useState } from "react";

type State = "asking" | "live" | "denied" | "unavailable";

/** Photo Booth: the visitor's webcam, mirrored, with a shutter that keeps a strip of snaps. */
export function PhotoBooth() {
  const video = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<State>(() =>
    typeof navigator !== "undefined" && !navigator.mediaDevices?.getUserMedia ? "unavailable" : "asking",
  );
  const [attempt, setAttempt] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [shots, setShots] = useState<string[]>([]);

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) return;
    let stream: MediaStream | null = null;
    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({ video: { width: 1280, height: 720 }, audio: false })
      .then((s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        stream = s;
        if (video.current) video.current.srcObject = s;
        setState("live");
      })
      .catch(() => !cancelled && setState("denied"));
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [attempt]);

  const snap = () => {
    const v = video.current;
    if (!v) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0);
    setShots((s) => [canvas.toDataURL("image/jpeg", 0.85), ...s].slice(0, 8));
    setFlash(true);
    setTimeout(() => setFlash(false), 180);
  };

  const shoot = () => {
    if (countdown !== null || state !== "live") return;
    let n = 3;
    setCountdown(n);
    const timer = setInterval(() => {
      n -= 1;
      if (n > 0) return setCountdown(n);
      clearInterval(timer);
      setCountdown(null);
      snap();
    }, 700);
  };

  return (
    <div className="flex h-full flex-col bg-[#1e1e1e]">
      <div className="relative min-h-0 flex-1 bg-black">
        <video ref={video} autoPlay muted playsInline className="h-full w-full -scale-x-100 object-cover" />
        {state !== "live" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-10 text-center text-[14px] text-white/80">
            {state === "asking" && <p>Photo Booth would like to use your camera. Allow access in your browser to continue.</p>}
            {state === "denied" && (
              <>
                <p>Camera access was blocked.</p>
                <button
                  type="button"
                  onClick={() => {
                    setState("asking");
                    setAttempt((a) => a + 1);
                  }}
                  className="rounded-[6px] bg-white/15 px-3 py-1 text-[13px] hover:bg-white/25"
                >
                  Try again
                </button>
              </>
            )}
            {state === "unavailable" && <p>This browser can’t open a camera here.</p>}
          </div>
        )}
        {countdown !== null && (
          <p className="absolute inset-0 flex items-center justify-center text-[120px] font-semibold text-white/90 [text-shadow:0_4px_20px_rgba(0,0,0,0.5)]">
            {countdown}
          </p>
        )}
        <div className={`pointer-events-none absolute inset-0 bg-white transition-opacity duration-150 ${flash ? "opacity-90" : "opacity-0"}`} />
      </div>
      <div className="flex h-[74px] shrink-0 items-center gap-3 border-t border-black/50 px-4">
        <div className="flex flex-1 gap-1.5 overflow-hidden">
          {shots.map((shot, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- local data URLs
            <img key={i} src={shot} alt={`Snap ${shots.length - i}`} className="h-[48px] w-[64px] rounded-[3px] object-cover" />
          ))}
        </div>
        <button
          type="button"
          aria-label="Take photo"
          disabled={state !== "live"}
          onClick={shoot}
          className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#e5342a] shadow-[inset_0_-3px_0_rgba(0,0,0,0.25)] transition-transform active:scale-95 disabled:opacity-40"
        >
          <span className="h-[18px] w-[24px] rounded-[4px] border-2 border-white" />
        </button>
        <div className="flex-1" />
      </div>
    </div>
  );
}
