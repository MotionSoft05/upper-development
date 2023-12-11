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
import UserAdmin from "@/components/dashboard/userAdmin";

import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCzD--npY_6fZcXH-8CzBV7UGzPBqg85y8",
  authDomain: "upper-a544e.firebaseapp.com",
  projectId: "upper-a544e",
  storageBucket: "upper-a544e.appspot.com",
  messagingSenderId: "665713417470",
  appId: "1:665713417470:web:73f7fb8ee518bea35999af",
  measurementId: "G-QTFQ55YY5D",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function DashBoard() {
  const [userEmail, setUserEmail] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showUserAdmin, setShowUserAdmin] = useState(false);
  const [showConsultaEvento, setShowConsultaEvento] = useState(true);

  const [showAltaEvento, setShowAltaEvento] = useState(false);

  const [showPantallaSalon, setShowPantallaSalon] = useState(false);
  const [showPantallaDirectorio, setShowPantallaDirectorio] = useState(false);
  const [showPublicidad, setShowPublicidad] = useState(false);

  const [showlicencia, setShowlicencia] = useState(false);
  const [showGuia, setShowGuia] = useState(false);
  const [showSoporte, setShowSoporte] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserEmail(user ? user.email : null); // Actualiza el estado del correo electrónico del usuario
      setShowConsultaEvento(true); // Muestra ConsultaModEvento por defecto
    });

    return () => unsubscribe();
  }, []);

  const [sidebarClasses, setSidebarClasses] = useState(
    "sidebar w-64 md:shadow transform -translate-x-full md:translate-x-0 transition-transform duration-150 ease-in bg-blue-500 "
  );

  const toggleSidebar = () => {
    // Cambia las clases del sidebar al hacer clic en el botón
    setSidebarClasses((prevClasses) => {
      // Si el sidebar tiene las primeras clases, cambia a las segundas y viceversa
      return prevClasses.includes("-translate-x-full")
        ? "sidebar w-64 md:shadow transform md:translate-x-0 transition-transform duration-150 ease-in bg-blue-500 z-50"
        : "sidebar w-64 md:shadow transform -translate-x-full md:translate-x-0 transition-transform duration-150 ease-in bg-blue-500 ";
    });
  };
  return (
    // <!-- component -->
    <div className="flex flex-row min-h-screen  ">
      <aside className={sidebarClasses}>
        <Sidebar
          userEmail={userEmail}
          setShowAdmin={setShowAdmin}
          setShowUserAdmin={setShowUserAdmin}
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
        <div className="">
          {showAdmin && userEmail === "uppermex10@gmail.com" && <Admin />}
          {showUserAdmin && <UserAdmin />}
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
      <button
        className="fixed bottom-4 right-4 bg-blue-500 text-white py-2 px-4 rounded-3xl shadow"
        onClick={toggleSidebar}
      >
        <img src="/img/sidebar.svg" alt="Logo" className="w-8" />
      </button>
    </div>
  );
}

export default DashBoard;
