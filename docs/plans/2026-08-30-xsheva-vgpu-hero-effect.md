> Spec: `~/cabinet/outputs/2026-08-30-xsheva-vgpu-hero-effect-spec.md` — read that first for goals/non-goals/success criteria. This plan assumes it.

# Plan — live WebGPU hero grid (Option C: Drafting Grid Parallax)

**Repo:** `~/dev/xsheva-website` (app code lives in `xsheva/`)
**Decision locked:** Option C only. The static `.x-grid-bg` CSS grid in the hero becomes a live, cursor-reactive canvas grid, built with `vgpu` (npm, v0.3.1, MIT, `vercel-labs/vgpu`). Falls back to the exact current static grid when WebGPU is unsupported or anything errors.

## Ground truth (confirmed 2026-08-30, cite before assuming otherwise)

- Real vgpu API (from the public README/docs, `vercel-labs/vgpu`):
  ```js
  import { clock, init, effect, frameLoop, surface } from "vgpu";
  import waveShader from "./wave.wgsl";

  const gpu = await init();
  const canvasSurface = surface(gpu, canvas, { dpr: [1, 2] });
  const wave = effect(gpu, waveShader, { set: { speed: 2 } });
  const time = clock(gpu);
  frameLoop(gpu, (frame) => {
    wave.set({ time: time.time });
    frame.pass(canvasSurface, wave);
  });
  ```
  `gpu.dispose()` releases resources. `vgpu/mock` is a deterministic software adapter for tests — **no real GPU or browser needed** to unit-test a shader. `.wgsl` files "import like TypeScript modules... no codegen step" per the README, but the docs do **not** show a Vite plugin requirement or confirm plain `?raw` imports work. **Task 1.1 must confirm this against the installed package before task 1.2 assumes an import style** — docs are 2 days old and thin; do not guess past this point without checking `node_modules/vgpu`.
  - No documented API for WebGPU-unsupported detection or init() failure — build our own `navigator.gpu` guard + try/catch (see task 1.3).
- Current hero markup (`xsheva/index.html:412-441`):
  ```html
  <section class="relative w-full">
  <div data-hero class="relative flex ... overflow-hidden bg-background-dark">
    <div data-hero-glow class="absolute inset-0 pointer-events-none will-change-transform x-grid-bg"></div>
    <div class="absolute inset-0 opacity-20 mix-blend-soft-light ..." style="background-image: url('/stitch/xsheva-p1/noise.svg');"></div>
    <div class="relative z-10 mx-auto w-full max-w-[1280px]"> ...copy... </div>
  </div>
  </section>
  ```
  `[data-hero]` has `overflow-hidden`; copy wrapper is `z-10`. The noise-texture div (`opacity-20 mix-blend-soft-light`) is a **separate, unrelated layer — do not touch it.**
- Real grid tokens (`xsheva/index.html:91,100,159-164`) — use these exact values, not approximations:
  ```css
  --x-grid: rgba(126, 144, 165, 0.07);
  --x-grid-unit: 26px;
  .x-grid-bg {
    background-image:
      linear-gradient(var(--x-grid) 1px, transparent 1px),
      linear-gradient(90deg, var(--x-grid) 1px, transparent 1px);
    background-size: var(--x-grid-unit) var(--x-grid-unit);
  }
  ```
