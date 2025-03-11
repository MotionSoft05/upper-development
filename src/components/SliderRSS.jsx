import React, { useEffect, useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

const animation = { duration: 30000, easing: (t) => t };

export default function SliderRSS() {
  const [rssItems, setRssItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sliderRef] = useKeenSlider({
    loop: true,
    renderMode: "performance",
    drag: false,
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
    slides: {
      perView: 2,
      spacing: 8,
    },
  });

  useEffect(() => {
    setLoading(true);

    // Using fetch instead of axios
    fetch("https://upperds.onrender.com/fetch-rss")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        const items = data.items.map((item) => ({
          title: removeSymbols(decodeEntities(item.title)),
          link: item.link,
          description: removeSymbols(decodeEntities(item.description)),
          pubDate: item.pubDate
            ? new Date(item.pubDate).toLocaleDateString()
            : null,
        }));
        setRssItems(items);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching or parsing RSS feed:", error);
        setError("No se pudieron cargar las noticias");
        setLoading(false);
      });
  }, []);

  const removeSymbols = (text) => {
    if (!text) return "";
    const regex = /[^\w\s.,'"áéíóúÁÉÍÓÚñÑ:-]/g;
    return text.replace(regex, "");
  };

  const decodeEntities = (encodedString) => {
    if (!encodedString) return "";
    const textArea = document.createElement("textarea");
    textArea.innerHTML = encodedString;
    return textArea.value;
  };

  const truncateText = (text, maxLength = 80) => {
    if (!text) return "";
    return text;
  };

  // Ensure we have at least 8 items in the slider, duplicate if needed
  const displayItems =
    rssItems.length > 0
      ? [...rssItems, ...rssItems].slice(0, 10)
      : new Array(8).fill(null);

  return (
    <div className="w-full">
      <div className="bg-gradient-to-r from-gray-200 to-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="h-10 flex items-center justify-center">
            <div className="w-6 h-6 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
            <p className="ml-2 text-gray-600">Cargando noticias...</p>
          </div>
        ) : error ? (
          <div className="h-28 flex items-center justify-center text-red-500">
            {error}
          </div>
        ) : (
          <div ref={sliderRef} className="keen-slider h-28 px-3 py-2">
            {displayItems.map((item, index) => (
              <div
                key={index}
                className="keen-slider__slide px-2 py-1 border-b border-gray-200 last:border-0"
              >
                {item ? (
                  <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-gray-800 truncate">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {truncateText(item.description)}
                    </p>
                    {item.pubDate && (
                      <span className="text-xs text-gray-500 mt-1">
                        {item.pubDate}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="animate-pulse flex flex-col">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
