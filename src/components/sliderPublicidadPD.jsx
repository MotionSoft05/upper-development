// src/components/sliderPublicidadPS.jsx
import { useState, useEffect } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

const AdvertisementSlider = ({
  advertisements,
  template,
  weatherData,
  currentTime,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const [sliderRef] = useKeenSlider(
    {
      slides: advertisements.length,
      loop: true,
    },
    [
      (slider) => {
        let timeout;
        let mouseOver = false;

        function clearNextTimeout() {
          clearTimeout(timeout);
        }

        function nextTimeout() {
          clearTimeout(timeout);
          if (mouseOver) return;
          timeout = setTimeout(() => {
            slider.next();
          }, advertisements[currentIndex]?.duration * 1000 || 5000);
        }

        slider.on("created", nextTimeout);
        slider.on("dragStarted", clearNextTimeout);
        slider.on("animationEnded", nextTimeout);
        slider.on("updated", nextTimeout);

        slider.on("slideChanged", () => {
          setCurrentIndex(slider.track.details.rel);
        });
      },
    ]
  );

  return (
    <div className="h-screen flex flex-col">
      <header className="p-4 flex justify-between items-center">
        {template.logo && (
          <img src={template.logo} alt="Logo" className="h-16 w-auto" />
        )}

        {weatherData && (
          <div className="flex items-center gap-2">
            <img
              src={weatherData.current.condition.icon}
              alt="Weather"
              className="w-8 h-8"
            />
            <span>{weatherData.current.temp_c}°C</span>
          </div>
        )}

        <time className="text-xl">{currentTime}</time>
      </header>

      <div ref={sliderRef} className="keen-slider flex-1">
        {advertisements.map((ad, idx) => (
          <div key={ad.id} className="keen-slider__slide">
            {ad.type === "image" ? (
              <img
                src={ad.imageUrl}
                alt={ad.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={ad.videoUrl}
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdvertisementSlider;
