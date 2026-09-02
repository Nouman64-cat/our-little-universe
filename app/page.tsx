import { RomanticExperience } from "@/components/romantic-experience/RomanticExperience";
import { getSiteContent } from "@/lib/content.server";

export default async function Home() {
  const content = await getSiteContent();
  return <RomanticExperience content={content} />;
}
