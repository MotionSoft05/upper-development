import React, { useState } from "react";
import DatosFiscales from "./licenciaComponentes/datosFiscales";
import LicenciaContratada from "./licenciaComponentes/LicenciaContratada";
import DatosNegocio from "./licenciaComponentes/datosNegocio";
import InformacionAdicional from "./licenciaComponentes/InformacionAdicional";

function Licencia() {
  const [showDatosNegocio, setShowDatosNegocio] = useState(true);
  const [showDatosFiscales, setShowDatosFiscales] = useState(false);
  const [showLicenciaContratada, setShowLicenciaContratada] = useState(false);
  const [showInformacionAdicional, setShowInformacionAdicional] =
    useState(false);

  return (
    <section className="px-8 py-12">
      <div className="text-lg font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              onClick={() => {
                setShowDatosNegocio(true);
                setShowDatosFiscales(false);
                setShowLicenciaContratada(false);
                setShowInformacionAdicional(false);
              }}
            >
              <div className="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300">
                <span className="ml-3">Mi cuenta</span>
              </div>
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => {
                setShowDatosNegocio(false);
                setShowDatosFiscales(true);
                setShowLicenciaContratada(false);
                setShowInformacionAdicional(false);
              }}
            >
              <div className="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300">
                <span className="ml-3">Datos de facturación</span>
              </div>
            </button>
          </li>
        </ul>
      </div>
      <main>
        <main className="main flex flex-col flex-grow -ml-64 md:ml-0 transition-all duration-150 ease-in">
          <div className="main-content flex flex-col flex-grow p-4">
            {showDatosNegocio && <DatosNegocio />}
            {showDatosFiscales && <DatosFiscales />}
            {showLicenciaContratada && <LicenciaContratada />}
            {showInformacionAdicional && <InformacionAdicional />}
          </div>
        </main>
      </main>
    </section>
  );
}

export default Licencia;
