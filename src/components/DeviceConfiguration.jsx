/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { updateDoc, doc, serverTimestamp } from "firebase/firestore";
import db from "@/firebase/firestore";
import Swal from "sweetalert2";
import {
  syncUserDataToDevices,
  updateDeviceConfiguration,
} from "@/utils/deviceManager";

const DeviceConfiguration = ({
  isOpen,
  onClose,
  device,
  userData,
  onConfigurationSaved,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedScreenType, setSelectedScreenType] = useState("");
  const [selectedScreenNumber, setSelectedScreenNumber] = useState(1);
  const [screenName, setScreenName] = useState("");
  const [orientation, setOrientation] = useState("landscape");
  const [autoStart, setAutoStart] = useState(true);

  // Debug para entender qué device está recibiendo
  useEffect(() => {
    if (device) {
      console.log("🔧 DeviceConfiguration recibió device:", device);
      console.log("🔧 Device ID:", device.id);
      console.log("🔧 Device Code:", device.code);
      console.log("🔧 Device DeviceId:", device.deviceId);
    }
  }, [device]);

  // Configuración inicial cuando se abre el modal
  useEffect(() => {
    if (isOpen && device) {
      const config = device.configuration;
      if (config) {
        setSelectedScreenType(config.screenType || "");
        setSelectedScreenNumber(config.screenNumber || 1);
        setScreenName(config.screenName || ""); // ← Cargar el nombre existente
        setOrientation(config.orientation || "landscape");
        setAutoStart(config.autoStart !== false);
      } else {
        // Resetear a valores por defecto
        setSelectedScreenType("");
        setSelectedScreenNumber(1);
        setScreenName(""); // ← Limpiar el campo de nombre
        setOrientation("landscape");
        setAutoStart(true);
      }
    }
  }, [isOpen, device]);

  // Obtener todas las pantallas (mostrando todas, algunas bloqueadas)
  const getAvailableScreenTypes = () => {
    if (!userData) return [];

    const screenTypes = [];

    // Pantallas Salón - BLOQUEADO TEMPORALMENTE
    screenTypes.push({
      type: "salon",
      name: "Pantallas Salón",
      description: "Para mostrar eventos individuales",
      maxScreens: parseInt(userData.ps) || 0,
      icon: "🎭",
      disabled: false, // BLOQUEADO
      disabledReason: "Próximamente disponible",
    });

    // Pantallas Directorio - BLOQUEADO TEMPORALMENTE
    screenTypes.push({
      type: "directorio",
      name: "Pantallas Directorio",
      description: "Para mostrar múltiples eventos del día",
      maxScreens: parseInt(userData.pd) || 0,
      icon: "📋",
      disabled: false, // BLOQUEADO
      disabledReason: "Próximamente disponible",
    });

    // Pantallas Tarifario - BLOQUEADO TEMPORALMENTE
    screenTypes.push({
      type: "tarifario",
      name: "Pantallas Tarifario",
      description: "Para mostrar información de tarifas hoteleras",
      maxScreens: parseInt(userData.pt) || 0,
      icon: "💰",
      disabled: false, // BLOQUEADO
      disabledReason: "Próximamente disponible",
    });

    // Pantallas Promociones - HABILITADO
    if (userData.pp > 0) {
      screenTypes.push({
        type: "promociones",
        name: "Pantallas Promociones",
        description: "Para mostrar contenido promocional",
        maxScreens: parseInt(userData.pp) || 0,
        icon: "📢",
        disabled: false, // HABILITADO
      });
    }

    // NUEVO: Pantallas Vuelos
    if (userData.pv > 0) {
      screenTypes.push({
        type: "vuelos",
        name: "Pantallas Vuelos",
        description: "Para mostrar información de vuelos",
        maxScreens: userData.pv,
        icon: "✈️",
        disabled: false, // HABILITADO
      });
    }

    return screenTypes;
  };

  // Obtener opciones de pantallas con sus nombres
  const getScreenOptions = () => {
    if (!selectedScreenType || !userData) return [];

    const selectedType = getAvailableScreenTypes().find(
      (type) => type.type === selectedScreenType
    );

    if (!selectedType || selectedType.disabled) return [];

    const screens = [];
    const maxScreens = selectedType.maxScreens;

    for (let i = 1; i <= maxScreens; i++) {
      const screenName = getScreenName(selectedScreenType, i);
      screens.push({
        number: i,
        name: screenName,
        displayText: `${i}. ${screenName}`,
      });
    }

    return screens;
  };

  // Obtener el nombre de la pantalla según tipo y número
  const getScreenName = (screenType, screenNumber) => {
    if (!userData || !screenType || !screenNumber)
      return `Pantalla ${screenNumber}`;

    const index = screenNumber - 1; // Los arrays empiezan en 0

    switch (screenType) {
      case "salon":
        return (
          userData.nombrePantallas?.[index] || `Pantalla Salón ${screenNumber}`
        );
      case "directorio":
        return (
          userData.nombrePantallasDirectorio?.[index] ||
          `Pantalla Directorio ${screenNumber}`
        );
      case "tarifario":
        return (
          userData.nombrePantallasTarifario?.[index] ||
          `Pantalla Tarifario ${screenNumber}`
        );
      case "promociones":
        return (
          userData.nombrePantallasPromociones?.[index] ||
          `Pantalla Promociones ${screenNumber}`
        );
      case "vuelos":
        return (
          userData.nombrePantallasVuelos?.[index] ||
          `Pantalla Vuelos ${screenNumber}`
        );
      default:
        return `Pantalla ${screenNumber}`;
    }
  };

  const getConfiguredScreenName = (screenType, screenNumber) => {
    if (!userData || !screenType || !screenNumber)
      return `Pantalla ${screenNumber}`;
    const index = screenNumber - 1;
    switch (screenType) {
      case "salon":
        return (
          userData.nombrePantallas?.[index] || `Pantalla Salón ${screenNumber}`
        );
      case "directorio":
        return (
          userData.nombrePantallasDirectorio?.[index] ||
          `Pantalla Directorio ${screenNumber}`
        );
      case "tarifario":
        return (
          userData.nombrePantallasTarifario?.[index] ||
          `Pantalla Tarifario ${screenNumber}`
        );
      case "promociones":
        return (
          userData.nombrePantallasPromociones?.[index] ||
          `Pantalla Promociones ${screenNumber}`
        );
      case "vuelos":
        return (
          userData.nombrePantallasVuelos?.[index] ||
          `Pantalla Vuelos ${screenNumber}`
        );
      default:
        return `Pantalla ${screenNumber}`;
    }
  };

  const handleRemoveConfiguration = async () => {
    if (!device || !device.id) {
      Swal.fire({
        icon: "error",
        title: "Error de dispositivo",
        text: "No se pudo identificar el dispositivo.",
      });
      return;
    }

    // Confirmar acción
    const result = await Swal.fire({
      title: "¿Quitar configuración?",
      html: `
        <p>¿Estás seguro que deseas quitar la configuración de este dispositivo?</p>
        <p class="text-sm text-gray-600 mt-2">El dispositivo volverá a la pantalla de espera.</p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, quitar configuración",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    setLoading(true);

    try {
      console.log(`🗑️ Quitando configuración del dispositivo ID: ${device.id}`);

      const deviceRef = doc(db, "devices", device.id);

      // Actualizar status a "linked" y remover configuración
      await updateDoc(deviceRef, {
        status: "linked",
        configuration: null,
        lastUpdated: serverTimestamp(),
      });

      console.log(
        `✅ Configuración removida del dispositivo ${device.code || device.id}`
      );

      Swal.fire({
        icon: "success",
        title: "Configuración eliminada",
        text: "El dispositivo ha vuelto a la pantalla de espera.",
        timer: 3000,
        showConfirmButton: false,
      });

      // Notificar al componente padre
      if (onConfigurationSaved) {
        onConfigurationSaved(device.code || device.id, null);
      }

      // Cerrar modal
      onClose();
    } catch (error) {
      console.error("❌ Error quitando configuración:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo quitar la configuración. Inténtalo de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfiguration = async () => {
    // Validaciones
    if (!selectedScreenType) {
      Swal.fire({
        icon: "error",
        title: "Tipo de pantalla requerido",
        text: "Por favor selecciona un tipo de pantalla.",
      });
      return;
    }

    if (!selectedScreenNumber) {
      Swal.fire({
        icon: "error",
        title: "Número de pantalla requerido",
        text: "Por favor selecciona una pantalla.",
      });
      return;
    }

    if (!device || !device.id) {
      Swal.fire({
        icon: "error",
        title: "Error de dispositivo",
        text: "No se pudo identificar el dispositivo. Inténtalo de nuevo.",
      });
      return;
    }

    setLoading(true);

    try {
      console.log(`🔧 Configurando dispositivo ID: ${device.id}`);

      // CORREGIDO: Usar el nombre del input o el nombre automático como fallback
      const finalScreenName =
        screenName.trim() ||
        getScreenName(selectedScreenType, selectedScreenNumber);

      // Preparar configuración
      const configuration = {
        screenType: selectedScreenType,
        screenNumber: selectedScreenNumber,
        screenName: finalScreenName, // ← AQUÍ ESTÁ LA CORRECCIÓN
        autoStart,
        configuredAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      };

      // Orientación removida - ya no se usa para directorio

      // 🆕 NUEVA ARQUITECTURA: Usar device.id en lugar de device.code
      const deviceRef = doc(db, "devices", device.id);
      console.log(`🔧 Actualizando documento: devices/${device.id}`);

      await updateDoc(deviceRef, {
        status: "configured",
        configuration,
        lastUpdated: serverTimestamp(),
      });

      // Sincronizar datos al dispositivo si es posible
      if (userData && device.ownerId) {
        try {
          await syncUserDataToDevices(device.ownerId, userData);
        } catch (syncError) {
          console.warn("⚠️ Error sincronizando userData:", syncError);
          // No fallar por este error
        }
      }

      console.log(
        `✅ Dispositivo ${device.code || device.id} configurado exitosamente`
      );

      // Mostrar mensaje de éxito
      Swal.fire({
        icon: "success",
        title: "Configuración guardada",
        text: `Dispositivo configurado correctamente como "${finalScreenName}"`,
        timer: 3000,
        showConfirmButton: false,
      });

      // Notificar al componente padre
      if (onConfigurationSaved) {
        onConfigurationSaved(device.code || device.id, configuration);
      }

      // Cerrar modal
      onClose();
    } catch (error) {
      console.error("❌ Error guardando configuración:", error);

      let errorMessage =
        "No se pudo guardar la configuración. Inténtalo de nuevo.";
      if (error.message.includes("No document to update")) {
        errorMessage =
          "El dispositivo no se encontró. Por favor, recarga la página e inténtalo de nuevo.";
      }

      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Si no hay dispositivo seleccionado, no mostrar el modal
  if (!device) {
    return null;
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium text-gray-900"
                  >
                    Configurar Dispositivo {device.code || device.deviceId}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="space-y-6">
                  {/* Tipo de pantalla */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Tipo de Pantalla
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {getAvailableScreenTypes().map((screenType) => (
                        <div
                          key={screenType.type}
                          className={`relative rounded-lg border p-4 transition-colors ${
                            screenType.disabled
                              ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                              : selectedScreenType === screenType.type
                              ? "border-blue-500 bg-blue-50 cursor-pointer"
                              : "border-gray-300 hover:border-gray-400 cursor-pointer"
                          }`}
                          onClick={() => {
                            if (!screenType.disabled) {
                              setSelectedScreenType(screenType.type);
                              setSelectedScreenNumber(1); // Reset al cambiar tipo
                            }
                          }}
                        >
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">
                              {screenType.icon}
                            </span>
                            <div className="flex-1">
                              <h4
                                className={`text-sm font-medium ${
                                  screenType.disabled
                                    ? "text-gray-400"
                                    : "text-gray-900"
                                }`}
                              >
                                {screenType.name}
                              </h4>
                              <p
                                className={`text-xs ${
                                  screenType.disabled
                                    ? "text-gray-400"
                                    : "text-gray-500"
                                }`}
                              >
                                {screenType.description}
                              </p>
                              <p
                                className={`text-xs mt-1 ${
                                  screenType.disabled
                                    ? "text-gray-400"
                                    : "text-blue-600"
                                }`}
                              >
                                {screenType.disabled
                                  ? screenType.disabledReason
                                  : `Disponibles: ${screenType.maxScreens}`}
                              </p>
                            </div>
                          </div>
                          {selectedScreenType === screenType.type &&
                            !screenType.disabled && (
                              <CheckIcon className="absolute top-2 right-2 h-5 w-5 text-blue-500" />
                            )}
                          {screenType.disabled && (
                            <div className="absolute top-2 right-2 text-gray-400">
                              🔒
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Selección de pantalla específica */}
                  {selectedScreenType &&
                    !getAvailableScreenTypes().find(
                      (t) => t.type === selectedScreenType
                    )?.disabled && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Seleccionar Pantalla
                        </label>
                        <select
                          value={selectedScreenNumber}
                          onChange={(e) =>
                            setSelectedScreenNumber(parseInt(e.target.value))
                          }
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                          {getScreenOptions().map((screen) => (
                            <option key={screen.number} value={screen.number}>
                              {screen.displayText}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          El nombre mostrado es el configurado en tu cuenta
                        </p>

                        {/* Campo de nombre personalizado */}
                        <div className="space-y-2 mt-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Nombre pantalla
                          </label>
                          <input
                            type="text"
                            value={screenName}
                            onChange={(e) => setScreenName(e.target.value)}
                            placeholder={getConfiguredScreenName(
                              selectedScreenType,
                              selectedScreenNumber
                            )}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            maxLength={50}
                          />
                          <p className="text-xs text-gray-500">
                            Nombre personalizado para identificar este
                            dispositivo
                          </p>
                        </div>
                      </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-8 flex justify-between items-center">
                  {/* Botón de quitar configuración - solo si hay configuración existente */}
                  {device.configuration && (
                    <button
                      type="button"
                      onClick={handleRemoveConfiguration}
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      🗑️ Quitar Configuración
                    </button>
                  )}

                  {/* Espacio flexible para empujar botones a la derecha cuando no hay configuración */}
                  {!device.configuration && <div></div>}

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      onClick={onClose}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveConfiguration}
                      disabled={
                        loading ||
                        !selectedScreenType ||
                        !selectedScreenNumber ||
                        getAvailableScreenTypes().find(
                          (t) => t.type === selectedScreenType
                        )?.disabled
                      }
                      className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        loading ||
                        !selectedScreenType ||
                        !selectedScreenNumber ||
                        getAvailableScreenTypes().find(
                          (t) => t.type === selectedScreenType
                        )?.disabled
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {loading ? (
                        <div className="flex items-center">
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
                        </div>
                      ) : (
                        "Guardar Configuración"
                      )}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DeviceConfiguration;
