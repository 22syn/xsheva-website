# Website

Monorepo for the **Xsheva** marketing site and related tooling.

## Xsheva

**Xsheva: Multiply Everything** — precision-targeted lead generation architecture for the US market.  
Static marketing site built with Vite and deployed on Firebase Hosting.

### Tech stack

- **Vite** 6 — dev server and production build
- **Firebase** — hosting and analytics
- **Vanilla** HTML, CSS, and JavaScript

### Prerequisites

- Node.js 18+
- npm (or pnpm/yarn)

### Getting started

```bash
cd xsheva
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the site.

### Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start Vite dev server    |
| `npm run build`| Production build → `dist`|
| `npm run preview` | Preview production build locally |

### Deploy (Firebase)

Build and deploy to Firebase Hosting:

```bash
cd xsheva
npm run build
firebase deploy
```

Ensure `firebase.json` and `.firebaserc` are configured for your project.

### Project structure

```
website/
├── xsheva/              # Xsheva marketing site (Vite + Firebase)
│   ├── index.html
│   ├── scripts/
│   ├── styles/
│   ├── public/
│   └── firebase.json
├── maestro/             # Maestro config and docs
├── README.md
└── *.md                 # Planning and spec docs
```

## License

Private.
