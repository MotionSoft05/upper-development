import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import app from "./firebaseConfig";

const auth = getAuth(app);

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential;
  } catch (error) {
    throw error; // Aquí se lanza el error que será capturado por el bloque catch en handleLogin
  }
};

export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export const observeAuthState = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    try {
      callback(user);
    } catch (error) {
      console.error("Error in auth state callback:", error);
    }
  });
};

export default auth;
