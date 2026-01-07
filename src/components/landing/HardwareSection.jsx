import { Tv, Smartphone, Cast, Check, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HardwareSection() {
  return (
    <section id="hardware" className="py-20 lg:py-32 bg-transparent relative">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* Visual Side */}
          <div className="flex-1 w-full max-w-[500px] lg:max-w-none">
            <div className="relative">
              {/* TV Mockup */}
              <div className="relative aspect-video bg-gray-900 rounded-2xl shadow-2xl border-[8px] border-gray-800 overflow-hidden ring-1 ring-gray-900/50">
                {/* Simulate Upper App Interface on TV */}
                <div className="w-full h-full bg-[#111] flex flex-col items-center justify-center relative">
                  {/* Background shapes */}
                  <div className="absolute top-[-50%] left-[-20%] w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent"></div>

                  <div className="text-center z-10 p-6">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Upper TV
                    </h3>
                    <p className="text-gray-400 text-sm mb-6">
                      Dispositivo vinculado • Sala Principal
                    </p>
                    <div className="flex gap-4 justify-center">
                      <div className="w-32 h-20 bg-gray-800/80 rounded border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer flex items-center justify-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full opacity-20"></div>
                      </div>
                      <div className="w-32 h-20 bg-gray-800/80 rounded border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer flex items-center justify-center">
                        <div className="w-8 h-8 bg-purple-500 rounded-full opacity-20"></div>
                      </div>
                    </div>
                  </div>

                  {/* Android TV UI Elements */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <div className="text-[10px] text-gray-400">12:45 PM</div>
                    <div className="w-4 h-4 text-gray-400">
                      <Tv size={14} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Stick/Box */}
              <div className="absolute -bottom-6 -right-6 lg:-right-12 bg-white p-4 rounded-xl shadow-xl border border-gray-100 flex items-center gap-4 max-w-[200px]">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0">
                  <Cast className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">ChromeCast</p>
                  <p className="text-[10px] text-gray-500">
                    Google TV Supported
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Software Potente. <br className="hidden lg:block" />
              <span className="text-[#0080FF]">Hardware Opcional.</span>
            </h2>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Potenciado por el{" "}
              <strong className="text-[#0080FF]">software de Upper</strong>,
              nuestra aplicación nativa para Android TV. Diseñada para
              estabilidad crítica y gestión remota sin interrupciones.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 rounded text-[#0080FF]">
                    <Tv size={16} />
                  </div>
                  Reproducción Offline
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Sistema de caché inteligente. Tu contenido sigue
                  reproduciéndose incluso sin internet. Ahorra hasta 90% de
                  ancho de banda.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                  <div className="p-1.5 bg-green-100 rounded text-green-600">
                    <Cast size={16} />
                  </div>
                  Actualización Real-Time
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Cambios instantáneos en todas tus pantallas. Vinculación
                  segura en 30 segundos con código de 6 dígitos.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                  <div className="p-1.5 bg-purple-100 rounded text-purple-600">
                    <Smartphone size={16} />
                  </div>
                  Monitoreo 24/7
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Heartbeat automático. Detecta si una pantalla se apaga o
                  pierde conexión desde tu dashboard central.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                  <div className="p-1.5 bg-orange-100 rounded text-orange-600">
                    <Check size={16} />
                  </div>
                  Compatibilidad Total
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Funciona en Sony Bravia, Xiaomi, Chromecast Google TV y
                  cualquier dispositivo Android TV certificado.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-4">
                ¿No tienes pantallas inteligentes?
              </p>
              <Link
                href="#contacto"
                className="inline-flex items-center gap-2 text-[#0080FF] font-medium hover:text-blue-700 transition-colors"
              >
                Contáctanos para recomendaciones{" "}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
