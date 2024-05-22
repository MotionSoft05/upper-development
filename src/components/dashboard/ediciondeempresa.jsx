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
      {/* {userHasAccess && empresaSeleccionada && ( */}
   

      {/* TABLA USUARIOS Y PERMISOS */}
      <div className="col-span-full xl:col-span-8 bg-white  shadow-lg rounded-sm border border-slate-200 ">
        <header className="px-5 py-4 border-b border-slate-100 ">
          <h2 className="font-semibold text-slate-800 ">
            Personas asociadas a {empresaSeleccionada}
          </h2>
        </header>
        {/* Table */}
        <div className="overflow-x-auto p-2">
          <table className="table-auto w-full ">
            {/* Table header */}
            <thead className="text-xs uppercase text-slate-800  bg-slate-200 border-b-2 border-slate-300 rounded-sm">
              <tr>
                <th className="p-2">
                  <div className="font-semibold text-left">Nombre</div>
                </th>
                <th className="p-2">
                  <div className="font-semibold text-center">Email</div>
                </th>
                <th className="p-2">
                  <div className="font-semibold text-center">Permisos</div>
                </th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm font-medium divide-y divide-slate-300">
              {/* Usuarios */}
              {personas.map((persona, index) => (
                <tr key={index} className="bg-slate-100">
                  <td className="p-2">
                    <div className="flex items-center">
                      <div className="text-slate-800">{persona.nombre}</div>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="text-center">{persona.email}</div>
                  </td>
                  {/* Permisos */}
                  <td className="p-2 ">
                    {persona.permisos !== 10 ? (
                    <div className="mt-2 flex justify-center">
                      {/* Boton Permiso 1 */}
                      <button
                        className={` hover:bg-blue-600 h-min p-1 text-white font-bold  rounded flex items-center ${
                          persona.permisos === 1? 'bg-blue-500' : 'bg-blue-200'
                        }`}
                        onClick={() =>
                          asignarPermisos(
                            persona.email,
                            persona.permisos === 1 ? 0 : 1
                          )
                        }
                      >
                        1
                        {persona.permisos === 1 ? (
                          <FontAwesomeIcon icon={faToggleOn} className="ml-2" />
                        ) : (
                          <FontAwesomeIcon
                            icon={faToggleOff}
                            className="ml-2 "
                          />
                        )}
                      </button>
                      {/* Boton Permiso 2 */}
                      <button
                        className={` hover:bg-green-600 text-white font-bold h-min p-1 ml-2 rounded flex items-center ${
                          persona.permisos === 2 ? 'bg-green-500' : 'bg-green-200'
                        }`}
                        onClick={() =>
                          asignarPermisos(
                            persona.email,
                            persona.permisos === 2 ? 0 : 2
                          )
                        }
                      >
                        2
                        {persona.permisos === 2 ? (
                          <FontAwesomeIcon icon={faToggleOn} className="ml-2" />
                        ) : (
                          <FontAwesomeIcon
                            icon={faToggleOff}
                            className="ml-2"
                          />
                        )}
                      </button>
                      {/* Boton Permiso 3 */}
                      <button
                        className={`hover:bg-red-600 text-white font-bold h-min p-1 ml-2 rounded flex items-center ${
                          persona.permisos === 3 ? 'bg-red-500' : 'bg-red-200'
                        }`}
                        onClick={() =>
                          asignarPermisos(
                            persona.email,
                            persona.permisos === 3 ? 0 : 3
                          )
                        }
                      >
                        3
                        {persona.permisos === 3 ? (
                          <FontAwesomeIcon icon={faToggleOn} className="ml-2" />
                        ) : (
                          <FontAwesomeIcon
                            icon={faToggleOff}
                            className="ml-2"
                          />
                        )}
                      </button>
                    </div>
                  ) : (
                    <p className="p-1 w-min m-auto italic uppercase whitespace-nowrap bg-slate-200 ">
                      Usuario SuperAdmin
                    </p>
                  )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* TABLA USUARIOS */}
    </div>
  );
};

export default Ediciondeempresa;
