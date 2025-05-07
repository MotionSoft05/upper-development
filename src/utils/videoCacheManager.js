// src/utils/videoCacheManager.js
import Dexie from "dexie";

// Crear la base de datos
const db = new Dexie("VideoCache");
db.version(1).stores({
  videos: "url, data, timestamp, expires, size, lastAccessed",
});

// Constantes
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB en bytes
const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

// Guardar un video en caché
export async function cacheVideo(url, data, ttl = DEFAULT_TTL) {
  try {
    const expires = Date.now() + ttl;
    await db.videos.put({
      url,
      data,
      timestamp: Date.now(),
      expires,
      size: data.byteLength || 0,
      lastAccessed: Date.now(),
    });

    // Verificar y gestionar el tamaño del caché
    await manageCacheSize();
    return true;
  } catch (error) {
    console.error("Error al almacenar video en caché:", error);
    return false;
  }
}

// Obtener un video de la caché
export async function getCachedVideo(url) {
  try {
    const video = await db.videos.get(url);

    // Verificar si el video existe y no ha expirado
    if (video && video.expires > Date.now()) {
      // Actualizar la marca de tiempo de último acceso
      await db.videos.update(url, { lastAccessed: Date.now() });
      return video.data;
    }

    // Si ha expirado, eliminarlo
    if (video) {
      await db.videos.delete(url);
    }

    return null;
  } catch (error) {
    console.error("Error al recuperar video de caché:", error);
    return null;
  }
}

// Verificar si un video está en caché
export async function isVideoCached(url) {
  try {
    const video = await db.videos.get(url);
    return video && video.expires > Date.now();
  } catch (error) {
    console.error("Error al verificar video en caché:", error);
    return false;
  }
}

// Limpiar videos expirados
export async function cleanExpiredVideos() {
  try {
    const now = Date.now();
    const expiredVideos = await db.videos.where("expires").below(now).toArray();

    // Eliminar cada video expirado
    for (const video of expiredVideos) {
      await db.videos.delete(video.url);
    }
  } catch (error) {
    console.error("Error al limpiar videos expirados:", error);
  }
}

// Limpiar toda la caché
export async function clearVideoCache() {
  try {
    await db.videos.clear();
  } catch (error) {
    console.error("Error al limpiar caché de videos:", error);
  }
}

// Gestionar el límite de tamaño de la caché
export async function manageCacheSize(maxSize = MAX_CACHE_SIZE) {
  try {
    // Calcular el tamaño total actual
    const allVideos = await db.videos.toArray();
    let totalSize = allVideos.reduce(
      (sum, video) => sum + (video.size || 0),
      0
    );

    // Si el tamaño total excede el máximo, eliminar videos
    if (totalSize > maxSize) {
      console.log(
        `Tamaño de caché (${totalSize / 1024 / 1024}MB) excede el máximo (${
          maxSize / 1024 / 1024
        }MB). Limpiando...`
      );

      // Ordenar por último acceso (LRU: Least Recently Used)
      allVideos.sort((a, b) => a.lastAccessed - b.lastAccessed);

      let sizeToFree = totalSize - maxSize + 1024 * 1024; // Liberar extra 1MB

      // Eliminar videos hasta liberar suficiente espacio
      for (const video of allVideos) {
        if (sizeToFree <= 0) break;
        await db.videos.delete(video.url);
        sizeToFree -= video.size;
        console.log(
          `Eliminado: ${video.url}, liberado: ${video.size / 1024 / 1024}MB`
        );
      }
    }
  } catch (error) {
    console.error("Error al gestionar tamaño de caché:", error);
  }
}

// Estadísticas de la caché
export async function getCacheStats() {
  try {
    const allVideos = await db.videos.toArray();
    const totalSize = allVideos.reduce(
      (sum, video) => sum + (video.size || 0),
      0
    );
    const oldestTimestamp = Math.min(...allVideos.map((v) => v.timestamp));
    const newestTimestamp = Math.max(...allVideos.map((v) => v.timestamp));

    return {
      count: allVideos.length,
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
