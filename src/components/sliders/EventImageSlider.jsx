import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const EventImageSlider = ({ images, templateStyle }) => {
  const swiperRef = useRef(null);

  if (!images || images.length === 0) {
    return (
      <p className="text-lg" style={templateStyle}>
        No hay imágenes disponibles
      </p>
    );
  }

  return (
    <Swiper
      ref={swiperRef}
      spaceBetween={30}
      effect="fade"
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      loop
      modules={[Autoplay, Pagination, EffectFade]}
      className="w-full h-full"
    >
      {images.map((image, index) => (
        <SwiperSlide key={index}>
          <img
            src={image}
            alt={`Slide ${index + 1}`}
            className="object-cover rounded-2xl"
            style={{
              maxHeight: "80vh",
            }}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default EventImageSlider;
