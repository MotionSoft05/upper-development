import React from "react";

const languageObjDate = {
  es: {
    weekdays: [
      "DOMINGO",
      "LUNES",
      "MARTES",
      "MIÉRCOLES",
      "JUEVES",
      "VIERNES",
      "SÁBADO",
    ],
    months: [
      "ENERO",
      "FEBRERO",
      "MARZO",
      "ABRIL",
      "MAYO",
      "JUNIO",
      "JULIO",
      "AGOSTO",
      "SEPTIEMBRE",
      "OCTUBRE",
      "NOVIEMBRE",
      "DICIEMBRE",
    ],
    title: "Eventos del día",
    event: "Evento",
    news: "Noticias",
    qr: "Eventos en tu dispositivo",
  },
  en: {
    weekdays: [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ],
    months: [
      "JANUARY",
      "FEBRUARY",
      "MARCH",
      "APRIL",
      "MAY",
      "JUNE",
      "JULY",
      "AUGUST",
      "SEPTEMBER",
      "OCTOBER",
      "NOVEMBER",
      "DECEMBER",
    ],
    title: "Today's Events",
    event: "Event",
    news: "News",
    qr: "Events on your device",
  },
  esEn: {
    weekdays: [
      "DOMINGO / SUNDAY",
      "LUNES /MONDAY",
      "MARTES / TUESDAY",
      "MIÉRCOLES / WEDNESDAY",
      "JUEVES / THURSDAY",
      "VIERNES / FRIDAY",
      "SÁBADO / SATURDAY",
    ],
    months: [
      "ENERO / JANUARY",
      "FEBRERO / FEBRUARY",
      "MARZO / MARCH",
      "ABRIL / APRIL",
      "MAYO / MAY",
      "JUNIO / JUNE",
      "JULIO / JULY",
      "AGOSTO / AUGUST",
      "SEPTIEMBRE / SEPTEMBER",
      "OCTUBRE / OCTOBER",
      "NOVIEMBRE / NOVEMBER",
      "DICIEMBRE / DECEMBER",
    ],
    title: "Eventos del día / Today's Events",
    event: "Eventos / Event",
    news: "Noticias / News",
    qr: "Eventos en tu dispositivo / Events on your device",
  },
};
function GetLanguageDate({ idioma }) {
    
    const langString = idioma;
  const { es, en, esEn } = languageObjDate;
  
  const now = new Date();
  const diaSemana = es.weekdays[now.getDay()];
  const dayWeek = en.weekdays[now.getDay()];
  const mes = es.months[now.getMonth()];
  const months = en.months[now.getMonth()];

  const dia = now.getDate();
  const año = now.getFullYear();

  function renderLanguageDate() {
    switch (langString) {
      case "es":
        return <p>{`${diaSemana} ${dia} DE ${mes} ${año}`}</p>;

      case "en":
        return <p>{`${dayWeek}, ${months} ${dia}, ${año}`}</p>;

      case "es-en":
        return (
          <>
            <p className="mb-2">{`${diaSemana} ${dia} DE ${mes} ${año}`}</p>
            <p>{`${dayWeek}, ${months} ${dia}, ${año}`}</p>
          </>
        );

      default:
        return <p>{`${diaSemana} ${dia} DE ${mes} ${año}`}</p>;
    }
  }

  return <div>{renderLanguageDate()}</div>;
}

export default GetLanguageDate;
