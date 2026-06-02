# Xsheva Website — Architecture

## Key Packages

| Package | Purpose |
|---------|---------|
| `@cms/shared` | Shared components + utils with cms monorepo |
| `framer-motion` | Page/section animations |
| `react-hook-form` | Lead capture forms |
| `@tanstack/react-query` | Server state, caching |
| `imagekit-javascript` | Image URL transformations |
| `sentry` | Error monitoring |

## Firebase Usage

- **Firestore:** Lead data, form submissions
- **Functions:** Backend processing, email triggers  
- **Auth:** Admin access
- **Hosting:** Production deployment

## TanStack Query Pattern

```ts
// ✅ correct
const { data, isLoading } = useQuery({
  queryKey: ['leads'],
  queryFn: fetchLeads,
});

// ❌ wrong
const [data, setData] = useState();
useEffect(() => { fetchLeads().then(setData); }, []);
```

## ImageKit Pattern

```ts
// Use ImageKit transformations for all images
const url = imagekit.url({
  path: '/hero.jpg',
  transformation: [{ width: 1200, quality: 80, format: 'webp' }]
});
```

Never use raw eBay/Firebase Storage URLs directly in `<img>` tags.

## Framer Motion Guidelines

- Entrance animations: fade + slide, 0.3–0.5s duration
- Keep it subtle — this is a premium brand, not a flashy site
- Use `will-change` sparingly; measure impact on CWV

## Error Monitoring

- Sentry captures unhandled errors + React ErrorBoundary crashes
- Firebase Analytics: page views + conversion events (lead form submit)
