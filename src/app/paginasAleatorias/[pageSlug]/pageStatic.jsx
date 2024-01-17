import firebase from "firebase/app";
import "firebase/firestore";

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
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Obtiene una referencia a la colección de usuarios en Firestore
const usersCollection = firebase.firestore().collection("users");

// Función para obtener todos los IDs de usuarios
export async function generateStaticParams() {
  try {
    const usersSnapshot = await usersCollection.get();

    // Mapea los IDs de los usuarios
    const userIds = usersSnapshot.docs.map((doc) => doc.id);

    // Retorna los IDs en el formato necesario para generateStaticParams
    return userIds.map((userId) => ({
      params: { userId },
    }));
  } catch (error) {
    console.error("Error al obtener los IDs de usuarios:", error);
    return [];
  }
}
