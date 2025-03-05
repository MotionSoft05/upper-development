import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import axios from "axios";

const animation = { duration: 25000, easing: (t) => t };

export default function SliderRSS() {
  const [rssItems, setRssItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoize slider options
  const sliderOptions = useMemo(
    () => ({
      loop: true,
      renderMode: "performance",
      drag: true,
      created(s) {
        s.moveToIdx(5, true, animation);
      },
      updated(s) {
        s.moveToIdx(s.track.details.abs + 5, true, animation);
      },
      animationEnded(s) {
        s.moveToIdx(s.track.details.abs + 5, true, animation);
      },
      vertical: true,
    }),
    []
  );

  const [sliderRef] = useKeenSlider(sliderOptions);

  // Optimize entity decoding with useCallback
  const decodeEntities = useCallback((encodedString) => {
    const textArea = document.createElement("textarea");
    textArea.innerHTML = encodedString;
    return textArea.value;
  }, []);

  // Optimize symbol removal with useCallback
  const removeSymbols = useCallback((text) => {
    if (!text) return "";
    const regex = /[^\w\s.,'"áéíóúÁÉÍÓÚñÑ:-]/g;
    return text.replace(regex, "");
  }, []);

  // Optimize fetch RSS
  const fetchRSS = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        "https://upperds.onrender.com/fetch-rss"
      );

      if (response.data && Array.isArray(response.data.items)) {
        const items = response.data.items.map((item) => ({
          title: removeSymbols(decodeEntities(item.title || "")),
          link: item.link || "#",
          description: removeSymbols(decodeEntities(item.description || "")),
        }));
        setRssItems(items);
      } else {
        setError("Invalid RSS data format");
      }
    } catch (error) {
      console.error("Error fetching or parsing RSS data:", error);
      setError("Failed to load RSS feed");
    } finally {
      setIsLoading(false);
    }
  }, [removeSymbols, decodeEntities]);

  useEffect(() => {
    fetchRSS();

    // Refresh RSS feed every 10 minutes
    const refreshInterval = setInterval(fetchRSS, 600000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, [fetchRSS]);

  // Create placeholders - use fewer placeholders for better performance
  const placeholders = useMemo(() => new Array(6).fill(null), []);

  // Loading and error indicators
  if (error) {
    return <div className="text-red-500 px-4 py-2">{error}</div>;
  }

  return (
    <div ref={sliderRef} className="keen-slider h-20 ml-2 overflow-hidden">
      {placeholders.map((_, index) => (
        <div key={index} className="keen-slider__slide py-2">
          <h1 className="text-lg truncate">
            {rssItems[index]?.title ||
              (isLoading ? "Cargando..." : "Sin contenido")}
          </h1>
          <p className="font-medium text-sm line-clamp-1">
            {rssItems[index]?.description || ""}
          </p>
        </div>
      ))}
    </div>
  );
}
