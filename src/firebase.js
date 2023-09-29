import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCzD--npY_6fZcXH-8CzBV7UGzPBqg85y8",
  authDomain: "upper-a544e.firebaseapp.com",
  projectId: "upper-a544e",
  storageBucket: "upper-a544e.appspot.com",
  messagingSenderId: "665713417470",
  appId: "1:665713417470:web:73f7fb8ee518bea35999af",
  measurementId: "G-QTFQ55YY5D",
};

const initializeFirebase = () => {
  const app = firebase.initializeApp(firebaseConfig);
  const auth = app.auth();
  const firestore = app.firestore();
  return { auth, firestore };
};

export default initializeFirebase;
