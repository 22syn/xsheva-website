// Live version of .x-grid-bg (index.html) — keep GRID_UNIT / GRID_COLOR / GRID_ALPHA
// in sync with --x-grid-unit / --x-grid if those design tokens ever change.

struct Params {
  time: f32,
  dpr: f32,
  offset: vec2f,
}

@group(0) @binding(0) var<uniform> params: Params;

const GRID_UNIT: f32 = 26.0;
const GRID_LINE_WIDTH: f32 = 1.0;
const GRID_COLOR: vec3f = vec3f(0.49411765, 0.56470588, 0.64705882);
const GRID_ALPHA: f32 = 0.07;

// Distance-to-nearest-gridline mask, anti-aliased with fwidth so the line stays
// crisp instead of flickering as `offset` shifts it by sub-pixel amounts.
fn gridLineMask(coord: f32) -> f32 {
  let cellPos = fract(coord / GRID_UNIT) * GRID_UNIT;
  let distToLine = min(cellPos, GRID_UNIT - cellPos);
  let aa = max(fwidth(coord), 0.0001);
  return 1.0 - smoothstep(GRID_LINE_WIDTH * 0.5 - aa, GRID_LINE_WIDTH * 0.5 + aa, distToLine);
}

// Cheap hash so neighboring lines don't jitter in lockstep.
fn lineSeed(lineIndex: f32) -> f32 {
  return fract(sin(lineIndex * 12.9898) * 43758.5453);
}

@fragment
fn fs_main(@builtin(position) fragCoord: vec4f) -> @location(0) vec4f {
  let px = fragCoord.xy / params.dpr + params.offset;

  let vMask = gridLineMask(px.x);
  let hMask = gridLineMask(px.y);
  let mask = max(vMask, hMask);
  if (mask <= 0.0) {
    discard;
  }

  let vLine = floor(px.x / GRID_UNIT);
  let hLine = floor(px.y / GRID_UNIT);
  let lineIndex = select(hLine, vLine, vMask > hMask);
  // Wide, fast swing: GRID_ALPHA is already tiny (0.07), so a shallow/slow jitter
  // produces a sub-single-bit pixel delta and reads as motionless. Range [0.15, 1.85]
  // at a ~1.4s period keeps individual lines visibly pulsing (per-line phase via
  // lineSeed avoids the whole grid blinking in lockstep).
  let jitter = 1.0 + 0.85 * sin(params.time * 4.5 + lineSeed(lineIndex) * 6.2831853);

  let alpha = GRID_ALPHA * mask * jitter;
  return vec4f(GRID_COLOR, alpha);
}
