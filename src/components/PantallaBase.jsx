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
import { Swiper, SwiperSlide } from "swiper/react";
import GetLanguageDate from "./GetLanguageDate";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import PropTypes from "prop-types";
import debounce from "lodash/debounce";
import TemplateManager from "./templates/TemplateManager";

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

  const filterCurrentEvents = useCallback((events, company) => {
    const now = new Date();
    return events.filter(
      ({
        fechaInicio,
        fechaFinal,
        horaInicialSalon,
        horaFinalSalon,
        empresa,
      }) => {
        const startDate = new Date(fechaInicio);
        const endDate = new Date(fechaFinal);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 0);

        const startHour =
          horaInicialSalon === DEFAULT_HOUR && horaFinalSalon === DEFAULT_HOUR
            ? DEFAULT_HOUR
            : horaInicialSalon;
        const endHour =
          horaInicialSalon === DEFAULT_HOUR && horaFinalSalon === DEFAULT_HOUR
            ? "23:59"
            : horaFinalSalon;
        const currentHour = getHour();

        return (
          now >= startDate &&
          now <= endDate &&
          currentHour >= startHour &&
          currentHour <= endHour &&
          empresa === company
        );
      }
    );
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

    const setupSubscriptions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const userDoc = await retryOperation(() =>
          getDoc(doc(db, "usuarios", user.uid))
        );

        if (!userDoc.exists() || !mounted) return;

        const userData = userDoc.data();
        const userCompany = userData.empresa;
        const screenNames = userData.nombrePantallas || {};

        // Subscribe to templates updates
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
            console.error("Error in templates snapshot:", error);
            setError(error.message);
          }
        );

        // Subscribe to events updates
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

            const ads =
              filteredEvents.length === 0 ? await loadAds(userCompany) : [];

            setScreenData((prev) => ({
              ...prev,
              events: filteredEvents,
              ads,
              matchingDevice: filteredEvents[0]?.matchingDevice || null,
            }));
          },
          (error) => {
            console.error("Error in events snapshot:", error);
            setError(error.message);
          }
        );
      } catch (error) {
        console.error("Error in setup:", error);
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
    };
  }, [
    user,
    db,
    screenNumber,
    filterCurrentEvents,
    loadAds,
    findMatchingDevice,
  ]);

  // Update hour and recheck events periodically
  useEffect(() => {
    const interval = setInterval(() => {
      debouncedSetCurrentHour();
      // Check if we need to update events based on new hour
      setScreenData((prev) => {
        const userCompany = user?.empresa;
        if (!userCompany) return prev;

        const filteredEvents = prev.events.filter(
          (event) => filterCurrentEvents([event], userCompany).length > 0
        );

        return {
          ...prev,
          events: filteredEvents,
          ads: filteredEvents.length === 0 ? prev.ads : [],
        };
      });
    }, REFRESH_INTERVAL);

    return () => {
      clearInterval(interval);
      debouncedSetCurrentHour.cancel();
    };
  }, [debouncedSetCurrentHour, filterCurrentEvents, user]);

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

  return (
    <TemplateManager
      templateId={templates.template}
      event={currentEvent}
      templates={templates}
      currentHour={currentHour}
      t={t}
      matchingDevice={screenData.matchingDevice}
    />
  );
};

BaseScreen.propTypes = {
  screenNumber: PropTypes.number.isRequired,
  empresa: PropTypes.string,
};

export default BaseScreen;
