/* eslint-disable react-hooks/exhaustive-deps */
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
import Swal from "sweetalert2";
import { getDownloadURL, ref, uploadBytes, getStorage } from "firebase/storage";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
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
  const isProduction = process.env.NEXT_PUBLIC_PRODUCTION; // Deploy (.html) o  en localhost()

  const { t } = useTranslation();
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
  const [empresas, setEmpresas] = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");
  const [configuracionTemplate, setConfiguracionTemplate] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("es");

  useEffect(() => {
    const obtenerEmpresas = async () => {
      try {
        const authUser = firebase.auth().currentUser;
        const usuariosRef = firebase.firestore().collection("usuarios");
        const usuariosSnapshot = await usuariosRef.get();

        const empresasArray = [];
        usuariosSnapshot.forEach((doc) => {
          const empresa = doc.data().empresa;
          if (empresa && !empresasArray.includes(empresa)) {
            empresasArray.push(empresa);
          }
        });

        setEmpresas(empresasArray);
      } catch (error) {
        console.error("Error al obtener empresas:", error);
      }
    };

    obtenerEmpresas();
  }, []);

  const usuarioAutorizado =
    firebase.auth().currentUser &&
    [
      "uppermex10@gmail.com",
      "ulises.jacobo@hotmail.com",
      "contacto@upperds.mx",
    ].includes(firebase.auth().currentUser.email);

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
          let usuariosQuery;

          // Cambio aquí: Si hay una empresa seleccionada, buscar usuarios con esa empresa
          if (empresaSeleccionada) {
            usuariosQuery = query(
              usuariosRef,
              where("empresa", "==", empresaSeleccionada)
            );
          } else {
            // Si no hay una empresa seleccionada, buscar usuarios por correo electrónico
            usuariosQuery = query(
              usuariosRef,
              where("email", "==", authUser.email)
            );
          }

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
  }, [empresaSeleccionada]); // Ahora, el useEffect se ejecutará nuevamente cuando la empresa seleccionada cambie

  useEffect(() => {
    const cargarDatosPersonalizacion = async () => {
      try {
        const authUser = firebase.auth().currentUser;

        if (authUser) {
          const usuariosRef = collection(db, "usuarios");
          const usuariosQuery = query(
            usuariosRef,
            where("email", "==", authUser.email)
          );
          const usuariosSnapshot = await getDocs(usuariosQuery);

          let empresa = ""; // Inicializa la variable empresa

          if (!usuariosSnapshot.empty) {
            empresa = usuariosSnapshot.docs[0].data().empresa || ""; // Obtiene el nombre de la empresa
          }

          // Si no hay una empresa seleccionada, cargar los datos de personalización del usuario actual
          if (!empresaSeleccionada) {
            // Ahora, busca el documento correspondiente en TemplateSalones utilizando el nombre de la empresa
            const templateSalonesRef = collection(db, "TemplateSalones");
            const templateSalonesQuery = query(
              templateSalonesRef,
              where("empresa", "==", empresa)
            );
            const templateSalonesSnapshot = await getDocs(templateSalonesQuery);

            if (!templateSalonesSnapshot.empty) {
              const templateSalonesDocData =
                templateSalonesSnapshot.docs[0].data();

              // Establecer datos de personalización en el estado
              setFontColor(templateSalonesDocData.fontColor || "#000000");
              setTemplateColor(
                templateSalonesDocData.templateColor || "#D1D5DB"
              );

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

              // Establecer el idioma
              setSelectedLanguage(templateSalonesDocData.idioma || "es");
            }
          } else {
            // Si hay una empresa seleccionada, cargar los datos de personalización para esa empresa específica
            const templateSalonesRef = collection(db, "TemplateSalones");
            const templateSalonesQuery = query(
              templateSalonesRef,
              where("empresa", "==", empresaSeleccionada)
            );
            const templateSalonesSnapshot = await getDocs(templateSalonesQuery);

            if (!templateSalonesSnapshot.empty) {
              const templateSalonesDocData =
                templateSalonesSnapshot.docs[0].data();

              // Establecer datos de personalización en el estado
              setFontColor(templateSalonesDocData.fontColor || "#000000");
              setTemplateColor(
                templateSalonesDocData.templateColor || "#D1D5DB"
              );

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
              // Establecer el idioma
              setSelectedLanguage(templateSalonesDocData.idioma || "es");
            }
          }
        }
      } catch (error) {
        console.error("Error al cargar datos de personalización:", error);
      }
    };

    cargarDatosPersonalizacion();
  }, [empresaSeleccionada]);

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

      if (ps === 0) {
        // "No hay licencias activas. No se pueden personalizar las pantallas."
        Swal.fire({
          icon: "error",
          title: t("screenSalon.licenseError"),
        });
        return;
      }

      if (!authUser) {
        // "Usuario no autenticado. No se puede enviar a Firestore."
        Swal.fire({
          icon: "error",
          title: t("screenSalon.unauthenticatedUserError"),
          text: t("screenSalon.unauthenticatedUserError"),
        });
        return;
      }

      if (!selectedLogo) {
        // "Por favor, selecciona un logo."
        Swal.fire({
          icon: "error",
          title: t("screenSalon.logoSelectionError"),
        });
        return;
      }

      if (!selectedFontStyle) {
        // Por favor, selecciona un estilo de texto.
        Swal.fire({
          icon: "error",
          title: t("screenSalon.fontStyleSelectionError"),
        });
        return;
      }

      if (!templateColor) {
        // Por favor, selecciona un color de plantilla.
        Swal.fire({
          icon: "error",
          title: t("screenSalon.templateColorSelectionError"),
        });
        return;
      }

      if (!fontColor) {
        Swal.fire({
          icon: "error",
          title: "Por favor, selecciona un color de letra.",
        });
        return;
      }

      if (nombrePantallas.some((nombre) => !nombre)) {
        // Por favor, completa todos los nombres de pantallas.
        Swal.fire({
          icon: "error",
          title: t("screenSalon.fontColorSelectionError"),
        });
        return;
      }

      if (!selectedLogo) {
        // selectedLogo es null. No se puede enviar a Firestore.
        Swal.fire({
          icon: "error",
          title: t("screenSalon.screenNameCompletionError"),
        });
        return;
      }

      if (!selectedLanguage) {
        // Si no se ha seleccionado ningún idioma
        Swal.fire({
          icon: "error",
          title: t("screenSalon.screenPleaseselectalanguage"),
        });
        return;
      }

      const personalizacionTemplate = {
        fontColor: fontColor,
        templateColor: templateColor,
        fontStyle: selectedFontStyle.value,
        logo: selectedLogo,
        idioma: selectedLanguage,
        empresa: "",
      };

      // Obtener la empresa a actualizar, ya sea la empresa seleccionada o la del usuario autenticado
      let empresaToUpdate = empresaSeleccionada;

      if (!empresaToUpdate) {
        // Si no hay empresa seleccionada, obtener la empresa del usuario autenticado
        const usuariosRef = collection(db, "usuarios");
        const usuariosQuery = query(
          usuariosRef,
          where("email", "==", authUser.email)
        );
        const usuariosSnapshot = await getDocs(usuariosQuery);

        if (!usuariosSnapshot.empty) {
          empresaToUpdate = usuariosSnapshot.docs[0].data().empresa || "";
        } else {
          console.error("No se encontró la empresa del usuario autenticado.");
          return;
        }
      }

      // Actualizar los nombres de pantalla para todos los usuarios que pertenecen a la misma empresa
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
          const userId = usuarioData.userId;
          const nombrePantallasObject = {};
          nombrePantallas.forEach((nombre, index) => {
            nombrePantallasObject[`nombrePantallas.${index}`] = nombre;
          });
          updateNombrePantallasPromises.push(
            updateDoc(usuarioRef, nombrePantallasObject)
          );
        } else {
          console.error("Documento de usuario no válido:", usuarioDoc.id);
        }
      });

      await Promise.all(updateNombrePantallasPromises);

      // Buscar el documento correspondiente en TemplateSalones utilizando el nombre de la empresa
      const templateSalonesRef = collection(db, "TemplateSalones");
      const templateSalonesQuery = query(
        templateSalonesRef,
        where("empresa", "==", empresaToUpdate)
      );
      const templateSalonesSnapshot = await getDocs(templateSalonesQuery);

      if (!templateSalonesSnapshot.empty) {
        const templateSalonesDocRef = templateSalonesSnapshot.docs[0].ref;
        await updateDoc(templateSalonesDocRef, {
          fontColor: fontColor,
          templateColor: templateColor,
          fontStyle: selectedFontStyle.value,
          logo: selectedLogo,
          empresa: empresaToUpdate,
          idioma: selectedLanguage,
          timestamp: serverTimestamp(),
        });
      } else {
        // Si no hay documento existente para esta empresa, crea uno nuevo
        await addDoc(templateSalonesRef, {
          empresa: empresaToUpdate,
          fontColor: fontColor,
          templateColor: templateColor,
          fontStyle: selectedFontStyle.value,
          logo: selectedLogo,
          idioma: selectedLanguage,
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
          updatePromises.push(
            updateDoc(eventoRef, {
              personalizacionTemplate: personalizacionTemplate,
            })
          );
        } else {
          // "Referencia de evento no válida:"
          console.error(t("screenSalon.invalidEventReferenceError"), doc.id);
        }
      });

      await Promise.all(updatePromises);

      // "Información de personalización guardada con éxito."
      Swal.fire({
        icon: "success",
        title: t("screenSalon.customizationSavedSuccess"),
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      // "Error al guardar la información de personalización y URL del logo:",
      Swal.fire({
        icon: "error",
        title: t("screenSalon.customizationSaveError"),
        text: error.message, // Suponiendo que `error` es un objeto que contiene el mensaje de error
      });
    }
  };

  const handlePreviewClick = () => {
    setPreviewVisible(true);
  };

  const handleClosePreview = () => {
    setPreviewVisible(false);
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
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
    <section className="pl-10 md:px-32">
      <div>
        <div className="p-5 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900">
            {/* AJUSTES DE PANTALLAS SALON */}
            {t("screenSalon.title")}
          </h2>
        </div>

        <section className="max-w-4xl p-6 mx-auto rounded-md shadow-md bg-gray-800 mt-7 pl-10 md:px-32">
          {/* // TODO: Supongo que solo deberia cambiar su propia empresa y no otras ajenas */}
          {/* SELECT DE EMPRESA */}
          {usuarioAutorizado && (
            <div className="mb-4 ">
              <div className=" flex justify-center">
                <label
                  htmlFor="empresa"
                  className="text-base font-semibold text-white mr-4 my-auto"
                >
                  Empresa:
                </label>
                <select
                  id="empresa"
                  value={empresaSeleccionada}
                  onChange={(e) => setEmpresaSeleccionada(e.target.value)}
                  className="block w-72 pl-2 bg-white border border-gray-300 rounded-sm shadow-sm  focus:outline-none focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm"
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
          )}
          <h1 className="text-3x3 font-bold text-white capitalize mb-4">
            {/* Personalización del Template */}
            {t("screenSalon.templateCustomization")}
          </h1>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="mb-4">
              <label className="text-white dark:text-gray-200 block mb-0.5">
                {/* Logo */}
                {t("screenSalon.logo")}
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
                {/* Estilo de texto */}
                {t("screenSalon.textStyle")}
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
                {/* Logo Actual */}
                {t("screenSalon.currentLogo")}
              </label>
              {selectedLogo && (
                <img src={selectedLogo} alt="Logo Actual" className="w-48" />
              )}
            </div>

            <div className="mb-4">
              <label className="text-white dark:text-gray-200 block mb-1">
                {/* Idiomas */}
                {t("screenSalon.languages")}
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="spanish"
                    value="es"
                    checked={selectedLanguage === "es"}
                    onChange={handleLanguageChange}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                  />
                  <label htmlFor="spanish" className="ml-2 mr-4 text-white">
                    {/* Español */}
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
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                  />
                  <label htmlFor="english" className="ml-2 mr-4 text-white">
                    {/* Inglés */}
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
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                  />
                  <label htmlFor="both" className="ml-2 text-white">
                    {/* Español/Inglés */}
                    {t("screenSalon.idspanish/english")}
                  </label>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div>
                <label className="text-white dark:text-gray-200">
                  {/* Color de letra */}
                  {t("screenSalon.fontColor")}
                </label>
                <div className="flex items-center relative">
                  <button
                    onClick={handleFontColorChange}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
                  >
                    {/* Seleccionar Color */}
                    {t("screenSalon.selectColor")}
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
                        {/* Listo */}
                        {t("screenSalon.done")}
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
                {/* Nombres de pantallas */}
                {t("screenSalon.screenNames")}
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
                      // href={`/pantalla${index + 1}.html`}
                      href={`/pantalla${index + 1}${isProduction}`}
                      target="_blank"
                      className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full ml-2"
                    >
                      URL
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-white dark:text-gray-200">
                {/* Color de la plantilla */}
                {t("screenSalon.templateColor")}
              </label>
              <div className="flex items-center">
                <button
                  onClick={handleTemplateColorChange}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
                >
                  {/* Seleccionar Color */}
                  {t("screenSalon.selectColor")}
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
                      {t("screenSalon.done")}
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
              {/* Guardar */}
              {t("screenSalon.save")}
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}

export default PantallasSalon;
