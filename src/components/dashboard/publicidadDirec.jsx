import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync, faCheck } from "@fortawesome/free-solid-svg-icons";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/storage";
import "firebase/compat/firestore";
import { useTranslation } from "react-i18next";
import { firebaseConfig } from "@/firebase/firebaseConfig"; // .env

//TODO verificar que haga falta inicializar y getFirestore, getStorage que se deban llamar vacios o con app
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const storage = firebase.storage();
const db = firebase.firestore();

function PublicidadDirec() {
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
  const [screenTypes, setScreenTypes] = useState([]);
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
  const [tiposPantalla, setTiposPantalla] = useState([]);
  const [empresas, setEmpresas] = useState([]); // Estado para almacenar las empresas disponibles
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null); // Estado para la empresa seleccionada
  const [publicidadesDirectorio, setPublicidadesDirectorio] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        // Obtener datos del usuario
        const usuarioDoc = await db.collection("usuarios").doc(user.uid).get();
        const usuarioData = usuarioDoc.data();
        const empresaUsuario = usuarioData.empresa;
        await obtenerEmpresas(); // Obtener empresas disponibles
        await obtenerPublicidades(empresaUsuario, "directorio");
      } else {
        // El objeto user es nulo.
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
    await obtenerPublicidades(empresaSeleccionada, "directorio");
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
              imageUrl = await storage
                .refFromURL(data.imageUrl)
                .getDownloadURL();
            }

            if (data.videoUrl) {
              videoUrl = await storage
                .refFromURL(data.videoUrl)
                .getDownloadURL();
            }

            return {
              id: doc.id,
              ...data,
              imageUrl,
              videoUrl,
            };
          })
        );

        publicidadesData.sort((a, b) => a.fechaDeSubida - b.fechaDeSubida);

        const cantidadPublicidades = publicidadesData.length;
        const cantidadNuevasPublicidades = 1;
        const nuevasImagenes = Array.from(
          { length: cantidadNuevasPublicidades },
          (_, index) =>
            storage
              .ref()
              .child(
                `publicidad/salon_${
                  cantidadPublicidades + index + 1
                }_${Date.now()}.jpg`
              )
        );
        const nuevosTiempos = Array.from(
          { length: cantidadNuevasPublicidades },
          () => ({
            horas: 0,
            minutos: 0,
            segundos: 10,
          })
        );

        const nuevasVistasPrevias = nuevasImagenes.map(() => null);

        setTiposPantalla([
          ...publicidadesData.map(
            (publicidad) => publicidad.tipoPantalla || []
          ),
          ...Array(cantidadNuevasPublicidades).fill([]),
        ]);

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
        setPreviewImages(
          publicidadesData.map((publicidad) => ({
            url: publicidad.videoUrl || publicidad.imageUrl,
            type: publicidad.videoUrl ? "video" : "image",
          })),
          // Asegúrate de agregar las nuevas vistas previas para las imágenes recién agregadas
          ...nuevasVistasPrevias
        );

        setImagenesSalonOriginales(publicidadesData.map(() => null));
      } else {
        // El objeto user es nulo o no tiene la propiedad uid.
        console.warn(t("advertisement.salon.userNullUidProperty"));
      }
    } catch (error) {
      // Error al obtener publicidades:
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

      const nuevaImagen = imagenesSalon[index];
      const { horas, minutos, segundos } = tiemposSalon[index];
      const tipoPantalla = tiposPantalla[index] || []; // Obtener el tipo de pantalla actual

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
        console.alert(t("advertisement.salon.completeAtLeastOneField"));
        return;
      }

      const userUid = user.uid;
      const publicidadId = publicidadesIds[index];
      const publicidadRef = db.collection("Publicidad").doc(publicidadId);
      let mediaUrl = previewImages[index].url;

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
          },
          (error) => {
            console.error(t("advertisement.salon.errorLoadingMedia"), error);
          },
          async () => {
            mediaUrl = await mediaRef.getDownloadURL();

            if (isVideo) {
              await publicidadRef.update({
                imageUrl: null,
                videoUrl: mediaUrl,
                horas,
                minutos,
                segundos,
                tipoPantalla, // Añadir el tipo de pantalla aquí
              });
            } else {
              await publicidadRef.update({
                imageUrl: mediaUrl,
                videoUrl: null,
                horas,
                minutos,
                segundos,
                tipoPantalla, // Añadir el tipo de pantalla aquí
              });
            }

            setEditIndex(null);
            setIsUploading(false);
          }
        );
      } else {
        await publicidadRef.update({
          horas,
          minutos,
          segundos,
          tipoPantalla, // Añadir el tipo de pantalla aquí
        });

        setEditIndex(null);
        setIsUploading(false);
      }
    } catch (error) {
      console.error(t("advertisement.salon.errorSavingChanges"), error);
      setIsUploading(false);
    } finally {
      setIsLoading(false);
      setCurrentAction(null);
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
          type: file.type.startsWith("video/") ? "video" : "image",
        };
        return newPreviews;
      });
    };

    reader.readAsDataURL(file);
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

      for (let index = 0; index < imagenesSalon.length; index++) {
        const imagen = imagenesSalon[index];

        if (imagen) {
          const isImage = imagen.type.startsWith("image");
          const isVideo = imagen.type.startsWith("video");
          const mediaRef = storageRef.child(
            `publicidad/${
              isImage ? "imagenes" : "videos"
            }/${index}_${Date.now()}_${imagen.name}`
          );

          await mediaRef.put(imagen);
          const mediaUrl = await mediaRef.getDownloadURL();
          const { horas, minutos, segundos } = tiemposSalon[index];
          hasValidData = true;

          if (horas > 0 || minutos > 0 || segundos > 0) {
            const fechaDeSubida =
              firebase.firestore.FieldValue.serverTimestamp();
            const publicidadRef = await db.collection("Publicidad").add({
              imageUrl: isImage ? mediaUrl : null,
              videoUrl: isVideo ? mediaUrl : null,
              horas,
              minutos,
              segundos,
              tipo: "directorio",
              empresa: empresa, // Usar la empresa seleccionada o la del usuario logueado
              tipoPantalla: tiposPantalla[index] || [],
              fechaDeSubida,
            });

            newIds = [...newIds, publicidadRef.id];

            setImagenesSalon((prevImages) => {
              const newImages = [...prevImages];
              newImages[index] = null;
              return newImages;
            });

            setTiemposSalon((prevTiempos) => [
              ...prevTiempos,
              { horas: 0, minutos: 0, segundos: 10 },
            ]);

            setPreviewImages((prevPreviews) => [...prevPreviews, null]);
          }
        }
      }

      if (hasValidData) {
        setPublicidadesIds((prevIds) => [...prevIds, ...newIds]);
      } else {
        // "No hay datos válidos para agregar"
        console.warn(t("advertisement.salon.noValidDataToAdd"));
      }

      setImagenesSalon((prevImages) => [...prevImages, null]);
      setTiemposSalon((prevTiempos) => [
        ...prevTiempos,
        { horas: 0, minutos: 0, segundos: 10 },
      ]);
      setPreviewImages((prevPreviews) => [...prevPreviews, null]);
    } catch (error) {
      // "Error al agregar publicidad:"
      console.error(t("advertisement.salon.errorAddAdvertising"), error);
    } finally {
      setCurrentAction(null);
      setIsUploading(false);
      setIsLoading(false);
    }
  };

  const handleTipoPantallaChange = (index, tipos) => {
    setTiposPantalla((prevTipos) => {
      const nuevosTipos = [...prevTipos];
      nuevosTipos[index] = tipos;
      return nuevosTipos;
    });
  };

  const handleEliminarPublicidad = async (publicidadId, index) => {
    try {
      const confirmacion = window.confirm(
        // "¿Estás seguro de que quieres eliminar esta publicidad?"
        t("advertisement.salon.confirmDeleteAdvertisement")
      );
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
    } catch (error) {
      // "Error al eliminar publicidad:"
      console.error(t("advertisement.salon.errorDeleteAdvertising"), error);
    } finally {
      setIsLoading(false);
    }
  };

  const isValidData = (index) => {
    const hasImage = imagenesSalon[index] !== null;
    const isNewImageSelected =
      imagenesSalon[index] && imagenesSalon[index].name !== undefined;
    const { horas, minutos, segundos } = tiemposSalon[index];
    const hasTipoPantalla = tiposPantalla[index]?.length > 0;
    const isAdditionalField = index >= publicidadesIds.length;

    // Validación para campos adicionales
    if (isAdditionalField) {
      return (
        isNewImageSelected &&
        (horas > 0 || minutos > 0 || segundos > 0) &&
        previewImages[index] !== null &&
        hasTipoPantalla
      );
    }

    // Validación para campos existentes
    return (
      hasImage &&
      (horas > 0 || minutos > 0 || segundos > 0) &&
      previewImages[index] !== null &&
      hasTipoPantalla
    );
  };

  const renderCamposImagenes = () => (
    <section>
      <div className="mb-8">
        {imagenesSalon.slice(0, 10).map((imagen, index) => (
          <div key={index} className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800">
              {/* Directorio de Eventos {index + 1} */}
              {`${t("advertisement.salon.title2")}  ${index + 1}`}
            </h3>
            {/* Selección de Tipo de Pantalla */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Tipo de Pantalla
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleTipoPantallaChange(index, ["vertical"])}
                  className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                    tiposPantalla[index]?.includes("vertical")
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  disabled={
                    (editIndex !== null && editIndex !== index) ||
                    (editIndex === null && publicidadesIds[index])
                  }
                >
                  Pantalla Vertical
                </button>
                <button
                  onClick={() =>
                    handleTipoPantallaChange(index, ["horizontal"])
                  }
                  className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                    tiposPantalla[index]?.includes("horizontal")
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  disabled={
                    (editIndex !== null && editIndex !== index) ||
                    (editIndex === null && publicidadesIds[index])
                  }
                >
                  Pantalla Horizontal
                </button>
                <button
                  onClick={() =>
                    handleTipoPantallaChange(index, ["vertical", "horizontal"])
                  }
                  className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                    tiposPantalla[index]?.length === 2
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  disabled={
                    (editIndex !== null && editIndex !== index) ||
                    (editIndex === null && publicidadesIds[index])
                  }
                >
                  Ambas Pantallas
                </button>
              </div>
            </div>

            <div className="mt-4">
              <label className="block p-3 border rounded-lg cursor-pointer text-blue-500 border-blue-500 hover:bg-blue-100 hover:text-blue-700 w-1/2">
                {/* Seleccionar Imagen o Video */}
                {t("advertisement.salon.selectMedia")}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id={`imagenSalon-${index}`}
                  onChange={(event) => handleImagenSelect(event, index)}
                  disabled={
                    (editIndex !== null && editIndex !== index) ||
                    (editIndex === null && publicidadesIds[index])
                  }
                />
              </label>
            </div>
            {previewImages[index] && (
              <div className="mt-4">
                {previewImages[index].type === "image" ? (
                  <img
                    src={previewImages[index].url}
                    alt={`Vista previa de la imagen ${index + 1}`}
                    className="mt-4"
                    style={{ maxWidth: "200px", height: "auto" }}
                  />
                ) : (
                  <video
                    src={previewImages[index].url}
                    alt={`Vista previa del video ${index + 1}`}
                    className="mt-4"
                    style={{ maxWidth: "200px", height: "auto" }}
                    controls
                    preload="metadata"
                  />
                )}
              </div>
            )}

            <div className="mt-4">
              <label className="text-gray-800">
                {/* Tiempo de visualización: */}
                {t("advertisement.salon.displayTime")}
              </label>
              <div className="flex mt-2">
                {["horas", "minutos", "segundos"].map((unit) => (
                  <div key={unit} className="flex items-center">
                    <input
                      type="number"
                      name={unit}
                      min="0"
                      max={unit === "horas" ? "23" : "59"}
                      value={tiemposSalon[index][unit] || 0}
                      onChange={(event) =>
                        handleInputChange(event, index, tiemposSalon)
                      }
                      className="w-16 px-2 py-1 ml-4 border rounded-md border-gray-300 focus:outline-none"
                      disabled={
                        (editIndex !== null && editIndex !== index) ||
                        (editIndex === null && publicidadesIds[index])
                      }
                      pattern="\d*"
                    />
                    <span className="text-gray-600 ml-1">
                      {/* horas / minutos / segundos */}
                      {t(`advertisement.salon.${unit}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {publicidadesIds[index] && (
              <div className="flex mt-4">
                {editIndex === null && (
                  <>
                    <button
                      onClick={() => handleEditarPublicidad(index)}
                      className="text-yellow-500 p-2 px-4 bg-white border border-yellow-500 rounded-full cursor-pointer hover:bg-yellow-100 hover:text-yellow-700 mr-4"
                    >
                      {/* Editar */}
                      {t("advertisement.salon.edit")}
                    </button>
                    <button
                      onClick={() =>
                        handleEliminarPublicidad(publicidadesIds[index], index)
                      }
                      className="text-red-500 p-2 px-4 bg-white border border-red-500 rounded-full cursor-pointer hover:bg-red-100 hover:text-red-700"
                    >
                      {/* Eliminar */}
                      {t("advertisement.salon.delete")}
                    </button>
                  </>
                )}
                {editIndex === index && (
                  <>
                    <button
                      onClick={() => handleCancelarEdicion()}
                      className="text-gray-500 p-2 px-4 bg-white border border-gray-500 rounded-full cursor-pointer hover:bg-gray-100 hover:text-gray-700 mr-4"
                    >
                      {/* Cancelar */}
                      {t("advertisement.salon.cancel")}
                    </button>
                    <button
                      onClick={() => handleGuardarCambios(index)}
                      className="text-green-500 p-2 px-4 bg-white border border-green-500 rounded-full cursor-pointer hover:bg-green-100 hover:text-green-700"
                    >
                      {/* Guardar Cambios */}
                      {t("advertisement.salon.saveChanges")}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <section className="md:mt-3 ">
      <div>
        <div className="mb-4">
          {user &&
            (user.email === "uppermex10@gmail.com" ||
              user.email === "ulises.jacobo@hotmail.com" ||
              user.email === "contacto@upperds.mx") && (
              <>
                <label htmlFor="empresa" className="text-gray-800">
                  Seleccionar empresa
                </label>
                <select
                  id="empresa"
                  name="empresa"
                  className="block w-full mt-1 p-2 border rounded-md"
                  onChange={handleEmpresaChange}
                  disabled={
                    !(
                      user &&
                      (user.email === "uppermex10@gmail.com" ||
                        user.email === "ulises.jacobo@hotmail.com" ||
                        user.email === "contacto@upperds.mx")
                    )
                  }
                >
                  <option value="" disabled selected>
                    Seleccionar...
                  </option>
                  {empresas.map((empresa, index) => (
                    <option key={index} value={empresa}>
                      {empresa}
                    </option>
                  ))}
                </select>
              </>
            )}
        </div>
        <section className="">
          {successMessage && (
            <div className="bg-green-500 text-white p-2 mb-4 rounded-md">
              {successMessage}
            </div>
          )}
          <div
            className="mb-8"
            style={{ cursor: isUploading ? "wait" : "auto" }}
          >
            {renderCamposImagenes()}
            {imagenesSalon.length < 11 && (
              <div className="mt-4">
                <button
                  onClick={handleAgregarPublicidad}
                  disabled={
                    isUploading || !isValidData(imagenesSalon.length - 1)
                  }
                  className={`px-4 py-2 text-white ${
                    isValidData(imagenesSalon.length - 1)
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-gray-400 cursor-not-allowed"
                  } rounded-md focus:outline-none`}
                >
                  {isUploading && currentAction === "Guardar Publicidad" ? (
                    <FontAwesomeIcon icon={faSync} spin size="lg" />
                  ) : currentAction === "Guardar Publicidad" ? (
                    // "Guardar Publicidad"
                    t("advertisement.salon.saveAdvertisement")
                  ) : (
                    // "Guardar Cambios"
                    t("advertisement.salon.saveChanges")
                  )}
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

export default PublicidadDirec;
