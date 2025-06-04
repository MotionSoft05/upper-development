/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { updateDoc, doc, serverTimestamp } from "firebase/firestore";
import db from "@/firebase/firestore";
import Swal from "sweetalert2";
import { syncUserDataToDevices } from "@/utils/deviceManager";

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

  // Configuración inicial cuando se abre el modal
  useEffect(() => {
    if (isOpen && device) {
      const config = device.configuration;
      if (config) {
        setSelectedScreenType(config.screenType || "");
        setSelectedScreenNumber(config.screenNumber || 1);
        setScreenName(config.screenName || "");
        setOrientation(config.orientation || "landscape");
        setAutoStart(config.autoStart !== false);
      } else {
        // Resetear a valores por defecto
        setSelectedScreenType("");
        setSelectedScreenNumber(1);
        setScreenName("");
        setOrientation("landscape");
        setAutoStart(true);
      }
    }
  }, [isOpen, device]);

  // Obtener licencias disponibles del usuario
  const getAvailableScreenTypes = () => {
    if (!userData) return [];

    const screenTypes = [];

    // Pantallas Salón
    if (userData.ps > 0) {
      screenTypes.push({
        type: "salon",
        name: "Pantallas Salón",
        description: "Para mostrar eventos individuales",
        maxScreens: userData.ps,
        icon: "🎭",
      });
    }

    // Pantallas Directorio
    if (userData.pd > 0) {
      screenTypes.push({
        type: "directorio",
        name: "Pantallas Directorio",
        description: "Para mostrar múltiples eventos del día",
        maxScreens: userData.pd,
        icon: "📋",
      });
    }

    // Pantallas Tarifario (nueva funcionalidad)
    if (userData.pt > 0) {
      screenTypes.push({
        type: "tarifario",
        name: "Pantallas Tarifario",
        description: "Para mostrar información de tarifas hoteleras",
        maxScreens: userData.pt,
        icon: "💰",
      });
    }

    // Pantallas Promociones
    if (userData.pp > 0) {
      screenTypes.push({
        type: "promociones",
        name: "Pantallas Promociones",
        description: "Para mostrar contenido promocional",
        maxScreens: userData.pp,
        icon: "📢",
      });
    }

    return screenTypes;
  };

  // Generar opciones de número de pantalla
  const getScreenNumberOptions = () => {
    const selectedType = getAvailableScreenTypes().find(
      (type) => type.type === selectedScreenType
    );

    if (!selectedType) return [];

    return Array.from({ length: selectedType.maxScreens }, (_, i) => i + 1);
  };

  // Generar nombre sugerido basado en tipo y número
  const generateSuggestedName = () => {
    const typeNames = {
      salon: "Salón",
      directorio: "Directorio",
      tarifario: "Tarifario",
      promociones: "Promociones",
    };

    return `${
      typeNames[selectedScreenType] || "Pantalla"
    } ${selectedScreenNumber}`;
  };

  // Actualizar nombre sugerido cuando cambia tipo o número
  useEffect(() => {
    if (selectedScreenType && selectedScreenNumber && !screenName.trim()) {
      setScreenName(generateSuggestedName());
    }
  }, [selectedScreenType, selectedScreenNumber]);

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
        text: "Por favor selecciona un número de pantalla.",
      });
      return;
    }

    if (!screenName.trim()) {
      Swal.fire({
        icon: "error",
        title: "Nombre requerido",
        text: "Por favor ingresa un nombre para la pantalla.",
      });
      return;
    }

    setLoading(true);

    try {
      // Preparar configuración
      const configuration = {
        screenType: selectedScreenType,
        screenNumber: selectedScreenNumber,
        screenName: screenName.trim(),
        autoStart,
        configuredAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      };

      // Agregar orientación solo para directorio
      if (selectedScreenType === "directorio") {
        configuration.orientation = orientation;
      }

      // Actualizar dispositivo en Firestore
      const deviceRef = doc(db, "devices", device.code);
      await updateDoc(deviceRef, {
        status: "configured",
        configuration,
        lastUpdated: serverTimestamp(),
      });

      // Sincronizar datos al dispositivo
      if (userData && device.ownerId) {
        await syncUserDataToDevices(device.ownerId, userData);
      }

      // Mostrar mensaje de éxito
      Swal.fire({
        icon: "success",
        title: "Configuración guardada",
        text: `Dispositivo ${device.code} configurado correctamente como ${selectedScreenType} #${selectedScreenNumber}`,
        timer: 3000,
        showConfirmButton: false,
      });

      // Notificar al componente padre
      if (onConfigurationSaved) {
        onConfigurationSaved(device.code, configuration);
      }

      // Cerrar modal
      onClose();
    } catch (error) {
      console.error("Error guardando configuración:", error);
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: "No se pudo guardar la configuración. Inténtalo de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  };

  const availableTypes = getAvailableScreenTypes();
  const screenNumberOptions = getScreenNumberOptions();

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
                  <div>
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Configurar Dispositivo
                    </Dialog.Title>
                    <p className="text-sm text-gray-500 mt-1">
                      Código:{" "}
                      <span className="font-mono font-semibold">
                        {device?.code}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-md p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <XMarkIcon className="h-6 w-6 text-gray-400" />
                  </button>
                </div>

                {/* No hay licencias disponibles */}
                {availableTypes.length === 0 && (
                  <div className="text-center py-8">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                      <span className="text-2xl">⚠️</span>
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                      No hay licencias disponibles
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Tu cuenta no tiene licencias activas para ningún tipo de
                      pantalla. Contacta al administrador para activar
                      licencias.
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={onClose}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Entendido
                      </button>
                    </div>
                  </div>
                )}

                {/* Formulario de configuración */}
                {availableTypes.length > 0 && (
                  <div className="space-y-6">
                    {/* Tipo de Pantalla */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Tipo de Pantalla
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {availableTypes.map((type) => (
                          <div
                            key={type.type}
                            className={`relative rounded-lg border cursor-pointer p-4 transition-all ${
                              selectedScreenType === type.type
                                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                            onClick={() => setSelectedScreenType(type.type)}
                          >
                            <div className="flex items-start">
                              <div className="text-2xl mr-3">{type.icon}</div>
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-900">
                                  {type.name}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  {type.description}
                                </p>
                                <p className="text-xs text-blue-600 mt-2">
                                  Disponibles: {type.maxScreens}
                                </p>
                              </div>
                              {selectedScreenType === type.type && (
                                <CheckIcon className="h-5 w-5 text-blue-600" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Número de Pantalla */}
                    {selectedScreenType && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Número de Pantalla
                        </label>
                        <select
                          value={selectedScreenNumber}
                          onChange={(e) =>
                            setSelectedScreenNumber(parseInt(e.target.value))
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          {screenNumberOptions.map((num) => (
                            <option key={num} value={num}>
                              Pantalla #{num}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Nombre de la Pantalla */}
                    {selectedScreenType && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre de la Pantalla
                        </label>
                        <input
                          type="text"
                          value={screenName}
                          onChange={(e) => setScreenName(e.target.value)}
                          placeholder={generateSuggestedName()}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Este nombre aparecerá en la pantalla y en el sistema.
                        </p>
                      </div>
                    )}

                    {/* Orientación (solo para directorio) */}
                    {selectedScreenType === "directorio" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Orientación de la Pantalla
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <div
                            className={`relative rounded-lg border cursor-pointer p-4 transition-all ${
                              orientation === "landscape"
                                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                            onClick={() => setOrientation("landscape")}
                          >
                            <div className="text-center">
                              <div className="text-2xl mb-2">📺</div>
                              <h4 className="text-sm font-medium">
                                Horizontal
                              </h4>
                              <p className="text-xs text-gray-500">Estándar</p>
                            </div>
                            {orientation === "landscape" && (
                              <CheckIcon className="absolute top-2 right-2 h-5 w-5 text-blue-600" />
                            )}
                          </div>

                          <div
                            className={`relative rounded-lg border cursor-pointer p-4 transition-all ${
                              orientation === "portrait"
                                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                            onClick={() => setOrientation("portrait")}
                          >
                            <div className="text-center">
                              <div className="text-2xl mb-2">📱</div>
                              <h4 className="text-sm font-medium">Vertical</h4>
                              <p className="text-xs text-gray-500">
                                90° rotado
                              </p>
                            </div>
                            {orientation === "portrait" && (
                              <CheckIcon className="absolute top-2 right-2 h-5 w-5 text-blue-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Auto-inicio */}
                    <div>
                      <div className="flex items-center">
                        <input
                          id="auto-start"
                          type="checkbox"
                          checked={autoStart}
                          onChange={(e) => setAutoStart(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="auto-start"
                          className="ml-2 block text-sm text-gray-900"
                        >
                          Iniciar automáticamente al encender el dispositivo
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 ml-6">
                        La aplicación se abrirá automáticamente cuando se
                        encienda la TV.
                      </p>
                    </div>

                    {/* Vista previa de configuración */}
                    {selectedScreenType && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Vista Previa de Configuración
                        </h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>
                            <span className="font-medium">Tipo:</span>{" "}
                            {selectedScreenType}
                          </p>
                          <p>
                            <span className="font-medium">Número:</span> #
                            {selectedScreenNumber}
                          </p>
                          <p>
                            <span className="font-medium">Nombre:</span>{" "}
                            {screenName || generateSuggestedName()}
                          </p>
                          {selectedScreenType === "directorio" && (
                            <p>
                              <span className="font-medium">Orientación:</span>{" "}
                              {orientation === "landscape"
                                ? "Horizontal"
                                : "Vertical"}
                            </p>
                          )}
                          <p>
                            <span className="font-medium">Auto-inicio:</span>{" "}
                            {autoStart ? "Sí" : "No"}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        disabled={loading}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveConfiguration}
                        disabled={!selectedScreenType || loading}
                        className={`px-6 py-2 text-sm font-medium text-white rounded-md ${
                          selectedScreenType && !loading
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-gray-300 cursor-not-allowed"
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
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DeviceConfiguration;
