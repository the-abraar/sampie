// Contrast check for every palette in brand/tokens.css (WCAG ratios). Throws if any pair fails.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const css = readFileSync(new URL("../brand/tokens.css", import.meta.url), "utf8");

export function palettes() {
  const out = {};
  for (const [, name, body] of css.matchAll(/\[data-theme="(\w+)"\]\s*\{([^}]*)\}/g)) {
    out[name] = Object.fromEntries([...body.matchAll(/--c-([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map(m => [m[1], m[2]]));
  }
  return out;
}

const lum = hex => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

// [foreground, background, minimum, why]
const pairs = [
  ["ink", "paper", 7, "body text"],
  ["primary", "paper", 7, "headings, buttons, QR"],
  ["paper", "primary", 7, "text on card front"],
  ["accent-ink", "paper", 4.5, "small labels on paper"],
  ["accent", "primary", 4.5, "small BIOLOGY caps on front"],
];

export function checkContrast() {
  const p = palettes(), fails = [];
  if (Object.keys(p).length < 1) throw new Error("no palettes parsed from tokens.css");
  for (const [name, c] of Object.entries(p))
    for (const [fg, bg, min, why] of pairs) {
      if (!c[fg] || !c[bg]) { fails.push(`${name}: missing --c-${fg} or --c-${bg}`); continue; }
      const r = ratio(c[fg], c[bg]);
      if (r < min) fails.push(`${name}: ${fg} on ${bg} = ${r.toFixed(2)} (needs ${min}, ${why})`);
    }
  if (fails.length) throw new Error("Contrast check failed:\n  " + fails.join("\n  "));
  return Object.keys(p);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.assert(Math.abs(ratio("#000000", "#ffffff") - 21) < 0.01, "ratio self-test");
  for (const [name, c] of Object.entries(palettes()))
    console.log(name.padEnd(8), pairs.map(([f, b]) => `${f}/${b} ${ratio(c[f], c[b]).toFixed(1)}`).join("  "));
  console.log("OK:", checkContrast().join(", "));
}
