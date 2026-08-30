// Node-only regression guard for hero-grid.wgsl: catches shader compile errors and
// dead output without a browser.
//
// Uses vgpu/node (real WebGPU via the `webgpu`/Dawn native binding), not vgpu/mock —
// @vgpu/adapter-mock's own README says the mock adapter is for command/resource tests
// only and does not rasterize; a mock render target's read() always comes back zero
// regardless of what the shader does. Confirmed directly: a trivial solid-color shader
// read back all-zero on vgpu/mock and correct pixels on vgpu/node.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { init, target, effect, frame, clock } from "vgpu/node";

const shaderPath = join(dirname(fileURLToPath(import.meta.url)), "shaders", "hero-grid.wgsl");
const shaderSource = readFileSync(shaderPath, "utf-8");

const gpu = await init();
// clearColor: transparent, so any non-zero byte in the readback came from the shader
// actually drawing a line — not from an opaque clear masking a dead shader.
const renderTarget = target(gpu, { size: [64, 64], clearColor: [0, 0, 0, 0] });
const gridEffect = effect(gpu, shaderSource, { blend: "alpha" });
const gpuClock = clock(gpu);

const renderedFrame = frame(gpu, (activeFrame) => {
  gridEffect.set({ time: gpuClock.time, dpr: 1, offset: [0, 0] });
  activeFrame.pass(renderTarget, gridEffect);
});
await renderedFrame.done;

const pixels = await renderTarget.read();
gpu.dispose();

const hasDrawnPixel = pixels.some((byte) => byte !== 0);
const hasEmptyPixel = pixels.some((byte) => byte === 0);

if (!hasDrawnPixel) {
  console.error("hero-fx mock test failed: readback is all zero — shader drew nothing.");
  process.exit(1);
}

if (!hasEmptyPixel) {
  console.error("hero-fx mock test failed: readback has no zero bytes — shader filled the whole target instead of drawing a grid.");
  process.exit(1);
}

console.log("hero-fx mock test passed: shader compiled and rendered a partial grid pattern.");
