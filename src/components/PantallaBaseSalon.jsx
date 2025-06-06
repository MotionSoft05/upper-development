// PantallaBaseSalon
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
import { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";
import LogIn from "@/app/login/page";
import AdvertisementSlider from "@/components/sliderPublicidadPS";
import PropTypes from "prop-types";
import debounce from "lodash/debounce";
import TemplateManager from "./templates/PSTemplateManager";
import useHeartbeat from "@/hook/useHeartbeat";
import { v4 as uuidv4 } from "uuid"; // Necesitamos importar uuid para generar IDs únicos

const DEFAULT_HOUR = "00:00";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const getHour = () =>
  new Date().toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

// Calculate milliseconds until next minute starts
const calculateTimeUntilNextMinute = () => {
  const now = new Date();
  const seconds = now.getSeconds();
  const milliseconds = now.getMilliseconds();
  return (60 - seconds) * 1000 - milliseconds;
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

const BaseScreen = ({ screenNumber, empresa }) => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true); // Only for initial load
  const [error, setError] = useState(null);
  const [screenData, setScreenData] = useState({
    events: [],
    ads: [],
    templates: null,
    matchingDevice: null,
  });
  const [screenId, setScreenId] = useState("");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const docRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    fetchUserData();
  }, [user]);

  console.log(
    "🚀 ~ PantallaBaseSalon.jsx:67 ~ BaseScreen ~ screenData:",
    screenData
  );

  const [currentHour, setCurrentHour] = useState(getHour());

  const currentEvent = useMemo(() => screenData.events[0], [screenData.events]);
  const currentAd = useMemo(() => screenData.ads[0], [screenData.ads]);
  const templates = useMemo(() => screenData.templates, [screenData.templates]);

  useEffect(() => {
    // Intentar recuperar screenId del localStorage para consistencia entre recargas
    let storedId = localStorage.getItem(`pantalla_salon_${screenNumber}`);
    if (!storedId) {
      // Si no existe, crear uno nuevo y guardarlo
      storedId = `salon_${screenNumber}_${uuidv4().substring(0, 8)}`;
      localStorage.setItem(`pantalla_salon_${screenNumber}`, storedId);
    }
    setScreenId(storedId);
  }, [screenNumber]);

  const debouncedSetCurrentHour = useCallback(
    debounce(() => setCurrentHour(getHour()), 1000),
    []
  );

  // Convert time string to minutes - extracted to stabilize references
  const convertTimeToMinutes = useCallback((timeString) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  }, []);

  // Get current hour in minutes - extracted to stabilize references
  const getHourInMinutes = useCallback(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }, []);

  const filterCurrentEvents = useCallback((events, company) => {
    const now = new Date();
    const currentMinutes = getHourInMinutes();

    console.log("Starting filter process with:", {
      currentTime: new Date().toLocaleTimeString(),
      currentMinutes,
      totalEvents: events.length,
      companyFilter: company,
    });

    return events.filter((event) => {
      const {
        fechaInicio,
        fechaFinal,
        horaInicialSalon,
        horaFinalSalon,
        empresa,
        nombreEvento,
        id,
      } = event;

      // CORRECCIÓN: Usar fecha local en lugar de UTC
      const today = new Date();
      const formattedToday = `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      // Compare strings directamente
      const isWithinDateRange =
        formattedToday >= fechaInicio && formattedToday <= fechaFinal;

      console.log(
        `Evento ${nombreEvento} - fecha hoy: ${formattedToday}, inicio: ${fechaInicio}, fin: ${fechaFinal}, en rango: ${isWithinDateRange}`
      );

      let startMinutes, endMinutes;

      if (
        horaInicialSalon === DEFAULT_HOUR &&
        horaFinalSalon === DEFAULT_HOUR
      ) {
        startMinutes = 0;
        endMinutes = 24 * 60 - 1;
      } else {
        startMinutes = convertTimeToMinutes(horaInicialSalon);
        endMinutes = convertTimeToMinutes(horaFinalSalon);
      }

      // Note: We use < for end time comparison to make events end exactly at end time
      const isWithinTimeRange =
        currentMinutes >= startMinutes && currentMinutes < endMinutes;
      const matchesCompany = empresa === company;

      return isWithinDateRange && isWithinTimeRange && matchesCompany;
    });
  }, []);

  useEffect(() => {
    // Intentar recuperar screenId del localStorage para consistencia entre recargas
    const storageKey = `pantalla_salon_${screenNumber}`;
    let storedId =
      typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;

    if (!storedId) {
      // Si no existe, crear uno nuevo y guardarlo
      storedId = `salon_${screenNumber}_${uuidv4().substring(0, 8)}`;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(storageKey, storedId);
        } catch (e) {
          console.error("Error al guardar screenId:", e);
        }
      }
    }

    setScreenId(storedId);
  }, [screenNumber]);

  // Mantén tu función findMatchingDevice como está
  const findMatchingDevice = useCallback(
    (event, screenNames, currentScreenNumber) => {
      const devices = event.devices || [];
      const screenNumberMap = Object.fromEntries(
        Object.values(screenNames).map((name, index) => [name, index + 1])
      );

      return devices.find(
        (device) => screenNumberMap[device] === parseInt(currentScreenNumber)
      );
    },
    []
  );

  // Filtrar anuncios basados en el número de pantalla
  const filterAdsForScreen = useCallback((ads, screenNumber, screenNames) => {
    if (!ads || !ads.length || !screenNames) return [];

    // Obtener el nombre de pantalla para este número de pantalla
    const screenName = `salon${screenNumber}`;
    const screenDisplayName = screenNames[screenNumber - 1];

    console.log(
      `Filtrando anuncios para pantalla: ${screenName}, nombre: ${screenDisplayName}`
    );

    return ads.filter((ad) => {
      // Casos de filtro:
      // 1. Si destino es "todas", mostrar en todas las pantallas
      if (ad.destino === "todas") {
        return true;
      }

      // 2. Si destino es "especificas", verificar si esta pantalla está en pantallasAsignadas
      if (ad.destino === "especificas" && ad.pantallasAsignadas) {
        const isAssigned = ad.pantallasAsignadas.includes(screenName);
        console.log(`Ad ${ad.nombre}: asignado a esta pantalla: ${isAssigned}`);
        return isAssigned;
      }

      return false;
    });
  }, []);

  // Integrar hook de heartbeat
  const heartbeat = useHeartbeat({
    screenId,
    screenType: "salon",
    screenNumber,
    deviceName: screenData.deviceName || `Pantalla ${screenNumber}`,
    userId: user?.uid,
    companyName: screenData.usuario?.empresa || empresa,
    interval: 60000, // Cada 60 segundos
  });

  // Opcional: Puedes mostrar algún indicador de conexión para depuración
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Estado de conexión:", heartbeat.isConnected);
      console.log("Último heartbeat:", heartbeat.lastBeat);
    }
  }, [heartbeat.isConnected, heartbeat.lastBeat]);

  // Check for active events based on current time (memory-based filtering)
  const checkCurrentEvents = useCallback(() => {
    const now = new Date();
    const nowMinutes = getHourInMinutes();

    // Safe guard to prevent errors when events haven't loaded yet
    if (!screenData.allEvents || screenData.allEvents.length === 0) {
      console.log("⚠️ No hay eventos disponibles para filtrar");
      return;
    }

    console.log("⌛ Revisando eventos activos en memoria...", {
      currentTime: now.toLocaleTimeString(),
      nowMinutes,
      totalEvents: screenData.allEvents.length,
    });

    // Filter the existing events in memory based on current time
    const allCurrentEvents = screenData.allEvents.filter((event) => {
      const { fechaInicio, fechaFinal, horaInicialSalon, horaFinalSalon } =
        event;

      // CORRECCIÓN: Usar fecha local en lugar de UTC
      const today = new Date();
      const formattedToday = `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      // Compare strings directamente
      const isWithinDateRange =
        formattedToday >= fechaInicio && formattedToday <= fechaFinal;

      console.log(
        `Evento ${event.nombreEvento} - fecha hoy: ${formattedToday}, inicio: ${fechaInicio}, fin: ${fechaFinal}, en rango: ${isWithinDateRange}`
      );

      // Check time range
      let startMinutes, endMinutes;
      if (
        horaInicialSalon === DEFAULT_HOUR &&
        horaFinalSalon === DEFAULT_HOUR
      ) {
        startMinutes = 0;
        endMinutes = 24 * 60 - 1;
      } else {
        startMinutes = convertTimeToMinutes(horaInicialSalon);
        endMinutes = convertTimeToMinutes(horaFinalSalon);
      }

      const isWithinTimeRange =
        nowMinutes >= startMinutes && nowMinutes < endMinutes;

      console.log(`🔎 Evento: ${event.nombreEvento}`, {
        startMinutes,
        endMinutes,
        nowMinutes,
        isWithinDateRange,
        isWithinTimeRange,
        shouldShow: isWithinDateRange && isWithinTimeRange,
      });

      return isWithinDateRange && isWithinTimeRange;
    });

    if (allCurrentEvents.length === 0) {
      console.log("📢 No hay eventos activos, mostrando publicidad");
    } else {
      console.log(`🎭 Mostrando evento: ${allCurrentEvents}`);
    }

    // Update the screen data with the filtered events
    setScreenData((prev) => ({
      ...prev,
      events: allCurrentEvents,
      matchingDevice: allCurrentEvents[0]?.matchingDevice || null,
    }));
  }, [screenData.allEvents]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("🚀 ~ unsubscribe ~ user:", user);

      setUser(user);
      if (!user) setInitialLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) return;

    // Use ref to track if we're mounted to prevent memory leaks
    const isMounted = { current: true };

    let eventsUnsubscribe = () => {};
    let templatesUnsubscribe = () => {};
    let adsUnsubscribe = () => {};

    const setupSubscriptions = async () => {
      if (isMounted.current) setInitialLoading(true);
      if (isMounted.current) setError(null);

      try {
        const userDoc = await retryOperation(() =>
          getDoc(doc(db, "usuarios", user.uid))
        );

        if (!userDoc.exists()) {
          console.error("User document doesn't exist");
          if (isMounted.current) {
            setError("User document doesn't exist");
            setInitialLoading(false);
          }
          return;
        }

        if (!isMounted.current) return;

        const userData = userDoc.data();
        const userCompany = userData.empresa;
        const screenNames = userData.nombrePantallas || {};

        // Obtener el nombre de la pantalla actual basado en el número de pantalla
        const currentScreenName =
          screenNames[screenNumber - 1] || `Pantalla ${screenNumber}`;

        // Luego en los setScreenData iniciales, añade esta información
        if (isMounted.current) {
          setScreenData((prev) => ({
            ...prev,
            deviceName: currentScreenName,
            usuario: {
              ...userData,
              nombrePantallas: screenNames,
            },
          }));
        }

        // 📢 Suscripción a Publicidad
        const adsRef = query(
          collection(db, "Publicidad"),
          where("empresa", "==", userCompany),
          where("tipo", "==", "salon")
        );

        adsUnsubscribe = onSnapshot(
          adsRef,
          (adsSnapshot) => {
            if (!isMounted.current) return;
            const allAds = adsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            // Filtrar anuncios específicos para esta pantalla
            const filteredAds = filterAdsForScreen(
              allAds,
              screenNumber,
              screenNames
            );

            console.log(
              `Anuncios totales: ${allAds.length}, Filtrados para pantalla ${screenNumber}: ${filteredAds.length}`
            );

            setScreenData((prev) => ({
              ...prev,
              ads: filteredAds,
            }));
          },
          (error) => {
            if (isMounted.current) setError(error.message);
          }
        );

        // 📌 Suscripción a Templates
        const templatesRef = query(
          collection(db, "TemplateSalones"),
          where("empresa", "==", userCompany)
        );

        templatesUnsubscribe = onSnapshot(
          templatesRef,
          (templatesSnapshot) => {
            if (!isMounted.current) return;
            const templates = templatesSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))[0];

            setScreenData((prev) => ({
              ...prev,
              templates,
            }));
          },
          (error) => {
            if (isMounted.current) setError(error.message);
          }
        );

        // ⏳ Suscripción a Eventos
        const eventsRef = query(
          collection(db, "eventos"),
          where("empresa", "==", userCompany)
        );

        eventsUnsubscribe = onSnapshot(
          eventsRef,
          async (snapshot) => {
            if (!isMounted.current) return;

            const events = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            const eventsWithMatching = events.map((event) => {
              const matchingDevice = findMatchingDevice(
                event,
                screenNames,
                screenNumber
              );
              return { ...event, matchingDevice };
            });

            // Store ALL matching events in screenData,
            // then filter for current time in the render or checkCurrentEvents
            const matchingEvents = eventsWithMatching.filter(
              (event) => event.matchingDevice
            );

            console.log(
              "🔄 Eventos con pantalla correspondiente:",
              matchingEvents.length
            );

            // Filter for current time immediately
            const now = new Date();
            const nowMinutes = getHourInMinutes();

            const currentlyActiveEvents = matchingEvents.filter((event) => {
              const {
                fechaInicio,
                fechaFinal,
                horaInicialSalon,
                horaFinalSalon,
              } = event;

              // CORRECCIÓN: Usar fecha local en lugar de UTC
              const today = new Date();
              const formattedToday = `${today.getFullYear()}-${String(
                today.getMonth() + 1
              ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

              console.log(
                `Evento ${event.nombreEvento} - fecha hoy: ${formattedToday}, inicio: ${fechaInicio}, fin: ${fechaFinal}`
              );

              // Compare strings directamente
              const isWithinDateRange =
                formattedToday >= fechaInicio && formattedToday <= fechaFinal;

              // Check time range
              let startMinutes, endMinutes;
              if (
                horaInicialSalon === DEFAULT_HOUR &&
                horaFinalSalon === DEFAULT_HOUR
              ) {
                startMinutes = 0;
                endMinutes = 24 * 60 - 1;
              } else {
                startMinutes = convertTimeToMinutes(horaInicialSalon);
                endMinutes = convertTimeToMinutes(horaFinalSalon);
              }

              const isWithinTimeRange =
                nowMinutes >= startMinutes && nowMinutes < endMinutes;
              return isWithinDateRange && isWithinTimeRange;
            });

            if (isMounted.current) {
              setScreenData((prev) => ({
                ...prev,
                // Store all matching events in allEvents
                allEvents: matchingEvents,
                // Store currently active events in events
                events: currentlyActiveEvents,
                matchingDevice:
                  currentlyActiveEvents[0]?.matchingDevice || null,
              }));

              setInitialLoading(false);
            }
          },
          (error) => {
            if (isMounted.current) {
              setError(error.message);
              setInitialLoading(false);
            }
          }
        );
      } catch (error) {
        if (isMounted.current) {
          setError(error.message);
          setInitialLoading(false);
        }
      }
    };

    setupSubscriptions();

    return () => {
      isMounted.current = false;
      eventsUnsubscribe();
      templatesUnsubscribe();
      adsUnsubscribe();
    };
  }, [
    user,
    db,
    screenNumber,
    findMatchingDevice,
    getHourInMinutes,
    convertTimeToMinutes,
    filterAdsForScreen,
  ]); // Removed currentHour dependency

  // Schedule updates at the start of each minute
  useEffect(() => {
    // useRef to track if we're mounted
    const isMounted = { current: true };

    const runCheck = () => {
      if (isMounted.current && screenData.allEvents?.length > 0) {
        checkCurrentEvents();
      }
    };

    // Wait a bit after mounting before doing the first check
    const initialTimerId = setTimeout(runCheck, 1000);

    const scheduleNextMinute = () => {
      const timeUntilNextMinute = calculateTimeUntilNextMinute();
      console.log(
        `⏱️ Next update in ${Math.round(timeUntilNextMinute / 1000)} seconds`
      );

      const timerId = setTimeout(() => {
        if (!isMounted.current) return;

        const newHour = getHour();
        console.log(`⏰ Minute-exact update - Updated hour: ${newHour}`);
        setCurrentHour(newHour);

        // Fetch fresh event data from the database
        runCheck();

        // Schedule the next update
        scheduleNextMinute();
      }, timeUntilNextMinute);

      return timerId;
    };

    const timerId = scheduleNextMinute();

    return () => {
      isMounted.current = false;
      clearTimeout(initialTimerId);
      clearTimeout(timerId);
    };
  }, [screenData.allEvents]);

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
          Error: {error}
          <button
            onClick={() => window.location.reload()}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!templates) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">No template data available</div>
      </div>
    );
  }

  if (!currentEvent) {
    return screenData.ads.length > 0 ? (
      <AdvertisementSlider
        advertisements={screenData.ads}
        templates={screenData.templates || {}}
        event={{
          matchingDevice: screenData.deviceName || `Pantalla ${screenNumber}`,
        }}
        currentHour={currentHour}
      />
    ) : null;
  }

  return (
    <>
      <TemplateManager
        templateId={templates.template}
        event={currentEvent || {}}
        templates={templates}
        currentHour={currentHour}
        t={t}
        matchingDevice={screenData.matchingDevice || null}
      />
      {/* Indicador de conexión - solo visible en modo desarrollo */}
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
  );
};

BaseScreen.propTypes = {
  screenNumber: PropTypes.number.isRequired,
  empresa: PropTypes.string,
};

export default BaseScreen;
