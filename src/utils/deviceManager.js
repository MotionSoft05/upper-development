// src/utils/deviceManager.js - Versión actualizada para empresa
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

// Vincular dispositivo - MODIFICADO para empresa y para buscar por campo code
export const linkDevice = async (deviceCode, userId, userData) => {
  try {
    console.log(
      `🔗 Vinculando dispositivo código: ${deviceCode} al usuario: ${userId}`
    );

    // ✅ CORREGIDO: Buscar por campo 'code' no por ID de documento
    const q = query(collection(db, "devices"), where("code", "==", deviceCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("Dispositivo no encontrado");
    }

    // Tomar el primer documento encontrado
    const deviceDoc = querySnapshot.docs[0];
    const deviceData = deviceDoc.data();
    const deviceId = deviceDoc.id;

    console.log(`📋 Datos del dispositivo encontrado:`, {
      documentId: deviceId,
      code: deviceData.code,
      status: deviceData.status,
      ownerId: deviceData.ownerId,
      empresa: deviceData.empresa,
    });

    if (deviceData.status === "linked" && deviceData.ownerId !== userId) {
      throw new Error("Este dispositivo ya está vinculado a otro usuario");
    }

    // ✅ CAMBIO PRINCIPAL: Agregar empresa del usuario
    const updateData = {
      status: "linked",
      ownerId: userId,
      ownerEmail: userData.email,
      empresa: userData.empresa, // ✅ NUEVO: Vincular a empresa
      linkedAt: serverTimestamp(),
      userData: userData,
      lastUpdated: serverTimestamp(),
    };

    // ✅ CORREGIDO: Usar el ID del documento encontrado
    const deviceRef = doc(db, "devices", deviceId);
    await updateDoc(deviceRef, updateData);

    console.log(
      `✅ Dispositivo ${deviceCode} (${deviceId}) vinculado exitosamente a empresa ${userData.empresa}`
    );
    return updateData;
  } catch (error) {
    console.error("❌ Error vinculando dispositivo:", error);
    throw error;
  }
};

// ✅ NUEVA FUNCIÓN: Suscribirse a dispositivos de la empresa
export const subscribeToCompanyDevices = (empresa, callback) => {
  const q = query(collection(db, "devices"), where("empresa", "==", empresa));

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
      console.error("Error en subscripción de dispositivos de empresa:", error);
      callback([]);
    }
  );
};

// ✅ MODIFICADA: Función original mantiene compatibilidad
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
      console.error(
        "Error en subscripción de dispositivos del usuario:",
        error
      );
      callback([]);
    }
  );
};

// ✅ NUEVA FUNCIÓN: Obtener dispositivos por empresa
export const getCompanyDevices = async (empresa) => {
  try {
    console.log(`📱 Obteniendo dispositivos para empresa: ${empresa}`);

    const q = query(collection(db, "devices"), where("empresa", "==", empresa));
    const querySnapshot = await getDocs(q);

    const devices = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(
      `📱 Encontrados ${devices.length} dispositivos para empresa ${empresa}:`,
      devices.map((d) => ({
        code: d.code || d.id,
        status: d.status,
        empresa: d.empresa,
        ownerId: d.ownerId,
      }))
    );

    return devices;
  } catch (error) {
    console.error("❌ Error obteniendo dispositivos de la empresa:", error);
    throw error;
  }
};

