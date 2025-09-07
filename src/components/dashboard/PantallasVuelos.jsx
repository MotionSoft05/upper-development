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
    { value: "MEX", label: "Ciudad de México (AICM)", name: "Aeropuerto Internacional Ciudad de México" },
    { value: "TLC", label: "Toluca", name: "Aeropuerto Internacional de Toluca" },
    { value: "NLU", label: "Felipe Ángeles", name: "Aeropuerto Internacional Felipe Ángeles" }
  ]);

  // Aerolíneas disponibles para filtros
  const [availableAirlines] = useState([
    "Aeromexico", "Volaris", "VivaAerobus", "Interjet", "Copa Airlines",
    "American Airlines", "Delta Air Lines", "United Airlines", "Air France",
    "Lufthansa", "KLM", "British Airways"
  ]);

  // Mensajes dinámicos
  const [dynamicMessages, setDynamicMessages] = useState([
    {
      id: "shuttle",
      text: {
        es: "🚐 Shuttle al aeropuerto cada hora - Contacte Concierge",
        en: "🚐 Airport shuttle every hour - Contact Concierge"
      },
      enabled: true,
      displayDuration: 10
    }
  ]);

  // Configuración de Distance Matrix
  const [distanceConfig, setDistanceConfig] = useState({
    enabled: false,
    hotelLocation: {
      lat: 19.4326, // CDMX centro por defecto
      lng: -99.1332,
      address: ""
    }
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
      usuariosSnapshot.forEach(doc => {
        const empresa = doc.data().empresa;
        if (empresa) empresasSet.add(empresa);
      });
      setEmpresas(Array.from(empresasSet));
    } catch (error) {
      console.error("Error loading empresas:", error);
    }
  };

  // Función para cargar configuración de pantallas de vuelos
  const loadFlightScreensConfig = async () => {
    try {
      const authUser = firebase.auth().currentUser;
      let empresa = empresaSeleccionada;

      if (!empresa && !isAdmin) {
        const usuariosQuery = query(
          collection(db, "usuarios"),
          where("email", "==", authUser.email)
        );
        const usuariosSnapshot = await getDocs(usuariosQuery);
        if (!usuariosSnapshot.empty) {
          empresa = usuariosSnapshot.docs[0].data().empresa || "";
        }
      }

      if (!empresa) return;

      // Cargar licencias desde la colección usuarios
      const usuariosQuery = query(
        collection(db, "usuarios"),
        where("empresa", "==", empresa)
      );
      const usuariosSnapshot = await getDocs(usuariosQuery);
      
      if (!usuariosSnapshot.empty) {
        // Obtener el primer usuario de la empresa para obtener las licencias
        const usuarioData = usuariosSnapshot.docs[0].data();
        setPv(parseInt(usuarioData.pv) || 0);
      }

      // Cargar configuración existente
      const configDoc = doc(db, "flightScreens", empresa);
      const configSnapshot = await getDoc(configDoc);
      
      if (configSnapshot.exists()) {
        const data = configSnapshot.data();
        setNombrePantallasVuelos(data.screenNames || []);
        setPantallaSettings(data.screenSettings || {});
        setSelectedLanguage(data.language || "es");
        setDynamicMessages(data.dynamicMessages || dynamicMessages);
        setDistanceConfig(data.distanceConfig || distanceConfig);
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

    // Configuración por defecto
    let config = pantallaSettings[pantallaId] || {
      airport: {
        code: "MEX",
        name: "Aeropuerto Internacional Ciudad de México"
      },
      displaySettings: {
        showDepartures: true,
        showArrivals: true,
        timeWindow: 5,
        maxFlights: 8,
        refreshInterval: 120,
        language: selectedLanguage
      },
      airlineFilters: {
        enabled: false,
        selectedAirlines: []
      },
      orientation: "horizontal",
      rotationDirection: 0
    };

    setSelectedPantalla({
      id: pantallaId,
      index: pantallaIndex,
      nombre: pantallaNombre,
      config: config,
    });

    setActiveTab("pantalla");
  };

  // Función para guardar configuración
  const guardarConfiguracion = async () => {
    try {
      const authUser = firebase.auth().currentUser;
      if (!authUser) {
        Swal.fire({
          icon: "error",
          title: "Usuario no autenticado",
        });
        return;
      }

      if (pv === 0) {
        Swal.fire({
          icon: "error",
          title: "No hay licencias activas para pantallas de vuelos",
        });
        return;
      }

      let empresa = empresaSeleccionada;
      if (!empresa && !isAdmin) {
        const usuariosQuery = query(
          collection(db, "usuarios"),
          where("email", "==", authUser.email)
        );
        const usuariosSnapshot = await getDocs(usuariosQuery);
        if (!usuariosSnapshot.empty) {
          empresa = usuariosSnapshot.docs[0].data().empresa || "";
        }
      }

      if (!empresa) {
        Swal.fire({
          icon: "error",
          title: "No se pudo determinar la empresa",
        });
        return;
      }

      // Preparar datos para guardar
      const configData = {
        screenNames: nombrePantallasVuelos,
        screenSettings: pantallaSettings,
        language: selectedLanguage,
        dynamicMessages: dynamicMessages,
        distanceConfig: distanceConfig,
        updatedAt: serverTimestamp(),
        updatedBy: authUser.email,
      };

      // Guardar en Firebase
      const configRef = doc(db, "flightScreens", empresa);
      await setDoc(configRef, configData, { merge: true });

      Swal.fire({
        icon: "success",
        title: "Configuración guardada correctamente",
        showConfirmButton: false,
        timer: 1500,
      });

      setHasUnsavedChanges(false);

    } catch (error) {
      console.error("Error saving configuration:", error);
      Swal.fire({
        icon: "error",
        title: "Error al guardar la configuración",
        text: error.message,
      });
    }
  };

  // Función para agregar/quitar mensajes dinámicos
  const handleAddDynamicMessage = () => {
    const newMessage = {
      id: `message_${Date.now()}`,
      text: {
        es: "",
        en: ""
      },
      enabled: true,
      displayDuration: 10
    };
    setDynamicMessages([...dynamicMessages, newMessage]);
    setHasUnsavedChanges(true);
  };

  const handleRemoveDynamicMessage = (messageId) => {
    setDynamicMessages(dynamicMessages.filter(msg => msg.id !== messageId));
    setHasUnsavedChanges(true);
  };

  const handleUpdateDynamicMessage = (messageId, field, value) => {
    setDynamicMessages(dynamicMessages.map(msg => 
      msg.id === messageId 
        ? { ...msg, [field]: value }
        : msg
    ));
    setHasUnsavedChanges(true);
  };

  // Función para actualizar configuración de pantalla específica
  const updatePantallaConfig = (field, value) => {
    if (!selectedPantalla) return;

    const updatedConfig = { ...selectedPantalla.config };
    
    // Manejar campos anidados
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
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
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("general")}
            className={`flex-1 py-4 px-4 text-center font-medium text-sm sm:text-base ${
              activeTab === "general"
                ? "text-blue-600 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t("flightScreens.generalConfig")}
          </button>

          <button
            onClick={() => setActiveTab("screens")}
            className={`flex-1 py-4 px-4 text-center font-medium text-sm sm:text-base ${
              activeTab === "screens"
                ? "text-blue-600 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t("flightScreens.screens")}
          </button>

          <button
            onClick={() => setActiveTab("messages")}
            className={`flex-1 py-4 px-4 text-center font-medium text-sm sm:text-base ${
              activeTab === "messages"
                ? "text-blue-600 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t("flightScreens.dynamicMessages")}
          </button>

          {selectedPantalla && (
            <button
              onClick={() => setActiveTab("pantalla")}
              className={`flex-1 py-4 px-4 text-center font-medium text-sm sm:text-base ${
                activeTab === "pantalla"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {selectedPantalla.nombre}
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
                    <label htmlFor="spanish" className="ml-2 block text-sm text-gray-700">
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
                    <label htmlFor="english" className="ml-2 block text-sm text-gray-700">
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
                    <label htmlFor="both" className="ml-2 block text-sm text-gray-700">
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
                        enabled: e.target.checked
                      });
                      setHasUnsavedChanges(true);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enableDistance" className="ml-2 block text-sm text-gray-700">
                    {t("flightScreens.showTravelTime")}
                  </label>
                </div>

                {distanceConfig.enabled && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("flightScreens.hotelAddress")}
                      </label>
                      <input
                        type="text"
                        value={distanceConfig.hotelLocation.address}
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
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ingrese la dirección del hotel"
                      />
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
                  <p>• {t("flightScreens.supportedAirports")}: CDMX (MEX), Toluca (TLC), Felipe Ángeles (NLU)</p>
                  <p>• {t("flightScreens.updateFrequency")}: 2-5 minutos</p>
                  <p>• {t("flightScreens.dataProvided")}: Estados de vuelos, terminales, puertas, horarios</p>
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
                  <div className="bg-gray-50 p-4 rounded-lg shadow-sm" key={index}>
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
                            value={(nombrePantallasVuelos[index] || "").slice(0, 50)}
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
                                  checked={pantallaSettings[`vuelo${index + 1}`]?.orientation === "vertical"}
                                  onChange={(e) => {
                                    const pantallaId = `vuelo${index + 1}`;
                                    const currentConfig = pantallaSettings[pantallaId] || {};
                                    const updatedSettings = {
                                      ...pantallaSettings,
                                      [pantallaId]: {
                                        ...currentConfig,
                                        orientation: e.target.checked ? "vertical" : "horizontal"
                                      }
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
                            {pantallaSettings[`vuelo${index + 1}`]?.orientation === "vertical" && (
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
                                      checked={pantallaSettings[`vuelo${index + 1}`]?.rotationDirection === -90}
                                      onChange={() => {
                                        const pantallaId = `vuelo${index + 1}`;
                                        const currentConfig = pantallaSettings[pantallaId] || {};
                                        const updatedSettings = {
                                          ...pantallaSettings,
                                          [pantallaId]: {
                                            ...currentConfig,
                                            rotationDirection: -90
                                          }
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
                                      checked={pantallaSettings[`vuelo${index + 1}`]?.rotationDirection === 90}
                                      onChange={() => {
                                        const pantallaId = `vuelo${index + 1}`;
                                        const currentConfig = pantallaSettings[pantallaId] || {};
                                        const updatedSettings = {
                                          ...pantallaSettings,
                                          [pantallaId]: {
                                            ...currentConfig,
                                            rotationDirection: 90
                                          }
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
                  onClick={handleAddDynamicMessage}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  {t("flightScreens.addMessage")}
                </button>
              </div>

              <div className="space-y-4">
                {dynamicMessages.map((message, index) => (
                  <div key={message.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-900">
                        {t("flightScreens.message")} {index + 1}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={message.enabled}
                          onChange={(e) => handleUpdateDynamicMessage(message.id, 'enabled', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-xs text-gray-600">{t("flightScreens.enabled")}</span>
                        <button
                          onClick={() => handleRemoveDynamicMessage(message.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          {t("flightScreens.remove")}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          {t("flightScreens.textSpanish")}
                        </label>
                        <input
                          type="text"
                          value={message.text.es}
                          onChange={(e) => handleUpdateDynamicMessage(message.id, 'text', { ...message.text, es: e.target.value })}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="Mensaje en español"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          {t("flightScreens.textEnglish")}
                        </label>
                        <input
                          type="text"
                          value={message.text.en}
                          onChange={(e) => handleUpdateDynamicMessage(message.id, 'text', { ...message.text, en: e.target.value })}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="Message in English"
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {t("flightScreens.displayDuration")} (segundos)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="60"
                        value={message.displayDuration}
                        onChange={(e) => handleUpdateDynamicMessage(message.id, 'displayDuration', parseInt(e.target.value))}
                        className="block w-24 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {dynamicMessages.length === 0 && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">
                    {t("flightScreens.noMessages")}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB: Configuración de Pantalla Específica */}
          {activeTab === "pantalla" && selectedPantalla && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  {t("flightScreens.configOf")} "{selectedPantalla.nombre}"
                </h2>
              </div>

              {/* Selección de Aeropuerto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("flightScreens.airport")}
                </label>
                <Select
                  options={availableAirports}
                  value={availableAirports.find(airport => 
                    airport.value === selectedPantalla.config.airport.code
                  )}
                  onChange={(option) => updatePantallaConfig('airport', {
                    code: option.value,
                    name: option.name
                  })}
                  placeholder={t("flightScreens.selectAirport")}
                  className="w-full"
                />
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
                      checked={selectedPantalla.config.displaySettings.showDepartures}
                      onChange={(e) => updatePantallaConfig('displaySettings.showDepartures', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="showDepartures" className="ml-2 block text-sm text-gray-700">
                      {t("flightScreens.showDepartures")}
                    </label>
                  </div>

                  {/* Mostrar Llegadas */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showArrivals"
                      checked={selectedPantalla.config.displaySettings.showArrivals}
                      onChange={(e) => updatePantallaConfig('displaySettings.showArrivals', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="showArrivals" className="ml-2 block text-sm text-gray-700">
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
                      value={selectedPantalla.config.displaySettings.timeWindow}
                      onChange={(e) => updatePantallaConfig('displaySettings.timeWindow', parseInt(e.target.value))}
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
                      value={selectedPantalla.config.displaySettings.maxFlights}
                      onChange={(e) => updatePantallaConfig('displaySettings.maxFlights', parseInt(e.target.value))}
                      className="block w-24 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Intervalo de Actualización */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("flightScreens.refreshInterval")} (segundos)
                    </label>
                    <select
                      value={selectedPantalla.config.displaySettings.refreshInterval}
                      onChange={(e) => updatePantallaConfig('displaySettings.refreshInterval', parseInt(e.target.value))}
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
                    checked={selectedPantalla.config.airlineFilters.enabled}
                    onChange={(e) => updatePantallaConfig('airlineFilters.enabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enableFilters" className="ml-2 block text-sm text-gray-700">
                    {t("flightScreens.filterByAirlines")}
                  </label>
                </div>

                {selectedPantalla.config.airlineFilters.enabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("flightScreens.selectAirlines")}
                    </label>
                    <Select
                      isMulti
                      options={availableAirlines.map(airline => ({ value: airline, label: airline }))}
                      value={selectedPantalla.config.airlineFilters.selectedAirlines.map(airline => ({ value: airline, label: airline }))}
                      onChange={(selectedOptions) => updatePantallaConfig('airlineFilters.selectedAirlines', 
                        selectedOptions ? selectedOptions.map(option => option.value) : []
                      )}
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
                  if (window.confirm("¿Está seguro que desea restablecer todos los valores?")) {
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