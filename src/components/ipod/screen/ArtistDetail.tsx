import type { Artist } from "@/lib/music-types";
import { ARTIST_HEADER, type Row } from "../menu";
import { Artwork } from "./Artwork";
import { MenuList } from "./MenuList";

type Props = {
  artist: Artist;
  rows: Row[];
  cursor: number;
  first: number;
  visible: number;
  rowHeight: number;
  onPick: (index: number) => void;
};

/** An artist's photo and genres, then my top songs by them. */
export function ArtistDetail({ artist, ...list }: Props) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-[10px] border-b border-[#c6ccd5] px-[10px]" style={{ height: ARTIST_HEADER }}>
        <Artwork url={artist.imageUrl} size={64} round />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[16px] font-bold">{artist.name}</p>
          <p className="mt-[2px] line-clamp-2 text-[11px] text-[#4d535b]">
            {artist.genres.length ? artist.genres.slice(0, 3).join(", ") : "No genres listed"}
          </p>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <MenuList label={`Top songs by ${artist.name}`} {...list} />
      </div>
    </div>
  );
}
