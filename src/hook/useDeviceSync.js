// src/hooks/useDeviceSync.js
import { useState, useEffect, useCallback } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import auth from "@/firebase/auth";
import db from "@/firebase/firestore";
import {
  subscribeToUserDevices,
  syncUserDataToDevices,
  getUserDevices,
} from "@/utils/deviceManager";

/**
 * Hook para manejar sincronización automática de dispositivos
 * - Escucha cambios en userData del usuario
 * - Sincroniza automáticamente a todos sus dispositivos
 * - Proporciona lista de dispositivos en tiempo real
 */
export const useDeviceSync = () => {
  const [user, loading, error] = useAuthState(auth);
  const [devices, setDevices] = useState([]);
  const [userData, setUserData] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  // Cargar datos iniciales del usuario
  useEffect(() => {
    if (!user) {
      setUserData(null);
      setDevices([]);
      return;
    }

    // Listener para cambios en userData
    const userRef = doc(db, "usuarios", user.uid);
    const unsubscribeUser = onSnapshot(
      userRef,
      async (doc) => {
        if (doc.exists()) {
          const newUserData = doc.data();
          setUserData(newUserData);

          // Auto-sincronizar a dispositivos cuando userData cambia
          if (newUserData) {
            try {
              setSyncing(true);
              setSyncError(null);
              await syncUserDataToDevices(user.uid, newUserData);
              console.log("✅ Dispositivos sincronizados automáticamente");
            } catch (error) {
              console.error("❌ Error sincronizando dispositivos:", error);
              setSyncError(error.message);
            } finally {
              setSyncing(false);
            }
          }
        }
      },
      (error) => {
        console.error("Error en listener de usuario:", error);
        setSyncError(error.message);
      }
    );

    return () => unsubscribeUser();
  }, [user]);

  // Escuchar dispositivos del usuario en tiempo real
  useEffect(() => {
    if (!user) {
      setDevices([]);
      return;
    }

    const unsubscribeDevices = subscribeToUserDevices(
      user.uid,
      (userDevices) => {
        setDevices(userDevices);
        console.log(`📱 ${userDevices.length} dispositivos cargados`);
      }
    );

    return () => unsubscribeDevices();
  }, [user]);

  // Función para forzar sincronización manual
  const forceSyncDevices = useCallback(async () => {
    if (!user || !userData) return;

    try {
      setSyncing(true);
      setSyncError(null);
      await syncUserDataToDevices(user.uid, userData);
      console.log("✅ Sincronización manual completada");
    } catch (error) {
      console.error("❌ Error en sincronización manual:", error);
      setSyncError(error.message);
    } finally {
      setSyncing(false);
    }
  }, [user, userData]);

  // Función para obtener estadísticas de dispositivos
  const getDeviceStats = useCallback(() => {
    const stats = {
      total: devices.length,
      online: devices.filter((d) => d.status === "online").length,
      offline: devices.filter((d) => d.status === "offline").length,
      waiting: devices.filter((d) => d.status === "waiting").length,
      linked: devices.filter((d) => d.status === "linked").length,
    };

    return {
      ...stats,
      onlinePercentage:
        stats.total > 0 ? ((stats.online / stats.total) * 100).toFixed(1) : 0,
    };
  }, [devices]);

  // Función para obtener dispositivos por estado
  const getDevicesByStatus = useCallback(
    (status) => {
      return devices.filter((device) => device.status === status);
    },
    [devices]
  );

  // Función para verificar si hay dispositivos que necesitan atención
  const getDevicesNeedingAttention = useCallback(() => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

    return devices.filter((device) => {
      // Dispositivos que estaban online pero no han reportado en 5+ minutos
      if (device.status === "online" && device.lastSeen) {
        const lastSeenTime =
          device.lastSeen.toDate?.() || new Date(device.lastSeen);
        return lastSeenTime.getTime() < fiveMinutesAgo;
      }
      return false;
    });
  }, [devices]);

  return {
    // Estados
    user,
    loading,
    error,
    devices,
    userData,
    syncing,
    syncError,

    // Funciones
    forceSyncDevices,
    getDeviceStats,
    getDevicesByStatus,
    getDevicesNeedingAttention,

    // Estados computados
    isReady: !loading && user && userData,
    hasDevices: devices.length > 0,
    stats: getDeviceStats(),
  };
};

/**
 * Hook simplificado solo para obtener dispositivos del usuario
 */
export const useUserDevices = () => {
  const [user] = useAuthState(auth);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setDevices([]);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToUserDevices(user.uid, (userDevices) => {
      setDevices(userDevices);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { devices, loading, hasDevices: devices.length > 0 };
};

/**
 * Hook para monitorear estado de un dispositivo específico
 */
export const useDeviceStatus = (deviceCode) => {
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deviceCode) {
      setLoading(false);
      return;
    }

    const deviceRef = doc(db, "devices", deviceCode);
    const unsubscribe = onSnapshot(
      deviceRef,
      (doc) => {
        if (doc.exists()) {
          setDevice({ id: doc.id, ...doc.data() });
        } else {
          setDevice(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error(`Error monitoreando device ${deviceCode}:`, error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [deviceCode]);

  const isOnline = device?.status === "online";
  const isRecent =
    device?.lastSeen &&
    Date.now() -
      (device.lastSeen.toDate?.() || new Date(device.lastSeen)).getTime() <
      120000; // 2 minutos

  return {
    device,
    loading,
    isOnline,
    isRecent,
    status: device?.status || "unknown",
    lastSeen: device?.lastSeen,
  };
};
