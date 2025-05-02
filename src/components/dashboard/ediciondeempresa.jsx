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
  faCalendarPlus,
  faClipboardQuestion,
  faSolarPanel,
  faDisplay,
  faMoneyBill,
  faBullhorn,
  faDesktop,
  faCashRegister,
  faTableColumns,
  faChevronDown,
  faChevronUp,
  faHeadset,
  faImages,
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
  const [showPermisosDetalle, setShowPermisosDetalle] = useState({});
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

            // Inicializar los permisos por sección si no existen
            if (!userData.permisosSecciones) {
              // Si el usuario tiene permisos del sistema antiguo, convertirlos
              const permisoAntiguo = userData.permisos || 0;

              // Valores por defecto basados en el sistema antiguo
              userData.permisosSecciones = {
                tablero: permisoAntiguo > 0,
                altaEventos: permisoAntiguo > 0,
                consultaEventos: permisoAntiguo > 0,
                informacionTarifas: permisoAntiguo > 0,
                pantallasSalon: permisoAntiguo === 3,
                pantallasDirectorio: permisoAntiguo === 3,
                pantallasPromociones: permisoAntiguo === 3,
                pantallasTarifario: permisoAntiguo === 3,
                monitoreo: permisoAntiguo === 3,
                publicidad: permisoAntiguo === 3,
                datosUsuario: permisoAntiguo >= 2,
                guiaUsuario: permisoAntiguo >= 2,
                contactoSoporte: permisoAntiguo >= 2,
              };

              // Guardar inmediatamente los nuevos permisos si se crearon
              if (permisoAntiguo > 0 && permisoAntiguo !== 10) {
                db.collection("usuarios").doc(doc.id).update({
                  permisosSecciones: userData.permisosSecciones,
                });
              }
            }

            personasData.push({
              ...userData,
              id: doc.id,
            });
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

  // Función para activar/desactivar permiso a una sección específica
  const togglePermisoSeccion = (userId, seccion) => {
    const usuario = personas.find((p) => p.id === userId);
    if (!usuario) return;

    // Crear un nuevo objeto de permisos por secciones si no existe
    const permisosSecciones = usuario.permisosSecciones || {};

    // Invertir el estado del permiso para esta sección
    const nuevosPermisos = {
      ...permisosSecciones,
      [seccion]: !permisosSecciones[seccion],
    };

    db.collection("usuarios")
      .doc(userId)
      .update({
        permisosSecciones: nuevosPermisos,
      })
      .then(() => {
        showNotification("Permiso actualizado correctamente.", "success");
      })
      .catch((error) => {
        showNotification(
          `Error al actualizar el permiso: ${error.message}`,
          "error"
        );
      });
  };

  // Función para activar/desactivar todos los permisos
  const toggleTodosPermisos = (userId, estado) => {
    const usuario = personas.find((p) => p.id === userId);
    if (!usuario) return;

    // Crear un objeto con todos los permisos activados o desactivados
    const nuevosPermisos = {};

    secciones.forEach((seccion) => {
      nuevosPermisos[seccion.id] = estado;
    });

    db.collection("usuarios")
      .doc(userId)
      .update({
        permisosSecciones: nuevosPermisos,
      })
      .then(() => {
        showNotification(
          `Se han ${estado ? "activado" : "desactivado"} todos los permisos.`,
          "success"
        );
      })
      .catch((error) => {
        showNotification(
          `Error al actualizar los permisos: ${error.message}`,
          "error"
        );
      });
  };

  const toggleDetallePermisos = (userId) => {
    setShowPermisosDetalle({
      ...showPermisosDetalle,
      [userId]: !showPermisosDetalle[userId],
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

  // Secciones para asignar permisos, agrupadas por categorías
  const seccionesCategorias = [
    {
      nombre: "Gestión de Pantallas",
      secciones: [
        { id: "tablero", nombre: "Tablero", icon: faTableColumns },
        { id: "altaEventos", nombre: "Alta de Eventos", icon: faCalendarPlus },
        {
          id: "consultaEventos",
          nombre: "Consulta de Eventos",
          icon: faClipboardQuestion,
        },
        {
          id: "informacionTarifas",
          nombre: "Información de Tarifas",
          icon: faCashRegister,
        },
      ],
    },
    {
      nombre: "Configuración de Pantallas",
      secciones: [
        { id: "pantallasSalon", nombre: "Pantallas Salón", icon: faSolarPanel },
        {
          id: "pantallasDirectorio",
          nombre: "Pantallas Directorio",
          icon: faDisplay,
        },
        {
          id: "pantallasTarifario",
          nombre: "Pantallas Tarifario",
          icon: faMoneyBill,
        },
        {
          id: "pantallasPromociones",
          nombre: "Pantallas Promociones",
          icon: faImages,
        },
        { id: "monitoreo", nombre: "Monitoreo de Pantallas", icon: faDesktop },
        { id: "publicidad", nombre: "Publicidad", icon: faBullhorn },
      ],
    },
    {
      nombre: "Información",
      secciones: [
        { id: "datosUsuario", nombre: "Mis Datos", icon: faUserShield },
        { id: "guiaUsuario", nombre: "Guía de Usuario", icon: faInfoCircle },
        { id: "contactoSoporte", nombre: "Contacto Soporte", icon: faHeadset },
      ],
    },
  ];

  // Lista plana de todas las secciones para uso interno
  const secciones = seccionesCategorias.flatMap(
    (categoria) => categoria.secciones
  );

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

          {/* INFORMACIÓN SOBRE PERMISOS */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-4 flex items-center">
              <FontAwesomeIcon icon={faUserShield} className="mr-3 text-xl" />
              <h1 className="text-xl font-bold">Gestión de Permisos</h1>
            </div>
            <div className="p-6">
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-700 mb-2">
                  ¿Cómo funciona?
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Utilice los interruptores para activar o desactivar el acceso
                  a cada sección específica del panel.
                </p>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  <li>Cada sección puede habilitarse individualmente</li>
                  <li>
                    Los usuarios con nivel &quot;SuperAdmin tienen&quot; acceso
                    a todas las secciones
                  </li>
                  <li>Los cambios se aplican inmediatamente</li>
                </ul>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-yellow-700 mb-2">
                  Nivel SuperAdmin
                </h3>
                <p className="text-sm text-gray-600">
                  Los usuarios con nivel &quot;SuperAdmin&quot; pueden acceder a
                  todas las secciones y no se pueden modificar sus permisos
                  individuales.
                </p>
              </div>
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
                            Rol
                          </th>
                          <th className="py-3 px-6 text-center font-semibold text-gray-700">
                            Permisos
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {personas.map((persona, index) => (
                          <React.Fragment key={index}>
                            <tr
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
                              <td className="py-4 px-6 text-center">
                                {persona.permisos === 10 ? (
                                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">
                                    SuperAdmin
                                  </span>
                                ) : (
                                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                                    Usuario
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-6 text-center">
                                {persona.permisos !== 10 ? (
                                  <button
                                    onClick={() =>
                                      toggleDetallePermisos(persona.id)
                                    }
                                    className="flex items-center justify-center mx-auto gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                                  >
                                    <span>
                                      {showPermisosDetalle[persona.id]
                                        ? "Ocultar permisos"
                                        : "Configurar permisos"}
                                    </span>
                                    <FontAwesomeIcon
                                      icon={
                                        showPermisosDetalle[persona.id]
                                          ? faChevronUp
                                          : faChevronDown
                                      }
                                      className="w-3 h-3"
                                    />
                                  </button>
                                ) : (
                                  <span className="text-gray-600 text-sm">
                                    Acceso completo
                                  </span>
                                )}
                              </td>
                            </tr>

                            {/* Fila expandible para permisos por sección */}
                            {showPermisosDetalle[persona.id] &&
                              persona.permisos !== 10 && (
                                <tr>
                                  <td colSpan="4" className="p-0">
                                    <div className="bg-gray-50 p-4 border-t border-gray-200 animate-fadeIn">
                                      <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-sm font-semibold text-gray-700">
                                          Permisos para{" "}
                                          {persona.nombre || persona.email}
                                        </h3>
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() =>
                                              toggleTodosPermisos(
                                                persona.id,
                                                true
                                              )
                                            }
                                            className="px-3 py-1 text-xs bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                                          >
                                            Activar todos
                                          </button>
                                          <button
                                            onClick={() =>
                                              toggleTodosPermisos(
                                                persona.id,
                                                false
                                              )
                                            }
                                            className="px-3 py-1 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                                          >
                                            Desactivar todos
                                          </button>
                                        </div>
                                      </div>

                                      {seccionesCategorias.map(
                                        (categoria, catIndex) => (
                                          <div key={catIndex} className="mb-4">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2 bg-gray-200 py-1 px-2 rounded">
                                              {categoria.nombre}
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                              {categoria.secciones.map(
                                                (seccion) => (
                                                  <div
                                                    key={seccion.id}
                                                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                                      persona
                                                        .permisosSecciones?.[
                                                        seccion.id
                                                      ]
                                                        ? "bg-blue-50 border-blue-200"
                                                        : "bg-white border-gray-200"
                                                    }`}
                                                  >
                                                    <div className="flex items-center">
                                                      <div
                                                        className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full mr-2 ${
                                                          persona
                                                            .permisosSecciones?.[
                                                            seccion.id
                                                          ]
                                                            ? "bg-blue-100 text-blue-600"
                                                            : "bg-gray-100 text-gray-400"
                                                        }`}
                                                      >
                                                        <FontAwesomeIcon
                                                          icon={seccion.icon}
                                                          className="text-sm"
                                                        />
                                                      </div>
                                                      <span className="text-sm">
                                                        {seccion.nombre}
                                                      </span>
                                                    </div>
                                                    <button
                                                      onClick={() =>
                                                        togglePermisoSeccion(
                                                          persona.id,
                                                          seccion.id
                                                        )
                                                      }
                                                      className="text-lg"
                                                    >
                                                      <FontAwesomeIcon
                                                        icon={
                                                          persona
                                                            .permisosSecciones?.[
                                                            seccion.id
                                                          ]
                                                            ? faToggleOn
                                                            : faToggleOff
                                                        }
                                                        className={`${
                                                          persona
                                                            .permisosSecciones?.[
                                                            seccion.id
                                                          ]
                                                            ? "text-blue-500"
                                                            : "text-gray-400"
                                                        }`}
                                                      />
                                                    </button>
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                          </React.Fragment>
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
