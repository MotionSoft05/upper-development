// src/utils/deviceManager.js - Nueva Arquitectura
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  orderBy,
} from "firebase/firestore";
import db from "@/firebase/firestore";

// 🆕 NUEVA ARQUITECTURA: Vincular dispositivo desde código temporal
export const linkDevice = async (code, userId, userData) => {
  try {
    console.log(
      `🔗 Intentando vincular dispositivo: ${code} para usuario: ${userId}`
    );

    // 1. Leer datos del código temporal
    const tempCodeRef = doc(db, "devices_temp", code);
    const tempDoc = await getDoc(tempCodeRef);

    if (!tempDoc.exists()) {
      throw new Error("Código temporal no encontrado o expirado");
    }

    const tempData = tempDoc.data();

    // 2. Verificar que el código no haya expirado (24 horas)
    const now = new Date();
    let createdAt;
    let hoursDiff;

    try {
      if (tempData.createdAt) {
        if (typeof tempData.createdAt.toDate === "function") {
          // Es un Timestamp de Firebase
          createdAt = tempData.createdAt.toDate();
        } else if (typeof tempData.createdAt === "string") {
          // Es una string ISO
          createdAt = new Date(tempData.createdAt);
        } else if (tempData.createdAt instanceof Date) {
          // Ya es un objeto Date
          createdAt = tempData.createdAt;
        } else {
          // Objeto con seconds y nanoseconds (Timestamp serializado)
          if (tempData.createdAt.seconds) {
            createdAt = new Date(tempData.createdAt.seconds * 1000);
          } else {
            throw new Error("Formato de fecha no reconocido");
          }
        }
      } else {
        // No hay fecha, asumir que es muy viejo
        createdAt = new Date(0);
      }

      // 🔧 FIX: Forzar ambas fechas a UTC para evitar problemas de zona horaria
      const nowUTC = now.getTime();
      const createdAtUTC = createdAt.getTime();

      hoursDiff = (nowUTC - createdAtUTC) / (1000 * 60 * 60);

      console.log(
        `🌍 linkDevice - Fecha actual UTC:`,
        new Date(nowUTC).toISOString()
      );
      console.log(
        `🌍 linkDevice - Fecha creación UTC:`,
        new Date(createdAtUTC).toISOString()
      );
      console.log(`⏱️ linkDevice - Diferencia: ${hoursDiff.toFixed(2)} horas`);
    } catch (error) {
      console.error(
        `❌ Error procesando fecha en linkDevice:`,
        error,
        tempData.createdAt
      );
      // En caso de error, asumir que no ha expirado para no bloquear
      hoursDiff = 0;
    }

    if (hoursDiff > 24) {
      // 🔧 Cambié de 1 hora a 24 horas
      throw new Error("El código temporal ha expirado (límite: 24 horas)");
    }

    // 3. Verificar estado
    if (tempData.status !== "waiting") {
      throw new Error("El código temporal ya ha sido utilizado");
    }

    // 4. Crear dispositivo permanente con nuevo ID
    const deviceId = `device_${Date.now()}_${userId}`;
    const deviceRef = doc(db, "devices", deviceId);

    const permanentDeviceData = {
      deviceId,
      code: code, // Mantener referencia al código original
      ownerId: userId,
      ownerEmail: userData.email,
      status: "linked",
      linkedAt: serverTimestamp(),
      userData: userData,
      deviceInfo: tempData.deviceInfo || {
        platform: "android",
        appVersion: "1.0.0",
      },
      createdAt: tempData.createdAt,
      lastUpdated: serverTimestamp(),
      // Heredar otros datos del código temporal si existen
      ...tempData,
      // Sobrescribir con datos permanentes
      deviceId,
      ownerId: userId,
      ownerEmail: userData.email,
      status: "linked",
    };

    await setDoc(deviceRef, permanentDeviceData);

    // 5. Actualizar código temporal con deviceId para transición suave
    await updateDoc(tempCodeRef, {
      status: "linked",
      deviceId: deviceId,
      linkedAt: serverTimestamp(),
      ownerId: userId,
    });

    console.log(`✅ Dispositivo vinculado: ${code} → ${deviceId}`);
    return { deviceId, ...permanentDeviceData };
  } catch (error) {
    console.error("❌ Error vinculando dispositivo:", error);
    throw error;
  }
};

