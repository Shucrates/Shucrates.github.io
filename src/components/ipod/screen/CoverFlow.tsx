import { motion } from "framer-motion";
import Image from "next/image";
import { ALBUM_CARD, ALBUM_HEADER, BODY, SCREEN, type Album, type Row } from "../menu";
import { MenuList } from "./MenuList";

/** Covers drawn either side of the centre one. */
const REACH = 4;
/** Centre cover's size; the card is drawn at ALBUM_CARD and scaled down to this until it flips. */
const COVER = 112;
/** Side covers: how far the first sits from the centre, the gap between the rest, their turn and size. */
const SIDE_OFFSET = 92;
const SIDE_GAP = 30;
const SIDE_TURN = 68;
const SIDE_SCALE = 0.62;
/** Height of the cover's centre in the body, leaving room for the names underneath. */
const CENTRE_Y = 88;

type Props = {
  albums: Album[];
  /** The album in the middle. */
  cursor: number;
  /** Flipped over to its song list; only the centre album flips. */
  back: { rows: Row[]; cursor: number; first: number; visible: number; rowHeight: number } | null;
  /** Clicked a cover: brings it to the middle, or flips it if it's already there. */
  onPickAlbum: (index: number) => void;
  onPickSong: (index: number) => void;
};

const spring = { type: "spring", stiffness: 260, damping: 30 } as const;

/** Album covers in a row, the middle one facing you and the rest turned away either side. */
export function CoverFlow({ albums, cursor, back, onPickAlbum, onPickSong }: Props) {
  const centre = albums[cursor];
  return (
    <div className="relative h-full overflow-hidden bg-[linear-gradient(#000_60%,#1a1a1a)] text-white" style={{ perspective: 520 }}>
      {albums.map((album, i) => {
        const d = i - cursor;
        if (Math.abs(d) > REACH) return null;
        const side = Math.sign(d);
        const flipped = d === 0 && back !== null;
        return (
          <motion.div
            key={album.key}
            // Framer drops transformStyle from `style`, so it's set with a class.
            className="absolute transform-3d"
            style={{
              left: SCREEN.width / 2 - ALBUM_CARD / 2,
              top: CENTRE_Y - ALBUM_CARD / 2,
              width: ALBUM_CARD,
              zIndex: 10 - Math.abs(d),
            }}
            initial={false}
            animate={{
              x: side * (Math.abs(d) && SIDE_OFFSET + (Math.abs(d) - 1) * SIDE_GAP),
              rotateY: flipped ? 180 : -side * SIDE_TURN,
              scale: flipped ? 1 : (COVER / ALBUM_CARD) * (d === 0 ? 1 : SIDE_SCALE),
              opacity: back && d !== 0 ? 0.25 : 1,
            }}
            transition={spring}
            onClick={() => onPickAlbum(i)}
          >
            <Cover album={album} />
            {/* The cover's mirror on the glossy floor; it lies flat once the album flips. */}
            <motion.div
              aria-hidden
              className="-scale-y-100 overflow-hidden"
              style={{
                height: ALBUM_CARD * 0.4,
                maskImage: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)",
                WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)",
                backfaceVisibility: "hidden",
              }}
              animate={{ opacity: flipped ? 0 : 1 }}
            >
              <div className="flex items-end" style={{ height: ALBUM_CARD * 0.4 }}>
                <div className="w-full">
                  <Cover album={album} />
                </div>
              </div>
            </motion.div>
            {d === 0 && back && (
              <div
                className="absolute inset-x-0 top-0 bg-white text-[#111] shadow-[0_0_8px_rgba(255,255,255,0.25)]"
                style={{ height: ALBUM_CARD, transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
              >
                <div className="border-b border-[#9aa2ad] bg-gradient-to-b from-[#f7f8fa] to-[#c6ccd5] px-[6px] leading-tight" style={{ height: ALBUM_HEADER }}>
                  <p className="truncate pt-[3px] text-[11px] font-bold">{album.title}</p>
                  <p className="truncate text-[9px] text-[#4d535b]">{album.artist}</p>
                </div>
                <div style={{ height: ALBUM_CARD - ALBUM_HEADER }}>
                  <MenuList label={`Songs on ${album.title}`} {...back} onPick={onPickSong} small />
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
      {centre && !back && (
        <div className="absolute inset-x-[16px] text-center leading-tight" style={{ top: BODY - 46 }}>
          <p className="truncate text-[14px] font-bold">{centre.title}</p>
          <p className="truncate text-[12px] text-[#b4b9c0]">{centre.artist}</p>
        </div>
      )}
    </div>
  );
}

function Cover({ album }: { album: Album }) {
  return (
    <div
      className="relative overflow-hidden bg-gradient-to-br from-[#5d6570] to-[#262a30]"
      style={{ width: ALBUM_CARD, height: ALBUM_CARD, backfaceVisibility: "hidden" }}
    >
      {album.artworkUrl ? (
        <Image src={album.artworkUrl} alt="" fill sizes="300px" className="object-cover" draggable={false} />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-[64px] text-white/70">♪</span>
      )}
    </div>
  );
}
