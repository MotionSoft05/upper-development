"use client";
import React, { useState } from "react";
import { Plus, Minus, MessageCircle } from "lucide-react";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "¿Qué es el software de señalización digital y cómo funciona?",
      answer:
        "El software de señalización digital Upper DS es una plataforma que te permite crear, programar y gestionar contenido multimedia (imágenes y videos) en pantallas digitales. Funciona mediante la carga de contenido en la plataforma web, la programación de reproducción y la distribución a pantallas conectadas.",
    },
    {
      question:
        "¿Cuáles son los beneficios de usar software de señalización digital?",
      answer:
        "Los beneficios incluyen la capacidad de transmitir información en tiempo real, flexibilidad para cambiar contenido de forma remota, mejora de la experiencia del cliente, aumento de la visibilidad de la marca y capacidad de medir el rendimiento del contenido.",
    },
    {
      question:
        "¿Qué tipo de contenido se puede mostrar con software de señalización digital?",
      answer:
        "Se puede mostrar una amplia variedad de contenido, como anuncios publicitarios, promociones, información de productos, noticias, clima, horarios, contenido educativo, entretenimiento, y más. La versatilidad es una de las fortalezas de la señalización digital.",
    },
    {
      question:
        "¿Qué hardware se necesita para utilizar software de señalización digital?",
      answer:
        "El hardware necesario incluye pantallas digitales (monitores, videowalls, etc.), reproductores de medios digitales (como reproductores multimedia, computadoras, o TV Box) que necesitan estar conectados a Internet.",
    },
    {
      question:
        "¿Cómo se gestiona el contenido en el software de señalización digital en Upper DS?",
      answer:
        "El contenido se gestiona a través de una interfaz de usuario en una plataforma web. Los usuarios pueden cargar, organizar, y programar contenido para que se reproduzca en pantallas.",
    },
    {
      question:
        "¿Es seguro el uso del software de señalización digital en términos de privacidad y seguridad?",
      answer:
        "La seguridad y privacidad son preocupaciones importantes. Upper DS ofrece características de seguridad como autenticación de usuarios, certificado de seguridad, y gestión de permisos para proteger la privacidad y prevenir el acceso no autorizado.",
    },
    {
      question:
        "¿Cuál es la diferencia entre señalización digital basada en la nube y en sitio?",
      answer:
        "La señalización digital basada en la nube almacena y gestiona contenido en servidores remotos, lo que permite un acceso más fácil y gestión desde cualquier lugar con conexión a Internet. La señalización en sitio, en cambio, utiliza servidores locales y suele ser adecuada para redes cerradas.",
    },
    {
      question:
        "¿Cómo se pueden medir los resultados y el impacto del contenido de señalización digital?",
      answer:
        "Puedes medir el impacto mediante métricas como el número de reproducciones, la interacción del usuario (si es interactivo), el tiempo de visualización, y el retorno de inversión (ROI) si estás utilizando señalización digital con fines comerciales.",
    },
  ];

  const scrollToContact = () => {
    const contactSection = document.getElementById("contacto");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="faq" className="py-20 bg-transparent">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4 tracking-tight">
          Preguntas Frecuentes
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Aquí encontrarás respuestas a las preguntas más comunes que nuestros
          clientes suelen tener.
        </p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-bold text-gray-900 text-lg pr-4">
                  {faq.question}
                </span>
                <span
                  className={`flex-shrink-0 p-2 rounded-full transition-colors ${openIndex === index ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"}`}
                >
                  {openIndex === index ? (
                    <Minus size={20} />
                  ) : (
                    <Plus size={20} />
                  )}
                </span>
              </button>

              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  openIndex === index
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="p-6 pt-0 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA - Contact Link */}
        <div className="text-center mt-12 pt-8 border-t border-gray-100">
          <p className="text-gray-600 text-lg mb-4">
            ¿No encontraste respuesta a tu pregunta?
          </p>
          <button
            onClick={scrollToContact}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            <MessageCircle size={20} />
            Contacta a soporte
          </button>
        </div>
      </div>
    </section>
  );
}
