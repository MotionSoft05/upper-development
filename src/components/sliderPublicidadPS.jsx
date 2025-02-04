import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";

const AdvertisementSlider = ({ advertisements }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [key, setKey] = useState(0); // Para forzar el reinicio de videos

  const getCurrentAd = useCallback(
    () => advertisements[currentIndex],
    [currentIndex, advertisements]
  );

  const moveToNextAd = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % advertisements.length);
    setKey((prevKey) => prevKey + 1); // Incrementar key para forzar reinicio
  }, [advertisements.length]);

  useEffect(() => {
    if (!advertisements || advertisements.length === 0) return;

    const currentAd = getCurrentAd();

    // Calcular duración total en segundos (mínimo 10 segundos)
    const totalSeconds = Math.max(
      10,
      (currentAd.horas || 0) * 3600 +
        (currentAd.minutos || 0) * 60 +
        (currentAd.segundos || 0)
    );

    // console.log(
    //   `Ad ${currentIndex + 1}/${
    //     advertisements.length
    //   } will display for ${totalSeconds} seconds`
    // );

    const timer = setTimeout(moveToNextAd, totalSeconds * 1000);
    return () => clearTimeout(timer);
  }, [currentIndex, advertisements, getCurrentAd, moveToNextAd]);

  if (!advertisements || advertisements.length === 0) {
    return null;
  }

  const currentAd = getCurrentAd();

  return (
    <div className="fixed inset-0 w-full h-full bg-black">
      {currentAd.videoUrl ? (
        <video
          key={`video-${key}`}
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline
          src={currentAd.videoUrl}
          onEnded={moveToNextAd}
        />
      ) : (
        <img
          key={`image-${key}`}
          className="w-full h-full object-cover"
          src={currentAd.imageUrl}
          alt="Advertisement"
        />
      )}
    </div>
  );
};

AdvertisementSlider.propTypes = {
  advertisements: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      imageUrl: PropTypes.string,
      videoUrl: PropTypes.string,
      horas: PropTypes.number,
      minutos: PropTypes.number,
      segundos: PropTypes.number,
    })
  ).isRequired,
};

export default AdvertisementSlider;
