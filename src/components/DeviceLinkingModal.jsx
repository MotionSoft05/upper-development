/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
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
      console.log(`🔍 Validando código: ${deviceCode}`);
      console.log(`📋 Buscando por campo 'code' = '${deviceCode}' en devices`);

      // ✅ CORREGIDO: Buscar por campo 'code' no por ID de documento
      const q = query(
        collection(db, "devices"),
        where("code", "==", deviceCode)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log(`❌ No se encontró dispositivo con código: ${deviceCode}`);
        setDeviceInfo({
          error: "Dispositivo no encontrado",
          message: "Verifica que el código sea correcto.",
        });
        return;
      }

      // Tomar el primer documento encontrado
      const deviceDoc = querySnapshot.docs[0];
      const deviceData = deviceDoc.data();
      const deviceId = deviceDoc.id;

      console.log(`✅ Dispositivo encontrado:`, {
        documentId: deviceId,
        code: deviceData.code,
        status: deviceData.status,
        ownerId: deviceData.ownerId,
        empresa: deviceData.empresa,
      });

      // ✅ ACTUALIZADO: Verificar si está vinculado a otra empresa
      if (
        deviceData.status === "linked" &&
        deviceData.empresa !== userData?.empresa
      ) {
        setDeviceInfo({
          error: "Dispositivo ya vinculado",
          message: `Este dispositivo ya está vinculado a otra empresa${
            deviceData.empresa ? ` (${deviceData.empresa})` : ""
          }.`,
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

      // ✅ ACTUALIZADO: Verificar si está vinculado a la misma empresa
      if (
        deviceData.status === "linked" &&
        deviceData.empresa === userData?.empresa
      ) {
        setDeviceInfo({
          error: "Ya vinculado a tu empresa",
          message: `Este dispositivo ya está vinculado a ${userData?.empresa}.`,
          isSameCompany: true,
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

      // ✅ ACTUALIZADO: Mensaje de éxito con empresa
      Swal.fire({
        icon: "success",
        title: "¡Dispositivo vinculado!",
        html: `
          <div class="text-left">
            <p><strong>Dispositivo:</strong> ${deviceCode}</p>
            <p><strong>Empresa:</strong> ${userData.empresa}</p>
            <p><strong>Usuario:</strong> ${userData.nombre} ${userData.apellido}</p>
          </div>
          <p class="mt-3 text-sm text-gray-600">El dispositivo ahora está disponible para todos los usuarios de ${userData.empresa}</p>
        `,
        timer: 5000,
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
        errorMessage = "Este dispositivo ya está vinculado a otra empresa.";
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

  if (loading) {
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Vincular Dispositivo
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Instrucciones */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">
                      📺 Instrucciones
                    </h3>
                    <div className="text-xs text-blue-700 space-y-1">
                      <p>1. Abre la aplicación en tu Android TV</p>
                      <p>2. El código aparecerá en pantalla automáticamente</p>
                      <p>3. Ingresa el código de 6 caracteres aquí</p>
                      <p>4. El dispositivo se vinculará a tu empresa</p>
                    </div>
                  </div>

                  {/* Input del código */}
                  <div>
                    <label
                      htmlFor="deviceCode"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Código del dispositivo
                    </label>
                    <input
                      type="text"
                      id="deviceCode"
                      value={deviceCode}
                      onChange={handleCodeChange}
                      placeholder="Ej: ABC123"
                      className="block w-full px-3 py-3 text-center text-lg font-mono uppercase tracking-wider border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      maxLength={6}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      El código se muestra en la pantalla de tu Android TV
                    </p>
                  </div>

                  {/* Estado de validación */}
                  {validating && (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-sm text-gray-600">
                        Validando dispositivo...
                      </span>
                    </div>
                  )}

                  {/* Información del dispositivo */}
                  {deviceInfo && (
                    <div
                      className={`border rounded-lg p-4 ${
                        deviceInfo.success
                          ? "border-green-200 bg-green-50"
                          : "border-red-200 bg-red-50"
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          {deviceInfo.success ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-400" />
                          ) : (
                            <XMarkIcon className="h-5 w-5 text-red-400" />
                          )}
                        </div>
                        <div className="ml-3 flex-1">
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
                              Estado: {deviceInfo.status} • Código: {deviceCode}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ✅ ACTUALIZADO: Información de vinculación a empresa */}
                  {userData && deviceInfo?.success && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">
                        🏢 Este dispositivo se vinculará a:
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Empresa:</span>
                          <span className="font-medium text-blue-600">
                            {userData.empresa}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Usuario responsable:</span>
                          <span className="font-medium">
                            {userData.nombre} {userData.apellido}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Email:</span>
                          <span className="font-medium">{userData.email}</span>
                        </div>
                        <hr className="my-2" />
                        <div className="text-xs text-gray-500">
                          <strong>⚠️ Importante:</strong>
                          <div className="mt-1 space-y-1">
                            <p>
                              • El dispositivo estará disponible para todos los
                              usuarios de <strong>{userData.empresa}</strong>
                            </p>
                            <p>
                              • Otros usuarios de la empresa podrán configurar
                              pantallas en este dispositivo
                            </p>
                            <p>
                              • Las licencias se compartirán entre todos los
                              dispositivos de la empresa
                            </p>
                          </div>
                        </div>
                        <hr className="my-2" />
                        <div className="text-xs text-gray-500">
                          <strong>
                            Licencias disponibles para {userData.empresa}:
                          </strong>
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
                              Puedes vincular el dispositivo, pero tu empresa
                              necesitará licencias activas para configurar
                              pantallas. Contacta al administrador para activar
                              licencias para{" "}
                              <strong>{userData?.empresa}</strong>.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Botones */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      onClick={onClose}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleLinkDevice}
                      disabled={!deviceInfo?.success || linking}
                      className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        deviceInfo?.success && !linking
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {linking ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Vinculando...
                        </>
                      ) : (
                        `Vincular a ${userData?.empresa || "empresa"}`
                      )}
                    </button>
                  </div>

                  {/* Información adicional */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <h3 className="text-xs font-medium text-gray-700 mb-2">
                      💡 Consejos
                    </h3>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>
                        • El código se genera automáticamente al abrir la app en
                        tu TV
                      </p>
                      <p>
                        • Si no aparece el código, reinicia la aplicación en la
                        TV
                      </p>
                      <p>
                        • Cada código expira después de 10 minutos por seguridad
                      </p>
                      <p>
                        • Una vez vinculado, todos los usuarios de tu empresa
                        podrán usarlo
                      </p>
                    </div>
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

export default DeviceLinkingModal;
