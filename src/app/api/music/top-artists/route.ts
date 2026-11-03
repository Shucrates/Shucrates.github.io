import { getTopArtists } from "@/lib/spotify";
import { cached, failed } from "../respond";

export async function GET() {
  try {
    return cached(await getTopArtists(), 3600);
  } catch (error) {
    return failed(error);
  }
}