// Desvincular dispositivo - ACTUALIZADO para empresa y búsqueda por código
export const unlinkDevice = async (deviceCode, userId) => {
  try {
    console.log(
      `🔗 Intentando desvincular dispositivo: ${deviceCode} para usuario: ${userId}`
    );

    // ✅ CORREGIDO: Buscar por campo 'code' no por ID de documento
    const q = query(collection(db, "devices"), where("code", "==", deviceCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("Dispositivo no encontrado");
    }

    // Tomar el primer documento encontrado
    const deviceDoc = querySnapshot.docs[0];
    const deviceData = deviceDoc.data();
    const deviceId = deviceDoc.id;

    console.log("📋 Datos del dispositivo:", {
      documentId: deviceId,
      ownerId: deviceData.ownerId,
      userId: userId,
      status: deviceData.status,
      empresa: deviceData.empresa,
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

    // Resetear a estado inicial - ACTUALIZADO para empresa
    const resetData = {
      status: "waiting",
      ownerId: null,
      ownerEmail: null,
      empresa: null, // ✅ NUEVO: Limpiar empresa también
      linkedAt: null,
      userData: null,
      configuration: null,
      lastUpdated: serverTimestamp(),
    };

    // ✅ CORREGIDO: Usar el ID del documento encontrado
    const deviceRef = doc(db, "devices", deviceId);
    await updateDoc(deviceRef, resetData);
    console.log(
      `✅ Dispositivo ${deviceCode} (${deviceId}) desvinculado exitosamente`
    );
  } catch (error) {
    console.error("❌ Error desvinculando dispositivo:", error);
    throw error;
  }
};

// Eliminar dispositivo completamente - ACTUALIZADO para empresa y búsqueda por código
export const deleteDevice = async (deviceCode, userId) => {
  try {
    console.log(
      `🗑️ Intentando eliminar dispositivo: ${deviceCode} para usuario: ${userId}`
    );

    // ✅ CORREGIDO: Buscar por campo 'code' no por ID de documento
    const q = query(collection(db, "devices"), where("code", "==", deviceCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("Dispositivo no encontrado");
    }

    // Tomar el primer documento encontrado
    const deviceDoc = querySnapshot.docs[0];
    const deviceData = deviceDoc.data();
    const deviceId = deviceDoc.id;

    console.log("📋 Datos del dispositivo a eliminar:", {
      documentId: deviceId,
      ownerId: deviceData.ownerId,
      userId: userId,
      status: deviceData.status,
      empresa: deviceData.empresa,
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

    // ✅ CORREGIDO: Usar el ID del documento encontrado
    const deviceRef = doc(db, "devices", deviceId);
    await deleteDoc(deviceRef);
    console.log(
      `✅ Dispositivo ${deviceCode} (${deviceId}) eliminado exitosamente`
    );
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
        empresa: d.empresa,
      }))
    );

    return devices;
  } catch (error) {
    console.error("❌ Error obteniendo dispositivos del usuario:", error);
    throw error;
  }
};

// ✅ NUEVA FUNCIÓN: Sincronizar datos de usuario a todos los dispositivos de la empresa
export const syncUserDataToCompanyDevices = async (empresa, userData) => {
  try {
    console.log(`🔄 Sincronizando datos a dispositivos de empresa: ${empresa}`);

    const q = query(
      collection(db, "devices"),
      where("empresa", "==", empresa),
      where("status", "==", "linked")
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log(
        `📱 No hay dispositivos vinculados para la empresa ${empresa}`
      );
      return;
    }

    const batch = writeBatch(db);
    let updateCount = 0;

    querySnapshot.docs.forEach((docSnapshot) => {
      const deviceRef = doc(db, "devices", docSnapshot.id);
      batch.update(deviceRef, {
        userData: userData,
        lastSynced: serverTimestamp(),
      });
      updateCount++;
    });

    await batch.commit();
    console.log(
      `✅ ${updateCount} dispositivos de empresa ${empresa} sincronizados`
    );
  } catch (error) {
    console.error(
      `❌ Error sincronizando dispositivos de empresa ${empresa}:`,
      error
    );
    throw error;
  }
};

// Función para verificar permisos de dispositivo - ACTUALIZADA para empresa y búsqueda por código
export const checkDevicePermissions = async (deviceCode, userId) => {
  try {
    // ✅ CORREGIDO: Buscar por campo 'code' no por ID de documento
    const q = query(collection(db, "devices"), where("code", "==", deviceCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { hasPermission: false, reason: "Dispositivo no encontrado" };
    }

    // Tomar el primer documento encontrado
    const deviceDoc = querySnapshot.docs[0];
    const deviceData = deviceDoc.data();
    const deviceId = deviceDoc.id;

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
        documentId: deviceId,
        ownerId: deviceData.ownerId,
        status: deviceData.status,
        empresa: deviceData.empresa,
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
      empresa: null, // ✅ NUEVO: Campo empresa
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

// ✅ NUEVA FUNCIÓN: Sincronizar datos de usuario a dispositivos (mantiene compatibilidad)
export const syncUserDataToDevices = async (userId, userData) => {
  try {
    console.log(`🔄 Sincronizando datos del usuario: ${userId}`);

    const q = query(
      collection(db, "devices"),
      where("ownerId", "==", userId),
      where("status", "==", "linked")
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log(
        `📱 No hay dispositivos vinculados para el usuario ${userId}`
      );
      return;
    }

    const batch = writeBatch(db);
    let updateCount = 0;

    querySnapshot.docs.forEach((docSnapshot) => {
      const deviceRef = doc(db, "devices", docSnapshot.id);
      batch.update(deviceRef, {
        userData: userData,
        empresa: userData.empresa, // ✅ ACTUALIZAR: Asegurar que empresa esté actualizada
        lastSynced: serverTimestamp(),
      });
      updateCount++;
    });

    await batch.commit();
    console.log(`✅ ${updateCount} dispositivos sincronizados`);

    // ✅ TAMBIÉN sincronizar a otros dispositivos de la misma empresa
    if (userData.empresa) {
      await syncUserDataToCompanyDevices(userData.empresa, userData);
    }
  } catch (error) {
    console.error(
      `❌ Error sincronizando dispositivos del usuario ${userId}:`,
      error
    );
    throw error;
  }
};
