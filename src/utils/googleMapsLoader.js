/**
 * Utilidad para manejar la carga de Google Maps API
 */

let isLoaded = false;
let isLoading = false;
const callbacks = [];

export const loadGoogleMaps = () => {
  return new Promise((resolve, reject) => {
    // Verificar si estamos en el navegador
    if (typeof window === 'undefined') {
      reject(new Error('Google Maps can only be loaded in the browser'));
      return;
    }

    // Si ya está cargado
    if (window.google && window.google.maps) {
      isLoaded = true;
      resolve(window.google.maps);
      return;
    }

    // Si ya está en proceso de carga
    if (isLoading) {
      callbacks.push({ resolve, reject });
      return;
    }

    isLoading = true;
    callbacks.push({ resolve, reject });

    // Función para resolver todas las promesas
    const handleLoad = () => {
      isLoaded = true;
      isLoading = false;
      
      callbacks.forEach(({ resolve }) => {
        resolve(window.google.maps);
      });
      callbacks.length = 0;
      
      window.removeEventListener('googleMapsLoaded', handleLoad);
    };

    const handleError = (error) => {
      isLoading = false;
      
      callbacks.forEach(({ reject }) => {
        reject(error || new Error('Failed to load Google Maps'));
      });
      callbacks.length = 0;
      
      window.removeEventListener('googleMapsLoaded', handleLoad);
    };

    // Si googleMapsLoaded ya fue disparado y google está disponible
    if (window.googleMapsLoaded && window.google && window.google.maps) {
      handleLoad();
      return;
    }

    // Escuchar el evento de carga
    window.addEventListener('googleMapsLoaded', handleLoad);

    // Polling para verificar si Google Maps está disponible
    const checkInterval = setInterval(() => {
      if (window.google && window.google.maps) {
        clearInterval(checkInterval);
        handleLoad();
      }
    }, 100);

    // Timeout después de 10 segundos
    setTimeout(() => {
      clearInterval(checkInterval);
      if (!isLoaded && isLoading) {
        handleError(new Error('Google Maps loading timeout - API may not be loaded'));
      }
    }, 10000);
  });
};

export const isGoogleMapsLoaded = () => {
  return isLoaded && window.google && window.google.maps;
};