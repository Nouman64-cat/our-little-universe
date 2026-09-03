/** Mix a hex colour toward black (`amount` 0–1) — for outlines and shadows. */
export function darken(hex: string, amount: number): string {
  return mix(hex, 0, amount);
}

/** Mix a hex colour toward white (`amount` 0–1) — for highlights. */
export function lighten(hex: string, amount: number): string {
  return mix(hex, 255, amount);
}

function mix(hex: string, target: number, amount: number): string {
  const n = hex.replace("#", "");
  const to = (i: number) => {
    const c = parseInt(n.slice(i, i + 2), 16);
    const v = Math.round(c + (target - c) * amount);
    return v.toString(16).padStart(2, "0");
  };
  return `#${to(0)}${to(2)}${to(4)}`;
}
