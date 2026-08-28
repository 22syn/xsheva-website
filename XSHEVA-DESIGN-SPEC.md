# XSHEVA — Visual Identity & Interface Specification

**Version:** 1.0
**Status:** Authoritative — implement as written
**Target:** xsheva.com (marketing site)
**Detected stack:** Tailwind CSS (arbitrary values in use: `md:grid-cols-[1.35fr_1fr]`, `h-[100svh]`, `tracking-[-0.02em]`). Adapt syntax if the project differs; the *values* are normative either way.

---

## 0. How to use this document

Requirements carry IDs (`REQ-xx`). The companion `XSHEVA-WORK-PLAN.md` sequences them into tasks and references these IDs.

**Three hard rules for whoever implements this:**

1. **Never invent a number.** Any metric marked `⟨PLACEHOLDER⟩` must be supplied by the client before that component ships. Ship the component with the placeholder visible in a staging build; never guess a value and never ship a placeholder to production.
2. **Never let a displayed value exist only in JavaScript.** See `REQ-05`. This is the single most important requirement in this document.
3. **When this spec and the current implementation disagree, this spec wins** — unless the current implementation is the client's explicit instruction, in which case stop and ask.

---

## 1. The problem this redesign solves

The copy has a point of view. The design does not.

The site says *"Mathematical precision. Not marketing."*, *"Not generic SaaS bolt-ons."*, *"Never a generic stack."* — and then renders that in the exact visual defaults of its category: dark navy ground, orange accent on everything, rounded cards, a soft gradient glow, stock infrastructure photography, and Google's default Material Symbols next to the words "never generic."

The corrective direction is **instrumentation**. XSHEVA sells engineered systems, so the brand should look like measuring equipment, not like a campaign. Every visual decision below derives from that one idea.

**The design thesis, in one line:** *the interface is a drawing, not a poster.*

---

## 2. Constraints — what does not change

| Locked | Reason |
|---|---|
| Positioning and voice | Already strong. Design serves it, does not replace it. |
| Navy `#101622` stays in the palette | Client's existing equity. It is demoted from ground to raised surface, not removed. |
| Orange stays in the palette | Same. It is demoted from "brand color" to "signal color". |
| Information architecture | Section order and page structure are unchanged in v1.0. |
| All existing copy | Except the five specific edits in §10. |

---

## 3. Design tokens

Define these once (Tailwind `theme.extend` or CSS custom properties) and reference them everywhere. **No raw hex values in components.**

### 3.1 Color

```
/* Ground & surfaces */
--x-ground:      #0D121B   /* page background — deeper and more neutral than current navy */
--x-panel:       #101622   /* raised surface: cards, panels — the existing brand navy */
--x-panel-2:     #141C2A   /* nested surface, table stripes */

/* Line */
--x-rule:        #232E3F   /* borders, dividers, table cell edges */
--x-rule-soft:   #1A2331   /* internal hairlines inside a panel */
--x-grid:        rgba(126,144,165,0.07)  /* background drafting grid — see REQ-13 */

/* Text */
--x-ink:         #E6EBF2   /* primary */
--x-ink-2:       #B2BECD   /* body copy, secondary */
--x-instrument:  #7E90A5   /* ALL metadata, codes, units, annotations */

/* Signal */
--x-signal:      #FF5C2B   /* one element per viewport. see REQ-09 */
--x-signal-weak: rgba(255,92,43,0.11)
--x-signal-line: rgba(255,92,43,0.32)
```

**REQ-01 — Two color families, two jobs.**
`--x-instrument` is a *cool, quiet* color that carries every piece of metadata on the site: section codes, units, measurement windows, spec-sheet rows, annotations, timestamps, statuses. `--x-signal` is warm and carries emphasis. They are never interchangeable. Metadata is never orange. Emphasis is never instrument-grey.

**REQ-02 — Light theme is out of scope for v1.0.** The site is dark-only. Paint `background` explicitly on `body` from `--x-ground`; do not rely on an inherited or transparent background.

### 3.2 Type

