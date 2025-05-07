import React, { useState, useEffect } from "react";
import Image from "next/image";

const SliderPublicidadTarifario = ({ publicidad = [], className = "" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!publicidad || publicidad.length === 0) return;

    // Obtener la duración configurada para la imagen actual o usar 5000ms (5s) por defecto
    const currentDuration = publicidad[currentIndex]?.duracion
      ? publicidad[currentIndex].duracion * 1000
      : 5000;

    // Configurar el temporizador para cambiar a la siguiente imagen
    const timer = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % publicidad.length);
    }, currentDuration);

    // Limpiar el temporizador al desmontar o cuando cambie el índice
    return () => clearTimeout(timer);
  }, [currentIndex, publicidad]);

  // Si no hay imágenes de publicidad, mostrar un espacio en blanco
  if (!publicidad || publicidad.length === 0) {
    return <div className={`bg-gray-200 ${className}`}></div>;
  }

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {publicidad.map((item, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="relative w-full h-full">
            <Image
              src={item.imageUrl}
              alt={`Publicidad ${index + 1}`}
              fill
              style={{ objectFit: "cover" }}
              priority={index === currentIndex}
            />
          </div>
        </div>
      ))}

      {/* Indicadores de posición (opcional) */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-2">
        {publicidad.map((_, index) => (
          <span
            key={index}
            className={`h-2 w-2 rounded-full ${
              index === currentIndex ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default SliderPublicidadTarifario;
