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

const REFRESH_INTERVAL = 60000;
const DEFAULT_HOUR = "00:00";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const getHour = () =>
  new Date().toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [screenData, setScreenData] = useState({
    events: [],
    ads: [],
    templates: null,
    matchingDevice: null,
  });

  const [currentHour, setCurrentHour] = useState(getHour());

  const currentEvent = useMemo(() => screenData.events[0], [screenData.events]);
  const currentAd = useMemo(() => screenData.ads[0], [screenData.ads]);
  const templates = useMemo(() => screenData.templates, [screenData.templates]);

  const debouncedSetCurrentHour = useCallback(
    debounce(() => setCurrentHour(getHour()), 1000),
    []
  );
  const convertTimeToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const getHourInMinutes = () => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  };

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

      const startDate = new Date(fechaInicio);
      const endDate = new Date(fechaFinal);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      const isWithinDateRange = now >= startDate && now <= endDate;

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
        currentMinutes >= startMinutes && currentMinutes <= endMinutes;
      const matchesCompany = empresa === company;

      return isWithinDateRange && isWithinTimeRange && matchesCompany;
    });
  }, []);

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

  const loadAds = useCallback(async (userCompany) => {
    try {
      const adsRef = collection(db, "Publicidad");
      const adsQuery = query(
        adsRef,
        where("empresa", "==", userCompany),
        where("tipo", "==", "salon")
      );

      const adsSnapshot = await getDocs(adsQuery);
      const ads = [];

      adsSnapshot.forEach((doc) => {
        ads.push({ id: doc.id, ...doc.data() });
      });

      return ads;
    } catch (error) {
      console.error("Error loading ads:", error);
      return [];
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("🚀 ~ unsubscribe ~ user:", user);

      setUser(user);
      if (!user) setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    let mounted = true;
    let eventsUnsubscribe = () => {};
    let templatesUnsubscribe = () => {};
    let adsUnsubscribe = () => {};

    const setupSubscriptions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const userDoc = await retryOperation(() =>
          getDoc(doc(db, "usuarios", user.uid))
        );

        if (!userDoc.exists() || !mounted) {
          console.error("User document doesn't exist or component unmounted");
          return;
        }

        const userData = userDoc.data();
        const userCompany = userData.empresa;
        const screenNames = userData.nombrePantallas || {};

        // 📢 Suscripción a Publicidad
        const adsRef = query(
          collection(db, "Publicidad"),
          where("empresa", "==", userCompany),
          where("tipo", "==", "salon")
        );

        adsUnsubscribe = onSnapshot(
          adsRef,
          (adsSnapshot) => {
            if (!mounted) return;
            const ads = adsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setScreenData((prev) => ({
              ...prev,
              ads,
            }));
          },
          (error) => {
            setError(error.message);
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
            if (!mounted) return;
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
            setError(error.message);
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
            if (!mounted) return;

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

            const filteredEvents = eventsWithMatching
              .filter((event) => event.matchingDevice)
              .filter(
                (event) => filterCurrentEvents([event], userCompany).length > 0
              );

            console.log("🔄 Eventos filtrados:", filteredEvents);

            setScreenData((prev) => ({
              ...prev,
              events: filteredEvents,
              matchingDevice: filteredEvents[0]?.matchingDevice || null,
            }));
          },
          (error) => {
            setError(error.message);
          }
        );
      } catch (error) {
        setError(error.message);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    setupSubscriptions();

    return () => {
      mounted = false;
      eventsUnsubscribe();
      templatesUnsubscribe();
      adsUnsubscribe();
    };
  }, [
    user,
    db,
    screenNumber,
    filterCurrentEvents,
    findMatchingDevice,
    currentHour,
  ]); // 🟢 Agregamos `currentHour`

  // Update hour and recheck events periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const newHour = getHour();
      console.log(`⏰ Interval ejecutado - Hora actualizada: ${newHour}`);
      setCurrentHour(newHour);
    }, 60000); // Cada minuto

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setScreenData((prev) => {
      const nowMinutes = getHourInMinutes();

      console.log("⌛ Revisando eventos activos...", {
        nowMinutes,
        totalEvents: prev.events.length,
      });

      const filteredEvents = prev.events.filter((event) => {
        const startMinutes = convertTimeToMinutes(event.horaInicialSalon);
        const endMinutes = convertTimeToMinutes(event.horaFinalSalon);
        const isValid = nowMinutes >= startMinutes && nowMinutes <= endMinutes;

        console.log(`🔎 Evento: ${event.nombreEvento}`, {
          startMinutes,
          endMinutes,
          isValid,
        });

        return isValid;
      });

      if (filteredEvents.length === 0) {
        console.log("📢 No hay eventos activos, mostrando publicidad");
      } else {
        console.log(`🎭 Mostrando evento: ${filteredEvents[0].nombreEvento}`);
      }

      return {
        ...prev,
        events: [...filteredEvents], // Se fuerza un nuevo objeto para actualizar el estado
      };
    });
  }, [currentHour]); // Se ejecuta cada vez que cambia la hora actual

  if (!user) {
    return <LogIn url={pathname} />;
  }

  if (isLoading) {
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

  // Modificada la lógica de renderización
  if (!currentEvent) {
    return screenData.ads.length > 0 ? (
      <AdvertisementSlider advertisements={screenData.ads} />
    ) : null;
  }

  return (
    <TemplateManager
      templateId={templates.template}
      event={currentEvent || {}}
      templates={templates}
      currentHour={currentHour}
      t={t}
      matchingDevice={screenData.matchingDevice || null}
    />
  );
};

BaseScreen.propTypes = {
  screenNumber: PropTypes.number.isRequired,
  empresa: PropTypes.string,
};

export default BaseScreen;
