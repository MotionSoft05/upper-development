import React, { useState, useEffect, useMemo } from "react";
import firebase from "firebase/compat/app";
import { useTranslation } from "react-i18next";

function PublicidadForm({
  pantallas,
  empresaSeleccionada,
  empresaUsuario,
  setActiveTab,
  setSuccessMessage,
  obtenerPublicidades,
  resetForm,
  db,
  storage,
}) {
  // Estados para el formulario
  const { t } = useTranslation();

  const [tipoPublicidad, setTipoPublicidad] = useState("salon");
  const [orientacionPantalla, setOrientacionPantalla] = useState("");
  const [destinoPublicidad, setDestinoPublicidad] = useState("todas");
  const [pantallasSeleccionadas, setPantallasSeleccionadas] = useState([]);
  const [nombre, setNombre] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [tiempoVisualizacion, setTiempoVisualizacion] = useState({
    horas: 0,
    minutos: 0,
    segundos: 10,
  });
  const [videosHabilitados, setVideosHabilitados] = useState(true);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  // Agrega estos estados cerca del inicio del componente donde están los demás estados
  const [pantallasSalon, setPantallasSalon] = useState([]);
  const [pantallasDirectorio, setPantallasDirectorio] = useState([]);
  const [cargandoPantallas, setCargandoPantallas] = useState(false);

  const handleMediaSelect = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const isVideo = file.type.startsWith("video/");

    // Verificar si los videos están deshabilitados
    if (isVideo && !videosHabilitados) {
      setSuccessMessage(t("advertisement.form.videosDisabled"));
      setTimeout(() => setSuccessMessage(null), 3000);
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setMediaFile(file);
      setMediaPreview({
        url: reader.result,
        type: isVideo ? "video" : "image",
      });
    };

    reader.readAsDataURL(file);
  };

  const handleTimeChange = (timeUnit, value) => {
    setTiempoVisualizacion((prev) => ({
      ...prev,
      [timeUnit]: value,
    }));
  };

  const handlePantallaSeleccionChange = (pantallaId) => {
    setPantallasSeleccionadas((prev) => {
      if (prev.includes(pantallaId)) {
        return prev.filter((id) => id !== pantallaId);
      } else {
        return [...prev, pantallaId];
      }
    });
  };

  const handleGuardarPublicidad = async () => {
    try {
      if (!mediaFile) {
        setSuccessMessage(t("advertisement.form.selectImageOrVideo"));
        setTimeout(() => setSuccessMessage(null), 3000);
        return;
      }

      if (
        !tiempoVisualizacion.horas &&
        !tiempoVisualizacion.minutos &&
        tiempoVisualizacion.segundos < 10
      ) {
        setSuccessMessage(t("advertisement.form.minimumDisplayTime"));
        setTimeout(() => setSuccessMessage(null), 3000);
        return;
      }

      if (tipoPublicidad === "directorio" && !orientacionPantalla) {
        setSuccessMessage(t("advertisement.form.selectOrientation"));
        setTimeout(() => setSuccessMessage(null), 3000);
        return;
      }

      if (!nombre.trim()) {
        setSuccessMessage(t("advertisement.form.nameRequired"));
        setTimeout(() => setSuccessMessage(null), 3000);
        return;
      }

      // Validar destino específico
      if (
        destinoPublicidad === "especificas" &&
        pantallasSeleccionadas.length === 0
      ) {
        setSuccessMessage(t("advertisement.form.selectScreensRequired"));
        setTimeout(() => setSuccessMessage(null), 3000);
        return;
      }

      setIsUploading(true);

      const empresa = empresaSeleccionada || empresaUsuario;
      const isVideo = mediaFile.type.startsWith("video/");
      const storageRef = storage.ref();
      let mediaUrl;

      if (isVideo) {
        const videoRef = storageRef.child(
          `publicidad/videos/${Date.now()}_${mediaFile.name}`
        );
        const uploadTask = videoRef.put(mediaFile);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(Math.round(progress));
          },
          (error) => {
            console.error(t("advertisement.form.videoUploadError"), error);
            setSuccessMessage(t("advertisement.form.videoUploadError"));
            setIsUploading(false);
          }
        );

        await uploadTask;
        mediaUrl = await videoRef.getDownloadURL();
      } else {
        const imageRef = storageRef.child(
          `publicidad/imagenes/${Date.now()}_${mediaFile.name}`
        );
        const uploadTask = imageRef.put(mediaFile);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(Math.round(progress));
          },
          (error) => {
            console.error(t("advertisement.form.imageUploadError"), error);
            setSuccessMessage(t("advertisement.form.imageUploadError"));
            setIsUploading(false);
          }
        );

        await uploadTask;
        mediaUrl = await imageRef.getDownloadURL();
      }

      // Crear documento en Firestore con los nuevos campos
      await db.collection("Publicidad").add({
        nombre: nombre,
        tipo: tipoPublicidad,
        tipoPantalla:
          tipoPublicidad === "directorio" ? [orientacionPantalla] : [],
        imageUrl: !isVideo ? mediaUrl : null,
        videoUrl: isVideo ? mediaUrl : null,
        horas: tiempoVisualizacion.horas,
        minutos: tiempoVisualizacion.minutos,
        segundos: tiempoVisualizacion.segundos,
        empresa: empresa,
        fechaDeSubida: firebase.firestore.FieldValue.serverTimestamp(),
        // Nuevos campos
        destino: destinoPublicidad,
        pantallasAsignadas:
          destinoPublicidad === "especificas" ? pantallasSeleccionadas : [],
      });

      setSuccessMessage(t("advertisement.form.createdSuccess"));
      setTimeout(() => setSuccessMessage(null), 3000);

      // Limpiar el formulario y volver a la lista
      resetForm();
      setActiveTab("listado");

      // Recargar las publicidades
      await obtenerPublicidades(empresa, "todos");
    } catch (error) {
      console.error(t("advertisement.form.saveError"), error);
      setSuccessMessage(t("advertisement.form.saveError"));
      setTimeout(() => setSuccessMessage(null), 3000);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const isFormValid = () => {
    const tiempoValido =
      tiempoVisualizacion.horas > 0 ||
      tiempoVisualizacion.minutos > 0 ||
      tiempoVisualizacion.segundos >= 10;

    const orientacionValida =
      tipoPublicidad !== "directorio" || orientacionPantalla !== "";

    const destinoValido =
      destinoPublicidad !== "especificas" || pantallasSeleccionadas.length > 0;

    return (
      mediaPreview &&
      tiempoValido &&
      orientacionValida &&
      destinoValido &&
      nombre.trim() !== ""
    );
  };
  const toggleVideosHabilitados = () => {
    setVideosHabilitados((prev) => !prev);
    setSuccessMessage(
      t(
        videosHabilitados
          ? "advertisement.form.videosDisabled"
          : "advertisement.form.videosEnabled"
      )
    );
    setTimeout(() => setSuccessMessage(null), 3000);
  };
  // Reemplaza la definición actual de pantallasFiltradas con esta
  const pantallasFiltradas = useMemo(() => {
    if (tipoPublicidad === "salon") {
      return pantallasSalon.map((nombre, index) => ({
        id: `salon${index + 1}`,
        nombre: nombre,
        tipo: "salon",
        ubicacion: `${t("advertisement.form.location")} ${index + 1}`,
        activa: true,
      }));
    } else if (tipoPublicidad === "directorio") {
      const pantallasDir = pantallasDirectorio.map((nombre, index) => ({
        id: `dir${index + 1}`,
        nombre: nombre,
        tipo: "directorio",
        orientacion: index % 2 === 0 ? "horizontal" : "vertical", // Ejemplo de orientación
        ubicacion: `${t("advertisement.form.location")} ${index + 1}`,
        activa: true,
      }));

      if (!orientacionPantalla) {
        return pantallasDir;
      }

      return pantallasDir.filter(
        (pantalla) => pantalla.orientacion === orientacionPantalla
      );
    }

    return [];
  }, [
    tipoPublicidad,
    orientacionPantalla,
    pantallasSalon,
    pantallasDirectorio,
    t,
  ]);

  // Reemplaza la función obtenerPantallas actual con esta versión mejorada
  const obtenerPantallas = async (empresa) => {
    try {
      if (!empresa) {
        setPantallasSalon([]);
        setPantallasDirectorio([]);
        return;
      }

      setCargandoPantallas(true);

      // Buscar todos los usuarios de esta empresa
      const usuariosSnapshot = await db
        .collection("usuarios")
        .where("empresa", "==", empresa)
        .get();

      if (usuariosSnapshot.empty) {
        console.log(t("advertisement.form.noUsers"));
        setPantallasSalon([]);
        setPantallasDirectorio([]);
        setCargandoPantallas(false);
        return;
      }

      // Obtener datos de un usuario (el primero que encontremos)
      const usuarioData = usuariosSnapshot.docs[0].data();

      // Obtener los nombres de las pantallas de salón y directorio
      const salonPantallas = usuarioData.nombrePantallas || [];
      const directorioPantallas = usuarioData.nombrePantallasDirectorio || [];

      // Guardar en el estado
      setPantallasSalon(
        Array.isArray(salonPantallas)
          ? salonPantallas
          : Object.values(salonPantallas)
      );
      setPantallasDirectorio(
        Array.isArray(directorioPantallas)
          ? directorioPantallas
          : Object.values(directorioPantallas)
      );

      setCargandoPantallas(false);
    } catch (error) {
      console.error(t("advertisement.form.screenFetchError"), error);
      setPantallasSalon([]);
      setPantallasDirectorio([]);
      setCargandoPantallas(false);
    }
  };

  // Añade este useEffect para obtener pantallas cuando cambie la empresa
  useEffect(() => {
    const empresa = empresaSeleccionada || empresaUsuario;
    if (empresa) {
      obtenerPantallas(empresa);
    }
  }, [empresaSeleccionada, empresaUsuario]);

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {/* Header con título e interruptor de videos */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {t("advertisement.form.title")}
              </h3>
              {/* 
              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-2">
                  Videos {videosHabilitados ? t("advertisement.form.enabled") : t("advertisement.form.disabled")}
                </span>
                <button
                  type="button"
                  onClick={toggleVideosHabilitados}
                  className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    videosHabilitados ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span className="sr-only">
                    {videosHabilitados ? t("advertisement.form.disable") : t("advertisement.form.enable")} videos
                  </span>
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                      videosHabilitados ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div> */}
            </div>

            {/* Nombre */}
            <div className="mb-6">
              <label
                htmlFor="nombre"
                className="block text-sm font-medium text-gray-700"
              >
                {t("advertisement.form.name")}
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="nombre"
                  id="nombre"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder={t("advertisement.form.namePlaceholder")}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
            </div>

            {/* Tipo de publicidad */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("advertisement.form.advertisingType")}
              </label>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div
                  className={`relative border rounded-lg p-4 cursor-pointer ${
                    tipoPublicidad === "salon"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => setTipoPublicidad("salon")}
                >
                  <div className="flex items-start">
                    <div
                      className={`flex-shrink-0 h-6 w-6 ${
                        tipoPublicidad === "salon"
                          ? "text-blue-600"
                          : "text-gray-400"
                      }`}
                    >
                      {tipoPublicidad === "salon" ? (
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-180 0v3.572L16.732 3.732z"
                          ></path>
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900">
                        {t("advertisement.form.eventRoom")}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {t("advertisement.form.eventRoomDescription")}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`relative border rounded-lg p-4 cursor-pointer ${
                    tipoPublicidad === "directorio"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => setTipoPublicidad("directorio")}
                >
                  <div className="flex items-start">
                    <div
                      className={`flex-shrink-0 h-6 w-6 ${
                        tipoPublicidad === "directorio"
                          ? "text-blue-600"
                          : "text-gray-400"
                      }`}
                    >
                      {tipoPublicidad === "directorio" ? (
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          ></path>
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900">
                        {t("advertisement.form.directory")}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {t("advertisement.form.directoryDescription")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Orientación de pantalla (solo para directorio) */}
            {tipoPublicidad === "directorio" && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("advertisement.form.screenOrientation")}
                </label>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div
                    className={`relative border rounded-lg p-4 cursor-pointer ${
                      orientacionPantalla === "horizontal"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onClick={() => setOrientacionPantalla("horizontal")}
                  >
                    <div className="flex items-start">
                      <div
                        className={`flex-shrink-0 h-6 w-6 ${
                          orientacionPantalla === "horizontal"
                            ? "text-blue-600"
                            : "text-gray-400"
                        }`}
                      >
                        {orientacionPantalla === "horizontal" ? (
                          <svg
                            className="h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        ) : (
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                          </svg>
                        )}
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-gray-900">
                          {t("advertisement.form.horizontal")}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {t("advertisement.form.horizontalDescription")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`relative border rounded-lg p-4 cursor-pointer ${
                      orientacionPantalla === "vertical"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onClick={() => setOrientacionPantalla("vertical")}
                  >
                    <div className="flex items-start">
                      <div
                        className={`flex-shrink-0 h-6 w-6 ${
                          orientacionPantalla === "vertical"
                            ? "text-blue-600"
                            : "text-gray-400"
                        }`}
                      >
                        {orientacionPantalla === "vertical" ? (
                          <svg
                            className="h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        ) : (
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                          </svg>
                        )}
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-gray-900">
                          {t("advertisement.form.vertical")}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {t("advertisement.form.verticalDescription")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Destino de la publicidad */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("advertisement.form.advertisingDestination")}
              </label>
              <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 gap-x-4">
                <div
                  className={`relative border rounded-lg p-4 cursor-pointer ${
                    destinoPublicidad === "todas"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => setDestinoPublicidad("todas")}
                >
                  <div className="flex items-start">
                    <div
                      className={`flex-shrink-0 h-6 w-6 ${
                        destinoPublicidad === "todas"
                          ? "text-blue-600"
                          : "text-gray-400"
                      }`}
                    >
                      {destinoPublicidad === "todas" ? (
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          ></path>
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900">
                        {t("advertisement.form.allScreens")}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {t("advertisement.form.allScreensDescription")}{" "}
                        {t(`advertisement.form.${tipoPublicidad}`)}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`relative border rounded-lg p-4 cursor-pointer ${
                    destinoPublicidad === "especificas"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => setDestinoPublicidad("especificas")}
                >
                  <div className="flex items-start">
                    <div
                      className={`flex-shrink-0 h-6 w-6 ${
                        destinoPublicidad === "especificas"
                          ? "text-blue-600"
                          : "text-gray-400"
                      }`}
                    >
                      {destinoPublicidad === "especificas" ? (
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          ></path>
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900">
                        {t("advertisement.form.specificScreens")}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {t("advertisement.form.specificScreensDescription")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Selección de pantallas específicas */}
            {destinoPublicidad === "especificas" && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("advertisement.form.selectScreens")}
                </label>
                {pantallasFiltradas.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b">
                      <span className="text-xs font-medium text-gray-500">
                        {t("advertisement.form.selectScreensDescription")}
                      </span>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-4">
                      <div className="space-y-2">
                        {pantallasFiltradas.map((pantalla) => (
                          <div key={pantalla.id} className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id={`pantalla-${pantalla.id}`}
                                name={`pantalla-${pantalla.id}`}
                                type="checkbox"
                                checked={pantallasSeleccionadas.includes(
                                  pantalla.id
                                )}
                                onChange={() =>
                                  handlePantallaSeleccionChange(pantalla.id)
                                }
                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label
                                htmlFor={`pantalla-${pantalla.id}`}
                                className="font-medium text-gray-700"
                              >
                                {pantalla.nombre}
                              </label>
                              <p className="text-gray-500">
                                {pantalla.ubicacion &&
                                  `${t("advertisement.form.location")}: ${
                                    pantalla.ubicacion
                                  }`}
                                {pantalla.orientacion &&
                                  ` • ${
                                    pantalla.orientacion === "horizontal"
                                      ? t("advertisement.form.horizontal")
                                      : t("advertisement.form.vertical")
                                  }`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {pantallasFiltradas.length > 5 && (
                      <div className="bg-gray-50 px-4 py-2 border-t">
                        <span className="text-xs text-gray-500">
                          {t("advertisement.form.foundScreens", {
                            count: pantallasFiltradas.length,
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-md bg-yellow-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-yellow-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          {t("advertisement.form.noCompatibleScreens")}
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            {t(
                              "advertisement.form.noCompatibleScreensDescription",
                              {
                                type: t(`advertisement.form.${tipoPublicidad}`),
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Upload de archivos / Tiempo de visualización */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("advertisement.form.imageOrVideo")}
              </label>

              {/* Mensaje de advertencia para videos deshabilitados */}
              {!videosHabilitados && (
                <div className="mb-2 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        {t("advertisement.form.videosTemporarilyDisabled")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {mediaPreview ? (
                    <div className="relative">
                      <div className="mb-3">
                        {mediaPreview.type === "image" ? (
                          <img
                            src={mediaPreview.url}
                            alt={t("advertisement.form.preview")}
                            className="h-40 mx-auto object-contain"
                          />
                        ) : (
                          <video
                            src={mediaPreview.url}
                            controls
                            className="h-40 mx-auto"
                          ></video>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMediaFile(null);
                          setMediaPreview(null);
                        }}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>{t("advertisement.form.uploadFile")}</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*, video/*"
                            onChange={handleMediaSelect}
                          />
                        </label>
                        <p className="pl-1">
                          {t("advertisement.form.orDragDrop")}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {videosHabilitados
                          ? t("advertisement.form.acceptedFormatsAll")
                          : t("advertisement.form.acceptedFormatsImages")}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Tiempo de visualización */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("advertisement.form.displayTime")}
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="horas"
                    className="block text-xs font-medium text-gray-500"
                  >
                    {t("advertisement.form.hours")}
                  </label>
                  <select
                    id="horas"
                    name="horas"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={tiempoVisualizacion.horas}
                    onChange={(e) =>
                      handleTimeChange("horas", parseInt(e.target.value))
                    }
                  >
                    {[...Array(24).keys()].map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="minutos"
                    className="block text-xs font-medium text-gray-500"
                  >
                    {t("advertisement.form.minutes")}
                  </label>
                  <select
                    id="minutos"
                    name="minutos"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={tiempoVisualizacion.minutos}
                    onChange={(e) =>
                      handleTimeChange("minutos", parseInt(e.target.value))
                    }
                  >
                    {[...Array(60).keys()].map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="segundos"
                    className="block text-xs font-medium text-gray-500"
                  >
                    {t("advertisement.form.seconds")}
                  </label>
                  <select
                    id="segundos"
                    name="segundos"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={tiempoVisualizacion.segundos}
                    onChange={(e) =>
                      handleTimeChange("segundos", parseInt(e.target.value))
                    }
                  >
                    {[...Array(60).keys()].map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {t("advertisement.form.displayTimeDescription")}
              </p>
            </div>

            {/* Botón de guardar con progreso */}
            <div className="pt-5 border-t">
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {t("advertisement.form.uploading", {
                      progress: uploadProgress,
                    })}
                  </p>
                </div>
              ) : (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setActiveTab("listado");
                    }}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                  >
                    {t("advertisement.form.cancel")}
                  </button>
                  <button
                    type="button"
                    onClick={handleGuardarPublicidad}
                    disabled={!isFormValid()}
                    className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      isFormValid()
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-blue-400 cursor-not-allowed"
                    }`}
                  >
                    {t("advertisement.form.save")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicidadForm;
