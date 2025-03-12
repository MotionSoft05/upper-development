/* eslint-disable @next/next/no-img-element */
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
import Admin from "@/components/dashboard/admin/admin";
import UserAdmin from "@/components/dashboard/userAdmin";
import Ediciondeempresa from "@/components/dashboard/ediciondeempresa";
import EditPantallaServicio from "@/components/dashboard/EditPantallaServicio";

import React, { useState, useEffect } from "react";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";
import auth from "@/firebase/auth";
import db from "@/firebase/firestore";
import { getFirestore, collection, doc, getDoc } from "firebase/firestore";

import { usePathname } from "next/navigation";

function DashBoard() {
  const isProduction = process.env.NEXT_PUBLIC_PRODUCTION;
  console.log("🚀 ~ DashBoard ~ isProduction:", isProduction);

  const [userEmail, setUserEmail] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showEdiciondeempresa, setShowEdiciondeempresa] = useState(false);
  const [showUserAdmin, setShowUserAdmin] = useState(true);
  const [showConsultaEvento, setShowConsultaEvento] = useState(false);

  const [showAltaEvento, setShowAltaEvento] = useState(false);

  const [showPantallaSalon, setShowPantallaSalon] = useState(false);
  const [showPantallaDirectorio, setShowPantallaDirectorio] = useState(false);
  const [showPantallaServicio, setShowPantallaServicio] = useState(false);
  const [showPublicidad, setShowPublicidad] = useState(false);

  const [showlicencia, setShowlicencia] = useState(false);
  const [showGuia, setShowGuia] = useState(false);
  const [showSoporte, setShowSoporte] = useState(false);

  // Estado para controlar la visibilidad del sidebar en dispositivos móviles
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            // Accede a los datos del usuario y se guardan en 'userData'
            setUserData(docSnap.data());
          } else {
            // El documento del usuario no existe
            console.log("No se encontraron datos para este usuario.");
          }
        } catch (error) {
          console.log("Error al obtener los datos del usuario:", error);
        }
      }
      setUserEmail(user ? user.email : null); // Actualiza el estado del correo electrónico del usuario
      setShowUserAdmin(true); // Muestra ConsultaModEvento por defecto
    });

    return () => unsubscribe();
  }, []);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  // Determinamos las clases del sidebar basado en el estado de visibilidad
  const sidebarClasses = `sidebar w-64 md:shadow transform ${
    sidebarVisible ? "translate-x-0" : "-translate-x-full"
  } md:translate-x-0 transition-transform duration-150 ease-in bg-blue-500 fixed z-50 h-full overflow-y-auto`;

  return (
    // <!-- component -->
    <div className="flex flex-row min-h-screen">
      <aside className={sidebarClasses}>
        <Sidebar
          userEmail={userEmail}
          userData={userData}
          setShowAdmin={setShowAdmin}
          showAdmin={showAdmin}
          setShowEdiciondeempresa={setShowEdiciondeempresa}
          showEdiciondeempresa={showEdiciondeempresa}
          setShowUserAdmin={setShowUserAdmin}
          showUserAdmin={showUserAdmin}
          setShowAltaEvento={setShowAltaEvento}
          showAltaEvento={showAltaEvento}
          setShowConsultaEvento={setShowConsultaEvento}
          showConsultaEvento={showConsultaEvento}
          setShowPantallaSalon={setShowPantallaSalon}
          showPantallaSalon={showPantallaSalon}
          setShowPantallaDirectorio={setShowPantallaDirectorio}
          showPantallaDirectorio={showPantallaDirectorio}
          setShowPantallaServicio={setShowPantallaServicio}
          showPantallaServicio={showPantallaServicio}
          setShowPublicidad={setShowPublicidad}
          showPublicidad={showPublicidad}
          setShowlicencia={setShowlicencia}
          showlicencia={showlicencia}
          setShowGuia={setShowGuia}
          showGuia={showGuia}
          setShowSoporte={setShowSoporte}
          showSoporte={showSoporte}
          toggleSidebar={toggleSidebar}
        />
      </aside>
      <main className="flex-1 flex flex-col md:ml-64 transition-all duration-150 ease-in min-h-screen overflow-x-auto">
        <div className="px-4 py-6 mb-20">
          {/* ADMINISTRACIÓN */}
          {showAdmin &&
            (userEmail === "uppermex10@gmail.com" ||
              userEmail === "ulises.jacobo@hotmail.com" ||
              userEmail === "contacto@upperds.mx") && <Admin />}{" "}
          {/* Usuarios y Licencias */}
          {showEdiciondeempresa &&
            (userEmail === "uppermex10@gmail.com" ||
              userEmail === "ulises.jacobo@hotmail.com" ||
              userEmail === "contacto@upperds.mx") && <Ediciondeempresa />}
          {/* GESTION DE USUARIOS */}
          {showUserAdmin && <UserAdmin />}
          {showAltaEvento && (
            <AltaEventos
              setShowAltaEvento={setShowAltaEvento}
              setShowUserAdmin={setShowUserAdmin}
            />
          )}
          {showConsultaEvento && <ConsultaModEvento />}
          {/* CONFIGURACION DE PANTALLAS */}
          {showPantallaSalon && <PantallasSalon />}
          {showPantallaDirectorio && <PantallasDirectorio />}
          {showPantallaServicio && <EditPantallaServicio />}
          {showPublicidad && <Publicidad />}
          {/* INFORMACION DE USUARIO */}
          {showlicencia && <Licencia />}
          {showGuia && <Guia userData={userData} />}
          {showSoporte && <Soporte />}
        </div>
      </main>

      {/* Botón mejorado para abrir el sidebar en mobile */}
      <button
        className="fixed bottom-5 right-5 flex items-center justify-center bg-white/90 backdrop-blur-sm text-blue-500 p-3 rounded-full shadow-lg border border-blue-200 hover:bg-blue-50 transition-all duration-300 md:hidden z-50 group"
        onClick={toggleSidebar}
        aria-label="Abrir menú"
      >
        <div className="flex flex-col items-center">
          <div className="w-6 h-0.5 bg-blue-500 mb-1.5"></div>
          <div className="w-6 h-0.5 bg-blue-500 mb-1.5"></div>
          <div className="w-6 h-0.5 bg-blue-500"></div>
        </div>
      </button>

      {/* Overlay para cerrar el sidebar al hacer clic fuera */}
      {sidebarVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
}

export default DashBoard;
