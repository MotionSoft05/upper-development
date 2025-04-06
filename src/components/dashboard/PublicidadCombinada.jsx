import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/storage";
import "firebase/compat/firestore";
import { firebaseConfig } from "@/firebase/firebaseConfig";
import PublicidadList from "./PublicidadList";
import PlaylistManager from "./PlaylistManager.jsx";
import PublicidadForm from "./PublicidadForm";

// Inicializar Firebase si no está inicializado
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const storage = firebase.storage();
const db = firebase.firestore();

const PublicidadCombinada = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("listado");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [publicidades, setPublicidades] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [empresaUsuario, setEmpresaUsuario] = useState(null);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [pantallas, setPantallas] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [createPlaylistMode, setCreatePlaylistMode] = useState(false);
  const [editingPlaylistId, setEditingPlaylistId] = useState(null);

  // Cargar datos de usuario al iniciar
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        const usuarioDoc = await db.collection("usuarios").doc(user.uid).get();
        const usuarioData = usuarioDoc.data();
        const empresaUsuario = usuarioData.empresa;
        setEmpresaUsuario(empresaUsuario);
        await obtenerEmpresas();
        await obtenerPublicidades(empresaUsuario, "todos");
        await obtenerPantallas(empresaUsuario);
        await obtenerPlaylists(empresaUsuario);
      } else {
        console.warn(t("advertisement.salon.userNull"));
      }
    });

    return () => unsubscribe();
  }, []);

  const obtenerEmpresas = async () => {
    try {
      const empresasSnapshot = await db.collection("usuarios").get();
      const empresasData = empresasSnapshot.docs.map(
        (doc) => doc.data().empresa
      );
      const empresasUnicas = Array.from(new Set(empresasData)); // Eliminar repeticiones
      setEmpresas(empresasUnicas);
    } catch (error) {
      console.error("Error al obtener empresas:", error);
    }
  };

  const handleEmpresaChange = async (event) => {
    const empresaSeleccionada = event.target.value;
    setEmpresaSeleccionada(empresaSeleccionada);
    await obtenerPublicidades(empresaSeleccionada, "todos");
    await obtenerPantallas(empresaSeleccionada);
    await obtenerPlaylists(empresaSeleccionada);
  };

  const obtenerPantallas = async (empresa) => {
    try {
      if (!empresa) {
        setPantallas([]);
        return;
      }

      // Aquí asumimos que existe una colección "Pantallas" en Firestore
      const pantallasSnapshot = await db
        .collection("Pantallas")
        .where("empresa", "==", empresa)
        .get();

      // Si no hay pantallas en la base de datos, podrías crear algunas de demo
      if (pantallasSnapshot.empty) {
        console.log("No hay pantallas registradas para esta empresa");
        const pantallasDemoSalon = [
          {
            id: "salon1",
            nombre: "Salón Principal",
            tipo: "salon",
            ubicacion: "Lobby",
            activa: true,
          },
          {
            id: "salon2",
            nombre: "Salón Eventos",
            tipo: "salon",
            ubicacion: "Piso 2",
            activa: true,
          },
        ];

        const pantallasDemoDirectorio = [
          {
            id: "dir1",
            nombre: "Directorio Recepción",
            tipo: "directorio",
            orientacion: "horizontal",
            ubicacion: "Entrada",
            activa: true,
          },
          {
            id: "dir2",
            nombre: "Directorio Ascensores",
            tipo: "directorio",
            orientacion: "vertical",
            ubicacion: "Piso 1",
            activa: true,
          },
        ];

        setPantallas([...pantallasDemoSalon, ...pantallasDemoDirectorio]);
        return;
      }

      const pantallasData = pantallasSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPantallas(pantallasData);
    } catch (error) {
      console.error("Error al obtener pantallas:", error);
      setPantallas([]);
    }
  };

  const obtenerPublicidades = async (empresa, tipo) => {
    try {
      setIsLoading(true);

      if (!empresa) {
        setPublicidades([]);
        return;
      }

      let query = db.collection("Publicidad").where("empresa", "==", empresa);

      if (tipo !== "todos") {
        query = query.where("tipo", "==", tipo);
      }

      const publicidadesSnapshot = await query.get();

      const publicidadesData = await Promise.all(
        publicidadesSnapshot.docs.map(async (doc) => {
          const data = doc.data();
          let imageUrl, videoUrl;

          if (data.imageUrl) {
            try {
              imageUrl = await storage
                .refFromURL(data.imageUrl)
                .getDownloadURL();
            } catch (error) {
              console.error("Error al obtener URL de imagen:", error);
            }
          }

          if (data.videoUrl) {
            try {
              videoUrl = await storage
                .refFromURL(data.videoUrl)
                .getDownloadURL();
            } catch (error) {
              console.error("Error al obtener URL de video:", error);
            }
          }

          return {
            id: doc.id,
            ...data,
            imageUrl,
            videoUrl,
            mediaUrl: imageUrl || videoUrl,
            mediaType: imageUrl ? "image" : "video",
            destino: data.destino || "todas",
            pantallasAsignadas: data.pantallasAsignadas || [],
            esParteDePlaylist: data.esParteDePlaylist || false,
          };
        })
      );

      publicidadesData.sort((a, b) => {
        const timeA = a.fechaDeSubida ? a.fechaDeSubida.toMillis() : 0;
        const timeB = b.fechaDeSubida ? b.fechaDeSubida.toMillis() : 0;
        return timeB - timeA; // Orden descendente
      });

      setPublicidades(publicidadesData);
    } catch (error) {
      console.error("Error al obtener publicidades:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const obtenerPlaylists = async (empresa) => {
    try {
      if (!empresa) {
        setPlaylists([]);
        return;
      }

      // Buscar playlists en Firestore
      const playlistsSnapshot = await db
        .collection("Playlists")
        .where("empresa", "==", empresa)
        .get();

      if (playlistsSnapshot.empty) {
        console.log("No hay playlists registradas para esta empresa");
        setPlaylists([]);
        return;
      }

      const playlistsData = await Promise.all(
        playlistsSnapshot.docs.map(async (doc) => {
          const data = doc.data();

          // Obtenemos información sobre los elementos de la playlist
          const elementosConInfo = await Promise.all(
            (data.elementos || []).map(async (elemento) => {
              try {
                if (elemento.publicidadId) {
                  const publicidadDoc = await db
                    .collection("Publicidad")
                    .doc(elemento.publicidadId)
                    .get();
                  if (publicidadDoc.exists) {
                    const publicidadData = publicidadDoc.data();
                    return {
                      ...elemento,
                      publicidad: {
                        id: publicidadDoc.id,
                        nombre: publicidadData.nombre,
                        mediaUrl:
                          publicidadData.imageUrl || publicidadData.videoUrl,
                        mediaType: publicidadData.imageUrl ? "image" : "video",
                      },
                    };
                  }
                }
                return elemento;
              } catch (error) {
                console.error(
                  "Error al obtener publicidad de la playlist:",
                  error
                );
                return elemento;
              }
            })
          );

          return {
            id: doc.id,
            ...data,
            elementos: elementosConInfo,
          };
        })
      );

      // Ordenar por fecha de creación
      playlistsData.sort((a, b) => {
        const timeA = a.fechaCreacion ? a.fechaCreacion.toMillis() : 0;
        const timeB = b.fechaCreacion ? b.fechaCreacion.toMillis() : 0;
        return timeB - timeA; // Orden descendente
      });

      setPlaylists(playlistsData);
    } catch (error) {
      console.error("Error al obtener playlists:", error);
      setPlaylists([]);
    }
  };

  const handleEditarPlaylist = (playlist) => {
    setEditingPlaylistId(playlist.id);
    setCreatePlaylistMode(true);
    setActiveTab("crear");
  };

  const handleEliminarPublicidad = async (publicidadId) => {
    try {
      const confirmacion = window.confirm(
        t("advertisement.salon.confirmDeleteAdvertisement") ||
          "¿Está seguro que desea eliminar esta publicidad?"
      );
      if (!confirmacion) return;

      setIsLoading(true);

      await db.collection("Publicidad").doc(publicidadId).delete();

      setSuccessMessage("Publicidad eliminada con éxito");
      setTimeout(() => setSuccessMessage(null), 3000);

      // Actualizar la lista
      const empresa = empresaSeleccionada || empresaUsuario;
      await obtenerPublicidades(empresa, "todos");
    } catch (error) {
      console.error("Error al eliminar publicidad:", error);
      setSuccessMessage("Error al eliminar la publicidad");
      setTimeout(() => setSuccessMessage(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminarPlaylist = async (playlistId) => {
    try {
      const confirmacion = window.confirm(
        "¿Está seguro que desea eliminar esta playlist?"
      );
      if (!confirmacion) return;

      setIsLoading(true);

      // Obtener la playlist para ver qué elementos contiene
      const playlistDoc = await db
        .collection("Playlists")
        .doc(playlistId)
        .get();
      if (playlistDoc.exists) {
        const playlistData = playlistDoc.data();
        const elementos = playlistData.elementos || [];

        // Opcionalmente, eliminar también las publicidades individuales
        const confirmEliminarPublicidades = window.confirm(
          "¿Desea eliminar también las publicidades individuales que forman parte de esta playlist?"
        );

        if (confirmEliminarPublicidades) {
          // Eliminar cada publicidad de la playlist
          for (const elemento of elementos) {
            if (elemento.publicidadId) {
              try {
                // Comprobar si la publicidad solo está en esta playlist
                const publicidadDoc = await db
                  .collection("Publicidad")
                  .doc(elemento.publicidadId)
                  .get();
                if (
                  publicidadDoc.exists &&
                  publicidadDoc.data().esParteDePlaylist
                ) {
                  await db
                    .collection("Publicidad")
                    .doc(elemento.publicidadId)
                    .delete();
                }
              } catch (error) {
                console.error(
                  "Error al eliminar publicidad de playlist:",
                  error
                );
              }
            }
          }
        }
      }

      // Eliminar la playlist
      await db.collection("Playlists").doc(playlistId).delete();

      setSuccessMessage("Playlist eliminada con éxito");
      setTimeout(() => setSuccessMessage(null), 3000);

      // Actualizar listas
      const empresa = empresaSeleccionada || empresaUsuario;
      await obtenerPlaylists(empresa);
      await obtenerPublicidades(empresa, "todos");
    } catch (error) {
      console.error("Error al eliminar playlist:", error);
      setSuccessMessage("Error al eliminar la playlist");
      setTimeout(() => setSuccessMessage(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCreatePlaylistMode(false);
    setEditingPlaylistId(null);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Cabecera con título y descripción */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {t("advertisement.title") || "Publicidad"}
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-base text-gray-500 sm:text-lg">
            {t("advertisement.description1") ||
              "Gestione el contenido que se mostrará cuando no haya eventos programados"}
          </p>
        </div>

        {/* Contenido principal */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Pestañas de navegación */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("listado")}
              className={`flex-1 py-4 px-4 text-center font-medium text-sm sm:text-base relative ${
                activeTab === "listado"
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <svg
                className="inline-block w-5 h-5 mr-1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Publicidades
              {activeTab === "listado" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("playlists")}
              className={`flex-1 py-4 px-4 text-center font-medium text-sm sm:text-base relative ${
                activeTab === "playlists"
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <svg
                className="inline-block w-5 h-5 mr-1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
              Playlists
              {activeTab === "playlists" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
              )}
            </button>
            <button
              onClick={() => {
                resetForm();
                setActiveTab("crear");
              }}
              className={`flex-1 py-4 px-4 text-center font-medium text-sm sm:text-base relative ${
                activeTab === "crear"
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <svg
                className="inline-block w-5 h-5 mr-1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Crear Nuevo
              {activeTab === "crear" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
              )}
            </button>
          </div>

          {/* Selector de empresa para admin */}
          {user &&
            (user.email === "uppermex10@gmail.com" ||
              user.email === "ulises.jacobo@hotmail.com" ||
              user.email === "contacto@upperds.mx") && (
              <div className="bg-white p-4 border-b">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                  <label
                    htmlFor="empresa"
                    className="text-gray-700 font-medium mb-2 sm:mb-0"
                  >
                    {t("advertisement.salon.selectCompany") ||
                      "Seleccionar empresa"}
                  </label>
                  <div className="w-full sm:w-2/3">
                    <select
                      id="empresa"
                      name="empresa"
                      className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      onChange={handleEmpresaChange}
                    >
                      <option value="" disabled selected>
                        {t("advertisement.salon.select") || "Seleccionar..."}
                      </option>
                      {empresas.map((empresa, index) => (
                        <option key={index} value={empresa}>
                          {empresa}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

          {/* Mensaje de éxito o error */}
          {successMessage && (
            <div
              className={`m-4 p-4 rounded-md border-l-4 ${
                successMessage.includes("Error")
                  ? "bg-red-50 border-red-500"
                  : "bg-green-50 border-green-500"
              }`}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className={`h-5 w-5 ${
                      successMessage.includes("Error")
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p
                    className={`text-sm font-medium ${
                      successMessage.includes("Error")
                        ? "text-red-800"
                        : "text-green-800"
                    }`}
                  >
                    {successMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Estado global de carga */}
          {isLoading && (
            <div className="m-4 bg-blue-50 p-4 rounded-md flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-3 text-blue-500"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-blue-700">
                {t("advertisement.salon.loading") || "Cargando..."}
              </span>
            </div>
          )}

          {/* Contenido basado en la pestaña activa */}
          {activeTab === "listado" && (
            <PublicidadList
              publicidades={publicidades}
              isLoading={isLoading}
              onDelete={handleEliminarPublicidad}
              pantallas={pantallas}
              t={t}
            />
          )}

          {activeTab === "playlists" && (
            <PlaylistManager
              playlists={playlists}
              pantallas={pantallas}
              onEdit={handleEditarPlaylist}
              onDelete={handleEliminarPlaylist}
              setActiveTab={setActiveTab}
              setCreatePlaylistMode={setCreatePlaylistMode}
              resetForm={resetForm}
              t={t}
            />
          )}

          {activeTab === "crear" && (
            <PublicidadForm
              createPlaylistMode={createPlaylistMode}
              editingPlaylistId={editingPlaylistId}
              publicidades={publicidades}
              playlists={playlists}
              pantallas={pantallas}
              empresaSeleccionada={empresaSeleccionada}
              empresaUsuario={empresaUsuario}
              setActiveTab={setActiveTab}
              setSuccessMessage={setSuccessMessage}
              obtenerPublicidades={obtenerPublicidades}
              obtenerPlaylists={obtenerPlaylists}
              resetForm={resetForm}
              t={t}
              db={db}
              storage={storage}
            />
          )}
        </div>

        {/* Tarjeta informativa */}
        <div className="mt-8 max-w-4xl mx-auto bg-blue-50 border border-blue-100 rounded-lg p-4 shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                {t("advertisement.infoTitle") || "Información importante"}
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  {t("advertisement.infoText") ||
                    "Las imágenes o videos que agregue se mostrarán cuando no haya eventos programados en las pantallas. Puede agregar hasta 10 elementos por tipo de pantalla."}
                </p>
                <p className="mt-2">
                  Utilice playlists para definir secuencias de contenido que se
                  mostrarán en orden. Es ideal para campañas de marketing o
                  información que requiere múltiples pantallas secuenciales.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicidadCombinada;
