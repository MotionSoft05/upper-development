import React, { useState, useEffect } from "react";
import { ChromePicker } from "react-color";
import Select from "react-select";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCzD--npY_6fZcXH-8CzBV7UGzPBqg85y8",
  authDomain: "upper-a544e.firebaseapp.com",
  projectId: "upper-a544e",
  storageBucket: "upper-a544e.appspot.com",
  messagingSenderId: "665713417470",
  appId: "1:665713417470:web:73f7fb8ee518bea35999af",
  measurementId: "G-QTFQ55YY5D",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = getFirestore();

const obtenerHora = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

function PantallasSalon() {
  const [screen1AspectRatio, setScreen1AspectRatio] = useState("16:9");
  const [screen2AspectRatio, setScreen2AspectRatio] = useState("9:16");
  const [templateColor, setTemplateColor] = useState("#D1D5DB");
  const [fontColor, setFontColor] = useState("#000000");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontColorPicker, setShowFontColorPicker] = useState(false);
  const [selectedFontStyle, setSelectedFontStyle] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [currentHour, setCurrentHour] = useState(obtenerHora());
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [descripcion, setDescripcion] = useState("");
  const [caracteresRestantes, setCaracteresRestantes] = useState(130);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHour(obtenerHora());
    }, 1000);

    // Limpia el intervalo cuando el componente se desmonta para evitar posibles fugas de memoria
    return () => {
      clearInterval(interval);
    };
  }, []); // El array vacío asegura que este efecto se ejecute solo una vez, similar a componentDidMount

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "eventos"), (snapshot) => {
      const eventsData = [];
      snapshot.forEach((doc) => {
        eventsData.push({ id: doc.id, ...doc.data() });
      });
      setEvents(eventsData);
      setLoading(false);
    });

    // Limpiar el listener cuando el componente se desmonta
    return () => unsubscribe();
  }, []);

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

  const obtenerFecha = () => {
    const diasSemana = [
      "DOMINGO",
      "LUNES",
      "MARTES",
      "MIÉRCOLES",
      "JUEVES",
      "VIERNES",
      "SÁBADO",
    ];

    const meses = [
      "ENERO",
      "FEBRERO",
      "MARZO",
      "ABRIL",
      "MAYO",
      "JUNIO",
      "JULIO",
      "AGOSTO",
      "SEPTIEMBRE",
      "OCTUBRE",
      "NOVIEMBRE",
      "DICIEMBRE",
    ];

    const now = new Date();
    const diaSemana = diasSemana[now.getDay()];
    const dia = now.getDate();
    const mes = meses[now.getMonth()];
    const año = now.getFullYear();

    return `${diaSemana} ${dia} DE ${mes} ${año}`;
  };

  const handleScreen1Default = () => {
    setScreen1AspectRatio("16:9");
  };

  const handleScreen1UseThis = () => {};
  const handleScreen2UseThis = () => {};

  const handleScreen2Default = () => {
    setScreen2AspectRatio("9:16");
  };
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
  };

  const handlePreviewClick = () => {
    setPreviewVisible(true);
  };

  const handleClosePreview = () => {
    setPreviewVisible(false);
  };
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      // `reader.result` contiene la URL de la imagen seleccionada
      const imageUrl = reader.result;
      setSelectedLogo(imageUrl);
    };

    if (file) {
      // Lee el archivo como un blob y dispara el evento `onloadend`
      reader.readAsDataURL(file);
    }
  };

  const dividirTexto = (texto, caracteresPorLinea) => {
    const lineas = [];
    let inicio = 0;
    while (inicio < texto.length) {
      let fin = inicio + caracteresPorLinea;
      if (fin >= texto.length) {
        fin = texto.length;
      } else {
        while (fin > inicio && texto[fin] !== " ") {
          fin--;
        }
        if (fin === inicio) {
          fin = inicio + caracteresPorLinea;
        }
      }
      lineas.push(texto.slice(inicio, fin));
      inicio = fin + 1;
    }
    return lineas;
  };

  return (
    <section className="px-8 py-12">
      <div>
        <div className="p-5">
          <h1 className="mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl">
            Ajuste de pantallas salon
          </h1>
        </div>

        <div className="flex justify-center space-x-44">
          <div>
            <div
              className={`border border-black px-40 py-28 aspect-ratio-${screen1AspectRatio}`}
            >
              <h2>Tipo pantalla 1</h2>
              <p>Relación de aspecto: {screen1AspectRatio}</p>
            </div>
            <button
              onClick={handleScreen1Default}
              className="mb-2 bg-gray-300 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full active:bg-gray-500"
            >
              Set Default
            </button>
            <button
              onClick={handleScreen1UseThis}
              className="mt-2 bg-gray-300 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full active:bg-gray-500"
            >
              Use This
            </button>
          </div>

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

        <section className="max-w-4xl p-6 mx-auto rounded-md shadow-md bg-gray-800 mt-20">
          <h1 className="text-2xl font-bold text-white capitalize mb-4">
            Personalización del Template
          </h1>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="mb-4">
              <label className="text-white dark:text-gray-200 block mb-1">
                Seleccionar Evento
              </label>
              <select
                className="w-full py-2 px-3 border rounded-lg bg-gray-700 text-white text-red-500"
                value={selectedEvent ? selectedEvent.id : ""}
                onChange={(e) => {
                  const eventId = e.target.value;
                  const event = events.find((event) => event.id === eventId);
                  setSelectedEvent(event);
                }}
              >
                <option value="">Seleccionar Evento</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.nombreEvento}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="text-white dark:text-gray-200 block mb-1">
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
              <label className="text-white dark:text-gray-200 block mb-1">
                Color de letra
              </label>
              <div className="flex items-center">
                <button
                  onClick={handleFontColorChange}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md mr-4"
                >
                  Seleccionar Color
                </button>
                {showFontColorPicker && (
                  <div className="relative">
                    <ChromePicker
                      color={fontColor}
                      onChange={handleColorChange}
                    />
                    <button
                      onClick={handleFontColorChange}
                      className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md mt-2"
                    >
                      Listo
                    </button>
                  </div>
                )}
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: fontColor }}
                ></div>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-white dark:text-gray-200 block mb-1">
                Color de la plantilla
              </label>
              <div className="flex items-center">
                <button
                  onClick={handleTemplateColorChange}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md mr-4"
                >
                  Seleccionar Color
                </button>
                {showColorPicker && (
                  <div className="relative">
                    <ChromePicker
                      color={templateColor}
                      onChange={handleColorChange}
                    />
                    <button
                      onClick={handleTemplateColorChange}
                      className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md mt-2"
                    >
                      Listo
                    </button>
                  </div>
                )}
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: templateColor }}
                ></div>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-white dark:text-gray-200 block mb-1">
                Descripción del Evento
              </label>
              <textarea
                className="w-full py-2 px-3 border rounded-lg bg-gray-700 text-white"
                value={descripcion}
                onChange={(e) => {
                  const texto = e.target.value;
                  if (texto.length <= 130) {
                    setDescripcion(texto);
                    setCaracteresRestantes(130 - texto.length);
                  }
                }}
                placeholder="Ingrese la descripción del evento"
              />
              <p className="text-gray-300 text-sm mt-2">
                Caracteres restantes: {caracteresRestantes}
              </p>
            </div>
            <div className="mb-4">
              <label className="text-white dark:text-gray-200 block mb-1">
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

          <div className="mt-6">
            <label className="text-white dark:text-gray-200 block mb-1">
              Definir nombre de monitor de salones:
            </label>
            <div className="flex mt-2">
              <div className="mr-4">
                <p className="text-white mb-1">SALON A</p>
                <input
                  className="w-full py-2 px-3 border rounded-lg bg-gray-700 text-white"
                  type="text"
                />
              </div>
              <div className="mr-4">
                <p className="text-white mb-1">SALON B</p>
                <input
                  className="w-full py-2 px-3 border rounded-lg bg-gray-700 text-white"
                  type="text"
                />
              </div>
              <div>
                <p className="text-white mb-1">SALON C</p>
                <input
                  className="w-full py-2 px-3 border rounded-lg bg-gray-700 text-white"
                  type="text"
                />
              </div>
            </div>
          </div>

          {previewVisible && (
            <div className="fixed top-0 left-0 flex items-center justify-center w-screen h-screen bg-black bg-opacity-80 z-50">
              <div className="bg-white w-2/4 p-6 rounded-md shadow-lg text-black">
                <div className="flex items-center justify-between">
                  {selectedLogo && (
                    <img
                      src={selectedLogo}
                      alt="Logo"
                      className="h-20 max-w-full mr-4"
                    />
                  )}
                  <h1 className=" text-4xl font-bold">Salon ejemplo</h1>
                </div>
                <div className="bg-gradient-to-t from-gray-50  to-white text-gray-50">
                  <div className="">
                    <div className="text-3xl font-extrabold bg-gradient-to-r from-custom to-Second px-20">
                      {/* Título */}
                      <h2 className="text-white">
                        {selectedEvent
                          ? selectedEvent.nombreEvento.toUpperCase()
                          : "TÍTULO DEL EVENTO"}
                      </h2>
                    </div>
                    <div className="flex justify-between text-black">
                      {/* Imagen a la izquierda */}
                      <div className="flex items-center">
                        <img
                          src="/img/imgTemplate.png" // Reemplaza con la ruta de tu imagen
                          alt="imgTemplate"
                          className="h-15"
                        />
                        <div className="space-y-5 pl-5">
                          <div>
                            <h1>Sesión:</h1>
                            {/* Mostrar la hora inicial real del evento */}
                            <p>
                              {selectedEvent
                                ? selectedEvent.horaInicialReal
                                : "Hora Inicial"}
                              hrs.
                            </p>
                          </div>
                          <div className="max-w-xs">
                            {" "}
                            {/* Ajusta el ancho máximo según tus necesidades */}
                            <h1>
                              {selectedEvent
                                ? selectedEvent.tipoEvento
                                : "Tipo de Evento Desconocido"}
                            </h1>
                            <div className="text-center flex px-0">
                              {descripcion && (
                                <div>
                                  {dividirTexto(descripcion, 40).map(
                                    (linea, index) => (
                                      <p key={index} className="text-left">
                                        {linea}
                                      </p>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div></div>
                    </div>
                    <div>
                      <div className=" text-2xl font-semibold mt-1  text-center bg-gradient-to-r from-custom  to-Second text-white justify-between flex px-20 ">
                        <p>{obtenerFecha()}</p> <p>{currentHour}</p>{" "}
                      </div>
                    </div>
                  </div>
                </div>
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

export default PantallasSalon;
