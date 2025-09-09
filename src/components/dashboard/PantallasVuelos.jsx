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

  // Estados para funcionalidad de distancia mejorada
  const [isTestingDistance, setIsTestingDistance] = useState(false);
  const [distanceTestResult, setDistanceTestResult] = useState(null);
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);

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

  // Estados adicionales para Google Maps
  const [isMapMode, setIsMapMode] = useState(false);
  const [autocompleteInstance, setAutocompleteInstance] = useState(null);
  const [placesService, setPlacesService] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Función para manejar cambios en el input de ubicación
  const handleLocationInputChange = (e) => {
    const address = e.target.value;
    setDistanceConfig({
      ...distanceConfig,
      hotelLocation: {
        ...distanceConfig.hotelLocation,
        address: address,
      },
    });
    setHasUnsavedChanges(true);

    // Limpiar resultado anterior si se cambia la dirección
    if (distanceTestResult) {
      setDistanceTestResult(null);
    }
  };

  // Función mejorada para inicializar Google Places Autocomplete
  const initializeGooglePlacesAutocomplete = () => {
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
      const input = document.getElementById('hotelLocationInput');
      if (input && !autocompleteInstance) {
        const autocomplete = new google.maps.places.Autocomplete(input, {
          types: ['establishment', 'geocode'],
          componentRestrictions: { country: 'mx' },
          fields: ['place_id', 'geometry', 'name', 'formatted_address', 'types', 'address_components']
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry) {
            setSelectedPlace(place);
            setDistanceConfig({
              ...distanceConfig,
              hotelLocation: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                address: place.formatted_address,
                placeName: place.name,
                placeId: place.place_id
              }
            });
            setHasUnsavedChanges(true);
            
            // Limpiar resultado anterior
            if (distanceTestResult) {
              setDistanceTestResult(null);
            }

            // Mostrar notificación de ubicación encontrada
            console.log('✅ Ubicación seleccionada:', place.name, '-', place.formatted_address);
          } else {
            console.log('❌ No se pudo obtener la ubicación del lugar seleccionado');
          }
        });

        setAutocompleteInstance(autocomplete);
        console.log('✅ Google Places Autocomplete inicializado correctamente');
      }
    } else {
      console.log('⏳ Google Maps API no disponible, reintentando en 1 segundo...');
      setTimeout(initializeGooglePlacesAutocomplete, 1000);
    }
  };

  // Función para manejar el enfoque del input
  const handleLocationInputFocus = () => {
    if (!autocompleteInstance) {
      initializeGooglePlacesAutocomplete();
    }
  };

  // Función para seleccionar ubicación rápida
  const selectQuickLocation = (location) => {
    setDistanceConfig({
      ...distanceConfig,
      hotelLocation: {
        lat: location.coords.lat,
        lng: location.coords.lng,
        address: location.name + ", Ciudad de México",
        placeName: location.name
      }
    });
    setHasUnsavedChanges(true);
    
    // Actualizar el input
    const input = document.getElementById('hotelLocationInput');
    if (input) {
      input.value = location.name + ", Ciudad de México";
    }
    
    // Limpiar resultado anterior
    if (distanceTestResult) {
      setDistanceTestResult(null);
    }
  };

  // Función para probar el cálculo de distancia
  const testDistanceCalculation = async () => {
    if (!distanceConfig.hotelLocation.address) {
      Swal.fire({
        icon: 'warning',
        title: 'Dirección requerida',
        text: 'Por favor ingrese la dirección del hotel primero.',
      });
      return;
    }

    setIsTestingDistance(true);
    setDistanceTestResult(null);

    try {
      // Primero geocodificar la dirección si no tenemos coordenadas precisas
      let coordinates = {
        lat: distanceConfig.hotelLocation.lat,
        lng: distanceConfig.hotelLocation.lng,
      };

      // Si la dirección ha cambiado, geocodificar primero
      if (distanceConfig.hotelLocation.address && 
          distanceConfig.hotelLocation.address !== "Ciudad de México" &&
          distanceConfig.hotelLocation.address.length > 10) {
        
        console.log('🔍 Geocodificando dirección:', distanceConfig.hotelLocation.address);
        
        // Usar servicio de geocoding (Google Maps Geocoding API)
        const geocodeResult = await geocodeAddress(distanceConfig.hotelLocation.address);
        
        if (geocodeResult.success) {
          coordinates = {
            lat: geocodeResult.coordinates.lat,
            lng: geocodeResult.coordinates.lng,
          };

          // Actualizar la configuración con las coordenadas precisas
          setDistanceConfig({
            ...distanceConfig,
            hotelLocation: {
              ...distanceConfig.hotelLocation,
              lat: coordinates.lat,
              lng: coordinates.lng,
              address: geocodeResult.formattedAddress || distanceConfig.hotelLocation.address,
            },
          });
          setHasUnsavedChanges(true);
        }
      }

      // Ahora calcular distancias usando Firebase Functions
      const response = await fetch('/api/calculateMultipleRoutes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hotelLocation: {
            lat: coordinates.lat,
            lng: coordinates.lng,
            address: distanceConfig.hotelLocation.address,
          },
          airportCodes: ['MEX', 'TLC', 'NLU'],
          options: {
            language: 'es',
            mode: 'driving',
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setDistanceTestResult(data);
        Swal.fire({
          icon: 'success',
          title: 'Distancias calculadas',
          text: `Se calcularon exitosamente ${data.summary.successful} de ${data.summary.total} rutas.`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        throw new Error(data.error || 'Error calculando distancias');
      }

    } catch (error) {
      console.error('❌ Error calculando distancia:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error calculando distancias',
        text: 'No se pudieron calcular los tiempos de viaje. Verifique la dirección e intente nuevamente.',
      });
    } finally {
      setIsTestingDistance(false);
    }
  };

  // Función mejorada para geocoding con Google Maps API
  const enhancedGeocode = async (address) => {
    try {
      // Primero intentar con Google Geocoding API si está disponible
      if (typeof google !== 'undefined' && google.maps && google.maps.Geocoder) {
        const geocoder = new google.maps.Geocoder();
        
        return new Promise((resolve) => {
          geocoder.geocode({
            address: address,
            componentRestrictions: { country: 'MX' },
            language: 'es',
            region: 'mx'
          }, (results, status) => {
            if (status === 'OK' && results && results.length > 0) {
              const result = results[0];
              resolve({
                success: true,
                coordinates: {
                  lat: result.geometry.location.lat(),
                  lng: result.geometry.location.lng()
                },
                formattedAddress: result.formatted_address,
                placeId: result.place_id,
                addressComponents: result.address_components
              });
            } else {
              console.log('Google Geocoding falló, usando fallback');
              resolve(geocodeAddressFallback(address));
            }
          });
        });
      }
      
      // Fallback si Google Maps no está disponible
      return geocodeAddressFallback(address);

    } catch (error) {
      console.error('❌ Error en geocoding mejorado:', error);
      return geocodeAddressFallback(address);
    }
  };

  // Función de fallback para geocoding
  const geocodeAddressFallback = (address) => {
    try {
      const mexicoCityCoords = {
        lat: 19.4326,
        lng: -99.1332,
      };

      const knownLocations = {
        'polanco': { lat: 19.4326, lng: -99.1949 },
        'santa fe': { lat: 19.3598, lng: -99.2674 },
        'roma norte': { lat: 19.4147, lng: -99.1635 },
        'roma': { lat: 19.4147, lng: -99.1635 },
        'condesa': { lat: 19.4110, lng: -99.1710 },
        'centro histórico': { lat: 19.4285, lng: -99.1277 },
        'centro': { lat: 19.4285, lng: -99.1277 },
        'aeropuerto': { lat: 19.4363, lng: -99.0721 },
        'insurgentes': { lat: 19.4200, lng: -99.1620 },
        'zona rosa': { lat: 19.4260, lng: -99.1640 },
        'del valle': { lat: 19.3800, lng: -99.1650 },
        'coyoacán': { lat: 19.3467, lng: -99.1618 },
        'san ángel': { lat: 19.3469, lng: -99.1906 },
        'xochimilco': { lat: 19.2570, lng: -99.1030 }
      };

      const addressLower = address.toLowerCase();
      for (const [location, coords] of Object.entries(knownLocations)) {
        if (addressLower.includes(location)) {
          return {
            success: true,
            coordinates: coords,
            formattedAddress: `${location.charAt(0).toUpperCase() + location.slice(1)}, Ciudad de México, CDMX, México`,
          };
        }
      }

      return {
        success: true,
        coordinates: mexicoCityCoords,
        formattedAddress: address + ", Ciudad de México, CDMX, México",
      };

    } catch (error) {
      console.error('Error en fallback geocoding:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  };

  // Función para geocodificar dirección (mantener compatibilidad)
  const geocodeAddress = enhancedGeocode;

  // Función mejorada para calcular distancias con información de tráfico
  const calculateDistancesWithTraffic = async (hotelLocation) => {
    const airports = [
      { code: 'MEX', name: 'AICM', coords: { lat: 19.4363, lng: -99.0721 } },
      { code: 'TLC', name: 'Toluca', coords: { lat: 19.3371, lng: -99.5664 } },
      { code: 'NLU', name: 'Felipe Ángeles', coords: { lat: 19.7411, lng: -99.0186 } }
    ];

    const results = await Promise.all(
      airports.map(async (airport) => {
        try {
          const response = await fetch(`/api/distance-matrix`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              origins: [hotelLocation],
              destinations: [airport.coords],
              mode: 'driving',
              departure_time: 'now', // Para considerar tráfico actual
              traffic_model: 'best_guess',
              language: 'es'
            })
          });

          const data = await response.json();
          
          if (data.rows[0].elements[0].status === 'OK') {
            const element = data.rows[0].elements[0];
            return {
              airport: airport.code,
              airportName: airport.name,
              distance: element.distance.text,
              distanceValue: element.distance.value,
              duration: element.duration.text,
              durationValue: element.duration.value,
              durationInTraffic: element.duration_in_traffic?.text || element.duration.text,
              trafficDelay: element.duration_in_traffic 
                ? (element.duration_in_traffic.value - element.duration.value) / 60 
                : 0,
              trafficConditions: element.duration_in_traffic 
                ? (element.duration_in_traffic.value > element.duration.value * 1.3 ? 'heavy' : 
                   element.duration_in_traffic.value > element.duration.value * 1.1 ? 'moderate' : 'light')
                : 'light'
            };
          }
        } catch (error) {
          console.error(`Error calculando distancia a ${airport.code}:`, error);
          return null;
        }
      })
    );

    return results.filter(result => result !== null);
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
                      
                      {/* Selector de método de ubicación mejorado */}
                      <div className="flex space-x-4 mb-3">
                        <button
                          onClick={() => setIsMapMode(false)}
                          type="button"
                          className={`px-3 py-2 rounded-md text-sm font-medium ${!isMapMode ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                          🔍 Buscar por dirección
                        </button>
                        <button
                          onClick={() => setIsMapMode(true)}
                          type="button"
                          className={`px-3 py-2 rounded-md text-sm font-medium ${isMapMode ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                          📍 Seleccionar en mapa
                        </button>
                      </div>

                      {/* Modo búsqueda mejorado */}
                      {!isMapMode && (
                        <div className="space-y-3">
                          <div className="relative">
                            <input
                              id="hotelLocationInput"
                              type="text"
                              value={distanceConfig.hotelLocation.address}
                              onChange={handleLocationInputChange}
                              onFocus={handleLocationInputFocus}
                              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 pr-10"
                              placeholder="Busque: Hotel Presidente, Polanco, Ciudad de México..."
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                          </div>

                          {/* Ubicaciones sugeridas para hoteles comunes */}
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { name: "Polanco", coords: { lat: 19.4326, lng: -99.1949 } },
                              { name: "Santa Fe", coords: { lat: 19.3598, lng: -99.2674 } },
                              { name: "Centro Histórico", coords: { lat: 19.4285, lng: -99.1277 } },
                              { name: "Roma Norte", coords: { lat: 19.4147, lng: -99.1635 } },
                              { name: "Condesa", coords: { lat: 19.4110, lng: -99.1710 } },
                              { name: "Zona Rosa", coords: { lat: 19.4260, lng: -99.1640 } }
                            ].map(location => (
                              <button
                                key={location.name}
                                type="button"
                                onClick={() => selectQuickLocation(location)}
                                className="p-2 text-sm border rounded-md hover:bg-blue-50 text-left transition-colors"
                              >
                                📍 {location.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Modo mapa */}
                      {isMapMode && (
                        <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center border-2 border-dashed border-gray-300">
                          <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            <p className="text-gray-500 mt-2">Google Maps integration</p>
                            <p className="text-xs text-gray-400 mt-1">Haga clic en el mapa para seleccionar ubicación</p>
                          </div>
                        </div>
                      )}

                      {/* Información de ubicación detectada */}
                      {distanceConfig.hotelLocation.lat && distanceConfig.hotelLocation.lng && (
                        <div className="mt-2 p-3 bg-blue-50 rounded-md">
                          <div className="flex items-start">
                            <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="ml-3">
                              <h4 className="text-sm font-medium text-blue-900">Ubicación confirmada</h4>
                              <p className="text-sm text-blue-700">
                                📍 {distanceConfig.hotelLocation.address}
                              </p>
                              <p className="text-xs text-blue-600 mt-1">
                                Coordenadas: {distanceConfig.hotelLocation.lat.toFixed(6)}, {distanceConfig.hotelLocation.lng.toFixed(6)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Botón para probar cálculo de distancia */}
                      {distanceConfig.hotelLocation.lat && distanceConfig.hotelLocation.lng && (
                        <div className="mt-3">
                          <button
                            onClick={testDistanceCalculation}
                            disabled={isTestingDistance}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                          >
                            {isTestingDistance ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Calculando...
                              </>
                            ) : (
                              <>
                                🗺️ Probar cálculo de distancia
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* Resultados del test de distancia mejorados */}
                      {distanceTestResult && (
                        <div className="mt-4 space-y-3">
                          <h4 className="font-medium text-gray-900 flex items-center">
                            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            🛣️ Tiempos de viaje calculados:
                          </h4>
                          {distanceTestResult.results?.map((result, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border-l-4 border-blue-500">
                              <div className="flex items-center space-x-3">
                                <span className="font-mono text-sm bg-blue-100 px-2 py-1 rounded font-medium">
                                  {result.data.destination.airport}
                                </span>
                                <span className="text-sm text-gray-600">
                                  {result.data.destination.airportName || availableAirports.find(a => a.value === result.data.destination.airport)?.name || 'Aeropuerto'}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">
                                  {result.data.durationInTraffic?.text || result.data.duration.text}
                                  {result.data.durationInTraffic && result.data.trafficConditions && result.data.trafficConditions !== 'light' && (
                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                      result.data.trafficConditions === 'heavy' 
                                        ? 'bg-red-100 text-red-800' 
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {result.data.trafficConditions === 'heavy' ? 'Tráfico intenso' : 'Tráfico moderado'}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                  </svg>
                                  {result.data.distance?.text || 'Calculando distancia...'}
                                  {result.data.trafficDelay && result.data.trafficDelay > 5 && (
                                    <span className="ml-2 text-orange-600">
                                      +{Math.round(result.data.trafficDelay)} min por tráfico
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {/* Resumen de resultados */}
                          <div className="mt-3 p-2 bg-blue-50 rounded-md">
                            <div className="flex items-center text-sm text-blue-700">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Se calcularon exitosamente {distanceTestResult.summary?.successful || distanceTestResult.results?.length || 0} de {distanceTestResult.summary?.total || 3} rutas.
                              <span className="ml-2 text-xs text-blue-600">
                                Incluye condiciones de tráfico en tiempo real
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Instrucciones de ayuda */}
                      <div className="mt-3 p-3 bg-gray-100 rounded-md">
                        <h4 className="text-xs font-medium text-gray-700 mb-1">💡 Consejos:</h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• Incluya el nombre del hotel para mejores resultados</li>
                          <li>• Si no encuentra su ubicación, use la dirección completa</li>
                          <li>• El sistema calculará automáticamente las coordenadas</li>
                          <li>• Los tiempos incluyen consideraciones de tráfico en tiempo real</li>
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

              {/* Selección de Aeropuerto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("flightScreens.airport")}
                </label>
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