Load from Google Fonts:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
```

| Role | Family | Fallback stack |
|---|---|---|
| Display | **Archivo** 700 / 800 | `Helvetica Neue, Arial, sans-serif` |
| Body | **IBM Plex Sans** 400 / 500 | `Segoe UI, Arial, sans-serif` |
| Instrument | **IBM Plex Mono** 400 / 500 / 600 | `ui-monospace, Menlo, monospace` |

If Hebrew is ever added to the site, swap body to **IBM Plex Sans Hebrew** — same metrics, same family, full Hebrew coverage.

**Type scale** (use these, do not interpolate):

| Token | Size | Line-height | Tracking | Use |
|---|---|---|---|---|
| `display-xl` | `clamp(38px, 6vw, 68px)` | 1.02 | `-0.025em` | Hero headline |
| `display-l` | `clamp(28px, 4vw, 42px)` | 1.08 | `-0.022em` | Section headlines |
| `display-m` | `22px` | 1.15 | `-0.015em` | Card titles |
| `body-l` | `17px` | 1.6 | `0` | Hero sub, section lede |
| `body` | `15px` | 1.65 | `0` | Everything else |
| `stat` | `clamp(30px, 3.4vw, 44px)` | 1.0 | `-0.02em` | Metric values |
| `instr` | `11px` | 1.5 | `+0.12em` | Instrument layer, uppercase |
| `instr-xs` | `9.5px` | 1.5 | `+0.10em` | Method lines under metrics |

**REQ-03 — Instrument type is always:** IBM Plex Mono, uppercase, `+0.10em` to `+0.14em` tracking, `--x-instrument` color. No exceptions.

**REQ-04 — Tabular numerals.** Apply `font-variant-numeric: tabular-nums` to every element in the `stat` role and to any column of digits.

### 3.3 Geometry

```
--x-radius:      0px     /* everything. see REQ-12 */
--x-border:      1px
--x-grid-unit:   26px    /* background grid pitch */
```

Spacing scale: `4 · 8 · 12 · 16 · 22 · 32 · 44 · 64 · 96` px. Use `gap` on flex/grid parents; avoid per-child margins.

---

## 4. CRITICAL — server-rendered values

**REQ-05 — Every displayed value must exist in the initial HTML.**

*Current defect:* the stats section (`What the architecture returns`) is a `h-[100svh]` scroll-driven reveal. Its pre-reveal state is `opacity: 0.15; transform: translateY(24px)` and its text content is literally `$0M+`, `0%`, `0.0x`. Anything that does not execute the scroll animation reads three zeros — Google's crawler, AI answer engines (verified: a plain fetch of xsheva.com returns `$0M+ Revenue recovered`), link-preview bots, fast momentum scrolling on mobile past a pinned section, and any user with `prefers-reduced-motion` if that path is unhandled.

For a company whose entire positioning is *"Mathematical precision"*, the failure state currently reads as zero results.

**Implementation rule:**

- The real value is the element's text content, present in the server-rendered HTML.
- Count-up animation, if kept, is a **presentational effect over an already-correct value**. It may animate `opacity` and `transform`. It may temporarily overwrite text *only* after hydration confirms the animation will run, and must restore the true value on completion, on `prefers-reduced-motion: reduce`, and on any error.
- Simplest compliant approach: drop the count-up entirely. Fade and translate the block; the number never changes.

**REQ-06 — Reveal animations animate `opacity` and `transform` only.** Never `content`, never text, never `display`.

**REQ-07 — `prefers-reduced-motion: reduce`** renders every revealed block in its final state immediately.

**REQ-08 — Add a smoke test** that fetches the built page's raw HTML and asserts it contains the real metric strings and none of `$0M+`, `0.0x`, `0%`.

---

## 5. Color usage rules

**REQ-09 — One signal element per viewport.**
At any scroll position, at most one element may use `--x-signal` as a fill or as large text. Everything currently orange that is not that one element moves to `--x-ink` or `--x-instrument`.

Concretely, per section:

| Section | The one signal element | Everything else becomes |
|---|---|---|
| Hero | The second headline line (`you're losing.`) | Eyebrow → instrument. CTA → outlined, signal border + signal text, transparent fill |
| Growth Architecture | Section code `SEC.02` | Step numbers → instrument |
| Metrics | Nothing — all values in `--x-ink` | Method lines → instrument |
| Services | Nothing | Icons → `--x-ink`, labels → instrument |
| Selected Work | The `STATUS LIVE` value in the spec-sheet row | Category → instrument, checks → instrument |
| CTA band | The button | — |
| Form | Submit button | Labels + helper → instrument |

