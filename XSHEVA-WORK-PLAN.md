# XSHEVA — Work Plan

**Companion to:** `XSHEVA-DESIGN-SPEC.md` (referenced below as *the spec*)
**Format:** phased. Each phase is independently shippable. Do not start a phase until the previous one's checks pass.

---

## Before you start

Read the spec's §0 first. Three rules govern every task here:

1. **No invented numbers.** `⟨PLACEHOLDER⟩` stays visible in staging and blocks the production deploy.
2. **No value that exists only in JavaScript.**
3. **Spec wins over current implementation**, unless the current implementation was an explicit client instruction — then stop and ask.

**Suggested branch strategy:** one branch per phase, merged in order. Phases 0 and 1 are safe to ship immediately and independently; they carry real risk reduction and should not wait for the redesign.

**Effort key:** `S` ≤ 2h · `M` ½–1 day · `L` 1–3 days

---

## Phase 0 — Correctness

*Nothing here is a redesign. These are defects that actively cost credibility today. Ship this phase on its own, before anything visual.*

### T-0.1 · Server-render every displayed value — `S` · **highest priority**
**Spec:** REQ-05, REQ-06, REQ-07

The `What the architecture returns` section is a `h-[100svh]` scroll-driven reveal whose pre-reveal DOM state is `opacity: 0.15`, `transform: translateY(24px)`, with text content `$0M+`, `0%`, `0.0x`. A plain fetch of xsheva.com returns those zeros — meaning Google, ChatGPT, Perplexity, and link-preview bots currently read XSHEVA's results as zero.

- Put the true value in the server-rendered markup as the element's text content.
- Reduce the count-up to an `opacity` + `transform` reveal, or remove it. If it is kept, it may only overwrite text after hydration confirms it will run, and must restore the true value on completion, on `prefers-reduced-motion`, and on error.
- Audit the whole page for the same pattern — any other scroll-revealed numeric.

**Done when:** raw HTML of the built page contains the real values and none of `$0M+`, `0.0x`, `0%`.

### T-0.2 · Reduced-motion path — `S`
**Spec:** REQ-07

Every scroll-revealed block renders in final state immediately under `prefers-reduced-motion: reduce`. Verify with the OS setting on, not just via devtools emulation.

### T-0.3 · Smoke test for zero-values — `S`
**Spec:** REQ-08

CI test: fetch built HTML, assert presence of each metric string, assert absence of the zero placeholders. This is the regression guard for T-0.1 — without it the defect returns the next time someone touches the animation.

### T-0.4 · Split Metric from StatusChip — `M`
**Spec:** REQ-17

Build both components. Re-map all eight case-study values per the table in spec §7.1. `NDA` and `Active` stop being rendered at `stat` size.

### T-0.5 · Collect the missing data — `S` (client-blocking)
**Spec:** REQ-11, REQ-29

Send the client one list of every value needed: the three headline metrics with methods, and method lines for `0 Manual handoffs` and `0 Developer hours`. Nothing in Phase 3 can complete without these.

**Phase 0 exit:** acceptance criteria 1, 2, and 6 in spec §12 pass.

---

## Phase 1 — Copy

*Five edits. Ship with Phase 0.*

### T-1.1 · Apply the copy changes — `S`
**Spec:** REQ-25 through REQ-29

Work straight from the table in spec §10. The load-bearing one is REQ-25: the site's strongest sentence is currently in 11px helper text under a form field, and its weakest is a section headline. Swap them.

Note REQ-27 removes *"Limited audit slots available"* — a scarcity device sitting inside a brand that claims not to do marketing.

---

## Phase 2 — Token foundation

*No visible redesign yet. This is the substrate everything after depends on.*

### T-2.1 · Define tokens — `M`
**Spec:** §3.1, §3.2, §3.3

Add the color, type, and geometry tokens to `theme.extend` (or `:root`). Set `--x-radius: 0`.

### T-2.2 · Load the typefaces — `S`
**Spec:** §3.2

Archivo, IBM Plex Sans, IBM Plex Mono with `display=swap` and real fallback stacks. Remove any now-unused font.

### T-2.3 · Purge raw hex — `M`
**Spec:** REQ-01

Replace every literal color in components with a token. After this task, `grep` for `#[0-9a-fA-F]{6}` should only hit the token definitions.

### T-2.4 · Remove Material Symbols — `S`
**Spec:** REQ-19

Delete the font link, stylesheet, and every ligature. Icons will be temporarily missing; T-4.1 restores them. Sequenced here so the dependency is impossible to forget.

**Phase 2 exit:** acceptance criteria 3 and 4 pass.

---

## Phase 3 — Micrographics

*This is where the identity becomes visible.*

### T-3.1 · Card chrome — `M`
**Spec:** REQ-12

`border-radius: 0` globally. Corner registration brackets via `::before` / `::after` — CSS is given in the spec. Remove every drop shadow.

### T-3.2 · Drafting grid, remove gradients — `S`
**Spec:** REQ-13, REQ-10

Grid on the page ground and hero/feature panels at 6–10% opacity. Delete the ambient gradient glow — it is the category's visual signature and the fastest single win in this phase.

### T-3.3 · Section codes — `S`
**Spec:** REQ-14

`SEC.01` through `SEC.07` per the spec's assignment. Build one `<SectionHeader code label>` component; do not hand-write them.

