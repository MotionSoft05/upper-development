import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/storage";
import "firebase/compat/firestore";
import { useTranslation } from "react-i18next";
import { firebaseConfig } from "@/firebase/firebaseConfig";
import VideoUploader from "../VideoUploader";

import {
  ClockIcon,
  BookmarkIcon,
  TrashIcon,
  PencilSquareIcon,
  XMarkIcon,
  PhotoIcon,
  PlusCircleIcon,
  ArrowPathIcon,
  VideoCameraIcon,
} from "@heroicons/react/20/solid";

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const storage = firebase.storage();
const db = firebase.firestore();

function PublicidadSalon() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagenesSalon, setImagenesSalon] = useState([null]);
  const [previewImages, setPreviewImages] = useState([]);
  const [publicidadesIds, setPublicidadesIds] = useState([]);
  const [imagenesSalonOriginales, setImagenesSalonOriginales] = useState([
    null,
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [tiemposSalon, setTiemposSalon] = useState([
    { horas: 0, minutos: 0, segundos: 10 },
  ]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [originalTiemposSalon, setOriginalTiemposSalon] = useState({
    horas: 0,
    minutos: 0,
    segundos: 10,
  });
  const [originalImagen, setOriginalImagen] = useState(null);
  const [originalImageUrl, setOriginalImageUrl] = useState(null);
  const [currentAction, setCurrentAction] = useState(null);
  const [empresaUsuario, setEmpresaUsuario] = useState(null);
  const [empresas, setEmpresas] = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
  const [publicidadesSalon, setPublicidadesSalon] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploadingIndex, setCurrentUploadingIndex] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        const usuarioDoc = await db.collection("usuarios").doc(user.uid).get();
        const usuarioData = usuarioDoc.data();
        const empresaUsuario = usuarioData.empresa;
        await obtenerEmpresas();
        await obtenerPublicidades(empresaUsuario, "salon");
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
    await obtenerPublicidades(empresaSeleccionada, "salon");
  };

  const obtenerPublicidades = async (empresa, tipo) => {
    try {
      setIsLoading(true);

      if (empresa) {
        const publicidadesSnapshot = await db
          .collection("Publicidad")
          .where("empresa", "==", empresa)
          .where("tipo", "==", tipo)
          .get();

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
            };
          })
        );

        publicidadesData.sort((a, b) => {
          // Usar timestamp si está disponible, o usar 0 si no está disponible
          const timeA = a.fechaDeSubida ? a.fechaDeSubida.toMillis() : 0;
          const timeB = b.fechaDeSubida ? b.fechaDeSubida.toMillis() : 0;
          return timeA - timeB;
        });

        const cantidadPublicidades = publicidadesData.length;
        const cantidadNuevasPublicidades = 1;
        const nuevasImagenes = Array(cantidadNuevasPublicidades).fill(null);
        const nuevosTiempos = Array.from(
          { length: cantidadNuevasPublicidades },
          () => ({
            horas: 0,
            minutos: 0,
            segundos: 10,
          })
        );

        const nuevasVistasPrevias = Array(cantidadNuevasPublicidades).fill(
          null
        );

        setPublicidadesIds(publicidadesData.map((publicidad) => publicidad.id));
        setImagenesSalon([
          ...publicidadesData.map(() => null),
          ...nuevasImagenes,
        ]);
        setTiemposSalon([
          ...publicidadesData.map((publicidad) => ({
            horas: publicidad.horas || 0,
            minutos: publicidad.minutos || 0,
            segundos: publicidad.segundos || 10,
          })),
          ...nuevosTiempos,
        ]);

        const previews = publicidadesData.map((publicidad) => {
          // Determinamos si es video o imagen
          if (publicidad.videoUrl) {
            return {
              url: publicidad.videoUrl,
              type: "video",
            };
          } else if (publicidad.imageUrl) {
            return {
              url: publicidad.imageUrl,
              type: "image",
            };
          }
          return null;
        });

        setPreviewImages([...previews, ...nuevasVistasPrevias]);
        setImagenesSalonOriginales(publicidadesData.map(() => null));
      } else {
        console.warn(t("advertisement.salon.userNullUidProperty"));
      }
    } catch (error) {
      console.error(
        t("advertisement.salon.errorFetchingAdvertisements"),
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditarPublicidad = (index) => {
    setCurrentAction("Editar");
    setEditIndex(index);
    setOriginalTiemposSalon({ ...tiemposSalon[index] });
    setOriginalImagen(imagenesSalon[index]);
    setOriginalImageUrl(previewImages[index]);
  };

  const handleCancelarEdicion = () => {
    setEditIndex(null);
    setTiemposSalon((prevTiempos) => [
      ...prevTiempos.slice(0, editIndex),
      originalTiemposSalon,
      ...prevTiempos.slice(editIndex + 1),
    ]);
    setImagenesSalon((prevImages) => [
      ...prevImages.slice(0, editIndex),
      originalImagen,
      ...prevImages.slice(editIndex + 1),
    ]);
    setPreviewImages((prevPreviews) => [
      ...prevPreviews.slice(0, editIndex),
      originalImageUrl,
      ...prevPreviews.slice(editIndex + 1),
    ]);
  };

  const handleGuardarCambios = async (index) => {
    try {
      setIsLoading(true);
      setIsUploading(true);
      setCurrentAction("Guardar Cambios");
      setCurrentUploadingIndex(index);

      const nuevaImagen = imagenesSalon[index];
      const { horas, minutos, segundos } = tiemposSalon[index];

      const isEditingExistingPublicidad = index < publicidadesIds.length;
      const hasNewMedia = nuevaImagen && nuevaImagen.name !== undefined;

      if (!isEditingExistingPublicidad && !hasNewMedia) {
        console.warn(t("advertisement.salon.noNewMediaSelected"));
        return;
      }

      const hasValidData =
        (horas > 0 || minutos > 0 || segundos > 0) &&
        minutos >= 0 &&
        minutos <= 59 &&
        segundos >= 0 &&
        segundos <= 59;

      if (!hasValidData) {
        alert(t("advertisement.salon.completeAtLeastOneField"));
        return;
      }

      const publicidadId = publicidadesIds[index];
      const publicidadRef = db.collection("Publicidad").doc(publicidadId);
      let mediaUrl = previewImages[index]?.url;

      if (hasNewMedia) {
        const isImage = nuevaImagen.type.startsWith("image");
        const isVideo = nuevaImagen.type.startsWith("video");
        const mediaRef = storage
          .ref()
          .child(
            `publicidad/${
              isImage ? "imagenes" : "videos"
            }/${index}_${Date.now()}_${nuevaImagen.name}`
          );

        const uploadTask = mediaRef.put(nuevaImagen);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(Math.round(progress));
          },
          (error) => {
            console.error(t("advertisement.salon.errorLoadingMedia"), error);
            setSuccessMessage(
              t("advertisement.salon.errorUploading") ||
                "Error al subir el medio"
            );
            setTimeout(() => setSuccessMessage(null), 3000);
          },
          async () => {
            mediaUrl = await mediaRef.getDownloadURL();

            // Limpiar el campo opuesto si cambias de imagen a video o viceversa
            if (isVideo) {
              await publicidadRef.update({
                imageUrl: null, // Limpiar el campo de imagen
                videoUrl: mediaUrl,
                horas,
                minutos,
                segundos,
              });
            } else {
              await publicidadRef.update({
                imageUrl: mediaUrl,
                videoUrl: null, // Limpiar el campo de video
                horas,
                minutos,
                segundos,
              });
            }

            setEditIndex(null);
            setIsUploading(false);
            setUploadProgress(0);
            setCurrentUploadingIndex(null);

            // Actualizar vista previa
            setPreviewImages((prevPreviews) => {
              const newPreviews = [...prevPreviews];
              newPreviews[index] = {
                url: mediaUrl,
                type: isVideo ? "video" : "image",
              };
              return newPreviews;
            });

            setSuccessMessage(
              t("advertisement.salon.mediaUpdated") ||
                "Contenido actualizado con éxito"
            );
            setTimeout(() => setSuccessMessage(null), 3000);

            // Recargar las publicidades para asegurar que tenemos los datos más recientes
            const usuarioDoc = await db
              .collection("usuarios")
              .doc(user.uid)
              .get();
            const usuarioData = usuarioDoc.data();
            const empresaUsuario = usuarioData.empresa;
            const empresa = empresaSeleccionada
              ? empresaSeleccionada
              : empresaUsuario;
            await obtenerPublicidades(empresa, "salon");
          }
        );
      } else {
        await publicidadRef.update({
          horas,
          minutos,
          segundos,
        });

        setEditIndex(null);
        setIsUploading(false);
        setSuccessMessage(
          t("advertisement.salon.timeUpdated") || "Tiempo actualizado con éxito"
        );
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      console.error(t("advertisement.salon.errorSavingChanges"), error);
      setIsUploading(false);
    } finally {
      setIsLoading(false);
      setCurrentAction(null);
      setCurrentUploadingIndex(null);
    }
  };

  const handleInputChange = (event, index, type) => {
    const { name, value } = event.target;
    let newValue = parseInt(value) || 0;

    if (name === "horas" || name === "minutos" || name === "segundos") {
      // Verificar que el valor esté dentro del rango permitido
      const max = name === "horas" ? 23 : 59;
      if (name === "segundos") {
        newValue = Math.max(newValue, 10);
      }
      const validValue = Math.min(Math.max(newValue, 0), max);

      const newValues = [...type];
      newValues[index][name] = validValue;

      type === tiemposSalon
        ? setTiemposSalon(newValues)
        : setImagenesSalon(newValues);
    }
  };

  const handleImagenSelect = async (event, index) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    // Determinar si es un video
    const isVideo = file.type.startsWith("video/");

    if (isVideo) {
      // Si es video, no hacer nada aquí, dejar que VideoUploader se encargue
    } else {
      // Si es imagen, procesarla normalmente
      const reader = new FileReader();
      reader.onload = () => {
        setImagenesSalon((prevImages) => {
          const newImages = [...prevImages];
          newImages[index] = file;
          return newImages;
        });

        setPreviewImages((prevPreviews) => {
          const newPreviews = [...prevPreviews];
          newPreviews[index] = {
            url: reader.result,
            type: "image",
          };
          return newPreviews;
        });
      };

      reader.readAsDataURL(file);
    }
  };

  // Función para manejar la subida de video desde VideoUploader
  const handleVideoUploaded = (videoData, index) => {
    // Actualizar el estado con la información del video
    setImagenesSalon((prevImages) => {
      const newImages = [...prevImages];
      // Guardar un objeto con la información del video en lugar del archivo
      newImages[index] = {
        ...videoData,
        name: videoData.filename, // Para compatibilidad con el código existente
        type: "video/mp4", // Asumimos mp4 para compatibilidad
      };
      return newImages;
    });

    setPreviewImages((prevPreviews) => {
      const newPreviews = [...prevPreviews];
      newPreviews[index] = {
        url: videoData.url,
        type: "video",
        metadata: videoData.metadata,
      };
      return newPreviews;
    });

    // Mostrar mensaje de éxito
    setSuccessMessage(
      t("advertisement.salon.videoUploaded") || "Video cargado correctamente"
    );
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  // Función para manejar errores de carga de video
  const handleVideoError = (error) => {
    console.error("Error al cargar el video:", error);
    setSuccessMessage(
      t("advertisement.salon.videoError") || "Error al cargar el video"
    );
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  const handleAgregarPublicidad = async () => {
    try {
      setIsLoading(true);
      setIsUploading(true);
      setCurrentAction("Guardar Publicidad");
      const storageRef = storage.ref();
      const userUid = user.uid;
      let hasValidData = false;
      let newIds = [];

      // Obtener los datos del usuario
      const usuarioDoc = await db.collection("usuarios").doc(userUid).get();
      const usuarioData = usuarioDoc.data();
      const empresaUsuario = usuarioData.empresa;

      // Obtener la empresa seleccionada
      const empresa = empresaSeleccionada
        ? empresaSeleccionada
        : empresaUsuario;

      const lastIndex = imagenesSalon.length - 1;
      setCurrentUploadingIndex(lastIndex);

      const media = imagenesSalon[lastIndex];
      const preview = previewImages[lastIndex];

      if (media) {
        let mediaUrl;
        const { horas, minutos, segundos } = tiemposSalon[lastIndex];

        // Determinar si es un video o una imagen
        const isVideo = preview?.type === "video";
        const isImage = preview?.type === "image";

        // Si ya tenemos la URL (de VideoUploader)
        if (preview && preview.url && isVideo) {
          mediaUrl = preview.url;
        }
        // Si tenemos que subir una imagen
        else if (isImage) {
          const mediaRef = storageRef.child(
            `publicidad/imagenes/${lastIndex}_${Date.now()}_${media.name}`
          );

          const uploadTask = mediaRef.put(media);

          // Monitorear progreso
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              );
              setUploadProgress(progress);
            },
            (error) => {
              console.error("Error al subir imagen:", error);
              setSuccessMessage("Error al subir imagen");
              setTimeout(() => setSuccessMessage(null), 3000);
            }
          );

          // Esperar a que termine la subida
          await uploadTask;
          mediaUrl = await mediaRef.getDownloadURL();
        }

        hasValidData = true;

        if (hasValidData && (horas > 0 || minutos > 0 || segundos > 0)) {
          const fechaDeSubida = firebase.firestore.FieldValue.serverTimestamp();

          // Crear el documento en Firestore
          const publicidadRef = await db.collection("Publicidad").add({
            imageUrl: isImage ? mediaUrl : null,
            videoUrl: isVideo ? mediaUrl : null,
            horas,
            minutos,
            segundos,
            tipo: "salon",
            empresa,
            fechaDeSubida,
          });

          newIds = [...newIds, publicidadRef.id];

          // Actualizar estados
          setImagenesSalon((prevImages) => [...prevImages, null]);
          setTiemposSalon((prevTiempos) => [
            ...prevTiempos,
            { horas: 0, minutos: 0, segundos: 10 },
          ]);
          setPreviewImages((prevPreviews) => [...prevPreviews, null]);

          // Mostrar mensaje de éxito
          setSuccessMessage(
            t("advertisement.salon.addSuccess") ||
              "Publicidad agregada con éxito"
          );
          setTimeout(() => {
            setSuccessMessage(null);
          }, 3000);
        }
      }

      if (hasValidData) {
        setPublicidadesIds((prevIds) => [...prevIds, ...newIds]);

        // Recargar las publicidades
        await obtenerPublicidades(empresa, "salon");
      } else {
        console.warn(t("advertisement.salon.noValidDataToAdd"));
      }
    } catch (error) {
      console.error(t("advertisement.salon.errorAddAdvertising"), error);
      setSuccessMessage("Error al agregar publicidad");
      setTimeout(() => setSuccessMessage(null), 3000);
    } finally {
      setCurrentAction(null);
      setIsUploading(false);
      setIsLoading(false);
      setUploadProgress(0);
      setCurrentUploadingIndex(null);
    }
  };

  const handleEliminarPublicidad = async (publicidadId, index) => {
    try {
      const confirmacion = window.confirm(
        t("advertisement.salon.confirmDeleteAdvertisement")
      );
      if (!confirmacion) return;

      setIsLoading(true);
      await db.collection("Publicidad").doc(publicidadId).delete();
      const newImages = [...imagenesSalon];
      newImages.splice(index, 1);

      const newPreviewImages = [...previewImages];
      newPreviewImages.splice(index, 1);

      const newTiemposSalon = [...tiemposSalon];
      newTiemposSalon.splice(index, 1);

      const newIds = [...publicidadesIds];
      newIds.splice(index, 1);

      setImagenesSalon(newImages);
      setPreviewImages(newPreviewImages);
      setTiemposSalon(newTiemposSalon);
      setPublicidadesIds(newIds);

      // Mostrar mensaje de éxito
      setSuccessMessage(
        t("advertisement.salon.deleteSuccess") ||
          "Publicidad eliminada con éxito"
      );
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error(t("advertisement.salon.errorDeleteAdvertising"), error);
    } finally {
      setIsLoading(false);
    }
  };

  const isValidData = (index) => {
    if (index < 0 || index >= imagenesSalon.length) return false;

    const hasMedia = imagenesSalon[index] !== null;
    const hasPreview = previewImages[index] !== null;
    const { horas, minutos, segundos } = tiemposSalon[index];
    const hasValidTime = horas > 0 || minutos > 0 || segundos > 0;
    const isAdditionalField = index >= publicidadesIds.length;

    if (isAdditionalField) {
      return hasMedia && hasValidTime && hasPreview;
    }
    return hasValidTime && hasPreview;
  };

  return (
    <div className="space-y-6">
      {/* Selector de empresa para admin */}
      {user &&
        (user.email === "uppermex10@gmail.com" ||
          user.email === "ulises.jacobo@hotmail.com" ||
          user.email === "contacto@upperds.mx") && (
          <div className="bg-white p-4 rounded-lg shadow-sm">
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
          className={`p-4 rounded-md border-l-4 ${
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
      {isLoading && !isUploading && (
        <div className="bg-blue-50 p-4 rounded-md flex items-center justify-center">
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

      {/* Lista de publicidades */}
      <div className="space-y-8">
        {imagenesSalon.slice(0, 10).map((imagen, index) => (
          <div
            key={index}
            className={`bg-white p-5 rounded-lg shadow-sm border-l-4 ${
              editIndex === index ? "border-yellow-500" : "border-transparent"
            } transition-all duration-200`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                {previewImages[index]?.type === "video" ? (
                  <VideoCameraIcon className="mr-2 h-5 text-blue-500" />
                ) : (
                  <PhotoIcon className="mr-2 h-5 text-blue-500" />
                )}
                {`${t("advertisement.salon.title") || "Publicidad Salón"} ${
                  index + 1
                }`}
              </h3>

              {publicidadesIds[index] && (
                <div className="flex space-x-2">
                  {editIndex === null ? (
                    <>
                      <button
                        onClick={() => handleEditarPublicidad(index)}
                        className="flex items-center text-yellow-500 px-3 py-1 rounded-md border border-yellow-500 hover:bg-yellow-50"
                      >
                        <PencilSquareIcon className="mr-1 h-5" />
                        {t("advertisement.salon.edit") || "Editar"}
                      </button>
                      <button
                        onClick={() =>
                          handleEliminarPublicidad(
                            publicidadesIds[index],
                            index
                          )
                        }
                        className="flex items-center text-red-500 px-3 py-1 rounded-md border border-red-500 hover:bg-red-50"
                      >
                        <TrashIcon className="mr-1 h-5" />
                        {t("advertisement.salon.delete") || "Eliminar"}
                      </button>
                    </>
                  ) : (
                    <>
                      {editIndex === index && (
                        <>
                          <button
                            onClick={handleCancelarEdicion}
                            className="flex items-center text-gray-500 px-3 py-1 rounded-md border border-gray-500 hover:bg-gray-50"
                          >
                            <XMarkIcon className="mr-1 h-5" />
                            {t("advertisement.salon.cancel") || "Cancelar"}
                          </button>
                          <button
                            onClick={() => handleGuardarCambios(index)}
                            className="flex items-center text-green-500 px-3 py-1 rounded-md border border-green-500 hover:bg-green-50"
                          >
                            <BookmarkIcon className="mr-1 h-5" />
                            {t("advertisement.salon.saveChanges") ||
                              "Guardar Cambios"}
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Selector de media (imagen o video) */}
              <div>
                {/* Vista previa del media */}
                {previewImages[index] ? (
                  <div className="mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-700 flex items-center">
                          {previewImages[index].type === "video" ? (
                            <>
                              <VideoCameraIcon className="mr-2 h-5 text-blue-500" />
                              {t("advertisement.salon.video") || "Video"}
                            </>
                          ) : (
                            <>
                              <PhotoIcon className="mr-2 h-5 text-blue-500" />
                              {t("advertisement.salon.image") || "Imagen"}
                            </>
                          )}
                        </span>

                        {/* Sólo mostrar botón de cambiar cuando estamos editando */}
                        {editIndex === index && (
                          <button
                            className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded"
                            onClick={() =>
                              document
                                .getElementById(`mediaSelector-${index}`)
                                .click()
                            }
                          >
                            {t("advertisement.salon.change") || "Cambiar"}
                          </button>
                        )}
                      </div>

                      <div className="flex justify-center bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
                        {previewImages[index].type === "image" ? (
                          <img
                            src={previewImages[index].url}
                            alt={`Vista previa ${index + 1}`}
                            className="object-contain max-h-48 w-auto"
                          />
                        ) : (
                          <video
                            src={previewImages[index].url}
                            alt={`Vista previa ${index + 1}`}
                            className="max-h-48 w-auto"
                            controls
                            preload="metadata"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Si no hay media seleccionado y es un campo editable */}
                    {(editIndex === index || !publicidadesIds[index]) && (
                      <>
                        {/* VideoUploader */}
                        <div className="mb-4">
                          <VideoUploader
                            onVideoUploaded={(videoData) =>
                              handleVideoUploaded(videoData, index)
                            }
                            onError={handleVideoError}
                          />
                        </div>

                        {/* Separador con texto */}
                        <div className="flex items-center my-4">
                          <div className="flex-grow border-t border-gray-300"></div>
                          <span className="flex-shrink mx-4 text-gray-600 text-sm">
                            {t("advertisement.salon.or") || "O BIEN"}
                          </span>
                          <div className="flex-grow border-t border-gray-300"></div>
                        </div>

                        {/* Selector de imagen tradicional */}
                        <div className="mb-4">
                          <label className="flex justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-blue-400 focus:outline-none">
                            <span className="flex items-center space-x-2 h-full">
                              <PhotoIcon className="w-6 h-6 text-gray-600" />
                              <span className="font-medium text-gray-600">
                                {t("advertisement.salon.selectImage") ||
                                  "Seleccionar imagen"}
                                <span className="text-blue-600 underline ml-1">
                                  {t("advertisement.salon.browse") ||
                                    "Explorar"}
                                </span>
                              </span>
                            </span>
                            <input
                              id={`mediaSelector-${index}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(event) =>
                                handleImagenSelect(event, index)
                              }
                            />
                          </label>
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* Barra de progreso durante la carga */}
                {isUploading && currentUploadingIndex === index && (
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 flex items-center mb-1">
                      <ArrowPathIcon className="animate-spin mr-1 h-4 w-4 text-blue-500" />
                      {t("advertisement.salon.uploading") || "Subiendo..."}
                    </label>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-center mt-1 text-gray-500">
                      {uploadProgress}%
                    </p>
                  </div>
                )}

                {/* Opción para cambiar el medio (solo en modo edición) */}
                {editIndex === index && previewImages[index] && (
                  <div className="mt-2">
                    <input
                      id={`mediaSelector-${index}`}
                      type="file"
                      accept="image/*,video/mp4,video/webm"
                      className="hidden"
                      onChange={(event) => handleImagenSelect(event, index)}
                    />
                  </div>
                )}
              </div>

              {/* Tiempo de visualización */}
              <div>
                <div className="mb-2">
                  <label className="text-base font-medium text-gray-700 flex items-center">
                    <ClockIcon className="mr-2 h-5 text-blue-500" />
                    {t("advertisement.salon.displayTime") ||
                      "Tiempo de visualización"}
                  </label>
                  <p className="text-sm text-gray-500 mb-2">
                    {t("advertisement.salon.displayTimeHelper") ||
                      "Defina por cuánto tiempo se mostrará este contenido"}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-2">
                  {["horas", "minutos", "segundos"].map((unit) => (
                    <div key={unit} className="flex flex-col">
                      <label className="text-sm text-gray-600 mb-1">
                        {t(`advertisement.salon.${unit}`) || unit}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name={unit}
                          min="0"
                          max={unit === "horas" ? "23" : "59"}
                          value={tiemposSalon[index][unit] || 0}
                          onChange={(event) =>
                            handleInputChange(event, index, tiemposSalon)
                          }
                          className={`
                          w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500
                          ${
                            (editIndex !== null && editIndex !== index) ||
                            (editIndex === null && publicidadesIds[index])
                              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                              : "bg-white text-gray-700"
                          }
                        `}
                          disabled={
                            (editIndex !== null && editIndex !== index) ||
                            (editIndex === null && publicidadesIds[index])
                          }
                          pattern="\d*"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Información de advertencia */}
                {!tiemposSalon[index].horas &&
                  !tiemposSalon[index].minutos &&
                  !tiemposSalon[index].segundos &&
                  !(
                    (editIndex !== null && editIndex !== index) ||
                    (editIndex === null && publicidadesIds[index])
                  ) && (
                    <div className="mt-4 bg-yellow-50 p-2 rounded-md text-sm text-yellow-700 border-l-4 border-yellow-400">
                      {t("advertisement.salon.timeWarning") ||
                        "Debe establecer un tiempo de visualización válido"}
                    </div>
                  )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botón para agregar nueva publicidad */}
      {imagenesSalon.length < 11 && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleAgregarPublicidad}
            disabled={isUploading || !isValidData(imagenesSalon.length - 1)}
            className={`
            flex items-center px-6 py-3 rounded-lg shadow-sm font-medium text-white
            ${
              isValidData(imagenesSalon.length - 1)
                ? "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                : "bg-gray-400 cursor-not-allowed"
            }
          `}
          >
            {isUploading && currentAction === "Guardar Publicidad" ? (
              <>
                <ArrowPathIcon className="mr-2 h-5 animate-spin" />
                {t("advertisement.salon.saving") || "Guardando..."}
              </>
            ) : (
              <>
                <PlusCircleIcon className="mr-2 h-5" />
                {t("advertisement.salon.addAdvertisement") ||
                  "Agregar publicidad"}
              </>
            )}
          </button>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-600">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-gray-400"
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
          <div className="ml-2">
            <p className="font-medium text-gray-700 mb-1">
              {t("advertisement.salon.helpTitle") || "Ayuda con el contenido"}
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>
                {t("advertisement.salon.helpText") ||
                  "Los contenidos se mostrarán cuando no haya eventos programados."}
              </li>
              <li>
                {t("advertisement.salon.timeTip") ||
                  "El tiempo recomendado por imagen es entre 10 y 15 segundos."}
              </li>
              <li>
                {t("advertisement.salon.videoHelp") ||
                  "Los videos deben ser de máximo 15MB y 60 segundos de duración. Formatos aceptados: MP4, WEBM."}
              </li>
              <li>
                {t("advertisement.salon.resolutionTip") ||
                  "La resolución recomendada es de 720p (1280×720) para mejor rendimiento."}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicidadSalon;