// 🆕 NUEVA ARQUITECTURA: Desvincular dispositivo permanente
export const unlinkDevice = async (deviceId, userId) => {
  try {
    console.log(
      `🔗 Intentando desvincular dispositivo: ${deviceId} para usuario: ${userId}`
    );

    const deviceRef = doc(db, "devices", deviceId);
    const deviceDoc = await getDoc(deviceRef);

    if (!deviceDoc.exists()) {
      throw new Error("Dispositivo no encontrado");
    }

    const deviceData = deviceDoc.data();
    console.log("📋 Datos del dispositivo:", {
      ownerId: deviceData.ownerId,
      userId: userId,
      status: deviceData.status,
      deviceId: deviceId,
    });

    // Verificar permisos
    if (deviceData.ownerId !== userId) {
      throw new Error("No tienes permisos para desvincular este dispositivo");
    }

    // Resetear a estado inicial (pero mantener en devices, no mover a devices_temp)
    const resetData = {
      status: "waiting",
      ownerId: null,
      ownerEmail: null,
      linkedAt: null,
      userData: null,
      configuration: null,
      lastUpdated: serverTimestamp(),
    };

    await updateDoc(deviceRef, resetData);
    console.log(`✅ Dispositivo ${deviceId} desvinculado exitosamente`);

    return resetData;
  } catch (error) {
    console.error("❌ Error desvinculando dispositivo:", error);
    throw error;
  }
};

// 🆕 NUEVA ARQUITECTURA: Eliminar dispositivo permanente completamente
export const deleteDevice = async (deviceId, userId) => {
  try {
    console.log(
      `🗑️ Intentando eliminar dispositivo: ${deviceId} para usuario: ${userId}`
    );

    const deviceRef = doc(db, "devices", deviceId);
    const deviceDoc = await getDoc(deviceRef);

    if (!deviceDoc.exists()) {
      throw new Error("Dispositivo no encontrado");
    }

    const deviceData = deviceDoc.data();
    console.log("📋 Datos del dispositivo a eliminar:", {
      ownerId: deviceData.ownerId,
      userId: userId,
      status: deviceData.status,
      deviceId: deviceId,
    });

    // Verificar permisos
    if (deviceData.ownerId !== userId) {
      throw new Error("No tienes permisos para eliminar este dispositivo");
    }

    await deleteDoc(deviceRef);
    console.log(`✅ Dispositivo ${deviceId} eliminado exitosamente`);

    return true;
  } catch (error) {
    console.error("❌ Error eliminando dispositivo:", error);
    throw error;
  }
};

// 🆕 NUEVA ARQUITECTURA: Validar código temporal
export const validateTempCode = async (code) => {
  try {
    const tempCodeRef = doc(db, "devices_temp", code);
    const tempDoc = await getDoc(tempCodeRef);

    if (!tempDoc.exists()) {
      return { valid: false, message: "Código no encontrado" };
    }

    const data = tempDoc.data();
    const now = new Date();
    let createdAt;
    let hoursDiff;

    try {
      if (data.createdAt) {
        if (typeof data.createdAt.toDate === "function") {
          // Es un Timestamp de Firebase
          createdAt = data.createdAt.toDate();
        } else if (typeof data.createdAt === "string") {
          // Es una string ISO
          createdAt = new Date(data.createdAt);
        } else if (data.createdAt instanceof Date) {
          // Ya es un objeto Date
          createdAt = data.createdAt;
        } else {
          // Objeto con seconds y nanoseconds (Timestamp serializado)
          if (data.createdAt.seconds) {
            createdAt = new Date(data.createdAt.seconds * 1000);
          } else {
            throw new Error("Formato de fecha no reconocido");
          }
        }
      } else {
        // No hay fecha, asumir que es muy viejo
        createdAt = new Date(0);
      }

      // 🔧 FIX: Forzar ambas fechas a UTC para evitar problemas de zona horaria
      const nowUTC = now.getTime();
      const createdAtUTC = createdAt.getTime();

      hoursDiff = (nowUTC - createdAtUTC) / (1000 * 60 * 60);
    } catch (error) {
      console.error(
        `❌ Error procesando fecha en validateTempCode:`,
        error,
        data.createdAt
      );
      // En caso de error, asumir que no ha expirado para no bloquear
      hoursDiff = 0;
    }

    if (hoursDiff > 24) {
      // 🔧 Cambié de 1 hora a 24 horas
      return { valid: false, message: "Código expirado (límite: 24 horas)" };
    }

    if (data.status !== "waiting") {
      return { valid: false, message: "Código ya utilizado" };
    }

    return {
      valid: true,
      deviceInfo: data,
      hoursRemaining: Math.max(0, 24 - hoursDiff).toFixed(1),
    };
  } catch (error) {
    console.error("Error validando código temporal:", error);
    return { valid: false, message: "Error de conexión" };
  }
};

