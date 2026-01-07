"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import GoogleLoginButton from "./GoogleLoginButton";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-transparent"
    >
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Nueva Versión 2.0 con Vuelos en Tiempo Real
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.15] mb-6 tracking-tight">
                Tu Comunicación Digital, <br className="hidden lg:block" />
                <span className="text-[#0080FF]">Simplificada.</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Gestiona cientos de pantallas desde un solo lugar. Ideal para
                hoteles, corporativos y aeropuertos.
                <span className="block mt-2 font-medium text-gray-900">
                  Software potente. Hardware opcional.
                </span>
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <GoogleLoginButton
                  variant="primary"
                  text="Ver Demo en Vivo"
                  className="w-full sm:w-auto px-8 py-3 text-base shadow-lg shadow-blue-500/20"
                />
                <Link
                  href="#contacto"
                  className="w-full sm:w-auto px-8 py-3 rounded-full font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  Agendar Reunión <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> Sin
                  tarjeta de crédito
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> Setup en 5
                  min
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> Soporte
                  24/7
                </div>
              </div>
            </motion.div>
          </div>

          {/* Visual Content (Dashboard Mockup) */}
          <div className="flex-1 w-full max-w-[600px] lg:max-w-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              {/* Decorative Elements behind mockup */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-20"></div>

              {/* Mockup Container */}
              <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden aspect-[16/10]">
                {/* Header simulado del browser */}
                <div className="h-8 bg-gray-50 border-b border-gray-100 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <div className="ml-4 flex-1 h-5 bg-white rounded-md border border-gray-200 text-[10px] text-gray-400 flex items-center px-2">
                    app.upper.com/dashboard
                  </div>
                </div>

                {/* Placeholder for Dashboard Image - We will ask user for a real screenshot later */}
                <div className="w-full h-full bg-gray-50 flex items-center justify-center relative">
                  {/* En el futuro aquí irá <Image src="/img/dashboard-shot.png" ... /> */}
                  <div className="text-center p-8">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        ></path>
                      </svg>
                    </div>
                    <p className="text-gray-400 font-medium">
                      Dashboard Preview
                    </p>
                    <p className="text-xs text-gray-300 mt-2">
                      (Se reemplazará con captura real)
                    </p>
                  </div>

                  {/* Floating UI Elements for 3D effect */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute -right-4 top-20 bg-white p-3 rounded-lg shadow-xl border border-gray-100 w-48"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">
                          Pantalla Lobby
                        </p>
                        <p className="text-[10px] text-green-600 font-medium">
                          Sincronizado
                        </p>
                      </div>
                    </div>
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full w-full bg-green-500 rounded-full"></div>
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1,
                    }}
                    className="absolute -left-4 bottom-10 bg-white p-3 rounded-lg shadow-xl border border-gray-100 w-40"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                      <p className="text-xs font-semibold text-gray-800">
                        Vuelo UA452
                      </p>
                    </div>
                    <p className="text-[10px] text-gray-500">
                      Actualizado: A tiempo
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
