"use client";
import { Check } from "lucide-react";

export default function PricingSection() {
  return (
    <section id="precios" className="py-24 bg-transparent">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Planes Simples y{" "}
            <span className="text-[#0080FF]">Transparentes.</span>
          </h2>
          <p className="text-lg text-gray-600">
            Sin costos ocultos ni contratos forzosos. Comienza gratis y escala
            según tus necesidades.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 flex flex-col shadow-lg hover:shadow-xl transition-all">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900">Gratis</h3>
              <p className="text-sm text-gray-500 mt-1">
                Para probar la plataforma.
              </p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">$0</span>
              <span className="text-gray-500">/mes</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {["1 Pantalla", "Templates Básicos", "Actualización manual"].map(
                (feat, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm text-gray-600"
                  >
                    <Check className="w-5 h-5 text-gray-400 shrink-0" />
                    {feat}
                  </li>
                ),
              )}
            </ul>
            <a
              href="/register"
              className="block w-full py-3 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 font-bold text-center hover:bg-gray-50 transition-colors"
            >
              Crear Cuenta
            </a>
          </div>

          {/* Standard Plan (Highlighted) */}
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 flex flex-col relative transform md:-translate-y-4 shadow-2xl">
            <div className="absolute top-0 right-0 bg-[#0080FF] text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
              MÁS POPULAR
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white">Estándar</h3>
              <p className="text-gray-400 text-sm mt-1">
                Para negocios en crecimiento.
              </p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">$150</span>
              <span className="text-gray-400">/mes</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {[
                "Pantallas Ilimitadas",
                "Todos los Templates (Vuelos, Directorio)",
                "Actualización en Tiempo Real",
                "Soporte Prioritario",
                "Sin marca de agua",
              ].map((feat, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-sm text-gray-300"
                >
                  <Check className="w-5 h-5 text-[#0080FF] shrink-0" />
                  {feat}
                </li>
              ))}
            </ul>
            <a
              href="/register"
              className="block w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold text-center transition-all shadow-lg shadow-blue-500/30"
            >
              Comenzar Ahora
            </a>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 flex flex-col shadow-lg hover:shadow-xl transition-all">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900">Profesional</h3>
              <p className="text-sm text-gray-500 mt-1">
                Para grandes instalaciones.
              </p>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">A medida</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {[
                "API dedicada",
                "Desarrollo de Templates a medida",
                "SLA de Uptime garantizado",
                "Account Manager dedicado",
                "Facturación corporativa",
              ].map((feat, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-sm text-gray-600"
                >
                  <Check className="w-5 h-5 text-gray-400 shrink-0" />
                  {feat}
                </li>
              ))}
            </ul>
            <a
              href="#contacto"
              className="block w-full py-3 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 font-bold text-center hover:bg-gray-50 transition-colors"
            >
              Contactar Ventas
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
