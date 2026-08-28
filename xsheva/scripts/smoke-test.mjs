// Regression guard for the zero-values defect (XSHEVA-DESIGN-SPEC.md REQ-08).
// The stats section used to ship $0M+ / 0% / 0.0x in the server-rendered HTML
// and only patched in the real numbers via a scroll-driven count-up — meaning
// crawlers, AI answer engines, and fast scrollers saw zero results. This
// reads the built HTML directly (no JS execution) so it fails the same way
// those readers would see it.

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const distPath = join(dirname(fileURLToPath(import.meta.url)), "..", "dist", "index.html");

if (!existsSync(distPath)) {
  console.error(`Smoke test failed: ${distPath} does not exist. Run \`npm run build\` first.`);
  process.exit(1);
}

const html = readFileSync(distPath, "utf-8");

const mustContain = ["$2M+", "40%", "3.5x"];
const mustNotContain = [">$0M+<", ">0%<", ">0.0x<", "⟨PLACEHOLDER⟩"];

const missing = mustContain.filter((value) => !html.includes(value));
const present = mustNotContain.filter((value) => html.includes(value));

if (missing.length || present.length) {
  if (missing.length) console.error("Missing expected metric values in built HTML:", missing);
  if (present.length) console.error("Found forbidden placeholder/zero values in built HTML:", present);
  process.exit(1);
}

console.log("Smoke test passed: real metric values are present in the server-rendered HTML.");
