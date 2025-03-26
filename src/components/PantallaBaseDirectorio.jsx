"use client";
import {
  collection,
  getDocs,
  where,
  query,
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import auth from "@/firebase/auth";
import db from "@/firebase/firestore";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { usePathname, useRouter } from "next/navigation";
import LogIn from "@/app/login/page";
import AdvertisementSlider from "@/components/sliderPublicidadPD";
import debounce from "lodash/debounce";
import TemplateManager from "./templates/PDTemplateManager";
import { formatDate, getCurrentTime } from "@/utils/dateUtils";
import useHeartbeat from "@/hook/useHeartbeat";
import { v4 as uuidv4 } from "uuid"; // Si aún no está importado

import { fetchWeatherData } from "@/utils/weatherUtils";

import QRCode from "qrcode.react";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const COUNTDOWN_DURATION = 60;
const DEFAULT_HOUR = "00:00";

// Calculate milliseconds until next minute starts
const calculateTimeUntilNextMinute = () => {
  const now = new Date();
  const seconds = now.getSeconds();
  const milliseconds = now.getMilliseconds();
  return (60 - seconds) * 1000 - milliseconds;
};

// Function to convert time string to minutes
const convertTimeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

// Get current time in minutes
const getCurrentTimeInMinutes = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

const retryOperation = async (operation, retries = MAX_RETRIES) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_DELAY * Math.pow(2, i))
      );
    }
  }
};

