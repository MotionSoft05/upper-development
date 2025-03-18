// src/firebase/firestore.js
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import app from "./firebaseConfig";

const db = getFirestore(app);

//* -------- CRUD --------
export const getCollectionData = async (collectionName) => {
  try {
    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collectionRef);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error al obtener los datos de la colección: ", error);
    throw error;
  }
};

export const getUserData = async (userId) => {
  try {
    const userRef = doc(db, "usuarios", userId);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error("Error al obtener los datos del usuario: ", error);
    throw error;
  }
};

export const getEventsByCompany = async (company) => {
    try{
    const eventosRef = collection(db, "eventos");
    const eventosQuery = query(eventosRef, where("empresa", "==", company));
    const querySnapshot = await getDocs(eventosQuery);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));}
    catch(error){
      console.error("Error al obtener los datos de los eventos: ", error);
      throw error;
    }
  };


export const addDocument = async (collectionName, data) => {
  try {
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, data);
    return docRef;
  } catch (error) {
    console.error("Error al agregar el documento: ", error);
    throw error;
  }
};

export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error("Error al actualizar el documento: ", error);
    throw error;
  }
};

export const deleteDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error al borrar el documento: ", error);
    throw error;
  }
};
//* -------- CRUD --------

export default db;
