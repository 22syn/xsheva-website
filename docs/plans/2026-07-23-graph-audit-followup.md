> NEXT SESSION: review this plan before making structural changes to this repo, and report status to Kobi.

# Graph-Audit Follow-up — xsheva-website (2026-07-23)

## Graph snapshot

- **Code symbols:** 13 (84 nodes total) — by far the smallest repo; a static, mostly-HTML marketing page with a thin JS layer.
- **Top hubs (by in/out degree):**
  1. `xsheva/scripts/main.js` (deg 7) — page logic / interactions.
  2. `xsheva/scripts/firebase.js` (deg 6) — Firebase init from env (`app`, `requiredEnvVars`, `firebaseConfig`).
- **Import cycles:** none.
- **Age:** ~51 days since first commit in the audited window (the oldest / most settled repo here).

## Change-risk hotspots

- **`xsheva/scripts/firebase.js`** — the only module with real coupling: it reads all `VITE_FIREBASE_*` env vars and throws if any are missing. Nothing structural, but it is the one file where a change (env keys, init) can break the whole page load. Keep the env-var guard intact.
- **`xsheva/scripts/main.js`** — page logic; low degree, self-contained.

## Action items

- **No structural action required — watch-list only.** With just 13 code symbols, no cycles, and a settled ~51-day age, there is nothing to restructure. This is a static marketing site; the dependency graph is trivially small and healthy. The single zero-edge node is `vite.config.js` (build config, not dead code). Only real caution: keep the `firebase.js` env-var validation in place so a missing key fails loudly rather than silently.