// 🆕 NUEVA ARQUITECTURA: Suscribirse a dispositivos permanentes del usuario
export const subscribeToUserDevices = (userId, callback) => {
  if (!userId) {
    console.error("❌ subscribeToUserDevices: userId es requerido");
    return () => {};
  }

  console.log(
    `🔍 Suscribiéndose a dispositivos permanentes para usuario: ${userId}`
  );

  // 🔧 FIX: Remover orderBy para evitar requerir índice compuesto
  const q = query(
    collection(db, "devices"),
    where("ownerId", "==", userId)
    // orderBy("linkedAt", "desc") // Comentado temporalmente
  );

  return onSnapshot(
    q,
    (snapshot) => {
      let devices = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // 🔧 Ordenar en JavaScript en lugar de Firebase
      devices = devices.sort((a, b) => {
        const aTime = a.linkedAt?.toDate?.() || new Date(a.linkedAt || 0);
        const bTime = b.linkedAt?.toDate?.() || new Date(b.linkedAt || 0);
        return bTime.getTime() - aTime.getTime(); // Más reciente primero
      });

      console.log(`📱 Dispositivos actualizados: ${devices.length}`);
      callback(devices);
    },
    (error) => {
      console.error("❌ Error escuchando dispositivos:", error);
      callback([]);
    }
  );
};

// 🆕 NUEVA ARQUITECTURA: Obtener dispositivo por ID
export const getDeviceById = async (deviceId) => {
  try {
    const deviceRef = doc(db, "devices", deviceId);
    const deviceDoc = await getDoc(deviceRef);

    if (!deviceDoc.exists()) {
      return null;
    }

    return {
      id: deviceDoc.id,
      ...deviceDoc.data(),
    };
  } catch (error) {
    console.error("Error obteniendo dispositivo:", error);
    return null;
  }
};

// 🆕 NUEVA ARQUITECTURA: Actualizar configuración de dispositivo
export const updateDeviceConfiguration = async (
  deviceId,
  configuration,
  userId
) => {
  try {
    const deviceRef = doc(db, "devices", deviceId);
    const deviceDoc = await getDoc(deviceRef);

    if (!deviceDoc.exists()) {
      throw new Error("Dispositivo no encontrado");
    }

    const deviceData = deviceDoc.data();

    // Verificar permisos
    if (deviceData.ownerId !== userId) {
      throw new Error("No tienes permisos para configurar este dispositivo");
    }

    const updateData = {
      configuration: {
        ...configuration,
        configuredAt: serverTimestamp(),
      },
      status: "configured",
      lastUpdated: serverTimestamp(),
    };

    await updateDoc(deviceRef, updateData);
    console.log(`✅ Dispositivo ${deviceId} configurado exitosamente`);

    return updateData;
  } catch (error) {
    console.error("❌ Error actualizando configuración:", error);
    throw error;
  }
};

// 🆕 NUEVA ARQUITECTURA: Obtener estadísticas de dispositivos del usuario
export const getUserDeviceStats = async (userId) => {
  try {
    const q = query(collection(db, "devices"), where("ownerId", "==", userId));
    const snapshot = await getDocs(q);

    const devices = snapshot.docs.map((doc) => doc.data());

    const stats = {
      total: devices.length,
      online: devices.filter((d) => d.status === "online").length,
      configured: devices.filter((d) => d.status === "configured").length,
      linked: devices.filter((d) => d.status === "linked").length,
      offline: devices.filter((d) => d.status === "offline" || !d.status)
        .length,
    };

    return stats;
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    return {
      total: 0,
      online: 0,
      configured: 0,
      linked: 0,
      offline: 0,
    };
  }
};

