import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firebaseConfig } from "@/firebase/firebaseConfig";

// Configura Firebase

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);

export { firestore, auth, onAuthStateChanged };
