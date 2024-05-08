import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAiP1248hBEZt3iS2H4UVVjdf_xbuJHD3k",
  authDomain: "upper-8c817.firebaseapp.com",
  projectId: "upper-8c817",
  storageBucket: "upper-8c817.appspot.com",
  messagingSenderId: "798455798906",
  appId: "1:798455798906:web:f58a3e51b42eebb6436fc3",
  measurementId: "G-6VHX927GH1",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Componente Ediciondeempresa
const Ediciondeempresa = () => {
  const [empresas, setEmpresas] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    // Observador para verificar la autenticación del usuario
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserEmail(user ? user.email : null); // Actualizar el estado del correo electrónico del usuario
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = db.collection("usuarios").onSnapshot((snapshot) => {
      const empresasData = [];
      snapshot.forEach((doc) => {
        const empresa = doc.data().empresa;
        if (!empresasData.includes(empresa)) {
          empresasData.push(empresa);
        }
      });
      setEmpresas(empresasData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (empresaSeleccionada && userEmail) {
      const unsubscribe = db
        .collection("usuarios")
        .where("empresa", "==", empresaSeleccionada)
        .onSnapshot((snapshot) => {
          const personasData = [];
          snapshot.forEach((doc) => {
            personasData.push(doc.data());
          });
          setPersonas(personasData);
        });

      return () => unsubscribe();
    } else {
      setPersonas([]);
    }
  }, [empresaSeleccionada, userEmail]);

  const handleEmpresaSeleccionada = (empresa) => {
    setEmpresaSeleccionada(empresa);
  };

  // Verificar si el usuario actual tiene acceso
  const userHasAccess =
    userEmail &&
    (userEmail === "uppermex10@gmail.com" ||
      userEmail === "ulises.jacobo@hotmail.com" ||
      userEmail === "contacto@upperds.mx");

  return (
    <div className="container mx-auto px-4 py-8">
      {userHasAccess && ( // Mostrar la sección solo si el usuario tiene acceso
        <div className="bg-white shadow rounded-lg">
          <h1 className="text-3xl font-bold text-gray-800 p-4">
            Lista de Empresas
          </h1>
          <div className="p-4">
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {empresas.map((empresa, index) => (
                <li
                  key={index}
                  className="p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100"
                  onClick={() => handleEmpresaSeleccionada(empresa)}
                >
                  <p className="text-lg font-semibold text-blue-900">
                    {empresa}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {userHasAccess &&
        empresaSeleccionada && ( // Mostrar la sección solo si el usuario tiene acceso y ha seleccionado una empresa
          <div className="mt-8 bg-white shadow rounded-lg">
            <h2 className="text-2xl font-bold text-gray-800 p-4">
              Personas asociadas a {empresaSeleccionada}
            </h2>
            <div className="p-4">
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {personas.map((persona, index) => (
                  <li key={index} className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-lg font-semibold text-gray-800">
                      {persona.nombre} {persona.apellido}
                    </p>
                    <p className="text-gray-600">{persona.email}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
    </div>
  );
};

export default Ediciondeempresa;
