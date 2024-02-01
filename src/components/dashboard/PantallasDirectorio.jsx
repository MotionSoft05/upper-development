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
  const [selectedPublicidad, setSelectedPublicidad] = useState(null);
  const [cityOptions, setCityOptions] = useState([
    // Ciudades de México
    { value: "Aguascalientes", label: "Aguascalientes" },
    { value: "Cancún", label: "Cancún" },
    { value: "Chihuahua", label: "Chihuahua" },
    { value: "Ciudad de México", label: "Ciudad de México" },
    { value: "Guadalajara", label: "Guadalajara" },
    { value: "Hermosillo", label: "Hermosillo" },
    { value: "León", label: "León" },
    { value: "Mérida", label: "Mérida" },
    { value: "Monterrey", label: "Monterrey" },
    { value: "Morelia", label: "Morelia" },
    { value: "Puebla", label: "Puebla" },
    { value: "Querétaro", label: "Querétaro" },
    { value: "Saltillo", label: "Saltillo" },
    { value: "San Luis Potosí", label: "San Luis Potosí" },
    { value: "Tijuana", label: "Tijuana" },
    { value: "Toluca", label: "Toluca" },
    { value: "Torreón", label: "Torreón" },
    { value: "Tuxtla Gutiérrez", label: "Tuxtla Gutiérrez" },
    { value: "Veracruz", label: "Veracruz" },
    { value: "Zacatecas", label: "Zacatecas" },
    { value: "Buenos Aires", label: "Buenos Aires" },

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
    <section className="px-8 py-12">
      <div>
        <div className="p-5 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900">
            AJUSTES DE PANTALLAS DIRECTORIO
          </h2>
        </div>

        {/* Sección de personalización */}
        <section className="max-w-4xl p-6 mx-auto rounded-md shadow-md bg-gray-800 mt-7">
          <h1 className="text-3x3 font-bold text-white capitalize mb-4">
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

            <div className="flex flex-col">
              <label className="text-white dark:text-gray-200 block mb-1">
                Publicidad
              </label>
              <div className="flex items-center">
                <input
                  onChange={handlePublicidadChange}
                  className="w-full py-2 px-3 border rounded-lg bg-gray-700 text-white"
                  type="file"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-white dark:text-gray-200 block mb-0.5">
                Logo actual
              </label>
              {selectedLogo && (
                <img src={selectedLogo} alt="Logo Actual" className="w-48" />
              )}
            </div>
            <div>
              <label className="text-white dark:text-gray-200 block mb-0.5">
                Publicidad actual
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
          <div className="mb-4 flex flex-wrap">
            {/* Nombres de pantallas */}
            <div className="flex flex-col mr-4">
              <label className="text-white dark:text-gray-200 block mb-1">
                Nombres de pantallas
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
                    className="bg-gray-300 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full ml-2"
                  >
                    URL
                  </Link>
                  <button
                    onClick={() => {
                      setSetPortrait((prevState) => !prevState);
                    }}
                    className="bg-gray-300 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full ml-2"
                  >
                    {setPortrait ? "Desactivar Portrait" : "Activar Portrait"}
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
              Guardar
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}

export default PantallasDirectorio;
