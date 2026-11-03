import { getNowPlaying } from "@/lib/spotify";
import { cached, failed } from "../respond";

export async function GET() {
  try {
    return cached(await getNowPlaying(), 30);
  } catch (error) {
    return failed(error);
  }
}
