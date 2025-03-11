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
    <div className="w-full h-full" style={{ backgroundColor: "transparent" }}>
      <Swiper
        ref={swiperRef}
        spaceBetween={0}
        effect="fade"
        fadeEffect={{
          crossFade: true,
        }}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
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
              backgroundColor: "transparent",
            }}
          >
            <div
              className="relative w-full h-full flex items-center justify-center"
              style={{
                backgroundColor: "transparent",
              }}
            >
              <img
                src={image}
                alt={`Slide ${index + 1}`}
                className="object-contain w-full h-full"
                style={{
                  display: "block",
                  aspectRatio: "auto",
                }}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default EventImageSlider;
