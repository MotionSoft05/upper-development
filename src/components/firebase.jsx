import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// Configura Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDpo0u-nVMA4LnbInj_qAkzcUfNtT8h29o",
  authDomain: "upper-b0be3.firebaseapp.com",
  projectId: "upper-b0be3",
  storageBucket: "upper-b0be3.appspot.com",
  messagingSenderId: "295362615418",
  appId: "1:295362615418:web:c22cac2f406e4596c2c3c3",
  measurementId: "G-2E66K5XY81",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);

export { firestore, auth, onAuthStateChanged };
