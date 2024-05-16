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
} from "@fortawesome/free-solid-svg-icons";

function Sidebar(props) {
  //? Las props que llegan del componente Dashboard son hooks con sus valores y seteos junto con el usuario

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
    props.toggleSidebar();
    props[setVisible](true); // hook que se llamara en la funcion para cambiar el estado
  };

  const efectSelect = (prop) => {
    if (prop) {
      return "flex flex-row items-center h-10 px-3 rounded-e-xl transition duration-300 bg-gray-100 text-gray-700 shadow-xl hover:text-gray-700";
    } else {
      return "flex flex-row items-center h-10 px-3 rounded-e-xl transition duration-300 text-gray-300 hover:bg-stone-200 hover:text-gray-700";
    }
  };

  const efectLogo = (prop) => {
    if (prop) {
      return "flex items-center justify-center transition duration-300 text-gray-700 text-lg p-1";
    } else {
      return "flex items-center justify-center transition duration-300 text-gray-400 text-lg p-1";
    }
  };
  console.log("funcion", props.showAltaEvento);
  //*-------------------------------------------------
  return (
    <div className="sidebar-content ">
      <ul className="flex flex-col w-full">
        <div className="my-px">
          <span className="flex font-medium italic text-sm text-gray-300 px-4 my-4 uppercase border-b-2 border-blue-400">
            {/* PERSONALICE SUS PANTALLAS */}
            {t("sidebar.title")}
          </span>
        </div>
        {/* ADMINISTRADOR */}
        {(props.userEmail === "uppermex10@gmail.com" ||
          props.userEmail === "ulises.jacobo@hotmail.com" ||
          props.userEmail === "contacto@upperds.mx") && (
          <li className="my-px">
            <button
              className={efectSelect(props.showAdmin)}
              onClick={() => changePanel("setShowAdmin")}
            >
              {/* <span className={`flex items-center justify-center transition duration-300 ${props.showAdmin ? 'text-gray-700' : 'text-gray-400'} text-lg p-1`}> */}
              <span className={efectLogo(props.showAdmin)}>
                <FontAwesomeIcon icon={faUserTie} className={`h-5`} />
              </span>
              {/* Admin */}
              <span className="ml-3"> {t("sidebar.admin")}</span>
            </button>
          </li>
        )}
        {/* TABLERO */}
        <li className="my-px ">
          <button
            // className="flex flex-row items-center h-10 px-3 rounded-lg text-gray-300 hover:bg-gray-100 hover:text-gray-700"
            className={efectSelect(props.showUserAdmin)}
            onClick={() => changePanel("setShowUserAdmin")}
          >
            <span className={efectLogo(props.showUserAdmin)}>
              {/* <img src="/img/dashboard-svgrepo-com.svg" className="p-1 h-8" /> */}
              <FontAwesomeIcon icon={faTableColumns} className="h-5" />
            </span>
            {/* Tablero DashBoard */}
            <span className="ml-3"> {t("sidebar.dashboard")}</span>
          </button>
        </li>
        {/* EDICION DE EMPRESAS */}
        <li className="my-px">
          {[
            "uppermex10@gmail.com",
            "ulises.jacobo@hotmail.com",
            "contacto@upperds.mx",
          ].includes(props.userEmail) && (
            <button
              className={efectSelect(props.showEdiciondeempresa)}
              onClick={() => changePanel("setShowEdiciondeempresa")}
            >
              <span className={efectLogo(props.showEdiciondeempresa)}>
                <FontAwesomeIcon icon={faBuilding} className="h-5" />
              </span>
              {/* Edicion de empresas */}
              <span className="ml-3"> {t("sidebar.eventEditing")}</span>
            </button>
          )}
        </li>
        {/* ALTA DE EVENTOS */}
        <li className="my-px">
          <button
            // className="flex flex-row items-center h-10 px-3 rounded-lg text-gray-300 hover:bg-gray-100 hover:text-gray-700"
            className={efectSelect(props.showAltaEvento)}
            onClick={() => changePanel("setShowAltaEvento")}
          >
            <span className={efectLogo(props.showAltaEvento)}>
              <FontAwesomeIcon icon={faCalendarPlus} className="h-5" />
            </span>
            {/* Alta de eventos */}
            <span className="ml-3">{t("sidebar.eventRegistration")}</span>
          </button>
        </li>
        {/* CONSULTA DE EVENTOS */}
        <li className="my-px">
          <button
            className={efectSelect(props.showConsultaEvento)}
            onClick={() => changePanel("setShowConsultaEvento")}
          >
            <span className={efectLogo(props.showConsultaEvento)}>
              <FontAwesomeIcon icon={faClipboardQuestion} className="h-5" />
            </span>
            {/* Consulta de eventos */}
            <span className="ml-3">{t("sidebar.eventQuery")}</span>
          </button>
        </li>
        {/* AJUSTES PANTALLAS */}
        <li className="my-px">
          <span className="flex font-medium italic text-sm text-gray-300 px-4 my-4 uppercase border-b-2 border-blue-400">
            {t("sidebar.screenSettings")}
          </span>
        </li>
        {/* PANTALLAS SALON */}
        <li className="my-px">
          <button
            className={efectSelect(props.showPantallaSalon)}
            onClick={() => changePanel("setShowPantallaSalon")}
          >
            <span className={efectLogo(props.showPantallaSalon)}>
              <FontAwesomeIcon icon={faSolarPanel} className="h-5"/>
            </span>
            {/* Pantallas salon */}
            <span className="ml-3">{t("sidebar.roomScreens")}</span>
          </button>
        </li>
        {/* PANTALLAS DIRECTORIO */}
        <li className="my-px">
          <button
            className={efectSelect(props.showPantallaDirectorio)}
            onClick={() => changePanel("setShowPantallaDirectorio")}
          >
            <span className={efectLogo(props.showPantallaDirectorio)}>
              <FontAwesomeIcon icon={faDisplay} className="h-5"/>
            </span>
            {/* Pantallas directorio */}
            <span className="ml-3">{t("sidebar.directoryScreens")}</span>
          </button>
        </li>
        {/* PANTALLAS PUBLICIDAD */}
        <li className="my-px">
          <button
            className={efectSelect(props.showPublicidad)}
            onClick={() => changePanel("setShowPublicidad")}
          >
            <span className={efectLogo(props.showPublicidad)}>
            <FontAwesomeIcon icon={faBullhorn} className="h-5"/>
            </span>
            {/* Publicidad */}
            <span className="ml-3">{t("sidebar.advertisement")}</span>
          </button>
        </li>
        {/* MAS INFORMACION */}
        <li className="my-px">
          <span className="flex font-medium italic text-sm text-gray-300 px-4 my-4 uppercase border-b-2 border-blue-400">
            {t("sidebar.moreInformation")}
          </span>
        </li>
        {/* MIS DATOS */}
        <li className="my-px">
          <button
            className={efectSelect(props.showlicencia)}
            onClick={() => changePanel("setShowlicencia")}
          >
            <span className={efectLogo(props.showlicencia)}>
            <FontAwesomeIcon icon={faBookOpenReader} className="h-5"/>
            </span>
            {/* Mis datos */}
            <span className="ml-3">{t("sidebar.myData")}</span>
          </button>
        </li>
        {/* GUIA DE USUARIO */}
        <li className="my-px">
          <button
            className={efectSelect(props.showGuia)}
            onClick={() => changePanel("setShowGuia")}
          >
            <span className={efectLogo(props.showGuia)}>
            <FontAwesomeIcon icon={faCircleQuestion} className="h-5"/>
            </span>
            {/* Guías de Usuario */}
            <span className="ml-3">{t("sidebar.userGuides")}</span>
          </button>
        </li>
        {/* CONTACTO SOPORTE */}
        <li className="my-px">
          <button
            className={efectSelect(props.showSoporte)}
            onClick={() => changePanel("setShowSoporte")}
          >
            <span className={efectLogo(props.showSoporte)}>
            <FontAwesomeIcon icon={faHeadset} className="h-5"/>
            </span>
            {/* Contacto Soporte */}
            <span className="ml-3">{t("sidebar.supportContact")}</span>
          </button>
        </li>
        {/* SALIR */}
        <li className="my-px">
          <Link
            href="/"
            className="flex flex-row items-center h-10 px-3 rounded-e text-gray-300 hover:bg-gray-100 hover:text-gray-700"
          >
            <span className="flex items-center justify-center text-lg text-red-400">
              <svg
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            </span>
            {/* Salir */}
            <span className="ml-3">{t("sidebar.logout")}</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
