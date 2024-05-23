import React, { useState, useEffect } from "react";
import Select from "react-select";
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
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [isClearable, setIsClearable] = useState(true); //React Select

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

  //? Se ejecuta para seleccionar una empresa y al apretas la cruz para eliminar la seleccion
  const handleEmpresaSeleccionada = (empresa) => {
    console.log("EMPRESA>>> ", empresa);
    empresa
      ? setEmpresaSeleccionada(empresa.value)
      : setEmpresaSeleccionada(null);
  };

  // Función para asignar permisos a un usuario
  const asignarPermisos = (email, permiso) => {
    // Verificar que el correo electrónico sea válido
    if (!email) {
      console.error("Error: Correo electrónico no válido.");
      return;
    }

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

  console.log(
    "🚀 ~ Ediciondeempresa ~ empresaSeleccionada:",
    empresaSeleccionada
  );

  const options = empresas.map((empresa) => ({
    value: empresa,
    label: empresa,
  }));

  // Verificar si el usuario actual tiene acceso
  const userHasAccess =
    userEmail &&
    (userEmail === "uppermex10@gmail.com" ||
      userEmail === "ulises.jacobo@hotmail.com" ||
      userEmail === "contacto@upperds.mx");

  //* ---------------------- RETURN --------------------------
  return (
    <div className="container mx-auto px-4 py-2">
      {/* LISTA DE EMPRESAS Y PERMISOS */}
      <div className=" ">
        {/* LISTA DE EMPRESAS */}
        {userHasAccess && (
          <div className="bg-white shadow-lg rounded-lg mb-6 h-min">
            <h1 className="text-3xl font-bold text-gray-800 p-4">
              Lista de Empresas
            </h1>
            <div className="p-4">
              <Select
                options={options}
                value={empresaSeleccionada?.value}
                onChange={handleEmpresaSeleccionada}
                isSearchable={true}
                isClearable={isClearable}
                placeholder="Buscar empresa..."
                classNamePrefix="select"
                className="text-sm font-semibold text-blue-900 max-w-md"
              />
            </div>
          </div>
        )}
        {/* PERMISOS */}
        <div className=" font-normal mb-6 shadow-lg rounded-lg pb-3">
          <h1 className="text-3xl font-extralight italic text-gray-800 px-4 py-2 my-3 border-b-2 border-gray-600">
            Permisos de Usuarios
          </h1>
          {/* Permiso 1 */}
          <div className="bg- m-2 text-sm border-l-4 pl-1 border-blue-500 flex">
            <p className="font-medium">Permiso 1: </p>
            <p className="pl-2 bg-slate-100 mx-1 px-1 rounded-md">
              PERSONALICE SUS PANTALLAS
            </p>
          </div>
          {/* Permiso 2 */}
          <div className="bg- m-2 text-sm border-l-4 pl-1 border-green-500 flex">
            <p className="font-medium">Permiso 2: </p>
            <p className="pl-2 bg-slate-100 mx-1 px-1 rounded-md">
              PERSONALICE SUS PANTALLAS
            </p>
            {" - "}
            <p className="pl-2 bg-slate-100 mx-1 px-1 rounded-md">
              MÁS INFORMACIÓN
            </p>
          </div>
          {/* Permiso 3 */}
          <div className="bg- m-2 text-sm border-l-4 pl-1 border-red-500 flex">
            <p className="font-medium">Permiso 3: </p>
            <p className="pl-2 bg-slate-100 mx-1 px-1 rounded-md">
              PERSONALICE SUS PANTALLAS
            </p>
            {" - "}
            <p className="pl-2 bg-slate-100 mx-1 px-1 rounded-md">
              AJUSTES PANTALLAS
            </p>
            {" - "}
            <p className="pl-2 bg-slate-100 mx-1 px-1 rounded-md">
              MÁS INFORMACIÓN
            </p>
          </div>
        </div>
      </div>

      {/* TABLA USUARIOS Y PERMISOS */}
      <div
        className={`col-span-full xl:col-span-8 ${
          empresaSeleccionada ? "" : "opacity-40"
        } bg-white shadow-lg border border-slate-200 rounded-lg`}
      >
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
                            persona.permisos === 1
                              ? "bg-blue-500"
                              : "bg-blue-200"
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
                            <FontAwesomeIcon
                              icon={faToggleOn}
                              className="ml-2"
                            />
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
                            persona.permisos === 2
                              ? "bg-green-500"
                              : "bg-green-200"
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
                            <FontAwesomeIcon
                              icon={faToggleOn}
                              className="ml-2"
                            />
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
                            persona.permisos === 3 ? "bg-red-500" : "bg-red-200"
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
                            <FontAwesomeIcon
                              icon={faToggleOn}
                              className="ml-2"
                            />
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
    </div>
  );
};

export default Ediciondeempresa;
