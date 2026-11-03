import Image from "next/image";

type Props = { url: string | null; size: number; reflection?: boolean; round?: boolean };

/** Album art or an artist photo, with the iPod's soft mirror underneath if asked for. */
export function Artwork({ url, size, reflection = false, round = false }: Props) {
  const art = (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-[#d9dde3] to-[#9aa2ad] ${round ? "rounded-full" : ""}`}
      style={{ width: size, height: size }}
    >
      {url ? (
        <Image src={url} alt="" fill sizes={`${size * 3}px`} className="object-cover" />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-[#f4f5f7]" style={{ fontSize: size / 2 }}>
          ♪
        </span>
      )}
    </div>
  );
  if (!reflection) return art;
  return (
    <div style={{ width: size }}>
      <div className="shadow-[0_1px_3px_rgba(0,0,0,0.35)]">{art}</div>
      <div
        aria-hidden
        className="overflow-hidden"
        style={{
          height: size * 0.3,
          maskImage: "linear-gradient(rgba(0,0,0,0.35), transparent)",
          WebkitMaskImage: "linear-gradient(rgba(0,0,0,0.35), transparent)",
        }}
      >
        <div className="-scale-y-100">{art}</div>
      </div>
    </div>
  );
}
