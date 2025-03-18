// src/firebase/storage.js
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import app from "./firebaseConfig";

const storage = getStorage(app);

//* -------- Almacenamiento --------
export const uploadFile = async (path, file) => {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      return snapshot;
    } catch (error) {
      console.error("Error al actualizar el archivo: ", error);
      throw error;
    }
  };

  export const getFileURL = async (path) => {
    try {
      const storageRef = ref(storage, path);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error("Error al obtener la URL del archivo: ", error);
      throw error;
    }
  };

export default storage;
