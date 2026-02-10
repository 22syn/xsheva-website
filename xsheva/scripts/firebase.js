// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "[REDACTED]",
  authDomain: "website-xsheva.firebaseapp.com",
  projectId: "website-xsheva",
  storageBucket: "website-xsheva.firebasestorage.app",
  messagingSenderId: "930718060818",
  appId: "1:930718060818:web:22b2642cebea04c4f763cb",
  measurementId: "G-QTYLVFQEVT",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