**REQ-10 — Remove the ambient gradient glow** from the hero and any other section. It is the visual signature of the category. Replace with the drafting grid (`REQ-13`).

---

## 6. The Micrographics layer

This is the identity. Six rules.

**REQ-11 — Every metric carries its method.**
A number with no measurement window is marketing. A number with one is engineering. Directly under every metric value, in `instr-xs`:

```
$4.2M
Revenue recovered
AGGREGATE · 5 ENGAGEMENTS · 2023–2025
```

The method line is required. If no method line can be written truthfully, the metric does not ship.

**REQ-12 — Sharp corners; registration marks instead of radius.**
`border-radius: 0` globally. Cards get corner registration marks: an 11px L-shaped bracket inset 7px from two opposite corners (top-left and bottom-right), `1px solid --x-signal-line`. Implement with `::before` / `::after`.

```css
.x-card { position: relative; border: 1px solid var(--x-rule); border-radius: 0; }
.x-card::before, .x-card::after {
  content: ""; position: absolute; width: 11px; height: 11px;
  pointer-events: none; border-color: var(--x-signal-line);
}
.x-card::before { top: 7px; left: 7px; border-top: 1px solid; border-left: 1px solid; }
.x-card::after  { bottom: 7px; right: 7px; border-bottom: 1px solid; border-right: 1px solid; }
```

**REQ-13 — Visible drafting grid, not a gradient.**

```css
background-image:
  linear-gradient(var(--x-grid) 1px, transparent 1px),
  linear-gradient(90deg, var(--x-grid) 1px, transparent 1px);
background-size: var(--x-grid-unit) var(--x-grid-unit);
```

Applies to the page ground and to hero/feature panels. Grid opacity stays between 6% and 10% — visible on inspection, invisible at a glance.

**REQ-14 — Section codes.**
Every top-level section is preceded by a code in `instr`, colored `--x-signal`, followed by the section name in `--x-instrument`:

```
SEC.02  /  GROWTH-ARCHITECTURE
```

Assign: `SEC.01` Hero · `SEC.02` Growth Architecture · `SEC.03` Returns · `SEC.04` Services · `SEC.05` Selected Work · `SEC.06` Engagement · `SEC.07` Audit Request.

These are real wayfinding — they let a salesperson say "look at SEC.05" on a call.

**REQ-15 — Spec-sheet header on every case study.**
A single-row bordered strip above the case title, `instr`, cells divided by 1px rules:

```
REF CH-24 · SECTOR HOSPITALITY · SYS LEAD-INFRA · STATUS LIVE
```

