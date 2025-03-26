// src/hooks/useHeartbeat.js
import { useState, useEffect, useRef } from "react";
import {
  doc,
  updateDoc,
  serverTimestamp,
  setDoc,
  increment,
} from "firebase/firestore";
import db from "@/firebase/firestore";

/**
 * Hook para registrar la actividad (heartbeat) de una pantalla en Firestore
 *
 * @param {Object} options Configuración del heartbeat
 * @param {string} options.screenId Identificador único de la pantalla
 * @param {string} options.screenType Tipo de pantalla ('salon' o 'directorio')
 * @param {number} options.screenNumber Número de pantalla
 * @param {string} options.deviceName Nombre descriptivo del dispositivo
 * @param {string} options.userId ID del usuario propietario
 * @param {string} options.companyName Nombre de la empresa
 * @param {number} options.interval Intervalo en ms entre cada heartbeat (default: 60000)
 * @returns {Object} Estado del heartbeat
 */
export default function useHeartbeat({
  screenId,
  screenType,
  screenNumber,
  deviceName,
  userId,
  companyName,
  interval = 60000, // Default: cada minuto
}) {
  const [lastBeat, setLastBeat] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});
  const timerRef = useRef(null);
  const counterRef = useRef(0);
  const lastErrorRef = useRef(null);

  // Solo procedemos si tenemos los datos mínimos necesarios
  const canSendHeartbeat = !!screenId && !!userId && !!screenType;

  // Función que envía el heartbeat a Firestore
  const sendHeartbeat = async () => {
    if (!canSendHeartbeat) {
      setDebugInfo((prev) => ({
        ...prev,
        error: "Datos insuficientes para enviar heartbeat",
        screenId,
        userId,
        screenType,
      }));
      return;
    }

    try {
      setDebugInfo((prev) => ({
        ...prev,
        sendingHeartbeat: true,
        timestamp: new Date().toISOString(),
      }));

      // Estructura de la colección:
      // - heartbeats (colección)
      //   - {screenId} (documento)
      //     - lastActivity: timestamp
      //     - screenType: string
      //     - screenNumber: number
      //     - deviceName: string
      //     - userId: string
      //     - companyName: string
      //     - status: 'online'|'offline'
      //     - beatCount: number
      //     - ...más campos que puedas necesitar

      const heartbeatRef = doc(db, "heartbeats", screenId);

      // Datos a actualizar
      const updateData = {
        lastActivity: serverTimestamp(),
        screenType,
        screenNumber,
        deviceName: deviceName || `Pantalla ${screenType} ${screenNumber}`,
        userId,
        companyName,
        status: "online",
        ip: window.location.hostname,
        userAgent: navigator.userAgent,
        beatCount: increment(1),
        screenResolution: `${window.innerWidth}x${window.innerHeight}`,
      };

      setDebugInfo((prev) => ({ ...prev, updateData }));

      // Detectar si este es el primer heartbeat o una actualización
      try {
        await updateDoc(heartbeatRef, updateData);
        setDebugInfo((prev) => ({ ...prev, updateSuccess: true }));
      } catch (e) {
        setDebugInfo((prev) => ({
          ...prev,
          updateError: e.message,
          code: e.code,
        }));

        // Si el documento no existe (primer heartbeat), crearlo
        if (e.code === "not-found") {
          await setDoc(heartbeatRef, {
            ...updateData,
            firstSeen: serverTimestamp(),
            beatCount: 1,
          });
          setDebugInfo((prev) => ({ ...prev, docCreated: true }));
        } else {
          throw e;
        }
      }

      setLastBeat(new Date());
      setIsConnected(true);
      setError(null);
      counterRef.current += 1;

      // Reporte de éxito
      console.log(
        `[Heartbeat] Enviado con éxito para ${screenType} ${screenNumber}, contador: ${counterRef.current}`
      );
    } catch (err) {
      setIsConnected(false);
      setError(err.message);
      lastErrorRef.current = err.message;
      setDebugInfo((prev) => ({ ...prev, finalError: err.message }));
      console.error("[Heartbeat] Error al enviar heartbeat:", err);
    }
  };

  // Efecto para enviar heartbeats periódicamente
  useEffect(() => {
    // Verificamos si tenemos los datos necesarios para operar
    if (!canSendHeartbeat) {
      console.warn("[Heartbeat] Datos insuficientes para enviar heartbeat", {
        screenId,
        userId,
        screenType,
      });
      return;
    }

    // Enviar heartbeat inicial
    sendHeartbeat();

    // Configurar el intervalo para los heartbeats periódicos
    timerRef.current = setInterval(sendHeartbeat, interval);

    // Limpieza al desmontar el componente
    return () => {
      clearInterval(timerRef.current);

      // Actualizar estado a 'offline' al desmontar
      if (canSendHeartbeat) {
        try {
          const heartbeatRef = doc(db, "heartbeats", screenId);
          updateDoc(heartbeatRef, {
            status: "offline",
            lastDisconnect: serverTimestamp(),
          }).catch((err) =>
            console.error(
              "[Heartbeat] Error al actualizar estado offline:",
              err
            )
          );
        } catch (e) {
          console.error(
            "[Heartbeat] Error al marcar la pantalla como offline:",
            e
          );
        }
      }
    };
  }, [
    canSendHeartbeat,
    interval,
    screenId,
    screenType,
    screenNumber,
    deviceName,
    userId,
    companyName,
  ]);

  // Escuchar cambios en la conectividad de la red
  useEffect(() => {
    const handleOnline = () => {
      setIsConnected(true);
      sendHeartbeat(); // Enviar heartbeat inmediatamente cuando la conexión se restablece
    };

    const handleOffline = () => {
      setIsConnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return {
    isConnected,
    lastBeat,
    error,
    beatCount: counterRef.current,
    lastError: lastErrorRef.current,
    debugInfo, // Exportamos la información de depuración
  };
}
