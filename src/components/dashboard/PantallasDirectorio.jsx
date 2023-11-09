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
} from "firebase/firestore";

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

function PantallasDirectorio() {
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
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [eventCheckboxStates, setEventCheckboxStates] = useState({});

  const [logo, setLogo] = useState(null);
  const [cityOptions, setCityOptions] = useState([
    { value: "New York", label: "New York" },
    { value: "Los Angeles", label: "Los Angeles" },
  ]);
  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        const eventosRef = collection(db, "eventos");
        const q = query(eventosRef, where("userId", "==", user.uid));
        const unsubscribeEvents = onSnapshot(q, (snapshot) => {
          const eventos = [];
          const checkboxStates = { ...eventCheckboxStates };
          snapshot.forEach((doc) => {
            const evento = {
              id: doc.id,
              ...doc.data(),
            };
            checkboxStates[evento.id] =
              checkboxStates[evento.id] !== undefined
                ? checkboxStates[evento.id]
                : false;
            eventos.push(evento);
          });
          setEvents(eventos);
          setEventCheckboxStates(checkboxStates);
        });

        return () => {
          unsubscribeEvents();
        };
      } else {
        setUser(null);
        setEvents([]);
        setEventCheckboxStates({});
      }
    });

    return () => {
      unsubscribe();
    };
  }, [eventCheckboxStates]);

  const handleCheckboxChange = (eventId) => {
    setEventCheckboxStates((prevState) => ({
      ...prevState,
      [eventId]: !prevState[eventId],
    }));
  };
  useEffect(() => {
    const filteredEvents = events.filter((event) => {
      return eventCheckboxStates[event.id];
    });
    setSelectedEvents(filteredEvents);
  }, [eventCheckboxStates, events]);

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

  const [selectedFontStyle, setSelectedFontStyle] = useState(null);

  const handleAddToCalendar = () => {
    const eventDescription = document.querySelector(
      'input[placeholder="Descripción del evento"]'
    ).value;
  };

  const handleScreen1Default = () => {
    setScreen1AspectRatio("16:9");
  };
  const handleScreen1UseThis = () => {};
  const handleScreen2Default = () => {
    setScreen2AspectRatio("9:16");
  };
  const handleScreen2UseThis = () => {};
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

  return (
    <section className="px-8 py-12">
      <div>
        <div className="p-5">
          <h1 className="mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl">
            Ajuste de pantallas directorio
          </h1>
        </div>

        <div className="flex justify-center space-x-44">
          {/* Pantalla 1 */}
          <div>
            <div
              className={`border border-black px-40 py-28 aspect-ratio-${screen1AspectRatio}`}
            >
              <h2>Tipo pantalla 1</h2>
              <p>Relación de aspecto: {screen1AspectRatio}</p>
            </div>
            <button
              onClick={handleScreen1Default}
              className="mb-2 bg-gray-300 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full"
            >
              Set Default
            </button>
            <button
              onClick={handleScreen1UseThis}
              className="mt-2 bg-gray-300 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full"
            >
              Use This
            </button>
          </div>

          {/* Pantalla 2 */}
          <div>
            <div
              className={`border border-black px-20 py-40 aspect-ratio-${screen2AspectRatio}`}
            >
              <h2>Tipo pantalla 2</h2>
              <p>Relación de aspecto: {screen2AspectRatio}</p>
            </div>
            <button
              onClick={handleScreen2Default}
              className="mb-2 bg-gray-300 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full"
            >
              Set Default
            </button>
            <button
              onClick={handleScreen2UseThis}
              className="mt-2 bg-gray-300 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full"
            >
              Use This
            </button>
          </div>
        </div>

        {/* Sección de personalización */}
        <section className="max-w-4xl p-6 mx-auto rounded-md shadow-md bg-gray-800 mt-20">
          <h1 className="text-xl font-bold text-white capitalize dark:text-white">
            Personalización del Template
          </h1>
          <div className="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2">
            <div className="mb-4">
              <label className="text-white dark:text-gray-200 block mb-1">
                Seleccionar Eventos
              </label>
              {events.map((event) => (
                <div key={event.id}>
                  <input
                    type="checkbox"
                    checked={eventCheckboxStates[event.id]}
                    onChange={() => handleCheckboxChange(event.id)}
                  />
                  <span
                    className={`text-white ${
                      !event.nombreEvento && "text-opacity-0"
                    }`}
                  >
                    {event.nombreEvento || "Nombre del Evento"}
                  </span>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <label className="text-white dark:text-gray-200 block mb-1">
                Logo
              </label>
              <div className="flex items-center">
                <input
                  onChange={(e) => setLogo(e.target.files[0])}
                  className="w-full py-2 px-3 border rounded-lg bg-gray-700 text-white"
                  type="file"
                />
              </div>
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

            <div>
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
              <div className="mb-4">
                <label className="text-white dark:text-gray-200">
                  Directorio de Eventos | URL
                </label>
                <input
                  className="block w-full text-sm border rounded-lg cursor-pointer text-gray-400 focus:outline-none bg-gray-700 border-gray-600 placeholder-gray-400"
                  type="url"
                  value={calendarEventURL}
                  onChange={(e) => setCalendarEventURL(e.target.value)}
                  placeholder="Ingrese la URL del Directorio de Eventos"
                />
              </div>
              <div className="mb-4">
                <label className="text-white dark:text-gray-200">
                  Agregar Evento al Calendario Personal
                </label>
                <input
                  className="block w-full text-sm border rounded-lg cursor-pointer text-gray-400 focus:outline-none bg-gray-700 border-gray-600 placeholder-gray-400"
                  type="text"
                  placeholder="Descripción del evento"
                />
                <button
                  onClick={handleAddToCalendar}
                  className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
                >
                  Agregar al Calendario
                </button>
              </div>
            </div>
          </div>

          {/* Sección de vista previa */}
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
              onClick={handlePreviewClick}
              className="px-6 py-2 leading-5 text-white transition-colors duration-200 transform bg-pink-500 rounded-md hover:bg-pink-700 focus:outline-none focus:bg-gray-600"
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
