import React, { useState } from "react";

function PublicidadList({ publicidades, isLoading, onDelete, pantallas, t }) {
  console.log(
    "🚀 ~ PublicidadList.jsx:4 ~ PublicidadList ~ publicidades:",
    publicidades
  );
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("fechaCreacion");
  const [sortDirection, setSortDirection] = useState("desc");

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredItems = publicidades
    .filter(
      (item) =>
        (activeFilter === "todos" || item.tipo === activeFilter) &&
        (searchTerm === "" ||
          (item.nombre &&
            item.nombre.toLowerCase().includes(searchTerm.toLowerCase())))
    )
    .sort((a, b) => {
      if (sortField === "fechaDeSubida") {
        const dateA = a.fechaDeSubida ? a.fechaDeSubida.toMillis() : 0;
        const dateB = b.fechaDeSubida ? b.fechaDeSubida.toMillis() : 0;
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      } else if (
        sortField === "segundos" ||
        sortField === "minutos" ||
        sortField === "horas"
      ) {
        const valueA = a[sortField] || 0;
        const valueB = b[sortField] || 0;
        return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
      } else {
        const valueA = a[sortField]
          ? a[sortField].toString().toLowerCase()
          : "";
        const valueB = b[sortField]
          ? b[sortField].toString().toLowerCase()
          : "";
        return sortDirection === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
    });

  const handleExpandRow = (id) => {
    setExpandedItemId(expandedItemId === id ? null : id);
  };

  const getNombrePantalla = (pantallaId, tipo, pantallas) => {
    // Si es un ID del tipo "salon1" o "salon2"
    if (typeof pantallaId === "string" && pantallaId.startsWith("salon")) {
      const index = parseInt(pantallaId.replace("salon", ""), 10) - 1;

      // Primero buscar en el array de pantallas por ID exacto
      const pantallaPorId =
        Array.isArray(pantallas) && pantallas.find((p) => p.id === pantallaId);

      if (pantallaPorId) {
        return {
          nombre: pantallaPorId.nombre,
          ubicacion: pantallaPorId.ubicacion || "",
        };
      }

      // Si no encontramos por ID, buscar en las propiedades de salón si existen
      if (
        pantallas &&
        pantallas.nombrePantallas &&
        Array.isArray(pantallas.nombrePantallas) &&
        index >= 0 &&
        index < pantallas.nombrePantallas.length
      ) {
        return {
          nombre: pantallas.nombrePantallas[index],
          ubicacion: `Salón ${index + 1}`,
        };
      }
    }

    // Si es un ID del tipo "dir1" o "dir2"
    if (typeof pantallaId === "string" && pantallaId.startsWith("dir")) {
      const index = parseInt(pantallaId.replace("dir", ""), 10) - 1;

      // Primero buscar en el array de pantallas por ID exacto
      const pantallaPorId =
        Array.isArray(pantallas) && pantallas.find((p) => p.id === pantallaId);

      if (pantallaPorId) {
        return {
          nombre: pantallaPorId.nombre,
          ubicacion: pantallaPorId.ubicacion || "",
          orientacion: pantallaPorId.orientacion || "",
        };
      }

      // Si no encontramos por ID, buscar en las propiedades de directorio si existen
      if (
        pantallas &&
        pantallas.nombrePantallasDirectorio &&
        Array.isArray(pantallas.nombrePantallasDirectorio) &&
        index >= 0 &&
        index < pantallas.nombrePantallasDirectorio.length
      ) {
        return {
          nombre: pantallas.nombrePantallasDirectorio[index],
          ubicacion: `Directorio ${index + 1}`,
          orientacion: index % 2 === 0 ? "horizontal" : "vertical",
        };
      }

      // Para las pantallas de demo que se cargan cuando no hay en Firestore
      if (pantallaId === "dir1") {
        return {
          nombre: "Directorio Recepción",
          ubicacion: "Entrada",
          orientacion: "horizontal",
        };
      } else if (pantallaId === "dir2") {
        return {
          nombre: "Directorio Ascensores",
          ubicacion: "Piso 1",
          orientacion: "vertical",
        };
      }
    }

    // Si no pudimos encontrar información detallada, devolver algo genérico pero útil
    return {
      nombre: `Pantalla ${pantallaId}`,
      ubicacion: tipo === "salon" ? "Salón" : "Directorio",
    };
  };

  return (
    <>
      {/* Filtros y búsqueda */}
      <div className="p-4 border-b bg-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <div className="flex flex-wrap items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Filtrar:</span>
            <button
              onClick={() => setActiveFilter("todos")}
              className={`px-3 py-1 text-sm rounded-md ${
                activeFilter === "todos"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setActiveFilter("salon")}
              className={`px-3 py-1 text-sm rounded-md ${
                activeFilter === "salon"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Salón
            </button>
            <button
              onClick={() => setActiveFilter("directorio")}
              className={`px-3 py-1 text-sm rounded-md ${
                activeFilter === "directorio"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Directorio
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Buscar publicidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <span className="sr-only">Expandir</span>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("nombre")}
              >
                <div className="flex items-center">
                  Nombre
                  {sortField === "nombre" && (
                    <svg
                      className={`ml-1 w-4 h-4 ${
                        sortDirection === "asc" ? "" : "transform rotate-180"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 15l7-7 7 7"
                      ></path>
                    </svg>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("tipo")}
              >
                <div className="flex items-center">
                  Tipo
                  {sortField === "tipo" && (
                    <svg
                      className={`ml-1 w-4 h-4 ${
                        sortDirection === "asc" ? "" : "transform rotate-180"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 15l7-7 7 7"
                      ></path>
                    </svg>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("segundos")}
              >
                <div className="flex items-center">
                  Duración
                  {sortField === "segundos" && (
                    <svg
                      className={`ml-1 w-4 h-4 ${
                        sortDirection === "asc" ? "" : "transform rotate-180"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 15l7-7 7 7"
                      ></path>
                    </svg>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("destino")}
              >
                <div className="flex items-center">
                  Destino
                  {sortField === "destino" && (
                    <svg
                      className={`ml-1 w-4 h-4 ${
                        sortDirection === "asc" ? "" : "transform rotate-180"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 15l7-7 7 7"
                      ></path>
                    </svg>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("mediaType")}
              >
                <div className="flex items-center">
                  Formato
                  {sortField === "mediaType" && (
                    <svg
                      className={`ml-1 w-4 h-4 ${
                        sortDirection === "asc" ? "" : "transform rotate-180"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 15l7-7 7 7"
                      ></path>
                    </svg>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <React.Fragment key={item.id}>
                  <tr
                    className={`${
                      expandedItemId === item.id
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <button
                        onClick={() => handleExpandRow(item.id)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <svg
                          className={`w-5 h-5 transition-transform ${
                            expandedItemId === item.id
                              ? "transform rotate-90"
                              : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          ></path>
                        </svg>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 mr-3">
                          {item.mediaType === "image" || item.imageUrl ? (
                            <img
                              className="h-10 w-10 rounded-sm object-cover"
                              src={item.mediaUrl || item.imageUrl}
                              alt=""
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-sm bg-gray-800 flex items-center justify-center">
                              <svg
                                className="h-6 w-6 text-white"
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
                            </div>
                          )}
                        </div>
                        <div>
                          {item.nombre ||
                            `Publicidad ${
                              item.tipo === "salon" ? "Salón" : "Directorio"
                            } ${item.id.substr(0, 4)}`}
                          {item.esParteDePlaylist && (
                            <span className="text-xs text-gray-500 ml-2 bg-gray-100 px-1 py-0.5 rounded">
                              En playlist
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.tipo === "salon"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {item.tipo === "salon" ? "Salón" : "Directorio"}
                        {item.tipoPantalla &&
                          item.tipoPantalla.length > 0 &&
                          ` (${item.tipoPantalla[0]})`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.horas > 0 && `${item.horas}h `}
                      {item.minutos > 0 && `${item.minutos}m `}
                      {`${item.segundos || 0}s`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          item.destino === "todas"
                            ? "bg-teal-100 text-teal-800"
                            : item.destino === "especificas"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.destino === "todas"
                          ? "Todas las pantallas"
                          : item.destino === "especificas"
                          ? `${item.pantallasAsignadas?.length || 0} pantallas`
                          : "Ninguna"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          item.mediaType === "image" || item.imageUrl
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        <svg
                          className="mr-1.5 h-2 w-2"
                          fill="currentColor"
                          viewBox="0 0 8 8"
                        >
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                        {item.mediaType === "image" || item.imageUrl
                          ? "Imagen"
                          : "Video"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex justify-center space-x-2">
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => onDelete(item.id)}
                          title="Eliminar"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            ></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedItemId === item.id && (
                    <tr className="bg-blue-50">
                      <td colSpan="7" className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-1">
                            <div className="overflow-hidden rounded-lg bg-white shadow">
                              <div className="p-4 flex items-center justify-center">
                                {item.mediaType === "image" || item.imageUrl ? (
                                  <img
                                    src={item.mediaUrl || item.imageUrl}
                                    alt={item.nombre}
                                    className="max-h-48 object-contain"
                                  />
                                ) : (
                                  <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                                    {/* Reemplazamos el video por una miniatura estática */}
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
                            </div>
                          </div>

                          <div className="md:col-span-2">
                            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                              <div className="px-4 py-3 sm:px-6 bg-gray-50">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                  Detalles de la publicidad
                                </h3>
                              </div>
                              <div className="border-t border-gray-200">
                                <dl>
                                  <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">
                                      Nombre
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                      {item.nombre ||
                                        `Publicidad ${
                                          item.tipo === "salon"
                                            ? "Salón"
                                            : "Directorio"
                                        } ${item.id.substr(0, 4)}`}
                                    </dd>
                                  </div>
                                  <div className="bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">
                                      Tipo
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                      {item.tipo === "salon"
                                        ? "Salón"
                                        : "Directorio"}
                                      {item.tipoPantalla &&
                                        item.tipoPantalla.length > 0 &&
                                        ` (${item.tipoPantalla[0]})`}
                                    </dd>
                                  </div>
                                  <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">
                                      Duración
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                      {item.horas > 0 &&
                                        `${item.horas} horas, `}
                                      {item.minutos > 0 &&
                                        `${item.minutos} minutos, `}
                                      {`${item.segundos || 0} segundos`}
                                    </dd>
                                  </div>
                                  <div className="bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">
                                      Destino
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                      {item.destino === "todas"
                                        ? "Todas las pantallas"
                                        : item.destino === "especificas"
                                        ? "Pantallas específicas"
                                        : "Ninguna (parte de playlist)"}

                                      {item.destino === "especificas" &&
                                        item.pantallasAsignadas &&
                                        item.pantallasAsignadas.length > 0 && (
                                          <div className="mt-1">
                                            <span className="text-xs font-medium text-gray-500">
                                              Pantallas asignadas:
                                            </span>
                                            <div className="mt-1 space-y-2">
                                              {item.pantallasAsignadas.map(
                                                (pantallaId, index) => {
                                                  // Obtener información de la pantalla
                                                  const pantallaInfo =
                                                    getNombrePantalla(
                                                      pantallaId,
                                                      item.tipo,
                                                      pantallas
                                                    );

                                                  return (
                                                    <div
                                                      key={`${pantallaId}-${index}`}
                                                      className="flex items-start"
                                                    >
                                                      <div className="ml-3 text-sm">
                                                        <span className="font-medium text-gray-700">
                                                          {pantallaInfo.nombre}
                                                        </span>
                                                        <p className="text-gray-500 text-xs">
                                                          {pantallaInfo.ubicacion &&
                                                            `Ubicación: ${pantallaInfo.ubicacion}`}
                                                          {pantallaInfo.orientacion &&
                                                            ` • ${
                                                              pantallaInfo.orientacion ===
                                                              "horizontal"
                                                                ? "Horizontal"
                                                                : "Vertical"
                                                            }`}
                                                        </p>
                                                      </div>
                                                    </div>
                                                  );
                                                }
                                              )}
                                            </div>
                                          </div>
                                        )}
                                    </dd>
                                  </div>
                                  <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">
                                      Formato
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                      {item.mediaType === "image" ||
                                      item.imageUrl
                                        ? "Imagen"
                                        : "Video"}
                                    </dd>
                                  </div>
                                  <div className="bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">
                                      Fecha de creación
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                      {item.fechaDeSubida
                                        ? new Date(
                                            item.fechaDeSubida.toMillis()
                                          ).toLocaleString()
                                        : "N/A"}
                                    </dd>
                                  </div>
                                </dl>
                              </div>
                              {/* <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                                <button
                                  type="button"
                                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 mr-2"
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDelete(item.id)}
                                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                  Eliminar
                                </button>
                              </div> */}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-10 text-center text-sm text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No se encontraron resultados
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No hay publicidades que coincidan con los criterios
                      seleccionados.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer con información */}
      <div className="px-4 py-3 border-t border-gray-200 sm:px-6">
        <div className="flex items-center justify-between flex-wrap sm:flex-nowrap">
          <div className="w-full sm:w-auto">
            <p className="text-sm text-gray-700">
              Mostrando{" "}
              <span className="font-medium">{filteredItems.length}</span> de{" "}
              <span className="font-medium">{publicidades.length}</span>{" "}
              publicidades
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default PublicidadList;
