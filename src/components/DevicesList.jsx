/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import { useDeviceSync } from "@/hook/useDeviceSync";
import { useAuthState } from "react-firebase-hooks/auth";
import auth from "@/firebase/auth";
import DeviceConfiguration from "./DeviceConfiguration";
import DeviceLinkingModal from "./DeviceLinkingModal"; // Importar el nuevo modal
import { deleteDevice } from "@/utils/deviceManager";
import {
  ComputerDesktopIcon,
  Cog6ToothIcon,
  SignalIcon,
  SignalSlashIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon, // Importar icono de plus para el botón
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon as ClockIconSolid,
} from "@heroicons/react/24/solid";
import Swal from "sweetalert2";

const DevicesList = () => {
  // ✅ Hook principal
  const { devices, userData, user, loading, stats } = useDeviceSync();

  // ✅ Fallback directo a Firebase Auth
  const [authUser, authLoading] = useAuthState(auth);

  // ✅ Usar el usuario que esté disponible
  const currentUser = user || authUser;

  const [selectedFilter, setSelectedFilter] = useState("all");
  const [configurationModalOpen, setConfigurationModalOpen] = useState(false);
  const [linkingModalOpen, setLinkingModalOpen] = useState(false); // Estado para el modal de vinculación
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [expandedDevices, setExpandedDevices] = useState(new Set());

  // ✅ Debug logging para entender el problema
  useEffect(() => {
    console.log("🔍 DevicesList Debug:", {
      user,
      userUid: user?.uid,
      authUser,
      authUserUid: authUser?.uid,
      currentUser,
      currentUserUid: currentUser?.uid,
      userData,
      userDataUid: userData?.uid,
      loading,
      authLoading,
      devices: devices.length,
    });
  }, [user, authUser, currentUser, userData, loading, authLoading, devices]);

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

  // ========== FUNCIONES PRINCIPALES ==========

  // 1. Función para abrir modal de configuración
  const handleConfigureDevice = (device) => {
    setSelectedDevice(device);
    setConfigurationModalOpen(true);
  };

  // 2. Función para eliminar dispositivo
  const handleDeleteDevice = async (deviceCode) => {
    // ✅ Debug logging
    console.log("🔍 Debug - handleDeleteDevice:", {
      user,
      userUid: user?.uid,
      authUser,
      authUserUid: authUser?.uid,
      currentUser,
      currentUserUid: currentUser?.uid,
      userData,
      userDataUid: userData?.uid,
    });

    // ✅ Validación de seguridad mejorada
    if (!currentUser) {
      console.error("❌ No currentUser object available");
      Swal.fire({
        icon: "error",
        title: "Error de autenticación",
        text: "Usuario no disponible. Por favor, recarga la página e inicia sesión nuevamente.",
      });
      return;
    }

    if (!currentUser.uid) {
      console.error("❌ CurrentUser object exists but no UID:", currentUser);
      Swal.fire({
        icon: "error",
        title: "Error de autenticación",
        text: "ID de usuario no disponible. Por favor, inicia sesión nuevamente.",
      });
      return;
    }

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
        inputPlaceholder: deviceCode,
        inputAttributes: {
          maxlength: 6,
          style: `
            text-align: center !important;
            font-size: 1.5rem !important;
            font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace !important;
            letter-spacing: 0.3em !important;
            font-weight: 600 !important;
            padding: 12px 16px !important;
            text-transform: uppercase !important;
          `,
        },
        inputValidator: (value) => {
          if (value !== deviceCode) {
            return "Debes escribir el código del dispositivo correctamente";
          }
        },
        customClass: {
          input: "swal2-input-custom",
        },
      });

      if (result.isConfirmed) {
        // ✅ Validación final antes de eliminar
        console.log("🎯 About to delete device:", {
          deviceCode,
          userId: currentUser.uid,
          userObject: currentUser,
        });

        await deleteDevice(deviceCode, currentUser.uid);

        Swal.fire({
          icon: "success",
          title: "Dispositivo eliminado",
          text: "El dispositivo ha sido eliminado permanentemente.",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("❌ Error eliminando dispositivo:", error);
      console.error("❌ Error details:", {
        deviceCode,
        userId: currentUser?.uid,
        errorMessage: error.message,
        errorStack: error.stack,
      });

      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo eliminar el dispositivo.",
      });
    }
  };

  // 3. Función para expandir/contraer información del dispositivo
  const toggleDeviceExpansion = (deviceCode) => {
    const newExpanded = new Set(expandedDevices);
    if (newExpanded.has(deviceCode)) {
      newExpanded.delete(deviceCode);
    } else {
      newExpanded.add(deviceCode);
    }
    setExpandedDevices(newExpanded);
  };

  // 4. Función para manejar dispositivos vinculados exitosamente
  const handleDeviceLinked = (deviceCode, userData) => {
    console.log(`Dispositivo ${deviceCode} vinculado correctamente:`, userData);
    // El hook useDeviceSync automáticamente actualizará la lista
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

  // Estados de loading y error
  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ✅ Validación adicional de autenticación
  if (!loading && !authLoading && !currentUser) {
    return (
      <div className="text-center py-12">
        <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Error de autenticación
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          No se pudo verificar tu identidad. Por favor, recarga la página o
          inicia sesión nuevamente.
        </p>
        <div className="mt-4">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Recargar página
          </button>
        </div>
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
              Módulo de gestión de pantallas
            </h1>
            <p className="text-gray-600">Administra Dispositivos TVBox</p>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        {devices.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <SignalIcon className="h-5 w-5 text-green-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-900">En línea</p>
                  <p className="text-lg font-semibold text-green-700">
                    {stats.online}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-5 w-5 text-blue-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-900">
                    Configurados
                  </p>
                  <p className="text-lg font-semibold text-blue-700">
                    {stats.linked}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIconSolid className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-900">
                    Esperando
                  </p>
                  <p className="text-lg font-semibold text-yellow-700">
                    {stats.waiting}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ComputerDesktopIcon className="h-5 w-5 text-gray-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Total</p>
                  <p className="text-lg font-semibold text-gray-700">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de dispositivos */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Dispositivos ({filteredDevices.length})
          </h3>
          <button
            onClick={() => setLinkingModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-colors duration-200"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Agregar Pantalla
          </button>
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

                  {/* BOTONES DE ACCIÓN */}
                  <div className="flex items-center space-x-2">
                    {/* 1. Botón para ver más información */}
                    <button
                      onClick={() => toggleDeviceExpansion(device.code)}
                      className="p-2 text-gray-600 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors duration-200"
                      title="Ver más información"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>

                    {/* 2. Botón de configuración */}
                    <button
                      onClick={() => handleConfigureDevice(device)}
                      className="p-2 text-blue-600 hover:text-blue-800 rounded-md hover:bg-blue-50 transition-colors duration-200"
                      title="Configurar dispositivo"
                    >
                      <Cog6ToothIcon className="h-5 w-5" />
                    </button>

                    {/* 3. Botón de eliminar */}
                    <button
                      onClick={() => handleDeleteDevice(device.code)}
                      className={`p-2 rounded-md transition-colors duration-200 ${
                        !currentUser?.uid
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-red-600 hover:text-red-800 hover:bg-red-50"
                      }`}
                      title={
                        !currentUser?.uid
                          ? "Usuario no autenticado"
                          : "Eliminar dispositivo"
                      }
                      disabled={!currentUser?.uid} // ✅ Deshabilitar si no hay usuario
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

      {/* Modal de vinculación de dispositivos */}
      <DeviceLinkingModal
        isOpen={linkingModalOpen}
        onClose={() => setLinkingModalOpen(false)}
        onDeviceLinked={handleDeviceLinked}
      />
    </div>
  );
};

export default DevicesList;
