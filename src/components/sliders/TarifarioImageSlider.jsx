import React, { useState, useEffect, useRef, useCallback } from "react";

const TarifarioImageSlider = ({
  images = [],
  templateStyle,
  fullWidth = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const timeoutRef = useRef(null);
  const transitioningRef = useRef(false);

  // Función para obtener la imagen actual
  const getCurrentImage = useCallback(() => {
    if (!images || images.length === 0) return null;
    return images[currentIndex];
  }, [images, currentIndex]);

  // Función para calcular la duración total en milisegundos
  const calculateDuration = useCallback((item) => {
    // Si no tiene propiedades de tiempo, usar duración por defecto
    if (!item.horas && !item.minutos && !item.segundos && !item.duracion) {
      return 5000; // 5 segundos por defecto
    }

    // Calcular duración total en segundos
    const totalSeconds =
      parseInt(item.horas || 0) * 3600 +
      parseInt(item.minutos || 0) * 60 +
      parseInt(item.segundos || 0);

    // Si hay una duración específica, usarla; de lo contrario, usar el cálculo anterior
    // Asegurarse de que la duración mínima sea de 5 segundos
    return Math.max(5, totalSeconds || item.duracion || 5) * 1000;
  }, []);

  // Manejar transición a la siguiente imagen
  const moveToNextImage = useCallback(() => {
    if (!images || images.length <= 1 || transitioningRef.current) return;

    transitioningRef.current = true;

    // Iniciar desvanecimiento
    setOpacity(0);

    // Después de que el desvanecimiento se complete, cambiar la imagen y volver a aparecer
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);

      // Pequeño retraso antes de iniciar la aparición
      setTimeout(() => {
        setOpacity(1);
        transitioningRef.current = false;
      }, 50);
    }, 500); // Esperar a que se complete el desvanecimiento
  }, [images]);

  // Configurar temporizador para la rotación de imágenes
  useEffect(() => {
    if (!images || images.length === 0) return;

    const currentImage = getCurrentImage();
    if (!currentImage) return;

    // Calcular la duración para esta imagen
    const duration = calculateDuration(currentImage);

    // Limpiar cualquier temporizador existente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Establecer temporizador para la siguiente imagen
    timeoutRef.current = setTimeout(moveToNextImage, duration);

    // Limpiar al desmontar o cuando cambia la imagen actual
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    currentIndex,
    images,
    getCurrentImage,
    moveToNextImage,
    calculateDuration,
  ]);

  // Si no hay imágenes, mostrar mensaje
  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg" style={templateStyle}>
          No hay imágenes disponibles
        </p>
      </div>
    );
  }

  // Función para obtener la URL de la imagen
  const getImageUrl = (item) => {
    if (typeof item === "string") return item;
    return item.imageUrl || item.image || item.url || "";
  };

  const currentImage = getCurrentImage();
  if (!currentImage) return null;

  return (
    <div className={`w-full flex justify-center ${fullWidth ? "h-full" : ""}`}>
      <div
        className={`${
          fullWidth ? "h-full w-full" : "h-64 mb-2 w-[35rem]"
        } bg-white rounded-lg overflow-hidden flex items-center justify-center`}
        style={{ opacity }}
      >
        <img
          src={getImageUrl(currentImage)}
          alt="Publicidad"
          className={`${
            fullWidth ? "max-h-full max-w-full" : "object-contain"
          } rounded-lg`}
          style={{ objectFit: fullWidth ? "contain" : "contain" }}
        />
      </div>
    </div>
  );
};

export default TarifarioImageSlider;
