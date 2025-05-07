// src/utils/dexieVideoCache.js
import Dexie from "dexie";

// Crear la base de datos - almacenamos solo las URL y marcas de tiempo
const db = new Dexie("VideoMetaCache");
db.version(1).stores({
  videos: "url, timestamp, expires, lastAccessed",
});

// Constantes
const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos

// Verificar si un video está en caché HTTP del navegador
export async function markVideoAsCached(url, ttl = DEFAULT_TTL) {
  try {
    const expires = Date.now() + ttl;
    await db.videos.put({
      url,
      timestamp: Date.now(),
      expires,
      lastAccessed: Date.now(),
    });
    return true;
  } catch (error) {
    console.error("Error al marcar video como cacheado:", error);
    return false;
  }
}

// Verificar si un video está marcado como cacheado
export async function isVideoMarkedAsCached(url) {
  try {
    const video = await db.videos.get(url);
    return video && video.expires > Date.now();
  } catch (error) {
    console.error("Error al verificar video en caché:", error);
    return false;
  }
}

// Actualizar la marca de tiempo de último acceso
export async function updateVideoAccess(url) {
  try {
    const video = await db.videos.get(url);
    if (video) {
      await db.videos.update(url, { lastAccessed: Date.now() });
    }
  } catch (error) {
    console.error("Error al actualizar acceso de video:", error);
  }
}

// Limpiar registros expirados
export async function cleanExpiredRecords() {
  try {
    const now = Date.now();
    await db.videos.where("expires").below(now).delete();
  } catch (error) {
    console.error("Error al limpiar registros expirados:", error);
  }
}

export default {
  markVideoAsCached,
  isVideoMarkedAsCached,
  updateVideoAccess,
  cleanExpiredRecords,
};
