import { useTranslation } from "react-i18next";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  // Iconos para administración
  faUserShield,
  faBuilding,

  // Iconos para personalización de pantallas
  faTachometerAlt,
  faCalendarPlus,
  faCalendarDay,
  faReceipt,

  // Iconos para ajustes de pantallas
  faTelevision,
  faListUl,
  faTags,
  faDesktopAlt,
  faAd,
  faImages,

  // Iconos para más información
  faIdCard,
  faBook,
  faHeadset,

  // Otros iconos
  faSignOutAlt,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

function Sidebar(props) {
  // Agregar nuevas props para dispositivos Android TV
  const {
    setShowDevicesList,
    showDevicesList,
    setShowDeviceLinker,
    showDeviceLinker,
    // ...resto de props
    setShowAdmin,
    setShowUserAdmin,
    setShowAltaEvento,
    // ...otros setters existentes
  } = props;

  // Menú para Android TV
  const deviceMenuItems = [
    {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      label: "Mis Pantallas TV",
      isActive: showDevicesList,
      onClick: () => {
        setShowAdmin(false);
        setShowUserAdmin(false);
        setShowAltaEvento(false);
        // ... cerrar otros
        setShowDevicesList(true);
        setShowDeviceLinker(false);
      },
    },
    {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      ),
      label: "Agregar Pantalla TV",
      isActive: showDeviceLinker,
      onClick: () => {
        setShowAdmin(false);
        setShowUserAdmin(false);
        setShowAltaEvento(false);
        // ... cerrar otros
        setShowDeviceLinker(true);
        setShowDevicesList(false);
      },
    },
  ];
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
    props.setShowPantallaPromociones(false);
    props.setShowPublicidad(false);
    props.setShowlicencia(false);
    props.setShowGuia(false);
    props.setShowSoporte(false);
    props.setShowPantallaServicio(false);
    props.setShowMonitorScreen(false);
    props.setShowPantallaTarifario(false);
    props.setShowInformacionTarifa(false);
    props.toggleSidebar();
    props[setVisible](true); // hook que se llamara en la funcion para cambiar el estado
  };

  //? -- Permisos --
  const userData = props.userData || {};
  const permisosSecciones = userData.permisosSecciones || {};

  // Verificar permiso del SuperAdmin (valor 10)
  const isSuperAdmin = userData.permisos === 10;

  // Función para verificar permisos por sección
  const tienePermiso = (seccion) => {
    return isSuperAdmin || permisosSecciones[seccion] === true;
  };

  const isActive = (show) => show === true;

  return (
    <div className="sidebar-content rounded-r-lg">
      <ul className="flex flex-col w-full px-2">
        {/* ADMINISTRADOR permiso solo para SUPERADMIN */}
        {isSuperAdmin && (
          <li className="mb-4">
            <div className="px-4 py-2">
              <h3 className="text-xs font-semibold tracking-wider text-blue-100 uppercase mb-2 flex items-center">
                <span className="mr-2 w-6 border-t border-blue-300"></span>
                {t("sidebar.admin")}
                <span className="ml-2 w-6 border-t border-blue-300"></span>
              </h3>
            </div>

            {/* Admin - Cambio a faUserShield que representa mejor la administración */}
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
                  <FontAwesomeIcon icon={faUserShield} className="w-5 h-5" />
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

            {/* Edicion de Empresas - Se mantiene faBuilding que es apropiado */}
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
        <li className="mb-4">
          <div className="px-4 py-2">
            <h3 className="text-xs font-semibold tracking-wider text-blue-100 uppercase mb-2 flex items-center">
              <span className="mr-2 w-6 border-t border-blue-300"></span>
              {t("sidebar.title")}
              <span className="ml-2 w-6 border-t border-blue-300"></span>
            </h3>
          </div>

          {/* Tablero - Cambio a faTachometerAlt que representa mejor un dashboard */}
          {tienePermiso("tablero") && (
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
                  <FontAwesomeIcon icon={faTachometerAlt} className="w-5 h-5" />
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
          )}

          {/* Alta de eventos - Se mantiene faCalendarPlus que es apropiado */}
          {tienePermiso("altaEventos") && (
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
          )}

          {/* Consulta de eventos - Cambio a faCalendarDay que representa mejor la consulta de eventos */}
          {tienePermiso("consultaEventos") && (
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
                  <FontAwesomeIcon icon={faCalendarDay} className="w-5 h-5" />
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
          )}

          {/* Información de Tarifas - Cambio a faReceipt que representa mejor las tarifas */}
          {tienePermiso("informacionTarifas") && (
            <div className="mb-1">
              <button
                className={`w-full flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 group ${
                  isActive(props.showInformacionTarifa)
                    ? "bg-white shadow-md text-blue-700 font-medium"
                    : "text-blue-100 hover:bg-blue-700/50"
                }`}
                onClick={() => changePanel("setShowInformacionTarifa")}
              >
                <span
                  className={`flex-shrink-0 ${
                    isActive(props.showInformacionTarifa)
                      ? "text-blue-600"
                      : "text-blue-200 group-hover:text-white"
                  }`}
                >
                  <FontAwesomeIcon icon={faReceipt} className="w-5 h-5" />
                </span>
                <span className="ml-3">{t("sidebar.rate")}</span>
                {isActive(props.showInformacionTarifa) && (
                  <span className="ml-auto">
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="w-3 h-3"
                    />
                  </span>
                )}
              </button>
            </div>
          )}
        </li>
        {/* Nueva sección para Android TV */}
        <li className="mb-4">
          <div className="px-4 py-2">
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Android TV
            </h3>
          </div>
          <div className="mt-1 space-y-1">
            {deviceMenuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className={`w-full text-left px-2 py-2 text-sm rounded-md flex items-center ${
                  item.isActive
                    ? "bg-blue-700 text-white"
                    : "text-gray-300 hover:bg-blue-700 hover:text-white"
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </button>
            ))}
          </div>
        </li>
        {/* AJUSTES PANTALLAS */}
        <li className="mb-4">
          <div className="px-4 py-2">
            <h3 className="text-xs font-semibold tracking-wider text-blue-100 uppercase mb-2 flex items-center">
              <span className="mr-2 w-6 border-t border-blue-300"></span>
              {t("sidebar.screenSettings")}
              <span className="ml-2 w-6 border-t border-blue-300"></span>
            </h3>
          </div>

          {/* Pantallas salon - Cambio a faTV que representa mejor una pantalla de salón */}
          {tienePermiso("pantallasSalon") && (
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
                  <FontAwesomeIcon icon={faTelevision} className="w-5 h-5" />
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
          )}

          {/* Pantallas Directorio - Cambio a faListUl que representa mejor un directorio */}
          {tienePermiso("pantallasDirectorio") && (
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
                  <FontAwesomeIcon icon={faListUl} className="w-5 h-5" />
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
          )}
          {/* Pantallas Promociones */}
          {tienePermiso("pantallasPromociones") && (
            <div className="mb-1">
              <button
                className={`w-full flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 group ${
                  isActive(props.showPantallaPromociones)
                    ? "bg-white shadow-md text-blue-700 font-medium"
                    : "text-blue-100 hover:bg-blue-700/50"
                }`}
                onClick={() => changePanel("setShowPantallaPromociones")}
              >
                <span
                  className={`flex-shrink-0 ${
                    isActive(props.showPantallaPromociones)
                      ? "text-blue-600"
                      : "text-blue-200 group-hover:text-white"
                  }`}
                >
                  <FontAwesomeIcon icon={faImages} className="w-5 h-5" />
                </span>
                <span className="ml-3">{t("sidebar.promotion")}</span>
                {isActive(props.showPantallaPromociones) && (
                  <span className="ml-auto">
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="w-3 h-3"
                    />
                  </span>
                )}
              </button>
            </div>
          )}
          {/* Pantallas Tarifario - Cambio a faTags que representa mejor un tarifario */}
          {tienePermiso("pantallasTarifario") && (
            <div className="mb-1">
              <button
                className={`w-full flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 group ${
                  isActive(props.showPantallaTarifario)
                    ? "bg-white shadow-md text-blue-700 font-medium"
                    : "text-blue-100 hover:bg-blue-700/50"
                }`}
                onClick={() => changePanel("setShowPantallaTarifario")}
              >
                <span
                  className={`flex-shrink-0 ${
                    isActive(props.showPantallaTarifario)
                      ? "text-blue-600"
                      : "text-blue-200 group-hover:text-white"
                  }`}
                >
                  <FontAwesomeIcon icon={faTags} className="w-5 h-5" />
                </span>
                <span className="ml-3">{t("sidebar.rateScreen")}</span>
                {isActive(props.showPantallaTarifario) && (
                  <span className="ml-auto">
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="w-3 h-3"
                    />
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Monitor de Pantallas - Cambio a faDesktopAlt que representa mejor un monitor */}
          {tienePermiso("monitoreo") && (
            <div className="mb-1">
              <button
                onClick={() => changePanel("setShowMonitorScreen")}
                className={`w-full flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 group ${
                  isActive(props.showMonitorScreen)
                    ? "bg-white shadow-md text-blue-700 font-medium"
                    : "text-blue-100 hover:bg-blue-700/50"
                }`}
              >
                <span
                  className={`flex-shrink-0 ${
                    isActive(props.showMonitorScreen)
                      ? "text-blue-600"
                      : "text-blue-200 group-hover:text-white"
                  }`}
                >
                  <FontAwesomeIcon icon={faDesktopAlt} className="w-5 h-5" />
                </span>
                <span className="ml-3">
                  {t("sidebar.monitorScreen") || "Monitoreo de Pantallas"}
                </span>
                {isActive(props.showMonitorScreen) && (
                  <span className="ml-auto">
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="w-3 h-3"
                    />
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Publicidad - Cambio a faAd que representa mejor la publicidad */}
          {tienePermiso("publicidad") && (
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
                  <FontAwesomeIcon icon={faAd} className="w-5 h-5" />
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
          )}
        </li>

        {/* MAS INFORMACION */}
        <li className="mb-4">
          <div className="px-4 py-2">
            <h3 className="text-xs font-semibold tracking-wider text-blue-100 uppercase mb-2 flex items-center">
              <span className="mr-2 w-6 border-t border-blue-300"></span>
              {t("sidebar.moreInformation")}
              <span className="ml-2 w-6 border-t border-blue-300"></span>
            </h3>
          </div>

          {/* Mis Datos - Cambio a faIdCard que representa mejor los datos personales */}
          {tienePermiso("datosUsuario") && (
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
                  <FontAwesomeIcon icon={faIdCard} className="w-5 h-5" />
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
          )}

          {/* Guia de Usuario - Cambio a faBook que representa mejor una guía */}
          {tienePermiso("guiaUsuario") && (
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
                  <FontAwesomeIcon icon={faBook} className="w-5 h-5" />
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
          )}

          {/* Contacto soporte - Se mantiene faHeadset que es apropiado */}
          {tienePermiso("contactoSoporte") && (
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
          )}
        </li>
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
