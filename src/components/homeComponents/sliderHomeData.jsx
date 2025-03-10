"use client";

import Image from "next/image";

import Button from "@/components/Button";
import { useModal } from "@/context/ModalContext";

export const SliderHomeData = ({ slider, index, t }) => {
  return (
    <li
      className="lg:min-h-screen grid place-items-center pt-[100px] relative"
      id="hero-2"
    >
      <div className="absolute -z-10 h-full w-full overflow-hidden">
        {/* SLIDER IMAGES AND VIDEO */}
        {slider?.sliderImage && (
          <img
            src={slider?.sliderImage}
            // priority
            alt={slider?.sliderTitle}
            width={1920}
            height={1080}
            className="object-cover h-full w-full object-center"
          />
        )}

        {slider?.sliderVideo && (
          <video
            autoPlay={true}
            muted={true}
            loop={true}
            controls={false}
            className="h-full w-full object-cover"
          >
            <source src={slider?.sliderVideo} />
          </video>
        )}
        {/* OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
      </div>
      <div className="container h-full sm:py-40 py-28 relative z-10 text-white flex items-center">
        <div className="max-w-[850px]">
          {/*------------------------ HERO CONTENT START ------------------------*/}
          <div className="flex flex-col gap-6 ">
            <p className="px-5 py-2 border-solid border-3 border-primary rounded-full w-fit md:text-2xl text-xl"></p>

            <h1 className="lg:text-6xl text-4xl font-bold lg:leading-[70px]  flex gap-3">
              {t(`homeSliderData.sliderTitle${index + 1}`)}
            </h1>
            <p className="lg:text-lg mb-6">
              {t(`homeSliderData.sliderDescription${index + 1}`)}
            </p>
          </div>

          {/* BUTTONS */}

          {/*------------------------ HERO CONTENT END ----------------------- */}
        </div>
      </div>
    </li>
  );
};
