import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faToggleOn, faToggleOff } from "@fortawesome/free-solid-svg-icons";

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
            const userData = doc.data();
            console.log("Información del usuario:", userData);
            personasData.push(userData);
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

  // Función para asignar permisos a un usuario
  const asignarPermisos = (email, permisos) => {
    console.log("Correo electrónico:", email);
    // Verificar que el correo electrónico sea válido
    if (!email) {
      console.error("Error: Correo electrónico no válido.");
      return;
    }

    console.log("Correo electrónico:", email);

    // Actualizar el documento del usuario solo si existe
    db.collection("usuarios")
      .where("email", "==", email)
      .get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          // Se encontró al usuario, procede con la actualización
          querySnapshot.forEach((doc) => {
            const userId = doc.id;
            const userRef = db.collection("usuarios").doc(userId);

            userRef.get().then((doc) => {
              const userData = doc.data();
              let updatedPermisos = [];

              // Si ya hay permisos, copiarlos
              if (userData.permisos) {
                updatedPermisos = [...userData.permisos];
              }

              // Actualizar o desactivar permisos según la acción
              if (permisos === 0) {
                // Desactivar permisos
                updatedPermisos = [];
              } else if (!updatedPermisos.includes(permisos)) {
                // Activar permiso si no está en la lista
                updatedPermisos.push(permisos);
              }

              // Actualizar el campo permisos
              userRef
                .update({
                  permisos: updatedPermisos,
                })
                .then(() => {
                  console.log("Permisos asignados correctamente.");
                })
                .catch((error) => {
                  console.error("Error al asignar permisos:", error);
                });
            });
          });
        } else {
          console.error(
            "Error: No se encontró ningún usuario con ese correo electrónico."
          );
        }
      })
      .catch((error) => {
        console.error("Error al obtener el usuario:", error);
      });
  };

  // Verificar si el usuario actual tiene acceso
  const userHasAccess =
    userEmail &&
    (userEmail === "uppermex10@gmail.com" ||
      userEmail === "ulises.jacobo@hotmail.com" ||
      userEmail === "contacto@upperds.mx");

  return (
    <div className="container mx-auto px-4 py-8">
      {userHasAccess && (
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
      {userHasAccess && empresaSeleccionada && (
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
                  <div className="mt-2">
                    <button
                      className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center ${
                        persona.permisos && persona.permisos.includes(1)
                      }`}
                      onClick={() => asignarPermisos(persona.email, 1)}
                    >
                      Permiso 1
                      {persona.permisos && persona.permisos.includes(1) ? (
                        <FontAwesomeIcon icon={faToggleOn} className="ml-2" />
                      ) : (
                        <FontAwesomeIcon icon={faToggleOff} className="ml-2" />
                      )}
                    </button>
                    <button
                      className={`bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center ${
                        persona.permisos && persona.permisos.includes(2)
                      }`}
                      onClick={() => asignarPermisos(persona.email, 2)}
                    >
                      Permiso 2
                      {persona.permisos && persona.permisos.includes(2) ? (
                        <FontAwesomeIcon icon={faToggleOn} className="ml-2" />
                      ) : (
                        <FontAwesomeIcon icon={faToggleOff} className="ml-2" />
                      )}
                    </button>
                    <button
                      className={`bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded flex items-center ${
                        persona.permisos && persona.permisos.includes(3)
                      }`}
                      onClick={() => asignarPermisos(persona.email, 3)}
                    >
                      Permiso 3
                      {persona.permisos && persona.permisos.includes(3) ? (
                        <FontAwesomeIcon icon={faToggleOn} className="ml-2" />
                      ) : (
                        <FontAwesomeIcon icon={faToggleOff} className="ml-2" />
                      )}
                    </button>
                    <button
                      className={`bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded flex items-center mt-2 ${
                        persona.permisos && persona.permisos.length > 0
                          ? "bg-gray-500"
                          : "bg-gray-300"
                      }`}
                      onClick={() => asignarPermisos(persona.email, 0)}
                    >
                      Desactivar Permisos
                    </button>
                  </div>
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
