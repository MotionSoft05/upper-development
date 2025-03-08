/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import { ChromePicker } from "react-color";
import Select from "react-select";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import Swal from "sweetalert2";
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
import { firebaseConfig } from "@/firebase/firebaseConfig";

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const storage = getStorage();

function PantallasDirectorio() {
  const isProduction = process.env.NEXT_PUBLIC_PRODUCTION; // Deploy (.html) o  en localhost()

  const { t } = useTranslation(); // Traduccion con i18N
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
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("es");

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
    {
      value: "Querétaro",
      label: "Querétaro",
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
  const [activeTab, setActiveTab] = useState("general"); // Para controlar las pestañas
  const [empresaOptions, setEmpresaOptions] = useState([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);
  const [empresaQr, setEmpresaQR] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const authorizedEmails = [
    "uppermex10@gmail.com",
    "ulises.jacobo@hotmail.com",
    "contacto@upperds.mx",
  ];

  const usuarioAutorizado =
    firebase.auth().currentUser &&
    [
      "uppermex10@gmail.com",
      "ulises.jacobo@hotmail.com",
      "contacto@upperds.mx",
    ].includes(firebase.auth().currentUser.email);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const authUser = firebase.auth().currentUser;

        if (authUser) {
          // Obtener referencia al usuario autenticado
          const usuarioRef = doc(db, "usuarios", authUser.uid);
          const usuarioSnapshot = await getDoc(usuarioRef);

          let empresa;
          if (selectedEmpresa) {
            // Si hay una empresa seleccionada, usar esa
            empresa = selectedEmpresa.value;
          } else if (usuarioSnapshot.exists()) {
            // Si no hay una empresa seleccionada, usar la empresa del usuario autenticado
            const user = usuarioSnapshot.data();
            empresa = user.empresa || "";

            const numberOfScreens = user.pd || 0;
            const namesArray = Array.from(
              { length: numberOfScreens },
              (_, index) => `Pantalla ${index + 1}`
            );

            setNombrePantallasDirectorio(namesArray);
            setPd(numberOfScreens);
            setNombreEmpresa(empresa);

            const unsubscribe = onSnapshot(usuarioRef, (doc) => {
              const data = doc.data();
              if (data && data.nombrePantallasDirectorio) {
                const nombres = Object.values(data.nombrePantallasDirectorio);
                setNombrePantallasDirectorio(nombres);
                console.log(
                  "Nombres de pantallas (usuario autenticado):",
                  nombres
                );
              }
            });

            return () => unsubscribe();
          }

          if (empresa) {
            // Obtener todos los usuarios que pertenecen a la empresa seleccionada
            const usuariosRef = collection(db, "usuarios");
            const usuariosSnapshot = await getDocs(usuariosRef);

            const nombresPantallas = [];

            usuariosSnapshot.forEach((doc) => {
              const data = doc.data();
              if (data.empresa === empresa && data.nombrePantallasDirectorio) {
                const nombres = Object.values(data.nombrePantallasDirectorio);
                nombresPantallas.push(...nombres);
              }
            });

            setNombrePantallasDirectorio(nombresPantallas);
            console.log(
              "Nombres de pantallas (empresa seleccionada):",
              nombresPantallas
            );
          }
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
      }
    };

    const fetchTemplateData = async () => {
      try {
        const authUser = firebase.auth().currentUser;
        let empresa = "";

        if (authUser) {
          const usuarioRef = doc(db, "usuarios", authUser.uid);
          const usuarioSnapshot = await getDoc(usuarioRef);

          if (usuarioSnapshot.exists()) {
            const user = usuarioSnapshot.data();

            empresa = selectedEmpresa
              ? selectedEmpresa.value
              : user.empresa || "";

            console.log("Empresa >>>: ", empresa); // Console log de la empresa
            setEmpresaQR(empresa);

            const templateDirectoriosRef = collection(
              db,
              "TemplateDirectorios"
            );
            const templateDirectoriosQuery = query(
              templateDirectoriosRef,
              where("empresa", "==", empresa) // Buscar por empresa en lugar de userId
            );
            const templateDirectoriosSnapshot = await getDocs(
              templateDirectoriosQuery
            );

            if (!templateDirectoriosSnapshot.empty) {
              console.log(
                "Se encontró información en TemplateDirectorios por empresa."
              );
              const templateDirectoriosDoc =
                templateDirectoriosSnapshot.docs[0].data();
              const {
                fontColor,
                fontStyle,
                logo,
                templateColor,
                ciudad,
                setPortrait,
                publicidad,
                idioma,
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
              setSelectedLanguage(idioma || "es");
            } else {
              console.log(
                "No se encontró información en TemplateDirectorios por empresa. Usando valores iniciales."
              );
              setFontColor("#000000");
              setSelectedFontStyle({
                value: "Arial",
                label: "Arial",
              });
              setSelectedLogo(null);
              setTemplateColor("#D1D5DB");
              setSelectedCity(null);
              setSetPortrait(false);
              setSelectedPublicidad(null);
            }
          }
        }
      } catch (error) {
        console.error("Error al obtener datos del template:", error);
      }
    };

    const fetchEmpresaData = async () => {
      try {
        const authUser = firebase.auth().currentUser;

        if (authUser && authorizedEmails.includes(authUser.email)) {
          const usuariosRef = collection(db, "usuarios");
          const usuariosSnapshot = await getDocs(usuariosRef);
          const empresasSet = new Set();

          usuariosSnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.empresa) {
              empresasSet.add(data.empresa);
            }
          });

          const empresasArray = Array.from(empresasSet).map((empresa) => ({
            value: empresa,
            label: empresa,
          }));
          setEmpresaOptions(empresasArray);
        }
      } catch (error) {
        console.error("Error al obtener datos de las empresas:", error);
      }
    };

    fetchUserData();
    fetchTemplateData();
    fetchEmpresaData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmpresa]);

  const handleCityChange = (selectedOption) => {
    setSelectedCity(selectedOption);
  };

  const handleEmpresaChange = async (selectedOption) => {
    setSelectedEmpresa(selectedOption); // Actualiza el estado con la empresa seleccionada

    try {
      const empresa = selectedOption.value; // Obtiene el valor de la empresa seleccionada

      const templateDirectoriosRef = collection(db, "TemplateDirectorios");
      const templateDirectoriosQuery = query(
        templateDirectoriosRef,
        where("empresa", "==", empresa) // Busca documentos con la empresa seleccionada
      );
      const templateDirectoriosSnapshot = await getDocs(
        templateDirectoriosQuery
      );

      if (!templateDirectoriosSnapshot.empty) {
        console.log(
          "Se encontró información en TemplateDirectorios para la empresa seleccionada."
        );
        const templateDirectoriosDoc =
          templateDirectoriosSnapshot.docs[0].data();
        const {
          fontColor,
          fontStyle,
          logo,
          templateColor,
          ciudad,
          setPortrait,
          publicidad,
          idioma,
        } = templateDirectoriosDoc;

        // Actualiza el estado con la información obtenida
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
        setSelectedLanguage(idioma || "es");
      } else {
        console.log(
          "No se encontró información en TemplateDirectorios para la empresa seleccionada."
        );
        // Si no hay información para la empresa seleccionada, puedes limpiar los estados o mostrar un mensaje
        // Limpiar los estados
        setFontColor("#000000");
        setSelectedFontStyle({ value: "Arial", label: "Arial" });
        setSelectedLogo(null);
        setTemplateColor("#D1D5DB");
        setSelectedCity(null);
        setSetPortrait(false);
        setSelectedPublicidad(null);
        setSelectedLanguage("es");
        // O mostrar un mensaje al usuario
      }
    } catch (error) {
      console.error(
        "Error al obtener datos del template para la empresa seleccionada:",
        error
      );
    }
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
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "No hay licencias activas. No se pueden personalizar las pantallas.",
        });
        return;
      }

      if (!authUser) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Usuario no autenticado. No se puede enviar a Firestore.",
        });
        return;
      }

      if (!selectedCity) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Por favor, seleccione una ciudad.",
        });
        return;
      }

      if (!selectedLogo) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Por favor, seleccione un logo.",
        });
        return;
      }

      if (!selectedPublicidad) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Por favor, seleccione una imagen para Publicidad.",
        });

        return;
      }

      if (!selectedLanguage) {
        // Si no se ha seleccionado ningún idioma
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Por favor, seleccione un idioma.",
        });
        return;
      }

      const personalizacionTemplate = {
        fontColor: fontColor,
        templateColor: templateColor,
        fontStyle: selectedFontStyle.value,
        logo: selectedLogo,
        ciudad: selectedCity.value,
        setPortrait: setPortrait,
        publicidad: selectedPublicidad,
        idioma: selectedLanguage,
        empresa: selectedEmpresa ? selectedEmpresa.value : nombreEmpresa,
      };

      const empresaToUse = selectedEmpresa
        ? selectedEmpresa.value
        : nombreEmpresa;

      const templateDirectoriosRef = collection(db, "TemplateDirectorios");
      const templateDirectoriosQuery = query(
        templateDirectoriosRef,
        where("empresa", "==", empresaToUse)
      );
      const templateDirectoriosSnapshot = await getDocs(
        templateDirectoriosQuery
      );

      if (!templateDirectoriosSnapshot.empty) {
        const templateDirectoriosDocRef =
          templateDirectoriosSnapshot.docs[0].ref;
        await updateDoc(templateDirectoriosDocRef, {
          ...personalizacionTemplate,
          timestamp: serverTimestamp(),
        });
      } else {
        await addDoc(templateDirectoriosRef, {
          ...personalizacionTemplate,
          timestamp: serverTimestamp(),
        });
      }

      const nombresPantallasObject = {};
      nombrePantallasDirectorio.forEach((nombre, index) => {
        nombresPantallasObject[`nombrePantallasDirectorio.${index}`] = nombre;
      });

      if (selectedEmpresa) {
        // Actualizar nombres de pantalla para todos los usuarios con la empresa seleccionada
        const usuariosEmpresaQuery = query(
          collection(db, "usuarios"),
          where("empresa", "==", empresaToUse)
        );
        const usuariosEmpresaSnapshot = await getDocs(usuariosEmpresaQuery);
        const updateUsuariosPromises = [];

        usuariosEmpresaSnapshot.forEach((usuarioDoc) => {
          const usuarioEmpresaRef = doc(db, "usuarios", usuarioDoc.id);
          updateUsuariosPromises.push(
            updateDoc(usuarioEmpresaRef, nombresPantallasObject)
          );
        });

        await Promise.all(updateUsuariosPromises);
      } else {
        const usuarioRef = doc(db, "usuarios", authUser.uid);

        await updateDoc(usuarioRef, {
          nombrePantallasDirectorio: firebase.firestore.FieldValue.delete(),
        });

        await updateDoc(usuarioRef, nombresPantallasObject);

        // Actualizar nombres de pantalla para todos los usuarios con la misma empresa
        const usuariosEmpresaQuery = query(
          collection(db, "usuarios"),
          where("empresa", "==", nombreEmpresa)
        );
        const usuariosEmpresaSnapshot = await getDocs(usuariosEmpresaQuery);
        const updateUsuariosPromises = [];

        usuariosEmpresaSnapshot.forEach((usuarioDoc) => {
          const usuarioEmpresaRef = doc(db, "usuarios", usuarioDoc.id);
          updateUsuariosPromises.push(
            updateDoc(usuarioEmpresaRef, nombresPantallasObject)
          );
        });

        await Promise.all(updateUsuariosPromises);
      }

      const eventosRef = collection(db, "eventos");
      const eventosQuery = query(
        eventosRef,
        where("empresa", "==", empresaToUse)
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
          console.error("Referencia de evento no válida:", doc.id);
        }
      });

      await Promise.all(updatePromises);

      Swal.fire({
        icon: "success",
        title: t("screenSalon.customizationSavedSuccess"),
        showConfirmButton: false,
        timer: 2000,
      });
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

  // Estilos personalizados de React Select
  const customStyles = {
    control: (provided) => ({
      ...provided,
      height: "20px", // Ajusta la altura del select
      minHeight: "40px", // Asegura que la altura mínima sea consistente
    }),
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
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
            {t("screensDirectory.title")}
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-base text-gray-500 sm:text-lg">
            {t("screensDirectory.description")}
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
                <Select
                  id="empresa"
                  value={selectedEmpresa}
                  onChange={handleEmpresaChange}
                  options={empresaOptions}
                  placeholder="Seleccionar Empresa"
                  isClearable
                  styles={customStyles}
                  className="w-full"
                />
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
              Configuración General
            </button>
            <button
              onClick={() => setActiveTab("screens")}
              className={`flex-1 py-4 px-4 text-center font-medium text-sm sm:text-base ${
                activeTab === "screens"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Pantallas
            </button>
            <button
              onClick={() => setActiveTab("appearance")}
              className={`flex-1 py-4 px-4 text-center font-medium text-sm sm:text-base ${
                activeTab === "appearance"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Apariencia
            </button>
          </div>

          {/* Contenido de las pestañas */}
          <div className="p-6">
            {/* Pestaña de Configuración General */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  {t("screensDirectory.generalSettings")}
                </h2>

                {/* Logo y Publicidad */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Logo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("screensDirectory.logo")}
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
                              <span>{t("screensDirectory.uploadLogo")}</span>
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

                  {/* Publicidad */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("screensDirectory.advertisement")}
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
                                {t("screensDirectory.uploadAdvertisement")}
                              </span>
                              <input
                                id="file-upload-pub"
                                name="file-upload-pub"
                                type="file"
                                className="sr-only"
                                onChange={handlePublicidadChange}
                              />
                            </div>
                            <p className="text-xs text-gray-500">
                              {t("screensDirectory.sizeInfo")}
                            </p>
                          </div>
                        </label>
                      </div>
                      {selectedPublicidad && (
                        <div className="flex-shrink-0">
                          <img
                            src={selectedPublicidad}
                            alt="Publicidad Actual"
                            className="h-24 w-auto object-contain border rounded p-1"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ciudad e Idioma */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {/* Selector de Ciudad */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      required
                    />
                  </div>

                  {/* Selector de Idioma */}
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
              </div>
            )}

            {/* Pestaña de Pantallas */}
            {activeTab === "screens" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  {t("screensDirectory.screenNames")}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: pd }, (_, index) => (
                    <div className="flex flex-col space-y-2" key={index}>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder={`Pantalla ${index + 1}`}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={(nombrePantallasDirectorio[index] || "").slice(
                            0,
                            30
                          )}
                          onChange={(e) => {
                            const updatedNombres = [
                              ...nombrePantallasDirectorio,
                            ];
                            updatedNombres[index] = e.target.value;
                            setNombrePantallasDirectorio(updatedNombres);
                          }}
                        />
                        <Link
                          href={`/pantallaDirec${
                            index + 1
                          }${isProduction}?emp=${empresaQr}`}
                          target="_blank"
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          URL
                        </Link>
                      </div>
                      <div className="flex items-center">
                        <div className="relative inline-block w-10 mr-2 align-middle select-none">
                          <input
                            type="checkbox"
                            name={`toggle-${index}`}
                            id={`toggle-${index}`}
                            checked={setPortrait}
                            onChange={() => setSetPortrait((prev) => !prev)}
                            className="checked:bg-blue-500 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                          />
                          <label
                            htmlFor={`toggle-${index}`}
                            className={`block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer ${
                              setPortrait ? "bg-blue-500" : ""
                            }`}
                          ></label>
                        </div>
                        <span className="text-sm text-gray-700">
                          {setPortrait
                            ? "Pantalla Vertical: activado"
                            : "Pantalla Vertical: desactivado"}
                        </span>
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
                  {t("screensDirectory.appearance")}
                </h2>

                {/* Estilo de Texto */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("screensDirectory.textStyle")}
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
                      {t("screensDirectory.fontColor")}
                    </label>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleFontColorChange}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {t("screensDirectory.selectColor")}
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
                          {t("screensDirectory.confirm")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Color de Plantilla */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("screensDirectory.templateColor")}
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleTemplateColorChange}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {t("screensDirectory.selectColor")}
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
                        {t("screensDirectory.confirm")}
                      </button>
                    </div>
                  )}
                </div>

                {/* Vista previa */}
                <div className="mt-4 p-4 border rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Vista previa
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
                        Ejemplo de Título en Pantalla
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
                      "¿Está seguro que desea restablecer todos los valores?"
                    )
                  ) {
                    setTemplateColor("#D1D5DB");
                    setFontColor("#000000");
                    setSelectedFontStyle(fontStyleOptions[0]);
                  }
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {t("screensDirectory.reset")}
              </button>
              <button
                onClick={handleSaveWithFeedback}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t("screensDirectory.save")}
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
                  ¡Cambios guardados correctamente!
                </p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    onClick={() => setShowSuccessMessage(false)}
                    className="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <span className="sr-only">Cerrar</span>
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
    </div>
  );
}

export default PantallasDirectorio;
