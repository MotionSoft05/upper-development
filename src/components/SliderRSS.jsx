import React, { useEffect, useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import axios from "axios";

const animation = { duration: 25000, easing: (t) => t };

export default function SliderRSS() {
  const [rssItems, setRssItems] = useState([]);
  const [sliderRef] = useKeenSlider({
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
  });

  useEffect(() => {
    axios
      .get("https://upperds.onrender.com/fetch-rss")
      .then((response) => {
        const items = response.data.items.map((item) => ({
          title: removeSymbols(decodeEntities(item.title)),
          link: item.link,
          description: removeSymbols(decodeEntities(item.description)),
        }));
        setRssItems(items);
      })
      .catch((error) =>
        console.error("Error fetching or parsing data:", error)
      );
  }, []);

  const removeSymbols = (text) => {
    const regex = /[^\w\s.,'”áéíóúÁÉÍÓÚñÑ:-]/g;
    return text.replace(regex, "");
  };

  const decodeEntities = (encodedString) => {
    const textArea = document.createElement("textarea");
    textArea.innerHTML = encodedString;
    return textArea.value;
  };

  // Crear un array de 8 elementos vacíos inicialmente
  const placeholders = new Array(8).fill(null);

  return (
    <div ref={sliderRef} className="keen-slider h-28 ml-2">
      {placeholders.map((_, index) => (
        <div key={index} className="keen-slider__slide number-slide1">
          <h1 className="text-lg">{rssItems[index]?.title || "Cargando..."}</h1>
          <p className="font-bold text-base">
            {rssItems[index]?.description || ""}
          </p>
        </div>
      ))}
    </div>
  );
}
