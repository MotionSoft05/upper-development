/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import { ChromePicker } from "react-color";
import Select from "react-select";
import axios from "axios";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import {
  getFirestore,
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
  apiKey: "AIzaSyCzD--npY_6fZcXH-8CzBV7UGzPBqg85y8",
  authDomain: "upper-a544e.firebaseapp.com",
  projectId: "upper-a544e",
  storageBucket: "upper-a544e.appspot.com",
  messagingSenderId: "665713417470",
  appId: "1:665713417470:web:73f7fb8ee518bea35999af",
  measurementId: "G-QTFQ55YY5D",
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const storage = getStorage();

function PantallasDirectorio() {
  const [nombrePantallasDirectorio, setNombrePantallasDirectorio] = useState(
    []
  );
  const [pd, setPd] = useState(0);
  const [user, setUser] = useState(null);
  const [screen1AspectRatio, setScreen1AspectRatio] = useState("16:9");
  const [screen2AspectRatio, setScreen2AspectRatio] = useState("9:16");
  const [templateColor, setTemplateColor] = useState("#D1D5DB");
  const [fontColor, setFontColor] = useState("#000000");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontColorPicker, setShowFontColorPicker] = useState(false);
  const [weatherURL, setWeatherURL] = useState("");
  const [calendarEventURL, setCalendarEventURL] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(obtenerHora());
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedLogo, setSelectedLogo] = useState(null);

  const [logo, setLogo] = useState(null);
  const [cityOptions, setCityOptions] = useState([
    { value: "New York", label: "New York" },
    { value: "Los Angeles", label: "Los Angeles" },
  ]);
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

            // Escuchar cambios en los nombres de las pantallas
            const unsubscribe = onSnapshot(usuarioRef, (doc) => {
              const data = doc.data();
              if (data && data.nombrePantallasDirectorio) {
                const nombres = Object.values(data.nombrePantallasDirectorio);
                setNombrePantallasDirectorio(nombres);
              }
            });

            // Importante: Detener la escucha cuando el componente se desmonta
            return () => unsubscribe();
          }
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (selectedCity) {
      setIsLoading(true);
      setError(null);

      const apiKey = "d6bfb64ec94a413cabc181954232010";
      const baseUrl = "http://api.weatherapi.com/v1";

      axios
        .get(`${baseUrl}/current.json?key=${apiKey}&q=${selectedCity.value}`)
        .then((response) => {
          console.log("Datos del clima:", response.data);
          setWeatherData(response.data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error al obtener datos del clima:", error);
          setError("No se pudo obtener la información del clima");
          setIsLoading(false);
        });
    }
  }, [selectedCity]);

  const fontStyleOptions = [
    { value: "Arial", label: "Arial" },
    { value: "Times New Roman", label: "Times New Roman" },
    { value: "Verdana", label: "Verdana" },
    { value: "Rockwell", label: "Rockwell" },
    { value: "Helvetica", label: "Helvetica" },
    { value: "Courier New", label: "Courier New" },
    { value: "Georgia", label: "Georgia" },
    { value: "Tahoma", label: "Tahoma" },
    { value: "Trebuchet MS", label: "Trebuchet MS" },
    { value: "Palatino", label: "Palatino" },
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

  const handlePreviewClick = () => {
    setPreviewVisible(true);
  };

  const handleClosePreview = () => {
    setPreviewVisible(false);
  };
  const obtenerDia = () => {
    const diasSemana = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    const now = new Date();
    const diaSemana = diasSemana[now.getDay()];
    return diaSemana;
  };

  const obtenerFecha = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}`;
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

      console.log("Usuario autenticado:", authUser);

      if (!selectedLogo) {
        console.error("selectedLogo es null. No se puede enviar a Firestore.");
        return;
      }

      const personalizacionTemplate = {
        fontColor: fontColor,
        templateColor: templateColor,
        fontStyle: selectedFontStyle.value,
        logo: selectedLogo,
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
          timestamp: serverTimestamp(),
        });
      } else {
        await addDoc(templateDirectoriosRef, {
          userId: authUser.uid,
          fontColor: fontColor,
          templateColor: templateColor,
          fontStyle: selectedFontStyle.value,
          logo: selectedLogo,
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
        <section className="max-w-4xl p-6 mx-auto rounded-md shadow-md bg-gray-800 ">
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
            <div>
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
            <div>
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
          {/* Sección para URL del clima y eventos del calendario */}
          <div className="">
            <h1 className="text-xl font-bold text-white capitalize dark:text-white">
              Directorio de Eventos
            </h1>
            <div className="mt-4">
              <div className="mb-4">
                <label className="text-white dark:text-gray-200">
                  Seleccionar Ciudad
                </label>
                <Select
                  options={cityOptions}
                  value={selectedCity}
                  onChange={setSelectedCity}
                  placeholder="Seleccione una ciudad"
                />
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="text-white dark:text-gray-200 block mb-1">
              Nombres de pantallas
            </label>
            <div className="flex flex-col">
              {Array.from({ length: pd }, (_, index) => (
                // eslint-disable-next-line react/jsx-key
                <div className="flex">
                  <input
                    key={index}
                    type="text"
                    placeholder={`Pantalla ${index + 1}`}
                    className="w-48 py-2 px-3 border rounded-lg bg-gray-700 text-white mb-2"
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
                    className="bg-gray-300 hover:bg-gray-500 text-white font-bold py-2 px-4  active:bg-gray-500"
                  >
                    URL
                  </Link>
                </div>
              ))}
            </div>
          </div>
          ;{/* Sección de vista previa */}
          {previewVisible && (
            <div className="fixed top-0 left-0 flex items-center justify-center w-screen h-screen bg-black bg-opacity-80 z-50">
              <div className="bg-white w-2/4  p-6 rounded-md shadow-lg text-black  ">
                <div className="flex justify-between items-center">
                  {/* Logo en la esquina superior izquierda */}
                  <div className="">
                    {logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={URL.createObjectURL(logo)}
                        alt="Logo"
                        className="h-28 mb-2"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src="/img/fiestamericana.png"
                        alt="Logo"
                        className="h-15"
                      />
                    )}
                  </div>

                  <div
                    className="flex flex-col items-center"
                    style={{
                      color: fontColor,
                      fontFamily: selectedFontStyle
                        ? selectedFontStyle.value
                        : "Arial",
                    }}
                  >
                    <p className="text-2xl text-center font-semibold mb-2">
                      {`${obtenerDia()} ${obtenerFecha()} - ${currentTime}`}
                    </p>
                    <h1 className="text-4xl font-bold">Eventos del día</h1>
                  </div>

                  <div className="flex flex-col" style={{ color: fontColor }}>
                    {isLoading ? (
                      <p>Cargando datos del clima...</p>
                    ) : weatherData &&
                      weatherData.current &&
                      weatherData.current.temp_c ? (
                      <p className="text-3xl font-bold">
                        {weatherData.current.temp_c} °C
                      </p>
                    ) : (
                      <p>No se pudo obtener la información del clima</p>
                    )}
                  </div>
                </div>
                <div className="bg-gradient-to-t from-gray-50  to-white text-gray-50">
                  <div className="">
                    <div
                      className={` text-white text-2xl font-semibold mt-1 text-center justify-between flex px-20 mb-4 rounded-t-xl`}
                      style={{
                        color: fontColor,
                        backgroundColor: templateColor,
                        fontFamily: selectedFontStyle
                          ? selectedFontStyle.value
                          : "Arial",
                      }}
                    >
                      {/* Título */}
                      <h2 className=" text-white"> </h2>
                    </div>
                    <div className=" text-black">
                      {/* Imagen a la izquierda */}
                      <div
                        className="flex flex-col
                      "
                      >
                        <div className="flex items-center border-b border-black w-full">
                          <div className="space-y-5 pl-5 flex-grow">
                            {selectedEvents &&
                              selectedEvents.map((event) => {
                                return (
                                  <div
                                    key={event.id}
                                    className="flex items-center space-x-4"
                                  >
                                    {/* Imagen a la izquierda */}
                                    <img
                                      src={event.images[0]}
                                      alt={event.nombreEvento}
                                      style={{
                                        width: "130px",
                                        height: "110px",
                                      }}
                                    />

                                    {/* Detalles del evento */}
                                    <div
                                      style={{
                                        color: fontColor,
                                        fontFamily: selectedFontStyle
                                          ? selectedFontStyle.value
                                          : "Arial",
                                      }}
                                    >
                                      {/* Aplicando el color seleccionado */}
                                      <h3>{event.nombreEvento}</h3>
                                      <p>{event.tipoEvento}</p>
                                      <p>{event.lugar}</p>
                                      {/* Agrega más detalles según sea necesario */}
                                      <div className="text-right">
                                        <p>{event.horaInicialReal}</p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      {/* Fecha y hora en la esquina inferior */}

                      <div
                        className={`text-2xl font-semibold mt-1 text-center text-white bg-black justify-between flex px-20 rounded-b-xl`}
                        style={{
                          color: fontColor,
                          backgroundColor: templateColor,
                          fontFamily: selectedFontStyle
                            ? selectedFontStyle.value
                            : "Arial",
                        }}
                      >
                        <p> </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p
                    className=""
                    style={{
                      color: fontColor,
                      fontFamily: selectedFontStyle
                        ? selectedFontStyle.value
                        : "Arial",
                    }}
                  >
                    Grupo renueca el mejor programa de recompensa para
                    asistentes ejec
                  </p>
                  <img
                    src="/img/licensed-image.jpeg"
                    alt="Logo"
                    className="h-12"
                  />
                </div>
                {/* Botón para volver atrás */}
                <button
                  onClick={handleClosePreview}
                  className="absolute top-4 right-4 bg-gray-300 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full"
                >
                  Volver atrás
                </button>
              </div>
            </div>
          )}
          <div className="flex justify-end mt-6">
            <button
              onClick={handlePreviewClick}
              className="mx-5 px-6 py-2 leading-5 text-white transition-colors duration-200 transform bg-pink-500 rounded-md hover:bg-pink-700 focus:outline-none focus:bg-gray-600"
            >
              Vista Previa
            </button>
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
