/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";
import auth from "@/firebase/auth";
import db from "@/firebase/firestore";
import { linkDevice } from "@/utils/deviceManager";
import Swal from "sweetalert2";

const DeviceLinkingModal = ({ isOpen, onClose, onDeviceLinked }) => {
  const [user, loading, error] = useAuthState(auth);
  const [deviceCode, setDeviceCode] = useState("");
  const [linking, setLinking] = useState(false);
  const [validating, setValidating] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [userData, setUserData] = useState(null);

  // Cargar datos del usuario
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          const userRef = doc(db, "usuarios", user.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error("Error cargando datos del usuario:", error);
        }
      }
    };

    if (isOpen) {
      loadUserData();
    }
  }, [user, isOpen]);

  // Limpiar estado cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setDeviceCode("");
      setDeviceInfo(null);
      setLinking(false);
      setValidating(false);
    }
  }, [isOpen]);

  // Formatear código mientras se escribe
  const handleCodeChange = (e) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (value.length <= 6) {
      setDeviceCode(value);
      setDeviceInfo(null); // Limpiar info anterior
    }
  };

  // Validar dispositivo cuando se completa el código
  useEffect(() => {
    if (deviceCode.length === 6 && isOpen) {
      validateDevice();
    }
  }, [deviceCode, isOpen]);

  const validateDevice = async () => {
    if (deviceCode.length !== 6) return;

    setValidating(true);
    setDeviceInfo(null);

    try {
      // Verificar que el dispositivo existe
      const deviceRef = doc(db, "devices", deviceCode);
      const deviceDoc = await getDoc(deviceRef);

      if (!deviceDoc.exists()) {
        setDeviceInfo({
          error: "Dispositivo no encontrado",
          message: "Verifica que el código sea correcto.",
        });
        return;
      }

      const deviceData = deviceDoc.data();

      // Verificar estado del dispositivo
      if (deviceData.status === "linked" && deviceData.ownerId !== user?.uid) {
        setDeviceInfo({
          error: "Dispositivo ya vinculado",
          message: "Este dispositivo ya está vinculado a otra cuenta.",
        });
        return;
      }

      if (deviceData.status === "linked" && deviceData.ownerId === user?.uid) {
        setDeviceInfo({
          error: "Ya es tuyo",
          message: "Este dispositivo ya está vinculado a tu cuenta.",
          isOwned: true,
        });
        return;
      }

      // Dispositivo disponible para vincular
      setDeviceInfo({
        success: true,
        status: deviceData.status,
        createdAt: deviceData.createdAt,
        message: "Dispositivo disponible para vincular",
      });
    } catch (error) {
      console.error("Error validando dispositivo:", error);
      setDeviceInfo({
        error: "Error de conexión",
        message: "No se pudo verificar el dispositivo. Inténtalo de nuevo.",
      });
    } finally {
      setValidating(false);
    }
  };

  const handleLinkDevice = async () => {
    if (!user || !userData || !deviceCode || !deviceInfo?.success) return;

    setLinking(true);

    try {
      await linkDevice(deviceCode, user.uid, userData);

      // Mostrar mensaje de éxito
      Swal.fire({
        icon: "success",
        title: "¡Dispositivo vinculado!",
        text: `El dispositivo ${deviceCode} se ha vinculado correctamente a tu cuenta.`,
        timer: 3000,
        showConfirmButton: false,
      });

      // Notificar al componente padre
      if (onDeviceLinked) {
        onDeviceLinked(deviceCode, userData);
      }

      // Cerrar modal
      onClose();
    } catch (error) {
      console.error("Error vinculando dispositivo:", error);

      let errorMessage = "No se pudo vincular el dispositivo.";
      if (error.message.includes("ya está vinculado")) {
        errorMessage = "Este dispositivo ya está vinculado a otra cuenta.";
      } else if (error.message.includes("no encontrado")) {
        errorMessage = "Dispositivo no encontrado. Verifica el código.";
      }

      Swal.fire({
        icon: "error",
        title: "Error al vincular",
        text: errorMessage,
      });
    } finally {
      setLinking(false);
    }
  };

  // Estados de loading y error
  if (loading) {
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
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    );
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
                  <div>
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Agregar Pantalla
                    </Dialog.Title>
                    <p className="text-sm text-gray-500 mt-1">
                      Vincula un nuevo dispositivo TVBox a tu cuenta
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-md p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <XMarkIcon className="h-6 w-6 text-gray-400" />
                  </button>
                </div>

                {error ? (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <h3 className="text-red-800 font-medium">
                      Error de autenticación
                    </h3>
                    <p className="text-red-600 text-sm mt-1">
                      No se pudo cargar la información del usuario.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Instrucciones */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="text-blue-800 font-medium mb-2">
                        📋 Instrucciones
                      </h3>
                      <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                        <li>Enciende tu dispositivo</li>
                        <li>Abre la aplicación UpperDS</li>
                        <li>
                          Se mostrará un código de 6 caracteres en pantalla
                        </li>
                        <li>Ingresa ese código aquí abajo</li>
                        <li>Haz clic en &quot;Vincular Dispositivo&quot;</li>
                      </ol>
                    </div>

                    {/* Formulario de código */}
                    <div>
                      <label
                        htmlFor="device-code"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Código del Dispositivo
                      </label>
                      <div className="relative">
                        <input
                          id="device-code"
                          type="text"
                          value={deviceCode}
                          onChange={handleCodeChange}
                          placeholder="ABC123"
                          maxLength={6}
                          className="block w-full px-4 py-3 text-center text-2xl font-mono tracking-wider border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                          style={{ letterSpacing: "0.3em" }}
                        />
                        {validating && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <svg
                              className="animate-spin h-5 w-5 text-blue-500"
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
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-center">
                        {deviceCode.length}/6 caracteres • Solo letras y números
                      </p>
                    </div>

                    {/* Estado del dispositivo */}
                    {deviceInfo && (
                      <div
                        className={`rounded-lg p-4 ${
                          deviceInfo.success
                            ? "bg-green-50 border border-green-200"
                            : "bg-red-50 border border-red-200"
                        }`}
                      >
                        <div className="flex">
                          <div className="flex-shrink-0">
                            {deviceInfo.success ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-400" />
                            ) : (
                              <XMarkIcon className="h-5 w-5 text-red-400" />
                            )}
                          </div>
                          <div className="ml-3">
                            <h3
                              className={`text-sm font-medium ${
                                deviceInfo.success
                                  ? "text-green-800"
                                  : "text-red-800"
                              }`}
                            >
                              {deviceInfo.success
                                ? "✅ Dispositivo disponible"
                                : `❌ ${deviceInfo.error}`}
                            </h3>
                            <p
                              className={`text-sm mt-1 ${
                                deviceInfo.success
                                  ? "text-green-700"
                                  : "text-red-700"
                              }`}
                            >
                              {deviceInfo.message}
                            </p>
                            {deviceInfo.success && (
                              <div className="text-xs text-green-600 mt-2">
                                Estado: {deviceInfo.status} • Código:{" "}
                                {deviceCode}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Información del usuario que se vinculará */}
                    {userData && deviceInfo?.success && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          👤 Este dispositivo se vinculará a:
                        </h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>Usuario:</span>
                            <span className="font-medium">
                              {userData.nombre} {userData.apellido}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Email:</span>
                            <span className="font-medium">
                              {userData.email}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Empresa:</span>
                            <span className="font-medium">
                              {userData.empresa}
                            </span>
                          </div>
                          <hr className="my-2" />
                          <div className="text-xs text-gray-500">
                            <strong>Licencias disponibles:</strong>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <span>🎭 Salón: {userData.ps || 0}</span>
                              <span>📋 Directorio: {userData.pd || 0}</span>
                              <span>💰 Tarifario: {userData.pt || 0}</span>
                              <span>📢 Promociones: {userData.pp || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Estado sin licencias */}
                    {userData &&
                      !userData.ps &&
                      !userData.pd &&
                      !userData.pt &&
                      !userData.pp && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
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
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-yellow-800">
                                ⚠️ Sin licencias activas
                              </h3>
                              <p className="text-sm text-yellow-700 mt-1">
                                Puedes vincular el dispositivo, pero necesitarás
                                licencias activas para configurar pantallas.
                                Contacta al administrador para activar
                                licencias.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Información adicional */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">
                        💡 ¿Necesitas ayuda?
                      </h3>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>
                          • El código se genera automáticamente al abrir la app
                          en tu TV
                        </p>
                        <p>
                          • Si no aparece el código, reinicia la aplicación en
                          la TV
                        </p>
                        <p>
                          • Cada código cambiara luego de 1 minuto por seguridad
                        </p>
                        <p>
                          • Puedes vincular múltiples dispositivos a la misma
                          cuenta
                        </p>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        disabled={linking}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleLinkDevice}
                        disabled={!deviceInfo?.success || linking}
                        className={`px-6 py-2 text-sm font-medium text-white rounded-md ${
                          deviceInfo?.success && !linking
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-gray-300 cursor-not-allowed"
                        }`}
                      >
                        {linking ? (
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
                            Vinculando...
                          </div>
                        ) : (
                          "🔗 Vincular Dispositivo"
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

export default DeviceLinkingModal;
