import React, { useState, useEffect } from "react";
import Select from "react-select";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faToggleOn,
  faToggleOff,
  faBuilding,
  faUsers,
  faUserShield,
  faSearch,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { firebaseConfig } from "@/firebase/firebaseConfig";
import { Tooltip } from "react-tooltip";

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Componente Ediciondeempresa
const Ediciondeempresa = () => {
  const [empresas, setEmpresas] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [isClearable, setIsClearable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  useEffect(() => {
    // Observador para verificar la autenticación del usuario
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserEmail(user ? user.email : null);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = db.collection("usuarios").onSnapshot((snapshot) => {
      const empresasData = [];
      snapshot.forEach((doc) => {
        const empresa = doc.data().empresa;
        if (empresa && !empresasData.includes(empresa)) {
          empresasData.push(empresa);
        }
      });
      setEmpresas(empresasData.sort());
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (empresaSeleccionada && userEmail) {
      setIsLoading(true);
      const unsubscribe = db
        .collection("usuarios")
        .where("empresa", "==", empresaSeleccionada)
        .onSnapshot((snapshot) => {
          const personasData = [];
          snapshot.forEach((doc) => {
            const userData = doc.data();
            personasData.push(userData);
          });
          setPersonas(personasData);
          setIsLoading(false);
        });

      return () => unsubscribe();
    } else {
      setPersonas([]);
    }
  }, [empresaSeleccionada, userEmail]);

  const handleEmpresaSeleccionada = (empresa) => {
    empresa
      ? setEmpresaSeleccionada(empresa.value)
      : setEmpresaSeleccionada(null);
  };

  // Función para mostrar notificaciones
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Función para asignar permisos a un usuario
  const asignarPermisos = (email, permiso) => {
    // Verificar que el correo electrónico sea válido
    if (!email) {
      showNotification("Error: Correo electrónico no válido.", "error");
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
                showNotification(
                  "Permisos asignados correctamente.",
                  "success"
                );
              })
              .catch((error) => {
                showNotification(
                  `Error al asignar permisos: ${error.message}`,
                  "error"
                );
              });
          });
        } else {
          showNotification(
            "Error: No se encontró ningún usuario con ese correo electrónico.",
            "error"
          );
        }
      })
      .catch((error) => {
        showNotification(
          `Error al obtener el usuario: ${error.message}`,
          "error"
        );
      });
  };

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

  // Estilos personalizados para el Select
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      border: "1px solid #e2e8f0",
      boxShadow: "none",
      "&:hover": {
        border: "1px solid #cbd5e0",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#4299e1"
        : state.isFocused
        ? "#ebf8ff"
        : null,
      color: state.isSelected ? "white" : "#2d3748",
    }),
  };

  // Iconos de información para los permisos
  const permisosInfo = [
    {
      id: 1,
      color: "blue",
      title: "Acceso básico",
      desc: "Permite personalizar las pantallas",
    },
    {
      id: 2,
      color: "green",
      title: "Acceso intermedio",
      desc: "Permite personalizar pantallas y acceder a información adicional",
    },
    {
      id: 3,
      color: "red",
      title: "Acceso completo",
      desc: "Permite personalizar pantallas, ajustar configuraciones y acceder a toda la información",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Notificación */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            notification.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          <p>{notification.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PANEL IZQUIERDO */}
        <div className="lg:col-span-1">
          {/* LISTA DE EMPRESAS */}
          {userHasAccess && (
            <div className="bg-white shadow-lg rounded-lg mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg px-6 py-4 flex items-center">
                <FontAwesomeIcon icon={faBuilding} className="mr-3 text-xl" />
                <h1 className="text-xl font-bold">Lista de Empresas</h1>
              </div>
              <div className="p-6 relative">
                {isLoading ? (
                  <div className="flex justify-center items-center h-12">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <FontAwesomeIcon
                        icon={faSearch}
                        className="text-gray-400"
                      />
                    </div>
                    <Select
                      options={options}
                      value={options.find(
                        (option) => option.value === empresaSeleccionada
                      )}
                      onChange={handleEmpresaSeleccionada}
                      isSearchable={true}
                      isClearable={isClearable}
                      placeholder="Buscar empresa..."
                      classNamePrefix="select"
                      styles={customSelectStyles}
                      className="pl-8"
                    />
                  </div>
                )}
                <div className="mt-4 text-sm text-gray-600">
                  {empresas.length === 0 ? (
                    <p>No hay empresas disponibles</p>
                  ) : (
                    <p>{empresas.length} empresas encontradas</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PERMISOS INFORMACIÓN */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-4 flex items-center">
              <FontAwesomeIcon icon={faUserShield} className="mr-3 text-xl" />
              <h1 className="text-xl font-bold">Niveles de Permiso</h1>
            </div>
            <div className="p-6">
              {permisosInfo.map((permiso) => (
                <div
                  key={permiso.id}
                  className={`mb-4 p-4 rounded-lg border-l-4 border-${permiso.color}-500 bg-${permiso.color}-50 shadow-sm`}
                  data-tooltip-id={`tooltip-permiso-${permiso.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full bg-${permiso.color}-500 text-white flex items-center justify-center mr-3`}
                      >
                        {permiso.id}
                      </div>
                      <span className="font-medium">{permiso.title}</span>
                    </div>
                    <FontAwesomeIcon
                      icon={faInfoCircle}
                      className={`text-${permiso.color}-500 text-lg cursor-pointer`}
                      data-tooltip-id={`tooltip-permiso-${permiso.id}`}
                    />
                  </div>
                  <Tooltip id={`tooltip-permiso-${permiso.id}`} place="right">
                    <div className="p-2">
                      <p className="font-bold mb-1">{permiso.title}</p>
                      <p>{permiso.desc}</p>
                    </div>
                  </Tooltip>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PANEL DERECHO - USUARIOS */}
        <div className="lg:col-span-2">
          <div
            className={`bg-white shadow-lg rounded-lg transition-opacity duration-300 ${
              empresaSeleccionada ? "opacity-100" : "opacity-50"
            }`}
          >
            <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-t-lg px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faUsers} className="mr-3 text-xl" />
                <h2 className="text-xl font-bold">
                  {empresaSeleccionada
                    ? `Usuarios de ${empresaSeleccionada}`
                    : "Usuarios"}
                </h2>
              </div>
              {empresaSeleccionada && (
                <span className="bg-blue-600 py-1 px-3 rounded-full text-sm">
                  {personas.length}{" "}
                  {personas.length === 1 ? "usuario" : "usuarios"}
                </span>
              )}
            </div>

            {!empresaSeleccionada ? (
              <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                <FontAwesomeIcon
                  icon={faBuilding}
                  className="text-5xl mb-4 text-gray-300"
                />
                <p className="text-lg">
                  Selecciona una empresa para ver sus usuarios
                </p>
              </div>
            ) : isLoading ? (
              <div className="p-12 text-center flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="overflow-hidden">
                {personas.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <p className="text-lg">
                      No hay usuarios asociados a esta empresa
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="py-3 px-6 text-left font-semibold text-gray-700">
                            Nombre
                          </th>
                          <th className="py-3 px-6 text-left font-semibold text-gray-700">
                            Email
                          </th>
                          <th className="py-3 px-6 text-center font-semibold text-gray-700">
                            Nivel de Acceso
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {personas.map((persona, index) => (
                          <tr
                            key={index}
                            className={`hover:bg-gray-50 ${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }`}
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                  {persona.nombre?.charAt(0) || "U"}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">
                                    {persona.nombre || "Sin nombre"}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {persona.apellido || ""}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-gray-600">
                              {persona.email}
                            </td>
                            <td className="py-4 px-6">
                              {persona.permisos === 10 ? (
                                <div className="flex justify-center">
                                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">
                                    SuperAdmin
                                  </span>
                                </div>
                              ) : (
                                <div className="flex justify-center gap-2">
                                  {/* Botones de permisos */}
                                  {[1, 2, 3].map((nivel) => (
                                    <button
                                      key={nivel}
                                      className={`
                                        flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md
                                        text-sm font-medium transition-all duration-200
                                        ${
                                          persona.permisos === nivel
                                            ? nivel === 1
                                              ? "bg-blue-500 text-white shadow-md hover:bg-blue-600"
                                              : nivel === 2
                                              ? "bg-green-500 text-white shadow-md hover:bg-green-600"
                                              : "bg-red-500 text-white shadow-md hover:bg-red-600"
                                            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                        }
                                      `}
                                      onClick={() =>
                                        asignarPermisos(
                                          persona.email,
                                          persona.permisos === nivel ? 0 : nivel
                                        )
                                      }
                                    >
                                      <span>{nivel}</span>
                                      <FontAwesomeIcon
                                        icon={
                                          persona.permisos === nivel
                                            ? faToggleOn
                                            : faToggleOff
                                        }
                                        className={`text-lg ${
                                          persona.permisos === nivel
                                            ? "text-white"
                                            : "text-gray-400"
                                        }`}
                                      />
                                    </button>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ediciondeempresa;
