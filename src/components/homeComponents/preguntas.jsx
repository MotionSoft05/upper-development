import { useState } from "react";

function Preguntas() {
  //  FAQ
  const faqData = [
    {
      question: "¿Qué es el software de señalización digital y cómo funciona?",
      answer:
        "El software de señalización digital Upper DS es una plataforma que permite crear, programar y gestionar contenido multimedia (imágenes y videos.) en pantallas digitales. Funciona mediante la carga de contenido en la plataforma web, la programación de reproducción y la distribución a pantallas conectadas.",
    },
    // Agrega más preguntas y respuestas aquí
    {
      question:
        "¿Cuáles son los beneficios de usar software de señalización digital?",
      answer:
        "Los beneficios incluyen la capacidad de transmitir información en tiempo real, la flexibilidad para cambiar contenido de forma remota, la mejora de la experiencia del cliente, el aumento de la visibilidad de la marca y la capacidad de medir el rendimiento del contenido.",
    },
    {
      question:
        "¿Qué tipo de contenido se puede mostrar con el software de señalización digital?",
      answer:
        "Se puede mostrar una amplia variedad de contenido, como anuncios publicitarios, promociones, información de productos, noticias, clima, horarios, contenido educativo, entretenimiento, y más. La versatilidad es una de las fortalezas de la señalización digital.",
    },
    {
      question:
        "¿Qué hardware se necesita para utilizar el software de señalización digital?",
      answer:
        "El hardware necesario incluye pantallas digitales (monitores, videowalls, etc.), reproductores de medios digitales (como reproductores multimedia, computadoras o TV Box) los cuales requieren estar conectados a Internet​",
    },
    {
      question:
        "¿Cómo se gestiona el contenido en el software de señalización digital en Upper DS?",
      answer:
        "El contenido se gestiona a través de una interfaz de usuario en una plataforma web. Los usuarios pueden cargar, organizar y programar contenido para que se reproduzca en las pantallas. ",
    },
    {
      question:
        "¿Es seguro el uso del software de señalización digital en términos de privacidad y seguridad?",
      answer:
        "La seguridad y privacidad son preocupaciones importantes. Upper DS ofrece características de seguridad, como autenticación de usuarios, certificado de seguridad y gestión de permisos para proteger la privacidad y prevenir el acceso no autorizado.",
    },
    {
      question:
        "¿Cuál es la diferencia entre señalización digital basada en la nube y en sitio?",
      answer:
        "La señalización digital basada en la nube almacena y gestiona contenido en servidores remotos, lo que permite un acceso más fácil y la gestión desde cualquier lugar con conexión a Internet. La señalización en sitio, en cambio, utiliza servidores locales y suele ser adecuada para redes cerradas.",
    },
    {
      question:
        "¿Cómo se pueden medir los resultados y el impacto del contenido de señalización digital?",
      answer:
        "Puedes medir el impacto mediante métricas como el número de reproducciones, la interacción del usuario (si es interactivo), el tiempo de visualización y el retorno de inversión (ROI) si estás utilizando la señalización digital con fines comerciales. ",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleAnswer = (index) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <section id="preguntas">
      <div className="pt-24 px-4 mx-auto max-w-screen-xl ">
        <div className="mx-auto max-w-screen-md text-center mb-8 lg:mb-12">
          <h2 className="mb-4 text-lg md:text-4xl tracking-tight font-extrabold text-custom">
            Preguntas frecuentes
          </h2>
          <p className="mb-5 font-light text-sm md:text-xl text-gray-400">
            Aquí encontrarás respuestas a las dudas más comunes que nuestros
            clientes suelen tener.
          </p>
        </div>

        <div className="max-w-3xl mx-auto mt-8 space-y-4 md:mt-16">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="transition-all duration-200 bg-white border border-gray-200 cursor-pointer hover:bg-gray-50"
            >
              <button
                type="button"
                onClick={() => toggleAnswer(index)}
                className="flex justify-between items-center w-full px-4 py-5 sm:p-6"
              >
                <span className="text-sm font-semibold text-black">
                  {item.question}
                </span>

                <svg
                  className={`w-6 h-6 text-gray-400 transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {openIndex === index && (
                <div className="px-4 pb-5 sm:px-6 sm:pb-6">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-gray-600 text-sm md:text-base mt-9">
          No encontraste una respuesta para tus preguntas?
          <a
            href="#contacto"
            title=""
            className="font-medium text-blue-600 transition-all duration-200 hover:text-blue-700 focus:text-blue-700 hover:underline"
          >
            Contacta a el soporte
          </a>
        </p>
      </div>
    </section>
  );
}

export default Preguntas;
