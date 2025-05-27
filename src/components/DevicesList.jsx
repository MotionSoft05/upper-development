// src/components/DevicesList.jsx
import React, { useState } from "react";
import { useDeviceSync } from "@/hook/useDeviceSync";
import { unlinkDevice, deleteDevice } from "@/utils/deviceManager";
import DeviceCard from "./DeviceCard";

const DevicesList = () => {
  const {
    devices,
    loading,
    error,
    user,
    stats,
    hasDevices,
    syncing,
    forceSyncDevices,
    getDevicesByStatus,
    getDevicesNeedingAttention,
  } = useDeviceSync();

  const [filter, setFilter] = useState("all"); // all, online, offline, waiting
  const [sortBy, setSortBy] = useState("lastSeen"); // lastSeen, name, status
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Filtrar dispositivos según el filtro seleccionado
  const getFilteredDevices = () => {
    let filtered = devices;

    if (filter !== "all") {
      filtered = getDevicesByStatus(filter);
    }

    // Ordenar dispositivos
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "lastSeen":
          const aTime = a.lastSeen
            ? a.lastSeen.toDate?.() || new Date(a.lastSeen)
            : new Date(0);
          const bTime = b.lastSeen
            ? b.lastSeen.toDate?.() || new Date(b.lastSeen)
            : new Date(0);
          return bTime.getTime() - aTime.getTime();
        case "name":
          return a.code.localeCompare(b.code);
        case "status":
          const statusOrder = { online: 0, linked: 1, offline: 2, waiting: 3 };
          return (statusOrder[a.status] || 4) - (statusOrder[b.status] || 4);
        default:
          return 0;
      }
    });
  };

  const handleUnlinkDevice = async (deviceCode) => {
    try {
      await unlinkDevice(deviceCode, user.uid);
      console.log(`Dispositivo ${deviceCode} desvinculado`);
    } catch (error) {
      console.error("Error desvinculando dispositivo:", error);
      alert("Error al desvincular el dispositivo: " + error.message);
    }
  };

  const handleDeleteDevice = async (deviceCode) => {
    try {
      await deleteDevice(deviceCode, user.uid);
      console.log(`Dispositivo ${deviceCode} eliminado`);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error eliminando dispositivo:", error);
      alert("Error al eliminar el dispositivo: " + error.message);
    }
  };

  const devicesNeedingAttention = getDevicesNeedingAttention();
  const filteredDevices = getFilteredDevices();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Cargando dispositivos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex">
          <svg
            className="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error cargando dispositivos
            </h3>
            <p className="text-sm text-red-700 mt-2">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header con estadísticas */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mis Pantallas</h1>
            <p className="text-gray-600 mt-1">
              Gestiona y monitorea tus dispositivos Android TV
            </p>
          </div>

          {syncing && (
            <div className="flex items-center mt-4 md:mt-0 text-indigo-600">
              <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Sincronizando...
            </div>
          )}
        </div>

        {/* Estadísticas */}
        {hasDevices && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-md bg-indigo-50">
                  <svg
                    className="h-6 w-6 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-md bg-green-50">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">En Línea</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.online}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stats.onlinePercentage}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-md bg-red-50">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Sin Conexión
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.offline}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-md bg-yellow-50">
                  <svg
                    className="h-6 w-6 text-yellow-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Esperando</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.waiting}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alertas */}
        {devicesNeedingAttention.length > 0 && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  {devicesNeedingAttention.length} dispositivo(s) necesitan
                  atención
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Algunos dispositivos no han reportado su estado recientemente.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controles de filtrado y ordenamiento */}
      {hasDevices && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex space-x-4">
            {/* Filtros */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">Todos ({stats.total})</option>
              <option value="online">En línea ({stats.online})</option>
              <option value="offline">Sin conexión ({stats.offline})</option>
              <option value="waiting">Esperando ({stats.waiting})</option>
            </select>

            {/* Ordenamiento */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="lastSeen">Última conexión</option>
              <option value="name">Código</option>
              <option value="status">Estado</option>
            </select>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={forceSyncDevices}
              disabled={syncing}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <svg
                className={`-ml-0.5 mr-2 h-4 w-4 ${
                  syncing ? "animate-spin" : ""
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
              {syncing ? "Sincronizando..." : "Sincronizar"}
            </button>
          </div>
        </div>
      )}

      {/* Lista de dispositivos */}
      {!hasDevices ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No hay dispositivos
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Comienza vinculando tu primera pantalla Android TV.
          </p>
        </div>
      ) : filteredDevices.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No hay dispositivos que coincidan con el filtro seleccionado.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onUnlink={() => handleUnlinkDevice(device.code)}
              onDelete={() => setShowDeleteConfirm(device.code)}
              onConfigure={() => {
                // TODO: Implementar configuración individual
                console.log("Configurar dispositivo:", device.code);
              }}
            />
          ))}
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.1 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">
                ¿Eliminar dispositivo?
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  ¿Estás seguro de que quieres eliminar el dispositivo{" "}
                  <strong>{showDeleteConfirm}</strong>? Esta acción no se puede
                  deshacer.
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteDevice(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevicesList;
