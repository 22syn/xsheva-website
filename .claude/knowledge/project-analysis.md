# Xsheva (xsheva.com) — Project Analysis

> Source: https://xsheva.com/ | Analysis date: 2025-03-03

---

## Live Site Analysis

### Purpose
- **Lead generation** for Xsheva — CRM, automations, affiliate services
- US market, high-tech, results-driven brand
- Tagline: "Multiply Everything"

### Site Structure

| Section | Content |
|---------|---------|
| **Hero** | X logo, "sheva: Multiply Everything.", subtitle, CTA |
| **Services** | Precision Targeting, Autonomous Systems, Infinite Scale, Decoded Demand |
| **Approach** | The Growth Variable — Precision, Scale, Modernity, Exclusivity |
| **Contact** | Form (FormSubmit.co) — Name, Email, Message |

---

## Brand System

| Token | Value |
|-------|-------|
| **Primary BG** | Deep Space Black `#000` |
| **Text** | Stark White `#FFF` |
| **Accent** | Neon Orange `#FF6B35` |
| **Heading font** | Space Grotesk |
| **Body font** | Inter |
| **Tone** | Direct, minimalist, confident, intriguing |

**Brand rule:** Orange is used sparingly as accent only — not as background or dominant color. No stock photos.

---

## Current Codebase (Local)

### Structure
```
website/
├── xsheva/           ← main app
│   ├── index.html
│   ├── scripts/main.js
│   ├── scripts/firebase.js
│   ├── styles/main.css
│   ├── public/
│   ├── package.json
│   └── firebase.json
├── README.md
└── .cursorrules
```

### Current Stack (as of analysis)
- **Build:** Vite 6
- **Runtime:** Vanilla JS (no React in package.json at time of analysis)
- **Hosting:** Firebase Hosting
- **Form:** FormSubmit.co (external)
- **Dependencies:** `firebase` ^11.0.0

### Gap vs Target Stack
The project brief targets: React 19, TypeScript, Tailwind v4, Framer Motion.
Current codebase is **vanilla HTML/CSS/JS** with Vite. Either:
- The live site is legacy/static and the full stack is in progress
- The brief is aspirational; current implementation is intentionally minimal

---

## Design System (main.css)

- CSS custom properties for colors, typography, spacing
- Responsive breakpoints: 768px, 480px
- Scroll-reveal on `.service-card` and `.value-item` via IntersectionObserver
- Fixed header with backdrop blur
- Simple, no external CSS framework

---

## Stitch / Design Tool Prompts

When using AI design tools, use these prompts:

1. **Desktop hero:** "Landing hero for Xsheva: Multiply Everything. Black background, orange accent #FF6B35, Space Grotesk typography, minimalist, premium. CTA: Get Started."
2. **Services grid:** "4-card grid: Precision Targeting, Autonomous Systems, Infinite Scale, Decoded Demand. Dark theme, orange accents, modern B2B SaaS style."
3. **Contact form:** "Minimal contact form: Name, Email, Message, Submit. Dark theme, orange focus states."

Theme settings: `colorMode: DARK`, `customColor: #FF6B35`, `headlineFont: SPACE_GROTESK`, `bodyFont: INTER`.

---

## Summary

| Aspect | Finding |
|--------|---------|
| **Live site** | Static, branded, functional — matches Maestro brand identity |
| **Codebase** | Vanilla stack; differs from React/Tailwind target brief |
| **Design system** | Well-defined in main.css; CSS vars ready to migrate to Tailwind tokens |
| **Brand** | Consistent: black, white, orange sparingly, no stock photos |
