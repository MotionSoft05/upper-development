"use client";
import Image from "next/image";

export default function TrustSection() {
  const clients = [
    { name: "Hilton", logo: "/logos/hilton.svg" },
    { name: "Marriott", logo: "/logos/marriott.svg" },
    { name: "Hampton", logo: "/logos/hampton.svg" },
    { name: "Holiday Inn", logo: "/logos/holiday.svg" },
  ];

  return (
    <section
      id="clientes"
      className="py-20 lg:py-32 bg-transparent border-y border-gray-100/50"
    >
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-4">
            Confían en Upper
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Logo placeholders - Using text for now if images don't exist */}
            {[
              "Hotel Marriot",
              "Hilton Garden",
              "Holiday Inn",
              "Sheraton",
              "Westin",
            ].map((client, i) => (
              <div
                key={i}
                className="text-xl md:text-2xl font-bold text-gray-400 font-serif"
              >
                {client}
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              quote:
                "La implementación fue inmediata. Nuestros huéspedes adoran ver el estado de vuelos en el lobby.",
              author: "Carlos Ruiz",
              role: "Gerente de Operaciones",
              hotel: "Hotel Marriot Cancún",
            },
            {
              quote:
                "Gestionamos pantallas en 3 ciudades distintas desde una sola cuenta. Simplemente funciona.",
              author: "Ana Martinez",
              role: "Directora de Marketing",
              hotel: "Grupo Hotelero Sol",
            },
            {
              quote:
                "El soporte de Upper es increíble. Nos ayudaron a configurar los eventos de nuestros salones en minutos.",
              author: "Roberto Gomez",
              role: "IT Manager",
              hotel: "Convention Center CDMX",
            },
          ].map((testimonial, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex text-[#0080FF] mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="w-5 h-5 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed mb-6 italic">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">
                    {testimonial.author}
                  </p>
                  <p className="text-xs text-gray-500">
                    {testimonial.role} • {testimonial.hotel}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
