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
import { usePathname, useRouter } from "next/navigation";
import LogIn from "@/app/login/page";
import AdvertisementSlider from "@/components/sliderPublicidadPD";
import debounce from "lodash/debounce";
import TemplateManager from "./templates/PDTemplateManager";
import {
  formatDate,
  getCurrentTime,
  isWithinTimeRange,
} from "@/utils/dateUtils";

import { fetchWeatherData } from "@/utils/weatherUtils";

import QRCode from "qrcode.react";

const REFRESH_INTERVAL = 60000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const COUNTDOWN_DURATION = 60;

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

export default function BaseDirectorioClient({ id }) {
  const screenNumber = parseInt(id, 10);
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPortrait, setIsPortrait] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const [screenData, setScreenData] = useState({
    events: [],
    ads: [],
    templates: null,
    weatherData: null,
    currentTime: getCurrentTime(),
  });

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

  const filterCurrentEvents = useCallback(
    (events, company, screenNames, currentScreenNumber) => {
      console.log("--- INICIO FILTRADO EVENTOS ---");
      console.log("Parámetros recibidos:", {
        company,
        screenNames,
        currentScreenNumber,
        currentTime: getCurrentTime(),
      });

      // Validación de screenNames
      if (!screenNames || Object.keys(screenNames).length === 0) {
        console.error("screenNames no está definido o está vacío");
        return [];
      }

      const now = new Date();
      const currentTime = getCurrentTime();
      console.log("Fecha y hora actual:", now.toISOString());

      // Crear el objeto que mapea nombres de pantallas a números
      const pantallasNumeradas = Object.entries(screenNames).reduce(
        (acc, [key, value]) => {
          acc[value] = parseInt(key) + 1;
          return acc;
        },
        {}
      );

      console.log("Mapeo de pantallas:", pantallasNumeradas);

      return events.filter((event) => {
        console.log("\nProcesando evento:", event.id);
        console.log("Datos del evento:", {
          nombre: event.nombreEvento,
          empresa: event.empresa,
          devices: event.devices,
          fechaInicio: event.fechaInicio,
          fechaFinal: event.fechaFinal,
          horaInicial: event.horaInicialSalon,
          horaFinal: event.horaFinalSalon,
        });

        // Date validation
        const startDate = new Date(event.fechaInicio);
        const endDate = new Date(event.fechaFinal);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        const isWithinDateRange = now >= startDate && now <= endDate;
        console.log("¿Dentro de rango fechas?", isWithinDateRange, {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        });

        // Time validation
        const isWithinTime = isWithinTimeRange(
          currentTime,
          event.horaInicialSalon || "00:00",
          event.horaFinalSalon || "23:59"
        );
        console.log("¿Dentro de rango horario?", isWithinTime, {
          current: currentTime,
          start: event.horaInicialSalon,
          end: event.horaFinalSalon,
        });

        // Company validation
        const isValidCompany = event.empresa === company;
        console.log("¿Empresa coincide?", isValidCompany, {
          eventCompany: event.empresa,
          userCompany: company,
        });

        // Device validation - Optimizada
        const hasValidDevice = event.devices?.some(
          (device) => screenNames[currentScreenNumber - 1] === device
        );

        console.log("¿Tiene dispositivo válido?", hasValidDevice, {
          devices: event.devices,
          screenNames,
          currentScreenNumber,
        });

        const result =
          isWithinDateRange && isWithinTime && isValidCompany && hasValidDevice;
        console.log("¿Evento válido?", result);

        return result;
      });
    },
    []
  );

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
      if (!user) setIsLoading(false);
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

  useEffect(() => {
    if (!user || !db) return;

    let mounted = true;
    let unsubscribers = [];

    const setupSubscriptions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const userDoc = await retryOperation(() =>
          getDoc(doc(db, "usuarios", user.uid))
        );

        if (!userDoc.exists() || !mounted) return;

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

        // Events subscription
        const eventsRef = query(
          collection(db, "eventos"),
          where("empresa", "==", userCompany)
        );

        const eventsUnsubscribe = onSnapshot(eventsRef, (snapshot) => {
          if (!mounted) return;

          const events = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          console.log("\n=== EVENTOS RECIBIDOS DE FIRESTORE ===");
          console.log("Total eventos:", events.length);
          console.log("Eventos crudos:", events);

          const filteredEvents = filterCurrentEvents(
            events,
            userCompany,
            screenNames,
            screenNumber
          );

          console.log("\n=== EVENTOS FILTRADOS ===");
          console.log("Eventos que pasaron el filtro:", filteredEvents.length);
          console.log("Detalle eventos filtrados:", filteredEvents);

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
          if (!mounted) return;

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

            if (templates.ciudad) {
              fetchWeatherData(templates.ciudad)
                .then((weatherData) => {
                  setScreenData((prev) => ({
                    ...prev,
                    templates,
                    weatherData,
                  }));
                })
                .catch((error) => {
                  console.error(t("errors.weather"), error);
                });
            } else {
              setScreenData((prev) => ({
                ...prev,
                templates,
              }));
            }
          }
        });

        unsubscribers.push(templatesUnsubscribe);

        // Load initial ads
        const ads = await loadAds(userCompany);
        if (mounted) {
          setScreenData((prev) => ({
            ...prev,
            ads,
          }));
        }
      } catch (error) {
        if (mounted) {
          setError(t("errors.general", { error: error.message }));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    setupSubscriptions();

    return () => {
      mounted = false;
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [
    user,
    db,
    screenNumber,
    filterCurrentEvents,
    loadAds,
    t,
    getScreenOrientation,
  ]);

  useEffect(() => {
    const interval = setInterval(debouncedSetCurrentTime, 1000);
    return () => {
      clearInterval(interval);
      debouncedSetCurrentTime.cancel();
    };
  }, [debouncedSetCurrentTime]);

  // Rendering states
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
    />
  ) : (
    <AdvertisementSlider
      advertisements={screenData.ads}
      templates={screenData.templates || {}}
      event={{
        matchingDevice: screenData.deviceName || `Pantalla ${screenNumber}`,
      }}
      currentTime={screenData.currentTime}
      weatherData={weatherData}
    />
  );
}