// 🧹 NUEVA ARQUITECTURA: Función de limpieza (para uso administrativo)
export const cleanupExpiredTempCodes = async () => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000); // 🔧 Cambié de 1 hora a 24 horas
    const q = query(
      collection(db, "devices_temp"),
      where("createdAt", "<", twentyFourHoursAgo)
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(
      `🧹 Limpieza completada: ${snapshot.docs.length} códigos temporales eliminados (>24h)`
    );

    return snapshot.docs.length;
  } catch (error) {
    console.error("❌ Error en limpieza de códigos temporales:", error);
    throw error;
  }
};

// 🔄 COMPATIBILIDAD: Función legacy para backward compatibility
export const createDevice = async (code) => {
  console.warn(
    "⚠️ createDevice() está deprecado. Los códigos temporales se crean desde la app."
  );
  throw new Error(
    "La creación de dispositivos ahora se maneja desde la app móvil"
  );
};

// 🔄 COMPATIBILIDAD: Función legacy actualizada
export const getDeviceData = async (code) => {
  try {
    // Buscar primero en devices_temp
    const tempCodeRef = doc(db, "devices_temp", code);
    const tempDoc = await getDoc(tempCodeRef);

    if (tempDoc.exists()) {
      return {
        id: tempDoc.id,
        ...tempDoc.data(),
        isTemporary: true,
      };
    }

    // Luego buscar en devices permanentes
    const deviceRef = doc(db, "devices", code);
    const deviceDoc = await getDoc(deviceRef);

    if (deviceDoc.exists()) {
      return {
        id: deviceDoc.id,
        ...deviceDoc.data(),
        isTemporary: false,
      };
    }

    return null;
  } catch (error) {
    console.error("Error obteniendo datos del dispositivo:", error);
    return null;
  }
};

// 🔄 COMPATIBILIDAD: Funciones adicionales que otros archivos necesitan
export const getUserDevices = async (userId) => {
  try {
    const q = query(collection(db, "devices"), where("ownerId", "==", userId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error obteniendo dispositivos del usuario:", error);
    return [];
  }
};

export const syncUserDataToDevices = async (userId, userData) => {
  try {
    console.log(`🔄 Sincronizando userData para usuario: ${userId}`);

    const devices = await getUserDevices(userId);

    if (devices.length === 0) {
      console.log("Usuario no tiene dispositivos para sincronizar");
      return;
    }

    const batch = writeBatch(db);

    devices.forEach((device) => {
      const deviceRef = doc(db, "devices", device.id);
      batch.update(deviceRef, {
        userData: userData,
        lastUpdated: serverTimestamp(),
      });
    });

    await batch.commit();
    console.log(
      `✅ Sincronizados ${devices.length} dispositivos del usuario ${userId}`
    );
  } catch (error) {
    console.error("❌ Error sincronizando userData a dispositivos:", error);
    throw error;
  }
};

export const updateDeviceHeartbeat = async (
  deviceCode,
  additionalData = {}
) => {
  try {
    // 🆕 NUEVA ARQUITECTURA: Buscar en devices primero (dispositivos permanentes)
    const deviceRef = doc(db, "devices", deviceCode);
    const deviceDoc = await getDoc(deviceRef);

    if (deviceDoc.exists()) {
      const updateData = {
        lastSeen: serverTimestamp(),
        status: "online",
        ...additionalData,
      };
      await updateDoc(deviceRef, updateData);
      return;
    }

    // Si no está en devices, buscar por deviceId que contenga el código
    const q = query(collection(db, "devices"), where("code", "==", deviceCode));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const deviceDoc = snapshot.docs[0];
      const updateData = {
        lastSeen: serverTimestamp(),
        status: "online",
        ...additionalData,
      };
      await updateDoc(deviceDoc.ref, updateData);
    }
  } catch (error) {
    console.error("Error actualizando heartbeat:", error);
    throw error;
  }
};

export const createUserDeviceSyncListener = (userId, userData) => {
  if (!userId || !userData) return () => {};

  return onSnapshot(doc(db, "usuarios", userId), async (doc) => {
    if (doc.exists()) {
      const updatedUserData = doc.data();
      await syncUserDataToDevices(userId, updatedUserData);
    }
  });
};

export const generateDeviceCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const isCodeUnique = async (code) => {
  try {
    // Verificar en devices_temp
    const tempDoc = await getDoc(doc(db, "devices_temp", code));
    if (tempDoc.exists()) return false;

    // Verificar en devices permanentes
    const deviceDoc = await getDoc(doc(db, "devices", code));
    if (deviceDoc.exists()) return false;

    return true;
  } catch (error) {
    console.error("Error verificando código:", error);
    return false;
  }
};

export const generateUniqueDeviceCode = async () => {
  let code;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    code = generateDeviceCode();
    isUnique = await isCodeUnique(code);
    attempts++;
  }

  if (!isUnique) {
    throw new Error(
      "No se pudo generar un código único después de varios intentos"
    );
  }

  return code;
};

