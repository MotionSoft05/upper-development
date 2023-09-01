"use client";
import { useState } from "react";

function Navigation() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  return (
    <nav className="bg-gray-900 fixed w-full z-20 top-0 left-0 border-b border-gray-600">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <a href="#" className="flex items-center">
          <img src="/img/logo.png" className="h-8 mr-3" alt="Logo" />
        </a>
        <div className="flex md:order-2">
          <button
            type="button"
            className="text-white bg-custom hover:bg-teal-300 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center mr-3 md:mr-0 "
          >
            Registrarse
          </button>
          <button
            id="MobileNav"
            onClick={toggleMobileNav}
            data-collapse-toggle="navbar-sticky"
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm rounded-lg md:hidden focus:outline-none focus:ring-2 text-gray-400 hover:bg-gray-700 focus:ring-gray-600"
            aria-controls="navbar-sticky"
            aria-expanded={isMobileNavOpen ? "true" : "false"}
          >
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>
        <div
          className={`items-center justify-between w-full md:flex md:w-auto md:order-1 ${
            isMobileNavOpen ? "block" : "hidden"
          }`}
          id="MobileContent"
        >
          <ul className=" scroll-smooth flex flex-col p-4 md:p-0 mt-4 font-medium border rounded-lg md:flex-row md:space-x-8 md:mt-0 md:border-0 bg-gray-800 md:bg-gray-900 border-gray-700">
            <li>
              <a
                href="#soluciones"
                className="block py-2 pl-3 pr-4 text-white hover:text-custom md:p-0"
              >
                Soluciones
              </a>
            </li>
            <li>
              <a
                href="#recursos"
                className="block py-2 pl-3 pr-4 text-white hover:text-custom md:p-0"
              >
                Recursos
              </a>
            </li>
            <li>
              <a
                href="#preguntas"
                className="block py-2 pl-3 pr-4 text-white hover:text-custom md:p-0"
              >
                FAQ
              </a>
            </li>
            <li>
              <a
                href="#precios"
                className="block py-2 pl-3 pr-4 text-white hover:text-custom md:p-0"
              >
                Precios
              </a>
            </li>
            <li>
              <a
                href="#contacto"
                className="block py-2 pl-3 pr-4 text-white hover:text-custom md:p-0"
                aria-current="page"
              >
                Contacto
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
