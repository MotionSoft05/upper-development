import { useEffect, useState } from "react";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useTranslation } from "react-i18next";
import db from "@/firebase/firestore";
import auth from "@/firebase/auth";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

// Registrar los elementos necesarios para Chart.js
Chart.register(ArcElement, Tooltip, Legend);

function UserAdmin() {
  const { t } = useTranslation();

  const [cantidadPd, setCantidadPd] = useState(0);
  const [cantidadPs, setCantidadPs] = useState(0);
  const [cantidadPservice, setCantidadPservice] = useState(0);
  const [cantidadPtarifario, setCantidadPtarifario] = useState(0); // Nueva variable para pantallas tarifario
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [userEvents, setUserEvents] = useState([]);
  const [cantidadPublicidadSalon, setCantidadPublicidadSalon] = useState(0);
  const [cantidadPublicidadDirectorio, setCantidadPublicidadDirectorio] =
    useState(0);
  const [cantidadPublicidadTarifario, setCantidadPublicidadTarifario] =
    useState(0); // Nueva variable para publicidad tarifario
  const [empresas, setEmpresas] = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");
  const [loading, setLoading] = useState(true);
  const [eventosHoy, setEventosHoy] = useState(0);
  const [eventosSemana, setEventosSemana] = useState(0);
  const [eventosFinalizados, setEventosFinalizados] = useState(0);
  const [empresaData, setEmpresaData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    fechaRegistro: "",
    fechaVencimiento: "",
    tipoPlan: "",
  });

  // Actualizado para incluir pantallas tarifario
  const total =
    parseInt(cantidadPd) +
    parseInt(cantidadPs) +
    parseInt(cantidadPservice) +
    parseInt(cantidadPtarifario);

  // Datos para el gráfico de suscripciones (actualizado con tarifario)
  const subscriptionChartData = {
    labels: [
      t("userAdmin.roomScreen"),
      t("userAdmin.directoryScreen"),
      t("userAdmin.servicescreen"),
      t("userAdmin.rateScreen"), // Nuevo label para pantalla tarifario
    ],
    datasets: [
      {
        data: [cantidadPs, cantidadPd, cantidadPservice, cantidadPtarifario],
        backgroundColor: [
          "rgba(54, 162, 235, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)", // Nuevo color para tarifario
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)", // Nuevo borde de color para tarifario
        ],
        borderWidth: 1,
      },
    ],
  };

  // Datos para el gráfico de eventos
  const eventsChartData = {
    labels: [
      t("userAdmin.todayEvents"),
      t("userAdmin.weekEvents"),
      t("userAdmin.finishedEvents"),
    ],
    datasets: [
      {
        data: [eventosHoy, eventosSemana, eventosFinalizados],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 159, 64, 0.6)",
          "rgba(201, 203, 207, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(201, 203, 207, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 15,
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        padding: 10,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 14,
        },
      },
    },
    cutout: "70%",
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoading(true);
        try {
          const userRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(userRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserInfo(userData);

            const cantidadPd = userData.pd || 0;
            const cantidadPs = userData.ps || 0;
            const cantidadPservice = userData.pservice || 0;
            // Obtenemos la cantidad de pantallas tarifario del campo "pt"
            const cantidadPtarifario = userData.pt || 0;

            setCantidadPd(cantidadPd);
            setCantidadPs(cantidadPs);
            setCantidadPservice(cantidadPservice);
            setCantidadPtarifario(cantidadPtarifario); // Establecer la cantidad de pantallas tarifario

            const nombreUsuario = userData.nombre || "";
            setNombreUsuario(nombreUsuario);

            // Datos de la empresa
            setEmpresaData({
              nombre: userData.empresa || "",
              email: userData.email || "",
              telefono: userData.telefono || "",
              direccion: userData.direccion || "",
              fechaRegistro: userData.inicio || "",
              fechaVencimiento: userData.final || "",
              tipoPlan: userData.tipoPlan || "",
            });

            // Publicidad de salón
            const publicidadSalonQuery = query(
              collection(db, "Publicidad"),
              where("empresa", "==", userData.empresa),
              where("tipo", "==", "salon")
            );
            const publicidadSalonSnapshot = await getDocs(publicidadSalonQuery);
            const cantidadSalon = publicidadSalonSnapshot.docs.length;
            setCantidadPublicidadSalon(cantidadSalon);

            // Publicidad de directorio
            const publicidadDirectorioQuery = query(
              collection(db, "Publicidad"),
              where("empresa", "==", userData.empresa),
              where("tipo", "==", "directorio")
            );
            const publicidadDirectorioSnapshot = await getDocs(
              publicidadDirectorioQuery
            );
            const cantidadDirectorio = publicidadDirectorioSnapshot.docs.length;
            setCantidadPublicidadDirectorio(cantidadDirectorio);

            // Publicidad de tarifario
            const publicidadTarifarioQuery = query(
              collection(db, "Publicidad"),
              where("empresa", "==", userData.empresa),
              where("tipo", "==", "tarifario")
            );
            const publicidadTarifarioSnapshot = await getDocs(
              publicidadTarifarioQuery
            );
            const cantidadTarifario = publicidadTarifarioSnapshot.docs.length;
            setCantidadPublicidadTarifario(cantidadTarifario);

            // Eventos
            const eventsQuery = query(
              collection(db, "eventos"),
              where("empresa", "==", userData.empresa)
            );
            const eventsSnapshot = await getDocs(eventsQuery);
            const userEventsData = eventsSnapshot.docs.map((doc) => doc.data());
            setUserEvents(userEventsData);

            const fechaActual = new Date();

            // Eventos hoy
            const hoy = userEventsData.filter((evento) => {
              const fechaInicial = new Date(evento.fechaInicio + "T00:00:00");
              const fechaFinal = new Date(evento.fechaFinal + "T23:59:59");
              return (
                evento.status &&
                fechaActual >= fechaInicial &&
                fechaActual <= fechaFinal
              );
            }).length;
            setEventosHoy(hoy);

            // Eventos semana
            const semana = userEventsData.filter((evento) => {
              const fechaInicial = new Date(evento.fechaInicio + "T00:00:00");
              const fechaFinal = new Date(evento.fechaFinal + "T23:59:59");
              const finSemana = new Date(fechaActual);
              finSemana.setDate(fechaActual.getDate() + 6);
              return (
                evento.status &&
                fechaActual <= fechaFinal &&
                finSemana >= fechaInicial
              );
            }).length;
            setEventosSemana(semana);

            // Eventos finalizados
            const finalizados = userEventsData.filter((evento) => {
              const fechaFinal = new Date(evento.fechaFinal + "T23:59:59");
              return !evento.status && fechaFinal < fechaActual;
            }).length;
            setEventosFinalizados(finalizados);
          }
        } catch (error) {
          console.error("Error al obtener datos del usuario:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setUserInfo(null);
        setUserEvents([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const obtenerEmpresas = async () => {
      try {
        const usuariosRef = collection(db, "usuarios");
        const usuariosSnapshot = await getDocs(usuariosRef);
        const empresasData = usuariosSnapshot.docs.map(
          (doc) => doc.data().empresa
        );
        const empresasFiltradas = [...new Set(empresasData)].filter(Boolean);
        setEmpresas(empresasFiltradas);
      } catch (error) {
        console.error("Error al obtener empresas:", error);
      }
    };

    obtenerEmpresas();
  }, []);

  useEffect(() => {
    const obtenerDatosEmpresa = async () => {
      if (empresaSeleccionada) {
        setLoading(true);
        try {
          // Obtener datos de la empresa seleccionada
          const usuariosRef = collection(db, "usuarios");
          const usuariosQuery = query(
            usuariosRef,
            where("empresa", "==", empresaSeleccionada)
          );
          const usuariosSnapshot = await getDocs(usuariosQuery);

          if (usuariosSnapshot.docs.length > 0) {
            const datosEmpresa = usuariosSnapshot.docs[0].data();

            setCantidadPd(datosEmpresa.pd || 0);
            setCantidadPs(datosEmpresa.ps || 0);
            setCantidadPservice(datosEmpresa.pservice || 0);
            setCantidadPtarifario(datosEmpresa.pt || 0); // Usando el campo "pt" para pantallas tarifario

            // Actualizar datos de empresa
            setEmpresaData({
              nombre: datosEmpresa.empresa || "",
              email: datosEmpresa.email || "",
              telefono: datosEmpresa.telefono || "",
              direccion: datosEmpresa.direccion || "",
              fechaRegistro: datosEmpresa.inicio || "",
              fechaVencimiento: datosEmpresa.final || "",
              tipoPlan: datosEmpresa.tipoPlan || "",
            });

            // Obtener cantidad de publicidades de salón
            const publicidadSalonQuery = query(
              collection(db, "Publicidad"),
              where("empresa", "==", empresaSeleccionada),
              where("tipo", "==", "salon")
            );
            const publicidadSalonSnapshot = await getDocs(publicidadSalonQuery);
            setCantidadPublicidadSalon(publicidadSalonSnapshot.docs.length);

            // Obtener cantidad de publicidades de directorio
            const publicidadDirectorioQuery = query(
              collection(db, "Publicidad"),
              where("empresa", "==", empresaSeleccionada),
              where("tipo", "==", "directorio")
            );
            const publicidadDirectorioSnapshot = await getDocs(
              publicidadDirectorioQuery
            );
            setCantidadPublicidadDirectorio(
              publicidadDirectorioSnapshot.docs.length
            );

            // Obtener cantidad de publicidades de tarifario
            const publicidadTarifarioQuery = query(
              collection(db, "Publicidad"),
              where("empresa", "==", empresaSeleccionada),
              where("tipo", "==", "tarifario")
            );
            const publicidadTarifarioSnapshot = await getDocs(
              publicidadTarifarioQuery
            );
            setCantidadPublicidadTarifario(
              publicidadTarifarioSnapshot.docs.length
            );

            // Obtener eventos
            const eventosRef = collection(db, "eventos");
            const eventosQuery = query(
              eventosRef,
              where("empresa", "==", empresaSeleccionada)
            );
            const eventosSnapshot = await getDocs(eventosQuery);
            const eventos = eventosSnapshot.docs.map((doc) => doc.data());
            setUserEvents(eventos);

            const fechaActual = new Date();

            // Eventos hoy
            const hoy = eventos.filter((evento) => {
              const fechaInicial = new Date(evento.fechaInicio + "T00:00:00");
              const fechaFinal = new Date(evento.fechaFinal + "T23:59:59");
              return (
                evento.status &&
                fechaActual >= fechaInicial &&
                fechaActual <= fechaFinal
              );
            }).length;
            setEventosHoy(hoy);

            // Eventos semana
            const semana = eventos.filter((evento) => {
              const fechaInicial = new Date(evento.fechaInicio + "T00:00:00");
              const fechaFinal = new Date(evento.fechaFinal + "T23:59:59");
              const finSemana = new Date(fechaActual);
              finSemana.setDate(fechaActual.getDate() + 6);
              return (
                evento.status &&
                fechaActual <= fechaFinal &&
                finSemana >= fechaInicial
              );
            }).length;
            setEventosSemana(semana);

            // Eventos finalizados
            const finalizados = eventos.filter((evento) => {
              const fechaFinal = new Date(evento.fechaFinal + "T23:59:59");
              return !evento.status && fechaFinal < fechaActual;
            }).length;
            setEventosFinalizados(finalizados);
          }
        } catch (error) {
          console.error("Error al obtener datos de empresa:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (empresaSeleccionada) {
      obtenerDatosEmpresa();
    }
  }, [empresaSeleccionada]);

  const handleChangeEmpresa = (e) => {
    setEmpresaSeleccionada(e.target.value);
  };

  // Card components
  const StatCard = ({ title, value, icon, bgColor }) => (
    <div
      className={`${bgColor} shadow-lg rounded-lg p-4 flex items-center justify-between transition-transform duration-300 hover:scale-105`}
    >
      <div>
        <h3 className="text-lg font-medium text-white">{title}</h3>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
      <div className="text-white text-opacity-80 text-4xl">{icon}</div>
    </div>
  );

  // Componente de campo de información para la sección de empresa
  const InfoField = ({ label, value, icon }) => (
    <div className="flex items-center p-3 border-b border-gray-100 last:border-b-0">
      <div className="text-gray-500 mr-3">{icon}</div>
      <div className="flex-grow">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium">{value || "-"}</p>
      </div>
    </div>
  );

  // Calcula el estado de la suscripción y el tiempo restante
  const calcularEstadoSuscripcion = () => {
    if (!empresaData.fechaVencimiento)
      return { estado: "inactive", diasRestantes: 0 };

    const fechaActual = new Date();
    const fechaVencimiento = new Date(empresaData.fechaVencimiento);
    const diferenciaTiempo = fechaVencimiento.getTime() - fechaActual.getTime();
    const diasRestantes = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));

    let estado = "active";
    if (diasRestantes < 0) {
      estado = "expired";
    } else if (diasRestantes <= 7) {
      estado = "warning";
    }

    return { estado, diasRestantes };
  };

  const { estado, diasRestantes } = calcularEstadoSuscripcion();

  return (
    <section className="px-6 md:px-8 lg:px-12 py-8">
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
              <span>{t("userAdmin.welcome")}</span>
              <span className="text-blue-600">{nombreUsuario}</span>
            </h1>
            <p className="text-gray-600 mt-2">
              {t("userAdmin.dashboardDescription")}
            </p>
          </div>

          {userInfo && userInfo.permisos === 10 && (
            <div className="mb-6 bg-white rounded-lg shadow-md p-4">
              <label
                htmlFor="empresa-select"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("userAdmin.selectCompany")}
              </label>
              <select
                id="empresa-select"
                className="block w-full bg-white border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                onChange={handleChangeEmpresa}
                value={empresaSeleccionada}
              >
                <option value="">
                  {t("userAdmin.selectCompanyPlaceholder")}
                </option>
                {empresas.map((empresa, index) => (
                  <option key={index} value={empresa}>
                    {empresa}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Estadísticas generales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title={t("userAdmin.totalSubscriptions")}
              value={total}
              icon={<i className="fas fa-tv">📺</i>}
              bgColor="bg-gradient-to-r from-blue-500 to-blue-600"
            />
            <StatCard
              title={t("userAdmin.todayEvents")}
              value={eventosHoy}
              icon={<i className="fas fa-calendar-day">📅</i>}
              bgColor="bg-gradient-to-r from-emerald-500 to-emerald-600"
            />
            <StatCard
              title={t("userAdmin.weekEvents")}
              value={eventosSemana}
              icon={<i className="fas fa-calendar-week">🗓️</i>}
              bgColor="bg-gradient-to-r from-amber-500 to-amber-600"
            />
            <StatCard
              title={t("userAdmin.totalAds")}
              value={
                cantidadPublicidadSalon +
                cantidadPublicidadDirectorio +
                cantidadPublicidadTarifario
              }
              icon={<i className="fas fa-ad">🎯</i>}
              bgColor="bg-gradient-to-r from-purple-500 to-purple-600"
            />
          </div>

          {/* Datos de la empresa */}
          <div className="mb-8 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 py-4 px-6">
              <h2 className="text-xl font-bold text-white flex items-center">
                <span className="mr-2">🏢</span>
                {t("userAdmin.companyInfo")}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
              {/* Información general */}
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">
                  {t("userAdmin.generalInfo")}
                </h3>
                <div className="space-y-1">
                  <InfoField
                    label={t("userAdmin.companyName")}
                    value={empresaData.nombre}
                    icon="🏢"
                  />
                  <InfoField
                    label={t("userAdmin.email")}
                    value={empresaData.email}
                    icon="📧"
                  />
                  <InfoField
                    label={t("userAdmin.phone")}
                    value={empresaData.telefono}
                    icon="📱"
                  />
                  <InfoField
                    label={t("userAdmin.address")}
                    value={empresaData.direccion}
                    icon="📍"
                  />
                </div>
              </div>

              {/* Información de suscripción */}
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">
                  {t("userAdmin.subscriptionInfo")}
                </h3>
                <div className="space-y-1">
                  <InfoField
                    label={t("userAdmin.plan")}
                    value={empresaData.tipoPlan}
                    icon="⭐"
                  />
                  <InfoField
                    label={t("userAdmin.startDate")}
                    value={empresaData.fechaRegistro}
                    icon="📆"
                  />
                  <InfoField
                    label={t("userAdmin.expirationDate")}
                    value={empresaData.fechaVencimiento}
                    icon="⏱️"
                  />
                </div>
              </div>

              {/* Estado de la suscripción */}
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">
                  {t("userAdmin.subscriptionStatus")}
                </h3>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-700">
                    {t("userAdmin.status")}:
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      estado === "active"
                        ? "bg-green-100 text-green-800"
                        : estado === "warning"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {estado === "active"
                      ? t("userAdmin.active")
                      : estado === "warning"
                      ? t("userAdmin.aboutToExpire")
                      : t("userAdmin.expired")}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">
                    {t("userAdmin.timeRemaining")}:
                  </p>
                  <div className="flex items-center">
                    <div className="flex-grow bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          estado === "active"
                            ? "bg-green-500"
                            : estado === "warning"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(100, (diasRestantes / 30) * 100)
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <span className="ml-3 text-sm font-semibold">
                      {diasRestantes > 0
                        ? `${diasRestantes} ${t("userAdmin.days")}`
                        : t("userAdmin.expired")}
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mt-6">
                  <p className="text-sm text-blue-800">
                    {estado === "active"
                      ? t("userAdmin.activeMessage")
                      : estado === "warning"
                      ? t("userAdmin.warningMessage")
                      : t("userAdmin.expiredMessage")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Panel de Suscripciones */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b">
                {t("userAdmin.subscriptionPlan")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64">
                  {total > 0 ? (
                    <Doughnut
                      data={subscriptionChartData}
                      options={chartOptions}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">
                        {t("userAdmin.noSubscriptions")}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="font-medium">
                      {t("userAdmin.roomScreen")}:
                    </span>
                    <span className="text-lg text-blue-600 font-bold">
                      {cantidadPs}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="font-medium">
                      {t("userAdmin.directoryScreen")}:
                    </span>
                    <span className="text-lg text-blue-600 font-bold">
                      {cantidadPd}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="font-medium">
                      {t("userAdmin.servicescreen")}:
                    </span>
                    <span className="text-lg text-blue-600 font-bold">
                      {cantidadPservice}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="font-medium">
                      {t("userAdmin.rateScreen")}:
                    </span>
                    <span className="text-lg text-blue-600 font-bold">
                      {cantidadPtarifario}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="font-medium">
                      {t("userAdmin.roomAdvertisement")}:
                    </span>
                    <span className="text-gray-700 font-bold">
                      {cantidadPublicidadSalon}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="font-medium">
                      {t("userAdmin.directoryAdvertisement")}:
                    </span>
                    <span className="text-gray-700 font-bold">
                      {cantidadPublicidadDirectorio}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel de Eventos */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b">
                {t("userAdmin.eventInfo")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64">
                  {eventosHoy > 0 ||
                  eventosSemana > 0 ||
                  eventosFinalizados > 0 ? (
                    <Doughnut data={eventsChartData} options={chartOptions} />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">{t("userAdmin.noEvents")}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-pink-50 rounded-lg border border-pink-100">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {t("userAdmin.todayEvents")}:
                      </span>
                      <span className="text-lg text-pink-600 font-bold">
                        {eventosHoy}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {t("userAdmin.weekEvents")}:
                      </span>
                      <span className="text-lg text-orange-600 font-bold">
                        {eventosSemana}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {t("userAdmin.finishedEvents")}:
                      </span>
                      <span className="text-lg text-gray-600 font-bold">
                        {eventosFinalizados}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {t("userAdmin.totalEvents")}:
                      </span>
                      <span className="text-lg text-blue-600 font-bold">
                        {userEvents.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default UserAdmin;