### T-3.4 · Method lines on metrics — `S`
**Spec:** REQ-11

Wire the `method` prop into `<Metric>` and populate from T-0.5. **Blocked by T-0.5.**

### T-3.5 · Signal audit — `M`
**Spec:** REQ-09

Walk the page top to bottom. At every scroll position, exactly one element may carry `--x-signal` at fill or display size. Use the per-section table in the spec. Expect to demote most current orange to `--x-ink` or `--x-instrument`.

### T-3.6 · Buttons — `S`
**Spec:** REQ-20, §7.5

Outlined primary replacing solid orange fill. Visible `:focus-visible` ring on every interactive element.

**Phase 3 exit:** acceptance criteria 5 and 8 pass.

---

## Phase 4 — Components

### T-4.1 · Four service icons — `M`
**Spec:** REQ-19, §8.2

SVG source is in the spec, ready to paste. **Preserve `stroke-linecap="square"` and `stroke-linejoin="miter"`** — rounding them turns technical marks into generic UI icons and defeats the entire task.

### T-4.2 · Case study card — `L`
**Spec:** REQ-15, §7.2

Spec-sheet header strip, restructured body, and the check glyphs replaced with a 7×1px instrument rule as list marker.

Suggested `REF` codes: `CH-24` Consul House · `MN-24` Media.net · `RUP-24` Ruppin · `FO-25` Family Office. Confirm years with the client.

### T-4.3 · Redacted variant — `M`
**Spec:** REQ-18, §7.3

Family Office card as a redacted document. Redaction bars `aria-hidden="true"`, plus an accessible sentence: *"Client details withheld under NDA."* Delete the bullet per REQ-28.

This is the highest-value single component on the site — treat it as a design task, not a styling task.

### T-4.4 · Client logo strip — `M`
**Spec:** REQ-21

Stop the auto-scroll. Two tiers, lead row `Media.net · Ruppin Academic Center · Consul House`. Raise `SOURCE 66(TH) 81(JP)` with the client — it is unparseable as a client name.

### T-4.5 · Density pass — `M`
**Spec:** REQ-24

Tighten case cards, metrics grid, and services grid. Leave hero and section intros airy.

---

## Phase 5 — Brand assets

*Client decision required before starting.*

### T-5.1 · Confirm the mark — client decision
**Spec:** REQ-22

Four directions documented: **Registration** (recommended), Datum, Router, Leak Tick. Nothing in this phase proceeds until one is chosen.

### T-5.2 · Implement the mark — `M`
**Spec:** §8.1

SVG source for Registration is in the spec. Monochrome primary, two-tone variant for header and favicon, simplified variant below 20px, wordmark lockup, favicon and OG image regenerated. Remove the stair-step mark everywhere — the two must never appear in the same build.

### T-5.3 · Replace photography — `L`
**Spec:** REQ-23, REQ-16

Remove all stock architecture and infrastructure imagery. Replace with anonymized artifacts of real XSHEVA systems — routing schematics, flow maps, field mappings, before/after pipeline diagrams. Each carries leader-line annotation.

Requires client material. Start the request at the same time as T-0.5 so it is not the thing that blocks launch.

---

## Phase 6 — Verification

### T-6.1 · Acceptance sweep — `M`
Walk all ten criteria in spec §12. Each one is pass/fail, not a judgment call.

### T-6.2 · Contrast audit — `S`
`--x-instrument` `#7E90A5` on `--x-panel` `#101622` is the tightest pair on the site and appears at 9.5–11px. Verify ≥ 4.5:1 and raise the instrument lightness if it fails. Do not ship instrument type that cannot be read.

### T-6.3 · Responsive — `S`
No horizontal body scroll at 320px. Spec-sheet strips, metric grids, and diagrams scroll inside their own `overflow-x: auto` containers.

### T-6.4 · Placeholder gate — `S`
Fail the production build if `⟨PLACEHOLDER⟩` appears anywhere in the output. Cheap, and it is the only thing standing between a staging metric and a live one.

---

## Dependency map

```
T-0.1 ──> T-0.3
T-0.5 ──> T-3.4 ──┐
T-2.1 ──> T-2.3   ├──> T-6.1
T-2.4 ──> T-4.1   │
T-3.1 ──> T-4.2 ──> T-4.3
T-5.1 ──> T-5.2 ──┘
```

Everything in Phase 3 depends on Phase 2 tokens. Nothing in Phase 0 or 1 depends on anything.

---

## Client-blocking items

Send these as one request, today. They are the critical path.

1. Three headline metrics with their measurement methods (REQ-29)
2. Method lines for `0 Manual handoffs` and `0 Developer hours` (REQ-11)
3. Logo direction selected from the four (REQ-22)
4. System artifacts for imagery — anonymized schematics, flow maps, diagrams (REQ-23)
5. Meaning of `SOURCE 66(TH) 81(JP)`, and confirmation of case-study years

---

## Known gaps in this plan

The audit behind the spec inspected the hero and Growth Architecture as rendered. Sections below the fold were assessed from complete page content rather than rendered inspection, because the browser session dropped mid-audit.

Before starting Phase 4, do one rendered pass over Selected Work, the engagement band, the form, and the footer, and reconcile against spec §7.2, §7.3, and §7.6. Expect small corrections; the direction holds regardless.