export default function BaseDirectorioClient({ id, empresa }) {
  const screenNumber = parseInt(id, 10);
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPortrait, setIsPortrait] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const isMounted = useRef(true);
  const allEventsRef = useRef([]);
  const [screenId, setScreenId] = useState("");
  const [screenData, setScreenData] = useState({
    events: [],
    ads: [],
    templates: null,
    weatherData: null,
    currentTime: getCurrentTime(),
  });
  console.log(
    "🚀 ~ PantallaBaseDirectorio.jsx:86 ~ BaseDirectorioClient ~ screenData:",
    screenData
  );

  // Memoized values
  const currentEvent = useMemo(() => screenData.events[0], [screenData.events]);
  const templates = useMemo(() => screenData.templates, [screenData.templates]);
  const weatherData = useMemo(
    () => screenData.weatherData,
    [screenData.weatherData]
  );

  // Callbacks
  const debouncedSetCurrentTime = useCallback(
    debounce(
      () =>
        setScreenData((prev) => ({ ...prev, currentTime: getCurrentTime() })),
      1000
    ),
    []
  );

  // Respaldo de detección de orientación
  const checkOrientation = useCallback(() => {
    const defaultOrientation = window.innerHeight > window.innerWidth;
    setIsPortrait(defaultOrientation);
  }, []);

  // Obtiene la configuración de orientación para esta pantalla específica
  const getScreenOrientation = useCallback(
    (templateData) => {
      // Verificar si hay configuración por pantalla
      if (templateData && typeof templateData === "object") {
        console.log(
          "Buscando configuración de orientación para pantalla:",
          screenNumber
        );

        // Opción 1: Buscar en screenSettings si existe
        if (
          templateData.screenSettings &&
          templateData.screenSettings[screenNumber] &&
          typeof templateData.screenSettings[screenNumber].setPortrait !==
            "undefined"
        ) {
          const orientation =
            !!templateData.screenSettings[screenNumber].setPortrait;
          console.log(
            `Encontrada orientación específica para pantalla ${screenNumber}:`,
            orientation
          );
          return orientation;
        }

        // Opción 2: Buscar en pantallasSettings si existe (formato alternativo)
        if (
          templateData.pantallasSettings &&
          templateData.pantallasSettings[screenNumber] &&
          typeof templateData.pantallasSettings[screenNumber].setPortrait !==
            "undefined"
        ) {
          const orientation =
            !!templateData.pantallasSettings[screenNumber].setPortrait;
          console.log(
            `Encontrada orientación específica para pantalla ${screenNumber}:`,
            orientation
          );
          return orientation;
        }

        // Opción 3: Buscar en pantallaDirectorioSettings si existe (otro formato posible)
        if (
          templateData.pantallaDirectorioSettings &&
          templateData.pantallaDirectorioSettings[screenNumber] &&
          typeof templateData.pantallaDirectorioSettings[screenNumber]
            .setPortrait !== "undefined"
        ) {
          const orientation =
            !!templateData.pantallaDirectorioSettings[screenNumber].setPortrait;
          console.log(
            `Encontrada orientación específica para pantalla ${screenNumber}:`,
            orientation
          );
          return orientation;
        }

        // Opción 4: Usar la configuración global como respaldo
        if (typeof templateData.setPortrait !== "undefined") {
          console.log(
            "Usando configuración de orientación global:",
            templateData.setPortrait
          );
          return !!templateData.setPortrait;
        }
      }

      // Si no hay configuración, usar detección automática
      const defaultOrientation = window.innerHeight > window.innerWidth;
      console.log(
        "No se encontró configuración de orientación, usando detección automática:",
        defaultOrientation
      );
      return defaultOrientation;
    },
    [screenNumber]
  );

  // Función para verificar eventos basado en el tiempo actual (filtrado en memoria)
  const checkCurrentEvents = useCallback(() => {
    if (!allEventsRef.current || allEventsRef.current.length === 0) {
      console.log("⚠️ No hay eventos disponibles para filtrar");
      return;
    }

    const now = new Date();
    const nowMinutes = getCurrentTimeInMinutes();
    const userScreenNames = screenData.usuario?.nombrePantallas;
    const userCompany = screenData.usuario?.empresa;

    if (!userScreenNames || !userCompany) {
      console.log("⚠️ Faltan datos de usuario necesarios para filtrar eventos");
      return;
    }

    console.log("⌛ Revisando eventos activos en memoria...", {
      currentTime: new Date().toLocaleTimeString(),
      nowMinutes,
      totalEvents: allEventsRef.current.length,
    });

    const filteredEvents = allEventsRef.current.filter((event) => {
      console.log("\nRevisando evento:", event.nombreEvento);

      // Usar una comparación de strings de fecha en lugar de objetos Date
      const today = new Date();
      const formattedToday = today.toISOString().split("T")[0]; // Obtiene YYYY-MM-DD

      // Comparar strings directamente - mucho más seguro
      const isWithinDateRange =
        formattedToday >= event.fechaInicio &&
        formattedToday <= event.fechaFinal;

      // Time validation
      let startMinutes, endMinutes;
      if (
        (event.horaInicialSalon === DEFAULT_HOUR &&
          event.horaFinalSalon === DEFAULT_HOUR) ||
        (!event.horaInicialSalon && !event.horaFinalSalon)
      ) {
        // Evento de todo el día - abarca el día completo (0:00 a 23:59)
        startMinutes = 0;
        endMinutes = 24 * 60 - 1; // 23:59
        console.log(`Evento de todo el día detectado: ${event.nombreEvento}`);
      } else {
        // Evento con horas específicas
        startMinutes = convertTimeToMinutes(event.horaInicialSalon || "00:00");
        endMinutes = convertTimeToMinutes(event.horaFinalSalon || "23:59");
      }

      // We only check if the event has NOT ended yet
      const hasNotEnded = nowMinutes < endMinutes;
      // Device validation
      const hasValidDevice = event.devices?.some(
        (device) => userScreenNames[screenNumber - 1] === device
      );

      // Company validation
      const isValidCompany = event.empresa === userCompany;

      const result =
        isWithinDateRange &&
        hasNotEnded && // Cambio de isWithinTimeRange a hasNotEnded
        hasValidDevice &&
        isValidCompany;

      console.log(`Evento: ${event.nombreEvento}`, {
        fechaOk: isWithinDateRange,
        noTerminado: hasNotEnded, // Cambio en el nombre del log
        deviceOk: hasValidDevice,
        companyOk: isValidCompany,
        mostrar: result,
        startMin: startMinutes,
        endMin: endMinutes,
        nowMin: nowMinutes,
      });

      return result;
    });

    console.log("Eventos filtrados:", filteredEvents.length);

    setScreenData((prev) => ({
      ...prev,
      events: filteredEvents,
    }));
  }, [screenData.usuario, screenNumber]);

  const loadAds = useCallback(
    async (userCompany) => {
      try {
        const adsRef = collection(db, "Publicidad");
        const adsQuery = query(
          adsRef,
          where("empresa", "==", userCompany),
          where("tipo", "==", "directorio")
        );

        const adsSnapshot = await getDocs(adsQuery);
        return adsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error(t("errors.adsLoading"), error);
        return [];
      }
    },
    [t]
  );

  // Effects
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) setInitialLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const baseUrl = window.location.origin;
      setQrCodeUrl(`${baseUrl}/paginasAleatorias?qr=${user.uid}`);
    }
  }, [user]);

  // Efecto para detección de orientación como respaldo
  useEffect(() => {
    checkOrientation();
  }, [checkOrientation]);

  useEffect(() => {
    if (screenData.events.length === 0 && screenData.ads.length === 0 && user) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 0) window.location.reload();
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [screenData, user]);

  // Actualizar orientación cuando cambian los templates
  useEffect(() => {
    if (templates) {
      const orientation = getScreenOrientation(templates);
      setIsPortrait(orientation);
    }
  }, [templates, getScreenOrientation]);

  // Configurar actualizaciones al inicio de cada minuto
  useEffect(() => {
    // Ejecutamos verificación inicial si tenemos datos
    if (allEventsRef.current.length > 0) {
      checkCurrentEvents();
    }

    const scheduleNextMinute = () => {
      const timeUntilNextMinute = calculateTimeUntilNextMinute();
      console.log(
        `⏱️ Próxima actualización en ${Math.round(
          timeUntilNextMinute / 1000
        )} segundos`
      );

      const timerId = setTimeout(() => {
        if (!isMounted.current) return;

        const newTime = getCurrentTime();
        console.log(`⏰ Actualización al inicio de minuto - Hora: ${newTime}`);

        // Actualizar la hora y verificar eventos
        setScreenData((prev) => ({
          ...prev,
          currentTime: newTime,
        }));

        checkCurrentEvents();

        // Programar la siguiente actualización
        scheduleNextMinute();
      }, timeUntilNextMinute);

      return timerId;
    };

    const timerId = scheduleNextMinute();

    return () => {
      clearTimeout(timerId);
    };
  }, [checkCurrentEvents]);

  useEffect(() => {
    if (!user || !db) return;
    isMounted.current = true;
    let unsubscribers = [];

    const setupSubscriptions = async () => {
      setInitialLoading(true);
      setError(null);

      try {
        const userDoc = await retryOperation(() =>
          getDoc(doc(db, "usuarios", user.uid))
        );

        if (!userDoc.exists()) {
          console.error("Usuario no existe");
          setError("Usuario no existe");
          setInitialLoading(false);
          return;
        }

        if (!isMounted.current) return;

        const userData = userDoc.data();
        console.log("\n=== DATOS DEL USUARIO ===");
        console.log("Usuario:", {
          empresa: userData.empresa,
          nombrePantallasDirectorio: userData.nombrePantallasDirectorio,
          pantallas: userData.pantallas,
        });

        const userCompany = userData.empresa;
        const screenNames = userData.nombrePantallasDirectorio || {};

        // Obtener el nombre de la pantalla actual basado en el número de pantalla
        const currentScreenName =
          screenNames[screenNumber - 1] || `Pantalla ${screenNumber}`;

        // Añadir esta información al estado
        setScreenData((prev) => ({
          ...prev,
          deviceName: currentScreenName,
          usuario: {
            ...userData,
            nombrePantallas: screenNames,
          },
        }));

        // Events subscription - Almacenamos todos los eventos que coinciden con la empresa
        const eventsRef = query(
          collection(db, "eventos"),
          where("empresa", "==", userCompany)
        );

        const eventsUnsubscribe = onSnapshot(eventsRef, (snapshot) => {
          if (!isMounted.current) return;

          const events = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          console.log("\n=== EVENTOS RECIBIDOS DE FIRESTORE ===");
          console.log("Total eventos:", events.length);

          // Almacenamos todos los eventos en la ref para filtrado en memoria
          allEventsRef.current = events;

          // Filtramos inmediatamente para el momento actual
          // Este es el cambio principal que asegura que tengamos eventos filtrados al inicio
          const now = new Date();
          const nowMinutes = getCurrentTimeInMinutes();
          const screenNames = userData.nombrePantallasDirectorio || {};

          const filteredEvents = events.filter((event) => {
            // Date validation
            // Usar una comparación de strings de fecha en lugar de objetos Date
            const today = new Date();
            console.log(
              "🚀 ~ PantallaBaseDirectorio.jsx:466 ~ filteredEvents ~ today:",
              today
            );
            const formattedToday = today.toISOString().split("T")[0]; // Obtiene YYYY-MM-DD

            // Comparar strings directamente - mucho más seguro
            const isWithinDateRange =
              formattedToday >= event.fechaInicio &&
              formattedToday <= event.fechaFinal;
            // Time validation
            let startMinutes, endMinutes;
            if (
              (event.horaInicialSalon === DEFAULT_HOUR &&
                event.horaFinalSalon === DEFAULT_HOUR) ||
              (!event.horaInicialSalon && !event.horaFinalSalon)
            ) {
              // Evento de todo el día - abarca el día completo (0:00 a 23:59)
              startMinutes = 0;
              endMinutes = 24 * 60 - 1; // 23:59
              console.log(
                `Evento de todo el día detectado: ${event.nombreEvento}`
              );
            } else {
              // Evento con horas específicas
              startMinutes = convertTimeToMinutes(
                event.horaInicialSalon || "00:00"
              );
              endMinutes = convertTimeToMinutes(
                event.horaFinalSalon || "23:59"
              );
            }

            // We only check if the event has NOT ended yet
            const hasNotEnded = nowMinutes < endMinutes;
            // Device validation
            const hasValidDevice = event.devices?.some(
              (device) => screenNames[screenNumber - 1] === device
            );

            // Company validation
            const isValidCompany = event.empresa === userCompany;

            return (
              isWithinDateRange &&
              hasNotEnded && // Cambio de isWithinTimeRange a hasNotEnded
              hasValidDevice &&
              isValidCompany
            );
          });

          console.log("Eventos iniciales filtrados:", filteredEvents.length);

          setScreenData((prev) => ({
            ...prev,
            events: filteredEvents,
          }));
        });

        unsubscribers.push(eventsUnsubscribe);

        // Templates subscription
        const templatesRef = query(
          collection(db, "TemplateDirectorios"),
          where("empresa", "==", userCompany)
        );

        const templatesUnsubscribe = onSnapshot(templatesRef, (snapshot) => {
          if (!isMounted.current) return;

          const templates = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))[0];

          if (templates) {
            // Obtener orientación específica para esta pantalla
            const screenOrientation = getScreenOrientation(templates);
            setIsPortrait(screenOrientation);

            console.log("Template obtenido:", templates);
            console.log(
              "Orientación para pantalla",
              screenNumber,
              ":",
              screenOrientation
            );
            // Asegurarnos de que las publicidades estén bien definidas en el template
            // Añadir propiedades de respaldo si alguna publicidad no está definida
            const enrichedTemplates = {
              ...templates,
              // Asegurar que publicidadLandscape y publicidadPortrait existan
              publicidadLandscape:
                templates.publicidadLandscape || templates.publicidad || null,
              publicidadPortrait:
                templates.publicidadPortrait || templates.publicidad || null,
            };
            if (templates.ciudad) {
              fetchWeatherData(templates.ciudad)
                .then((weatherData) => {
                  if (isMounted.current) {
                    setScreenData((prev) => ({
                      ...prev,
                      templates: enrichedTemplates,
                      weatherData,
                    }));
                  }
                })
                .catch((error) => {
                  console.error(t("errors.weather"), error);
                });
            } else {
              setScreenData((prev) => ({
                ...prev,
                templates: enrichedTemplates,
              }));
            }
          }
        });

        unsubscribers.push(templatesUnsubscribe);

        // Ads subscription - Reemplazando la carga única por una suscripción
        const adsRef = query(
          collection(db, "Publicidad"),
          where("empresa", "==", userCompany),
          where("tipo", "==", "directorio")
        );

        const adsUnsubscribe = onSnapshot(
          adsRef,
          (snapshot) => {
            if (!isMounted.current) return;

            const ads = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            console.log("\n=== PUBLICIDADES RECIBIDAS DE FIRESTORE ===");
            console.log("Total publicidades:", ads.length);

            setScreenData((prev) => ({
              ...prev,
              ads,
            }));

            // Solo marcamos como cargado después de obtener todos los datos iniciales
            setInitialLoading(false);
          },
          (error) => {
            if (isMounted.current) {
              console.error("Error en la suscripción de publicidades:", error);
              setError(t("errors.ads", { error: error.message }));
            }
          }
        );

        unsubscribers.push(adsUnsubscribe);
      } catch (error) {
        if (isMounted.current) {
          setError(t("errors.general", { error: error.message }));
          setInitialLoading(false);
        }
      }
    };

    setupSubscriptions();

    return () => {
      isMounted.current = false;
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [user, db, screenNumber, t, getScreenOrientation]);
  useEffect(() => {
    // Intentar recuperar screenId del localStorage para consistencia entre recargas
    const storageKey = `pantalla_directorio_${screenNumber}`;
    let storedId = localStorage.getItem(storageKey);

    if (!storedId) {
      // Si no existe, crear uno nuevo y guardarlo
      storedId = `directorio_${screenNumber}_${uuidv4().substring(0, 8)}`;
      localStorage.setItem(storageKey, storedId);
    }

    setScreenId(storedId);
  }, [screenNumber]);
  // Integrar hook de heartbeat
  // Integrar hook de heartbeat
  const heartbeat = useHeartbeat({
    screenId,
    screenType: "Directorio",
    screenNumber,
    deviceName: screenData.deviceName || `Pantalla ${screenNumber}`,
    userId: user?.uid,
    companyName: screenData.usuario?.empresa || empresa,
    interval: 30000, // Cada 30 segundos
  });

  // Opcional: Puedes mostrar algún indicador de conexión para depuración
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Estado de conexión:", heartbeat.isConnected);
      console.log("Último heartbeat:", heartbeat.lastBeat);
    }
  }, [heartbeat.isConnected, heartbeat.lastBeat]);
  // Rendering states
  if (!user) {
    return <LogIn url={pathname} />;
  }

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-red-600">
          {error}
          <button
            onClick={() => window.location.reload()}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {t("common.retry")}
          </button>
        </div>
      </div>
    );
  }

  if (!templates) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">{t("directory.noTemplateData")}</div>
      </div>
    );
  }

  if (screenData.events.length === 0 && screenData.ads.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen flex-col">
        <p className="text-xl mb-4">{t("errors.noContent", { countdown })}</p>
        {qrCodeUrl && <QRCode value={qrCodeUrl} size={128} className="mt-4" />}
      </div>
    );
  }

  console.log(
    "Renderizando pantalla",
    screenNumber,
    "con orientación:",
    isPortrait ? "Vertical" : "Horizontal"
  );

  // Render appropriate content
  return screenData.events.length > 0 ? (
    <>
      <TemplateManager
        templateId={templates.template}
        events={screenData.events}
        template={templates}
        weatherData={weatherData}
        currentTime={screenData.currentTime}
        isPortrait={isPortrait}
        t={t}
        qrCodeUrl={qrCodeUrl}
        screenNumber={screenNumber}
        publicidad={
          isPortrait
            ? templates.publicidadPortrait
            : templates.publicidadLandscape
        }
        nombrePantallasDirectorio={Object.values(
          screenData.usuario?.nombrePantallasDirectorio || {}
        )}
      />
      {process.env.NODE_ENV === "development" && (
        <div
          className="fixed bottom-2 right-2 z-50 rounded-full w-4 h-4 border border-gray-300"
          style={{
            backgroundColor: heartbeat.isConnected ? "#10b981" : "#ef4444",
            boxShadow: "0 0 5px rgba(0,0,0,0.3)",
          }}
          title={`Monitoreo: ${
            heartbeat.isConnected ? "Conectado" : "Desconectado"
          }`}
        ></div>
      )}
    </>
  ) : (
    <AdvertisementSlider
      advertisements={screenData.ads}
      templates={screenData.templates || {}}
      event={{
        matchingDevice: screenData.deviceName || `Pantalla ${screenNumber}`,
      }}
      currentTime={screenData.currentTime}
      weatherData={weatherData}
      isPortrait={isPortrait}
    />
  );
}
