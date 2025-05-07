import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

export default function TarifarioRssSlider({ templateColor }) {
  const [rssItems, setRssItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función mejorada para limpiar y formatear el texto
  const cleanText = (text) => {
    if (!text) return "";

    // Decodificar entidades HTML
    let decodedText = decodeHTMLEntities(text);

    // Eliminar etiquetas HTML
    decodedText = decodedText.replace(/<\/?[^>]+(>|$)/g, " ");

    // Formatear fechas numéricas (12032025 → 12/03/2025)
    decodedText = formatDateInText(decodedText);

    // Limpiar caracteres especiales pero preservar acentos españoles
    return decodedText.replace(/[^\w\s.,;:'"¿?¡!áéíóúÁÉÍÓÚñÑüÜ/-]/g, "");
  };

  // Decodificar entidades HTML
  const decodeHTMLEntities = (text) => {
    if (!text) return "";
    const textArea = document.createElement("textarea");
    textArea.innerHTML = text;
    return textArea.value;
  };

  // Formatear fechas en el texto (busca secuencias como 12032025 y las convierte a 12/03/2025)
  const formatDateInText = (text) => {
    // Busca patrones de fecha numérica de 8 dígitos (DDMMYYYY)
    return text.replace(
      /\b(\d{2})(\d{2})(\d{4})\b/g,
      function (match, day, month, year) {
        return `${day}/${month}/${year}`;
      }
    );
  };

  // Procesar el título para mejorar su presentación
  const processTitle = (title) => {
    // Eliminar prefijos comunes como "🔴" o emojis
    let processed = title.replace(/^[🔴⚠️📢📣]\s+/, "");

    // Formatear fechas numéricas
    processed = formatDateInText(processed);

    // Formatear "En Vivo" para mayor consistencia
    processed = processed.replace(/\(En Vivo\)$/i, "(En vivo)");

    return processed;
  };

  // Obtener los datos RSS
  useEffect(() => {
    setLoading(true);

    fetch("https://upperds.onrender.com/fetch-rss")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al cargar noticias");
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.items && Array.isArray(data.items)) {
          const processedItems = data.items.map((item) => ({
            title: processTitle(cleanText(item.title)),
            link: item.link,
            description: cleanText(item.description),
            pubDate: item.pubDate
              ? new Date(item.pubDate).toLocaleDateString("es-MX", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : null,
          }));
          setRssItems(processedItems);
        } else {
          throw new Error("Formato de datos inválido");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching RSS:", error);
        setError("No se pudieron cargar las noticias");
        setLoading(false);
      });
  }, []);

  // Si no hay datos, mostrar un estado de carga o error
  if (loading) {
    return (
      <div className="bg-gray-800 text-white rounded-t-md h-full">
        <div className="bg-white text-gray-900 flex items-center justify-center h-full">
          <div className="w-5 h-5 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mr-2"></div>
          <span className="text-sm">Cargando noticias...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 text-white rounded-t-md h-full">
        <div className="bg-white text-gray-900 flex items-center justify-center h-full text-red-500 text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (rssItems.length === 0) {
    return (
      <div className="bg-gray-800 text-white rounded-t-md h-full">
        <div className="bg-white text-gray-900 flex items-center justify-center h-full text-sm">
          No hay noticias disponibles
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white text-gray-900 rounded-b-md h-full overflow-hidden"
      style={{
        borderTopWidth: "1px",
        borderTopStyle: "solid",
        borderTopColor: templateColor || "#444444",
      }}
    >
      <Swiper
        direction="vertical"
        slidesPerView={1}
        spaceBetween={0}
        loop={true}
        speed={1000}
        autoplay={{
          delay: 10000,
          disableOnInteraction: false,
        }}
        modules={[Autoplay]}
        className="w-full h-full"
      >
        {rssItems.map((item, index) => (
          <SwiperSlide key={index}>
            <div className="p-2 overflow-y-auto h-full">
              <h3 className="font-bold text-sm mb-1 ">{item.title}</h3>
              <p className="text-xs text-gray-800">{item.description}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
