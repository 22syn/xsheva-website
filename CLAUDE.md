# CLAUDE.md — xsheva-website

> 📋 **Active plan (2026-07-23):** [docs/plans/2026-07-23-graph-audit-followup.md](docs/plans/2026-07-23-graph-audit-followup.md) — graph-audit follow-up; review before structural changes.
> 📋 **Improvement plan (2026-07-23):** [docs/plans/2026-07-23-improvement-plan.md](docs/plans/2026-07-23-improvement-plan.md) — humanizing-content want, scoped not yet built.

## Purpose

Marketing site for Xsheva — a "Strategic AI Architecture" landing page. A static,
multi-section marketing page built with plain HTML/CSS/JS, bundled by Vite and
deployed to Firebase Hosting. The actual app lives in the nested `xsheva/` folder.

## Stack

- Vanilla HTML / CSS / JavaScript (no framework) bundled with Vite 6
- Tailwind (utility styling per README)
- Firebase (`firebase` ^11) — hosting + analytics/config
- ES modules (`"type": "module"`)

## Structure

Top level is a thin wrapper; the project is in `xsheva/`:

- `xsheva/index.html` — the page (main entry; large single-file layout)
- `xsheva/scripts/` — `main.js` (page logic), `firebase.js` (Firebase init from env)
- `xsheva/styles/main.css` — styles
- `xsheva/public/` — `favicon.svg`, `stitch/` assets
- `xsheva/assets/`, `xsheva/stitch-assets/` — images / design assets
- `xsheva/firebase.json` — Firebase Hosting config (serves `dist/`, SPA rewrite to `/index.html`)
- `xsheva/vite.config.js`, `xsheva/.firebaserc`

## Run / dev

```bash
cd xsheva
npm install
npm run dev        # Vite dev server → http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview the production build
```

## Conventions / notes

- Firebase config is required: copy `.env.example` → `.env` and fill all `VITE_FIREBASE_*`
  keys (API key, auth domain, project ID, storage bucket, sender ID, app ID, measurement ID).
  `firebase.js` throws "Missing required environment variables" if any are absent; restart
  the dev server after editing env files.
- Never commit `.env` / `.env.local` (gitignored).
- Deploy target is Firebase Hosting (`public: dist`, all routes rewritten to `/index.html`).
- The outer README points to reference material at `~/.gemini/antigravity/vault/02-projects/website/`.
- The `.claude/skills/` reference files are a generic cabinet-wide Repomix dump, not
  repo-specific — do not rely on them for this project's structure.