export const verifyDevicePermissions = async (deviceCode, userId) => {
  try {
    // Buscar dispositivo por código
    const deviceRef = doc(db, "devices", deviceCode);
    const deviceDoc = await getDoc(deviceRef);

    if (!deviceDoc.exists()) {
      // Si no está con ese ID, buscar por código en la colección
      const q = query(
        collection(db, "devices"),
        where("code", "==", deviceCode)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return { hasPermission: false, reason: "Dispositivo no encontrado" };
      }

      const deviceData = snapshot.docs[0].data();

      const hasPermission =
        deviceData.ownerId === userId ||
        deviceData.status === "waiting" ||
        !deviceData.ownerId;

      return {
        hasPermission,
        reason: hasPermission
          ? "Permisos válidos"
          : "No eres el propietario de este dispositivo",
        deviceData: {
          ownerId: deviceData.ownerId,
          status: deviceData.status,
          code: deviceCode,
        },
      };
    }

    const deviceData = deviceDoc.data();
    const hasPermission =
      deviceData.ownerId === userId ||
      deviceData.status === "waiting" ||
      !deviceData.ownerId;

    return {
      hasPermission,
      reason: hasPermission
        ? "Permisos válidos"
        : "No eres el propietario de este dispositivo",
      deviceData: {
        ownerId: deviceData.ownerId,
        status: deviceData.status,
        code: deviceCode,
      },
    };
  } catch (error) {
    console.error("Error verificando permisos:", error);
    return { hasPermission: false, reason: "Error verificando permisos" };
  }
};

// 📊 Exportar funciones principales
export default {
  // Nuevas funciones principales
  linkDevice,
  unlinkDevice,
  deleteDevice,
  validateTempCode,
  subscribeToUserDevices,
  getDeviceById,
  updateDeviceConfiguration,
  getUserDeviceStats,
  cleanupExpiredTempCodes,

  // Funciones de compatibilidad
  getUserDevices,
  syncUserDataToDevices,
  updateDeviceHeartbeat,
  createUserDeviceSyncListener,
  generateDeviceCode,
  isCodeUnique,
  generateUniqueDeviceCode,
  verifyDevicePermissions,

  // Legacy functions
  createDevice,
  getDeviceData,
};

// Utilidad: Buscar dispositivo por code y devolver {id, ...data}
export const getDeviceByCode = async (deviceCode) => {
  const q = query(collection(db, "devices"), where("code", "==", deviceCode));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  const docSnap = querySnapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
};

// ✅ NUEVA función: Solo busca en 'devices' (no en devices_temp) usando el campo code
export const validateDeviceCode = async (deviceCode) => {
  try {
    console.log(`🔍 Validando código: ${deviceCode}`);
    console.log(`📋 Buscando por campo 'code' = '${deviceCode}' en devices`);

    const device = await getDeviceByCode(deviceCode);
    if (!device) {
      console.log(`❌ Dispositivo ${deviceCode} no encontrado en devices`);
      return {
        found: false,
        error: "Dispositivo no encontrado",
        message:
          "Verifica que el código sea correcto o que el dispositivo esté encendido.",
      };
    }

    console.log(`✅ Dispositivo encontrado:`, {
      documentId: device.id,
      code: device.code,
      status: device.status,
      ownerId: device.ownerId,
    });

    return {
      found: true,
      device: device,
    };
  } catch (error) {
    console.error("❌ Error validando dispositivo:", error);
    return {
      found: false,
      error: "Error de conexión",
      message: "No se pudo verificar el dispositivo. Inténtalo de nuevo.",
    };
  }
};

