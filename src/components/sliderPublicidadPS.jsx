import React, { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import VideoPlayer from "./VideoPlayer";

const AdvertisementSlider = ({
  advertisements,
  templates,
  event,
  currentHour,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const timeoutRef = useRef(null);
  const transitioningRef = useRef(false);
  const [videoError, setVideoError] = useState(false);
  // Get current advertisement
  const getCurrentAd = useCallback(() => {
    if (!advertisements || advertisements.length === 0) return null;
    return advertisements[currentIndex];
  }, [advertisements, currentIndex]);

  // Handle transition to next ad
  const moveToNextAd = useCallback(() => {
    if (
      !advertisements ||
      advertisements.length <= 1 ||
      transitioningRef.current
    )
      return;

    transitioningRef.current = true;

    // Start fade out
    setOpacity(0);

    // After fade out completes, change ad and fade in
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % advertisements.length);

      // Small delay before starting fade in
      setTimeout(() => {
        setOpacity(1);
        transitioningRef.current = false;
      }, 50);
    }, 500); // Wait for fade out to complete
  }, [advertisements]);

  // Set up timer for ad rotation
  useEffect(() => {
    if (!advertisements || advertisements.length === 0) return;

    const currentAd = getCurrentAd();
    if (!currentAd) return;

    // Calculate total duration in seconds (minimum 10 seconds)
    const totalSeconds = Math.max(
      10,
      (currentAd.horas || 0) * 3600 +
        (currentAd.minutos || 0) * 60 +
        (currentAd.segundos || 0)
    );

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set timer for next ad
    timeoutRef.current = setTimeout(moveToNextAd, totalSeconds * 1000);

    // Clean up on unmount or when current ad changes
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, advertisements, getCurrentAd, moveToNextAd]);

  if (!advertisements || advertisements.length === 0) {
    return null;
  }

  const currentAd = getCurrentAd();
  if (!currentAd) return null;

  return (
    <div className="fixed inset-0 w-full h-full bg-white overflow-hidden flex flex-col z-20">
      {/* Header - 10vh */}
      <header className="flex justify-between items-center h-[10vh] mb-2 z-10 bg-white">
        {templates && templates.logo && (
          <div className="h-full aspect-video flex items-center">
            <img
              src={templates.logo}
              alt="Logo"
              className="object-contain h-full"
            />
          </div>
        )}
        <h1
          className="font-bold uppercase text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-color"
          style={{
            fontFamily: templates?.fontStyle,
          }}
        >
          {event?.matchingDevice}
        </h1>
      </header>

      {/* Advertisement Content - Fills remaining space */}
      <div className="flex-1 relative">
        <div
          className="absolute inset-0 w-full h-full transition-opacity duration-1000"
          style={{ opacity }}
        >
          {currentAd.videoUrl ? (
            <VideoPlayer
              src={currentAd.videoUrl}
              autoPlay={true}
              muted={true}
              loop={false}
              onEnded={moveToNextAd}
              onError={() => {
                setVideoError(true);
                moveToNextAd();
              }}
            />
          ) : (
            <img
              key={`image-${currentIndex}`}
              className="w-full h-full object-cover"
              src={currentAd.imageUrl}
              alt="Advertisement"
            />
          )}
        </div>
      </div>
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
  templates: PropTypes.shape({
    logo: PropTypes.string,
    fontColor: PropTypes.string,
    fontStyle: PropTypes.string,
  }),
  event: PropTypes.shape({
    matchingDevice: PropTypes.string,
  }),
  currentHour: PropTypes.string,
};

export default AdvertisementSlider;
