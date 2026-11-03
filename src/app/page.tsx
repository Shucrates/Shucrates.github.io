import { Landing } from "@/components/hero/Landing";
import { sortedObjects } from "@/content/objects";

export default function Home() {
  return <Landing objects={sortedObjects} />;
}
