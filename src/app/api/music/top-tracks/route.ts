import { getTopTracks } from "@/lib/spotify";
import { cached, failed } from "../respond";

export async function GET() {
  try {
    return cached(await getTopTracks(), 3600);
  } catch (error) {
    return failed(error);
  }
}
