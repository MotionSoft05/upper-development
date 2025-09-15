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
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";

const DeviceLinkingModal = ({ isOpen, onClose, onDeviceLinked }) => {
  const { t } = useTranslation();
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
          error: t("myTvScreens.deviceNotFound"),
          message: t("myTvScreens.verifyCode"),
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
          error: t("myTvScreens.deviceAlreadyLinked"),
          message: `${t("myTvScreens.deviceLinkedToOtherCompany")}${
            deviceData.empresa ? ` (${deviceData.empresa})` : ""
          }.`,
        });
        return;
      }

      if (deviceData.status === "linked" && deviceData.ownerId === user?.uid) {
        setDeviceInfo({
          error: t("myTvScreens.alreadyYours"),
          message: t("myTvScreens.deviceAlreadyYourAccount"),
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
          error: t("myTvScreens.alreadyLinkedToCompany"),
          message: `${t("myTvScreens.deviceLinkedToSameCompany")} ${userData?.empresa}.`,
          isSameCompany: true,
        });
        return;
      }

      // Dispositivo disponible para vincular
      setDeviceInfo({
        success: true,
        status: deviceData.status,
        createdAt: deviceData.createdAt,
        message: t("myTvScreens.deviceAvailableToLink"),
      });
    } catch (error) {
      console.error("Error validando dispositivo:", error);
      setDeviceInfo({
        error: t("myTvScreens.connectionError"),
        message: t("myTvScreens.couldNotVerifyDevice"),
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
        title: t("myTvScreens.deviceLinkedSuccess"),
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

      let errorMessage = t("myTvScreens.couldNotLinkDevice");
      if (error.message.includes("ya está vinculado")) {
        errorMessage = t("myTvScreens.deviceLinkedOtherCompanyError");
      } else if (error.message.includes("no encontrado")) {
        errorMessage = t("myTvScreens.deviceNotFoundError");
      }

      Swal.fire({
        icon: "error",
        title: t("myTvScreens.errorLinking"),
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
                    {t("myTvScreens.linkDeviceModal")}
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
                      📺 {t("myTvScreens.instructions")}
                    </h3>
                    <div className="text-xs text-blue-700 space-y-1">
                      <p>1. {t("myTvScreens.step1")}</p>
                      <p>2. {t("myTvScreens.step2")}</p>
                      <p>3. {t("myTvScreens.step3")}</p>
                      <p>4. {t("myTvScreens.step4")}</p>
                    </div>
                  </div>

                  {/* Input del código */}
                  <div>
                    <label
                      htmlFor="deviceCode"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {t("myTvScreens.deviceCode")}
                    </label>
                    <input
                      type="text"
                      id="deviceCode"
                      value={deviceCode}
                      onChange={handleCodeChange}
                      placeholder={t("myTvScreens.codeExample")}
                      className="block w-full px-3 py-3 text-center text-lg font-mono uppercase tracking-wider border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      maxLength={6}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {t("myTvScreens.codeDisplaysOnTV")}
                    </p>
                  </div>

                  {/* Estado de validación */}
                  {validating && (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-sm text-gray-600">
                        {t("myTvScreens.validatingDevice")}
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
                        🏢 {t("myTvScreens.deviceWillBeLinkedTo")}
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>{t("myTvScreens.company")}:</span>
                          <span className="font-medium text-blue-600">
                            {userData.empresa}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("myTvScreens.responsibleUser")}:</span>
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
                            {t("myTvScreens.availableLicenses")} {userData.empresa}:
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
                              ⚠️ {t("myTvScreens.noActiveLicenses")}
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
                      {t("myTvScreens.cancel")}
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
                          {t("myTvScreens.linking")}
                        </>
                      ) : (
                        `${t("myTvScreens.linkTo")} ${userData?.empresa || t("myTvScreens.company")}`
                      )}
                    </button>
                  </div>

                  {/* Información adicional */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <h3 className="text-xs font-medium text-gray-700 mb-2">
                      💡 {t("myTvScreens.tips")}
                    </h3>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>
                        • {t("myTvScreens.codeGeneratedAutomatically")}
                      </p>
                      <p>
                        • {t("myTvScreens.restartAppIfNoCode")}
                      </p>
                      <p>
                        • {t("myTvScreens.codeExpires")}
                      </p>
                      <p>
                        • {t("myTvScreens.onceLinkedAllUsersCanUse")}
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
