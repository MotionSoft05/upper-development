/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import auth from "@/firebase/auth";
import db from "@/firebase/firestore";
import Swal from "sweetalert2";

const DeviceLinker = ({ onDeviceLinked }) => {
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

    loadUserData();
  }, [user]);

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
    if (deviceCode.length === 6) {
      validateDevice();
    }
  }, [deviceCode]);

  const validateDevice = async () => {
    if (deviceCode.length !== 6) return;

    console.log(`🔍 Validando código: ${deviceCode}`);
    setValidating(true);
    setDeviceInfo(null);

    try {
      // 🆕 NUEVA ARQUITECTURA: Buscar en devices_temp primero
      console.log(`📋 Buscando en devices_temp/${deviceCode}`);
      const tempCodeRef = doc(db, "devices_temp", deviceCode);
      const tempDoc = await getDoc(tempCodeRef);

      if (!tempDoc.exists()) {
        console.log(`❌ No encontrado en devices_temp, buscando en devices...`);
        // Si no está en devices_temp, verificar si ya está en devices (ya vinculado)
        const deviceRef = doc(db, "devices", deviceCode);
        const deviceDoc = await getDoc(deviceRef);

        if (!deviceDoc.exists()) {
          console.log(`❌ Tampoco encontrado en devices`);
          setDeviceInfo({
            error: "Código no encontrado",
            message:
              "Verifica que el código sea correcto o que el dispositivo esté encendido.",
          });
          return;
        }

        console.log(`✅ Encontrado en devices (ya vinculado)`);
        const deviceData = deviceDoc.data();
        if (deviceData.ownerId === user?.uid) {
          setDeviceInfo({
            error: "Ya es tuyo",
            message: "Este dispositivo ya está vinculado a tu cuenta.",
            isOwned: true,
          });
          return;
        } else {
          setDeviceInfo({
            error: "Dispositivo ya vinculado",
            message: "Este dispositivo ya está vinculado a otra cuenta.",
          });
          return;
        }
      }

      console.log(`✅ Encontrado en devices_temp`);
      const tempData = tempDoc.data();
      console.log(`📋 Datos del código temporal:`, tempData);

      // 🔧 FIX: Manejar tanto Timestamp como string ISO de manera más robusta
      const now = new Date();
      let createdAt;
      let hoursDiff;

      try {
        if (tempData.createdAt) {
          if (typeof tempData.createdAt.toDate === "function") {
            // Es un Timestamp de Firebase
            createdAt = tempData.createdAt.toDate();
            console.log(`📅 Fecha como Timestamp:`, createdAt);
          } else if (typeof tempData.createdAt === "string") {
            // Es una string ISO
            createdAt = new Date(tempData.createdAt);
            console.log(
              `📅 Fecha como string:`,
              tempData.createdAt,
              "→",
              createdAt
            );
          } else if (tempData.createdAt instanceof Date) {
            // Ya es un objeto Date
            createdAt = tempData.createdAt;
            console.log(`📅 Fecha como Date:`, createdAt);
          } else {
            // Objeto con seconds y nanoseconds (Timestamp serializado)
            if (tempData.createdAt.seconds) {
              createdAt = new Date(tempData.createdAt.seconds * 1000);
              console.log(
                `📅 Fecha como objeto seconds:`,
                tempData.createdAt,
                "→",
                createdAt
              );
            } else {
              throw new Error("Formato de fecha no reconocido");
            }
          }
        } else {
          // No hay fecha, asumir que es muy viejo
          createdAt = new Date(0);
          console.log(`📅 Sin fecha, usando fecha mínima`);
        }

        // 🔧 FIX: Forzar ambas fechas a UTC para evitar problemas de zona horaria
        const nowUTC = now.getTime();
        const createdAtUTC = createdAt.getTime();

        hoursDiff = (nowUTC - createdAtUTC) / (1000 * 60 * 60);

        console.log(`🌍 Fecha actual UTC:`, new Date(nowUTC).toISOString());
        console.log(
          `🌍 Fecha creación UTC:`,
          new Date(createdAtUTC).toISOString()
        );
        console.log(`⏱️ Diferencia: ${hoursDiff.toFixed(2)} horas`);
      } catch (error) {
        console.error(`❌ Error procesando fecha:`, error, tempData.createdAt);
        // En caso de error, asumir que no ha expirado para no bloquear
        hoursDiff = 0;
      }

      if (hoursDiff > 24) {
        // 🔧 Cambié de 1 hora a 24 horas
        console.log(
          `❌ Código expirado: ${hoursDiff.toFixed(2)} horas (límite: 24h)`
        );
        setDeviceInfo({
          error: "Código expirado",
          message:
            "Este código ha expirado. Genera un nuevo código en el dispositivo.",
        });
        return;
      }

      // Verificar estado
      if (tempData.status !== "waiting") {
        console.log(`❌ Código ya utilizado, status: ${tempData.status}`);
        setDeviceInfo({
          error: "Código ya utilizado",
          message:
            "Este código ya ha sido utilizado. Genera uno nuevo en el dispositivo.",
        });
        return;
      }

      console.log(`✅ Código válido y disponible`);
      // Código temporal válido y disponible
      const hoursRemaining = Math.max(0, 24 - hoursDiff);
      setDeviceInfo({
        success: true,
        status: tempData.status,
        createdAt: tempData.createdAt,
        deviceInfo: tempData.deviceInfo,
        message: "Dispositivo disponible para vincular",
        hoursRemaining: hoursRemaining.toFixed(1),
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
      // 🆕 NUEVA ARQUITECTURA: Proceso de vinculación actualizado

      // 1. Leer datos del código temporal
      const tempCodeRef = doc(db, "devices_temp", deviceCode);
      const tempDoc = await getDoc(tempCodeRef);

      if (!tempDoc.exists()) {
        throw new Error("El código temporal ya no existe");
      }

      const tempData = tempDoc.data();

      // 2. Crear dispositivo permanente con nuevo ID
      const deviceId = `device_${Date.now()}_${user.uid}`;
      const deviceRef = doc(db, "devices", deviceId);

      const permanentDeviceData = {
        deviceId,
        code: deviceCode, // Mantener referencia al código original
        ownerId: user.uid,
        ownerEmail: userData.email,
        status: "linked",
        linkedAt: serverTimestamp(),
        userData: userData,
        deviceInfo: tempData.deviceInfo || {},
        createdAt: tempData.createdAt,
        lastUpdated: serverTimestamp(),
        // Heredar datos del código temporal
        ...tempData,
        // Sobrescribir con nuevos datos permanentes
        deviceId,
        ownerId: user.uid,
        ownerEmail: userData.email,
        status: "linked",
      };

      await setDoc(deviceRef, permanentDeviceData);

      // 3. Actualizar código temporal con deviceId para transición
      await updateDoc(tempCodeRef, {
        status: "linked",
        deviceId: deviceId,
        linkedAt: serverTimestamp(),
        ownerId: user.uid,
      });

      // 4. El código temporal se eliminará automáticamente por el sistema de limpieza

      console.log(`✅ Dispositivo vinculado: ${deviceCode} → ${deviceId}`);

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
        onDeviceLinked(deviceCode, userData, deviceId);
      }

      // Limpiar formulario
      setDeviceCode("");
      setDeviceInfo(null);
    } catch (error) {
      console.error("Error vinculando dispositivo:", error);

      let errorMessage = "No se pudo vincular el dispositivo.";
      if (error.message.includes("ya no existe")) {
        errorMessage =
          "El código temporal ha expirado. Genera uno nuevo en el dispositivo.";
      } else if (error.message.includes("ya está vinculado")) {
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

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Vincular Dispositivo Android TV
        </h2>
        <p className="text-gray-600">
          Conecta tu dispositivo Android TV Box a tu cuenta de UpperDS
        </p>
      </div>

      {/* Instrucciones */}
      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          Instrucciones para vincular:
        </h3>
        <ol className="space-y-1 list-decimal list-inside">
          <li>Enciende tu dispositivo Android TV</li>
          <li>Abre la aplicación UpperDS</li>
          <li>Se mostrará un código de 6 caracteres en pantalla</li>
          <li>Ingresa ese código aquí abajo</li>
          <li>Haz clic en &quot;Vincular Dispositivo&quot;</li>
        </ol>
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            ⏰ <strong>Importante:</strong> Los códigos expiran automáticamente
            después de 24 horas.
          </p>
        </div>
      </div>

      {/* Formulario de código */}
      <div className="space-y-6">
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
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
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
                )}
              </div>
              <div className="ml-3">
                <h3
                  className={`text-sm font-medium ${
                    deviceInfo.success ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {deviceInfo.success
                    ? "Dispositivo encontrado"
                    : deviceInfo.error || "Error"}
                </h3>
                <p
                  className={`text-sm mt-1 ${
                    deviceInfo.success ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {deviceInfo.message}
                </p>
                {deviceInfo.success && deviceInfo.hoursRemaining && (
                  <p className="text-xs text-green-600 mt-1">
                    ⏱️ Código válido por {deviceInfo.hoursRemaining} horas más
                  </p>
                )}
                {deviceInfo.deviceInfo && (
                  <div className="mt-2 text-xs text-green-600">
                    <p>📱 {deviceInfo.deviceInfo.platform || "Android"}</p>
                    <p>📦 App v{deviceInfo.deviceInfo.appVersion || "1.0.0"}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Botón de vinculación */}
        <button
          onClick={handleLinkDevice}
          disabled={!deviceInfo?.success || linking || loading}
          className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors duration-200 ${
            deviceInfo?.success && !linking && !loading
              ? "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {linking
            ? "Vinculando dispositivo..."
            : loading
            ? "Cargando..."
            : "Vincular Dispositivo"}
        </button>

        {/* Info adicional */}
        <div className="text-center text-sm text-gray-500">
          <p>
            ¿Problemas para conectar?{" "}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              Consulta nuestra guía de ayuda
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeviceLinker;
