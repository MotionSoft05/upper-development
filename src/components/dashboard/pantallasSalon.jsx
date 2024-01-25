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
  apiKey: "AIzaSyAiP1248hBEZt3iS2H4UVVjdf_xbuJHD3k",
  authDomain: "upper-8c817.firebaseapp.com",
  projectId: "upper-8c817",
  storageBucket: "upper-8c817.appspot.com",
  messagingSenderId: "798455798906",
  appId: "1:798455798906:web:f58a3e51b42eebb6436fc3",
  measurementId: "G-6VHX927GH1",
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
  const [templateColor, setTemplateColor] = useState("#D1D5DB");
  const [fontColor, setFontColor] = useState("#000000");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontColorPicker, setShowFontColorPicker] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [currentHour, setCurrentHour] = useState(obtenerHora());
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedEventImageUrl, setSelectedEventImageUrl] = useState(null);
  const [eventosUsuario, setEventosUsuario] = useState([]);
  const [nombrePantallasUsuario, setNombrePantallasUsuario] = useState([]);

  useEffect(() => {
    const obtenerDatosUsuario = async () => {
      try {
        const authUser = firebase.auth().currentUser;

        if (authUser) {
          // Obtener eventos del usuario
          const eventosRef = firebase.firestore().collection("eventos");
          const eventosQuery = eventosRef.where("userId", "==", authUser.uid);
          const eventosSnapshot = await eventosQuery.get();

          eventosSnapshot.forEach((doc) => {
            const eventData = doc.data();
            console.log("Devices del Evento:", eventData.devices);
            // Aquí puedes realizar cualquier otro procesamiento necesario con los devices del evento
          });

          // Obtener información de la colección usuarios del usuario
          const usuariosRef = firebase.firestore().collection("usuarios");
          const usuarioDoc = await usuariosRef.doc(authUser.uid).get();

          if (usuarioDoc.exists) {
            const usuarioData = usuarioDoc.data();
            const nombrePantallas = usuarioData.nombrePantallas || [];
            console.log("Nombre de Pantallas del Usuario:", nombrePantallas);
            setNombrePantallasUsuario(nombrePantallas);
          } else {
            console.error("Documento de usuario no encontrado");
          }
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
      }
    };

    obtenerDatosUsuario();
  }, []);

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

  useEffect(() => {
    const cargarDatosPersonalizacion = async () => {
      try {
        const authUser = firebase.auth().currentUser;

        if (authUser) {
          const templateSalonesRef = collection(db, "TemplateSalones");
          const templateSalonesQuery = query(
            templateSalonesRef,
            where("userId", "==", authUser.uid)
          );
          const templateSalonesSnapshot = await getDocs(templateSalonesQuery);

          if (!templateSalonesSnapshot.empty) {
            const templateSalonesDocData =
              templateSalonesSnapshot.docs[0].data();

            // Establecer datos de personalización en el estado
            setFontColor(templateSalonesDocData.fontColor || "#000000");
            setTemplateColor(templateSalonesDocData.templateColor || "#D1D5DB");

            // Manejar la lógica para establecer la fuente, si es necesario
            // Puedes modificar esto según tus necesidades específicas
            const selectedFontStyleOption = fontStyleOptions.find(
              (option) => option.value === templateSalonesDocData.fontStyle
            );
            setSelectedFontStyle(
              selectedFontStyleOption || fontStyleOptions[0]
            );

            // Establecer el logo
            setSelectedLogo(templateSalonesDocData.logo || null);
          }
        }
      } catch (error) {
        console.error("Error al cargar datos de personalización:", error);
      }
    };

    cargarDatosPersonalizacion();
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

      if (!selectedLogo) {
        alert("Por favor, selecciona un logo.");
        return;
      }

      if (!selectedFontStyle) {
        alert("Por favor, selecciona un estilo de texto.");
        return;
      }

      if (!templateColor) {
        alert("Por favor, selecciona un color de plantilla.");
        return;
      }

      if (!fontColor) {
        alert("Por favor, selecciona un color de letra.");
        return;
      }

      if (nombrePantallas.some((nombre) => !nombre)) {
        alert("Por favor, completa todos los nombres de pantallas.");
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
        <div className="p-5 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900">
            AJUSTES DE PANTALLAS SALON
          </h2>
        </div>

        <section className="max-w-4xl p-6 mx-auto rounded-md shadow-md bg-gray-800 mt-7">
          <h1 className="text-3x3 font-bold text-white capitalize mb-4">
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
              <label className="text-white dark:text-gray-200 block mb-0.5">
                Logo Actual
              </label>
              {selectedLogo && (
                <img src={selectedLogo} alt="Logo Actual" className="w-48" />
              )}
            </div>

            <div className="mb-4">
              <div>
                <label className="text-white dark:text-gray-200">
                  Color de letra
                </label>
                <div className="flex items-center relative">
                  <button
                    onClick={handleFontColorChange}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
                  >
                    Seleccionar Color
                  </button>
                  {showFontColorPicker && (
                    <div className="absolute z-10 -top-40">
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
              <label className="text-white dark:text-gray-200 block mb-1">
                Nombres de pantallas
              </label>
              <div className="flex flex-col">
                {Array.from({ length: ps }, (_, index) => (
                  <div className="flex items-center mb-2" key={index}>
                    <input
                      type="text"
                      placeholder={`Pantalla ${index + 1}`}
                      className="w-36 py-2 px-3 border rounded-lg bg-gray-700 text-white"
                      value={nombrePantallas[index] || ""}
                      onChange={(e) => {
                        const enteredValue = e.target.value;
                        const truncatedValue = enteredValue.slice(0, 16); // Limit to 25 characters
                        const updatedNombres = [...nombrePantallas];
                        updatedNombres[index] = truncatedValue;
                        setNombrePantallas(updatedNombres);
                      }}
                    />
                    <Link
                      href={`/pantalla${index + 1}.html`}
                      target="_blank"
                      className="bg-gray-300 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full ml-2"
                    >
                      URL
                    </Link>
                  </div>
                ))}
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

export default PantallasSalon;
