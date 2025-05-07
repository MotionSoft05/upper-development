// src/utils/videoCache.js
import { openDB } from "idb";

// Verificar si estamos en el navegador
const isBrowser =
  typeof window !== "undefined" && typeof window.indexedDB !== "undefined";

// Nombre y versión de la base de datos
const DB_NAME = "videoCache";
const DB_VERSION = 1;
const STORE_NAME = "videos";
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB en bytes

// Función para abrir la conexión a la base de datos
async function openDatabase() {
  // Solo ejecutar si estamos en el navegador
  if (!isBrowser) {
    return null;
  }

  try {
    return await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Crear el object store si no existe
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "url" });
          // Crear índice para la fecha de caducidad para facilitar la limpieza
          store.createIndex("expires", "expires");
        }
      },
    });
  } catch (error) {
    console.error("Error al abrir la base de datos IndexedDB:", error);
    return null;
  }
}

// Guardar un video en caché
export async function cacheVideo(url, data, ttl = 24 * 60 * 60 * 1000) {
  if (!isBrowser) return false;

  try {
    const db = await openDatabase();
    if (!db) return false;

    const expires = Date.now() + ttl;
    await db.put(STORE_NAME, {
      url,
      data,
      expires,
      timestamp: Date.now(),
      size: data.byteLength || 0,
    });

    // Después de cada inserción, verificar si necesitamos limpiar la caché
    await manageCacheSize();

    return true;
  } catch (error) {
    console.error("Error al almacenar video en caché:", error);
    return false;
  }
}

// Obtener un video de la caché
export async function getCachedVideo(url) {
  if (!isBrowser) return null;

  try {
    const db = await openDatabase();
    if (!db) return null;

    const video = await db.get(STORE_NAME, url);

    // Verificar si el video existe y no ha expirado
    if (video && video.expires > Date.now()) {
      // Actualizar la marca de tiempo de último acceso
      await db.put(STORE_NAME, {
        ...video,
        lastAccessed: Date.now(),
      });
      return video.data;
    }

    // Si ha expirado, eliminarlo
    if (video) {
      await db.delete(STORE_NAME, url);
    }

    return null;
  } catch (error) {
    console.error("Error al recuperar video de caché:", error);
    return null;
  }
}

// Verificar si un video está en caché
export async function isVideoCached(url) {
  if (!isBrowser) return false;

  try {
    const db = await openDatabase();
    if (!db) return false;

    const video = await db.get(STORE_NAME, url);
    return video && video.expires > Date.now();
  } catch (error) {
    console.error("Error al verificar video en caché:", error);
    return false;
  }
}

// Limpiar videos expirados
export async function cleanExpiredVideos() {
  if (!isBrowser) return;

  try {
    const db = await openDatabase();
    if (!db) return;

    const now = Date.now();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const index = tx.store.index("expires");

    // Obtener todos los videos que han expirado
    let cursor = await index.openCursor(IDBKeyRange.upperBound(now));

    // Eliminar cada video expirado
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }

    await tx.done;
  } catch (error) {
    console.error("Error al limpiar videos expirados:", error);
  }
}

// Limpiar toda la caché
export async function clearVideoCache() {
  if (!isBrowser) return;

  try {
    const db = await openDatabase();
    if (!db) return;

    await db.clear(STORE_NAME);
  } catch (error) {
    console.error("Error al limpiar caché de videos:", error);
  }
}

// Gestionar el límite de tamaño de la caché (por defecto 100MB)
export async function manageCacheSize(maxSize = MAX_CACHE_SIZE) {
  if (!isBrowser) return;

  try {
    const db = await openDatabase();
    if (!db) return;

    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.store;
    let totalSize = 0;
    const videos = [];

    // Obtener todos los videos y calcular el tamaño total
    let cursor = await store.openCursor();
    while (cursor) {
      const video = cursor.value;
      const videoSize = video.size || (video.data ? video.data.byteLength : 0);
      totalSize += videoSize;
      videos.push({
        url: video.url,
        size: videoSize,
        timestamp: video.timestamp,
        lastAccessed: video.lastAccessed || video.timestamp,
      });
      cursor = await cursor.continue();
    }

    // Si el tamaño total excede el máximo, eliminar videos
    if (totalSize > maxSize) {
      console.log(
        `[VideoCache] Tamaño de caché (${
          totalSize / 1024 / 1024
        }MB) excede el máximo (${maxSize / 1024 / 1024}MB). Limpiando...`
      );

      // Ordenar primero por último acceso (LRU: Least Recently Used)
      videos.sort((a, b) => a.lastAccessed - b.lastAccessed);

      let sizeToFree = totalSize - maxSize + 1024 * 1024; // Liberar extra 1MB

      // Eliminar videos hasta liberar suficiente espacio
      for (const video of videos) {
        if (sizeToFree <= 0) break;
        await store.delete(video.url);
        sizeToFree -= video.size;
        console.log(
          `[VideoCache] Eliminado: ${video.url}, liberado: ${
            video.size / 1024 / 1024
          }MB`
        );
      }
    }

    await tx.done;
  } catch (error) {
    console.error("Error al gestionar tamaño de caché:", error);
  }
}

// Estadísticas de la caché
export async function getCacheStats() {
  if (!isBrowser) return null;

  try {
    const db = await openDatabase();
    if (!db) return null;

    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.store;
    let totalSize = 0;
    let count = 0;
    let oldestTimestamp = Date.now();
    let newestTimestamp = 0;

    let cursor = await store.openCursor();
    while (cursor) {
      const video = cursor.value;
      const videoSize = video.size || (video.data ? video.data.byteLength : 0);
      totalSize += videoSize;
      count++;

      if (video.timestamp < oldestTimestamp) {
        oldestTimestamp = video.timestamp;
      }

      if (video.timestamp > newestTimestamp) {
        newestTimestamp = video.timestamp;
      }

      cursor = await cursor.continue();
    }

    await tx.done;

    return {
      count,
      totalSize,
      totalSizeMB: Math.round((totalSize / 1024 / 1024) * 100) / 100,
      oldestVideo: new Date(oldestTimestamp).toISOString(),
      newestVideo: new Date(newestTimestamp).toISOString(),
      maxSizeMB: MAX_CACHE_SIZE / 1024 / 1024,
      usage: Math.round((totalSize / MAX_CACHE_SIZE) * 100),
    };
  } catch (error) {
    console.error("Error al obtener estadísticas de caché:", error);
    return null;
  }
}

export default {
  cacheVideo,
  getCachedVideo,
  isVideoCached,
  cleanExpiredVideos,
  clearVideoCache,
  manageCacheSize,
  getCacheStats,
};
