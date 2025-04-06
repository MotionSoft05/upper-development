import React, { useState } from "react";

function PlaylistManager({
  playlists,
  pantallas,
  onEdit,
  onDelete,
  setActiveTab,
  setCreatePlaylistMode,
  resetForm,
  t,
}) {
  const [playlistExpandedId, setPlaylistExpandedId] = useState(null);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Playlists (En desarrollo, no disponible)
        </h2>
        <button
          onClick={() => {
            resetForm();
            setCreatePlaylistMode(true);
            setActiveTab("crear");
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <svg
            className="mr-2 -ml-1 h-5 w-5"
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
          Crear Playlist
        </button>
      </div>

      {playlists.length > 0 ? (
        <div className="space-y-6">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="bg-white border rounded-lg shadow-sm overflow-hidden"
            >
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <div className="flex items-center">
                  <button
                    onClick={() =>
                      setPlaylistExpandedId(
                        playlistExpandedId === playlist.id ? null : playlist.id
                      )
                    }
                    className="text-gray-400 hover:text-gray-500 mr-2"
                  >
                    <svg
                      className={`w-5 h-5 transition-transform ${
                        playlistExpandedId === playlist.id
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
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {playlist.nombre}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {playlist.elementos?.length || 0} elementos •
                      <span
                        className={`ml-1 ${
                          playlist.tipo === "salon"
                            ? "text-purple-600"
                            : "text-green-600"
                        }`}
                      >
                        {playlist.tipo === "salon" ? "Salón" : "Directorio"}
                        {playlist.tipoPantalla &&
                          playlist.tipoPantalla.length > 0 &&
                          ` (${playlist.tipoPantalla[0]})`}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(playlist)}
                    className="text-yellow-600 hover:text-yellow-800 p-1"
                    title="Editar"
                  >
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(playlist.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Eliminar"
                  >
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {playlistExpandedId === playlist.id && (
                <div className="p-4">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Destino:
                    </h4>
                    <p className="text-sm text-gray-800">
                      {playlist.destino === "todas"
                        ? "Todas las pantallas"
                        : playlist.destino === "especificas"
                        ? "Pantallas específicas"
                        : "Ninguna"}

                      {playlist.destino === "especificas" &&
                        playlist.pantallasAsignadas &&
                        playlist.pantallasAsignadas.length > 0 && (
                          <div className="mt-1">
                            <span className="text-xs font-medium text-gray-500">
                              Pantallas asignadas:
                            </span>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {playlist.pantallasAsignadas.map((pantallaId) => {
                                const pantalla = pantallas.find(
                                  (p) => p.id === pantallaId
                                );
                                return (
                                  <span
                                    key={pantallaId}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                  >
                                    {pantalla ? pantalla.nombre : pantallaId}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                    </p>
                  </div>

                  {playlist.descripcion && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Descripción:
                      </h4>
                      <p className="text-sm text-gray-800">
                        {playlist.descripcion}
                      </p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Elementos:
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {playlist.elementos?.map((elemento, index) => (
                        <div
                          key={index}
                          className="border rounded-md overflow-hidden bg-gray-50"
                        >
                          <div className="aspect-video relative bg-gray-200">
                            {elemento.publicidad?.mediaUrl ? (
                              elemento.publicidad.mediaType === "image" ? (
                                <img
                                  src={elemento.publicidad.mediaUrl}
                                  alt={
                                    elemento.publicidad.nombre ||
                                    `Elemento ${index + 1}`
                                  }
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-black">
                                  <svg
                                    className="h-8 w-8 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    />
                                  </svg>
                                </div>
                              )
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg
                                  className="h-8 w-8 text-gray-400"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            )}
                            <div className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
                              {elemento.duracion || 10}s
                            </div>
                          </div>
                          <div className="p-2">
                            <p className="text-xs font-medium truncate">
                              {elemento.publicidad?.nombre ||
                                `Elemento ${index + 1}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              Orden: {elemento.orden || index + 1}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 10h16M4 14h16M4 18h16"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No hay playlists
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Comience creando una nueva playlist para organizar sus publicidades.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setCreatePlaylistMode(true);
                setActiveTab("crear");
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Crear nueva playlist
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlaylistManager;
