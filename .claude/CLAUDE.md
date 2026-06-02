> Consolidated 2026-06-02 - merged from the Cowork cabinet. This `.claude/` is the single source of truth.

# Xsheva Website — Project Workspace

Lead generation marketing site for the Xsheva brand. US market. Mysterious, high-tech, results-driven.

**Stack:** React 19 + TypeScript + Vite + Tailwind v4 + Firebase + ImageKit + Framer Motion
**Project path:** `~/.gemini/antigravity/projects/website`

---

## How to Run

```sh
cd ~/.gemini/antigravity/projects/website
npm install
npm run dev
```

---

## Brand Identity

| | |
|-|-|
| **Vision** | Growth architecture — mathematical precision, not just marketing |
| **Tone** | Direct, Minimalist, Confident, Intriguing |
| **Colors** | Deep Space Black · Stark White · Neon Orange `#FF6B35` |
| **Typography** | Sans-Serif Geometric, clean, wide, premium |
| **Taglines** | "The Growth Variable" · "Decoded Demand" · "Autonomous Opportunity" · "Multiply Everything" |

---

## Stack Detail

| Layer | Tech |
|-------|------|
| Framework | React 19, TypeScript, Vite |
| Styling | Tailwind v4, Framer Motion |
| Forms | React Hook Form |
| Server state | TanStack Query |
| Backend | Firebase (Firestore, Functions, Auth, Hosting) |
| Shared pkg | @cms/shared |
| Images | ImageKit |
| Testing | Vitest, Playwright |
| Monitoring | Sentry, Firebase Analytics |

---

## @cms/shared

Shared component/utility package with the cms monorepo.
**Rule:** Changes to `@cms/shared` affect both website AND cms verticals — always test both.

---

## Core Rules

1. **Brand consistency** — tone: direct, minimal, confident; zero fluff
2. **TanStack Query for server state** — not manual useEffect + useState
3. **ImageKit for all images** — use transformations, not raw URLs
4. **US market, English only, LTR**
5. **Framer Motion animations** — minimal and purposeful; don't over-animate
6. **Sentry error boundaries** — wrap critical paths; never swallow errors silently
7. **@cms/shared changes** — test website + cms together

---

## Reference Docs

- [architecture.md](knowledge/architecture.md) — stack details, Firebase usage, ImageKit pattern

## Memory & Plans

- [memory.md](memory.md) — decisions, active context
