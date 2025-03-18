// Publicidad.jsx
import React, { useState } from "react";
import PublicidadSalon from "./publicidadSalon";
import PublicidadDirect from "./publicidadDirec";
import { useTranslation } from "react-i18next";

function Publicidad() {
  const { t } = useTranslation();
  const [showSalon, setShowSalon] = useState(true);
  const [activeTab, setActiveTab] = useState("salon");

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Cabecera con título y descripción */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {t("advertisement.title")}
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-base text-gray-500 sm:text-lg">
            {t("advertisement.description1")}
          </p>
          <p className="mt-2 max-w-2xl mx-auto text-sm text-gray-500">
            {t("advertisement.description2")}
          </p>
        </div>

        {/* Contenido principal */}
        <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Pestañas de navegación mejoradas */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setShowSalon(true);
                setActiveTab("salon");
              }}
              className={`flex-1 py-4 px-4 text-center font-medium text-sm sm:text-base relative ${
                activeTab === "salon"
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t("advertisement.eventRoom")}
              {activeTab === "salon" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
              )}
            </button>
            <button
              onClick={() => {
                setShowSalon(false);
                setActiveTab("directory");
              }}
              className={`flex-1 py-4 px-4 text-center font-medium text-sm sm:text-base relative ${
                activeTab === "directory"
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t("advertisement.eventDirectory")}
              {activeTab === "directory" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
              )}
            </button>
          </div>

          {/* Contenedor de pestañas con sombras suaves */}
          <div className="p-6">
            <div className="bg-white rounded-lg transition-opacity duration-200">
              {showSalon ? <PublicidadSalon /> : <PublicidadDirect />}
            </div>
          </div>
        </div>

        {/* Tarjeta informativa */}
        <div className="mt-8 max-w-4xl mx-auto bg-blue-50 border border-blue-100 rounded-lg p-4 shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                {t("advertisement.infoTitle") || "Información importante"}
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  {t("advertisement.infoText") ||
                    "Las imágenes o videos que agregue se mostrarán cuando no haya eventos programados en las pantallas. Puede agregar hasta 10 elementos por tipo de pantalla."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Publicidad;