// ✅ NUEVA función: Validación completa con verificación de estado (usando campo code)
export const validateDeviceForLinking = async (deviceCode, userId) => {
  try {
    console.log(`🔍 Validando código para vinculación: ${deviceCode}`);

    // Usar la nueva función de validación
    const validation = await validateDeviceCode(deviceCode);

    if (!validation.found) {
      return validation; // Retornar error si no se encuentra
    }

    const deviceData = validation.device;

    // Verificar estado del dispositivo
    if (deviceData.status === "linked" && deviceData.ownerId !== userId) {
      return {
        found: true,
        canLink: false,
        error: "Dispositivo ya vinculado",
        message: "Este dispositivo ya está vinculado a otra cuenta.",
      };
    }

    if (deviceData.status === "linked" && deviceData.ownerId === userId) {
      return {
        found: true,
        canLink: false,
        error: "Ya es tuyo",
        message: "Este dispositivo ya está vinculado a tu cuenta.",
        isOwned: true,
      };
    }

    // ✅ Dispositivo disponible para vincular
    return {
      found: true,
      canLink: true,
      success: true,
      device: deviceData,
      status: deviceData.status,
      createdAt: deviceData.createdAt,
      message: "Dispositivo disponible para vincular",
    };
  } catch (error) {
    console.error("❌ Error validando dispositivo para vinculación:", error);
    return {
      found: false,
      error: "Error de conexión",
      message: "No se pudo verificar el dispositivo. Inténtalo de nuevo.",
    };
  }
};

// ✅ NUEVA función mejorada de vinculación (usando campo code)
export const linkDeviceImproved = async (code, userId, userData) => {
  try {
    console.log(`🔗 Iniciando vinculación: ${code} -> Usuario: ${userId}`);

    const device = await getDeviceByCode(code);
    if (!device) {
      throw new Error("Dispositivo no encontrado");
    }

    // Verificar que el dispositivo no esté vinculado a otro usuario
    if (device.status === "linked" && device.ownerId !== userId) {
      throw new Error("Este dispositivo ya está vinculado a otro usuario");
    }

    const updateData = {
      status: "linked",
      ownerId: userId,
      ownerEmail: userData.email,
      linkedAt: serverTimestamp(),
      userData: userData, // ✅ Copiar userData completo
      lastUpdated: serverTimestamp(),
    };

    const deviceRef = doc(db, "devices", device.id);
    await updateDoc(deviceRef, updateData);

    console.log(`✅ Dispositivo ${code} vinculado exitosamente`);
    console.log(`📋 UserData copiado:`, {
      nombre: userData.nombre,
      empresa: userData.empresa,
      email: userData.email,
      licencias: {
        ps: userData.ps,
        pd: userData.pd,
        pt: userData.pt,
        pp: userData.pp,
      },
    });

    return updateData;
  } catch (error) {
    console.error("❌ Error vinculando dispositivo:", error);
    throw error;
  }
};

// ✅ NUEVA función mejorada de desvinculación (usando campo code)
export const unlinkDeviceImproved = async (
  deviceCode,
  userId,
  action = "reset"
) => {
  try {
    console.log(
      `🔗 ${
        action === "delete" ? "Eliminando" : "Desvinculando"
      } dispositivo: ${deviceCode}`
    );

    const device = await getDeviceByCode(deviceCode);
    if (!device) {
      throw new Error("Dispositivo no encontrado");
    }

    // Verificar permisos
    if (device.ownerId !== userId && device.status !== "waiting") {
      throw new Error("No tienes permisos para realizar esta acción");
    }

    const deviceRef = doc(db, "devices", device.id);

    if (action === "delete") {
      // ✅ CAMBIO 5: Eliminar completamente
      await deleteDoc(deviceRef);
      console.log(`✅ Dispositivo ${deviceCode} eliminado completamente`);
    } else {
      // ✅ CAMBIO 6: Resetear a estado "waiting"
      const resetData = {
        status: "waiting",
        ownerId: null,
        ownerEmail: null,
        linkedAt: null,
        userData: null,
        configuration: null,
        lastUpdated: serverTimestamp(),
      };

      await updateDoc(deviceRef, resetData);
      console.log(`✅ Dispositivo ${deviceCode} reseteado a "waiting"`);
    }
  } catch (error) {
    console.error(`❌ Error en desvinculación:`, error);
    throw error;
  }
};
