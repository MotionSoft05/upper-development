import { useState } from "react";

function Precios() {
  const [mostrarPreciosAnuales, setMostrarPreciosAnuales] = useState(false);

  // Función para alternar entre precios mensuales y anuales
  const alternarPrecios = () => {
    setMostrarPreciosAnuales(!mostrarPreciosAnuales);
  };

  // Función para obtener el texto del período (mensual o anual)
  const obtenerTextoPeriodo = () => {
    return mostrarPreciosAnuales ? "anual" : "mensual";
  };

  // Función para obtener el precio según el período
  const obtenerPrecio = (categoria) => {
    // Define los precios según la categoría y el período
    const precios = {
      gratis: {
        mensual: "$0",
        anual: "$0",
      },
      estandar: {
        mensual: "$99",
        anual: "$1200",
      },
      profesional: {
        mensual: "$Contacto",
        anual: "$Contacto", // Puedes reemplazar "$Contacto" con el precio anual real si lo tienes
      },
    };

    // Obtén el precio según la categoría y el período
    return precios[categoria][obtenerTextoPeriodo()];
  };
  return (
    <section id="precios">
      <div className="pt-24 px-4 mx-auto max-w-screen-xl ">
        <div className="mx-auto max-w-screen-md text-center mb-8 lg:mb-12">
          <h2 className="mb-4 text-lg md:text-4xl tracking-tight font-extrabold text-custom ">
            Impulsa el éxito de tu negocio con Upper DS
          </h2>
          <p className="mb-5 font-light text-sm md:text-xl text-gray-400">
            Encuentre el plan de señalización digital que te de mayores
            beneficios​
          </p>
        </div>
        <div className="text-center"></div>
        <div className="space-y-8 md:grid md:grid-cols-3 sm:gap-6 xl:gap-10 lg:space-y-0">
          <div className="flex flex-col p-6 mx-auto max-w-lg text-center  rounded-lg border  shadow border-gray-600 xl:p-8 bg-gray-800 text-white justify-between ">
            <h3 className="mb-4 text-2xl font-semibold text-custom">Gratis</h3>
            <p className="font-light sm:text-lg text-gray-400">
              La mejor opción para comenzar tu siguiente proyecto de
              digitalización
            </p>
            <div
              id="precios1"
              className="flex justify-center items-baseline my-8 mt-14"
            >
              <span className="mr-2 text-5xl font-extrabold">
                {obtenerPrecio("gratis")}
              </span>
            </div>
            <ul role="list" className="mb-8 space-y-4 text-left">
              <li className="flex items-center space-x-3">
                <img src="/img/tick.svg" />
                <span>
                  Solicita una licencia de evaluación para una pantalla.
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <img src="/img/tick.svg" />
                <span>La licencia de evaluación se activara por 21 días.</span>
              </li>
            </ul>
            <a
              href="#"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded inline-block mt-auto"
            >
              Comienza ya
            </a>
          </div>
          <div className="flex flex-col p-6 mx-auto max-w-lg text-center rounded-lg border shadow border-gray-600 xl:p-8 bg-gray-800 text-white justify-between ">
            <h3 className="mb-4 text-2xl font-semibold text-custom">
              Estándar
            </h3>
            <p className="font-light sm:text-lg text-gray-400 ">
              Lo mejor para usuarios que buscan incorporar la señalización
              digital como parte de su estrategia de negocio
            </p>
            <div
              id="precios2"
              className="flex justify-center items-baseline my-8"
            >
              <span className="mr-2 text-5xl font-extrabold">
                {obtenerPrecio("estandar")}
              </span>
            </div>
            <ul role="list" className="mb-8 space-y-4 text-left">
              <li className="flex items-center space-x-3">
                <img src="/img/tick.svg" />
                <span>
                  Licencia para aquellos negocios que inician con Señalización
                  Digital
                </span>
              </li>
            </ul>
            <a
              href="#"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded inline-block mt-auto"
            >
              Comienza ya
            </a>
          </div>
          <div className="flex flex-col p-6 mx-auto max-w-lg text-center  rounded-lg border  shadow border-gray-600 xl:p-8 bg-gray-800 text-white justify-between ">
            <h3 className="mb-4 text-2xl font-semibold text-custom">
              Profesional
            </h3>
            <p className="font-light sm:text-lg text-gray-400 ">
              La mejor opción para organizaciones con requerimientos avanzados
            </p>
            <div
              id="precios3"
              className="flex justify-center items-baseline my-8 mt-14"
            >
              <span className="mr-2 text-5xl font-extrabold">
                {obtenerPrecio("profesional")}
              </span>
            </div>
            <ul role="list" className="mb-8 space-y-4 text-left">
              <li className="flex items-center space-x-3">
                <img src="/img/tick.svg" />
                <span>
                  Licencia para aquellos negocios que requieren licencias y
                  servicios de diseño personalizado
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <img src="/img/tick.svg" />
                <span>
                  Registrase para ser contactados y definir alcance de servicios
                </span>
              </li>
            </ul>
            <a
              href="#"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded inline-block mt-auto"
            >
              Comienza ya
            </a>
          </div>
        </div>

        <p className="mb-5 font-light  text-gray-400 text-center">
          *Precios se expresados en pesos ​ mexicanos (MXN) antes de impuestos
        </p>
      </div>
    </section>
  );
}

export default Precios;
