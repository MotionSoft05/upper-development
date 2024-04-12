import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Keyboard, EffectFade, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

import { SliderHomeData } from "./sliderHomeData";
import { homeSliderData } from "@/data/homeSliderData";

const HomeSlider = () => {
  return (
    // HERO SLIDER
    <Swiper
      direction="horizontal"
      effect="fade"
      speed={1000}
      slidesPerView={1}
      spaceBetween={20}
      keyboard={{
        enabled: true,
      }}
      autoplay={{
        delay: 12000,
        disableOnInteraction: false,
      }}
      pagination={{
        el: ".hero-two-pagination",
        clickable: true,
      }}
      loop={true}
      modules={[Autoplay, Keyboard, EffectFade, Pagination]}
      className="mySwiper w-full h-full heroSlider relative group"
    >
      <ul>
        {homeSliderData?.map((slider, i) => (
          // {/* SLIDER ITEM */}
          <SwiperSlide key={i}>
            <SliderHomeData slider={slider} index={i} />
          </SwiperSlide>
        ))}
      </ul>

      {/* PAGINATION Start */}
      <div className="hero-two-pagination swiper-pagination"></div>
      {/* PAGINATION END */}
    </Swiper>
  );
};

export default HomeSlider;
