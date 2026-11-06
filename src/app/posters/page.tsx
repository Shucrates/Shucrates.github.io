import type { Metadata } from "next";
import { Credit } from "@/components/Credit";
import { PosterWall } from "@/components/posters/PosterWall";
import { posters } from "@/content/posters";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "posters", description: "My graphic design work: posters, flyers and cover art." };

export default function PostersPage() {
  return (
    <>
      <PosterWall posters={posters} />
      <Credit credit={site.credits.folder} />
    </>
  );
}
