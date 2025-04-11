import React, { useRef, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

// Componente de slider de imágenes para tarifarios
const TarifarioImageSlider = ({
  images = [],
  templateStyle,
  fullWidth = false,
}) => {
  console.log(
    "Renderizando TarifarioImageSlider con",
    images.length,
    "imágenes"
  );

  const swiperRef = useRef(null);

  // Función para obtener la URL de la imagen
  const getImageUrl = useCallback((item) => {
    if (!item) return "";
    if (typeof item === "string") return item;
    return item.imageUrl || item.image || item.url || "";
  }, []);

  // Función para calcular la duración de una imagen
  const calculateDuration = useCallback((item) => {
    if (!item) return 5000;

    const seconds =
      parseInt(item.horas || 0) * 3600 +
      parseInt(item.minutos || 0) * 60 +
      parseInt(item.segundos || 0);

    return Math.max(5, seconds) * 1000;
  }, []);

  // Si no hay imágenes, mostrar mensaje
  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg">No hay imágenes disponibles</p>
      </div>
    );
  }

  // Configurar autoplay con duraciones personalizadas
  const handleSlideChange = (swiper) => {
    const currentIndex = swiper.realIndex;
    const nextIndex = (currentIndex + 1) % images.length;
    const nextItem = images[nextIndex];
    const duration = calculateDuration(nextItem);

    console.log(`Próximo cambio en ${duration / 1000} segundos`);

    // Actualizar la duración del autoplay
    if (swiper.autoplay && swiper.autoplay.running) {
      swiper.autoplay.stop();
      swiper.params.autoplay.delay = duration;
      swiper.autoplay.start();
    }
  };

  // Configuración inicial del autoplay
  const initialDelay = calculateDuration(images[0]);
  console.log(`Configurando primer cambio en ${initialDelay / 1000} segundos`);

  return (
    <div className="w-full h-full">
      <Swiper
        ref={swiperRef}
        spaceBetween={0}
        effect="fade"
        fadeEffect={{
          crossFade: true,
        }}
        autoplay={{
          delay: initialDelay,
          disableOnInteraction: false,
        }}
        onSlideChange={handleSlideChange}
        onSwiper={(swiper) => {
          console.log("INICIALIZACIÓN DEL SLIDER");
          // Asegurar que el tiempo inicial sea correcto
          if (swiper.autoplay) {
            swiper.params.autoplay.delay = initialDelay;
          }
        }}
        loop
        modules={[Autoplay, Pagination, EffectFade]}
        className="w-full h-full"
      >
        {images.map((image, index) => (
          <SwiperSlide
            key={index}
            className="flex items-center justify-center"
            style={{
              width: "100%",
              height: "100%",
            }}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={getImageUrl(image)}
                alt={`Slide ${index + 1}`}
                className="w-full h-full rounded-lg"
                style={{
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default TarifarioImageSlider;
