import type { Metadata } from "next";
import { AnniversaryCountdown } from "@/components/romantic-experience/anniversary/AnniversaryCountdown";

export const metadata: Metadata = {
  title: "our monthiversary ♡",
  description: "A countdown to our next monthly anniversary, in Pakistan time.",
};

export default function AnniversaryPage() {
  return <AnniversaryCountdown />;
}
