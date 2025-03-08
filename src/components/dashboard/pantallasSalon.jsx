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
import { firebaseConfig } from "@/firebase/firebaseConfig"; // Credenciales .env

//TODO verificar que haga falta inicializar y getFirestore, getStorage que se deban llamar vacios o con app
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
  const [selectedTemplate, setSelectedTemplate] = useState(1); // Default to Template 1
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("es");
  const [nombreEmpresa, setNombreEmpresa] = useState(null);
  const [activeTab, setActiveTab] = useState("general"); // Para controlar las pestañas
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
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
        console.log(
          "🚀 ~ pantallasSalon.jsx:167 ~ fetchUserData ~ authUser:",
          authUser
        );

        if (authUser) {
          const usuariosRef = collection(db, "usuarios");
          console.log(
            "🚀 ~ pantallasSalon.jsx:174 ~ fetchUserData ~ usuariosRef:",
            usuariosRef
          );
          let usuariosQuery;
          console.log(
            "🚀 ~ pantallasSalon.jsx:239 ~ fetchUserData ~ usuariosQuery:",
            usuariosQuery
          );
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
          console.log(
            "🚀 ~ pantallasSalon.jsx:191 ~ fetchUserData ~ usuariosSnapshot:",
            usuariosSnapshot
          );

          if (!usuariosSnapshot.empty) {
            const user = usuariosSnapshot.docs[0].data();
            console.log(
              "🚀 ~ pantallasSalon.jsx:198 ~ fetchUserData ~ user:",
              user
            );
            const numberOfScreens = user.ps || 0;
            console.log(
              "🚀 ~ pantallasSalon.jsx:217 ~ fetchUserData ~ numberOfScreens:",
              numberOfScreens
            );
            // Cambio aquí: Usar los nombres de pantallas de la colección
            const nombresPantallasColeccion = user.nombrePantallas || [];
            console.log(
              "🚀 ~ pantallasSalon.jsx:217 ~ fetchUserData ~ nombresPantallasColeccion:",
              nombresPantallasColeccion
            );
            // Asegurarnos de que tengamos suficientes nombres para el número de pantallas
            const namesArray = Array.from(
              { length: numberOfScreens },
              (_, index) =>
                nombresPantallasColeccion[index] || `Pantalla ${index + 1}`
            );
            console.log(
              "🚀 ~ pantallasSalon.jsx:206 ~ fetchUserData ~ namesArray:",
              namesArray
            );
            setNombreEmpresa(user);
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
          console.log(
            "🚀 ~ pantallasSalon.jsx:246 ~ cargarDatosPersonalizacion ~ authUser:",
            authUser
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
              setSelectedTemplate(templateSalonesDocData.template || 1);
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
              setSelectedTemplate(templateSalonesDocData.template || 1);
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

  const templates = [
    {
      id: 1,
      name: "Template 1",
      previewUrl: "/img/ImagenFix1.jpg",
      description: "Diseño clásico con información clara y ordenada",
    },
    {
      id: 2,
      name: "Template 2",
      previewUrl: "/img/img2.jpg",
      description: "Diseño moderno con elementos dinámicos",
    },
  ];

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
        template: selectedTemplate,
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
          template: selectedTemplate,
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
          template: selectedTemplate,
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

  const handlePreviewClick = (imageUrl) => {
    setPreviewImage(imageUrl);
    setIsModalOpen(true);
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
  // Función para mostrar la vista previa del template
  const openTemplatePreview = (imageUrl) => {
    setPreviewImage(imageUrl);
    setIsModalOpen(true);
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
            {t("screenSalon.title")}
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-base text-gray-500 sm:text-lg">
            {t("screenSalon.description") ||
              "Configure las opciones de visualización para sus pantallas de salón"}
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
                <select
                  id="empresa"
                  value={empresaSeleccionada}
                  onChange={(e) => setEmpresaSeleccionada(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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
          </div>
        )}

        {/* Contenido principal */}
        <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
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
              {t("screenSalon.generalSettings") || "Configuración General"}
            </button>
            <button
              onClick={() => setActiveTab("screens")}
              className={`flex-1 py-4 px-4 text-center font-medium text-sm sm:text-base ${
                activeTab === "screens"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t("screenSalon.screenNames") || "Pantallas"}
            </button>
            <button
              onClick={() => setActiveTab("appearance")}
              className={`flex-1 py-4 px-4 text-center font-medium text-sm sm:text-base ${
                activeTab === "appearance"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t("screenSalon.appearance") || "Apariencia"}
            </button>
          </div>

          {/* Contenido de las pestañas */}
          <div className="p-6">
            {/* Pestaña de Configuración General */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  {t("screenSalon.generalSettings") || "Configuración General"}
                </h2>

                {/* Logo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("screenSalon.logo")}
                  </label>
                  <div className="mt-1 flex items-center space-x-4">
                    <div className="flex-1">
                      <label className="w-full flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-gray-400">
                        <div className="space-y-1 text-center">
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
                          <div className="flex text-sm text-gray-600">
                            <span>
                              {t("screenSalon.uploadLogo") || "Subir logo"}
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
                    {selectedLogo && (
                      <div className="flex-shrink-0">
                        <img
                          src={selectedLogo}
                          alt="Logo Actual"
                          className="h-24 w-auto object-contain border rounded p-1"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Idioma */}
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
            )}

            {/* Pestaña de Pantallas */}
            {activeTab === "screens" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  {t("screenSalon.screenNames")}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: ps }, (_, index) => (
                    <div className="flex flex-col space-y-2" key={index}>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder={`Pantalla ${index + 1}`}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={nombrePantallas[index] || ""}
                          onChange={(e) => {
                            const enteredValue = e.target.value;
                            const truncatedValue = enteredValue.slice(0, 30);
                            const updatedNombres = [...nombrePantallas];
                            updatedNombres[index] = truncatedValue;
                            setNombrePantallas(updatedNombres);
                          }}
                        />
                        <Link
                          href={`/pantalla/${index + 1}${isProduction}/?emp=${
                            nombreEmpresa?.empresa
                          }`}
                          target="_blank"
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          URL
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pestaña de Apariencia */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  {t("screenSalon.appearance") || "Apariencia"}
                </h2>

                {/* Selección de Template */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("screenSalon.selectTemplate") || "Seleccionar Template"}
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className={`relative rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                          selectedTemplate === template.id
                            ? "border-blue-500 ring-2 ring-blue-500"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <img
                          src={template.previewUrl}
                          alt={template.name}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openTemplatePreview(template.previewUrl);
                            }}
                            className="bg-white text-gray-800 rounded-full p-2 transform scale-0 hover:scale-100 transition-transform opacity-0 hover:opacity-100"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                        </div>
                        <div className="p-2 text-center bg-gray-50">
                          <div className="flex items-center justify-center">
                            <input
                              type="radio"
                              id={`template-${template.id}`}
                              name="template"
                              value={template.id}
                              checked={selectedTemplate === template.id}
                              onChange={() => setSelectedTemplate(template.id)}
                              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <label
                              htmlFor={`template-${template.id}`}
                              className="text-sm font-medium text-gray-700"
                            >
                              {template.name}
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Estilo de Texto */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("screenSalon.textStyle")}
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
                      {t("screenSalon.fontColor")}
                    </label>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleFontColorChange}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {t("screenSalon.selectColor")}
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
                          {t("screenSalon.done")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Color de Plantilla */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("screenSalon.templateColor")}
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleTemplateColorChange}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {t("screenSalon.selectColor")}
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
                        {t("screenSalon.done")}
                      </button>
                    </div>
                  )}
                </div>

                {/* Vista previa */}
                <div className="mt-4 p-4 border rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    {t("screenSalon.preview") || "Vista previa"}
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
                        {t("screenSalon.previewText") ||
                          "Ejemplo de Título en Pantalla"}
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
                      t("screenSalon.resetConfirm") ||
                        "¿Está seguro que desea restablecer todos los valores?"
                    )
                  ) {
                    setTemplateColor("#D1D5DB");
                    setFontColor("#000000");
                    setSelectedFontStyle(fontStyleOptions[0]);
                    setSelectedTemplate(templates[0]?.id || "");
                  }
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {t("screenSalon.reset") || "Restablecer"}
              </button>
              <button
                onClick={handleSaveWithFeedback}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t("screenSalon.save")}
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
                  {t("screenSalon.saveSuccess") ||
                    "¡Cambios guardados correctamente!"}
                </p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    onClick={() => setShowSuccessMessage(false)}
                    className="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <span className="sr-only">
                      {t("screenSalon.close") || "Cerrar"}
                    </span>
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

      {/* Modal para vista previa de Template */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {t("screenSalon.templatePreview") ||
                  "Vista previa del Template"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <img
              src={previewImage}
              alt="Template preview"
              className="w-full h-auto rounded-lg"
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t("screenSalon.close") || "Cerrar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PantallasSalon;
