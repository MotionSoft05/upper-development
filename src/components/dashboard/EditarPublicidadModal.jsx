import React, { useState, useEffect, useMemo } from "react";

function EditarPublicidadModal({
  isOpen,
  onClose,
  publicidad,
  pantallas,
  onSave,
  t,
}) {
  // Estados para los campos editables
  const [nombre, setNombre] = useState("");
  const [tiempoVisualizacion, setTiempoVisualizacion] = useState({
    horas: 0,
    minutos: 0,
    segundos: 10,
  });
  const [destinoPublicidad, setDestinoPublicidad] = useState("todas");
  const [pantallasSeleccionadas, setPantallasSeleccionadas] = useState([]);
  const [orientacionPantalla, setOrientacionPantalla] = useState("");
  const [pantallasSalon, setPantallasSalon] = useState([]);
  const [pantallasDirectorio, setPantallasDirectorio] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Efecto para cargar los datos de la publicidad cuando se abre el modal
  useEffect(() => {
    if (publicidad && isOpen) {
      setNombre(publicidad.nombre || "");
      setTiempoVisualizacion({
        horas: publicidad.horas || 0,
        minutos: publicidad.minutos || 0,
        segundos: publicidad.segundos || 10,
      });
      setDestinoPublicidad(publicidad.destino || "todas");
      setPantallasSeleccionadas(publicidad.pantallasAsignadas || []);

      // Si es tipo directorio, determinar orientación
      if (
        publicidad.tipo === "directorio" &&
        publicidad.tipoPantalla &&
        publicidad.tipoPantalla.length > 0
      ) {
        setOrientacionPantalla(publicidad.tipoPantalla[0]);
      } else {
        setOrientacionPantalla("");
      }

      // Extraer pantallas de salón y directorio
      if (pantallas) {
        if (pantallas.nombrePantallas) {
          setPantallasSalon(
            Array.isArray(pantallas.nombrePantallas)
              ? pantallas.nombrePantallas
              : Object.values(pantallas.nombrePantallas)
          );
        }

        if (pantallas.nombrePantallasDirectorio) {
          setPantallasDirectorio(
            Array.isArray(pantallas.nombrePantallasDirectorio)
              ? pantallas.nombrePantallasDirectorio
              : Object.values(pantallas.nombrePantallasDirectorio)
          );
        }
      }
    }
  }, [publicidad, isOpen, pantallas]);

  // Cálculo de pantallas filtradas según tipo y orientación
  const pantallasFiltradas = useMemo(() => {
    if (publicidad) {
      if (publicidad.tipo === "salon") {
        return pantallasSalon.map((nombre, index) => ({
          id: `salon${index + 1}`,
          nombre: nombre,
          tipo: "salon",
          ubicacion: `Salón ${index + 1}`,
          activa: true,
        }));
      } else if (publicidad.tipo === "directorio") {
        const pantallasDir = pantallasDirectorio.map((nombre, index) => ({
          id: `dir${index + 1}`,
          nombre: nombre,
          tipo: "directorio",
          orientacion: index % 2 === 0 ? "horizontal" : "vertical",
          ubicacion: `Ubicación ${index + 1}`,
          activa: true,
        }));

        if (!orientacionPantalla) {
          return pantallasDir;
        }

        return pantallasDir.filter(
          (pantalla) => pantalla.orientacion === orientacionPantalla
        );
      }
    }
    return [];
  }, [publicidad, orientacionPantalla, pantallasSalon, pantallasDirectorio]);

  const handleTimeChange = (timeUnit, value) => {
    setTiempoVisualizacion((prev) => ({
      ...prev,
      [timeUnit]: parseInt(value),
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

  const handleGuardar = () => {
    setIsLoading(true);

    // Validaciones
    if (!nombre.trim()) {
      alert("El nombre es obligatorio");
      setIsLoading(false);
      return;
    }

    if (
      !tiempoVisualizacion.horas &&
      !tiempoVisualizacion.minutos &&
      tiempoVisualizacion.segundos < 10
    ) {
      alert("El tiempo de visualización debe ser al menos de 10 segundos");
      setIsLoading(false);
      return;
    }

    if (publicidad.tipo === "directorio" && !orientacionPantalla) {
      alert("Debe seleccionar una orientación para pantalla de directorio");
      setIsLoading(false);
      return;
    }

    if (
      destinoPublicidad === "especificas" &&
      pantallasSeleccionadas.length === 0
    ) {
      alert(
        "Debe seleccionar al menos una pantalla cuando el destino es específico"
      );
      setIsLoading(false);
      return;
    }

    // Preparar datos actualizados
    const datosActualizados = {
      ...publicidad,
      nombre,
      horas: tiempoVisualizacion.horas,
      minutos: tiempoVisualizacion.minutos,
      segundos: tiempoVisualizacion.segundos,
      destino: destinoPublicidad,
      pantallasAsignadas:
        destinoPublicidad === "especificas" ? pantallasSeleccionadas : [],
    };

    // Si es tipo directorio, actualizar tipo de pantalla
    if (publicidad.tipo === "directorio") {
      datosActualizados.tipoPantalla = [orientacionPantalla];
    }

    // Llamar a la función para guardar cambios
    onSave(datosActualizados);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg max-w-3xl w-full mx-4 shadow-xl">
        {/* Cabecera del modal */}
        <div className="border-b px-4 py-3 flex items-center justify-between bg-gray-50 rounded-t-lg">
          <h3 className="text-lg font-medium text-gray-900">
            Editar Publicidad
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg
              className="h-6 w-6"
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

        {/* Contenido del modal */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Vista previa del media */}
          <div className="mb-6 flex justify-center">
            {publicidad.mediaType === "image" || publicidad.imageUrl ? (
              <img
                src={publicidad.mediaUrl || publicidad.imageUrl}
                alt={publicidad.nombre}
                className="h-48 object-contain rounded-md shadow-sm"
              />
            ) : (
              <div className="relative w-full max-w-xs aspect-video bg-black flex items-center justify-center rounded-md shadow-sm">
                <div className="flex flex-col items-center justify-center text-white">
                  <svg
                    className="h-12 w-12 text-white mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm">Video</span>
                </div>
              </div>
            )}
          </div>

          {/* Campos de edición */}
          <div className="space-y-6">
            {/* Nombre */}
            <div>
              <label
                htmlFor="nombre"
                className="block text-sm font-medium text-gray-700"
              >
                Nombre
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="nombre"
                  id="nombre"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Nombre de la publicidad"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
            </div>

            {/* Tiempo de visualización */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiempo de visualización
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="horas"
                    className="block text-xs font-medium text-gray-500"
                  >
                    Horas
                  </label>
                  <select
                    id="horas"
                    name="horas"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={tiempoVisualizacion.horas}
                    onChange={(e) => handleTimeChange("horas", e.target.value)}
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
                    Minutos
                  </label>
                  <select
                    id="minutos"
                    name="minutos"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={tiempoVisualizacion.minutos}
                    onChange={(e) =>
                      handleTimeChange("minutos", e.target.value)
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
                    Segundos
                  </label>
                  <select
                    id="segundos"
                    name="segundos"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={tiempoVisualizacion.segundos}
                    onChange={(e) =>
                      handleTimeChange("segundos", e.target.value)
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
                Tiempo que se mostrará este contenido antes de pasar al
                siguiente. Mínimo recomendado: 10 segundos.
              </p>
            </div>

            {/* Orientación de pantalla (solo para directorio) */}
            {publicidad && publicidad.tipo === "directorio" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Orientación de pantalla
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
                          Horizontal
                        </h4>
                        <p className="text-xs text-gray-500">
                          Pantalla en orientación normal
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
                          Vertical
                        </h4>
                        <p className="text-xs text-gray-500">
                          Pantalla rotada 90 grados
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Destino de la publicidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destino de la publicidad
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
                        Todas las pantallas
                      </h4>
                      <p className="text-xs text-gray-500">
                        Se mostrará en todas las pantallas de{" "}
                        {publicidad?.tipo === "salon" ? "salón" : "directorio"}
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
                        Pantallas específicas
                      </h4>
                      <p className="text-xs text-gray-500">
                        Seleccione las pantallas donde se mostrará
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Selección de pantallas específicas */}
            {destinoPublicidad === "especificas" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar pantallas
                </label>
                {pantallasFiltradas.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b">
                      <span className="text-xs font-medium text-gray-500">
                        Seleccione las pantallas donde desea mostrar esta
                        publicidad
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
                                  `Ubicación: ${pantalla.ubicacion}`}
                                {pantalla.orientacion &&
                                  ` • ${
                                    pantalla.orientacion === "horizontal"
                                      ? "Horizontal"
                                      : "Vertical"
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
                          Se han encontrado {pantallasFiltradas.length}{" "}
                          pantallas compatibles
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
                          No hay pantallas compatibles
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            No se han encontrado pantallas del tipo
                            seleccionado.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer del modal con botones */}
        <div className="border-t px-4 py-3 bg-gray-50 flex flex-shrink-0 justify-end rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleGuardar}
            disabled={isLoading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
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
                Guardando...
              </>
            ) : (
              "Guardar cambios"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditarPublicidadModal;
