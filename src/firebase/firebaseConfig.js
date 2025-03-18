import { initializeApp, getApps, getApp } from 'firebase/app';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};


// TODO Luego deberia quedar asi para verificar antes de iniciar app: >>>  
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp(); // Antes de inicializar verifica que no este inicializado anteriormente 
// const app = initializeApp(firebaseConfig)

export default app;
