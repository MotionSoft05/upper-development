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
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import db from "@/firebase/firestore";
import { useTranslation } from "react-i18next";
import emailjs from "emailjs-com";
const MonitorScreen = ({ userEmail }) => {
  const { t } = useTranslation();
  const [heartbeats, setHeartbeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // 'all', 'online', 'offline'
  const [companyFilter, setCompanyFilter] = useState("");
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshInterval, setRefreshInterval] = useState(120); // Cambiado de 30 a 60 segundos
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [sortConfig, setSortConfig] = useState({
    key: "lastActivity",
    direction: "desc",
  });
  const [unsubscribeRef, setUnsubscribeRef] = useState(null);
  const [notificationMinutes, setNotificationMinutes] = useState(30); // 30 minutos por defecto

  // Estado para notificaciones por correo
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationEmails, setNotificationEmails] = useState(["", "", ""]);
  const [showNotificationConfig, setShowNotificationConfig] = useState(false);
  const [notificationHours, setNotificationHours] = useState(5);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  // Determinamos si es administrador
  const isAdmin =
    userEmail === "uppermex10@gmail.com" ||
    userEmail === "ulises.jacobo@hotmail.com" ||
    userEmail === "contacto@upperds.mx";

  // Cargar configuración de notificaciones al inicio
  useEffect(() => {
    const loadNotificationSettings = async () => {
      try {
        // Determinar la empresa del usuario
        let company = "";

        if (isAdmin && companyFilter) {
          company = companyFilter;
        } else if (!isAdmin) {
          const userCompanyQuery = query(
            collection(db, "usuarios"),
            where("email", "==", userEmail)
          );
          const userSnapshots = await getDocs(userCompanyQuery);
          if (!userSnapshots.empty) {
            company = userSnapshots.docs[0].data().empresa || "";
          }
        }

        if (!company && !isAdmin) return;

        // Si es admin sin filtro de empresa, no cargamos configuración específica
        const settingsRef = doc(
          db,
          "notificacionesConfig",
          isAdmin ? companyFilter || userEmail : company
        );
        const settingsSnap = await getDoc(settingsRef);

        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          setNotificationsEnabled(data.enabled || false);
          setNotificationEmails(data.emails || ["", "", ""]);
          setNotificationMinutes(data.minutes || 30); // Usar minutes en lugar de hours
        }
      } catch (err) {
        console.error("Error al cargar configuración de notificaciones:", err);
      }
    };

    loadNotificationSettings();
  }, [isAdmin, userEmail, companyFilter]);

  // Guardar configuración de notificaciones
  const saveNotificationSettings = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Determinar la empresa del usuario
      let company = "";

      if (isAdmin && companyFilter) {
        company = companyFilter;
      } else if (!isAdmin) {
        const userCompanyQuery = query(
          collection(db, "usuarios"),
          where("email", "==", userEmail)
        );
        const userSnapshots = await getDocs(userCompanyQuery);
        if (!userSnapshots.empty) {
          company = userSnapshots.docs[0].data().empresa || "";
        }
      }

      if (!company && !isAdmin) {
        setSaveMessage({
          type: "error",
          text: "No se pudo determinar la empresa",
        });
        setIsSaving(false);
        return;
      }

      // Validar correos
      const validEmails = notificationEmails.filter(
        (email) =>
          email &&
          email.trim() !== "" &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      );

      if (notificationsEnabled && validEmails.length === 0) {
        setSaveMessage({
          type: "error",
          text: "Debes ingresar al menos un correo electrónico válido",
        });
        setIsSaving(false);
        return;
      }

      // Guardamos en Firestore
      const settingsRef = doc(
        db,
        "notificacionesConfig",
        isAdmin ? companyFilter || userEmail : company
      );

      await setDoc(settingsRef, {
        enabled: notificationsEnabled,
        emails: notificationEmails,
        minutes: notificationMinutes, // Cambiar hours por minutes
        updatedAt: serverTimestamp(),
        updatedBy: userEmail,
        company: isAdmin ? companyFilter : company,
      });

      setSaveMessage({
        type: "success",
        text: "Configuración guardada correctamente",
      });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error("Error al guardar configuración de notificaciones:", err);
      setSaveMessage({ type: "error", text: `Error: ${err.message}` });
    }

    setIsSaving(false);
  };
  const sendTestNotification = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Validar correos
      const validEmails = notificationEmails.filter(
        (email) =>
          email &&
          email.trim() !== "" &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      );

      if (validEmails.length === 0) {
        setSaveMessage({
          type: "error",
          text: "Debes ingresar al menos un correo electrónico válido",
        });
        setIsSaving(false);
        return;
      }

      // Determinar la empresa del usuario
      let company = "";

      if (isAdmin && companyFilter) {
        company = companyFilter;
      } else if (!isAdmin) {
        const userCompanyQuery = query(
          collection(db, "usuarios"),
          where("email", "==", userEmail)
        );
        const userSnapshots = await getDocs(userCompanyQuery);
        if (!userSnapshots.empty) {
          company = userSnapshots.docs[0].data().empresa || "";
        }
      }

      if (!company && !isAdmin) {
        setSaveMessage({
          type: "error",
          text: "No se pudo determinar la empresa",
        });
        setIsSaving(false);
        return;
      }

      // Configurar los parámetros del correo de prueba
      const emailParams = {
        to_email: validEmails.join(","),
        company_name: company || "Sistema de Monitoreo",
        subject: "PRUEBA: Sistema de Notificaciones de Pantallas",
        message:
          "Este es un correo de prueba para verificar que las notificaciones estén funcionando correctamente.",
        notification_time: new Date().toLocaleString(),
      };

      // Configurar EmailJS
      const serviceID = "service_y3wemni"; // Usa el ID de tu servicio EmailJS
      const templateID = "template_e59a0mr"; // Tu template ID
      const userID = "IVTJPKKd0ooe1am6U"; // Tu User ID

      // Enviar el correo de prueba
      const response = await emailjs.send(
        serviceID,
        templateID,
        emailParams,
        userID
      );
      console.log("Email de prueba enviado:", response.status, response.text);

      setSaveMessage({
        type: "success",
        text: "Correo de prueba enviado correctamente",
      });

      // Registrar la prueba exitosa
      const testLogRef = doc(collection(db, "notificacionesPruebas"));
      await setDoc(testLogRef, {
        timestamp: serverTimestamp(),
        emails: validEmails,
        company: company || "Sin empresa",
        success: true,
      });

      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error("Error al enviar correo de prueba:", err);
      setSaveMessage({ type: "error", text: `Error: ${err.message}` });

      // Registrar el error
      try {
        const errorLogRef = doc(collection(db, "notificacionesErrores"));
        await setDoc(errorLogRef, {
          error: err.message,
          timestamp: serverTimestamp(),
          type: "test_email",
          userEmail: userEmail,
        });
      } catch (logError) {
        console.error("Error al registrar fallo de prueba:", logError);
      }
    }

    setIsSaving(false);
  };

  // Función para manejar cambios en los correos
  const handleEmailChange = (index, value) => {
    const newEmails = [...notificationEmails];
    newEmails[index] = value;
    setNotificationEmails(newEmails);
  };

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
    const thirtySecondsAgo = new Date(now.getTime() - 120000); // 30 segundos atrás

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

  // Comprobar pantallas offline durante mucho tiempo
  useEffect(() => {
    if (!notificationsEnabled || heartbeats.length === 0) return;

    // Buscar pantallas offline por más de X minutos
    const offlineScreens = heartbeats.filter((heartbeat) => {
      if (heartbeat.online) return false;
      if (!heartbeat.lastActivity) return false;

      const offlineTime = new Date() - heartbeat.lastActivity;
      const offlineMinutes = offlineTime / (1000 * 60);

      return offlineMinutes >= notificationMinutes;
    });

    if (offlineScreens.length > 0) {
      // Verificar si hay al menos un correo configurado
      const validEmails = notificationEmails.filter(
        (email) => email && email.trim() !== ""
      );
      if (validEmails.length === 0) return;

      // Función para enviar notificación por correo
      const sendOfflineNotification = async () => {
        try {
          // Determinar la empresa
          let company = "";
          if (isAdmin && companyFilter) {
            company = companyFilter;
          } else if (!isAdmin) {
            const userCompanyQuery = query(
              collection(db, "usuarios"),
              where("email", "==", userEmail)
            );
            const userSnapshots = await getDocs(userCompanyQuery);
            if (!userSnapshots.empty) {
              company = userSnapshots.docs[0].data().empresa || "";
            }
          }

          if (!company && !isAdmin) return;

          // Verificar si ya se envió una notificación recientemente
          const lastNotificationRef = doc(
            db,
            "ultimasNotificaciones",
            isAdmin ? companyFilter || userEmail : company
          );
          const lastNotificationSnap = await getDoc(lastNotificationRef);

          if (lastNotificationSnap.exists()) {
            const lastSent = lastNotificationSnap.data().sentAt.toDate();
            const hoursSinceLastNotification =
              (new Date() - lastSent) / (1000 * 60 * 60);

            // Evitar enviar notificaciones muy frecuentes (cada 15 minutos)
            if (hoursSinceLastNotification < 0.25) {
              return;
            }
          }

          // Preparar datos para el correo
          const formattedScreens = offlineScreens.map((screen) => ({
            name: screen.deviceName || "Sin nombre",
            type: screen.screenType || "Desconocido",
            number: screen.screenNumber || "N/A",
            lastActive: screen.lastActivity
              ? screen.lastActivity.toLocaleString()
              : "Desconocido",
            offlineTime: `${notificationMinutes} minutos`,
          }));

          // Crear texto de lista de pantallas para el cuerpo del correo
          const screensList = formattedScreens
            .map(
              (screen) =>
                `- ${screen.name} (${screen.type} ${screen.number}): Desconectada por ${screen.offlineTime}`
            )
            .join("\n");

          // Configurar los parámetros del correo
          const emailParams = {
            to_email: validEmails.join(","),
            company_name: company || "Sistema de Monitoreo",
            subject: `ALERTA: ${offlineScreens.length} pantallas desconectadas`,
            screens_count: offlineScreens.length,
            screens_list: screensList,
            notification_time: new Date().toLocaleString(),
            minutes_threshold: notificationMinutes,
          };

          // Configurar EmailJS
          const serviceID = "service_y3wemni"; // Usa el ID de tu servicio EmailJS
          const templateID = "template_e59a0mr"; // Deberás crear una plantilla específica para esto
          const userID = "IVTJPKKd0ooe1am6U"; // Tu User ID de EmailJS

          // Enviar el correo
          const response = await emailjs.send(
            serviceID,
            templateID,
            emailParams,
            userID
          );
          console.log(
            "Email enviado correctamente:",
            response.status,
            response.text
          );

          // Actualizar registro de última notificación
          await setDoc(lastNotificationRef, {
            sentAt: serverTimestamp(),
            offlineCount: offlineScreens.length,
            emailsSent: validEmails.length,
            success: true,
          });

          // Almacenar en localStorage para tener redundancia
          try {
            const notificationRecord = {
              timestamp: new Date().toISOString(),
              offlineCount: offlineScreens.length,
              company: company,
              success: true,
            };

            // Obtener historial existente o inicializar
            const notificationHistory = JSON.parse(
              localStorage.getItem("offlineNotifications") || "[]"
            );
            notificationHistory.push(notificationRecord);

            // Mantener solo las últimas 20 notificaciones
            if (notificationHistory.length > 20) {
              notificationHistory.shift();
            }

            localStorage.setItem(
              "offlineNotifications",
              JSON.stringify(notificationHistory)
            );
          } catch (storageError) {
            console.warn("No se pudo guardar en localStorage:", storageError);
          }
        } catch (error) {
          console.error("Error al enviar notificación por correo:", error);

          // Registrar el error en Firestore para seguimiento
          try {
            const errorLogRef = doc(collection(db, "notificacionesErrores"));
            await setDoc(errorLogRef, {
              error: error.message,
              timestamp: serverTimestamp(),
              offlineScreens: offlineScreens.length,
              userEmail: userEmail,
              company: isAdmin ? companyFilter : company,
            });
          } catch (logError) {
            console.error("Error al registrar fallo:", logError);
          }
        }
      };

      // Ejecutar la función de notificación
      sendOfflineNotification();
    }
  }, [
    heartbeats,
    notificationsEnabled,
    notificationEmails,
    notificationMinutes,
    isAdmin,
    userEmail,
    companyFilter,
  ]);

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
            ? new Date() - heartbeat.lastActivity < 120000 // 30 segundos en ms
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
          <div className="flex space-x-2">
            <button
              onClick={() => setShowNotificationConfig(!showNotificationConfig)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              title="Configurar notificaciones por correo"
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Notificaciones
            </button>
          </div>
        </div>

        {/* Configuración de notificaciones por correo */}
        {showNotificationConfig && (
          <div className="bg-white rounded-lg shadow p-4 mb-6 animate-fadeIn">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Configuración de Notificaciones por Correo
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center mb-4">
                  <input
                    id="enableNotifications"
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={() =>
                      setNotificationsEnabled(!notificationsEnabled)
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="enableNotifications"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Habilitar notificaciones por correo electrónico
                  </label>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Enviar alerta cuando una pantalla esté desconectada por:
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <select
                      value={notificationMinutes}
                      onChange={(e) =>
                        setNotificationMinutes(parseInt(e.target.value))
                      }
                      disabled={!notificationsEnabled}
                      className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300 disabled:bg-gray-100 disabled:text-gray-500"
                    >
                      <option value={10}>10 minutos</option>
                      <option value={15}>15 minutos</option>
                      <option value={30}>30 minutos</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Direcciones de correo electrónico para notificaciones:
                </label>

                {notificationEmails.map((email, index) => (
                  <div key={index} className="mb-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      placeholder={`Correo electrónico ${index + 1}`}
                      disabled={!notificationsEnabled}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                ))}

                <p className="text-xs text-gray-500 mt-1">
                  Ingresa hasta 3 direcciones de correo electrónico que
                  recibirán las notificaciones.
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              {saveMessage && (
                <div
                  className={`mr-4 px-4 py-2 rounded text-sm ${
                    saveMessage.type === "success"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {saveMessage.text}
                </div>
              )}

              <button
                onClick={() => setShowNotificationConfig(false)}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                onClick={sendTestNotification}
                disabled={isSaving || !notificationsEnabled}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
              >
                Enviar correo de prueba
              </button>

              <button
                onClick={saveNotificationSettings}
                disabled={isSaving}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                {isSaving ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  "Guardar configuración"
                )}
              </button>
            </div>
          </div>
        )}

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
              <div className="block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 text-gray-700 sm:text-sm">
                2 minuto
              </div>
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
              {notificationsEnabled && (
                <div className="text-xs mt-1 text-purple-600 font-medium">
                  <span className="inline-flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    Notificaciones activas ({notificationMinutes}m)
                  </span>
                </div>
              )}
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
                  {filteredHeartbeats.map((heartbeat) => {
                    // Calcular el tiempo de desconexión para resaltar pantallas con desconexión prolongada
                    const offlineTime =
                      !heartbeat.online && heartbeat.lastActivity
                        ? (new Date() - heartbeat.lastActivity) / (1000 * 60) // En minutos
                        : 0;

                    // Determinar clase CSS basada en estado y tiempo offline
                    const rowClass = !heartbeat.online
                      ? offlineTime >= notificationMinutes
                        ? "bg-red-100" // Desconectada por mucho tiempo
                        : "bg-red-50" // Desconectada normal
                      : ""; // En línea

                    return (
                      <tr
                        key={heartbeat.id}
                        className={`${rowClass} hover:bg-gray-50 transition-colors duration-150`}
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
                          ) : heartbeat.screenType === "tarifario" ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              Tarifario
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                              {heartbeat.screenType || "Desconocido"}
                            </span>
                          )}
                          {heartbeat.screenNumber && (
                            <span className="ml-2">
                              {heartbeat.screenNumber}
                            </span>
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
                          <div
                            className={`text-xs ${
                              !heartbeat.online &&
                              offlineTime >= notificationMinutes
                                ? "text-red-600 font-medium"
                                : "text-gray-400"
                            }`}
                          >
                            Hace{" "}
                            {getTimeSinceLastActivity(heartbeat.lastActivity)}
                            {!heartbeat.online &&
                              offlineTime >= notificationMinutes && (
                                <span className="ml-1">⚠️</span>
                              )}
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
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                offlineTime >= notificationMinutes
                                  ? "bg-red-200 text-red-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
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
                                Número:
                                  heartbeat.screenNumber || "No disponible",
                                Empresa:
                                  heartbeat.companyName || "No disponible",
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
                    );
                  })}
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

        {/* Nota sobre notificaciones */}
        {notificationsEnabled && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg shadow-sm border border-blue-100">
            <h4 className="text-sm font-medium text-blue-800 flex items-center">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Información sobre notificaciones
            </h4>
            <p className="mt-1 text-sm text-blue-700">
              Las notificaciones están habilitadas. Se enviará un correo a{" "}
              {notificationEmails.filter((e) => e).length} destinatario(s)
              cuando una pantalla esté desconectada por {notificationMinutes}{" "}
              minutos o más.
            </p>
            <p className="mt-1 text-xs text-blue-600">
              Para evitar sobrecarga, las notificaciones se envían con un
              intervalo mínimo de 15 minutos entre cada aviso.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitorScreen;
