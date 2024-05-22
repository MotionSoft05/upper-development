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
  const asignarPermisos = (email, permiso) => {
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

            userRef
              .update({
                permisos: permiso,
              })
              .then(() => {
                console.log("Permisos asignados correctamente.");
              })
              .catch((error) => {
                console.error("Error al asignar permisos:", error);
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
          {/* PERMISOS */}
          <div className="p-4">
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {personas.map((persona, index) => (
                <li key={index} className="p-4 bg-gray-50 rounded-lg border border-blue-500">
                  <p className="text-lg font-semibold text-gray-800">
                    {persona.nombre} {persona.apellido}
                  </p>
                  <p className="text-gray-600 ">{persona.email}</p>
                  {persona.permisos !== 10 ? <div className="mt-2">
                    {/* Boton Permiso 1 */}
                    <button
                      className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center ${
                        persona.permisos === 1
                      }`}
                      onClick={() =>
                        asignarPermisos(
                          persona.email,
                          persona.permisos === 1 ? 0 : 1
                        )
                      }
                    >
                      Permiso 1
                      {persona.permisos === 1 ? (
                        <FontAwesomeIcon icon={faToggleOn} className="ml-2" />
                      ) : (
                        <FontAwesomeIcon icon={faToggleOff} className="ml-2 " />
                      )}
                    </button>
                    {/* Boton Permiso 2 */}
                    <button
                      className={`bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center ${
                        persona.permisos === 2
                      }`}
                      onClick={() =>
                        asignarPermisos(
                          persona.email,
                          persona.permisos === 2 ? 0 : 2
                        )
                      }
                    >
                      Permiso 2
                      {persona.permisos === 2 ? (
                        <FontAwesomeIcon icon={faToggleOn} className="ml-2" />
                      ) : (
                        <FontAwesomeIcon icon={faToggleOff} className="ml-2" />
                      )}
                    </button>
                    {/* Boton Permiso 3 */}
                    <button
                      className={`bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded flex items-center ${
                        persona.permisos === 3
                      }`}
                      onClick={() =>
                        asignarPermisos(
                          persona.email,
                          persona.permisos === 3 ? 0 : 3
                        )
                      }
                    >
                      Permiso 3
                      {persona.permisos === 3 ? (
                        <FontAwesomeIcon icon={faToggleOn} className="ml-2" />
                      ) : (
                        <FontAwesomeIcon icon={faToggleOff} className="ml-2" />
                      )}
                    </button>
                  </div> : <p className="mt-10 p-3 w-min cut italic uppercase whitespace-nowrap bg-slate-200 ">Usuario SuperAdmin</p>}
                  {/* <p className="mt-10 p-3 w-min cut italic uppercase whitespace-nowrap bg-slate-200 ">Usuario SuperAdmin</p> */}
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
