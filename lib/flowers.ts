/**
 * The flowers she can grow in the garden. Pure data — the face-on SVG art
 * lives in `components/romantic-experience/flowers.tsx`. The lily is the hero
 * and the only species the daily visit plants on its own; the rest she plants
 * by hand from the picker.
 */
export type FlowerSpecies = "lily" | "rose" | "tulip" | "daisy" | "poppy";

export const FLOWER_SPECIES: readonly FlowerSpecies[] = [
  "lily",
  "rose",
  "tulip",
  "daisy",
  "poppy",
];

export const FLOWER_LABEL: Record<FlowerSpecies, string> = {
  lily: "lily",
  rose: "rose",
  tulip: "tulip",
  daisy: "daisy",
  poppy: "poppy",
};

export function isFlowerSpecies(value: unknown): value is FlowerSpecies {
  return (
    typeof value === "string" &&
    (FLOWER_SPECIES as readonly string[]).includes(value)
  );
}
