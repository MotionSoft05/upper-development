import React, { useEffect, useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
// import "../app/globals.css";
import axios from "axios";

const animation = { duration: 25000, easing: (t) => t };

export default function SliderRSS() {
  const [rssItems, setRssItems] = useState([]); // Estado para almacenar los elementos del RSS
  console.log("🚀 ~ SliderRSS ~ rssItems:", rssItems);

  // ----------------- RSS ---------------------------
  useEffect(() => {
    axios
      .get("https://upperds.onrender.com/fetch-rss")
      .then((response) => {
        const items = response.data.items.map((item) => ({
          title: removeSymbols(item.title),
          link: item.link,
          description: removeSymbols(item.description),
        }));
        setRssItems(items);
      })
      .catch((error) =>
        console.error("Error fetching or parsing data:", error)
      );
  }, []);

  // Función para eliminar símbolos de una cadena de texto
  const removeSymbols = (text) => {
    // Expresión regular para eliminar símbolos
    const regex = /[^a-zA-Z0-9\s,.:-]/g;
    // Aplicar el regex y reemplazar los símbolos con una cadena vacía
    return text.replace(regex, "");
  };

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
  });

  return (
    <div ref={sliderRef} className="keen-slider h-28 ml-2 ">
      {rssItems &&
        rssItems.map((rss, index) => {
          return (
            <div key={index} className="keen-slider__slide number-slide1">
              <h1 className="text-2xl">{rss?.title}</h1>
              <p className="font-bold text-xl"> {rss?.description}</p>
            </div>
          );
        })}
    </div>
  );
}
