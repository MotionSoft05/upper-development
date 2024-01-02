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
  const [cityOptions, setCityOptions] = useState([
    // Ciudades de México
    {
      value: "Aguascalientes, Aguascalientes, México",
      label: "Aguascalientes, Aguascalientes, México",
    },
    {
      value: "Cancún, Quintana Roo, México",
      label: "Cancún, Quintana Roo, México",
    },
    {
      value: "Chihuahua, Chihuahua, México",
      label: "Chihuahua, Chihuahua, México",
    },
    {
      value: "Ciudad de México, Ciudad de México, México",
      label: "Ciudad de México, Ciudad de México, México",
    },
    {
      value: "Guadalajara, Jalisco, México",
      label: "Guadalajara, Jalisco, México",
    },
    {
      value: "Hermosillo, Sonora, México",
      label: "Hermosillo, Sonora, México",
    },
    { value: "León, Guanajuato, México", label: "León, Guanajuato, México" },
    { value: "Mérida, Yucatán, México", label: "Mérida, Yucatán, México" },
    {
      value: "Monterrey, Nuevo León, México",
      label: "Monterrey, Nuevo León, México",
    },
    {
      value: "Morelia, Michoacán, México",
      label: "Morelia, Michoacán, México",
    },
    { value: "Puebla, Puebla, México", label: "Puebla, Puebla, México" },
    {
      value: "Querétaro, Querétaro, México",
      label: "Querétaro, Querétaro, México",
    },
    {
      value: "Saltillo, Coahuila, México",
      label: "Saltillo, Coahuila, México",
    },
    {
      value: "San Luis Potosí, San Luis Potosí, México",
      label: "San Luis Potosí, San Luis Potosí, México",
    },
    {
      value: "Tijuana, Baja California, México",
      label: "Tijuana, Baja California, México",
    },
    {
      value: "Toluca, Estado de México, México",
      label: "Toluca, Estado de México, México",
    },
    { value: "Torreón, Coahuila, México", label: "Torreón, Coahuila, México" },
    {
      value: "Tuxtla Gutiérrez, Chiapas, México",
      label: "Tuxtla Gutiérrez, Chiapas, México",
    },
    {
      value: "Veracruz, Veracruz, México",
      label: "Veracruz, Veracruz, México",
    },
    {
      value: "Zacatecas, Zacatecas, México",
      label: "Zacatecas, Zacatecas, México",
    },

    // Ciudades de Estados Unidos
    {
      value: "Austin, Texas, Estados Unidos",
      label: "Austin, Texas, Estados Unidos",
    },
    {
      value: "Charlotte, Carolina del Norte, Estados Unidos",
      label: "Charlotte, Carolina del Norte, Estados Unidos",
    },
    {
      value: "Chicago, Illinois, Estados Unidos",
      label: "Chicago, Illinois, Estados Unidos",
    },
    {
      value: "Columbus, Ohio, Estados Unidos",
      label: "Columbus, Ohio, Estados Unidos",
    },
    {
      value: "Dallas, Texas, Estados Unidos",
      label: "Dallas, Texas, Estados Unidos",
    },
    {
      value: "Denver, Colorado, Estados Unidos",
      label: "Denver, Colorado, Estados Unidos",
    },
    {
      value: "Fort Worth, Texas, Estados Unidos",
      label: "Fort Worth, Texas, Estados Unidos",
    },
    {
      value: "Houston, Texas, Estados Unidos",
      label: "Houston, Texas, Estados Unidos",
    },
    {
      value: "Indianapolis, Indiana, Estados Unidos",
      label: "Indianapolis, Indiana, Estados Unidos",
    },
    {
      value: "Jacksonville, Florida, Estados Unidos",
      label: "Jacksonville, Florida, Estados Unidos",
    },
    {
      value: "Los Angeles, California, Estados Unidos",
      label: "Los Angeles, California, Estados Unidos",
    },
    {
      value: "Nueva York, Nueva York, Estados Unidos",
      label: "Nueva York, Nueva York, Estados Unidos",
    },
    {
      value: "Filadelfia, Pensilvania, Estados Unidos",
      label: "Filadelfia, Pensilvania, Estados Unidos",
    },
    {
      value: "Phoenix, Arizona, Estados Unidos",
      label: "Phoenix, Arizona, Estados Unidos",
    },
    {
      value: "San Antonio, Texas, Estados Unidos",
      label: "San Antonio, Texas, Estados Unidos",
    },
    {
      value: "San Diego, California, Estados Unidos",
      label: "San Diego, California, Estados Unidos",
    },
    {
      value: "San Francisco, California, Estados Unidos",
      label: "San Francisco, California, Estados Unidos",
    },
    {
      value: "San José, California, Estados Unidos",
      label: "San José, California, Estados Unidos",
    },
    {
      value: "Seattle, Washington, Estados Unidos",
      label: "Seattle, Washington, Estados Unidos",
    },
    {
      value: "Washington, D.C., Estados Unidos",
      label: "Washington, D.C., Estados Unidos",
    },
  ]);

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
            const { fontColor, fontStyle, logo, templateColor, ciudad } =
              templateDirectoriosDoc;

            setFontColor(fontColor || "#000000");
            setSelectedFontStyle({
              value: fontStyle || "Arial",
              label: fontStyle || "Arial",
            });
            setSelectedLogo(logo || null);
            setTemplateColor(templateColor || "#D1D5DB");
            setSelectedCity({ value: ciudad, label: ciudad });
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
        console.error("selectedLogo es null. No se puede enviar a Firestore.");
        return;
      }

      const personalizacionTemplate = {
        fontColor: fontColor,
        templateColor: templateColor,
        fontStyle: selectedFontStyle.value,
        logo: selectedLogo,
        ciudad: selectedCity.value,
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

  return (
    <section className="px-5 md:px-32">
      <div>
        <div className="p-5">
          <h1 className="mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl">
            Ajuste de pantallas directorio
          </h1>
        </div>

        {/* Sección de personalización */}
        <section className="max-w-4xl p-6 mx-auto rounded-md shadow-md bg-gray-800">
          <h1 className="text-xl font-bold text-white capitalize dark:text-white">
            Personalización del Template
          </h1>
          <div className="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2">
            <div className="mb-4">
              <label className="text-white dark:text-gray-200 block">
                Logo
              </label>
              <div className="flex items-center">
                <input
                  onChange={handleImageChange}
                  className="w-full py-2 px-3 border rounded-lg bg-gray-700 text-white"
                  type="file"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-white dark:text-gray-200">
                Estilo de texto
              </label>
              <Select
                options={fontStyleOptions}
                value={selectedFontStyle}
                onChange={handleFontStyleChange}
                placeholder="Seleccionar estilo de texto"
              />
            </div>

            <div className="mb-4">
              <label className="text-white dark:text-gray-200 block mb-0.5">
                Logo Actual
              </label>
              {selectedLogo && (
                <img src={selectedLogo} alt="Logo Actual" className="w-48" />
              )}
            </div>

            <div className="mb-4">
              <label className="text-white dark:text-gray-200">
                Color de letra
              </label>
              <div className="flex items-center">
                <button
                  onClick={handleFontColorChange}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
                >
                  Seleccionar Color
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
                      Listo
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
                Seleccionar Ciudad
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
                Color de la plantilla
              </label>
              <div className="flex items-center">
                <button
                  onClick={handleTemplateColorChange}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
                >
                  Seleccionar Color
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
                      Listo
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
          <div className="mb-4">
            <label className="text-white dark:text-gray-200 block mb-1">
              Nombres de pantallas
            </label>
            <div className="flex flex-col">
              {Array.from({ length: pd }, (_, index) => (
                <div className="flex items-center mb-2" key={index}>
                  <input
                    type="text"
                    placeholder={`Pantalla ${index + 1}`}
                    className="w-36 py-2 px-3 border rounded-lg bg-gray-700 text-white"
                    value={nombrePantallasDirectorio[index] || ""}
                    onChange={(e) => {
                      const updatedNombres = [...nombrePantallasDirectorio];
                      updatedNombres[index] = e.target.value;
                      setNombrePantallasDirectorio(updatedNombres);
                    }}
                  />
                  <Link
                    href={`/pantallaDirec${index + 1}.html`}
                    target="_blank"
                    className="bg-gray-300 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full ml-2"
                  >
                    URL
                  </Link>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={() => {
                guardarInformacionPersonalizacion(selectedLogo);
              }}
              className="mx-5 px-6 py-2 leading-5 text-white transition-colors duration-200 transform bg-pink-500 rounded-md hover:bg-pink-700 focus:outline-none focus:bg-gray-600"
            >
              Guardar
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}

export default PantallasDirectorio;
