"use client";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  getDoc,
  addDoc,
} from "firebase/firestore";
import Swal from "sweetalert2";
import Select from "react-select";
import { firebaseConfig } from "@/firebase/firebaseConfig";

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = getFirestore();

function PantallasVuelos() {
  const { t } = useTranslation();

  // Estados principales (siguiendo patrón de PantallasPromociones)
  const [activeTab, setActiveTab] = useState("general");
  const [selectedPantalla, setSelectedPantalla] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Estados de configuración general
  const [selectedLanguage, setSelectedLanguage] = useState("es");
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");
  const [empresas, setEmpresas] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Estados específicos de vuelos
  const [nombrePantallasVuelos, setNombrePantallasVuelos] = useState([]);
  const [pantallaSettings, setPantallaSettings] = useState({});
  const [pv, setPv] = useState(0); // Cantidad de pantallas de vuelos licenciadas

  // Configuración de aeropuertos disponibles
  const [availableAirports] = useState([
    {
      value: "MEX",
      label: "Ciudad de México (AICM)",
      name: "Aeropuerto Internacional Ciudad de México",
    },
    {
      value: "TLC",
      label: "Toluca",
      name: "Aeropuerto Internacional de Toluca",
    },
    {
      value: "NLU",
      label: "Felipe Ángeles",
      name: "Aeropuerto Internacional Felipe Ángeles",
    },
  ]);

  // Aerolíneas disponibles para filtros
  const [availableAirlines] = useState([
    "Aeromexico",
    "Volaris",
    "VivaAerobus",
    "Interjet",
    "Copa Airlines",
    "American Airlines",
    "Delta Air Lines",
    "United Airlines",
    "Air France",
    "Lufthansa",
    "KLM",
    "British Airways",
  ]);

  // Mensajes dinámicos
  const [dynamicMessages, setDynamicMessages] = useState([
    {
      id: "shuttle",
      text: {
        es: "🚐 Shuttle al aeropuerto cada hora - Contacte Concierge",
        en: "🚐 Airport shuttle every hour - Contact Concierge",
      },
      enabled: true,
      displayDuration: 10,
    },
  ]);

  // Configuración de Distance Matrix
  const [distanceConfig, setDistanceConfig] = useState({
    enabled: false,
    hotelLocation: {
      lat: 19.4326, // CDMX centro por defecto
      lng: -99.1332,
      address: "",
    },
  });


  // useEffect para cargar datos iniciales (siguiendo patrón existente)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const authUser = firebase.auth().currentUser;
        if (!authUser) return;

        // Verificar si es admin
        const adminEmails = ["admin@upperds.com", "soporte@upperds.com"];
        const isUserAdmin = adminEmails.includes(authUser.email);
        setIsAdmin(isUserAdmin);

        // Cargar empresas si es admin
        if (isUserAdmin) {
          await loadEmpresas();
        }

        // Cargar configuración de pantallas de vuelos
        await loadFlightScreensConfig();
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();
  }, []);

  // Función para cargar empresas (solo admin)
  const loadEmpresas = async () => {
    try {
      const usuariosSnapshot = await getDocs(collection(db, "usuarios"));
      const empresasSet = new Set();
      usuariosSnapshot.forEach((doc) => {
        const empresa = doc.data().empresa;
        if (empresa) empresasSet.add(empresa);
      });
      setEmpresas(Array.from(empresasSet));
    } catch (error) {
      console.error("Error loading empresas:", error);
    }
  };

  // Función para cargar configuración de pantallas de vuelos (siguiendo patrón de promociones)
  const loadFlightScreensConfig = async () => {
    try {
      const authUser = firebase.auth().currentUser;
      let empresa = empresaSeleccionada;

      // Obtener empresa del usuario
      if (!empresa && !isAdmin) {
        const usuariosQuery = query(
          collection(db, "usuarios"),
          where("email", "==", authUser.email)
        );
        const usuariosSnapshot = await getDocs(usuariosQuery);
        if (!usuariosSnapshot.empty) {
          const userData = usuariosSnapshot.docs[0].data();
          empresa = userData.empresa || "";
          
          // CARGAR LICENCIAS desde usuarios (no desde licencias)
          setPv(parseInt(userData.pv) || 0);
          
          // CARGAR NOMBRES desde usuarios
          if (userData.nombrePantallasVuelos) {
            const nombresArray = Array.isArray(userData.nombrePantallasVuelos) 
              ? userData.nombrePantallasVuelos 
              : Object.values(userData.nombrePantallasVuelos);
            setNombrePantallasVuelos(nombresArray);
          }
        }
      } else if (empresa) {
        // Para admin, cargar licencias de la empresa seleccionada
        const usuariosQuery = query(
          collection(db, "usuarios"),
          where("empresa", "==", empresa)
        );
        const usuariosSnapshot = await getDocs(usuariosQuery);

        if (!usuariosSnapshot.empty) {
          const usuarioData = usuariosSnapshot.docs[0].data();
          setPv(parseInt(usuarioData.pv) || 0);
          
          // CARGAR NOMBRES desde usuarios
          if (usuarioData.nombrePantallasVuelos) {
            const nombresArray = Array.isArray(usuarioData.nombrePantallasVuelos) 
              ? usuarioData.nombrePantallasVuelos 
              : Object.values(usuarioData.nombrePantallasVuelos);
            setNombrePantallasVuelos(nombresArray);
          }
        }
      }

      if (!empresa) return;

      // Cargar configuración desde TemplateVuelos (no desde flightScreens)
      const templateVuelosRef = collection(db, "TemplateVuelos");
      const templateVuelosQuery = query(
        templateVuelosRef,
        where("empresa", "==", empresa)
      );
      const templateVuelosSnapshot = await getDocs(templateVuelosQuery);

      if (!templateVuelosSnapshot.empty) {
        const templateData = templateVuelosSnapshot.docs[0].data();
        setSelectedLanguage(templateData.idioma || "es");
        setPantallaSettings(templateData.pantallasConfig || {});
        setDynamicMessages(templateData.dynamicMessages || dynamicMessages);
        setDistanceConfig(templateData.distanceConfig || distanceConfig);
      }

    } catch (error) {
      console.error("Error loading flight screens config:", error);
    }
  };

  // Función para manejar cambios de configuración general
  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
    setHasUnsavedChanges(true);
  };

  // Función para seleccionar una pantalla específica
  const handleSelectPantalla = async (pantallaIndex) => {
    if (hasUnsavedChanges) {
      const result = await Swal.fire({
        title: "Cambios sin guardar",
        text: "Tiene cambios sin guardar. ¿Desea guardarlos antes de continuar?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Guardar",
        cancelButtonText: "Descartar cambios",
      });

      if (result.isConfirmed) {
        await guardarConfiguracion();
      }

      setHasUnsavedChanges(false);
    }

    const pantallaNombre = nombrePantallasVuelos[pantallaIndex];
    const pantallaId = `vuelo${pantallaIndex + 1}`;

    // Configuración por defecto con valores seguros
    const defaultConfig = {
      airport: {
        code: "MEX",
        name: "Aeropuerto Internacional Ciudad de México",
      },
      displaySettings: {
        showDepartures: true,
        showArrivals: true,
        timeWindow: 5,
        maxFlights: 8,
        refreshInterval: 120,
        language: selectedLanguage,
      },
      airlineFilters: {
        enabled: false,
        selectedAirlines: [],
      },
      orientation: "horizontal",
      rotationDirection: 0,
    };

    // Combinar configuración existente con valores por defecto
    let config = {
      ...defaultConfig,
      ...pantallaSettings[pantallaId],
      airport: {
        ...defaultConfig.airport,
        ...pantallaSettings[pantallaId]?.airport,
      },
      displaySettings: {
        ...defaultConfig.displaySettings,
        ...pantallaSettings[pantallaId]?.displaySettings,
      },
      airlineFilters: {
        ...defaultConfig.airlineFilters,
        ...pantallaSettings[pantallaId]?.airlineFilters,
      },
    };

    setSelectedPantalla({
      id: pantallaId,
      index: pantallaIndex,
      nombre: pantallaNombre,
      config: config,
    });

    setActiveTab("pantalla");
  };

  // Función para guardar configuración (siguiendo patrón de promociones)
  const guardarConfiguracion = async () => {
    try {
      const authUser = firebase.auth().currentUser;

      if (pv === 0) {
        Swal.fire({
          icon: "error",
          title: "No hay licencias activas para pantallas de vuelos",
        });
        return;
      }

      if (!authUser) {
        Swal.fire({
          icon: "error",
          title: "Usuario no autenticado",
        });
        return;
      }

      // Obtener la empresa a actualizar
      let empresaToUpdate = empresaSeleccionada;

      if (!empresaToUpdate) {
        const usuariosRef = collection(db, "usuarios");
        const usuariosQuery = query(
          usuariosRef,
          where("email", "==", authUser.email)
        );
        const usuariosSnapshot = await getDocs(usuariosQuery);

        if (!usuariosSnapshot.empty) {
          empresaToUpdate = usuariosSnapshot.docs[0].data().empresa || "";
        } else {
          console.error("No se encontró la empresa del usuario autenticado");
          return;
        }
      }

      // 1. ACTUALIZAR NOMBRES EN USUARIOS (esto es lo que faltaba)
      const usuariosRef = collection(db, "usuarios");
      const usuariosEmpresaQuery = query(
        usuariosRef,
        where("empresa", "==", empresaToUpdate)
      );
      const usuariosEmpresaSnapshot = await getDocs(usuariosEmpresaQuery);

      const updateNombrePantallasPromises = [];

      usuariosEmpresaSnapshot.forEach((usuarioDoc) => {
        const usuarioRef = usuarioDoc.ref;
        const usuarioData = usuarioDoc.data();

        if (usuarioRef && usuarioData) {
          const nombrePantallasObject = {};
          nombrePantallasVuelos.forEach((nombre, index) => {
            nombrePantallasObject[`nombrePantallasVuelos.${index}`] = nombre;
          });
          updateNombrePantallasPromises.push(
            updateDoc(usuarioRef, nombrePantallasObject)
          );
        }
      });

      await Promise.all(updateNombrePantallasPromises);

      // 2. GUARDAR EN TEMPLATE VUELOS (igual que promociones)
      const templateVuelosRef = collection(db, "TemplateVuelos");
      const templateVuelosQuery = query(
        templateVuelosRef,
        where("empresa", "==", empresaToUpdate)
      );
      const templateVuelosSnapshot = await getDocs(templateVuelosQuery);

      const templateData = {
        empresa: empresaToUpdate,
        idioma: selectedLanguage,
        pantallasConfig: pantallaSettings,
        dynamicMessages: dynamicMessages,
        distanceConfig: distanceConfig,
        updatedAt: serverTimestamp(),
        updatedBy: authUser.email || ""
      };

      if (!templateVuelosSnapshot.empty) {
        // Actualizar documento existente
        const templateVuelosDocRef = templateVuelosSnapshot.docs[0].ref;
        await updateDoc(templateVuelosDocRef, templateData);
      } else {
        // Crear nuevo documento
        await addDoc(templateVuelosRef, templateData);
      }


      Swal.fire({
        icon: "success",
        title: "Configuración guardada con éxito",
        showConfirmButton: false,
        timer: 2000,
      });

      setHasUnsavedChanges(false);
      return true;

    } catch (error) {
      console.error("Error al guardar configuración:", error);
      Swal.fire({
        icon: "error",
        title: "Error al guardar la configuración",
        text: error.message,
      });
      return false;
    }
  };

  // Funciones para manejar mensajes dinámicos
  const addDynamicMessage = () => {
    const newMessage = {
      id: `msg_${Date.now()}`,
      text: { es: "", en: "" },
      enabled: true,
      displayDuration: 10,
    };
    setDynamicMessages([...dynamicMessages, newMessage]);
    setHasUnsavedChanges(true);
  };

  const removeDynamicMessage = (messageId) => {
    setDynamicMessages(dynamicMessages.filter((msg) => msg.id !== messageId));
    setHasUnsavedChanges(true);
  };

  const updateDynamicMessage = (messageId, field, value) => {
    setDynamicMessages(
      dynamicMessages.map((msg) =>
        msg.id === messageId ? { ...msg, [field]: value } : msg
      )
    );
    setHasUnsavedChanges(true);
  };

  // Función para actualizar configuración de pantalla específica
  const updatePantallaConfig = (field, value) => {
    if (!selectedPantalla) return;

    // VALIDACIONES ESPECÍFICAS
    if (field === "displaySettings.timeWindow") {
      if (value < 2 || value > 12) {
        Swal.fire({
          icon: "warning",
          title: "Valor inválido",
          text: "La ventana de tiempo debe estar entre 2 y 12 horas",
        });
        return;
      }
    }

    if (field === "displaySettings.maxFlights") {
      if (value < 4 || value > 20) {
        Swal.fire({
          icon: "warning",
          title: "Valor inválido",
          text: "El máximo de vuelos debe estar entre 4 y 20",
        });
        return;
      }
    }

    if (field === "displaySettings.refreshInterval") {
      if (value < 60 || value > 600) {
        Swal.fire({
          icon: "warning",
          title: "Valor inválido",
          text: "El intervalo debe estar entre 60 y 600 segundos",
        });
        return;
      }
    }

    // Validar que al menos una opción esté habilitada
    if (
      field === "displaySettings.showDepartures" ||
      field === "displaySettings.showArrivals"
    ) {
      const updatedSettings = { ...selectedPantalla.config.displaySettings };
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        updatedSettings[child] = value;
      }

      if (!updatedSettings.showDepartures && !updatedSettings.showArrivals) {
        Swal.fire({
          icon: "warning",
          title: "Configuración inválida",
          text: "Debe habilitar al menos una opción: Salidas o Llegadas",
        });
        return;
      }
    }

    const updatedConfig = { ...selectedPantalla.config };

    // Manejar campos anidados
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      updatedConfig[parent] = { ...updatedConfig[parent], [child]: value };
    } else {
      updatedConfig[field] = value;
    }

    setSelectedPantalla({
      ...selectedPantalla,
      config: updatedConfig,
    });

    setPantallaSettings({
      ...pantallaSettings,
      [selectedPantalla.id]: updatedConfig,
    });

    setHasUnsavedChanges(true);
  };




  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {t("flightScreens.title")}
      </h1>

      {/* Selector de empresa para admin */}
      {isAdmin && (
        <div className="mb-6 bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("admin.selectCompany")}
              </label>
              <select
                value={empresaSeleccionada}
                onChange={(e) => setEmpresaSeleccionada(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Seleccionar...</option>
                {empresas.map((empresa) => (
                  <option key={empresa} value={empresa}>
                    {empresa}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Pestañas de navegación */}
        <div className="flex flex-wrap border-b border-gray-200">
          <button
            onClick={() => setActiveTab("general")}
            className={`flex-1 min-w-0 py-4 px-2 sm:px-4 text-center font-medium text-xs sm:text-sm md:text-base ${
              activeTab === "general"
                ? "text-blue-600 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t("flightScreens.generalConfig")}
          </button>

          <button
            onClick={() => setActiveTab("screens")}
            className={`flex-1 min-w-0 py-4 px-2 sm:px-4 text-center font-medium text-xs sm:text-sm md:text-base ${
              activeTab === "screens"
                ? "text-blue-600 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t("flightScreens.screens")}
          </button>

          <button
            onClick={() => setActiveTab("messages")}
            className={`flex-1 min-w-0 py-4 px-2 sm:px-4 text-center font-medium text-xs sm:text-sm md:text-base ${
              activeTab === "messages"
                ? "text-blue-600 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <span className="hidden sm:inline">
              {t("flightScreens.dynamicMessages")}
            </span>
            <span className="sm:hidden">Mensajes</span>
          </button>

          {selectedPantalla && (
            <button
              onClick={() => setActiveTab("pantalla")}
              className={`flex-1 min-w-0 py-4 px-2 sm:px-4 text-center font-medium text-xs sm:text-sm md:text-base ${
                activeTab === "pantalla"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="truncate">
                {selectedPantalla.nombre || "Pantalla"}
              </span>
            </button>
          )}
        </div>

        {/* Contenido de las pestañas */}
        <div className="p-6">
          {/* TAB: Configuración General */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                {t("flightScreens.generalConfig")}
              </h2>

              {/* Idioma */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t("flightScreens.language")}
                </label>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="spanish"
                      value="es"
                      checked={selectedLanguage === "es"}
                      onChange={handleLanguageChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label
                      htmlFor="spanish"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      {t("flightScreens.spanish")}
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="english"
                      value="en"
                      checked={selectedLanguage === "en"}
                      onChange={handleLanguageChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label
                      htmlFor="english"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      {t("flightScreens.english")}
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="both"
                      value="es-en"
                      checked={selectedLanguage === "es-en"}
                      onChange={handleLanguageChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label
                      htmlFor="both"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      {t("flightScreens.bilingual")}
                    </label>
                  </div>
                </div>
              </div>

              {/* Configuración Distance Matrix */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-md font-medium text-gray-900 mb-3">
                  {t("flightScreens.distanceConfig")}
                </h3>

                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="enableDistance"
                    checked={distanceConfig.enabled}
                    onChange={(e) => {
                      setDistanceConfig({
                        ...distanceConfig,
                        enabled: e.target.checked,
                      });
                      setHasUnsavedChanges(true);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="enableDistance"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    {t("flightScreens.showTravelTime")}
                  </label>
                </div>

                {distanceConfig.enabled && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("flightScreens.hotelLocation")}
                      </label>
                      
                      {/* Mapa interactivo con buscador */}
                      <div className="space-y-4">
                        {/* Campo de búsqueda */}
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Buscar hotel o dirección..."
                            className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            value={distanceConfig.hotelLocation.address || ''}
                            onChange={(e) => {
                              setDistanceConfig({
                                ...distanceConfig,
                                hotelLocation: {
                                  ...distanceConfig.hotelLocation,
                                  address: e.target.value
                                }
                              });
                              setHasUnsavedChanges(true);
                            }}
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                        </div>

                        {/* Mapa interactivo principal */}
                        <div className="relative">
                          <div className="h-80 bg-gradient-to-br from-blue-50 to-gray-100 rounded-lg border-2 border-dashed border-blue-200 flex items-center justify-center">
                            <div className="text-center p-6">
                              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                              <h3 className="text-lg font-semibold text-gray-700 mb-2">Google Maps</h3>
                              <p className="text-sm text-gray-600 mb-3">Haga clic en el mapa para seleccionar la ubicación exacta</p>
                              <div className="text-xs text-gray-500">
                                O use el buscador arriba para encontrar un lugar específico
                              </div>
                            </div>
                          </div>
                          
                          {/* Overlay con información si ya hay ubicación seleccionada */}
                          {distanceConfig.hotelLocation.lat && distanceConfig.hotelLocation.lng && (
                            <div className="absolute top-4 left-4 right-4">
                              <div className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-green-500">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                  <div className="ml-3 flex-1">
                                    <h4 className="text-sm font-semibold text-green-900">Ubicación Confirmada</h4>
                                    <p className="text-sm text-green-700 truncate">
                                      {distanceConfig.hotelLocation.placeName || distanceConfig.hotelLocation.address || 'Ubicación personalizada'}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setDistanceConfig({
                                        ...distanceConfig,
                                        hotelLocation: { lat: 19.4326, lng: -99.1332, address: '' }
                                      });
                                      setHasUnsavedChanges(true);
                                    }}
                                    className="ml-3 text-green-600 hover:text-green-800 transition-colors"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>


                      {/* Instrucciones simplificadas */}
                      <div className="mt-3 p-3 bg-gray-100 rounded-md">
                        <h4 className="text-xs font-medium text-gray-700 mb-1">💡 Cómo usar:</h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• Use el buscador o haga clic directamente en el mapa</li>
                          <li>• La ubicación se usará para mostrar tiempos de viaje a aeropuertos</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Información de la API */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-md font-medium text-gray-900 mb-2">
                  {t("flightScreens.apiInfo")}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {t("flightScreens.usingAeroDataBox")}
                </p>
                <div className="text-xs text-gray-500">
                  <p>
                    • {t("flightScreens.supportedAirports")}: CDMX (MEX), Toluca
                    (TLC), Felipe Ángeles (NLU)
                  </p>
                  <p>• {t("flightScreens.updateFrequency")}: 2-5 minutos</p>
                  <p>
                    • {t("flightScreens.dataProvided")}: Estados de vuelos,
                    terminales, puertas, horarios
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Pantallas */}
          {activeTab === "screens" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                {t("flightScreens.screenNames")}
              </h2>

              <div className="space-y-6">
                {Array.from({ length: pv }, (_, index) => (
                  <div
                    className="bg-gray-50 p-4 rounded-lg shadow-sm"
                    key={index}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="text-sm font-medium text-gray-700 mr-2">
                            {t("flightScreens.screen")} {index + 1}:
                          </span>
                          <input
                            type="text"
                            placeholder={`Monitor de Vuelos ${index + 1}`}
                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={(nombrePantallasVuelos[index] || "").slice(
                              0,
                              50
                            )}
                            onChange={(e) => {
                              const updatedNombres = [...nombrePantallasVuelos];
                              updatedNombres[index] = e.target.value;
                              setNombrePantallasVuelos(updatedNombres);
                              setHasUnsavedChanges(true);
                            }}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                          {/* Orientación */}
                          <div>
                            <div className="flex items-center">
                              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                                <input
                                  type="checkbox"
                                  name={`toggle-portrait-${index}`}
                                  id={`toggle-portrait-${index}`}
                                  checked={
                                    pantallaSettings[`vuelo${index + 1}`]
                                      ?.orientation === "vertical"
                                  }
                                  onChange={(e) => {
                                    const pantallaId = `vuelo${index + 1}`;
                                    const currentConfig =
                                      pantallaSettings[pantallaId] || {};
                                    const updatedSettings = {
                                      ...pantallaSettings,
                                      [pantallaId]: {
                                        ...currentConfig,
                                        orientation: e.target.checked
                                          ? "vertical"
                                          : "horizontal",
                                      },
                                    };
                                    setPantallaSettings(updatedSettings);
                                    setHasUnsavedChanges(true);
                                  }}
                                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer focus:outline-none"
                                />
                                <label
                                  htmlFor={`toggle-portrait-${index}`}
                                  className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                                ></label>
                              </div>
                              <label
                                htmlFor={`toggle-portrait-${index}`}
                                className="text-xs font-medium text-gray-700"
                              >
                                {t("flightScreens.verticalMode")}
                              </label>
                            </div>

                            {/* Dirección de rotación */}
                            {pantallaSettings[`vuelo${index + 1}`]
                              ?.orientation === "vertical" && (
                              <div className="mt-2 ml-12">
                                <div className="text-xs text-gray-600 mb-1">
                                  {t("flightScreens.rotationDirection")}
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center">
                                    <input
                                      type="radio"
                                      id={`rotation-left-${index}`}
                                      name={`rotation-${index}`}
                                      checked={
                                        pantallaSettings[`vuelo${index + 1}`]
                                          ?.rotationDirection === -90
                                      }
                                      onChange={() => {
                                        const pantallaId = `vuelo${index + 1}`;
                                        const currentConfig =
                                          pantallaSettings[pantallaId] || {};
                                        const updatedSettings = {
                                          ...pantallaSettings,
                                          [pantallaId]: {
                                            ...currentConfig,
                                            rotationDirection: -90,
                                          },
                                        };
                                        setPantallaSettings(updatedSettings);
                                        setHasUnsavedChanges(true);
                                      }}
                                      className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <label
                                      htmlFor={`rotation-left-${index}`}
                                      className="ml-2 block text-xs text-gray-700"
                                    >
                                      90° ({t("flightScreens.left")})
                                    </label>
                                  </div>
                                  <div className="flex items-center">
                                    <input
                                      type="radio"
                                      id={`rotation-right-${index}`}
                                      name={`rotation-${index}`}
                                      checked={
                                        pantallaSettings[`vuelo${index + 1}`]
                                          ?.rotationDirection === 90
                                      }
                                      onChange={() => {
                                        const pantallaId = `vuelo${index + 1}`;
                                        const currentConfig =
                                          pantallaSettings[pantallaId] || {};
                                        const updatedSettings = {
                                          ...pantallaSettings,
                                          [pantallaId]: {
                                            ...currentConfig,
                                            rotationDirection: 90,
                                          },
                                        };
                                        setPantallaSettings(updatedSettings);
                                        setHasUnsavedChanges(true);
                                      }}
                                      className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <label
                                      htmlFor={`rotation-right-${index}`}
                                      className="ml-2 block text-xs text-gray-700"
                                    >
                                      90° ({t("flightScreens.right")})
                                    </label>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <button
                          onClick={() => handleSelectPantalla(index)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          {t("flightScreens.configure")}
                        </button>
                        <span className="text-xs text-gray-500 mt-1">
                          ID: vuelo{index + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {pv === 0 && (
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-600">
                    {t("flightScreens.noScreensLicensed")}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB: Mensajes Dinámicos */}
          {activeTab === "messages" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  {t("flightScreens.dynamicMessages")}
                </h2>
                <button
                  onClick={addDynamicMessage}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  {t("flightScreens.addMessage")}
                </button>
              </div>

              {dynamicMessages.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">
                    {t("flightScreens.noMessages")}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dynamicMessages.map((message, index) => (
                    <div key={message.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-md font-medium text-gray-900">
                          {t("flightScreens.message")} {index + 1}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={message.enabled}
                              onChange={(e) =>
                                updateDynamicMessage(
                                  message.id,
                                  "enabled",
                                  e.target.checked
                                )
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {t("flightScreens.enabled")}
                            </span>
                          </label>
                          <button
                            onClick={() => removeDynamicMessage(message.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            {t("flightScreens.remove")}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("flightScreens.textSpanish")}
                          </label>
                          <textarea
                            value={message.text.es}
                            onChange={(e) =>
                              updateDynamicMessage(message.id, "text", {
                                ...message.text,
                                es: e.target.value,
                              })
                            }
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            rows={2}
                            placeholder="Mensaje en español..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("flightScreens.textEnglish")}
                          </label>
                          <textarea
                            value={message.text.en}
                            onChange={(e) =>
                              updateDynamicMessage(message.id, "text", {
                                ...message.text,
                                en: e.target.value,
                              })
                            }
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            rows={2}
                            placeholder="Message in English..."
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("flightScreens.displayDuration")} (segundos)
                        </label>
                        <input
                          type="number"
                          min="5"
                          max="60"
                          value={message.displayDuration}
                          onChange={(e) =>
                            updateDynamicMessage(
                              message.id,
                              "displayDuration",
                              parseInt(e.target.value)
                            )
                          }
                          className="block w-24 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: Configuración de Pantalla Específica */}
          {activeTab === "pantalla" && selectedPantalla && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  {t("flightScreens.configOf")} &quot;{selectedPantalla.nombre}
                  &quot;
                </h2>
              </div>

              {/* Selección de Aeropuerto por Pantalla */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-900">
                      Aeropuerto para esta pantalla
                    </label>
                    <p className="text-xs text-blue-700">
                      Cada pantalla puede mostrar un aeropuerto diferente
                    </p>
                  </div>
                </div>
                <Select
                  options={availableAirports}
                  value={availableAirports.find(
                    (airport) =>
                      airport.value === selectedPantalla.config.airport?.code
                  )}
                  onChange={(option) =>
                    updatePantallaConfig("airport", {
                      code: option.value,
                      name: option.name,
                    })
                  }
                  placeholder={t("flightScreens.selectAirport")}
                  className="w-full"
                />
                
                {/* Casos de uso sugeridos */}
                <div className="mt-3 p-3 bg-white bg-opacity-60 rounded-md">
                  <h4 className="text-xs font-medium text-blue-800 mb-2">💡 Casos de uso comunes:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-blue-700">
                    <div>• <strong>Lobby principal</strong> → AICM (MEX)</div>
                    <div>• <strong>Área shuttle</strong> → Toluca (TLC)</div>
                    <div>• <strong>Info turística</strong> → Felipe Ángeles (NLU)</div>
                  </div>
                </div>
              </div>

              {/* Configuraciones de Visualización */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-md font-medium text-gray-900 mb-3">
                  {t("flightScreens.displaySettings")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Mostrar Salidas */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showDepartures"
                      checked={
                        selectedPantalla.config.displaySettings
                          ?.showDepartures || false
                      }
                      onChange={(e) =>
                        updatePantallaConfig(
                          "displaySettings.showDepartures",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="showDepartures"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      {t("flightScreens.showDepartures")}
                    </label>
                  </div>

                  {/* Mostrar Llegadas */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showArrivals"
                      checked={
                        selectedPantalla.config.displaySettings?.showArrivals ||
                        false
                      }
                      onChange={(e) =>
                        updatePantallaConfig(
                          "displaySettings.showArrivals",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="showArrivals"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      {t("flightScreens.showArrivals")}
                    </label>
                  </div>

                  {/* Ventana de Tiempo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("flightScreens.timeWindow")} (horas)
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="12"
                      value={
                        selectedPantalla.config.displaySettings?.timeWindow || 5
                      }
                      onChange={(e) =>
                        updatePantallaConfig(
                          "displaySettings.timeWindow",
                          parseInt(e.target.value)
                        )
                      }
                      className="block w-24 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Máximo de Vuelos */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("flightScreens.maxFlights")}
                    </label>
                    <input
                      type="number"
                      min="4"
                      max="20"
                      value={
                        selectedPantalla.config.displaySettings?.maxFlights || 8
                      }
                      onChange={(e) =>
                        updatePantallaConfig(
                          "displaySettings.maxFlights",
                          parseInt(e.target.value)
                        )
                      }
                      className="block w-24 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Intervalo de Actualización */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("flightScreens.refreshInterval")} (segundos)
                    </label>
                    <select
                      value={
                        selectedPantalla.config.displaySettings
                          ?.refreshInterval || 120
                      }
                      onChange={(e) =>
                        updatePantallaConfig(
                          "displaySettings.refreshInterval",
                          parseInt(e.target.value)
                        )
                      }
                      className="block w-32 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={60}>1 minuto</option>
                      <option value={120}>2 minutos</option>
                      <option value={180}>3 minutos</option>
                      <option value={300}>5 minutos</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Filtros de Aerolíneas */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-md font-medium text-gray-900 mb-3">
                  {t("flightScreens.airlineFilters")}
                </h3>

                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="enableFilters"
                    checked={
                      selectedPantalla.config.airlineFilters?.enabled || false
                    }
                    onChange={(e) =>
                      updatePantallaConfig(
                        "airlineFilters.enabled",
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="enableFilters"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    {t("flightScreens.filterByAirlines")}
                  </label>
                </div>

                {selectedPantalla.config.airlineFilters?.enabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("flightScreens.selectAirlines")}
                    </label>
                    <Select
                      isMulti
                      options={availableAirlines.map((airline) => ({
                        value: airline,
                        label: airline,
                      }))}
                      value={(
                        selectedPantalla.config.airlineFilters
                          ?.selectedAirlines || []
                      ).map((airline) => ({ value: airline, label: airline }))}
                      onChange={(selectedOptions) =>
                        updatePantallaConfig(
                          "airlineFilters.selectedAirlines",
                          selectedOptions
                            ? selectedOptions.map((option) => option.value)
                            : []
                        )
                      }
                      placeholder={t("flightScreens.selectAirlinesPlaceholder")}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          {activeTab !== "pantalla" && (
            <div className="mt-8 flex justify-end space-x-3">
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "¿Está seguro que desea restablecer todos los valores?"
                    )
                  ) {
                    // Reset logic here
                    window.location.reload();
                  }
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                {t("flightScreens.reset")}
              </button>
              <button
                onClick={guardarConfiguracion}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                {t("flightScreens.save")}
              </button>
            </div>
          )}

          {/* Botones de acción para pantalla específica */}
          {activeTab === "pantalla" && (
            <div className="mt-8 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setActiveTab("screens");
                  setSelectedPantalla(null);
                  setHasUnsavedChanges(false);
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                {t("flightScreens.cancel")}
              </button>
              <button
                onClick={() => {
                  guardarConfiguracion().then(() => {
                    setActiveTab("screens");
                    setSelectedPantalla(null);
                    setHasUnsavedChanges(false);
                  });
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                {t("flightScreens.saveConfig")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PantallasVuelos;
