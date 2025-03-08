import { useTranslation } from "react-i18next";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpenReader,
  faBuilding,
  faBullhorn,
  faCalendarPlus,
  faCircleQuestion,
  faClipboardQuestion,
  faDisplay,
  faHeadset,
  faSolarPanel,
  faTableColumns,
  faUserTie,
  faSignOutAlt,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

function Sidebar(props) {
  const { t } = useTranslation();

  const changePanel = (setVisible) => {
    // Cambio los estados para mostrar solo un panel a la vez
    props.setShowAdmin(false);
    props.setShowUserAdmin(false);
    props.setShowEdiciondeempresa(false);
    props.setShowAltaEvento(false);
    props.setShowConsultaEvento(false);
    props.setShowPantallaSalon(false);
    props.setShowPantallaDirectorio(false);
    props.setShowPublicidad(false);
    props.setShowlicencia(false);
    props.setShowGuia(false);
    props.setShowSoporte(false);
    props.setShowPantallaServicio(false);
    props.toggleSidebar();
    props[setVisible](true); // hook que se llamara en la funcion para cambiar el estado
  };

  //? -- Permisos --
  const permisos = props.userData?.permisos || 0;
  const showAdministrador = [10].includes(permisos);
  const showPersonalicePantallas = [10, 1, 2, 3].includes(permisos);
  const showAjustesPantalla = [10, 3].includes(permisos);
  const showInformacion = [10, 2, 3].includes(permisos);
  //? --------------

  const isActive = (show) => show === true;

  return (
    <div className="sidebar-content bg-gradient-to-b  rounded-r-lg ">
      {/* Logo en la parte superior */}
      <div className="py-4 px-6 flex justify-center">
        <img src="/img/logov2.png" alt="Upper Logo" className="h-10" />
      </div>

      <ul className="flex flex-col w-full px-2">
        {/* ADMINISTRADOR permiso solo para SUPERADMIN */}
        {showAdministrador && (
          <li className="mb-4">
            <div className="px-4 py-2">
              <h3 className="text-xs font-semibold tracking-wider text-blue-100 uppercase mb-2 flex items-center">
                <span className="mr-2 w-6 border-t border-blue-300"></span>
                {t("sidebar.admin")}
                <span className="ml-2 w-6 border-t border-blue-300"></span>
              </h3>
            </div>

            {/* Admin */}
            <div className="mb-1">
              <button
                className={`w-full flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 group ${
                  isActive(props.showAdmin)
                    ? "bg-white shadow-md text-blue-700 font-medium"
                    : "text-blue-100 hover:bg-blue-700/50"
                }`}
                onClick={() => changePanel("setShowAdmin")}
              >
                <span
                  className={`flex-shrink-0 ${
                    isActive(props.showAdmin)
                      ? "text-blue-600"
                      : "text-blue-200 group-hover:text-white"
                  }`}
                >
                  <FontAwesomeIcon icon={faUserTie} className="w-5 h-5" />
                </span>
                <span className="ml-3">{t("sidebar.admin")}</span>
                {isActive(props.showAdmin) && (
                  <span className="ml-auto">
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="w-3 h-3"
                    />
                  </span>
                )}
              </button>
            </div>

            {/* Edicion de Empresas */}
            <div className="mb-1">
              <button
                className={`w-full flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 group ${
                  isActive(props.showEdiciondeempresa)
                    ? "bg-white shadow-md text-blue-700 font-medium"
                    : "text-blue-100 hover:bg-blue-700/50"
                }`}
                onClick={() => changePanel("setShowEdiciondeempresa")}
              >
                <span
                  className={`flex-shrink-0 ${
                    isActive(props.showEdiciondeempresa)
                      ? "text-blue-600"
                      : "text-blue-200 group-hover:text-white"
                  }`}
                >
                  <FontAwesomeIcon icon={faBuilding} className="w-5 h-5" />
                </span>
                <span className="ml-3">{t("sidebar.eventEditing")}</span>
                {isActive(props.showEdiciondeempresa) && (
                  <span className="ml-auto">
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="w-3 h-3"
                    />
                  </span>
                )}
              </button>
            </div>
          </li>
        )}

        {/* PERSONALICE SUS PANTALLAS */}
        {showPersonalicePantallas && (
          <li className="mb-4">
            <div className="px-4 py-2">
              <h3 className="text-xs font-semibold tracking-wider text-blue-100 uppercase mb-2 flex items-center">
                <span className="mr-2 w-6 border-t border-blue-300"></span>
                {t("sidebar.title")}
                <span className="ml-2 w-6 border-t border-blue-300"></span>
              </h3>
            </div>

            {/* Tablero */}
            <div className="mb-1">
              <button
                className={`w-full flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 group ${
                  isActive(props.showUserAdmin)
                    ? "bg-white shadow-md text-blue-700 font-medium"
                    : "text-blue-100 hover:bg-blue-700/50"
                }`}
                onClick={() => changePanel("setShowUserAdmin")}
              >
                <span
                  className={`flex-shrink-0 ${
                    isActive(props.showUserAdmin)
                      ? "text-blue-600"
                      : "text-blue-200 group-hover:text-white"
                  }`}
                >
                  <FontAwesomeIcon icon={faTableColumns} className="w-5 h-5" />
                </span>
                <span className="ml-3">{t("sidebar.dashboard")}</span>
                {isActive(props.showUserAdmin) && (
                  <span className="ml-auto">
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="w-3 h-3"
                    />
                  </span>
                )}
              </button>
            </div>

            {/* Alta de eventos */}
            <div className="mb-1">
              <button
                className={`w-full flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 group ${
                  isActive(props.showAltaEvento)
                    ? "bg-white shadow-md text-blue-700 font-medium"
                    : "text-blue-100 hover:bg-blue-700/50"
                }`}
                onClick={() => changePanel("setShowAltaEvento")}
              >
                <span
                  className={`flex-shrink-0 ${
                    isActive(props.showAltaEvento)
                      ? "text-blue-600"
                      : "text-blue-200 group-hover:text-white"
                  }`}
                >
                  <FontAwesomeIcon icon={faCalendarPlus} className="w-5 h-5" />
                </span>
                <span className="ml-3">{t("sidebar.eventRegistration")}</span>
                {isActive(props.showAltaEvento) && (
                  <span className="ml-auto">
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="w-3 h-3"
                    />
                  </span>
                )}
              </button>
            </div>

            {/* Consulta de eventos */}
            <div className="mb-1">
              <button
                className={`w-full flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 group ${
                  isActive(props.showConsultaEvento)
                    ? "bg-white shadow-md text-blue-700 font-medium"
                    : "text-blue-100 hover:bg-blue-700/50"
                }`}
                onClick={() => changePanel("setShowConsultaEvento")}
              >
                <span
                  className={`flex-shrink-0 ${
                    isActive(props.showConsultaEvento)
                      ? "text-blue-600"
                      : "text-blue-200 group-hover:text-white"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={faClipboardQuestion}
                    className="w-5 h-5"
                  />
                </span>
                <span className="ml-3">{t("sidebar.eventQuery")}</span>
                {isActive(props.showConsultaEvento) && (
                  <span className="ml-auto">
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="w-3 h-3"
                    />
                  </span>
                )}
              </button>
            </div>
          </li>
        )}

        {/* AJUSTES PANTALLAS */}
        {showAjustesPantalla && (
          <li className="mb-4">
            <div className="px-4 py-2">
              <h3 className="text-xs font-semibold tracking-wider text-blue-100 uppercase mb-2 flex items-center">
                <span className="mr-2 w-6 border-t border-blue-300"></span>
                {t("sidebar.screenSettings")}
                <span className="ml-2 w-6 border-t border-blue-300"></span>
              </h3>
            </div>

            {/* Pantallas salon */}
            <div className="mb-1">
              <button
                className={`w-full flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 group ${
                  isActive(props.showPantallaSalon)
                    ? "bg-white shadow-md text-blue-700 font-medium"
                    : "text-blue-100 hover:bg-blue-700/50"
                }`}
                onClick={() => changePanel("setShowPantallaSalon")}
              >
                <span
                  className={`flex-shrink-0 ${
                    isActive(props.showPantallaSalon)
                      ? "text-blue-600"
                      : "text-blue-200 group-hover:text-white"
                  }`}
                >
                  <FontAwesomeIcon icon={faSolarPanel} className="w-5 h-5" />
                </span>
                <span className="ml-3">{t("sidebar.roomScreens")}</span>
                {isActive(props.showPantallaSalon) && (
                  <span className="ml-auto">
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="w-3 h-3"
                    />
                  </span>
                )}
              </button>
            </div>

            {/* Pantallas Directorio */}
            <div className="mb-1">
              <button
                className={`w-full flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 group ${
                  isActive(props.showPantallaDirectorio)
                    ? "bg-white shadow-md text-blue-700 font-medium"
                    : "text-blue-100 hover:bg-blue-700/50"
                }`}
                onClick={() => changePanel("setShowPantallaDirectorio")}
              >
                <span
                  className={`flex-shrink-0 ${
                    isActive(props.showPantallaDirectorio)
                      ? "text-blue-600"
                      : "text-blue-200 group-hover:text-white"
                  }`}
                >
                  <FontAwesomeIcon icon={faDisplay} className="w-5 h-5" />
                </span>
                <span className="ml-3">{t("sidebar.directoryScreens")}</span>
                {isActive(props.showPantallaDirectorio) && (
                  <span className="ml-auto">
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="w-3 h-3"
                    />
                  </span>
                )}
              </button>
            </div>

            {/* Publicidad */}
            <div className="mb-1">
              <button
                className={`w-full flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 group ${
                  isActive(props.showPublicidad)
                    ? "bg-white shadow-md text-blue-700 font-medium"
                    : "text-blue-100 hover:bg-blue-700/50"
                }`}
                onClick={() => changePanel("setShowPublicidad")}
              >
                <span
                  className={`flex-shrink-0 ${
                    isActive(props.showPublicidad)
                      ? "text-blue-600"
                      : "text-blue-200 group-hover:text-white"
                  }`}
                >
                  <FontAwesomeIcon icon={faBullhorn} className="w-5 h-5" />
                </span>
                <span className="ml-3">{t("sidebar.advertisement")}</span>
                {isActive(props.showPublicidad) && (
                  <span className="ml-auto">
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="w-3 h-3"
                    />
                  </span>
                )}
              </button>
            </div>
          </li>
        )}

        {/* MAS INFORMACION */}
        {showInformacion && (
          <li className="mb-4">
            <div className="px-4 py-2">
              <h3 className="text-xs font-semibold tracking-wider text-blue-100 uppercase mb-2 flex items-center">
                <span className="mr-2 w-6 border-t border-blue-300"></span>
                {t("sidebar.moreInformation")}
                <span className="ml-2 w-6 border-t border-blue-300"></span>
              </h3>
            </div>

            {/* Mis Datos */}
            <div className="mb-1">
              <button
                className={`w-full flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 group ${
                  isActive(props.showlicencia)
                    ? "bg-white shadow-md text-blue-700 font-medium"
                    : "text-blue-100 hover:bg-blue-700/50"
                }`}
                onClick={() => changePanel("setShowlicencia")}
              >
                <span
                  className={`flex-shrink-0 ${
                    isActive(props.showlicencia)
                      ? "text-blue-600"
                      : "text-blue-200 group-hover:text-white"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={faBookOpenReader}
                    className="w-5 h-5"
                  />
                </span>
                <span className="ml-3">{t("sidebar.myData")}</span>
                {isActive(props.showlicencia) && (
                  <span className="ml-auto">
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="w-3 h-3"
                    />
                  </span>
                )}
              </button>
            </div>

            {/* Guia de Usuario */}
            <div className="mb-1">
              <button
                className={`w-full flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 group ${
                  isActive(props.showGuia)
                    ? "bg-white shadow-md text-blue-700 font-medium"
                    : "text-blue-100 hover:bg-blue-700/50"
                }`}
                onClick={() => changePanel("setShowGuia")}
              >
                <span
                  className={`flex-shrink-0 ${
                    isActive(props.showGuia)
                      ? "text-blue-600"
                      : "text-blue-200 group-hover:text-white"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={faCircleQuestion}
                    className="w-5 h-5"
                  />
                </span>
                <span className="ml-3">{t("sidebar.userGuides")}</span>
                {isActive(props.showGuia) && (
                  <span className="ml-auto">
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="w-3 h-3"
                    />
                  </span>
                )}
              </button>
            </div>

            {/* Contacto soporte */}
            <div className="mb-1">
              <button
                className={`w-full flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 group ${
                  isActive(props.showSoporte)
                    ? "bg-white shadow-md text-blue-700 font-medium"
                    : "text-blue-100 hover:bg-blue-700/50"
                }`}
                onClick={() => changePanel("setShowSoporte")}
              >
                <span
                  className={`flex-shrink-0 ${
                    isActive(props.showSoporte)
                      ? "text-blue-600"
                      : "text-blue-200 group-hover:text-white"
                  }`}
                >
                  <FontAwesomeIcon icon={faHeadset} className="w-5 h-5" />
                </span>
                <span className="ml-3">{t("sidebar.supportContact")}</span>
                {isActive(props.showSoporte) && (
                  <span className="ml-auto">
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="w-3 h-3"
                    />
                  </span>
                )}
              </button>
            </div>
          </li>
        )}
      </ul>

      {/* SALIR - Botón de cierre de sesión en la parte inferior */}
      <div className="px-2 mt-auto mb-6">
        <Link
          href="/"
          className="flex items-center px-4 py-2.5 text-sm rounded-lg text-blue-100 hover:bg-red-500/30 transition-all duration-200 group"
        >
          <span className="flex-shrink-0 text-red-300 group-hover:text-red-100">
            <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5" />
          </span>
          <span className="ml-3">{t("sidebar.logout")}</span>
        </Link>
      </div>
    </div>
  );
}

export default Sidebar;
