// generateStaticPaths.js

import { firebaseConfig } from "@/firebase/firebaseConfig";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Configura Firebase

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
