"use client";
import React from "react";
import ServiceCard from "./ServiceCard";
import { Calendar, Map as MapIcon, List, Tag, Video } from "lucide-react";
import Image from "next/image";

export default function ServicesGrid() {
  return (
    <section id="servicios" className="py-20 lg:py-32 bg-transparent relative">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
            Una plataforma.{" "}
            <span className="text-[#0080FF]">Infinitas posibilidades.</span>
          </h2>
          <p className="text-lg text-gray-600">
            Desde lobbies de hoteles hasta terminales de aeropuerto. Nuestros
            templates inteligentes se adaptan a tu necesidad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(350px,auto)]">
          {/* 1. Pantalla Promociones (Priority 1 - Large) */}
          <ServiceCard
            title="Promociones & Branding"
            description="Gestiona campañas de marketing con videos 4K y programación por fechas. Ideal para lobbies y zonas de alto tráfico."
            icon={Video}
            color="purple"
            className="md:col-span-2 md:row-span-1"
          >
            <div className="w-full h-full relative bg-gray-900 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20"></div>
              {/* Play Button Effect */}
              <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-2xl transition-transform hover:scale-110 duration-300">
                <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-1"></div>
              </div>
              <div className="absolute bottom-6 left-6 flex gap-2">
                <div className="px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/10">
                  Programación Automática
                </div>
                <div className="px-3 py-1 bg-purple-500/80 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/10">
                  Soporte 4K
                </div>
              </div>
            </div>
          </ServiceCard>

          {/* 2. Pantalla Vuelos (Priority 1.5 - Square but prominent) */}
          <ServiceCard
            title="Vuelos en Tiempo Real"
            description="Conexión directa con OpenSky y aeropuertos globales (MEX, CUN, MTY). Información precisa de salidas y llegadas para tus huéspedes."
            icon={MapIcon}
            color="green"
            className="md:col-span-1 md:row-span-1"
          >
            <div className="w-full h-full relative bg-slate-900 flex flex-col p-5 font-mono text-sm overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]"></div>
              <div className="flex justify-between text-green-400/60 mb-4 text-xs tracking-wider">
                <span>FLIGHT</span>
                <span>STATUS</span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-white border-b border-white/10 pb-2">
                  <span className="font-bold text-lg">UA 921</span>
                  <span className="text-green-400 bg-green-900/30 px-2 py-0.5 rounded text-xs animate-pulse">
                    ON TIME
                  </span>
                </div>
                <div className="flex justify-between items-center text-white/80 border-b border-white/10 pb-2">
                  <span className="font-bold">AM 404</span>
                  <span className="text-yellow-400 bg-yellow-900/30 px-2 py-0.5 rounded text-xs">
                    DELAYED
                  </span>
                </div>
                <div className="flex justify-between items-center text-white/60">
                  <span className="font-bold">LH 101</span>
                  <span className="text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded text-xs">
                    BOARDING
                  </span>
                </div>
              </div>
            </div>
          </ServiceCard>

          {/* 3. Pantalla Salón (Secondary) */}
          <ServiceCard
            title="Salón de Eventos"
            description="Agenda automatizada sincronizada con tu calendario. Muestra logos de clientes, clima y noticias RSS en tiempo real."
            icon={Calendar}
            color="blue"
            className="md:col-span-1"
          >
            <div className="w-full h-full bg-blue-50/50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
              <div className="w-full max-w-[140px] bg-white rounded-lg shadow-sm p-3 border border-blue-100 z-10 transform -rotate-3 transition-transform group-hover:rotate-0 duration-300">
                <div className="h-2 w-12 bg-blue-100 rounded mb-2"></div>
                <div className="h-1.5 w-full bg-gray-100 rounded mb-1"></div>
                <div className="h-1.5 w-2/3 bg-gray-100 rounded"></div>
              </div>
              <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
            </div>
          </ServiceCard>

          {/* 4. Directorio (Secondary) */}
          <ServiceCard
            title="Directorio Digital"
            description="Guía interactiva para visitantes. Muestra listas de eventos del día, mapas de ubicación y publicidad segmentada."
            icon={List}
            color="orange"
            className="md:col-span-1"
          >
            <div className="w-full h-full bg-orange-50/50 flex items-center justify-center relative overflow-hidden">
              <div className="absolute right-4 top-4 w-16 h-16 bg-orange-100 rounded-full blur-2xl"></div>
              <div className="flex flex-col gap-2 w-32">
                <div className="h-8 w-full bg-white rounded shadow-sm border-l-4 border-orange-400"></div>
                <div className="h-8 w-full bg-white rounded shadow-sm border-l-4 border-orange-300 ml-4"></div>
                <div className="h-8 w-full bg-white rounded shadow-sm border-l-4 border-orange-200 ml-8"></div>
              </div>
            </div>
          </ServiceCard>

          {/* 5. Tarifario (Secondary) */}
          <ServiceCard
            title="Tarifario Digital"
            description="Tablas de precios actualizables al instante. Soporte para múltiples monedas y rotación de ofertas especiales."
            icon={Tag}
            color="pink"
            className="md:col-span-1"
          >
            <div className="w-full h-full bg-pink-50/50 flex items-center justify-center relative overflow-hidden">
              <div className="text-center space-y-1 z-10">
                <div className="text-3xl font-bold text-gray-900">$120</div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">
                  Premium
                </div>
              </div>
              <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-white to-transparent"></div>
            </div>
          </ServiceCard>
        </div>
      </div>
    </section>
  );
}
