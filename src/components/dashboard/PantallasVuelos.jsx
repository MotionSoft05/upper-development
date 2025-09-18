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
import GoogleMapSelector from "../common/GoogleMapSelector";

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

  // Estados específicos de vuelos
  const [nombrePantallasVuelos, setNombrePantallasVuelos] = useState([]);
  const [pantallaSettings, setPantallaSettings] = useState({});
  const [pv, setPv] = useState(0); // Cantidad de pantallas de vuelos licenciadas

  // Lista de ciudades para el clima (igual que en promociones)
  const [cityOptions, setCityOptions] = useState([
    { value: "Ciudad de México", label: "Ciudad de México, Ciudad de México" },
    { value: "Ecatepec", label: "Ecatepec, Estado de México" },
    { value: "Guadalajara", label: "Guadalajara, Jalisco" },
    { value: "Monterrey", label: "Monterrey, Nuevo León" },
    { value: "Puebla", label: "Puebla, Puebla" },
    { value: "Tijuana", label: "Tijuana, Baja California" },
    { value: "León", label: "León, Guanajuato" },
    { value: "Zapopan", label: "Zapopan, Jalisco" },
    { value: "Ciudad Juárez", label: "Ciudad Juárez, Chihuahua" },
    { value: "Nezahualcóyotl", label: "Nezahualcóyotl, Estado de México" },
    { value: "Mexicali", label: "Mexicali, Baja California" },
    { value: "Mérida", label: "Mérida, Yucatán" },
    { value: "San Luis Potosí", label: "San Luis Potosí, San Luis Potosí" },
    { value: "Querétaro", label: "Querétaro, Querétaro" },
    { value: "Aguascalientes", label: "Aguascalientes, Aguascalientes" },
    { value: "Hermosillo", label: "Hermosillo, Sonora" },
    { value: "Saltillo", label: "Saltillo, Coahuila" },
    { value: "Morelia", label: "Morelia, Michoacán" },
    { value: "Culiacán", label: "Culiacán, Sinaloa" },
    { value: "Chihuahua", label: "Chihuahua, Chihuahua" },
    { value: "Toluca", label: "Toluca, Estado de México" },
    { value: "Cancún", label: "Cancún, Quintana Roo" },
    { value: "Acapulco", label: "Acapulco, Guerrero" },
    { value: "Oaxaca", label: "Oaxaca, Oaxaca" },
  ]);

  // Ordenar alfabéticamente
  cityOptions.sort((a, b) => a.label.localeCompare(b.label));

  const [selectedCity, setSelectedCity] = useState(null);

  // Configuración de aeropuertos disponibles
  const [availableAirports] = useState([
    {
      value: "MEX",
      label: "Ciudad de México (AICM)",
      name: "Aeropuerto Internacional Ciudad de México",
    },
    {
      value: "GDL",
      label: "Guadalajara (GDL)",
      name: "Aeropuerto Internacional de Guadalajara",
    },
    {
      value: "CUN",
      label: "Cancún (CUN)",
      name: "Aeropuerto Internacional de Cancún",
    },
  ]);

  // Configuración de campos disponibles
  const [availableFields] = useState({
    // Campos obligatorios (no se pueden desactivar)
    required: {
      scheduledTime: { label: "Hora", always: true },
      destination: { label: "Origen/Destino", always: true },
      flightNumber: { label: "Vuelo", always: true },
      status: { label: "Estado", always: true },
    },

    // Campos opcionales (configurables por usuario)
    optional: {
      terminal: {
        label: "Terminal",
        description: "Mostrar terminal de salida/llegada",
        defaultEnabled: true,
      },
    },
  });

  // Configuración de Distance Matrix
  const [distanceConfig, setDistanceConfig] = useState({
    enabled: false,
    hotelLocation: {
      lat: 19.42794, // Sheraton María Isabel Hotel
      lng: -99.167127,
      address:
        "Sheraton María Isabel Hotel, Avenida Paseo de la Reforma, Colonia Cuauhtémoc, Mexico City, CDMX, Mexico",
    },
  });

  // useEffect para cargar datos iniciales (siguiendo patrón existente)
  useEffect(() => {
    const obtenerEmpresas = async () => {
      try {
        const usuariosRef = firebase.firestore().collection("usuarios");
        const usuariosSnapshot = await usuariosRef.get();

        const empresasArray = [];
        usuariosSnapshot.forEach((doc) => {
          const empresa = doc.data().empresa;
          if (empresa && !empresasArray.includes(empresa)) {
            empresasArray.push(empresa);
          }
        });

        setEmpresas(empresasArray);
      } catch (error) {
        console.error("Error al obtener empresas:", error);
      }
    };

    obtenerEmpresas();
  }, []);

  // Cargar datos del usuario (siguiendo patrón de PantallasPromociones)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const authUser = firebase.auth().currentUser;

        if (authUser) {
          const usuariosRef = collection(db, "usuarios");
          let usuariosQuery;

          if (empresaSeleccionada) {
            usuariosQuery = query(
              usuariosRef,
              where("empresa", "==", empresaSeleccionada)
            );
          } else {
            usuariosQuery = query(
              usuariosRef,
              where("email", "==", authUser.email)
            );
          }

          const usuariosSnapshot = await getDocs(usuariosQuery);

          if (!usuariosSnapshot.empty) {
            const user = usuariosSnapshot.docs[0].data();
            const numberOfScreens = user.pv || 0;

            const nombresPantallasColeccion = user.nombrePantallasVuelos || [];

            const namesArray = Array.from(
              { length: numberOfScreens },
              (_, index) =>
                nombresPantallasColeccion[index] || `Vuelos ${index + 1}`
            );

            setNombrePantallasVuelos(namesArray);
            setPv(numberOfScreens);
          }
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
      }
    };

    fetchUserData();
  }, [empresaSeleccionada]);

  // Cargar datos de personalización (siguiendo patrón de PantallasPromociones)
  useEffect(() => {
    const cargarDatosPersonalizacion = async () => {
      try {
        const authUser = firebase.auth().currentUser;

        if (authUser) {
          const usuariosRef = collection(db, "usuarios");
          const usuariosQuery = query(
            usuariosRef,
            where("email", "==", authUser.email)
          );

          const usuariosSnapshot = await getDocs(usuariosQuery);
          let empresa = "";

          if (!usuariosSnapshot.empty) {
            empresa = usuariosSnapshot.docs[0].data().empresa || "";
          }

          // Determinar qué empresa usar para cargar datos
          const empresaToUse = empresaSeleccionada || empresa;

          if (empresaToUse) {
            // Buscar configuración en la colección TemplateVuelos
            const templateVuelosRef = collection(db, "TemplateVuelos");
            const templateVuelosQuery = query(
              templateVuelosRef,
              where("empresa", "==", empresaToUse)
            );

            const templateVuelosSnapshot = await getDocs(templateVuelosQuery);

            if (!templateVuelosSnapshot.empty) {
              const templateVuelosData = templateVuelosSnapshot.docs[0].data();

              // Cargar configuración básica
              setSelectedLanguage(templateVuelosData.idioma || "es");
              setPantallaSettings(templateVuelosData.pantallasConfig || {});

              // Cargar ciudad seleccionada para el clima
              if (templateVuelosData.selectedCity) {
                setSelectedCity(templateVuelosData.selectedCity);
              }

              // Cargar configuración Distance Matrix
              const loadedDistanceConfig =
                templateVuelosData.distanceConfig || {};
              setDistanceConfig({
                enabled: loadedDistanceConfig.enabled || false,
                hotelLocation: {
                  lat: loadedDistanceConfig.hotelLocation?.lat || null,
                  lng: loadedDistanceConfig.hotelLocation?.lng || null,
                  address: loadedDistanceConfig.hotelLocation?.address || "",
                },
              });
            }
          }
        }
      } catch (error) {
        console.error("Error al cargar datos de personalización:", error);
      }
    };

    cargarDatosPersonalizacion();
  }, [empresaSeleccionada]);

  const usuarioAutorizado =
    firebase.auth().currentUser &&
    [
      "uppermex10@gmail.com",
      "ulises.jacobo@hotmail.com",
      "contacto@upperds.mx",
    ].includes(firebase.auth().currentUser.email);

  // Función para manejar cambios de configuración general
  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleCityChange = (selectedOption) => {
    setSelectedCity(selectedOption);
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
        language: selectedLanguage,
      },

      // NUEVA SECCIÓN: Configuración de campos
      displayFields: {
        // Campos opcionales habilitados (los required siempre están activos)
        terminal: true,
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
      displayFields: {
        ...defaultConfig.displayFields,
        ...pantallaSettings[pantallaId]?.displayFields,
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

  // Función para guardar configuración (siguiendo patrón exacto de PantallasPromociones)
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

      // Obtener empresa del usuario autenticado
      const usuariosQuery = query(
        collection(db, "usuarios"),
        where("email", "==", authUser.email)
      );
      const usuariosSnapshot = await getDocs(usuariosQuery);
      let empresa = "";

      if (!usuariosSnapshot.empty) {
        empresa = usuariosSnapshot.docs[0].data().empresa || "";
      }

      // Determinar qué empresa usar para guardar datos
      const empresaToUse = empresaSeleccionada || empresa;

      if (empresaToUse) {
        // 1. ACTUALIZAR NOMBRES EN USUARIOS
        const usuariosRef = collection(db, "usuarios");
        const usuariosEmpresaQuery = query(
          usuariosRef,
          where("empresa", "==", empresaToUse)
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

        // 2. GUARDAR EN TEMPLATE VUELOS
        const templateVuelosRef = collection(db, "TemplateVuelos");
        const templateVuelosQuery = query(
          templateVuelosRef,
          where("empresa", "==", empresaToUse)
        );
        const templateVuelosSnapshot = await getDocs(templateVuelosQuery);

        const templateData = {
          empresa: empresaToUse,
          idioma: selectedLanguage,
          pantallasConfig: pantallaSettings,
          selectedCity: selectedCity,
          distanceConfig: distanceConfig,
          updatedAt: serverTimestamp(),
          updatedBy: authUser.email || "",
        };

        if (!templateVuelosSnapshot.empty) {
          // Actualizar documento existente
          const templateVuelosDocRef = templateVuelosSnapshot.docs[0].ref;
          await updateDoc(templateVuelosDocRef, templateData);
        } else {
          // Crear nuevo documento
          await addDoc(templateVuelosRef, templateData);
        }

        // 3. ACTUALIZAR SISTEMA DISTANCE MATRIX (opcional)
        if (
          distanceConfig.enabled &&
          distanceConfig.hotelLocation.lat &&
          distanceConfig.hotelLocation.lng
        ) {
          try {
            console.log(
              `🗺️ Actualizando configuración de distancias para hotel: ${empresaToUse}`
            );

            const response = await fetch(
              "https://updatehotelairportusage-wsvcv36oca-uc.a.run.app",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  companyId: empresaToUse,
                  hotelLocation: distanceConfig.hotelLocation,
                }),
              }
            );

            if (response.ok) {
              const result = await response.json();
              console.log(`✅ Sistema de distancias actualizado:`, result);
            } else {
              console.warn(
                `⚠️ No se pudo actualizar sistema de distancias: ${response.status}`
              );
            }
          } catch (error) {
            console.error(
              "❌ Error actualizando sistema de distancias:",
              error
            );
            // No fallar la operación completa si esto falla
          }
        }
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

  // Función para actualizar configuración de pantalla específica
  const updatePantallaConfig = (field, value) => {
    if (!selectedPantalla) return;

    // VALIDACIONES ESPECÍFICAS
    if (field === "displaySettings.timeWindow") {
      if (value < 2 || value > 10) {
        Swal.fire({
          icon: "warning",
          title: "Valor inválido",
          text: "La ventana de tiempo debe estar entre 2 y 10 horas",
        });
        return;
      }
    }

    if (field === "displaySettings.maxFlights") {
      // Límites dinámicos según si muestra salidas, llegadas o ambos
      const currentSettings = selectedPantalla.config.displaySettings;
      const showsBoth =
        currentSettings?.showDepartures && currentSettings?.showArrivals;
      const maxLimit = showsBoth ? 11 : 20; // Menos vuelos si muestra ambos tipos

      if (value < 4 || value > maxLimit) {
        Swal.fire({
          icon: "warning",
          title: "Valor inválido",
          text: `El máximo de vuelos debe estar entre 4 y ${maxLimit}${
            showsBoth ? " (reducido porque muestra salidas y llegadas)" : ""
          }`,
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
    <div className="px-4 sm:px-6 lg:px-8 py-6 bg-gray-50 min-h-screen">
      {/* Cabecera con título y descripción */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {t("flightScreens.title")}
          </h1>
        </div>

        {/* Selector de empresa para usuarios autorizados */}
        {usuarioAutorizado && (
          <div className="max-w-3xl mx-auto mb-6 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <label
                htmlFor="empresa"
                className="text-gray-700 font-medium mb-2 sm:mb-0"
              >
                Empresa:
              </label>
              <div className="w-full sm:w-2/3">
                <select
                  id="empresa"
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

                {/* Ciudad para el clima */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("flightScreens.weatherCity")}
                  </label>
                  <Select
                    options={cityOptions}
                    value={selectedCity}
                    onChange={handleCityChange}
                    placeholder="Seleccione una ciudad para mostrar el clima"
                    className="w-full"
                    isSearchable
                    isClearable={true}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {t("flightScreens.weatherCityDescription")}
                  </p>
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

                        {/* Mapa interactivo con GoogleMapSelector */}
                        <div className="relative">
                          <GoogleMapSelector
                            location={{
                              lat: distanceConfig.hotelLocation.lat,
                              lng: distanceConfig.hotelLocation.lng,
                              address: distanceConfig.hotelLocation.address,
                            }}
                            onLocationChange={(coords) => {
                              setDistanceConfig((prevConfig) => ({
                                ...prevConfig,
                                hotelLocation: {
                                  ...prevConfig.hotelLocation,
                                  lat: coords.lat,
                                  lng: coords.lng,
                                  // Preservamos la dirección existente
                                },
                              }));
                              setHasUnsavedChanges(true);
                            }}
                            onAddressChange={(address) => {
                              setDistanceConfig((prevConfig) => ({
                                ...prevConfig,
                                hotelLocation: {
                                  ...prevConfig.hotelLocation,
                                  address: address,
                                },
                              }));
                              setHasUnsavedChanges(true);
                            }}
                            onConfirmAddress={async () => {
                              if (
                                !distanceConfig.hotelLocation.lat ||
                                !distanceConfig.hotelLocation.lng
                              ) {
                                Swal.fire({
                                  icon: "warning",
                                  title: "Ubicación requerida",
                                  text: "Por favor selecciona una ubicación en el mapa primero",
                                });
                                return;
                              }

                              try {
                                console.log(
                                  "🔄 Intentando guardar configuración...",
                                  distanceConfig
                                );
                                await guardarConfiguracion();
                                Swal.fire({
                                  icon: "success",
                                  title: "Ubicación guardada",
                                  text: "La ubicación del hotel se ha guardado correctamente",
                                  showConfirmButton: false,
                                  timer: 2000,
                                });
                              } catch (error) {
                                console.error(
                                  "❌ Error detallado al guardar:",
                                  error
                                );
                                Swal.fire({
                                  icon: "error",
                                  title: "Error al guardar",
                                  text: `Error: ${error.message || error}`,
                                  showConfirmButton: true,
                                });
                              }
                            }}
                            height="320px"
                            placeholder="Buscar hotel o dirección..."
                          />
                        </div>

                        {/* Estado de la ubicación */}
                        <div className="mt-3 text-sm text-gray-600">
                          {distanceConfig.hotelLocation.address && (
                            <span>
                              📍 Ubicación guardada:{" "}
                              {distanceConfig.hotelLocation.address}
                            </span>
                          )}
                          {!distanceConfig.hotelLocation.address && (
                            <span>📍 No hay ubicación guardada</span>
                          )}
                        </div>

                        {/* Instrucciones simplificadas */}
                        <div className="mt-3 p-3 bg-gray-100 rounded-md">
                          <h4 className="text-xs font-medium text-gray-700 mb-1">
                            💡 Cómo usar:
                          </h4>
                          <ul className="text-xs text-gray-600 space-y-1">
                            <li>
                              • Use el buscador o haga clic directamente en el
                              mapa
                            </li>
                            <li>
                              • La ubicación se usará para mostrar tiempos de
                              viaje a aeropuertos
                            </li>
                            <li>
                              •{" "}
                              <strong>
                                Presiona &quot;Confirmar Dirección&quot;
                              </strong>{" "}
                              para guardar la dirección
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
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
                                const updatedNombres = [
                                  ...nombrePantallasVuelos,
                                ];
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
                                <div className="relative inline-block mr-3">
                                  <input
                                    type="checkbox"
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
                                    className="sr-only"
                                  />
                                  <label
                                    htmlFor={`toggle-portrait-${index}`}
                                    className={`
                                    relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                    ${
                                      pantallaSettings[`vuelo${index + 1}`]
                                        ?.orientation === "vertical"
                                        ? "bg-blue-600"
                                        : "bg-gray-200"
                                    }
                                  `}
                                  >
                                    <span
                                      className={`
                                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out
                                      ${
                                        pantallaSettings[`vuelo${index + 1}`]
                                          ?.orientation === "vertical"
                                          ? "translate-x-6"
                                          : "translate-x-1"
                                      }
                                    `}
                                    />
                                  </label>
                                </div>
                                <label
                                  htmlFor={`toggle-portrait-${index}`}
                                  className="text-xs font-medium text-gray-700 cursor-pointer"
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
                                          const pantallaId = `vuelo${
                                            index + 1
                                          }`;
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
                                          const pantallaId = `vuelo${
                                            index + 1
                                          }`;
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

            {/* TAB: Configuración de Pantalla Específica */}
            {activeTab === "pantalla" && selectedPantalla && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b pb-2">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {t("flightScreens.configOf")} &quot;
                    {selectedPantalla.nombre}
                    &quot;
                  </h2>
                </div>

                {/* Selección de Aeropuerto por Pantalla */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
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
                          selectedPantalla.config.displaySettings
                            ?.showArrivals || false
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
                        max="10"
                        value={
                          selectedPantalla.config.displaySettings?.timeWindow ||
                          5
                        }
                        onChange={(e) =>
                          updatePantallaConfig(
                            "displaySettings.timeWindow",
                            parseInt(e.target.value)
                          )
                        }
                        className="block w-24 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Filtro frontend - máximo 10 horas de vuelos
                      </p>
                    </div>

                    {/* Máximo de Vuelos */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("flightScreens.maxFlights")}
                        {(() => {
                          const showsBoth =
                            selectedPantalla.config.displaySettings
                              ?.showDepartures &&
                            selectedPantalla.config.displaySettings
                              ?.showArrivals;
                          return showsBoth ? " (máx. 11)" : " (máx. 20)";
                        })()}
                      </label>
                      <input
                        type="number"
                        min="4"
                        max={(() => {
                          const showsBoth =
                            selectedPantalla.config.displaySettings
                              ?.showDepartures &&
                            selectedPantalla.config.displaySettings
                              ?.showArrivals;
                          return showsBoth ? 11 : 20;
                        })()}
                        value={
                          selectedPantalla.config.displaySettings?.maxFlights ||
                          8
                        }
                        onChange={(e) =>
                          updatePantallaConfig(
                            "displaySettings.maxFlights",
                            parseInt(e.target.value)
                          )
                        }
                        className="block w-24 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Vuelos por página para paginación
                      </p>
                      {(() => {
                        const showsBoth =
                          selectedPantalla.config.displaySettings
                            ?.showDepartures &&
                          selectedPantalla.config.displaySettings?.showArrivals;
                        if (showsBoth) {
                          return (
                            <p className="text-xs text-amber-600 mt-1">
                              Límite reducido porque muestra salidas y llegadas
                            </p>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                </div>

                {/* Configuración de Campos Visibles */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-md font-medium text-gray-900 mb-3">
                    Configuración de Información Mostrada
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Seleccione qué información desea mostrar en esta pantalla.
                    Los campos obligatorios siempre serán visibles.
                  </p>

                  {/* Campos obligatorios (solo informativo) */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-800 mb-3">
                      Campos Obligatorios (Siempre Visibles)
                    </h4>
                    <div className="bg-white rounded-lg p-3 border">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Object.entries(availableFields.required).map(
                          ([key, field]) => (
                            <div
                              key={key}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                checked={true}
                                disabled={true}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded opacity-50"
                              />
                              <span className="text-sm text-gray-600">
                                {field.label}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Campos opcionales (configurables) */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">
                      Campos Opcionales (Configurables)
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(availableFields.optional).map(
                        ([key, field]) => (
                          <div
                            key={key}
                            className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg"
                          >
                            <input
                              type="checkbox"
                              id={`field-${key}`}
                              checked={
                                selectedPantalla.config.displayFields?.[key] ??
                                field.defaultEnabled
                              }
                              onChange={(e) => {
                                updatePantallaConfig(
                                  `displayFields.${key}`,
                                  e.target.checked
                                );
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                            />
                            <div className="flex-1">
                              <label
                                htmlFor={`field-${key}`}
                                className="block text-sm font-medium text-gray-700 cursor-pointer"
                              >
                                {field.label}
                              </label>
                              <p className="text-xs text-gray-500 mt-1">
                                {field.description}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Botón para restaurar defaults de campos */}
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => {
                        const defaultDisplayFields = {
                          terminal: true,
                        };
                        updatePantallaConfig(
                          "displayFields",
                          defaultDisplayFields
                        );
                      }}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Restaurar Campos por Defecto
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            {activeTab !== "pantalla" && (
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={async () => {
                    const result = await Swal.fire({
                      title: "Restablecer Configuración",
                      text: "¿Está seguro que desea restablecer toda la configuración a los valores por defecto?",
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonColor: "#d33",
                      cancelButtonColor: "#3085d6",
                      confirmButtonText: "Sí, restablecer",
                      cancelButtonText: "Cancelar",
                    });

                    if (result.isConfirmed) {
                      // Reset logic
                      setSelectedLanguage("es");
                      setSelectedCity(null);
                      setPantallaSettings({});
                      setDynamicMessages([
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
                      setDistanceConfig({
                        enabled: false,
                        hotelLocation: {
                          lat: null,
                          lng: null,
                          address: "",
                        },
                      });
                      setHasUnsavedChanges(true);

                      Swal.fire({
                        title: "Configuración restablecida",
                        text: "No olvide guardar los cambios",
                        icon: "success",
                        timer: 2000,
                      });
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
    </div>
  );
}

export default PantallasVuelos;
