"use client";
import { useState } from "react";

function Navigation() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  return (
    <nav className="bg-white">
      <div className="mx-10 flex items-center justify-between">
        <a href="#" className="flex items-center">
          <img src="/img/logov2.png" className="h-24 m-2 " alt="Logo" />
        </a>
        <div className="items-center justify-between flex">
          <div>
            <ul className="flex font-bold rounded-lg flex-row space-x-8  ">
              <li>
                <a
                  href="#"
                  className="hover:text-custom md:p-0"
                  aria-current="page"
                >
                  Productos
                </a>
              </li>
              <li>
                <a href="#soluciones" className="hover:text-custom md:p-0">
                  Soluciones
                </a>
              </li>
              <li>
                <a href="#recursos" className=" hover:text-custom md:p-0">
                  Recursos
                </a>
              </li>

              <li>
                <a href="#precios" className="hover:text-custom md:p-0">
                  Precios
                </a>
              </li>

              <li>
                <a href="#preguntas" className="hover:text-custom md:p-0">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div className=" p-3">
            <button
              type="button"
              className="text-white bg-green-300 hover:bg-teal-300 font-medium rounded-lg text-sm px-4 py-2  "
            >
              Registrarse
            </button>
          </div>
          <div>
            <button
              type="button"
              className="text-white bg-custom hover:bg-teal-300 font-medium rounded-lg text-sm px-4 py-2 "
            >
              Acceso a usuarios
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
