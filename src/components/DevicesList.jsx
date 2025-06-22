/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import { useDeviceSync } from "@/hook/useDeviceSync";
import { useAuthState } from "react-firebase-hooks/auth";
import auth from "@/firebase/auth";
import DeviceConfiguration from "./DeviceConfiguration";
import DeviceLinkingModal from "./DeviceLinkingModal";
import { deleteDevice } from "@/utils/deviceManager";
import {
  ComputerDesktopIcon,
  Cog6ToothIcon,
  SignalIcon,
  SignalSlashIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon as ClockIconSolid,
} from "@heroicons/react/24/solid";
import Swal from "sweetalert2";

const DevicesList = () => {
  // ✅ Hook principal - mantener el useDeviceSync existente
  const { devices, userData, user, loading, stats } = useDeviceSync();

  // ✅ Fallback directo a Firebase Auth
  const [authUser, authLoading] = useAuthState(auth);

  // ✅ Usar el usuario que esté disponible
  const currentUser = user || authUser;

  const [selectedFilter, setSelectedFilter] = useState("all");
  const [configurationModalOpen, setConfigurationModalOpen] = useState(false);
  const [linkingModalOpen, setLinkingModalOpen] = useState(false); // 🆕 Modal de vinculación
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
          : "Inactivo";
      case "configured":
        return "Configurado";
      case "linked":
        return "Vinculado";
      case "waiting":
        return "Esperando";
      case "offline":
      default:
        return "Sin conexión";
    }
  };

  // Función para obtener el icono del estado
  const getStatusIcon = (status, lastSeen) => {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    const lastSeenTime = lastSeen?.toDate?.() || new Date(lastSeen || 0);

    const iconClass = "h-4 w-4";

    switch (status) {
      case "online":
        return lastSeenTime.getTime() > fiveMinutesAgo ? (
          <CheckCircleIcon className={`${iconClass} text-green-500`} />
        ) : (
          <ClockIconSolid className={`${iconClass} text-yellow-500`} />
        );
      case "configured":
      case "linked":
        return <CheckCircleIcon className={`${iconClass} text-blue-500`} />;
      case "waiting":
        return <ClockIconSolid className={`${iconClass} text-yellow-500`} />;
      case "offline":
      default:
        return (
          <ExclamationCircleIcon className={`${iconClass} text-red-500`} />
        );
    }
  };

  // Obtener icono para tipo de pantalla
  const getScreenTypeIcon = (screenType) => {
    switch (screenType) {
      case "salon":
        return "";
      case "directorio":
        return "";
      case "tarifario":
        return "";
      default:
        return "";
    }
  };

  // Formatear fecha
  const formatDate = (date) => {
    if (!date) return "No disponible";
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filtrar dispositivos
  const filteredDevices = devices.filter((device) => {
    switch (selectedFilter) {
      case "online":
        return device.status === "online";
      case "configured":
        return device.status === "configured";
      case "linked":
        return device.status === "linked";
      case "offline":
        return device.status === "offline" || !device.status;
      default:
        return true;
    }
  });

  // Usar estadísticas del hook
  const deviceStats = stats || {
    total: devices.length,
    online: devices.filter((d) => d.status === "online").length,
    configured: devices.filter((d) => d.status === "configured").length,
    linked: devices.filter((d) => d.status === "linked").length,
    offline: devices.filter((d) => d.status === "offline" || !d.status).length,
  };

  // Manejar eliminación de dispositivo
  const handleDeleteDevice = async (device) => {
    const result = await Swal.fire({
      title: "¿Eliminar dispositivo?",
      text: `¿Estás seguro de que quieres eliminar el dispositivo ${
        device.code || device.id
      }? Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await deleteDevice(device.id, currentUser.uid);
        Swal.fire({
          icon: "success",
          title: "Dispositivo eliminado",
          text: "El dispositivo ha sido eliminado exitosamente.",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error eliminando dispositivo:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo eliminar el dispositivo. Inténtalo de nuevo.",
        });
      }
    }
  };

  // Toggle expanded device
  const toggleExpanded = (deviceId) => {
    const newExpanded = new Set(expandedDevices);
    if (newExpanded.has(deviceId)) {
      newExpanded.delete(deviceId);
    } else {
      newExpanded.add(deviceId);
    }
    setExpandedDevices(newExpanded);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dispositivos Android TV
            </h1>
            <p className="text-gray-600 mt-1">
              Gestiona todos tus dispositivos Android TV Box conectados
            </p>
          </div>
          <button
            onClick={() => setLinkingModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Vincular Dispositivo
          </button>
        </div>
      </div>

      {/* Lista de dispositivos */}
      <div className="space-y-6">
        {filteredDevices.length === 0 ? (
          <div className="text-center py-12">
            <ComputerDesktopIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {devices.length === 0
                ? "No hay dispositivos vinculados"
                : "No hay dispositivos con este filtro"}
            </h3>
            <p className="text-gray-600 mb-6">
              {devices.length === 0
                ? "Vincula tu primer dispositivo Android TV para comenzar"
                : "Cambia los filtros para ver otros dispositivos"}
            </p>
            {devices.length === 0 && (
              <button
                onClick={() => setLinkingModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Vincular Primer Dispositivo
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredDevices.map((device) => (
              <div
                key={device.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {device.configuration ? (
                          <span className="text-lg">
                            {getScreenTypeIcon(device.configuration.screenType)}
                          </span>
                        ) : (
                          <ComputerDesktopIcon className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-lg font-medium text-gray-900 font-mono">
                            {device.code || device.deviceId}
                          </h4>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(device.status, device.lastSeen)}
                            <span
                              className={`text-sm font-medium ${
                                getStatusColor(
                                  device.status,
                                  device.lastSeen
                                ) === "green"
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
                            <span>
                              {device.configuration.screenType === "salon"
                                ? "Salón"
                                : device.configuration.screenType ===
                                  "directorio"
                                ? "Directorio"
                                : "Tarifario"}
                            </span>
                          ) : (
                            <span>⚙️ No configurado</span>
                          )}
                          <span>🔗 {formatDate(device.linkedAt)}</span>
                          {device.lastSeen && (
                            <span>👁️ {formatDate(device.lastSeen)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleExpanded(device.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
                        title="Ver detalles"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>

                      {/* Siempre mostrar botón de configurar */}
                      <button
                        onClick={() => {
                          setSelectedDevice(device);
                          setConfigurationModalOpen(true);
                        }}
                        className="p-2 text-blue-600 hover:text-blue-800 rounded-md"
                        title="Configurar dispositivo"
                      >
                        <Cog6ToothIcon className="h-5 w-5" />
                      </button>

                      {/* Botón de eliminar */}
                      <button
                        onClick={() => handleDeleteDevice(device)}
                        className="p-2 text-red-600 hover:text-red-800 rounded-md"
                        title="Eliminar dispositivo"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Detalles expandidos */}
                  {expandedDevices.has(device.id) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">
                            ID del dispositivo:
                          </span>
                          <span className="ml-2 text-gray-900 font-mono">
                            {device.deviceId}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Propietario:
                          </span>
                          <span className="ml-2 text-gray-900">
                            {device.ownerEmail}
                          </span>
                        </div>
                        {device.deviceInfo && (
                          <>
                            <div>
                              <span className="font-medium text-gray-700">
                                Plataforma:
                              </span>
                              <span className="ml-2 text-gray-900">
                                {device.deviceInfo.platform || "Android"}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Versión App:
                              </span>
                              <span className="ml-2 text-gray-900">
                                {device.deviceInfo.appVersion || "1.0.0"}
                              </span>
                            </div>
                          </>
                        )}
                        {device.configuration && (
                          <>
                            <div>
                              <span className="font-medium text-gray-700">
                                Configurado:
                              </span>
                              <span className="ml-2 text-gray-900">
                                {formatDate(device.configuration.configuredAt)}
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
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
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

      {/* Modal de vinculación */}
      <DeviceLinkingModal
        isOpen={linkingModalOpen}
        onClose={() => setLinkingModalOpen(false)}
        onDeviceLinked={(code, userData, deviceId) => {
          console.log(`Dispositivo ${code} vinculado con ID: ${deviceId}`);
          setLinkingModalOpen(false);
          // El hook useDeviceSync automáticamente actualizará la lista
        }}
      />
    </div>
  );
};

export default DevicesList;
