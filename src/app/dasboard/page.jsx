"use client";
import Sidebar from "@/components/dashboard/SideBar";
import PantallasDirectorio from "@/components/dashboard/PantallasDirectorio";
import AltaEventos from "@/components/dashboard/altaEventos";
import ConsultaModEvento from "@/components/dashboard/consultaModEventos";
import Guia from "@/components/dashboard/guia";
import Licencia from "@/components/dashboard/licencia";
import PantallasSalon from "@/components/dashboard/pantallasSalon";
import Publicidad from "@/components/dashboard/publicidad";
import Soporte from "@/components/dashboard/soporte";
import Admin from "@/components/dashboard/admin";
import Link from "next/link";
import { useState } from "react";

function DashBoard() {
  const [showAdmin, setShowAdmin] = useState(true);
  const [showAltaEvento, setShowAltaEvento] = useState(true);
  const [showConsultaEvento, setShowConsultaEvento] = useState(false);

  const [showPantallaSalon, setShowPantallaSalon] = useState(false);
  const [showPantallaDirectorio, setShowPantallaDirectorio] = useState(false);
  const [showPublicidad, setShowPublicidad] = useState(false);

  const [showlicencia, setShowlicencia] = useState(false);
  const [showGuia, setShowGuia] = useState(false);
  const [showSoporte, setShowSoporte] = useState(false);

  return (
    // <!-- component -->
    <div className="flex flex-row min-h-screen bg-gray-100 text-gray-800 pt-16">
      <aside className="sidebar w-64 md:shadow transform -translate-x-full md:translate-x-0 transition-transform duration-150 ease-in bg-indigo-500">
        <Sidebar
          setShowAdmin={setShowAdmin}
          setShowAltaEvento={setShowAltaEvento}
          setShowConsultaEvento={setShowConsultaEvento}
          setShowPantallaSalon={setShowPantallaSalon}
          setShowPantallaDirectorio={setShowPantallaDirectorio}
          setShowPublicidad={setShowPublicidad}
          setShowlicencia={setShowlicencia}
          setShowGuia={setShowGuia}
          setShowSoporte={setShowSoporte}
        />
      </aside>
      <main className="main flex flex-col flex-grow -ml-64 md:ml-0 transition-all duration-150 ease-in">
        <div className="main-content flex flex-col flex-grow p-4">
          {showAdmin && <Admin />}
          {showAltaEvento && <AltaEventos />}
          {showConsultaEvento && <ConsultaModEvento />}

          {showPantallaSalon && <PantallasSalon />}
          {showPantallaDirectorio && <PantallasDirectorio />}
          {showPublicidad && <Publicidad />}

          {showlicencia && <Licencia />}
          {showGuia && <Guia />}
          {showSoporte && <Soporte />}
        </div>
      </main>
    </div>
  );
}

export default DashBoard;
