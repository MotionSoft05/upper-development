// src/components/dashboard/MonitorScreen.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import db from "@/firebase/firestore";
import { useTranslation } from "react-i18next";

const MonitorScreen = ({ userEmail }) => {
  const { t } = useTranslation();
  const [heartbeats, setHeartbeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // 'all', 'online', 'offline'
  const [companyFilter, setCompanyFilter] = useState("");
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshInterval, setRefreshInterval] = useState(30); // Segundos
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [sortConfig, setSortConfig] = useState({
    key: "lastActivity",
    direction: "desc",
  });
  const [unsubscribeRef, setUnsubscribeRef] = useState(null);

  // Determinamos si es administrador
  const isAdmin =
    userEmail === "uppermex10@gmail.com" ||
    userEmail === "ulises.jacobo@hotmail.com" ||
    userEmail === "contacto@upperds.mx";

  // Función para determinar si una pantalla está online (reduciendo el tiempo a 30 segundos)
  const isScreenOnline = (lastActivity) => {
    if (!lastActivity) return false;
    const thirtySecondsAgo = new Date();
    thirtySecondsAgo.setSeconds(thirtySecondsAgo.getSeconds() - 30); // 30 segundos en lugar de 2 minutos
    return lastActivity.toDate() > thirtySecondsAgo;
  };

  // Función para procesar los heartbeats (extraída para reutilizar)
  const processHeartbeats = useCallback((snapshot) => {
    const heartbeatData = [];
    const uniqueCompanies = new Set();

    // Obtener el tiempo actual en formato Timestamp de Firestore para comparaciones consistentes
    const now = new Date();
    const thirtySecondsAgo = new Date(now.getTime() - 30000); // 30 segundos atrás

    snapshot.forEach((doc) => {
      const data = doc.data();

      // Guardar empresas para el filtro
      if (data.companyName) {
        uniqueCompanies.add(data.companyName);
      }

      // Añadir estado online/offline basado en timestamp
      const lastActivityTime = data.lastActivity
        ? data.lastActivity.toDate()
        : null;
      const isOnline = lastActivityTime && lastActivityTime > thirtySecondsAgo;

      heartbeatData.push({
        id: doc.id,
        ...data,
        online: isOnline,
        lastActivity: lastActivityTime,
        firstSeen: data.firstSeen ? data.firstSeen.toDate() : null,
        lastDisconnect: data.lastDisconnect
          ? data.lastDisconnect.toDate()
          : null,
      });
    });

    setHeartbeats(heartbeatData);
    setCompanies([...uniqueCompanies].sort());
    setLoading(false);
    setLastRefresh(new Date());
  }, []);

  // Función para manejar errores
  const handleError = useCallback((err) => {
    console.error("Error al obtener heartbeats:", err);
    setError(`Error al cargar datos: ${err.message}`);
    setLoading(false);
  }, []);

  // Función para configurar la suscripción a los datos - optimizada para reducir lecturas
  const setupSubscription = useCallback(async () => {
    // Limpiar suscripción anterior si existe
    if (unsubscribeRef) {
      unsubscribeRef();
    }

    setLoading(true);
    let newUnsubscribe = () => {};

    try {
      // Referencia a la colección de heartbeats
      const heartbeatsRef = collection(db, "heartbeats");

      // Escuchar actualizaciones en tiempo real, pero con límites para reducir lecturas
      if (isAdmin) {
        // Si es admin, obtener todos los heartbeats pero con un límite alto
        // Esto reduce el impacto en Firebase si hay muchos dispositivos
        const adminQuery = query(heartbeatsRef);

        newUnsubscribe = onSnapshot(
          adminQuery,
          (snapshot) => {
            processHeartbeats(snapshot);
          },
          (err) => {
            handleError(err);
          }
        );
      } else {
        // Si no es admin, obtener solo los heartbeats del usuario
        // Primero obtenemos la empresa sin una suscripción (una sola lectura)
        const userCompanyQuery = query(
          collection(db, "usuarios"),
          where("email", "==", userEmail)
        );

        const userSnapshots = await getDocs(userCompanyQuery);
        let userCompany = "";

        if (!userSnapshots.empty) {
          userCompany = userSnapshots.docs[0].data().empresa || "";
        }

        if (userCompany) {
          // Si encontramos la empresa del usuario, filtrar por ella
          const companyHeartbeatsQuery = query(
            heartbeatsRef,
            where("companyName", "==", userCompany)
          );

          newUnsubscribe = onSnapshot(
            companyHeartbeatsQuery,
            (snapshot) => {
              processHeartbeats(snapshot);
            },
            (err) => {
              handleError(err);
            }
          );
        } else {
          // Si no encontramos la empresa, mostrar un mensaje de error
          setError("No se pudo determinar la empresa del usuario");
          setLoading(false);
        }
      }

      // Guardar la función de cancelación
      setUnsubscribeRef(() => newUnsubscribe);
    } catch (err) {
      console.error("Error al configurar la consulta:", err);
      setError(`Error en la configuración: ${err.message}`);
      setLoading(false);
    }
  }, [isAdmin, userEmail, processHeartbeats, handleError, unsubscribeRef]);

  // Configurar suscripción solo al montar el componente y cuando cambie userEmail o isAdmin
  useEffect(() => {
    // Solo establecemos la suscripción una vez al inicio
    setupSubscription();

    // Limpiar suscripción al desmontar
    return () => {
      if (unsubscribeRef) {
        unsubscribeRef();
      }
    };
  }, [userEmail, isAdmin]); // Dependencias mínimas

  // Función para forzar una actualización manual
  const handleManualRefresh = () => {
    setupSubscription();
  };

  // Actualización periódica SOLO del estado online de las pantallas (sin consultar Firebase)
  useEffect(() => {
    const updateOnlineStatus = () => {
      // Solo actualizamos el cálculo del estado online sin hacer nuevas consultas
      setHeartbeats((currentHeartbeats) =>
        currentHeartbeats.map((heartbeat) => ({
          ...heartbeat,
          online: heartbeat.lastActivity
            ? new Date() - heartbeat.lastActivity < 30000 // 30 segundos en ms
            : false,
        }))
      );
      setLastRefresh(new Date());
    };

    const interval = setInterval(updateOnlineStatus, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Aplicar filtros y búsqueda a los heartbeats
  const filteredHeartbeats = React.useMemo(() => {
    return heartbeats
      .filter((heartbeat) => {
        // Filtrar por estado
        if (filter === "online" && !heartbeat.online) return false;
        if (filter === "offline" && heartbeat.online) return false;

        // Filtrar por empresa
        if (companyFilter && heartbeat.companyName !== companyFilter)
          return false;

        // Filtrar por término de búsqueda
        if (searchTerm && searchTerm.trim() !== "") {
          const search = searchTerm.toLowerCase().trim();
          // Búsqueda en múltiples campos y manejo de valores nulos
          return (
            (heartbeat.deviceName &&
              heartbeat.deviceName.toLowerCase().includes(search)) ||
            (heartbeat.screenId &&
              heartbeat.screenId.toLowerCase().includes(search)) ||
            (heartbeat.companyName &&
              heartbeat.companyName.toLowerCase().includes(search)) ||
            (heartbeat.screenType &&
              heartbeat.screenType.toLowerCase().includes(search)) ||
            (heartbeat.screenNumber &&
              heartbeat.screenNumber.toString().includes(search))
          );
        }

        return true;
      })
      .sort((a, b) => {
        // Ordenar por el campo seleccionado
        const { key, direction } = sortConfig;
        if (!a[key] && !b[key]) return 0;
        if (!a[key]) return 1;
        if (!b[key]) return -1;

        let comparison = 0;
        if (
          key === "lastActivity" ||
          key === "firstSeen" ||
          key === "lastDisconnect"
        ) {
          // Ordenar fechas
          comparison = new Date(a[key]) - new Date(b[key]);
        } else {
          // Ordenar strings u otros
          comparison = String(a[key]).localeCompare(String(b[key]));
        }

        return direction === "asc" ? comparison : -comparison;
      });
  }, [heartbeats, filter, companyFilter, searchTerm, sortConfig]);

  // Función para cambiar el ordenamiento
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Función para formatear fecha
  const formatDate = (date) => {
    if (!date) return "N/A";
    return date.toLocaleString();
  };

  // Indicador de dirección de ordenamiento
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? " ↑" : " ↓";
  };

  // Función para calcular tiempo desde el último latido
  const getTimeSinceLastActivity = (lastActivity) => {
    if (!lastActivity) return "Nunca";

    const diffMs = new Date() - lastActivity;
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 60) return `${diffSec} segundo${diffSec !== 1 ? "s" : ""}`;

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} minuto${diffMin !== 1 ? "s" : ""}`;

    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} hora${diffHours !== 1 ? "s" : ""}`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} día${diffDays !== 1 ? "s" : ""}`;
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t("monitorScreen.title") || "Monitor de Pantallas"}
            </h1>
            <p className="mt-2 text-gray-600">
              {t("monitorScreen.description") ||
                "Visualiza el estado de todas las pantallas activas"}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Los datos se actualizan automáticamente. El estado en línea/fuera
              de línea se actualiza cada {refreshInterval} segundos.
            </p>
          </div>
          <button
            onClick={handleManualRefresh}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            title="Esto reiniciará la suscripción a Firestore. Usar solo cuando sea necesario."
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Actualizar ahora
          </button>
        </div>

        {/* Panel de control */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Filtro de estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("monitorScreen.statusFilter") || "Estado"}
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="all">{t("monitorScreen.all") || "Todos"}</option>
                <option value="online">
                  {t("monitorScreen.online") || "En línea"}
                </option>
                <option value="offline">
                  {t("monitorScreen.offline") || "Desconectadas"}
                </option>
              </select>
            </div>

            {/* Filtro de empresa */}
            {isAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("monitorScreen.companyFilter") || "Empresa"}
                </label>
                <select
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">
                    {t("monitorScreen.allCompanies") || "Todas las empresas"}
                  </option>
                  {companies.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("monitorScreen.search") || "Buscar"}
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  t("monitorScreen.searchPlaceholder") || "Buscar por nombre..."
                }
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Intervalo de actualización */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("monitorScreen.refreshInterval") ||
                  "Intervalo de actualización"}
              </label>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value={10}>10 segundos</option>
                <option value={30}>30 segundos</option>
                <option value={60}>1 minuto</option>
                <option value={300}>5 minutos</option>
              </select>
            </div>
          </div>

          {/* Información de resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-lg font-medium text-blue-800">
                {t("monitorScreen.totalScreens") || "Total de Pantallas"}
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                {heartbeats.length}
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h3 className="text-lg font-medium text-green-800">
                {t("monitorScreen.onlineScreens") || "Pantallas En Línea"}
              </h3>
              <p className="text-2xl font-bold text-green-600">
                {heartbeats.filter((h) => h.online).length}
              </p>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <h3 className="text-lg font-medium text-red-800">
                {t("monitorScreen.offlineScreens") || "Pantallas Desconectadas"}
              </h3>
              <p className="text-2xl font-bold text-red-600">
                {heartbeats.filter((h) => !h.online).length}
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <h3 className="text-lg font-medium text-purple-800">
                {t("monitorScreen.lastUpdate") || "Última Actualización"}
              </h3>
              <p className="text-sm font-medium text-purple-600">
                {lastRefresh.toLocaleTimeString()}
              </p>
              <div className="text-xs mt-1 text-purple-400">
                Actualización automática cada {refreshInterval} segundos
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de pantallas */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-500">Cargando datos...</span>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : filteredHeartbeats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {heartbeats.length > 0
                ? t("monitorScreen.noScreensFound") ||
                  "No se encontraron pantallas que coincidan con los filtros seleccionados."
                : t("monitorScreen.noScreensData") ||
                  "No hay datos de pantallas. Asegúrate de que las pantallas estén activas y enviando datos de heartbeat."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="p-4 text-center text-gray-500 bg-blue-50 border-b border-blue-100">
                {t("monitorScreen.refreshNotice") ||
                  "Nota: Si una pantalla se desconecta, aparecerá como 'Desconectada' después de 30 segundos de inactividad."}
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort("deviceName")}
                    >
                      {t("monitorScreen.deviceName") || "Nombre"}
                      {getSortIndicator("deviceName")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort("screenType")}
                    >
                      {t("monitorScreen.type") || "Tipo"}
                      {getSortIndicator("screenType")}
                    </th>
                    {isAdmin && (
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("companyName")}
                      >
                        {t("monitorScreen.company") || "Empresa"}
                        {getSortIndicator("companyName")}
                      </th>
                    )}
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort("lastActivity")}
                    >
                      {t("monitorScreen.lastActivity") || "Última Actividad"}
                      {getSortIndicator("lastActivity")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort("beatCount")}
                    >
                      {t("monitorScreen.beatCount") || "Latidos"}
                      {getSortIndicator("beatCount")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t("monitorScreen.status") || "Estado"}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort("firstSeen")}
                    >
                      {t("monitorScreen.firstSeen") || "Primera Conexión"}
                      {getSortIndicator("firstSeen")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t("monitorScreen.details") || "Detalles"}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredHeartbeats.map((heartbeat) => (
                    <tr
                      key={heartbeat.id}
                      className={`${
                        heartbeat.online ? "" : "bg-red-50"
                      } hover:bg-gray-50 transition-colors duration-150`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {heartbeat.deviceName || heartbeat.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {heartbeat.screenType === "salon" ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            Salón
                          </span>
                        ) : heartbeat.screenType === "directorio" ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                            Directorio
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            {heartbeat.screenType || "Desconocido"}
                          </span>
                        )}
                        {heartbeat.screenNumber && (
                          <span className="ml-2">{heartbeat.screenNumber}</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {heartbeat.companyName || "-"}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          {heartbeat.lastActivity
                            ? formatDate(heartbeat.lastActivity)
                            : "Nunca"}
                        </div>
                        <div className="text-xs text-gray-400">
                          Hace{" "}
                          {getTimeSinceLastActivity(heartbeat.lastActivity)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {heartbeat.beatCount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {heartbeat.online ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            En línea
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            Desconectada
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {heartbeat.firstSeen
                          ? formatDate(heartbeat.firstSeen)
                          : "Desconocido"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-150"
                          onClick={() => {
                            // Mostrar detalles en un modal con mejor formato
                            const details = {
                              ID: heartbeat.id,
                              Nombre: heartbeat.deviceName || "No disponible",
                              Tipo: heartbeat.screenType || "No disponible",
                              Número: heartbeat.screenNumber || "No disponible",
                              Empresa: heartbeat.companyName || "No disponible",
                              Resolución:
                                heartbeat.screenResolution || "No disponible",
                              Navegador:
                                heartbeat.userAgent?.substring(0, 100) ||
                                "No disponible",
                              IP: heartbeat.ip || "No disponible",
                              Sistema: heartbeat.os || "No disponible",
                              Versión: heartbeat.version || "No disponible",
                              "Última desconexión": heartbeat.lastDisconnect
                                ? formatDate(heartbeat.lastDisconnect)
                                : "No disponible",
                            };

                            // Formatear los detalles
                            const formattedDetails = Object.entries(details)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join("\n");

                            alert(
                              `Detalles de la pantalla:\n\n${formattedDetails}`
                            );
                          }}
                        >
                          Ver detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sección de paginación (opcional) */}
        {filteredHeartbeats.length > 0 && (
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Mostrando{" "}
              <span className="font-medium">{filteredHeartbeats.length}</span>{" "}
              resultados de{" "}
              <span className="font-medium">{heartbeats.length}</span> pantallas
              totales
            </div>
            <div className="text-sm text-gray-500">
              Última actualización: {lastRefresh.toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitorScreen;
