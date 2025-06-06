/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import { useDeviceSync } from "@/hook/useDeviceSync";
import DeviceConfiguration from "./DeviceConfiguration";
import {
  unlinkDevice,
  deleteDevice,
  updateDeviceHeartbeat,
  syncUserDataToDevices,
} from "@/utils/deviceManager";
import {
  ComputerDesktopIcon,
  Cog6ToothIcon,
  SignalIcon,
  SignalSlashIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  TrashIcon,
  LinkIcon,
  EyeIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon as ClockIconSolid,
} from "@heroicons/react/24/solid";
import Swal from "sweetalert2";

const DevicesList = () => {
  const { devices, userData, loading, syncing, forceSyncDevices, stats } =
    useDeviceSync();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [configurationModalOpen, setConfigurationModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [expandedDevices, setExpandedDevices] = useState(new Set());

  // Función para obtener el color del estado
  const getStatusColor = (status, lastSeen) => {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    const lastSeenTime = lastSeen?.toDate?.() || new Date(lastSeen || 0);

    switch (status) {
      case "online":
        return lastSeenTime.getTime() > fiveMinutesAgo ? "green" : "yellow";
      case "configured":
      case "linked":
        return "blue";
      case "waiting":
        return "yellow";
      case "offline":
      default:
        return "red";
    }
  };

  // Función para obtener el texto del estado
  const getStatusText = (status, lastSeen) => {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    const lastSeenTime = lastSeen?.toDate?.() || new Date(lastSeen || 0);

    switch (status) {
      case "online":
        return lastSeenTime.getTime() > fiveMinutesAgo
          ? "En línea"
          : "Desconectado";
      case "configured":
        return "Configurado";
      case "linked":
        return "Vinculado";
      case "waiting":
        return "Esperando";
      case "offline":
        return "Sin conexión";
      default:
        return "Desconocido";
    }
  };

  // Función para obtener el icono del estado
  const getStatusIcon = (status, lastSeen) => {
    const color = getStatusColor(status, lastSeen);
    const className = `h-5 w-5 ${
      color === "green"
        ? "text-green-500"
        : color === "blue"
        ? "text-blue-500"
        : color === "yellow"
        ? "text-yellow-500"
        : "text-red-500"
    }`;

    if (status === "online") {
      return <SignalIcon className={className} />;
    } else if (status === "configured") {
      return <CheckCircleIcon className={className} />;
    } else if (status === "waiting") {
      return <ClockIconSolid className={className} />;
    } else {
      return <SignalSlashIcon className={className} />;
    }
  };

  // Función para obtener el icono del tipo de pantalla
  const getScreenTypeIcon = (screenType) => {
    switch (screenType) {
      case "salon":
        return "🎭";
      case "directorio":
        return "📋";
      case "tarifario":
        return "💰";
      case "promociones":
        return "📢";
      default:
        return "📺";
    }
  };

  // Filtrar dispositivos según el filtro seleccionado
  const filteredDevices = devices.filter((device) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "online") {
      const now = Date.now();
      const fiveMinutesAgo = now - 5 * 60 * 1000;
      const lastSeenTime =
        device.lastSeen?.toDate?.() || new Date(device.lastSeen || 0);
      return (
        device.status === "online" && lastSeenTime.getTime() > fiveMinutesAgo
      );
    }
    return device.status === selectedFilter;
  });

  // Función para abrir modal de configuración
  const handleConfigureDevice = (device) => {
    setSelectedDevice(device);
    setConfigurationModalOpen(true);
  };

  // Función para reiniciar dispositivo (forzar reconexión)
  const handleRestartDevice = async (deviceCode) => {
    try {
      const result = await Swal.fire({
        title: "¿Reiniciar dispositivo?",
        text: "Esto enviará una señal al dispositivo para que se reconecte.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, reiniciar",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {
        await updateDeviceHeartbeat(deviceCode, { restartRequested: true });

        Swal.fire({
          icon: "success",
          title: "Señal enviada",
          text: "Se ha enviado la señal de reinicio al dispositivo.",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error reiniciando dispositivo:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo enviar la señal de reinicio.",
      });
    }
  };

  // Función para desvincular dispositivo
  const handleUnlinkDevice = async (deviceCode) => {
    try {
      const result = await Swal.fire({
        title: "¿Desvincular dispositivo?",
        text: "El dispositivo volverá al estado de espera y deberá vincularse nuevamente.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, desvincular",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {
        await unlinkDevice(deviceCode, userData.uid);

        Swal.fire({
          icon: "success",
          title: "Dispositivo desvinculado",
          text: "El dispositivo ha sido desvinculado correctamente.",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error desvinculando dispositivo:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo desvincular el dispositivo.",
      });
    }
  };

  // Función para eliminar dispositivo
  const handleDeleteDevice = async (deviceCode) => {
    try {
      const result = await Swal.fire({
        title: "¿Eliminar dispositivo?",
        text: "Esta acción no se puede deshacer. El dispositivo será eliminado permanentemente.",
        icon: "error",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        input: "text",
        inputPlaceholder: `Escribe "${deviceCode}" para confirmar`,
        inputValidator: (value) => {
          if (value !== deviceCode) {
            return "Debes escribir el código del dispositivo correctamente";
          }
        },
      });

      if (result.isConfirmed) {
        await deleteDevice(deviceCode, userData.uid);

        Swal.fire({
          icon: "success",
          title: "Dispositivo eliminado",
          text: "El dispositivo ha sido eliminado permanentemente.",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error eliminando dispositivo:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo eliminar el dispositivo.",
      });
    }
  };

  // Función para expandir/contraer información del dispositivo
  const toggleDeviceExpansion = (deviceCode) => {
    const newExpanded = new Set(expandedDevices);
    if (newExpanded.has(deviceCode)) {
      newExpanded.delete(deviceCode);
    } else {
      newExpanded.add(deviceCode);
    }
    setExpandedDevices(newExpanded);
  };

  // Función para formatear fecha
  const formatDate = (timestamp) => {
    if (!timestamp) return "Nunca";
    const date = timestamp.toDate?.() || new Date(timestamp);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Función para calcular tiempo transcurrido
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "Nunca";
    const now = Date.now();
    const time = timestamp.toDate?.() || new Date(timestamp);
    const diffMs = now - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Ahora mismo";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffMins < 1440) return `Hace ${Math.floor(diffMins / 60)} h`;
    return `Hace ${Math.floor(diffMins / 1440)} días`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Mis Pantallas TV
            </h1>
            <p className="text-gray-600">
              Gestiona y monitorea tus dispositivos Android TV
            </p>
          </div>
          <button
            onClick={forceSyncDevices}
            disabled={syncing}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
              syncing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <ArrowPathIcon
              className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`}
            />
            {syncing ? "Sincronizando..." : "Sincronizar"}
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ComputerDesktopIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.total}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    En Línea
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.online}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Sin Conexión
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.offline}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIconSolid className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Esperando
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.waiting}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 bg-blue-400 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">%</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Conectividad
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.onlinePercentage}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Filtrar dispositivos
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "Todos", count: stats.total },
            { key: "online", label: "En línea", count: stats.online },
            { key: "configured", label: "Configurados", count: stats.linked },
            { key: "waiting", label: "Esperando", count: stats.waiting },
            { key: "offline", label: "Sin conexión", count: stats.offline },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setSelectedFilter(filter.key)}
              className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${
                selectedFilter === filter.key
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              {filter.label}
              <span className="ml-2 bg-white rounded-full px-2 py-0.5 text-xs">
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista de dispositivos */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Dispositivos ({filteredDevices.length})
          </h3>
        </div>

        {filteredDevices.length === 0 ? (
          <div className="text-center py-12">
            <ComputerDesktopIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No hay dispositivos
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedFilter === "all"
                ? "Aún no tienes dispositivos vinculados."
                : `No hay dispositivos con estado "${selectedFilter}".`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredDevices.map((device) => (
              <div key={device.code} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {device.configuration?.screenType ? (
                          <span className="text-lg">
                            {getScreenTypeIcon(device.configuration.screenType)}
                          </span>
                        ) : (
                          <ComputerDesktopIcon className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-lg font-medium text-gray-900 font-mono">
                          {device.code}
                        </h4>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(device.status, device.lastSeen)}
                          <span
                            className={`text-sm font-medium ${
                              getStatusColor(device.status, device.lastSeen) ===
                              "green"
                                ? "text-green-700"
                                : getStatusColor(
                                    device.status,
                                    device.lastSeen
                                  ) === "blue"
                                ? "text-blue-700"
                                : getStatusColor(
                                    device.status,
                                    device.lastSeen
                                  ) === "yellow"
                                ? "text-yellow-700"
                                : "text-red-700"
                            }`}
                          >
                            {getStatusText(device.status, device.lastSeen)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        {device.configuration ? (
                          <>
                            <span className="font-medium">
                              {device.configuration.screenName}
                            </span>
                            <span>•</span>
                            <span className="capitalize">
                              {device.configuration.screenType} #
                              {device.configuration.screenNumber}
                            </span>
                            {device.configuration.orientation && (
                              <>
                                <span>•</span>
                                <span className="capitalize">
                                  {device.configuration.orientation}
                                </span>
                              </>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400">Sin configurar</span>
                        )}
                        <span>•</span>
                        <span>Vinculado: {formatDate(device.linkedAt)}</span>
                        {device.lastSeen && (
                          <>
                            <span>•</span>
                            <span>
                              Última actividad: {getTimeAgo(device.lastSeen)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Botón para expandir información */}
                    <button
                      onClick={() => toggleDeviceExpansion(device.code)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                      title="Ver más información"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>

                    {/* Botón de configuración */}
                    <button
                      onClick={() => handleConfigureDevice(device)}
                      className="p-2 text-blue-600 hover:text-blue-800 rounded-md hover:bg-blue-50"
                      title="Configurar dispositivo"
                    >
                      <Cog6ToothIcon className="h-5 w-5" />
                    </button>

                    {/* Botón de reiniciar */}
                    <button
                      onClick={() => handleRestartDevice(device.code)}
                      className="p-2 text-green-600 hover:text-green-800 rounded-md hover:bg-green-50"
                      title="Reiniciar dispositivo"
                    >
                      <ArrowPathIcon className="h-5 w-5" />
                    </button>

                    {/* Botón de desvincular */}
                    <button
                      onClick={() => handleUnlinkDevice(device.code)}
                      className="p-2 text-yellow-600 hover:text-yellow-800 rounded-md hover:bg-yellow-50"
                      title="Desvincular dispositivo"
                    >
                      <LinkIcon className="h-5 w-5" />
                    </button>

                    {/* Botón de eliminar */}
                    <button
                      onClick={() => handleDeleteDevice(device.code)}
                      className="p-2 text-red-600 hover:text-red-800 rounded-md hover:bg-red-50"
                      title="Eliminar dispositivo"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Información expandida */}
                {expandedDevices.has(device.code) && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-3">
                      Información Técnica
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">
                          Plataforma:
                        </span>
                        <span className="ml-2 text-gray-900">
                          {device.deviceInfo?.platform || "Android"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Versión App:
                        </span>
                        <span className="ml-2 text-gray-900">
                          {device.deviceInfo?.appVersion || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Resolución:
                        </span>
                        <span className="ml-2 text-gray-900">
                          {device.deviceInfo?.screenResolution || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Auto-inicio:
                        </span>
                        <span className="ml-2 text-gray-900">
                          {device.configuration?.autoStart
                            ? "Habilitado"
                            : "Deshabilitado"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Configurado:
                        </span>
                        <span className="ml-2 text-gray-900">
                          {formatDate(device.configuration?.configuredAt)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Última actualización:
                        </span>
                        <span className="ml-2 text-gray-900">
                          {formatDate(device.lastUpdated)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de configuración */}
      <DeviceConfiguration
        isOpen={configurationModalOpen}
        onClose={() => {
          setConfigurationModalOpen(false);
          setSelectedDevice(null);
        }}
        device={selectedDevice}
        userData={userData}
        onConfigurationSaved={(deviceCode, config) => {
          console.log(`Dispositivo ${deviceCode} configurado:`, config);
        }}
      />
    </div>
  );
};

export default DevicesList;
