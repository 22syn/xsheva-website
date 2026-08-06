import { app } from "./firebase.js";

// Firebase is initialized. Use `app` for Firebase services, `analytics` for tracking.
console.log("Firebase initialized:", app.name);

// NOTE ON WHAT IS *NOT* IN THIS FILE
// firebase.js throws at module top level when a VITE_FIREBASE_* var is missing, which kills
// every statement after the import above. So anything the site must not lose lives elsewhere:
//   - smooth scroll  → motion.js (has to go through Lenis anyway)
//   - contact form   → contact-form.js (the only lead-capture path)
// Do not move either back here.
