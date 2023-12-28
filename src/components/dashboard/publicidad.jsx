// Publicidad.jsx
import React, { useState } from "react";
import PublicidadSalon from "./publicidadSalon";
import PublicidadDirect from "./publicidadDirec";

function Publicidad() {
  const [showSalon, setShowSalon] = useState(true);

  return (
    <section className="px-5 md:px-32">
      <div>
        <section className="">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">
              CONFIGURACIÓN DE PUBLICIDAD
            </h2>
            <p className="text-gray-600">
              Ingresar imágenes que serán desplegadas cuando no se cuente con
              eventos.
            </p>
            <p className="text-gray-600">
              El tamaño recomendado es el de tu pantalla.
            </p>
          </div>

          <div className="mb-8">
            <button
              onClick={() => setShowSalon(true)}
              className={`${
                showSalon
                  ? "bg-blue-500 text-white"
                  : "bg-gray-400 text-gray-700"
              } px-4 py-2 rounded-md focus:outline-none`}
            >
              Salón de Eventos
            </button>
            <button
              onClick={() => setShowSalon(false)}
              className={`${
                !showSalon
                  ? "bg-blue-500 text-white"
                  : "bg-gray-400 text-gray-700"
              } ml-4 px-4 py-2 rounded-md focus:outline-none`}
            >
              Directorio de Eventos
            </button>
          </div>

          <div className="mb-8">
            {showSalon ? <PublicidadSalon /> : <PublicidadDirect />}
          </div>
        </section>
      </div>
    </section>
  );
}

export default Publicidad;
