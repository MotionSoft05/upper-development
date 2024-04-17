// generateStaticPaths.js

import { getFirestore, collection, getDocs } from "firebase/firestore";

// Configura Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAiP1248hBEZt3iS2H4UVVjdf_xbuJHD3k",
  authDomain: "upper-8c817.firebaseapp.com",
  projectId: "upper-8c817",
  storageBucket: "upper-8c817.appspot.com",
  messagingSenderId: "798455798906",
  appId: "1:798455798906:web:f58a3e51b42eebb6436fc3",
  measurementId: "G-6VHX927GH1",
};

// Inicializa Firebase
const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);

// Función para obtener todos los IDs de usuarios
export async function generateStaticParams() {
  try {
    const usersCollection = collection(firestore, "users");
    const usersSnapshot = await getDocs(usersCollection);

    // Mapea los IDs de los usuarios
    const userIds = usersSnapshot.docs.map((doc) => doc.id);

    // Retorna los IDs en el formato necesario para generateStaticPaths
    return userIds.map((userId) => ({
      params: { userId },
    }));
  } catch (error) {
    console.error("Error al obtener los IDs de usuarios:", error);
    return [];
  }
}
