/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useRef } from "react";
import { ChromePicker } from "react-color";
import Select from "react-select";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import {
  getFirestore,
  collection,
  query,
  where,
  updateDoc,
  doc,
  getDocs,
  addDoc,
  collection as firestoreCollection,
  serverTimestamp,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes, getStorage } from "firebase/storage";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
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

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = getFirestore();
const storage = getStorage();

const obtenerHora = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

function PantallasSalon() {
  const [nombrePantallas, setNombrePantallas] = useState([]);
  const [ps, setPs] = useState(0);
  const [screenNames, setScreenNames] = useState([]);
  const [screen1AspectRatio, setScreen1AspectRatio] = useState("16:9");
  const [screen2AspectRatio, setScreen2AspectRatio] = useState("9:16");
  const [templateColor, setTemplateColor] = useState("#D1D5DB");
  const [fontColor, setFontColor] = useState("#000000");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontColorPicker, setShowFontColorPicker] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [currentHour, setCurrentHour] = useState(obtenerHora());
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedEventImageUrl, setSelectedEventImageUrl] = useState(null);
  const [pantallasUsuario, setPantallasUsuario] = useState([]);

  useEffect(() => {
    if (selectedEvent && selectedEvent.imagenUrl) {
      setSelectedEventImageUrl(selectedEvent.imagenUrl);
    } else {
      setSelectedEventImageUrl("/img/defaultEventImage.png");
    }
  }, [selectedEvent]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHour(obtenerHora());
    }, 1000);
    return () => {
      clearInterval(interval);
    };
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

  const [selectedFontStyle, setSelectedFontStyle] = useState(
    fontStyleOptions[0]
  );

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const authUser = firebase.auth().currentUser;

        if (authUser) {
          const usuariosRef = collection(db, "usuarios");
          const usuariosQuery = query(
            usuariosRef,
            where("email", "==", authUser.email)
          );
          const usuariosSnapshot = await getDocs(usuariosQuery);

          if (!usuariosSnapshot.empty) {
            const user = usuariosSnapshot.docs[0].data();
            const numberOfScreens = user.ps || 0;

            // Cambio aquí: Usar los nombres de pantallas de la colección
            const nombresPantallasColeccion = user.nombrePantallas || [];

            // Asegurarnos de que tengamos suficientes nombres para el número de pantallas
            const namesArray = Array.from(
              { length: numberOfScreens },
              (_, index) =>
                nombresPantallasColeccion[index] || `Pantalla ${index + 1}`
            );

            setNombrePantallas(namesArray);
            setPs(numberOfScreens);
          }
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
      }
    };

    fetchUserData();
  }, []);

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

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    const storageRef = ref(storage, `pantallaSalonLogos/${file.name}`);

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

      const templateSalonesRef = collection(db, "TemplateSalones");
      const templateSalonesQuery = query(
        templateSalonesRef,
        where("userId", "==", authUser.uid)
      );
      const templateSalonesSnapshot = await getDocs(templateSalonesQuery);

      if (!templateSalonesSnapshot.empty) {
        const templateSalonesDocRef = templateSalonesSnapshot.docs[0].ref;
        await updateDoc(templateSalonesDocRef, {
          fontColor: fontColor,
          templateColor: templateColor,
          fontStyle: selectedFontStyle.value,
          logo: selectedLogo,
          timestamp: serverTimestamp(),
        });
      } else {
        await addDoc(templateSalonesRef, {
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
        nombrePantallas: firebase.firestore.FieldValue.delete(),
      });

      const nombresPantallasObject = {};
      nombrePantallas.forEach((nombre, index) => {
        nombresPantallasObject[`nombrePantallas.${index}`] = nombre;
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

  const handlePreviewClick = () => {
    setPreviewVisible(true);
  };

  const handleClosePreview = () => {
    setPreviewVisible(false);
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

  function getTextWidth(text, font) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = font;

    const metrics = context.measureText(text);
    return metrics.width;
  }

  const [sliderRef] = useKeenSlider({
    loop: true,
  });

  const [isPortrait, setIsPortrait] = useState(true);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(orientation: portrait)");
    const handleOrientationChange = (event) => {
      setIsPortrait(event.matches);
    };
    handleOrientationChange(mediaQuery);
    mediaQuery.addListener(handleOrientationChange);
    return () => {
      mediaQuery.removeListener(handleOrientationChange);
    };
  }, []);

  return (
    <section className="px-8 py-12">
      <div>
        <div className="p-5">
          <h1 className="mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl">
            Ajuste de pantallas salon
          </h1>
        </div>

        <section className="max-w-4xl p-6 mx-auto rounded-md shadow-md bg-gray-800 mt-20">
          <h1 className="text-2xl font-bold text-white capitalize mb-4">
            Personalización del Template
          </h1>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="mb-4">
              <label className="text-white dark:text-gray-200 block mb-0.5">
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
            <div className="mb-4">
              <label className="text-white dark:text-gray-200 block mb-1">
                Nombres de pantallas
              </label>
              <div className="flex flex-col">
                {Array.from({ length: ps }, (_, index) => (
                  <div className="flex" key={index}>
                    <input
                      type="text"
                      placeholder={`Pantalla ${index + 1}`}
                      className="w-48 py-2 px-3 border rounded-lg bg-gray-700 text-white mb-2"
                      value={nombrePantallas[index] || ""}
                      onChange={(e) => {
                        const updatedNombres = [...nombrePantallas];
                        updatedNombres[index] = e.target.value;
                        setNombrePantallas(updatedNombres);
                      }}
                    />
                    <Link
                      href={`/pantalla${index + 1}.html`}
                      target="_blank"
                      className="bg-gray-300 hover:bg-gray-500 text-white font-bold py-2 px-4  active:bg-gray-500"
                    >
                      URL
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {isPortrait ? (
            <>
              {previewVisible && (
                <section className="relative z-10 inset-0 w-full min-h-screen md:fixed sm:fixed min-[120px]:fixed bg-white">
                  <div className="bg-white  text-black h-full flex flex-col justify-center">
                    <div className="flex items-center justify-between">
                      {selectedLogo && (
                        <img src={selectedLogo} alt="Logo" className="w-96" />
                      )}
                      <h1
                        style={{
                          color: fontColor,
                          fontFamily: selectedFontStyle
                            ? selectedFontStyle.value
                            : "Arial",
                        }}
                      >
                        {selectedEvent ? selectedEvent.lugar : "SALON portada"}
                      </h1>
                    </div>
                    <div className="bg-gradient-to-t from-gray-50  to-white text-gray-50">
                      <div className="mx-2">
                        <div
                          className={`text-white py-5 text-5xl font-bold px-20 rounded-t-xl`}
                          style={{
                            color: fontColor,
                            backgroundColor: templateColor,
                            fontFamily: selectedFontStyle
                              ? selectedFontStyle.value
                              : "Arial",
                          }}
                        >
                          <h2>
                            {selectedEvent
                              ? selectedEvent.nombreEvento.toUpperCase()
                              : "TÍTULO DEL EVENTO"}
                          </h2>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 text-black">
                          <div className="mr-4 my-4">
                            {selectedEvent &&
                            selectedEvent.images.length > 0 ? (
                              <>
                                <div className="mr-4">
                                  <div ref={sliderRef} className="keen-slider">
                                    {selectedEvent.images.map(
                                      (image, index) => (
                                        // eslint-disable-next-line react/jsx-key
                                        <div className="keen-slider__slide number-slide1 flex items-center justify-center">
                                          <img
                                            key={index}
                                            src={image}
                                            alt={`Imagen ${index + 1}`}
                                            className="h-10"
                                          />
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <p>No hay imágenes disponibles</p>
                            )}
                          </div>

                          <div
                            className=" space-y-8 pl-10 mb-12 my-4"
                            style={{
                              color: fontColor,
                              fontFamily: selectedFontStyle
                                ? selectedFontStyle.value
                                : "Arial",
                            }}
                          >
                            <div>
                              <h1 className="text-4xl font-bold">Sesión:</h1>
                              <p className="text-4xl font-bold">
                                {selectedEvent ? (
                                  <span className="text-4xl font-bold">
                                    {selectedEvent.horaInicialReal}
                                  </span>
                                ) : (
                                  "Hora Inicial"
                                )}{" "}
                                <span className="text-2x1">hrs.</span>
                              </p>
                            </div>
                            <div
                              className="max-w-xs"
                              style={{
                                fontFamily: selectedFontStyle
                                  ? selectedFontStyle.value
                                  : "Arial",
                              }}
                            >
                              {/* Tipo de evento y descripción */}
                              <h1 className="text-4xl font-bold">
                                {selectedEvent
                                  ? selectedEvent.tipoEvento
                                  : "Tipo de Evento Desconocido"}
                              </h1>
                              <div className="text-center flex px-0">
                                {selectedEvent && selectedEvent.description && (
                                  <div>
                                    {dividirTexto(
                                      selectedEvent.description,
                                      40
                                    ).map((linea, index) => (
                                      <p key={index} className="text-left">
                                        {linea}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div
                            className={`text-4xl py-4 font-semibold mt-1 text-center  justify-between flex px-20 rounded-b-xl`}
                            style={{
                              color: fontColor,
                              backgroundColor: templateColor,
                              fontFamily: selectedFontStyle
                                ? selectedFontStyle.value
                                : "Arial",
                            }}
                          >
                            <p style={{ color: fontColor }}>{obtenerFecha()}</p>
                            <p style={{ color: fontColor }}>{currentHour}</p>
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
                </section>
              )}
            </>
          ) : (
            <>
              {previewVisible && (
                <section className="relative z-10 inset-0 w-full min-h-screen md:fixed sm:fixed min-[120px]:fixed bg-white">
                  <div className="bg-white  text-black h-full flex flex-col justify-center">
                    <div className="flex items-center justify-between">
                      {selectedLogo && (
                        <img src={selectedLogo} alt="Logo" className="w-96" />
                      )}
                      <h1
                        style={{
                          color: fontColor,
                          fontFamily: selectedFontStyle
                            ? selectedFontStyle.value
                            : "Arial",
                        }}
                      >
                        {selectedEvent ? selectedEvent.lugar : "SALON EJEMPLO"}
                      </h1>
                    </div>
                    <div className="bg-gradient-to-t from-gray-50  to-white text-gray-50">
                      <div className="mx-2">
                        <div
                          className={`text-white py-5 text-5xl font-bold px-20 rounded-t-xl`}
                          style={{
                            color: fontColor,
                            backgroundColor: templateColor,
                            fontFamily: selectedFontStyle
                              ? selectedFontStyle.value
                              : "Arial",
                          }}
                        >
                          <h2>
                            {selectedEvent
                              ? selectedEvent.nombreEvento.toUpperCase()
                              : "TÍTULO DEL EVENTO"}
                          </h2>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 text-black">
                          <div className="mr-4 my-4">
                            {selectedEvent &&
                            selectedEvent.images.length > 0 ? (
                              <>
                                <div className="mr-4">
                                  <div ref={sliderRef} className="keen-slider">
                                    {selectedEvent.images.map(
                                      (image, index) => (
                                        // eslint-disable-next-line react/jsx-key
                                        <div className="keen-slider__slide number-slide1 flex items-center justify-center">
                                          <img
                                            key={index}
                                            src={image}
                                            alt={`Imagen ${index + 1}`}
                                            className="h-10"
                                          />
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <p>No hay imágenes disponibles</p>
                            )}
                          </div>

                          <div
                            className=" space-y-8 pl-10 mb-12 my-4"
                            style={{
                              color: fontColor,
                              fontFamily: selectedFontStyle
                                ? selectedFontStyle.value
                                : "Arial",
                            }}
                          >
                            <div>
                              <h1 className="text-4xl font-bold">Sesión:</h1>
                              <p className="text-4xl font-bold">
                                {selectedEvent ? (
                                  <span className="text-4xl font-bold">
                                    {selectedEvent.horaInicialReal}
                                  </span>
                                ) : (
                                  "Hora Inicial"
                                )}{" "}
                                <span className="text-2x1">hrs.</span>
                              </p>
                            </div>
                            <div
                              className="max-w-xs"
                              style={{
                                fontFamily: selectedFontStyle
                                  ? selectedFontStyle.value
                                  : "Arial",
                              }}
                            >
                              {/* Tipo de evento y descripción */}
                              <h1 className="text-4xl font-bold">
                                {selectedEvent
                                  ? selectedEvent.tipoEvento
                                  : "Tipo de Evento Desconocido"}
                              </h1>
                              <div className="text-center flex px-0">
                                {selectedEvent && selectedEvent.description && (
                                  <div>
                                    {dividirTexto(
                                      selectedEvent.description,
                                      40
                                    ).map((linea, index) => (
                                      <p key={index} className="text-left">
                                        {linea}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div
                            className={`text-4xl py-4 font-semibold mt-1 text-center  justify-between flex px-20 rounded-b-xl`}
                            style={{
                              color: fontColor,
                              backgroundColor: templateColor,
                              fontFamily: selectedFontStyle
                                ? selectedFontStyle.value
                                : "Arial",
                            }}
                          >
                            <p style={{ color: fontColor }}>{obtenerFecha()}</p>
                            <p style={{ color: fontColor }}>{currentHour}</p>
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
                </section>
              )}
            </>
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

export default PantallasSalon;
