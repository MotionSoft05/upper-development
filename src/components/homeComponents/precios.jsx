import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import CardPrice from "./CardPrice";

function Precios() {
  const { t } = useTranslation();
  const [mostrarPreciosAnuales, setMostrarPreciosAnuales] = useState("mensual");

  //! Función para alternar entre precios mensuales y anuales
  const alternarPrecios = () => {
    setMostrarPreciosAnuales(!mostrarPreciosAnuales);
  };

  // Función para obtener el texto del período (mensual o anual)
  const obtenerTextoPeriodo = () => {
    mostrarPreciosAnuales === "mensual"
      ? setMostrarPreciosAnuales("anual")
      : setMostrarPreciosAnuales("mensual");
  };

  // Función para obtener el precio según el período
  // const obtenerPrecio = (categoria) => {
  //   // Define los precios según la categoría y el período
  //   const precios = {
  //     gratis: {
  //       mensual: "$0",
  //       anual: "$0",
  //     },
  //     estandar: {
  //       mensual: "$99",
  //       anual: "$1200",
  //     },
  //     profesional: {
  //       mensual: "$120",
  //       anual: "$1400", // Puedes reemplazar "$Contacto" con el precio anual real si lo tienes
  //     },
  //   };

  //   // Obtén el precio según la categoría y el período
  //   return precios[categoria][obtenerTextoPeriodo()];
  // };

  // Define los precios según la categoría y el período
  //? Posteriormente se podria borrar este objeto y usar el de traduciones
  const precios = {
    gratis: {
      mensual: "precios.free.monthly",
      anual: "precios.free.yearly",
    },
    estandar: {
      mensual: "precios.standard.monthly",
      anual: "precios.standard.yearly",
    },
    profesional: {
      mensual: "precios.professional.monthly",
      anual: "precios.professional.yearly",
    },
  };

  return (
    <section id="precios">
      <div className="pt-24 px-4 mx-auto max-w-screen-xl ">
        <div className="mx-auto max-w-screen-md text-center mb-8 lg:mb-12">
          <h2 className="mb-4 text-lg md:text-4xl tracking-tight font-extrabold text-custom ">
            {t("precios.title1")}
          </h2>
          <p className="mb-5 font-light text-sm md:text-xl text-gray-400">
            {t("precios.description1")}
          </p>
        </div>
        <div className="text-center"></div>
        <div className="space-y-8 md:grid md:grid-cols-3 sm:gap-6 xl:gap-10 lg:space-y-0">
        {/* Card Gratis */}
        <CardPrice
          title={t("precios.free.title")}
          description={t("precios.free.description")}
          mensualTitle={t("precios.monthly")}
          mensualPrice={"$ 0"}
          // anualTitle={t("precios.yearly")}
          // anualPrice={"$ 0"}
          featureList={[
            t("precios.free.features.item1"),
            t("precios.free.features.item2"),
          ]}
          btnTitle={t("precios.btnStart")}
        />
        {/* Card Estandar */}
        <CardPrice
          title={t("precios.standard.title")}
          description={t("precios.standard.description")}
          mensualTitle={t("precios.monthly")}
          mensualPrice={"$ 99"}
          anualTitle={t("precios.yearly")}
          anualPrice={"$ 1200"}
          featureList={[
            t("precios.standard.features.item1"),
            t("precios.standard.features.item2"),
          ]}
          btnTitle={t("precios.btnStart")}
        />
        {/* Card Profesional */}
        <CardPrice
          title={t("precios.professional.title")}
          description={t("precios.professional.description")}
          mensualTitle={t("precios.monthly")}
          mensualPrice={"$ 120"}
          anualTitle={t("precios.yearly")}
          anualPrice={"$ 1400"}
          featureList={[
            t("precios.professional.features.item1"),
            t("precios.professional.features.item2"),
          ]}
          btnTitle={t("precios.btnStart")}
        />
        </div>


        <p className="mb-5 font-light  text-gray-400 text-center">
          {t("precios.pricesNote")}
        </p>
      </div>
    </section>
  );
}

export default Precios;