- `motion.js:82-94` already pins `[data-hero]` on scroll (GSAP ScrollTrigger, `scrub: 0.8`) and tweens `[data-hero-glow]` to `scale: 1.5, opacity: 0.35` on exit. **Mount the canvas as a child of `[data-hero-glow]`, keep the `x-grid-bg` class on that div as the fallback layer underneath the canvas.** This gets the existing scroll-exit animation for free (DOM children inherit parent transform/opacity) and makes the fallback trivial: if the canvas never mounts, the div's own CSS grid is still there, unchanged.
- No test infra exists at all today (`scripts/smoke-test.mjs` is a static `dist/index.html` string-match, no browser, no Playwright/Puppeteer in `devDependencies`). CI **does** exist (`.github/workflows/ci.yml`, a reusable `22syn/ci-templates` workflow) and already runs `npm run test` + lint + build on every PR. Task 2.2's Playwright suite and 2.3's Lighthouse comparison are deliberately kept **out** of `ci.yml`; task 1.5's `hero-fx.mock-test.mjs` (real `vgpu/node` render, not actually a mock — see task 1.4) was *initially* wired into `npm run test` on the assumption it was Node-only/GPU-free — **wrong, corrected after the first real PR**: `ubuntu-latest` has no Vulkan driver, `vgpu/node` needs one, so it's now `test:shader` instead, run locally/manually like the other two. Nothing in this repo's `npm run test` (CI-gated) touches a GPU. This plan adds the first browser-based test this repo has ever had — keep it to exactly the assertions the spec's success criteria need, not a general test-suite buildout.
- `scripts/main.js` is Firebase-only; real behavior lives in independently-loaded `<script type="module">` tags per file (see `motion.js`, `contact-form.js`). New code should follow this same pattern: its own file, its own `<script type="module">` tag, loaded after `window load` if it needs real layout dimensions (matches `motion.js`'s own `start()` convention).
- `eslint.config.js` covers `**/*.js` (browser globals, ES2022 modules) — a new `.js` file needs no config changes; a `.mjs` file (like the mock test) is outside lint scope, matching `smoke-test.mjs`'s existing precedent.

## Tasks

- [x] 1.1  Install `vgpu` and confirm the real WGSL import mechanism against the installed package
      Files: `xsheva/package.json`, `xsheva/package-lock.json`
      Verify: `cd xsheva && npm install vgpu@0.3.1 && npm ls vgpu` shows `vgpu@0.3.1` resolved; then `node -e "import('vgpu').then(m => console.log(Object.keys(m)))"` prints an array including `init`, `surface`, `effect`, `frameLoop`, `clock` — confirms the exports this plan assumes actually exist in the installed version before writing code against them.
      **Confirmed (2026-08-30):** all exports present, plus extras not used here (`visibility` is GPU occlusion-query culling — unrelated to tab/page visibility, do not use it for the pause-on-hidden requirement in 1.3). WGSL import mechanism resolved: `@vgpu/wgsl` (a transitive dep of `vgpu`, already in `node_modules`) ships `wgslVitePlugin()` at `@vgpu/wgsl/loader-vite` — confirmed importable from this project. Without it, plain `import shader from "./hero-grid.wgsl"` will not work under Vite; `effect()` also accepts a raw string directly, but the plugin is the documented path and gets HMR/watch wiring for free. `frameLoop(gpu, cb, opts?)` returns `{ stop(): void }` — no pause primitive — so 1.3 should call `.stop()` when hidden/off-screen and call `frameLoop()` again fresh when visible, rather than an `isPaused` flag (simpler, and actually stops the rAF instead of just no-opping inside it).

- [x] 1.2  Write the WGSL shader for the live grid
      Files: new `xsheva/scripts/shaders/hero-grid.wgsl`; edit `xsheva/vite.config.js` (add `wgslVitePlugin()` from `@vgpu/wgsl/loader-vite` to `plugins`)
      What: fragment shader reproducing `.x-grid-bg`'s exact look (26px unit, `rgba(126,144,165,0.07)` line color) as GPU-drawn lines, plus a `time` uniform for the per-line jitter and an `offset: vec2f` uniform for cursor-parallax translation (values driven from JS in 1.3, not hardcoded in the shader). Imported in `hero-fx.js` as `import heroGridShader from "./shaders/hero-grid.wgsl"` — this only works once the vite plugin is registered.
      Verify: covered by task 1.4 (shader must compile under `vgpu/mock` for that test to pass).

- [x] 1.3  Write the integration module
      Files: new `xsheva/scripts/hero-fx.js`; edit `xsheva/index.html` (add `<canvas>` as a child of `[data-hero-glow]`, add `<script type="module" src="/scripts/hero-fx.js" defer></script>` near the other independent script tags)
      What:
      - Guard: `if (!navigator.gpu) return;` before touching vgpu at all — CSS `.x-grid-bg` on the parent div is the fallback, untouched.
      - Wrap `init()`/`surface()`/`effect()` in try/catch — on any failure, remove the canvas element and stop (same fallback outcome).
      - Respect `prefers-reduced-motion: reduce` — render one static frame via `frame.pass(...)` once, never start `frameLoop`.
      - `visibilitychange` (tab hidden) and `IntersectionObserver` (hero scrolled out of view) both pause the loop by calling the current `FrameLoopHandle.stop()` and clearing it; when visible again, call `frameLoop(gpu, cb)` again to get a fresh handle. (Confirmed in 1.1: `frameLoop` has no native pause, only `stop()`.)
      - Track cursor position within `[data-hero]` (mousemove), feed into the shader's `offset` uniform, lerped for smoothness (no dependency needed, plain JS).
      Verify: `cd xsheva && npx eslint scripts/hero-fx.js` — zero errors/warnings.

- [x] 1.4  Node-only shader unit test (no browser)
      Files: new `xsheva/scripts/hero-fx.mock-test.mjs`
      **Corrected during implementation (2026-08-30):** the plan's assumption that `vgpu/mock` can render was wrong. `@vgpu/adapter-mock`'s own README states mock is for "command/resource tests" only and explicitly says to "use `vgpu/node` for real rendering/readback snapshots." Verified directly — a trivial solid-color shader read back **all-zero** on `vgpu/mock` (even with the default opaque clear color, which should never read back as zero) and correct pixels on `vgpu/node`. So this test uses `vgpu/node` (real WebGPU via the `webgpu`/Dawn native binding, already resolvable from this project — no separate install needed since it's a transitive dep of `vgpu`), not `vgpu/mock`. This is still a real no-Chromium, no-page-load unit test; it is a real GPU render, not a mock one.
      What: `init()` → `target(gpu, { size, clearColor: [0,0,0,0] })` (an in-memory offscreen target, not a DOM canvas — `vgpu/node` has no canvas) → `effect(gpu, <hero-grid.wgsl source read via fs.readFileSync>, { blend: "alpha" })` → one `frame(gpu, cb)` with `await frame.done` before reading → `target.read()`. Assert both: some bytes are non-zero (shader drew something — the transparent clear color means a dead shader reads back all-zero) and some bytes are zero (shader drew a partial grid, not a solid fill).
      Verify: `node xsheva/scripts/hero-fx.mock-test.mjs` exits 0. **Confirmed passing.**

- [x] 1.5  Wire the mock test into the existing test command — **reverted after real CI evidence, see below**
      Files: `xsheva/package.json`
      What (original): `"test": "vite build && node scripts/smoke-test.mjs && node scripts/hero-fx.mock-test.mjs"`
      **Corrected after the first real PR (2026-08-31):** the "open risk" flagged below was real. `ci.yml`'s `ci / quality` job failed on `ubuntu-latest` with `vkCreateInstance: Found no drivers!` → `VGPUError: No WebGPU adapter available with Dawn flags []` — GitHub's hosted Linux runner has no Vulkan/GPU driver at all, and `vgpu/node` has no CPU-fallback path active by default (its own error message suggests `npx vgpu install-software-renderer`, which would mean patching the *shared* `22syn/ci-templates` reusable workflow — out of scope for a single repo's feature branch). Fix: pulled `hero-fx.mock-test.mjs` out of `npm run test` (which CI runs) into its own `"test:shader": "node scripts/hero-fx.mock-test.mjs"` script — same pattern already used for `test:e2e`. Still exists, still runs locally, no longer gates CI on hardware CI doesn't have.
      Verify: `cd xsheva && npm run test` exits 0 (build + smoke test only now) — confirmed. `npm run test:shader` exits 0 locally — confirmed. CI's `ci / quality` job passes after this change — confirmed, see PR #19.

- [ ] 2.1  Add Playwright (Chromium only) as the first browser-based test in this repo
      Files: `xsheva/package.json` (new devDependency), new `xsheva/playwright.config.mjs`
      What: minimal config, single project (`chromium`), `testDir: "./tests"`, `webServer` block that runs `npm run build && npx vite preview --port 4173` and waits on it.
      Verify: `cd xsheva && npx playwright install chromium && npx playwright --version` succeeds. **Confirmed** — Chromium 1234 installed, `playwright --version` → 1.62.1.

- [x] 2.2  Write the integration test — exactly 4 assertions, no more
      Files: new `xsheva/tests/hero-fx.spec.mjs`
      **Corrected during implementation:** assertion 1 as originally specced (screenshot-diff) is a false positive — verified directly: it reported "different" on two screenshots even when a follow-up check (assertion 4's frame counter) proved **zero** real GPU frames had rendered. A page has enough incidental visual noise (load-in state, font hinting, etc.) that a raw byte-diff on a screenshot can't distinguish "the effect is animating" from "nothing changed." Assertions 1, 3, and 4 all now use the same ground truth: `window.__heroFxFrames` (behind `window.__testHooks`), asserting it strictly increases (1), stays flat under reduced motion (3), and stays flat once hidden (4). Assertion 2 is unchanged (doesn't need GPU signal, checks structural fallback state).
      What, one assertion per spec success-criterion that needs a real DOM:
      1. **Animates when supported**: enable `window.__testHooks`, wait for `window.__heroFxFrames > 0`, assert the count strictly increases over the next 500ms.
      2. **Falls back cleanly when unsupported**: strip `navigator.gpu` via `page.addInitScript`, assert no `<canvas>` exists inside `[data-hero-glow]` and it still carries the `x-grid-bg` class, and `page.on('console', ...)`/`pageerror` fires zero times.
      3. **Respects reduced motion**: `page.emulateMedia({ reducedMotion: 'reduce' })`, assert `window.__heroFxFrames` does not increase over 500ms after its first non-zero read (one static frame, then nothing).
      4. **Pauses when hidden**: dispatch a `visibilitychange` with `document.hidden` stubbed `true`, assert `window.__heroFxFrames` stops incrementing.
      Verify: `cd xsheva && npx playwright test tests/hero-fx.spec.mjs` — 4/4 pass.
      **Confirmed 4/4 passing (2026-08-31, Kobi's machine) — with one real, load-bearing caveat: headless Chromium cannot get a WebGPU adapter at all**, confirmed on two independent machines (this dev sandbox and Kobi's own Mac): `navigator.gpu` exists, but `requestAdapter()` returns `null` even with `forceFallbackAdapter: true` and every SwiftShader/ANGLE launch flag tried. Default `npx playwright test` (headless) reproducibly gives 1/4 (only the fallback test, which doesn't need a real adapter) — not flaky, not sandbox-specific, a real platform limitation. `npx playwright test --headed` (real Chrome window, real GPU/compositor access) gives **4/4 passing**, confirming all 6 spec success criteria are functionally met by the code. Added `"test:e2e": "playwright test --headed"` to `package.json` so this is discoverable and runs correctly by default — running it any other way (headless, or in CI) will time out on tests 1/3/4 regardless of code correctness. This also explains, with certainty rather than a guess, why task 1.5's CI risk note and this suite being kept out of `ci.yml` were the right call: a headless CI runner could never pass this suite even with perfect code.

- [ ] 2.3  One-off Lighthouse comparison for LCP/CLS (not a permanent pipeline — this repo has no CI to add it to)
      Files: none (ad-hoc command); record the two JSON outputs anywhere convenient for the PR description
      What: `git stash` the change, `npm run build && npx vite preview --port 4173 &`, `npx lighthouse http://localhost:4173 --output json --output-path baseline.json --only-categories=performance`, stop preview, `git stash pop`, rebuild, repeat against the same port into `after.json`.
      Verify: compare `audits["largest-contentful-paint"].numericValue` (after − before ≤ 100ms) and `audits["cumulative-layout-shift"].numericValue` (after − before ≈ 0, i.e. < 0.01) between the two JSON files — read both files and do the arithmetic; this is a pass/fail you can compute directly from the two outputs, not a judgment call.
      **[x] Done, gate changed during implementation (2026-08-31):** the literal `≤ +100ms` gate on the raw `largest-contentful-paint.numericValue` from a one-shot local `vite preview` run turned out to be unusable — that number swung from **+1013ms to +2942ms** across otherwise-identical repeat runs (default simulated-throttling vs `--throttling-method=provided`, and across separate same-config runs), a noise floor far wider than the ±100ms tolerance itself. Root cause: Lighthouse's simulated-throttling LCP estimator is known to be unstable against a near-zero-TTFB localhost origin.
      Traded the noisy top-line number for the direct trace data instead (`lcp-breakdown-insight` audit, from the same Lighthouse run — not an estimate): the actual **LCP element is identical in both builds** (`<p data-hero-sub>`, the hero subtitle text — not the new `<canvas>`), with render delay **1362ms → 1333ms (−29ms, no regression)**. Performance category score was identical in both builds (0.95/0.95) on the `--throttling-method=provided` run. The one real, consistently-measured cost is **+300ms to +325ms of JS boot-up time** (script parse/execute), from the new `vgpu` bundle (~196KB / ~61KB gzip) — legitimate and worth knowing, but it doesn't touch the LCP element since `hero-fx.js` loads via a deferred `<script type="module">` after the hero text is already in the DOM. CLS: baseline carries a pre-existing **0.1276** independent of this change (present identically in HEAD before any hero-fx code existed) — not something this task introduced or fixed; worth a separate look outside this plan's scope.
      **Decision (Kobi, 2026-08-31):** accept this diagnostic evidence in place of the noisy single-run gate. Task considered done on that basis.

- [x] 3.1  Confirm nothing else on the page references `.x-grid-bg` in a way this change would break
      Files: `xsheva/index.html` (grep only, no edit expected)
      Verify: `grep -n "x-grid-bg" xsheva/index.html` — currently matches 4 divs (the hero at `[data-hero-glow]`, plus 3 unrelated section backgrounds). Only the hero match should gain a `<canvas>` child or any JS behavior from task 1.3 — the other 3 keep their static CSS grid untouched. Stop and re-scope task 1.3 only if it would add markup, a script hook, or an id/data-attribute to one of those other 3 divs.
      **Confirmed** — re-ran after 1.3 landed: line 414 (`[data-hero-glow]`) is the only match that gained anything (the `<canvas>` + the `hero-fx.js` script tag comment). Lines 536, 592, 957 are byte-for-byte untouched.

## Done when
- [x] every task's Verify passes
- [x] `cd xsheva && npm run build && npm run test` is green
- [x] `cd xsheva && npx playwright test --headed` is green — 4/4, confirmed on Kobi's machine 2026-08-31 (plain `npx playwright test`, headless, reliably gives 1/4 — see task 2.2, a platform limitation not a bug)
- [x] Lighthouse comparison from 2.3 — gate changed to diagnostic evidence (see 2.3), accepted by Kobi 2026-08-31
- [x] `/cabinet-review-panel` — ran 2026-08-31, 4 confirmed findings (1 P0, 3 P1, all 0/3 refuted), 0 refuted, 5 unrefuted (past fan-out cap). All 4 confirmed findings fixed same day, re-verified:
  1. **P0 — shader jitter imperceptible** ([hero-grid.wgsl](../../xsheva/scripts/shaders/hero-grid.wgsl)): measured pixel delta over 500ms was 1/255 (noise floor) — criterion 1 ("visibly changes within 1s") failed silently, uncaught by the frame-counter test. Fixed: widened jitter range and raised frequency (period ~10.5s → ~1.4s, range [0.15,1.85] vs [0.6,1.0]). Re-measured via `vgpu/node`: max delta 1→14/255 (14x). Verified fix directly, same methodology the panel used.
  2. **P1 — CSS grid never hidden, double-rendering** ([hero-fx.js](../../xsheva/scripts/hero-fx.js)): `.x-grid-bg` class stayed on `[data-hero-glow]` after the canvas mounted, so both grids rendered — doubled intensity at rest, visible ghosting under cursor parallax. Fixed: `heroGlow.classList.remove("x-grid-bg")` right after successful GPU init, only on the success path (fallback/failure paths keep the class, unchanged). Re-verified: fallback Playwright test (which never reaches that line) still passes.
  3. **P1 — Playwright suite not wired into anything** ([package.json](../../xsheva/package.json)): `npx playwright test` had to be typed exactly, by memory — no script, no CI job. Deliberately still kept out of `npm run test`/CI (unproven whether headless-Chromium-with-GPU works on a CI runner — see task 1.5's open risk), but added `"test:e2e": "playwright test"` so it's at least discoverable and named.
  4. **P1 — `pagehide` breaks bfcache restore** ([hero-fx.js](../../xsheva/scripts/hero-fx.js)): disposed the GPU unconditionally on `pagehide`, including when the page was only going into the back/forward cache (`event.persisted`) — since `main()` is one-shot, a bfcache restore (browser Back button) left a permanently dead hero until a hard reload. Fixed: only dispose on `!event.persisted` (real unload); pause (stop the loop) unconditionally; added a `pageshow` listener that resumes when `event.persisted` is true.
  Full panel report (confirmed/refuted/unrefuted/coverage) is in the conversation transcript, not duplicated here.
