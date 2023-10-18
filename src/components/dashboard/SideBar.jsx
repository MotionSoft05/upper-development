import Link from "next/link";

function Sidebar({
  setShowAltaEvento,
  setShowConsultaEvento,
  setShowPantallaSalon,
  setShowPantallaDirectorio,
  setShowPublicidad,
  setShowlicencia,
  setShowGuia,
  setShowSoporte,
  setShowAdmin,
}) {
  return (
    <div className="sidebar-content px-4 py-6">
      <ul className="flex flex-col w-full">
        <div className="my-px">
          <span className="flex font-medium text-sm text-gray-300 px-4 my-4 uppercase">
            Principal
          </span>
        </div>

        <li className="my-px">
          <button
            onClick={() => {
              setShowAdmin(true);
              setShowAltaEvento(false);
              setShowConsultaEvento(false);
              setShowPantallaSalon(false);
              setShowPantallaDirectorio(false);
              setShowPublicidad(false);
              setShowlicencia(false);
              setShowGuia(false);
              setShowSoporte(false);
            }}
          >
            <a
              href="#"
              className="flex flex-row items-center h-10 px-3 rounded-lg text-gray-300 hover:bg-gray-100 hover:text-gray-700"
            >
              <span className="ml-3">Admin</span>
            </a>
          </button>
        </li>

        <li className="my-px">
          <button
            onClick={() => {
              setShowAdmin(false);
              setShowAltaEvento(true);
              setShowConsultaEvento(false);
              setShowPantallaSalon(false);
              setShowPantallaDirectorio(false);
              setShowPublicidad(false);
              setShowlicencia(false);
              setShowGuia(false);
              setShowSoporte(false);
            }}
          >
            <a
              href="#"
              className="flex flex-row items-center h-10 px-3 rounded-lg text-gray-300 hover:bg-gray-100 hover:text-gray-700"
            >
              <span className="flex items-center justify-center text-lg text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24"
                  viewBox="0 -960 960 960"
                  width="24"
                >
                  <path
                    d="M580-240q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z"
                    fill="#9ca3af"
                  />
                </svg>
              </span>
              <span className="ml-3">Alta de eventos</span>
            </a>
          </button>
        </li>
        <li className="my-px">
          <button
            onClick={() => {
              setShowAdmin(false);
              setShowAltaEvento(false);
              setShowConsultaEvento(true);
              setShowPantallaSalon(false);
              setShowPantallaDirectorio(false);
              setShowPublicidad(false);
              setShowlicencia(false);
              setShowGuia(false);
              setShowSoporte(false);
            }}
          >
            <a
              href="#"
              className="flex flex-row items-center h-10 px-3 rounded-lg text-gray-300 hover:bg-gray-100 hover:text-gray-700"
            >
              <span className="flex items-center justify-center text-lg text-gray-400">
                <svg
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </span>
              <span className="ml-3">Consulta de eventos</span>
            </a>
          </button>
        </li>
        <li className="my-px">
          <span className="flex font-medium text-sm text-gray-300 px-4 my-4 uppercase">
            Ajustes pantallas
          </span>
        </li>
        <li className="my-px">
          <button
            onClick={() => {
              setShowAdmin(false);
              setShowAltaEvento(false);
              setShowConsultaEvento(false);
              setShowPantallaSalon(true);
              setShowPantallaDirectorio(false);
              setShowPublicidad(false);
              setShowlicencia(false);
              setShowGuia(false);
              setShowSoporte(false);
            }}
          >
            <a
              href="#"
              className="flex flex-row items-center h-10 px-3 rounded-lg text-gray-300 hover:bg-gray-100 hover:text-gray-700"
            >
              <span className="flex items-center justify-center text-lg text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24"
                  viewBox="0 -960 960 960"
                  width="24"
                >
                  <path
                    d="M240-500v-220h220v220H240Zm0 260v-220h220v220H240Zm260-260v-220h220v220H500Zm0 260v-220h220v220H500ZM320-580h60v-60h-60v60Zm260 0h60v-60h-60v60ZM320-320h60v-60h-60v60Zm260 0h60v-60h-60v60ZM380-580Zm200 0Zm0 200Zm-200 0ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Z"
                    fill="#9ca3af"
                  />
                </svg>
              </span>
              <span className="ml-3">Pantallas salon</span>
            </a>
          </button>
        </li>
        <li className="my-px">
          <button
            onClick={() => {
              setShowAdmin(false);
              setShowAltaEvento(false);
              setShowConsultaEvento(false);
              setShowPantallaSalon(false);
              setShowPantallaDirectorio(true);
              setShowPublicidad(false);
              setShowlicencia(false);
              setShowGuia(false);
              setShowSoporte(false);
            }}
          >
            <a
              href="#"
              className="flex flex-row items-center h-10 px-3 rounded-lg text-gray-300 hover:bg-gray-100 hover:text-gray-700"
            >
              <span className="flex items-center justify-center text-lg text-green-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24"
                  viewBox="0 -960 960 960"
                  width="24"
                >
                  <path
                    d="M320-120v-80H160q-33 0-56.5-23.5T80-280v-480q0-33 23.5-56.5T160-840h640q33 0 56.5 23.5T880-760v480q0 33-23.5 56.5T800-200H640v80H320ZM160-280h640v-480H160v480Zm0 0v-480 480Z"
                    fill="#9ca3af"
                  />
                </svg>
              </span>
              <span className="ml-3">Pantallas directorio</span>
            </a>
          </button>
        </li>
        <li className="my-px">
          <button
            onClick={() => {
              setShowAdmin(false);
              setShowAltaEvento(false);
              setShowConsultaEvento(false);
              setShowPantallaSalon(false);
              setShowPantallaDirectorio(false);
              setShowPublicidad(true);
              setShowlicencia(false);
              setShowGuia(false);
              setShowSoporte(false);
            }}
          >
            <a
              href="#"
              className="flex flex-row items-center h-10 px-3 rounded-lg text-gray-300 hover:bg-gray-100 hover:text-gray-700"
            >
              <span className="flex items-center justify-center text-lg text-green-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24"
                  viewBox="0 -960 960 960"
                  width="24"
                >
                  <path
                    d="M720-440v-80h160v80H720Zm48 280-128-96 48-64 128 96-48 64Zm-80-480-48-64 128-96 48 64-128 96ZM200-200v-160h-40q-33 0-56.5-23.5T80-440v-80q0-33 23.5-56.5T160-600h160l200-120v480L320-360h-40v160h-80Zm100-280Zm260 134v-268q27 24 43.5 58.5T620-480q0 41-16.5 75.5T560-346ZM160-520v80h182l98 58v-196l-98 58H160Z"
                    fill="#9ca3af"
                  />
                </svg>
              </span>
              <span className="ml-3">Publicidad</span>
            </a>
          </button>
        </li>
        <li className="my-px">
          <span className="flex font-medium text-sm text-gray-300 px-4 my-4 uppercase">
            Mas información
          </span>
        </li>
        <li className="my-px">
          <button
            onClick={() => {
              setShowAdmin(false);
              setShowAltaEvento(false);
              setShowConsultaEvento(false);
              setShowPantallaSalon(false);
              setShowPantallaDirectorio(false);
              setShowPublicidad(false);
              setShowlicencia(true);
              setShowGuia(false);
              setShowSoporte(false);
            }}
          >
            <a
              href="#"
              className="flex flex-row items-center h-10 px-3 rounded-lg text-gray-300 hover:bg-gray-100 hover:text-gray-700"
            >
              <span className="flex items-center justify-center text-lg text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24"
                  viewBox="0 -960 960 960"
                  width="24"
                >
                  <path
                    d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h440l200 200v440q0 33-23.5 56.5T760-120H200Zm0-80h560v-400H600v-160H200v560Zm80-80h400v-80H280v80Zm0-320h200v-80H280v80Zm0 160h400v-80H280v80Zm-80-320v160-160 560-560Z"
                    fill="#9ca3af"
                  />
                </svg>
              </span>
              <span className="ml-3">Información licencia</span>
            </a>
          </button>
        </li>
        <li className="my-px">
          <button
            onClick={() => {
              setShowAdmin(false);
              setShowAltaEvento(false);
              setShowConsultaEvento(false);
              setShowPantallaSalon(false);
              setShowPantallaDirectorio(false);
              setShowPublicidad(false);
              setShowlicencia(false);
              setShowGuia(true);
              setShowSoporte(false);
            }}
          >
            <a
              href="#"
              className="flex flex-row items-center h-10 px-3 rounded-lg text-gray-300 hover:bg-gray-100 hover:text-gray-700"
            >
              <span className="flex items-center justify-center text-lg text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24"
                  viewBox="0 -960 960 960"
                  width="24"
                >
                  <path
                    d="m480-80-10-120h-10q-142 0-241-99t-99-241q0-142 99-241t241-99q71 0 132.5 26.5t108 73q46.5 46.5 73 108T800-540q0 75-24.5 144t-67 128q-42.5 59-101 107T480-80Zm80-146q71-60 115.5-140.5T720-540q0-109-75.5-184.5T460-800q-109 0-184.5 75.5T200-540q0 109 75.5 184.5T460-280h100v54Zm-101-95q17 0 29-12t12-29q0-17-12-29t-29-12q-17 0-29 12t-12 29q0 17 12 29t29 12Zm-29-127h60q0-30 6-42t38-44q18-18 30-39t12-45q0-51-34.5-76.5T460-720q-44 0-74 24.5T344-636l56 22q5-17 19-33.5t41-16.5q27 0 40.5 15t13.5 33q0 17-10 30.5T480-558q-35 30-42.5 47.5T430-448Zm30-65Z"
                    fill="#9ca3af"
                  />
                </svg>
              </span>
              <span className="ml-3">Guías de Usuario</span>
            </a>
          </button>
        </li>
        <li className="my-px">
          <button
            onClick={() => {
              setShowAdmin(false);
              setShowAltaEvento(false);
              setShowConsultaEvento(false);
              setShowPantallaSalon(false);
              setShowPantallaDirectorio(false);
              setShowPublicidad(false);
              setShowlicencia(false);
              setShowGuia(false);
              setShowSoporte(true);
            }}
          >
            <a
              href="#"
              className="flex flex-row items-center h-10 px-3 rounded-lg text-gray-300 hover:bg-gray-100 hover:text-gray-700"
            >
              <span className="flex items-center justify-center text-lg text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24"
                  viewBox="0 -960 960 960"
                  width="24"
                >
                  <path
                    d="M440-120v-80h320v-284q0-117-81.5-198.5T480-764q-117 0-198.5 81.5T200-484v244h-40q-33 0-56.5-23.5T80-320v-80q0-21 10.5-39.5T120-469l3-53q8-68 39.5-126t79-101q47.5-43 109-67T480-840q68 0 129 24t109 66.5Q766-707 797-649t40 126l3 52q19 9 29.5 27t10.5 38v92q0 20-10.5 38T840-249v49q0 33-23.5 56.5T760-120H440Zm-80-280q-17 0-28.5-11.5T320-440q0-17 11.5-28.5T360-480q17 0 28.5 11.5T400-440q0 17-11.5 28.5T360-400Zm240 0q-17 0-28.5-11.5T560-440q0-17 11.5-28.5T600-480q17 0 28.5 11.5T640-440q0 17-11.5 28.5T600-400Zm-359-62q-7-106 64-182t177-76q89 0 156.5 56.5T720-519q-91-1-167.5-49T435-698q-16 80-67.5 142.5T241-462Z"
                    fill="#9ca3af"
                  />
                </svg>
              </span>
              <span className="ml-3">Contacto Soporte</span>
            </a>
          </button>
        </li>
        <li className="my-px">
          <Link
            href="/login"
            className="flex flex-row items-center h-10 px-3 rounded-lg text-gray-300 hover:bg-gray-100 hover:text-gray-700"
          >
            <span className="flex items-center justify-center text-lg text-red-400">
              <svg
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            </span>
            <span className="ml-3">Logout</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
