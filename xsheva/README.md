# Xsheva

Strategic AI Architecture landing page. Built with Vite, Tailwind, Firebase.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Firebase (required)

Copy the template and add your Firebase credentials:

```bash
cp .env.example .env
```

Edit `.env` and set the values from [Firebase Console](https://console.firebase.google.com) → Project Settings → Your apps:

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `{project-id}.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `{project-id}.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
| `VITE_FIREBASE_APP_ID` | Web app ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Analytics measurement ID (G-...) |

> **Never commit `.env` or `.env.local`** — they are gitignored. Use `.env.example` as the shared template.

### 3. Run

```bash
npm run dev
```

Open http://localhost:5173

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Troubleshooting

**Firebase init fails with "Missing required environment variables"**

- Ensure `.env` or `.env.local` exists with all `VITE_FIREBASE_*` keys filled in
- Restart the dev server after editing env files
