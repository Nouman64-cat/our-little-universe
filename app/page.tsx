import { RomanticExperience } from "@/components/romantic-experience/RomanticExperience";
import { getWhisperPool } from "@/lib/whispers.server";

export default async function Home() {
  const whisperPool = await getWhisperPool();
  return <RomanticExperience whisperPool={whisperPool} />;
}
