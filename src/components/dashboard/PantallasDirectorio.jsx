/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import { ChromePicker } from "react-color";
import Select from "react-select";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import Swal from "sweetalert2";
import {
  collection,
  onSnapshot,
  where,
  query,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes, getStorage } from "firebase/storage";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { firebaseConfig } from "@/firebase/firebaseConfig";
import { fetchWeatherData } from "@/utils/weatherUtils";

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const storage = getStorage();

function PantallasDirectorio() {
  const isProduction = process.env.NEXT_PUBLIC_PRODUCTION; // Deploy (.html) o en localhost()

  const { t } = useTranslation(); // Traduccion con i18N
  const [nombrePantallasDirectorio, setNombrePantallasDirectorio] = useState(
    []
  );
  const [pantallaSettings, setPantallaSettings] = useState([]); // Array para guardar configuración por pantalla
  const [pd, setPd] = useState(0);
  const [templateColor, setTemplateColor] = useState("#D1D5DB");
  const [fontColor, setFontColor] = useState("#000000");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontColorPicker, setShowFontColorPicker] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(obtenerHora());
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [selectedPublicidad, setSelectedPublicidad] = useState(null);
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("es");
  const [selectedTemplate, setSelectedTemplate] = useState("template1");
  const [rotationDirections, setRotationDirections] = useState([]); // Array para guardar la dirección de rotación por pantalla

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
    { value: "Reynosa", label: "Reynosa, Tamaulipas" },
    { value: "Tuxtla Gutiérrez", label: "Tuxtla Gutiérrez, Chiapas" },
    { value: "Villahermosa", label: "Villahermosa, Tabasco" },
    { value: "Xalapa", label: "Xalapa, Veracruz" },
    { value: "Coatzacoalcos", label: "Coatzacoalcos, Veracruz" },
    { value: "Celaya", label: "Celaya, Guanajuato" },
    { value: "Irapuato", label: "Irapuato, Guanajuato" },
    { value: "Ensenada", label: "Ensenada, Baja California" },
    { value: "Tepic", label: "Tepic, Nayarit" },
    { value: "La Paz", label: "La Paz, Baja California Sur" },
    { value: "Los Cabos", label: "Los Cabos, Baja California Sur" },
    { value: "Matamoros", label: "Matamoros, Tamaulipas" },
    { value: "Nuevo Laredo", label: "Nuevo Laredo, Tamaulipas" },
    { value: "Tlalnepantla", label: "Tlalnepantla, Estado de México" },
    { value: "Cuernavaca", label: "Cuernavaca, Morelos" },
    { value: "Uruapan", label: "Uruapan, Michoacán" },
    { value: "Zacatecas", label: "Zacatecas, Zacatecas" },
    { value: "Durango", label: "Durango, Durango" },
    {
      value: "San Cristóbal de las Casas",
      label: "San Cristóbal de las Casas, Chiapas",
    },
    { value: "Tehuacán", label: "Tehuacán, Puebla" },
    { value: "Manzanillo", label: "Manzanillo, Colima" },
    { value: "Orizaba", label: "Orizaba, Veracruz" },
    { value: "Tula de Allende", label: "Tula de Allende, Hidalgo" },
    { value: "Pátzcuaro", label: "Pátzcuaro, Michoacán" },
    { value: "Comitán", label: "Comitán, Chiapas" },
    { value: "Puerto Escondido", label: "Puerto Escondido, Oaxaca" },
    { value: "Taxco", label: "Taxco, Guerrero" },
    { value: "Huatulco", label: "Huatulco, Oaxaca" },
    { value: "San Juan del Río", label: "San Juan del Río, Querétaro" },
    { value: "Zamora", label: "Zamora, Michoacán" },
    { value: "Lagos de Moreno", label: "Lagos de Moreno, Jalisco" },
    { value: "Tuxpan", label: "Tuxpan, Veracruz" },
    { value: "Guaymas", label: "Guaymas, Sonora" },
    { value: "Navojoa", label: "Navojoa, Sonora" },
    { value: "Piedras Negras", label: "Piedras Negras, Coahuila" },
    { value: "Delicias", label: "Delicias, Chihuahua" },
    { value: "Parral", label: "Parral, Chihuahua" },
    { value: "Tecomán", label: "Tecomán, Colima" },
    { value: "Playa del Carmen", label: "Playa del Carmen, Quintana Roo" },
    { value: "Isla Mujeres", label: "Isla Mujeres, Quintana Roo" },
    { value: "Holbox", label: "Holbox, Quintana Roo" },
    { value: "Mazatlán", label: "Mazatlán, Sinaloa" },
    { value: "Acapulco", label: "Acapulco, Guerrero" },
    { value: "Puerto Vallarta", label: "Puerto Vallarta, Jalisco" },
    { value: "Sayulita", label: "Sayulita, Nayarit" },
    { value: "Bahías de Huatulco", label: "Bahías de Huatulco, Oaxaca" },
    { value: "Ixtapa", label: "Ixtapa, Guerrero" },
    { value: "Zihuatanejo", label: "Zihuatanejo, Guerrero" },
    { value: "Progreso", label: "Progreso, Yucatán" },
    { value: "Campeche", label: "Campeche, Campeche" },
    { value: "Rosarito", label: "Rosarito, Baja California" },
    { value: "San Felipe", label: "San Felipe, Baja California" },
    { value: "Loreto", label: "Loreto, Baja California Sur" },
    { value: "Todos Santos", label: "Todos Santos, Baja California Sur" },
    { value: "Oaxaca", label: "Oaxaca, Oaxaca" },
  ]);

  // Ordenar alfabéticamente
  cityOptions.sort((a, b) => a.label.localeCompare(b.label));

  const [selectedCity, setSelectedCity] = useState(null);
  const [activeTab, setActiveTab] = useState("general"); // Para controlar las pestañas
  const [empresaOptions, setEmpresaOptions] = useState([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);
  const [empresaQr, setEmpresaQR] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedPublicidadLandscape, setSelectedPublicidadLandscape] =
    useState(null);
  const [selectedPublicidadPortrait, setSelectedPublicidadPortrait] =
    useState(null);
  const authorizedEmails = [
    "uppermex10@gmail.com",
    "ulises.jacobo@hotmail.com",
    "contacto@upperds.mx",
  ];

  const usuarioAutorizado =
    firebase.auth().currentUser &&
    authorizedEmails.includes(firebase.auth().currentUser.email);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const authUser = firebase.auth().currentUser;

        if (authUser) {
          // Obtener referencia al usuario autenticado
          const usuarioRef = doc(db, "usuarios", authUser.uid);
          const usuarioSnapshot = await getDoc(usuarioRef);

          let empresa;
          if (selectedEmpresa) {
            // Si hay una empresa seleccionada, usar esa
            empresa = selectedEmpresa.value;
          } else if (usuarioSnapshot.exists()) {
            // Si no hay una empresa seleccionada, usar la empresa del usuario autenticado
            const user = usuarioSnapshot.data();
            empresa = user.empresa || "";

            const numberOfScreens = user.pd || 0;

            // Inicializar los nombres con valores por defecto si no existen
            let pantallaNames = [];
            if (user.nombrePantallasDirectorio) {
              if (Array.isArray(user.nombrePantallasDirectorio)) {
                pantallaNames = [...user.nombrePantallasDirectorio];
              } else {
                // Convertir de objeto a array si es necesario
                pantallaNames = Object.values(user.nombrePantallasDirectorio);
              }
            }

            // Asegurar que tenemos suficientes nombres para todas las pantallas
            while (pantallaNames.length < numberOfScreens) {
              pantallaNames.push(`Directorio ${pantallaNames.length + 1}`);
            }

            setNombrePantallasDirectorio(pantallaNames);
            setPd(numberOfScreens);
            setNombreEmpresa(empresa);

            // Obtener la configuración de pantallas existente o crear una nueva por defecto
            const settings = user.pantallaSettings || [];

            // Asegurar que tenemos configuración para todas las pantallas
            // Asegurar que tenemos configuración para todas las pantallas
            const updatedSettings = [...settings];
            while (updatedSettings.length < numberOfScreens) {
              updatedSettings.push({
                isPortrait: false,
                template: selectedTemplate,
                rotationDirection: -90, // Valor por defecto
              });
            }

            setPantallaSettings(updatedSettings);

            const unsubscribe = onSnapshot(usuarioRef, (doc) => {
              const data = doc.data();
              if (data && data.nombrePantallasDirectorio) {
                let updatedNames = [];

                if (Array.isArray(data.nombrePantallasDirectorio)) {
                  updatedNames = [...data.nombrePantallasDirectorio];
                } else {
                  updatedNames = Object.values(data.nombrePantallasDirectorio);
                }

                setNombrePantallasDirectorio(updatedNames);

                // Actualizar settings si es necesario
                if (data.pantallaSettings) {
                  setPantallaSettings(data.pantallaSettings);
                } else if (updatedNames.length !== pantallaSettings.length) {
                  // Si cambió el número de pantallas, actualizar los settings
                  const newSettings = updatedNames.map((_, idx) => {
                    return (
                      pantallaSettings[idx] || {
                        isPortrait: false,
                        template: selectedTemplate,
                      }
                    );
                  });
                  setPantallaSettings(newSettings);
                }
              }
            });

            return () => unsubscribe();
          }

          if (empresa) {
            // Obtener todos los usuarios que pertenecen a la empresa seleccionada
            const usuariosRef = collection(db, "usuarios");
            const usuariosSnapshot = await getDocs(usuariosRef);

            const nombresPantallas = [];
            const settings = [];

            usuariosSnapshot.forEach((doc) => {
              const data = doc.data();
              if (data.empresa === empresa && data.nombrePantallasDirectorio) {
                let pantallasArray = [];

                if (Array.isArray(data.nombrePantallasDirectorio)) {
                  pantallasArray = [...data.nombrePantallasDirectorio];
                } else {
                  pantallasArray = Object.values(
                    data.nombrePantallasDirectorio
                  );
                }

                nombresPantallas.push(...pantallasArray);

                // Si hay configuraciones por pantalla, añadirlas
                if (data.pantallaSettings) {
                  settings.push(...data.pantallaSettings);
                } else {
                  // De lo contrario, crear configuraciones predeterminadas
                  const defaultSettings = pantallasArray.map(() => ({
                    isPortrait: false,
                    template: selectedTemplate,
                  }));
                  settings.push(...defaultSettings);
                }
              }
            });

            setNombrePantallasDirectorio(nombresPantallas);
            setPantallaSettings(settings);
          }
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
      }
    };

    const fetchTemplateData = async () => {
      try {
        const authUser = firebase.auth().currentUser;
        let empresa = "";

        if (authUser) {
          const usuarioRef = doc(db, "usuarios", authUser.uid);
          const usuarioSnapshot = await getDoc(usuarioRef);

          if (usuarioSnapshot.exists()) {
            const user = usuarioSnapshot.data();

            empresa = selectedEmpresa
              ? selectedEmpresa.value
              : user.empresa || "";

            console.log("Empresa >>>: ", empresa); // Console log de la empresa
            setEmpresaQR(empresa);

            const templateDirectoriosRef = collection(
              db,
              "TemplateDirectorios"
            );
            const templateDirectoriosQuery = query(
              templateDirectoriosRef,
              where("empresa", "==", empresa) // Buscar por empresa en lugar de userId
            );
            const templateDirectoriosSnapshot = await getDocs(
              templateDirectoriosQuery
            );

            if (!templateDirectoriosSnapshot.empty) {
              console.log(
                "Se encontró información en TemplateDirectorios por empresa."
              );
              const templateDirectoriosDoc =
                templateDirectoriosSnapshot.docs[0].data();
              const {
                fontColor,
                fontStyle,
                logo,
                templateColor,
                ciudad,
                publicidadLandscape,
                publicidadPortrait,
                idioma,
                template,
                pantallaSettings: dbPantallaSettings,
              } = templateDirectoriosDoc;

              setFontColor(fontColor || "#000000");
              setSelectedFontStyle({
                value: fontStyle || "Arial",
                label: fontStyle || "Arial",
              });
              setSelectedLogo(logo || null);
              setTemplateColor(templateColor || "#D1D5DB");
              setSelectedCity({ value: ciudad, label: ciudad });
              setSelectedPublicidadLandscape(publicidadLandscape || null);
              setSelectedPublicidadPortrait(publicidadPortrait || null);
              setSelectedLanguage(idioma || "es");
              setSelectedTemplate(template || "template1");

              // Si hay configuraciones por pantalla en la base de datos, usarlas
              if (dbPantallaSettings) {
                setPantallaSettings(dbPantallaSettings);
              }
            } else {
              console.log(
                "No se encontró información en TemplateDirectorios por empresa. Usando valores iniciales."
              );
              setFontColor("#000000");
              setSelectedFontStyle({
                value: "Arial",
                label: "Arial",
              });
              setSelectedLogo(null);
              setTemplateColor("#D1D5DB");
              setSelectedCity(null);
              setSelectedPublicidad(null);
            }
          }
        }
      } catch (error) {
        console.error("Error al obtener datos del template:", error);
      }
    };

    const fetchEmpresaData = async () => {
      try {
        const authUser = firebase.auth().currentUser;

        if (authUser && authorizedEmails.includes(authUser.email)) {
          const usuariosRef = collection(db, "usuarios");
          const usuariosSnapshot = await getDocs(usuariosRef);
          const empresasSet = new Set();

          usuariosSnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.empresa) {
              empresasSet.add(data.empresa);
            }
          });

          const empresasArray = Array.from(empresasSet).map((empresa) => ({
            value: empresa,
            label: empresa,
          }));
          setEmpresaOptions(empresasArray);
        }
      } catch (error) {
        console.error("Error al obtener datos de las empresas:", error);
      }
    };

    fetchUserData();
    fetchTemplateData();
    fetchEmpresaData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmpresa]);

  const handleCityChange = (selectedOption) => {
    setSelectedCity(selectedOption);
  };

  const handleEmpresaChange = async (selectedOption) => {
    setSelectedEmpresa(selectedOption); // Actualiza el estado con la empresa seleccionada

    try {
      const empresa = selectedOption.value; // Obtiene el valor de la empresa seleccionada

      const templateDirectoriosRef = collection(db, "TemplateDirectorios");
      const templateDirectoriosQuery = query(
        templateDirectoriosRef,
        where("empresa", "==", empresa) // Busca documentos con la empresa seleccionada
      );
      const templateDirectoriosSnapshot = await getDocs(
        templateDirectoriosQuery
      );

      if (!templateDirectoriosSnapshot.empty) {
        console.log(
          "Se encontró información en TemplateDirectorios para la empresa seleccionada."
        );
        const templateDirectoriosDoc =
          templateDirectoriosSnapshot.docs[0].data();
        const {
          fontColor,
          fontStyle,
          logo,
          templateColor,
          ciudad,
          publicidad,
          idioma,
          template,
          pantallaSettings: dbPantallaSettings,
        } = templateDirectoriosDoc;

        // Actualiza el estado con la información obtenida
        setFontColor(fontColor || "#000000");
        setSelectedFontStyle({
          value: fontStyle || "Arial",
          label: fontStyle || "Arial",
        });
        setSelectedLogo(logo || null);
        setTemplateColor(templateColor || "#D1D5DB");
        setSelectedCity({ value: ciudad, label: ciudad });
        setSelectedPublicidadLandscape(publicidadLandscape || null);
        setSelectedPublicidadPortrait(publicidadPortrait || null);
        setSelectedLanguage(idioma || "es");
        setSelectedTemplate(template || "template1");

        // Si hay configuraciones por pantalla, usarlas
        if (dbPantallaSettings) {
          setPantallaSettings(dbPantallaSettings);
        }
      } else {
        console.log(
          "No se encontró información en TemplateDirectorios para la empresa seleccionada."
        );
        // Si no hay información para la empresa seleccionada, puedes limpiar los estados o mostrar un mensaje
        // Limpiar los estados
        setFontColor("#000000");
        setSelectedFontStyle({ value: "Arial", label: "Arial" });
        setSelectedLogo(null);
        setTemplateColor("#D1D5DB");
        setSelectedCity(null);
        setSelectedPublicidad(null);
        setSelectedLanguage("es");
        setSelectedTemplate("template1");
        // Configuraciones de pantalla predeterminadas
        const defaultSettings = Array(nombrePantallasDirectorio.length).fill({
          isPortrait: false,
          template: "template1",
        });
        setPantallaSettings(defaultSettings);
      }
    } catch (error) {
      console.error(
        "Error al obtener datos del template para la empresa seleccionada:",
        error
      );
    }
  };

  const fontStyleOptions = [
    { value: "Arial", label: "Arial" },
    { value: "Avenir", label: "Avenir" },
    { value: "Bebas Neue", label: "Bebas Neue" },
    { value: "Cabin", label: "Cabin" },
    { value: "Courier New", label: "Courier New" },
    { value: "Crimson Text", label: "Crimson Text" },
    { value: "Cormorant", label: "Cormorant" },
    { value: "Dancing Script", label: "Dancing Script" },
    { value: "Dosis", label: "Dosis" },
    { value: "Exo", label: "Exo" },
    { value: "Fira Sans", label: "Fira Sans" },
    { value: "Garamond", label: "Garamond" },
    { value: "Georgia", label: "Georgia" },
    { value: "Helvetica", label: "Helvetica" },
    { value: "Josefin Sans", label: "Josefin Sans" },
    { value: "Lato", label: "Lato" },
    { value: "Merriweather", label: "Merriweather" },
    { value: "Montserrat", label: "Montserrat" },
    { value: "Muli", label: "Muli" },
    { value: "Nunito", label: "Nunito" },
    { value: "Noticia Text", label: "Noticia Text" },
    { value: "Open Sans", label: "Open Sans" },
    { value: "Oswald", label: "Oswald" },
    { value: "Pacifico", label: "Pacifico" },
    { value: "Palatino", label: "Palatino" },
    { value: "Playfair Display", label: "Playfair Display" },
    { value: "Poppins", label: "Poppins" },
    { value: "Quicksand", label: "Quicksand" },
    { value: "Raleway", label: "Raleway" },
    { value: "Roboto", label: "Roboto" },
    { value: "Rockwell", label: "Rockwell" },
    { value: "Source Sans Pro", label: "Source Sans Pro" },
    { value: "Tahoma", label: "Tahoma" },
    { value: "Times New Roman", label: "Times New Roman" },
    { value: "Trebuchet MS", label: "Trebuchet MS" },
    { value: "Ubuntu", label: "Ubuntu" },
    { value: "Varela Round", label: "Varela Round" },
    { value: "Verdana", label: "Verdana" },
    { value: "Yanone Kaffeesatz", label: "Yanone Kaffeesatz" },
  ];

  const templateOptions = [
    { value: "template1", label: "Template 1" },
    // Aquí puedes agregar más templates en el futuro
  ];

  const [selectedFontStyle, setSelectedFontStyle] = useState(
    fontStyleOptions[0]
  );

  const handleTemplateColorChange = () => {
    setShowColorPicker(!showColorPicker);
  };

  const handleFontColorChange = () => {
    setShowFontColorPicker(!showFontColorPicker);
  };

  const handleColorChange = (color) => {
    if (showColorPicker) {
      setTemplateColor(color.hex);
    } else if (showFontColorPicker) {
      setFontColor(color.hex);
    }
  };

  const handleFontStyleChange = (selectedOption) => {
    setSelectedFontStyle(selectedOption);
    const textoEjemplo = "Texto de ejemplo";
    const font = `${selectedOption.value}, sans-serif`;
    const textoAncho = getTextWidth(textoEjemplo, `bold 20px ${font}`);
    console.log("Ancho del texto medido:", textoAncho);
  };

  function obtenerHora() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(obtenerHora());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  function getTextWidth(text, font) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = font;

    const metrics = context.measureText(text);
    return metrics.width;
  }

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const storageRef = ref(storage, `pantallaDirectorioLogos/${file.name}`);

    try {
      await uploadBytes(storageRef, file);
      const logoUrl = await getDownloadURL(storageRef);

      setSelectedLogo(logoUrl);
    } catch (error) {
      console.error("Error al subir el logo a Firebase Storage:", error);
    }
  };

  // Actualizar la configuración para una pantalla específica
  const updatePantallaSettings = (index, key, value) => {
    setPantallaSettings((prevSettings) => {
      const newSettings = [...prevSettings];

      // Si no existe configuración para esta pantalla, crea una nueva
      if (!newSettings[index]) {
        newSettings[index] = {
          isPortrait: false,
          template: selectedTemplate,
          rotationDirection: -90, // Valor por defecto, -90 como era originalmente
        };
      }

      // Actualiza la propiedad específica
      newSettings[index] = {
        ...newSettings[index],
        [key]: value,
      };

      console.log(
        `Actualizada configuración para pantalla ${index + 1}: ${key}=${value}`
      );

      return newSettings;
    });
  };

  const guardarInformacionPersonalizacion = async () => {
    try {
      const authUser = firebase.auth().currentUser;

      if (pd === 0) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "No hay licencias activas. No se pueden personalizar las pantallas.",
        });
        return;
      }

      if (!authUser) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Usuario no autenticado. No se puede enviar a Firestore.",
        });
        return;
      }

      if (!selectedCity) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Por favor, seleccione una ciudad.",
        });
        return;
      }

      // Validar que la ciudad sea válida para la API de clima
      try {
        // Mostrar un indicador de carga mientras verificamos
        Swal.fire({
          title: "Verificando ciudad...",
          didOpen: () => {
            Swal.showLoading();
          },
          allowOutsideClick: false,
          allowEscapeKey: false,
        });

        // Intentar obtener datos del clima para la ciudad seleccionada
        await fetchWeatherData(selectedCity.value);

        // Si llegamos aquí, la ciudad es válida, cerrar el indicador de carga
        Swal.close();
      } catch (error) {
        // Si hay un error, la ciudad podría no ser válida para la API
        Swal.fire({
          icon: "error",
          title: "Error de validación",
          text: "No se pudo verificar la ciudad seleccionada. Por favor, seleccione otra ciudad o inténtelo más tarde.",
        });
        return;
      }

      if (!selectedLogo) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Por favor, seleccione un logo.",
        });
        return;
      }

      if (!selectedPublicidadLandscape || !selectedPublicidadPortrait) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Por favor, seleccione imágenes para publicidad en ambas orientaciones.",
        });
        return;
      }

      if (!selectedLanguage) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Por favor, seleccione un idioma.",
        });
        return;
      }

      // Convertir pantallaSettings de array a objeto con formato compatible con BaseDirectorioClient
      const pantallasSettingsObj = {};
      pantallaSettings.forEach((setting, index) => {
        // Guardar como índice+1 para que coincida con el número de pantalla
        pantallasSettingsObj[index + 1] = {
          setPortrait: setting.isPortrait, // Convertir de isPortrait a setPortrait
          template: setting.template || selectedTemplate,
        };
      });

      // Crear objeto de configuración del template
      const personalizacionTemplate = {
        fontColor: fontColor,
        templateColor: templateColor,
        fontStyle: selectedFontStyle.value,
        logo: selectedLogo,
        ciudad: selectedCity.value,
        publicidadLandscape: selectedPublicidadLandscape,
        publicidadPortrait: selectedPublicidadPortrait,
        idioma: selectedLanguage,
        template: selectedTemplate,
        empresa: selectedEmpresa ? selectedEmpresa.value : nombreEmpresa,
        pantallaSettings: pantallaSettings, // Guardar configuraciones originales
        pantallasSettings: pantallasSettingsObj, // Guardar en formato compatible con BaseDirectorioClient
      };

      const empresaToUse = selectedEmpresa
        ? selectedEmpresa.value
        : nombreEmpresa;

      // Guardar en TemplateDirectorios
      const templateDirectoriosRef = collection(db, "TemplateDirectorios");
      const templateDirectoriosQuery = query(
        templateDirectoriosRef,
        where("empresa", "==", empresaToUse)
      );
      const templateDirectoriosSnapshot = await getDocs(
        templateDirectoriosQuery
      );

      if (!templateDirectoriosSnapshot.empty) {
        const templateDirectoriosDocRef =
          templateDirectoriosSnapshot.docs[0].ref;
        await updateDoc(templateDirectoriosDocRef, {
          ...personalizacionTemplate,
          timestamp: serverTimestamp(),
        });
      } else {
        await addDoc(templateDirectoriosRef, {
          ...personalizacionTemplate,
          timestamp: serverTimestamp(),
        });
      }

      // Actualizar nombres de pantallas en la colección de usuarios
      const nombresPantallasObject = {};
      nombrePantallasDirectorio.forEach((nombre, index) => {
        nombresPantallasObject[`nombrePantallasDirectorio.${index}`] = nombre;
      });

      // También guardar la configuración de cada pantalla en los usuarios
      const pantallaSettingsObject = {};
      pantallaSettings.forEach((setting, index) => {
        pantallaSettingsObject[`pantallaSettings.${index}`] = setting;
      });

      if (selectedEmpresa) {
        // Actualizar nombres de pantalla para todos los usuarios con la empresa seleccionada
        const usuariosEmpresaQuery = query(
          collection(db, "usuarios"),
          where("empresa", "==", empresaToUse)
        );
        const usuariosEmpresaSnapshot = await getDocs(usuariosEmpresaQuery);
        const updateUsuariosPromises = [];

        usuariosEmpresaSnapshot.forEach((usuarioDoc) => {
          const usuarioEmpresaRef = doc(db, "usuarios", usuarioDoc.id);
          updateUsuariosPromises.push(
            updateDoc(usuarioEmpresaRef, {
              ...nombresPantallasObject,
              ...pantallaSettingsObject,
            })
          );
        });

        await Promise.all(updateUsuariosPromises);
      } else {
        const usuarioRef = doc(db, "usuarios", authUser.uid);

        // Eliminar nombres de pantallas y configuraciones anteriores
        await updateDoc(usuarioRef, {
          nombrePantallasDirectorio: firebase.firestore.FieldValue.delete(),
          pantallaSettings: firebase.firestore.FieldValue.delete(),
        });

        // Guardar los nuevos nombres y configuraciones
        await updateDoc(usuarioRef, {
          ...nombresPantallasObject,
          ...pantallaSettingsObject,
        });
      }

      // Actualizar eventos con la nueva información de personalización
      const eventosRef = collection(db, "eventos");
      const eventosQuery = query(
        eventosRef,
        where("empresa", "==", empresaToUse)
      );
      const eventosSnapshot = await getDocs(eventosQuery);

      const updatePromises = [];

      eventosSnapshot.forEach((doc) => {
        const eventoRef = doc.ref;
        const eventoData = doc.data();

        if (eventoRef && eventoData) {
          updatePromises.push(
            updateDoc(eventoRef, {
              personalizacionTemplate: personalizacionTemplate,
            })
          );
        } else {
          console.error("Referencia de evento no válida:", doc.id);
        }
      });

      await Promise.all(updatePromises);

      Swal.fire({
        icon: "success",
        title: t("screenSalon.customizationSavedSuccess"),
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      console.error(
        "Error al guardar la información de personalización y URL del logo:",
        error
      );
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al guardar la configuración. Intente nuevamente.",
      });
    }
  };

  const handlePublicidadLandscapeChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const storageRef = ref(
      storage,
      `pantallaDirectorioPublicidad/landscape_${file.name}`
    );

    try {
      await uploadBytes(storageRef, file);
      const publicidadUrl = await getDownloadURL(storageRef);
      setSelectedPublicidadLandscape(publicidadUrl);
    } catch (error) {
      console.error(
        "Error al subir la imagen de publicidad horizontal a Firebase Storage:",
        error
      );
    }
  };

  const handlePublicidadPortraitChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const storageRef = ref(
      storage,
      `pantallaDirectorioPublicidad/portrait_${file.name}`
    );

    try {
      await uploadBytes(storageRef, file);
      const publicidadUrl = await getDownloadURL(storageRef);
      setSelectedPublicidadPortrait(publicidadUrl);
    } catch (error) {
      console.error(
        "Error al subir la imagen de publicidad vertical a Firebase Storage:",
        error
      );
    }
  };
  // Estilos personalizados de React Select
  const customStyles = {
    control: (provided) => ({
      ...provided,
      height: "20px", // Ajusta la altura del select
      minHeight: "40px", // Asegura que la altura mínima sea consistente
    }),
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const handleTemplateChange = (selectedOption) => {
    setSelectedTemplate(selectedOption.value);
  };

  // Función para guardar con feedback
  const handleSaveWithFeedback = () => {
    guardarInformacionPersonalizacion(selectedLogo);
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 bg-gray-50 min-h-screen">
      {/* Cabecera con título y descripción */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {t("screensDirectory.title")}
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-base text-gray-500 sm:text-lg">
            {t("screensDirectory.description")}
          </p>
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
                <Select
                  id="empresa"
                  value={selectedEmpresa}
                  onChange={handleEmpresaChange}
                  options={empresaOptions}
                  placeholder="Seleccionar Empresa"
                  isClearable
                  styles={customStyles}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg ">
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
              {t("screensDirectory.generalSettings")}
            </button>
            <button
              onClick={() => setActiveTab("screens")}
              className={`flex-1 py-4 px-4 text-center font-medium text-sm sm:text-base ${
                activeTab === "screens"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t("screensDirectory.screenNames")}
            </button>
            <button
              onClick={() => setActiveTab("appearance")}
              className={`flex-1 py-4 px-4 text-center font-medium text-sm sm:text-base ${
                activeTab === "appearance"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t("screensDirectory.appearance")}
            </button>
          </div>

          {/* Contenido de las pestañas */}
          <div className="p-6">
            {/* Pestaña de Configuración General */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  {t("screensDirectory.generalSettings")}
                </h2>

                {/* Logo y Publicidad */}
                <div className="grid grid-cols-1 gap-6">
                  {/* Logo */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("screensDirectory.logo")}
                    </label>
                    <div className="mt-1">
                      <label className="w-full flex flex-col justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-gray-400">
                        <div className="space-y-3 text-center w-full">
                          {selectedLogo ? (
                            <div className="mx-auto">
                              <img
                                src={selectedLogo}
                                alt="Logo Actual"
                                className="h-24 w-auto object-contain mx-auto"
                              />
                            </div>
                          ) : (
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                              aria-hidden="true"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                          <div className="flex justify-center text-sm text-gray-600">
                            <span>
                              {selectedLogo
                                ? "Cambiar logo"
                                : t("screensDirectory.uploadLogo")}
                            </span>
                            <input
                              id="file-upload-logo"
                              name="file-upload-logo"
                              type="file"
                              className="sr-only"
                              onChange={handleImageChange}
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF hasta 2MB
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Publicidades - horizontal y vertical */}

                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {t("screensDirectory.advertisement")}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {/* Publicidad Horizontal */}
                    <div className="p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("screensDirectory.horizontalAdvertisement")}
                      </label>
                      <p className="text-xs text-gray-500 mb-3">
                        {t(
                          "screensDirectory.horizontalAdvertisementDescription"
                        )}
                      </p>
                      <div className="mt-1">
                        <label className="w-full flex flex-col justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-gray-400">
                          <div className="space-y-3 text-center w-full">
                            {selectedPublicidadLandscape ? (
                              <div className="mx-auto">
                                <img
                                  src={selectedPublicidadLandscape}
                                  alt={t(
                                    "screensDirectory.horizontalAdvertisement"
                                  )}
                                  className="h-24 w-auto object-contain mx-auto"
                                />
                              </div>
                            ) : (
                              <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                                aria-hidden="true"
                              >
                                <path
                                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                            <div className="flex justify-center text-sm text-gray-600">
                              <span>
                                {selectedPublicidadLandscape
                                  ? "Cambiar imagen"
                                  : t(
                                      "screensDirectory.uploadHorizontalAdvertisement"
                                    )}
                              </span>
                              <input
                                id="file-upload-landscape"
                                name="file-upload-landscape"
                                type="file"
                                className="sr-only"
                                onChange={handlePublicidadLandscapeChange}
                              />
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF hasta 2MB
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Publicidad Vertical */}
                    <div className="p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("screensDirectory.verticalAdvertisement")}
                      </label>
                      <p className="text-xs text-gray-500 mb-3">
                        {t("screensDirectory.verticalAdvertisementDescription")}
                      </p>
                      <div className="mt-1">
                        <label className="w-full flex flex-col justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-gray-400">
                          <div className="space-y-3 text-center w-full">
                            {selectedPublicidadPortrait ? (
                              <div className="mx-auto">
                                <img
                                  src={selectedPublicidadPortrait}
                                  alt={t(
                                    "screensDirectory.verticalAdvertisement"
                                  )}
                                  className="h-24 w-auto object-contain mx-auto"
                                />
                              </div>
                            ) : (
                              <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                                aria-hidden="true"
                              >
                                <path
                                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                            <div className="flex justify-center text-sm text-gray-600">
                              <span>
                                {selectedPublicidadPortrait
                                  ? "Cambiar imagen"
                                  : t(
                                      "screensDirectory.uploadVerticalAdvertisement"
                                    )}
                              </span>
                              <input
                                id="file-upload-portrait"
                                name="file-upload-portrait"
                                type="file"
                                className="sr-only"
                                onChange={handlePublicidadPortraitChange}
                              />
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF hasta 2MB
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ciudad e Idioma */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {/* Selector de Ciudad */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("screensDirectory.selectCity")}
                    </label>
                    <Select
                      options={cityOptions}
                      value={selectedCity}
                      onChange={handleCityChange}
                      placeholder="Seleccione una ciudad"
                      className="w-full"
                      isSearchable
                      isClearable={false}
                      required
                    />
                  </div>

                  {/* Selector de Idioma */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {t("screenSalon.languages")}
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
                          {t("screenSalon.idspanish")}
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
                          {t("screenSalon.idenglish")}
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
                          {t("screenSalon.idspanish/english")}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selector de Template General */}
                {/* <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template por defecto
                  </label>
                  <Select
                    options={templateOptions}
                    value={templateOptions.find(
                      (option) => option.value === selectedTemplate
                    )}
                    onChange={handleTemplateChange}
                    placeholder="Seleccionar template"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Este template se aplicará por defecto a todas las pantallas.
                    Puede cambiar el template de cada pantalla individualmente
                    en la pestaña &quot;Pantallas&quot;.
                  </p>
                </div> */}
              </div>
            )}

            {/* Pestaña de Pantallas */}
            {activeTab === "screens" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  {t("screensDirectory.screenNames")}
                </h2>

                <div className="space-y-6">
                  {Array.from({ length: pd }, (_, index) => (
                    <div
                      className="bg-gray-50 p-4 rounded-lg shadow-sm"
                      key={index}
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="text-sm font-medium text-gray-700 mr-2">
                              {t("screensDirectory.screen")} {""}
                              {index + 1}:
                            </span>
                            <input
                              type="text"
                              placeholder={`Directorio ${index + 1}`}
                              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              value={(
                                nombrePantallasDirectorio[index] || ""
                              ).slice(0, 30)}
                              onChange={(e) => {
                                const updatedNombres = [
                                  ...nombrePantallasDirectorio,
                                ];
                                updatedNombres[index] = e.target.value;
                                setNombrePantallasDirectorio(updatedNombres);
                              }}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <div>
                              <div className="flex items-center">
                                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                                  <input
                                    type="checkbox"
                                    name={`toggle-portrait-${index}`}
                                    id={`toggle-portrait-${index}`}
                                    checked={
                                      pantallaSettings[index]?.isPortrait ||
                                      false
                                    }
                                    onChange={() =>
                                      updatePantallaSettings(
                                        index,
                                        "isPortrait",
                                        !pantallaSettings[index]?.isPortrait
                                      )
                                    }
                                    className="checked:bg-blue-500 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                  />
                                  <label
                                    htmlFor={`toggle-portrait-${index}`}
                                    className={`block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer ${
                                      pantallaSettings[index]?.isPortrait
                                        ? "bg-blue-500"
                                        : ""
                                    }`}
                                  ></label>
                                </div>
                                <span className="text-sm text-gray-700">
                                  {pantallaSettings[index]?.isPortrait
                                    ? "Orientación: Vertical"
                                    : "Orientación: Horizontal"}
                                </span>
                              </div>

                              {/* Control de dirección de rotación - solo visible cuando está en modo vertical */}
                              {pantallaSettings[index]?.isPortrait && (
                                <div className="mt-2 pl-12">
                                  <div className="flex items-center space-x-4">
                                    <span className="text-xs text-gray-600">
                                      Dirección de rotación:
                                    </span>
                                    <div className="flex space-x-4">
                                      <div className="flex items-center">
                                        <input
                                          type="radio"
                                          id={`rotate-negative-${index}`}
                                          name={`rotate-direction-${index}`}
                                          value="-90"
                                          checked={
                                            (pantallaSettings[index]
                                              ?.rotationDirection || -90) ===
                                            -90
                                          }
                                          onChange={() =>
                                            updatePantallaSettings(
                                              index,
                                              "rotationDirection",
                                              -90
                                            )
                                          }
                                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                        <label
                                          htmlFor={`rotate-negative-${index}`}
                                          className="ml-2 block text-xs text-gray-700"
                                        >
                                          -90° (Izquierda)
                                        </label>
                                      </div>
                                      <div className="flex items-center">
                                        <input
                                          type="radio"
                                          id={`rotate-positive-${index}`}
                                          name={`rotate-direction-${index}`}
                                          value="90"
                                          checked={
                                            (pantallaSettings[index]
                                              ?.rotationDirection || -90) === 90
                                          }
                                          onChange={() =>
                                            updatePantallaSettings(
                                              index,
                                              "rotationDirection",
                                              90
                                            )
                                          }
                                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                        <label
                                          htmlFor={`rotate-positive-${index}`}
                                          className="ml-2 block text-xs text-gray-700"
                                        >
                                          90° (Derecha)
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Template
                              </label>
                              <Select
                                options={templateOptions}
                                value={templateOptions.find(
                                  (option) =>
                                    option.value ===
                                    (pantallaSettings[index]?.template ||
                                      selectedTemplate)
                                )}
                                onChange={(option) =>
                                  updatePantallaSettings(
                                    index,
                                    "template",
                                    option.value
                                  )
                                }
                                placeholder="Seleccionar template"
                                className="w-full"
                              />
                            </div> */}
                          </div>
                        </div>

                        <div className="flex flex-col items-end">
                          <Link
                            href={`/pantallaDirec/${index + 1}${
                              isProduction ? ".html" : ""
                            }?emp=${empresaQr}`}
                            target="_blank"
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            {t("screensDirectory.seeScreen")} {""}
                          </Link>
                          <span className="text-xs text-gray-500 mt-1">
                            ID: {index + 1}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {pd === 0 && (
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-yellow-600">
                      No hay pantallas de directorio configuradas. Por favor,
                      contacte al administrador para adquirir licencias de
                      pantallas.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Pestaña de Apariencia */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  {t("screensDirectory.appearance")}
                </h2>

                {/* Estilo de Texto */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("screensDirectory.textStyle")}
                    </label>
                    <Select
                      options={fontStyleOptions}
                      value={selectedFontStyle}
                      onChange={handleFontStyleChange}
                      placeholder="Seleccionar estilo de texto"
                      className="w-full"
                    />
                    <div
                      className="mt-2 p-3 border rounded-md"
                      style={{
                        fontFamily: selectedFontStyle?.value || "Arial",
                      }}
                    >
                      <p>Vista previa del texto</p>
                    </div>
                  </div>

                  {/* Color de Texto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("screensDirectory.fontColor")}
                    </label>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleFontColorChange}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {t("screensDirectory.selectColor")}
                      </button>
                      <div
                        className="w-8 h-8 rounded-full border border-gray-300"
                        style={{ backgroundColor: fontColor }}
                      ></div>
                      <div className="text-sm" style={{ color: fontColor }}>
                        {fontColor}
                      </div>
                    </div>
                    {showFontColorPicker && (
                      <div className="absolute z-10 mt-2">
                        <div className="mb-2">
                          <ChromePicker
                            color={fontColor}
                            onChange={handleColorChange}
                          />
                        </div>
                        <button
                          onClick={handleFontColorChange}
                          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          {t("screensDirectory.confirm")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Color de Plantilla */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("screensDirectory.templateColor")}
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleTemplateColorChange}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {t("screensDirectory.selectColor")}
                    </button>
                    <div
                      className="w-8 h-8 rounded-full border border-gray-300"
                      style={{ backgroundColor: templateColor }}
                    ></div>
                    <div className="text-sm">{templateColor}</div>
                  </div>
                  {showColorPicker && (
                    <div className="absolute z-10 mt-2">
                      <div className="mb-2">
                        <ChromePicker
                          color={templateColor}
                          onChange={handleColorChange}
                        />
                      </div>
                      <button
                        onClick={handleTemplateColorChange}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {t("screensDirectory.confirm")}
                      </button>
                    </div>
                  )}
                </div>

                {/* Vista previa */}
                <div className="mt-4 p-4 border rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Vista previa
                  </h3>
                  <div
                    className="p-4 rounded-md"
                    style={{
                      backgroundColor: templateColor,
                      fontFamily: selectedFontStyle?.value || "Arial",
                      color: fontColor,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      {selectedLogo && (
                        <img
                          src={selectedLogo}
                          alt="Logo Preview"
                          className="h-10 w-auto"
                        />
                      )}
                      <div className="text-lg font-bold">
                        Ejemplo de Título en Pantalla
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="mt-8 flex justify-end space-x-3">
              <button
                onClick={() => {
                  // Reiniciar a valores por defecto
                  if (
                    window.confirm(
                      "¿Está seguro que desea restablecer todos los valores?"
                    )
                  ) {
                    setTemplateColor("#D1D5DB");
                    setFontColor("#000000");
                    setSelectedFontStyle(fontStyleOptions[0]);
                    setSelectedTemplate("template1");

                    // Reiniciar configuraciones por pantalla
                    const defaultSettings = Array(
                      nombrePantallasDirectorio.length
                    ).fill({
                      isPortrait: false,
                      template: "template1",
                    });
                    setPantallaSettings(defaultSettings);
                  }
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {t("screensDirectory.reset")}
              </button>
              <button
                onClick={handleSaveWithFeedback}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t("screensDirectory.save")}
              </button>
            </div>
          </div>
        </div>

        {/* Mensaje de éxito */}
        {showSuccessMessage && (
          <div className="fixed bottom-4 right-4 bg-green-50 p-4 rounded-md shadow-lg border-l-4 border-green-500 max-w-md transition-all duration-500 ease-in-out">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  ¡Cambios guardados correctamente!
                </p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    onClick={() => setShowSuccessMessage(false)}
                    className="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <span className="sr-only">Cerrar</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PantallasDirectorio;
