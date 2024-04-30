/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import { ChromePicker } from "react-color";
import Select from "react-select";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
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

const firebaseConfig = {
  apiKey: "AIzaSyAiP1248hBEZt3iS2H4UVVjdf_xbuJHD3k",
  authDomain: "upper-8c817.firebaseapp.com",
  projectId: "upper-8c817",
  storageBucket: "upper-8c817.appspot.com",
  messagingSenderId: "798455798906",
  appId: "1:798455798906:web:f58a3e51b42eebb6436fc3",
  measurementId: "G-6VHX927GH1",
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const storage = getStorage();

function PantallasDirectorio() {
  const {t} = useTranslation() // Traduccion con i18N
  const [nombrePantallasDirectorio, setNombrePantallasDirectorio] = useState(
    []
  );
  const [pd, setPd] = useState(0);
  const [templateColor, setTemplateColor] = useState("#D1D5DB");
  const [fontColor, setFontColor] = useState("#000000");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontColorPicker, setShowFontColorPicker] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(obtenerHora());
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [selectedPublicidad, setSelectedPublicidad] = useState(null);
  const [cityOptions, setCityOptions] = useState([
    { value: "Ciudad de México", label: "Ciudad de México" },
    { value: "Tijuana", label: "Tijuana" },
    { value: "Ecatepec de Morelos", label: "Ecatepec de Morelos" },
    { value: "León", label: "León" },
    { value: "Puebla", label: "Puebla" },
    { value: "Guadalajara", label: "Guadalajara" },
    { value: "Zapopan", label: "Zapopan" },
    { value: "Monterrey", label: "Monterrey" },
    { value: "Benito Juárez", label: "Benito Juárez" },
    { value: "Mexicali", label: "Mexicali" },
    { value: "Nezahualcóyotl", label: "Nezahualcóyotl" },
    { value: "Culiacán", label: "Culiacán" },
    { value: "Mérida", label: "Mérida" },
    { value: "Chihuahua", label: "Chihuahua" },
    { value: "Hermosillo", label: "Hermosillo" },
    { value: "San Luis Potosí", label: "San Luis Potosí" },
    { value: "Aguascalientes", label: "Aguascalientes" },
    { value: "Tlajomulco de Zúñiga", label: "Tlajomulco de Zúñiga" },
    { value: "Torreón", label: "Torreón" },
    { value: "Saltillo", label: "Saltillo" },
    { value: "Reynosa", label: "Reynosa" },
    { value: "Acapulco", label: "Acapulco" },
    { value: "Victoria", label: "Victoria" },
    { value: "Durango", label: "Durango" },
    { value: "Toluca", label: "Toluca" },
    { value: "Tlaquepaque", label: "Tlaquepaque" },
    { value: "Guadalupe", label: "Guadalupe" },
    { value: "Matamoros", label: "Matamoros" },
    { value: "General Escobedo", label: "General Escobedo" },
    { value: "Irapuato", label: "Irapuato" },
    { value: "Xalapa", label: "Xalapa" },
    { value: "Mazatlán", label: "Mazatlán" },
    { value: "Nuevo Laredo", label: "Nuevo Laredo" },
    { value: "San Nicolás de los Garza", label: "San Nicolás de los Garza" },
    { value: "Veracruz", label: "Veracruz" },
    { value: "Celaya", label: "Celaya" },
    { value: "Tepic", label: "Tepic" },
    { value: "Ixtapaluca", label: "Ixtapaluca" },
    { value: "Cuernavaca", label: "Cuernavaca" },
    { value: "Villahermosa", label: "Villahermosa" },
    { value: "Ciudad Victoria", label: "Ciudad Victoria" },
    { value: "Ensenada", label: "Ensenada" },
    { value: "Ciudad Obregón", label: "Ciudad Obregón" },
    { value: "Playa del Carmen", label: "Playa del Carmen" },
    { value: "Uruapan", label: "Uruapan" },
    { value: "Los Mochis", label: "Los Mochis" },
    { value: "Pachuca de Soto", label: "Pachuca de Soto" },
    { value: "Tampico", label: "Tampico" },
    { value: "Tehuacán", label: "Tehuacán" },
    { value: "Nogales", label: "Nogales" },
    { value: "Oaxaca de Juárez", label: "Oaxaca de Juárez" },
    { value: "La Paz", label: "La Paz" },
    { value: "Campeche", label: "Campeche" },
    { value: "Monclova", label: "Monclova" },
    { value: "Puerto Vallarta", label: "Puerto Vallarta" },
    { value: "Toluca", label: "Toluca" },
    { value: "Tapachula", label: "Tapachula" },
    { value: "Coatzacoalcos", label: "Coatzacoalcos" },
    { value: "Cabo San Lucas", label: "Cabo San Lucas" },
    { value: "Ciudad del Carmen", label: "Ciudad del Carmen" },
    {
      value: "San Cristóbal de las Casas",
      label: "San Cristóbal de las Casas",
    },
    { value: "Poza Rica de Hidalgo", label: "Poza Rica de Hidalgo" },
    { value: "San Juan del Río", label: "San Juan del Río" },
    { value: "Jiutepec", label: "Jiutepec" },
    { value: "Piedras Negras", label: "Piedras Negras" },
    { value: "Chetumal", label: "Chetumal" },
    { value: "Salamanca", label: "Salamanca" },
    { value: "Manzanillo", label: "Manzanillo" },
    { value: "Cuautla", label: "Cuautla" },
    { value: "Zamora de Hidalgo", label: "Zamora de Hidalgo" },
    { value: "Colima", label: "Colima" },
    { value: "Córdoba", label: "Córdoba" },
    { value: "Zacatecas", label: "Zacatecas" },
    { value: "San José del Cabo", label: "San José del Cabo" },
    { value: "Ciudad Cuauhtémoc", label: "Ciudad Cuauhtémoc" },
    { value: "San Pedro Garza García", label: "San Pedro Garza García" },
    { value: "Delicias", label: "Delicias" },
    {
      value: "Iguala de la Independencia",
      label: "Iguala de la Independencia",
    },

    // Ciudades de Estados Unidos
    { value: "Austin", label: "Austin" },
    { value: "Charlotte", label: "Charlotte" },
    { value: "Chicago", label: "Chicago" },
    { value: "Columbus", label: "Columbus" },
    { value: "Dallas", label: "Dallas" },
    { value: "Denver", label: "Denver" },
    { value: "Fort Worth", label: "Fort Worth" },
    { value: "Houston", label: "Houston" },
    { value: "Indianapolis", label: "Indianapolis" },
    { value: "Jacksonville", label: "Jacksonville" },
    { value: "Los Angeles", label: "Los Angeles" },
    { value: "Nueva York", label: "Nueva York" },
    { value: "Filadelfia", label: "Filadelfia" },
    { value: "Phoenix", label: "Phoenix" },
    { value: "San Antonio", label: "San Antonio" },
    { value: "San Diego", label: "San Diego" },
    { value: "San Francisco", label: "San Francisco" },
    { value: "San José", label: "San José" },
    { value: "Seattle", label: "Seattle" },
    { value: "Washington, D.C.", label: "Washington, D.C." },
  ]);
  const [setPortrait, setSetPortrait] = useState(false);
  // Ordenar alfabéticamente
  cityOptions.sort((a, b) => a.label.localeCompare(b.label));

  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const authUser = firebase.auth().currentUser;

        if (authUser) {
          // Obtener información del usuario desde Firestore
          const usuarioRef = doc(db, "usuarios", authUser.uid);
          const usuarioSnapshot = await getDoc(usuarioRef);

          if (usuarioSnapshot.exists()) {
            const user = usuarioSnapshot.data();
            const numberOfScreens = user.pd || 0;
            const namesArray = Array.from(
              { length: numberOfScreens },
              (_, index) => `Pantalla ${index + 1}`
            );

            setNombrePantallasDirectorio(namesArray);
            setPd(numberOfScreens);

            const unsubscribe = onSnapshot(usuarioRef, (doc) => {
              const data = doc.data();
              if (data && data.nombrePantallasDirectorio) {
                const nombres = Object.values(data.nombrePantallasDirectorio);
                setNombrePantallasDirectorio(nombres);
              }
            });

            return () => unsubscribe();
          }
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
      }
    };

    const fetchTemplateData = async () => {
      try {
        const authUser = firebase.auth().currentUser;

        if (authUser) {
          const templateDirectoriosRef = collection(db, "TemplateDirectorios");
          const templateDirectoriosQuery = query(
            templateDirectoriosRef,
            where("userId", "==", authUser.uid)
          );
          const templateDirectoriosSnapshot = await getDocs(
            templateDirectoriosQuery
          );

          if (!templateDirectoriosSnapshot.empty) {
            const templateDirectoriosDoc =
              templateDirectoriosSnapshot.docs[0].data();
            const {
              fontColor,
              fontStyle,
              logo,
              templateColor,
              ciudad,
              setPortrait, // Asegúrate de que esta propiedad se llame 'setPortrait' en la base de datos
              publicidad, // Asegúrate de que esta propiedad se llame 'publicidad' en la base de datos
            } = templateDirectoriosDoc;

            setFontColor(fontColor || "#000000");
            setSelectedFontStyle({
              value: fontStyle || "Arial",
              label: fontStyle || "Arial",
            });
            setSelectedLogo(logo || null);
            setTemplateColor(templateColor || "#D1D5DB");
            setSelectedCity({ value: ciudad, label: ciudad });
            setSetPortrait(setPortrait || false);
            setSelectedPublicidad(publicidad || null);
          }
        }
      } catch (error) {
        console.error("Error al obtener datos del template:", error);
      }
    };

    fetchUserData();
    fetchTemplateData();
  }, []);

  const handleCityChange = (selectedOption) => {
    setSelectedCity(selectedOption);
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
    const storageRef = ref(storage, `pantallaDirectorioLogos/${file.name}`);

    try {
      await uploadBytes(storageRef, file);
      const logoUrl = await getDownloadURL(storageRef);

      setSelectedLogo(logoUrl);
    } catch (error) {
      console.error("Error al subir el logo a Firebase Storage:", error);
    }
  };

  const guardarInformacionPersonalizacion = async () => {
    try {
      const authUser = firebase.auth().currentUser;

      if (pd === 0) {
        alert(
          "No hay licencias activas. No se pueden personalizar las pantallas."
        );
        return;
      }

      if (!authUser) {
        console.error(
          "Usuario no autenticado. No se puede enviar a Firestore."
        );
        return;
      }

      if (!selectedCity) {
        alert("Por favor, seleccione una ciudad.");
        return;
      }

      if (!selectedLogo) {
        alert("Por favor, seleccione un logo.");
        return;
      }

      if (!selectedPublicidad) {
        alert("Por favor, seleccione una imagen para Publicidad.");
        return;
      }

      const personalizacionTemplate = {
        fontColor: fontColor,
        templateColor: templateColor,
        fontStyle: selectedFontStyle.value,
        logo: selectedLogo,
        ciudad: selectedCity.value,
        setPortrait: setPortrait, // Agrega setPortrait al objeto
        publicidad: selectedPublicidad,
      };

      const templateDirectoriosRef = collection(db, "TemplateDirectorios");
      const templateDirectoriosQuery = query(
        templateDirectoriosRef,
        where("userId", "==", authUser.uid)
      );
      const templateDirectoriosSnapshot = await getDocs(
        templateDirectoriosQuery
      );

      if (!templateDirectoriosSnapshot.empty) {
        const templateDirectoriosDocRef =
          templateDirectoriosSnapshot.docs[0].ref;
        await updateDoc(templateDirectoriosDocRef, {
          fontColor: fontColor,
          templateColor: templateColor,
          fontStyle: selectedFontStyle.value,
          logo: selectedLogo,
          ciudad: selectedCity.value,
          setPortrait: setPortrait, // Agrega setPortrait al objeto
          publicidad: selectedPublicidad,

          timestamp: serverTimestamp(),
        });
      } else {
        await addDoc(templateDirectoriosRef, {
          userId: authUser.uid,
          fontColor: fontColor,
          templateColor: templateColor,
          fontStyle: selectedFontStyle.value,
          logo: selectedLogo,
          ciudad: selectedCity.value,
          setPortrait: setPortrait, // Agrega setPortrait al objeto
          publicidad: selectedPublicidad,

          timestamp: serverTimestamp(),
        });
      }

      const usuarioRef = doc(db, "usuarios", authUser.uid);

      await updateDoc(usuarioRef, {
        nombrePantallasDirectorio: firebase.firestore.FieldValue.delete(),
      });

      const nombresPantallasObject = {};
      nombrePantallasDirectorio.forEach((nombre, index) => {
        nombresPantallasObject[`nombrePantallasDirectorio.${index}`] = nombre;
      });
      await updateDoc(usuarioRef, nombresPantallasObject);

      const eventosRef = collection(db, "eventos");
      const eventosQuery = query(
        eventosRef,
        where("userId", "==", authUser.uid)
      );
      const eventosSnapshot = await getDocs(eventosQuery);

      const updatePromises = [];

      eventosSnapshot.forEach((doc) => {
        const eventoRef = doc.ref;
        const eventoData = doc.data();

        if (eventoRef && eventoData) {
          if (eventoData.personalizacionTemplate) {
            updatePromises.push(
              updateDoc(eventoRef, {
                personalizacionTemplate: personalizacionTemplate,
              })
            );
          } else {
            updatePromises.push(
              updateDoc(eventoRef, {
                personalizacionTemplate: personalizacionTemplate,
              })
            );
          }
        } else {
          console.error("Referencia de evento no válida:", doc.id);
        }
      });

      await Promise.all(updatePromises);

      alert("Información de personalización guardada con éxito.");
    } catch (error) {
      console.error(
        "Error al guardar la información de personalización y URL del logo:",
        error
      );
    }
  };

  const handlePublicidadChange = async (event) => {
    const file = event.target.files[0];
    const storageRef = ref(
      storage,
      `pantallaDirectorioPublicidad/${file.name}`
    );

    try {
      await uploadBytes(storageRef, file);
      const publicidadUrl = await getDownloadURL(storageRef);

      setSelectedPublicidad(publicidadUrl);
    } catch (error) {
      console.error(
        "Error al subir la imagen de publicidad a Firebase Storage:",
        error
      );
    }
  };

  return (
    <section className="pl-16 md:px-8 py-12">
      <div>
        <div className="p-5 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900">
            {/* AJUSTES DE PANTALLAS DIRECTORIO */}
            {t("screensDirectory.title")}
          </h2>
        </div>

        {/* Sección de personalización */}
        <section className="max-w-4xl p-6 mx-auto rounded-md shadow-md bg-gray-800 mt-7 pl-10 md:px-32">
          <h1 className="text-3x3 font-bold text-white capitalize mb-4">
            {/* templateCustomization */}
            {t("screensDirectory.templateCustomization")}
          </h1>
          <div className="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2">
            <div className="flex flex-col">
              <label className="text-white dark:text-gray-200 block mb-1">
                {/* Logo */}
                {t("screensDirectory.logo")}
              </label>
              <div className="flex items-center">
                <input
                  onChange={handleImageChange}
                  className="w-full py-2 px-3 border rounded-lg bg-gray-700 text-white"
                  type="file"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-white dark:text-gray-200 block mb-1">
                {/* Publicidad */}
                {t("screensDirectory.advertisement")}
              </label>
              <div className="flex items-center">
                <input
                  onChange={handlePublicidadChange}
                  className="w-full py-2 px-3 border rounded-lg bg-gray-700 text-white"
                  type="file"
                />
              </div>
              <p className="text-white dark:text-gray-200 block text-sm">
                {/* Desktop: (440px x 660x max) portrait: (520px x 1040px max) */}
                {t("screensDirectory.sizeInfo")}
              </p>
            </div>

            <div className="mb-4">
              <label className="text-white dark:text-gray-200 block mb-0.5">
                {/* Logo actual */}
                {t("screensDirectory.currentLogo")}
              </label>
              {selectedLogo && (
                <img src={selectedLogo} alt="Logo Actual" className="w-48" />
              )}
            </div>
            <div>
              <label className="text-white dark:text-gray-200 block mb-0.5">
                {/* Publicidad actual */}
                {t("screensDirectory.currentAdvertisement")}
              </label>
              {selectedPublicidad && (
                <img
                  src={selectedPublicidad}
                  alt="Publicidad Actual"
                  className="w-48"
                />
              )}
            </div>

            <div className="mb-4">
              <label className="text-white dark:text-gray-200">
                {/* Estilo de texto */}
                {t("screensDirectory.textStyle")}
              </label>
              <Select
                options={fontStyleOptions}
                value={selectedFontStyle}
                onChange={handleFontStyleChange}
                placeholder="Seleccionar estilo de texto"
              />
            </div>

            <div className="mb-4">
              <label className="text-white dark:text-gray-200">
                {/* Color de letra */}
                {t("screensDirectory.fontColor")}
              </label>
              <div className="flex items-center">
                <button
                  onClick={handleFontColorChange}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
                >
                  {/* Seleccionar Color */}
                  {t("screensDirectory.selectColor")}
                </button>
                {showFontColorPicker && (
                  <div className="absolute z-10">
                    <ChromePicker
                      color={fontColor}
                      onChange={handleColorChange}
                    />
                    <button
                      onClick={handleFontColorChange}
                      className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
                    >
                      {/* Listo */}
                      {t("screensDirectory.confirm")}
                    </button>
                  </div>
                )}
                <div
                  className="w-8 h-8 rounded-full ml-4"
                  style={{ backgroundColor: fontColor }}
                ></div>
              </div>
            </div>
          </div>
          {/* Sección para URL del clima y eventos del calendario */}
          <div className="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2">
            <div className="mb-4 flex flex-col">
              <label className="text-white dark:text-gray-200">
                {/* Seleccionar Ciudad */}
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
                required // Asegura que la ciudad sea obligatoria
              />
            </div>

            <div className="mb-4">
              <label className="text-white dark:text-gray-200">
                {/* Color de la plantilla */}
                {t("screensDirectory.templateColor")}
              </label>
              <div className="flex items-center">
                <button
                  onClick={handleTemplateColorChange}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
                >
                  {/* Seleccionar Color */}
                  {t("screensDirectory.selectColor")}
                </button>
                {showColorPicker && (
                  <div className="absolute z-10">
                    <ChromePicker
                      color={templateColor}
                      onChange={handleColorChange}
                    />
                    <button
                      onClick={handleTemplateColorChange}
                      className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
                    >
                      {/* Listo */}
                      {t("screensDirectory.confirm")}
                    </button>
                  </div>
                )}
                <div
                  className="w-8 h-8 rounded-full ml-4"
                  style={{ backgroundColor: templateColor }}
                ></div>
              </div>
            </div>
          </div>
          <div className="mb-4 flex flex-wrap">
            {/* Nombres de pantallas */}
            <div className="flex flex-col mr-4">
              <label className="text-white dark:text-gray-200 block mb-1">
                {/* Nombres de pantallas */}
                {t("screensDirectory.screenNames")}
              </label>
              {Array.from({ length: pd }, (_, index) => (
                <div className="flex items-center mb-2" key={index}>
                  <input
                    type="text"
                    placeholder={`Pantalla ${index + 1}`}
                    className="w-36 py-2 px-3 border rounded-lg bg-gray-700 text-white"
                    value={(nombrePantallasDirectorio[index] || "").slice(
                      0,
                      16
                    )}
                    onChange={(e) => {
                      const updatedNombres = [...nombrePantallasDirectorio];
                      updatedNombres[index] = e.target.value;
                      setNombrePantallasDirectorio(updatedNombres);
                    }}
                  />
                  <Link
                    href={`/pantallaDirec${index + 1}.html`}
                    target="_blank"
                    className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full ml-2"
                  >
                    URL
                  </Link>
                  <button
                    onClick={() => {
                      setSetPortrait((prevState) => !prevState);
                    }}
                    className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full ml-2"
                  >
                    {setPortrait
                      ? "Pantalla Vertical: activado"
                      : "Pantalla Vertical: desactivado"}
                  </button>
                </div>
              ))}
            </div>

            {/* Publicidad */}
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => {
                guardarInformacionPersonalizacion(selectedLogo);
              }}
              className="mx-5 px-6 py-2 leading-5 text-white transition-colors duration-200 transform bg-pink-500 rounded-md hover:bg-pink-700 focus:outline-none focus:bg-gray-600"
            >
              {/* Guardar */}
              {t("screensDirectory.save")}
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}

export default PantallasDirectorio;
