// src/hook/useDeviceSync.js - Actualizado para empresa
import { useState, useEffect, useCallback } from "react";
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import auth from "@/firebase/auth";
import db from "@/firebase/firestore";
import {
  subscribeToUserDevices,
  subscribeToCompanyDevices, // ✅ NUEVA importación
  syncUserDataToDevices,
  syncUserDataToCompanyDevices, // ✅ NUEVA importación
  getUserDevices,
  getCompanyDevices, // ✅ NUEVA importación
} from "@/utils/deviceManager";

/**
 * Hook para manejar sincronización automática de dispositivos
 * - Escucha cambios en userData del usuario
 * - Sincroniza automáticamente a todos los dispositivos de la empresa
 * - Proporciona lista de dispositivos en tiempo real
 *
 * ✅ ACTUALIZADO: Ahora maneja empresa en lugar de solo usuario
 */
export const useDeviceSync = (empresaSeleccionada = null) => {
  const [user, loading, error] = useAuthState(auth);
  const [devices, setDevices] = useState([]);
  const [userData, setUserData] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  // ✅ NUEVOS estados para manejo de empresa
  const [userCompany, setUserCompany] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // ✅ Determinar si el usuario es admin
  useEffect(() => {
    if (user?.email) {
      const adminEmails = [
        "uppermex10@gmail.com",
        "ulises.jacobo@hotmail.com",
        "contacto@upperds.mx",
      ];
      setIsAdmin(adminEmails.includes(user.email));
    }
  }, [user]);

  // Cargar datos iniciales del usuario
  useEffect(() => {
    if (!user) {
      setUserData(null);
      setDevices([]);
      setUserCompany(null);
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
          setUserCompany(newUserData.empresa);

          // Auto-sincronizar a dispositivos cuando userData cambia
          if (newUserData) {
            try {
              setSyncing(true);
              setSyncError(null);

              // ✅ CAMBIO: Sincronizar por empresa en lugar de usuario
              if (newUserData.empresa) {
                await syncUserDataToCompanyDevices(
                  newUserData.empresa,
                  newUserData
                );
                console.log(
                  "✅ Dispositivos de empresa sincronizados automáticamente"
                );
              } else {
                // Fallback al método anterior
                await syncUserDataToDevices(user.uid, newUserData);
                console.log(
                  "✅ Dispositivos de usuario sincronizados automáticamente"
                );
              }
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

  // ✅ ACTUALIZADO: Escuchar dispositivos por empresa o usuario
  useEffect(() => {
    if (!user) {
      setDevices([]);
      return;
    }

    let unsubscribeDevices;

    // ✅ LÓGICA: Solo usar empresa si se especifica Y el usuario es admin
    if (isAdmin && empresaSeleccionada) {
      // Admin seleccionó una empresa específica - usar empresa
      unsubscribeDevices = subscribeToCompanyDevices(
        empresaSeleccionada,
        (companyDevices) => {
          setDevices(companyDevices);
          console.log(
            `📱 ${companyDevices.length} dispositivos cargados para empresa ${empresaSeleccionada}`
          );
        }
      );
    } else if (!isAdmin && userCompany) {
      // Usuario normal - usar su empresa
      unsubscribeDevices = subscribeToCompanyDevices(
        userCompany,
        (companyDevices) => {
          setDevices(companyDevices);
          console.log(
            `📱 ${companyDevices.length} dispositivos cargados para empresa ${userCompany}`
          );
        }
      );
    } else {
      // ✅ FALLBACK: Comportamiento original (por usuario)
      unsubscribeDevices = subscribeToUserDevices(user.uid, (userDevices) => {
        setDevices(userDevices);
        console.log(
          `📱 ${userDevices.length} dispositivos cargados para usuario`
        );
      });
    }

    return () => unsubscribeDevices();
  }, [user, isAdmin, empresaSeleccionada, userCompany]);

  // ✅ ACTUALIZADA: Función para forzar sincronización manual
  const forceSyncDevices = useCallback(async () => {
    if (!user || !userData) return;

    try {
      setSyncing(true);
      setSyncError(null);

      // Determinar qué empresa usar
      let targetCompany = null;

      if (isAdmin && empresaSeleccionada) {
        targetCompany = empresaSeleccionada;
      } else if (userData.empresa) {
        targetCompany = userData.empresa;
      }

      if (targetCompany) {
        await syncUserDataToCompanyDevices(targetCompany, userData);
        console.log(
          `✅ Sincronización manual completada para empresa ${targetCompany}`
        );
      } else {
        // Fallback al método original
        await syncUserDataToDevices(user.uid, userData);
        console.log("✅ Sincronización manual completada para usuario");
      }
    } catch (error) {
      console.error("❌ Error en sincronización manual:", error);
      setSyncError(error.message);
    } finally {
      setSyncing(false);
    }
  }, [user, userData, isAdmin, empresaSeleccionada]);

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

    // ✅ NUEVOS estados para empresa
    userCompany,
    isAdmin,

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
 * Hook simplificado para obtener dispositivos por empresa
 * ✅ NUEVO: Específico para empresa
 */
export const useCompanyDevices = (empresa) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!empresa) {
      setLoading(false);
      setDevices([]);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToCompanyDevices(empresa, (companyDevices) => {
      setDevices(companyDevices);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [empresa]);

  return { devices, loading, hasDevices: devices.length > 0 };
};

/**
 * Hook simplificado solo para obtener dispositivos del usuario
 * ✅ MANTENIDO: Para compatibilidad
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
 * ✅ MANTENIDO: Sin cambios
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