Labels in `--x-instrument`, values in `--x-ink` (except `STATUS`, whose value is the section's signal element).

**REQ-16 — Annotated diagrams.**
Any architecture or flow diagram carries thin leader lines with `instr` labels — pitch, latency, layer name. A diagram without annotation is decoration; with annotation it is evidence.

---

## 7. Component specifications

### 7.1 Metric vs Status — two different components

**REQ-17.** The current build renders `NDA` and `Active` in the same slot and typography as `0`, `3`, `2`, and `1st`. The form promises a quantity and delivers a word. Split into two components.

**`<Metric>`** — a measured quantity.
```
value      string   required   e.g. "$4.2M", "31%", "6.4×"
unit       string   optional   rendered inline, instrument color, 0.55em
label      string   required   e.g. "Revenue recovered"
method     string   required   e.g. "MEDIAN · 12-MO POST-DEPLOY"
```
Layout: value (`stat`, `--x-ink`, tabular-nums) → label (`body`, `--x-ink-2`) → method (`instr-xs`, `--x-instrument`).

**`<StatusChip>`** — a state, not a quantity.
```
label      string   required   e.g. "Engagement scope"
state      string   required   e.g. "NDA", "Active", "1st-cycle"
tone       enum     "neutral" | "signal"
```
Layout: a bordered inline chip, `instr`, uppercase, `1px solid --x-rule`, `padding: 4px 9px`. **Never** rendered at `stat` size.

Reassignment of existing values:

| Case | Current | Becomes |
|---|---|---|
| Consul House | `0` Manual handoffs | `<Metric value="0" label="Manual handoffs" method="⟨PLACEHOLDER — was N/day before⟩">` |
| Consul House | `3` Teams on one live feed | `<Metric value="3" label="Teams on one live feed" method="SALES · CS · OPS">` |
| Media.net | `2` LegitScript certifications | `<Metric>` — keep |
| Media.net | `1st` Cycle approval, both times | `<StatusChip label="Cycle approval" state="1ST CYCLE — BOTH" />` |
| Ruppin | `0` Developer hours | `<Metric value="0" label="Developer hours" method="⟨PLACEHOLDER — window⟩">` |
| Ruppin | `1yr+` Running unattended | `<Metric>` — keep |
| Family Office | `NDA` Engagement scope | `<StatusChip label="Engagement scope" state="NDA" />` |
| Family Office | `Active` Status | `<StatusChip label="Status" state="ACTIVE" tone="signal" />` |

**Note on the zeros:** `0 Manual handoffs` and `0 Developer hours` are true and are genuinely the point. But three zeros in one grid read as failure to a cold eye. The method line is what rescues them — `0` above `WAS 4 DAILY, PRE-BUILD` is a result; `0` alone is ambiguous. Both need their placeholder filled before shipping.

### 7.2 Case study card

Structure, top to bottom:

1. Spec-sheet header strip (`REQ-15`)
2. Category — `instr`, `--x-instrument`
3. Client name — `display-m`
4. Problem statement — `body`, `--x-ink-2`, max 48ch
5. Metric / StatusChip row — bordered grid, cells divided by 1px `--x-rule`
6. "What we built" list — **replace the green check glyph** with a 7×1px instrument-colored rule as the marker (`li::before`). Checkmarks are consumer-UI vocabulary.
7. Card chrome per `REQ-12`

### 7.3 Case study card — redacted variant (Family Office)

**REQ-18.** The bullet *"No detail here that could identify the client or their positions"* currently renders as a checked deliverable, which reads as an absence — an admission there is nothing to show. It is the opposite: a US family office trusted XSHEVA enough not to route through outside vendors. That is the strongest trust signal on the site and no competitor can copy it.

Render this card as a **redacted document**:

- Spec-sheet header with visible fields only: `SECTOR PRIVATE-MARKETS · SYS MONITORING · STATUS ACTIVE`
- Client name replaced by a solid `--x-instrument` bar at 40% opacity, height = cap height of `display-m`, width ≈ 8ch
- Two to three further redaction bars inline within the problem statement, replacing specifics
- A stamp in the corner: `REDACTED — NDA`, `instr`, `--x-signal`, `1px solid --x-signal-line`, rotated `-8deg`
- Remove the "no detail here" bullet entirely — the design now says it

Redaction bars are decorative; give them `aria-hidden="true"` and provide an accessible sentence for screen readers: *"Client details withheld under NDA."*

### 7.4 Service card

**REQ-19 — Remove all Google Material Symbols.**
Currently `build`, `bolt`, `smart_toy`, `verified_user` sit next to the words *"Never a generic stack"* and *"not a generic model."* This is the most visible contradiction on the site. Replace with the four custom marks in §8.2.

Card: icon (28px, `--x-ink`, `stroke-width: 2`) → title (`display-m`) → description (`body`, `--x-ink-2`) → optional `instr` label naming the gap it closes. Card chrome per `REQ-12`.

### 7.5 Buttons

| Variant | Spec |
|---|---|
| Primary | Transparent fill, `1px solid --x-signal`, text `--x-signal`, IBM Plex Mono 600, `11px`, `+0.12em`, uppercase, `padding: 12px 20px`, radius `0`. Hover: fill `--x-signal-weak`. |
| Secondary | Same geometry, `--x-rule` border, `--x-ink-2` text. |

Removing the solid orange fill is deliberate: an outlined control reads as an instrument, a filled one reads as an ad.

**REQ-20 — Visible focus.** `outline: 2px solid var(--x-signal); outline-offset: 3px` on `:focus-visible` for every interactive element.

### 7.6 Client logo strip

**REQ-21.** Nine client names currently scroll as equal-weight text, three times over. Media.net — the largest recognizable name — is indistinguishable from the rest.

- Stop the auto-scroll. A static grid reads as a client list; a moving one reads as filler.
- Two tiers: a lead row of three at full `--x-ink`, a secondary row of the rest at `--x-instrument`.
- Recommended lead row: **Media.net · Ruppin Academic Center · Consul House** (largest name, institutional credibility, deepest case).
- `SOURCE 66(TH) 81(JP)` is unparseable as a client name. Resolve or remove it.

---

## 8. Brand assets

### 8.2 Service icons

Common attributes: `viewBox="0 0 32 32"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`, `stroke-linecap="square"`, `stroke-linejoin="miter"`.

**Square caps and miter joins are the whole point** — they are what make these read as technical marks rather than friendly UI icons. Do not round them.

**Custom Tools & CRM** — corner brackets around an assembled panel. Built to fit, not fitted to.
```svg
<path d="M4 9V4h5M23 4h5v5M28 23v5h-5M9 28H4v-5"/>
<path d="M10 11h12v10H10z"/>
<path d="M10 15h12M16 15v6"/>
```

**Lead Automation** — a flow through a node and a closed return path. The return arc is the conversion post-back.
```svg
<path d="M3 11h10"/>
<path d="M13 8h6v6h-6z"/>
<path d="M19 11h10"/>
<path d="M25 7l4 4-4 4"/>
<path d="M29 21H3"/>
<path d="M7 17l-4 4 4 4"/>
```

**AI Agents** — one input, three routed outputs of unequal length. Qualify, summarize, escalate.
```svg
<path d="M3 16h7"/>
<path d="M10 10h8v12h-8z"/>
<path d="M18 13h5M18 16h9M18 19h5"/>
<path d="M23 11.5v3M27 14.5v3M23 17.5v3"/>
```

**Compliance & Onboarding** — a document carrying an approval registration stamp. Echoes the primary mark.
```svg
<path d="M7 4h13l5 5v19H7z"/>
<path d="M20 4v5h5"/>
<circle cx="16" cy="19" r="4.5"/>
<path d="M16 12.5v2.5M16 23v2.5M9.5 19h2.5M20 19h2.5"/>
```

### 8.1 Primary mark — Registration

**REQ-22.** The current mark is an abstract orange stair-step with no source; it could belong to any company. The replacement is a **registration mark** — the alignment target that confirms every layer of a print job is in register. That is XSHEVA's work stated literally: aligning systems that do not line up. The mark is also, unavoidably, an **X**.

```svg
<svg viewBox="0 0 32 32" fill="none" stroke="currentColor"
     stroke-width="2.4" stroke-linecap="square" stroke-linejoin="miter"
     role="img" aria-label="XSHEVA">
  <path d="M16 1v9M16 22v9M1 16h9M22 16h9"/>
  <circle cx="16" cy="16" r="6.5"/>
  <path class="x-mark-core" d="M16 13v6M13 16h6"/>
</svg>
```

- **Monochrome** is primary. `currentColor` throughout.
- **Two-tone variant:** `.x-mark-core` in `--x-signal`, everything else `--x-ink`. Header and favicon only.
- Minimum size **20px**. Below that, ship a simplified variant: outer ticks and circle only, no inner cross.
- Clear space on all sides = the radius of the circle (`6.5` units ≈ 20% of the mark's width).
- Wordmark lockup: mark, then `20px` gap, then `XSHEVA` in Archivo 700, `+0.06em` tracking, cap-height matched to the mark's circle diameter.

Three alternates are on record if this direction is rejected: **Datum** (surveyor's triangle on a baseline — pairs with "Book an Audit"), **Router** (one input, two absolute paths — safest, closest to the current mark), **Leak Tick** (a measurement rule with one tick dropping below the others — most narrative, most literal to "the revenue you're losing").

### 8.3 Imagery

**REQ-23 — Remove all stock architecture and infrastructure photography.**
Replace with artifacts of the systems XSHEVA actually built, anonymized: routing schematics, flow maps, field mappings, before/after pipeline diagrams, log excerpts with values redacted. This is the Pan Am principle — ordinary objects of the trade become the brand's material. It serves as both identity and proof in the same asset, and it cannot be sourced from a stock library by a competitor.

Every such asset carries `REQ-16` annotation.

---

## 9. Density

**REQ-24.** Airy layout is currently applied uniformly. Invert it: breathing room belongs around headlines; proof areas should be dense. A tight, information-rich block reads as evidence. A sparse one reads as a brochure. Specifically — case study cards, the metrics grid, and the services grid tighten; hero and section intros keep their air.

---

## 10. Copy changes

Exactly five. Everything else is unchanged.

| ID | Location | From | To |
|---|---|---|---|
| **REQ-25** | Engagement CTA headline | `Ready to architect your future?` | `Where things break today is more useful than a wish list.` |
| **REQ-26** | Audit form helper text | *(delete — promoted above)* | `Tell us where it breaks. Not what you want built.` |
| **REQ-27** | Engagement CTA body | `Join the businesses that are done duct-taping their operations together. Limited audit slots available.` | `Join the businesses that are done duct-taping their operations together.` |
| **REQ-28** | Family Office bullet 3 | `No detail here that could identify the client or their positions` | *(delete — replaced by the redacted treatment, REQ-18)* |
| **REQ-29** | Metrics section values | `$0M+` · `0%` · `0.0x` | `⟨PLACEHOLDER⟩` — client-supplied, each with a method line per REQ-11 |

**REQ-25 rationale:** *"Ready to architect your future?"* is the only line on the site that sounds like a generic agency. Meanwhile the strongest sentence XSHEVA has ever written is buried in 11px helper text under a form field. Swap their positions.

**REQ-27 rationale:** *"Limited audit slots available"* is a scarcity device. It undercuts a brand whose entire claim is that it does not do marketing.

---

## 11. Anti-patterns

Do not:

- Invent, estimate, or round any metric or method line
- Render a value that exists only after JavaScript executes
- Use hand-drawn, sketch, or "naive" illustration — right for a Gen-Z consumer brand, wrong for US B2B operations buyers evaluating five-figure engagements
- Use any icon set off the shelf
- Apply `--x-signal` to more than one element per viewport
- Reintroduce `border-radius`, ambient gradients, or drop shadows
- Set instrument-layer type on prose the reader actually needs to read
- Add annotation that is decorative rather than true

---

## 12. Acceptance criteria

A section is done when all of these pass.

1. `curl` of the production HTML contains every displayed metric value, and contains none of `$0M+`, `0.0x`, `0%`.
2. `prefers-reduced-motion: reduce` renders every section fully, no missing content.
3. No Material Symbols font, stylesheet, or ligature remains in the bundle.
4. `grep` for `rounded` and for gradient utilities returns nothing in section components.
5. At every scroll position, exactly one element uses `--x-signal` at fill or display size.
6. Every `<Metric>` has a non-empty, truthful `method`.
7. No `⟨PLACEHOLDER⟩` string reaches production.
8. Every interactive element shows a visible focus ring.
9. Lighthouse accessibility ≥ 95; text contrast ≥ 4.5:1 (instrument-on-panel is the tightest pair — verify `#7E90A5` on `#101622`).
10. No horizontal body scroll at 320px; wide tables and diagrams scroll inside their own `overflow-x: auto` container.

---

## Appendix — open items

- **Logo mark:** the four directions are documented; client to select before implementation. Do not ship the existing stair-step alongside the new system.
- **Metric values:** all `⟨PLACEHOLDER⟩` fields await client data.
- **Lower-page sections:** the visual audit behind this spec covered the hero and Growth Architecture directly; sections below were assessed from full page content, not from rendered inspection. Re-verify §7.2, §7.3, and §7.6 against the live render before implementation.
- **`SOURCE 66(TH) 81(JP)`:** meaning unresolved; client to clarify or remove.
