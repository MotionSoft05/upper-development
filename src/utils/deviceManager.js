// src/utils/deviceManager.js - Versión mejorada
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
} from "firebase/firestore";
import db from "@/firebase/firestore";

// Desvincular dispositivo
export const unlinkDevice = async (deviceCode, userId) => {
  try {
    console.log(
      `🔗 Intentando desvincular dispositivo: ${deviceCode} para usuario: ${userId}`
    );

    const deviceRef = doc(db, "devices", deviceCode);
    const deviceDoc = await getDoc(deviceRef);

    if (!deviceDoc.exists()) {
      throw new Error("Dispositivo no encontrado");
    }

    const deviceData = deviceDoc.data();
    console.log("📋 Datos del dispositivo:", {
      ownerId: deviceData.ownerId,
      userId: userId,
      status: deviceData.status,
      code: deviceCode,
    });

    // Verificar permisos - permitir si es el propietario O si el dispositivo está en waiting
    if (deviceData.ownerId !== userId && deviceData.status !== "waiting") {
      console.error("❌ Error de permisos:", {
        deviceOwnerId: deviceData.ownerId,
        requestingUserId: userId,
        match: deviceData.ownerId === userId,
      });
      throw new Error("No tienes permisos para desvincular este dispositivo");
    }

    // Resetear a estado inicial
    const resetData = {
      status: "waiting",
      ownerId: null,
      ownerEmail: null,
      linkedAt: null,
      userData: null,
      configuration: null, // También limpiar configuración
      lastUpdated: serverTimestamp(),
    };

    await updateDoc(deviceRef, resetData);
    console.log(`✅ Dispositivo ${deviceCode} desvinculado exitosamente`);
  } catch (error) {
    console.error("❌ Error desvinculando dispositivo:", error);
    throw error;
  }
};

// Eliminar dispositivo completamente
export const deleteDevice = async (deviceCode, userId) => {
  try {
    console.log(
      `🗑️ Intentando eliminar dispositivo: ${deviceCode} para usuario: ${userId}`
    );

    const deviceRef = doc(db, "devices", deviceCode);
    const deviceDoc = await getDoc(deviceRef);

    if (!deviceDoc.exists()) {
      throw new Error("Dispositivo no encontrado");
    }

    const deviceData = deviceDoc.data();
    console.log("📋 Datos del dispositivo a eliminar:", {
      ownerId: deviceData.ownerId,
      userId: userId,
      status: deviceData.status,
      code: deviceCode,
    });

    // Verificar permisos - permitir si es el propietario O si el dispositivo está en waiting
    if (deviceData.ownerId !== userId && deviceData.status !== "waiting") {
      console.error("❌ Error de permisos para eliminar:", {
        deviceOwnerId: deviceData.ownerId,
        requestingUserId: userId,
        match: deviceData.ownerId === userId,
      });
      throw new Error("No tienes permisos para eliminar este dispositivo");
    }

    await deleteDoc(deviceRef);
    console.log(`✅ Dispositivo ${deviceCode} eliminado exitosamente`);
  } catch (error) {
    console.error("❌ Error eliminando dispositivo:", error);
    throw error;
  }
};

// Obtener dispositivos de un usuario con mejor logging
export const getUserDevices = async (userId) => {
  try {
    console.log(`📱 Obteniendo dispositivos para usuario: ${userId}`);

    const q = query(collection(db, "devices"), where("ownerId", "==", userId));
    const querySnapshot = await getDocs(q);

    const devices = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(
      `📱 Encontrados ${devices.length} dispositivos:`,
      devices.map((d) => ({
        code: d.code || d.id,
        status: d.status,
        ownerId: d.ownerId,
      }))
    );

    return devices;
  } catch (error) {
    console.error("❌ Error obteniendo dispositivos del usuario:", error);
    throw error;
  }
};

// Función para verificar permisos de dispositivo
export const checkDevicePermissions = async (deviceCode, userId) => {
  try {
    const deviceRef = doc(db, "devices", deviceCode);
    const deviceDoc = await getDoc(deviceRef);

    if (!deviceDoc.exists()) {
      return { hasPermission: false, reason: "Dispositivo no encontrado" };
    }

    const deviceData = deviceDoc.data();

    // El usuario tiene permisos si:
    // 1. Es el propietario del dispositivo
    // 2. El dispositivo está en estado "waiting" (sin propietario)
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

// Resto de las funciones existentes...
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
    const deviceDoc = await getDoc(doc(db, "devices", code));
    return !deviceDoc.exists();
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

export const createDevice = async (code) => {
  try {
    const deviceData = {
      code,
      status: "waiting",
      createdAt: serverTimestamp(),
      linkedAt: null,
      ownerId: null,
      ownerEmail: null,
      userData: null,
      lastSeen: null,
      deviceInfo: {
        platform: "android",
        appVersion: "1.0.0",
      },
    };

    await setDoc(doc(db, "devices", code), deviceData);
    console.log(`Dispositivo creado con código: ${code}`);
    return deviceData;
  } catch (error) {
    console.error("Error creando dispositivo:", error);
    throw error;
  }
};

export const linkDevice = async (code, userId, userData) => {
  try {
    const deviceRef = doc(db, "devices", code);
    const deviceDoc = await getDoc(deviceRef);

    if (!deviceDoc.exists()) {
      throw new Error("Dispositivo no encontrado");
    }

    const deviceData = deviceDoc.data();
    if (deviceData.status === "linked" && deviceData.ownerId !== userId) {
      throw new Error("Este dispositivo ya está vinculado a otro usuario");
    }

    const updateData = {
      status: "linked",
      ownerId: userId,
      ownerEmail: userData.email,
      linkedAt: serverTimestamp(),
      userData: userData,
      lastUpdated: serverTimestamp(),
    };

    await updateDoc(deviceRef, updateData);
    console.log(`Dispositivo ${code} vinculado exitosamente`);
    return updateData;
  } catch (error) {
    console.error("Error vinculando dispositivo:", error);
    throw error;
  }
};

export const subscribeToUserDevices = (userId, callback) => {
  const q = query(collection(db, "devices"), where("ownerId", "==", userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const devices = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(devices);
    },
    (error) => {
      console.error("Error en listener de dispositivos:", error);
      callback([]);
    }
  );
};

export const updateDeviceHeartbeat = async (
  deviceCode,
  additionalData = {}
) => {
  try {
    const deviceRef = doc(db, "devices", deviceCode);

    const updateData = {
      lastSeen: serverTimestamp(),
      status: "online",
      ...additionalData,
    };

    await updateDoc(deviceRef, updateData);
  } catch (error) {
    console.error("Error actualizando heartbeat:", error);
    throw error;
  }
};

export const syncUserDataToDevices = async (userId, userData) => {
  try {
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
      `Sincronizados ${devices.length} dispositivos del usuario ${userId}`
    );
  } catch (error) {
    console.error("Error sincronizando userData a dispositivos:", error);
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
