/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
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
  serverTimestamp,
} from "firebase/firestore";
import Swal from "sweetalert2";
import { getDownloadURL, ref, uploadBytes, getStorage } from "firebase/storage";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { firebaseConfig } from "@/firebase/firebaseConfig"; // Importar firebaseConfig
import { fetchWeatherData } from "@/utils/weatherUtils";

// Inicializar Firebase correctamente
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

function PantallasTarifario() {
  const isProduction = process.env.NEXT_PUBLIC_PRODUCTION; // Deploy (.html) o en localhost()

  const { t } = useTranslation();
  const [nombrePantallas, setNombrePantallas] = useState([]);
  const [pt, setPt] = useState(0);
  const [templateColor, setTemplateColor] = useState("#D1D5DB");
  const [fontColor, setFontColor] = useState("#000000");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontColorPicker, setShowFontColorPicker] = useState(false);
  const [currentHour, setCurrentHour] = useState(obtenerHora());
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [empresas, setEmpresas] = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(1); // Default to Template 1
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("es");
  const [nombreEmpresa, setNombreEmpresa] = useState(null);
  const [activeTab, setActiveTab] = useState("general"); // Para controlar las pestañas
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [orientacion, setOrientacion] = useState("horizontal");
  const [cityOptions, setCityOptions] = useState([
    { value: "Ciudad de México", label: "Ciudad de México, Ciudad de México" },
    { value: "Ecatepec", label: "Ecatepec, Estado de México" },
    { value: "Guadalajara", label: "Guadalajara, Jalisco" },
    { value: "Monterrey", label: "Monterrey, Nuevo León" },
    { value: "Puebla", label: "Puebla, Puebla" },
    { value: "Tijuana", label: "Tijuana, Baja California" },
    { value: "León", label: "León, Guanajuato" },
    { value: "Zapopan", label: "Zapopan, Jalisco" },
    { value: "Ciudad Juárez", label: "Ciudad Juárez, Chihuahua" },
    { value: "Nezahualcóyotl", label: "Nezahualcóyotl, Estado de México" },
    { value: "Mexicali", label: "Mexicali, Baja California" },
    { value: "Mérida", label: "Mérida, Yucatán" },
    { value: "San Luis Potosí", label: "San Luis Potosí, San Luis Potosí" },
    { value: "Querétaro", label: "Querétaro, Querétaro" },
    { value: "Aguascalientes", label: "Aguascalientes, Aguascalientes" },
    { value: "Hermosillo", label: "Hermosillo, Sonora" },
    { value: "Saltillo", label: "Saltillo, Coahuila" },
    { value: "Morelia", label: "Morelia, Michoacán" },
    { value: "Culiacán", label: "Culiacán, Sinaloa" },
    { value: "Chihuahua", label: "Chihuahua, Chihuahua" },
    { value: "Toluca", label: "Toluca, Estado de México" },
    { value: "Cancún", label: "Cancún, Quintana Roo" },
    { value: "Reynosa", label: "Reynosa, Tamaulipas" },
    { value: "Tuxtla Gutiérrez", label: "Tuxtla Gutiérrez, Chiapas" },
    { value: "Villahermosa", label: "Villahermosa, Tabasco" },
    { value: "Xalapa", label: "Xalapa, Veracruz" },
    { value: "Coatzacoalcos", label: "Coatzacoalcos, Veracruz" },
    { value: "Celaya", label: "Celaya, Guanajuato" },
    { value: "Irapuato", label: "Irapuato, Guanajuato" },
    { value: "Ensenada", label: "Ensenada, Baja California" },
    { value: "Tepic", label: "Tepic, Nayarit" },
    { value: "La Paz", label: "La Paz, Baja California Sur" },
    { value: "Los Cabos", label: "Los Cabos, Baja California Sur" },
    { value: "Matamoros", label: "Matamoros, Tamaulipas" },
    { value: "Nuevo Laredo", label: "Nuevo Laredo, Tamaulipas" },
    { value: "Tlalnepantla", label: "Tlalnepantla, Estado de México" },
    { value: "Cuernavaca", label: "Cuernavaca, Morelos" },
    { value: "Uruapan", label: "Uruapan, Michoacán" },
    { value: "Zacatecas", label: "Zacatecas, Zacatecas" },
    { value: "Durango", label: "Durango, Durango" },
    {
      value: "San Cristóbal de las Casas",
      label: "San Cristóbal de las Casas, Chiapas",
    },
    { value: "Tehuacán", label: "Tehuacán, Puebla" },
    { value: "Manzanillo", label: "Manzanillo, Colima" },
    { value: "Orizaba", label: "Orizaba, Veracruz" },
    { value: "Tula de Allende", label: "Tula de Allende, Hidalgo" },
    { value: "Pátzcuaro", label: "Pátzcuaro, Michoacán" },
    { value: "Comitán", label: "Comitán, Chiapas" },
    { value: "Puerto Escondido", label: "Puerto Escondido, Oaxaca" },
    { value: "Taxco", label: "Taxco, Guerrero" },
    { value: "Huatulco", label: "Huatulco, Oaxaca" },
    { value: "San Juan del Río", label: "San Juan del Río, Querétaro" },
    { value: "Zamora", label: "Zamora, Michoacán" },
    { value: "Lagos de Moreno", label: "Lagos de Moreno, Jalisco" },
    { value: "Tuxpan", label: "Tuxpan, Veracruz" },
    { value: "Guaymas", label: "Guaymas, Sonora" },
    { value: "Navojoa", label: "Navojoa, Sonora" },
    { value: "Piedras Negras", label: "Piedras Negras, Coahuila" },
    { value: "Delicias", label: "Delicias, Chihuahua" },
    { value: "Parral", label: "Parral, Chihuahua" },
    { value: "Tecomán", label: "Tecomán, Colima" },
    { value: "Playa del Carmen", label: "Playa del Carmen, Quintana Roo" },
    { value: "Isla Mujeres", label: "Isla Mujeres, Quintana Roo" },
    { value: "Holbox", label: "Holbox, Quintana Roo" },
    { value: "Mazatlán", label: "Mazatlán, Sinaloa" },
    { value: "Acapulco", label: "Acapulco, Guerrero" },
    { value: "Puerto Vallarta", label: "Puerto Vallarta, Jalisco" },
    { value: "Sayulita", label: "Sayulita, Nayarit" },
    { value: "Bahías de Huatulco", label: "Bahías de Huatulco, Oaxaca" },
    { value: "Ixtapa", label: "Ixtapa, Guerrero" },
    { value: "Zihuatanejo", label: "Zihuatanejo, Guerrero" },
    { value: "Progreso", label: "Progreso, Yucatán" },
    { value: "Campeche", label: "Campeche, Campeche" },
    { value: "Rosarito", label: "Rosarito, Baja California" },
    { value: "San Felipe", label: "San Felipe, Baja California" },
    { value: "Loreto", label: "Loreto, Baja California Sur" },
    { value: "Todos Santos", label: "Todos Santos, Baja California Sur" },
    { value: "Oaxaca", label: "Oaxaca, Oaxaca" },
  ]);
  // Ordenar alfabéticamente
  cityOptions.sort((a, b) => a.label.localeCompare(b.label));

  const [selectedCity, setSelectedCity] = useState(null);
  const [publicidad, setPublicidad] = useState([]);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [previewImagen, setPreviewImagen] = useState(null);
  const [publicidadTiempos, setPublicidadTiempos] = useState({
    horas: 0,
    minutos: 0,
    segundos: 10,
  });
  const [publicidadOrientacion, setPublicidadOrientacion] =
    useState("horizontal");

  const [publicidadItems, setPublicidadItems] = useState([]);
  const [editingPublicidadIndex, setEditingPublicidadIndex] = useState(null);
  const [isLoadingPublicidad, setIsLoadingPublicidad] = useState(false);
  const [direccionRotacion, setDireccionRotacion] = useState("derecha"); // "derecha" para 90 grados, "izquierda" para -90 grados

  // Obtener la lista de empresas disponibles
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

  // Actualizar la hora cada segundo
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

  const handleCityChange = (selectedOption) => {
    setSelectedCity(selectedOption);
  };
  // Funciones para manejar la publicidad
  const handleImagenPublicidadChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo y tamaño del archivo
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!validTypes.includes(file.type)) {
      Swal.fire({
        icon: "error",
        title: "Tipo de archivo no válido",
        text: "Por favor, seleccione una imagen en formato JPG, PNG o GIF.",
      });
      return;
    }

    if (file.size > maxSize) {
      Swal.fire({
        icon: "error",
        title: "Archivo demasiado grande",
        text: "El tamaño máximo permitido es de 2MB.",
      });
      return;
    }

    // Crear vista previa
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImagen(reader.result);
    };
    reader.readAsDataURL(file);

    setImagenSeleccionada(file);
  };

  const handlePublicidadTiempoChange = (e) => {
    const { name, value } = e.target;
    let newValue = parseInt(value) || 0;

    // Validar rangos
    if (name === "segundos" && newValue < 10) {
      newValue = 10;
    } else if ((name === "minutos" || name === "segundos") && newValue > 59) {
      newValue = 59;
    } else if (name === "horas" && newValue > 23) {
      newValue = 23;
    }

    setPublicidadTiempos({
      ...publicidadTiempos,
      [name]: newValue,
    });
  };

  const agregarPublicidad = async () => {
    if (!imagenSeleccionada) {
      Swal.fire({
        icon: "error",
        title: "Imagen requerida",
        text: "Por favor, seleccione una imagen para la publicidad.",
      });
      return;
    }

    if (
      publicidadTiempos.horas === 0 &&
      publicidadTiempos.minutos === 0 &&
      publicidadTiempos.segundos < 10
    ) {
      Swal.fire({
        icon: "error",
        title: "Tiempo inválido",
        text: "El tiempo mínimo de visualización es de 10 segundos.",
      });
      return;
    }

    try {
      setIsLoadingPublicidad(true);

      // Mostrar indicador de carga
      Swal.fire({
        title: "Subiendo imagen...",
        text: "Por favor espere mientras se procesa la imagen",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Obtener la empresa a actualizar
      let empresaToUpdate = empresaSeleccionada;

      if (!empresaToUpdate) {
        // Si no hay empresa seleccionada, obtener la empresa del usuario
        const authUser = firebase.auth().currentUser;
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
          Swal.close();
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo determinar la empresa a actualizar.",
          });
          return;
        }
      }

      // Subir imagen a Firebase Storage
      const storageRef = ref(
        storage,
        `publicidadTarifario/${Date.now()}-${imagenSeleccionada.name}`
      );
      await uploadBytes(storageRef, imagenSeleccionada);
      const imageUrl = await getDownloadURL(storageRef);

      // Crear nuevo item de publicidad
      const newPublicidadItem = {
        id: Date.now().toString(),
        imageUrl: imageUrl,
        horas: publicidadTiempos.horas,
        minutos: publicidadTiempos.minutos,
        segundos: publicidadTiempos.segundos,
        orientacion: publicidadOrientacion, // Añadir esta línea
        fechaCreacion: new Date(),
      };

      // Añadir a la lista
      const updatedPublicidadItems = [...publicidadItems, newPublicidadItem];
      setPublicidadItems(updatedPublicidadItems);

      // Guardar en Firebase
      const tarifarioRef = collection(db, "pantallasTarifario");
      const tarifarioQuery = query(
        tarifarioRef,
        where("empresa", "==", empresaToUpdate)
      );
      const tarifarioSnapshot = await getDocs(tarifarioQuery);

      if (!tarifarioSnapshot.empty) {
        const updatePromises = [];

        tarifarioSnapshot.forEach((doc) => {
          updatePromises.push(
            updateDoc(doc.ref, {
              publicidad: updatedPublicidadItems,
              ultimaActualizacion: serverTimestamp(),
            })
          );
        });

        await Promise.all(updatePromises);
      }

      // Limpiar formulario
      setImagenSeleccionada(null);
      setPreviewImagen(null);
      setPublicidadTiempos({ horas: 0, minutos: 0, segundos: 10 });
      setPublicidadOrientacion("horizontal"); // Reset a la orientación por defecto

      // Cerrar indicador de carga
      Swal.close();

      // Mostrar mensaje de éxito
      Swal.fire({
        icon: "success",
        title: "Publicidad agregada",
        text: "La imagen se ha agregado correctamente a la publicidad",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      console.error("Error al agregar publicidad:", error);
      Swal.fire({
        icon: "error",
        title: "Error al agregar publicidad",
        text: error.message,
      });
    } finally {
      setIsLoadingPublicidad(false);
    }
  };

  const eliminarPublicidad = async (index) => {
    try {
      const confirmacion = await Swal.fire({
        title: "¿Está seguro?",
        text: "Esta acción no se puede revertir",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      });

      if (!confirmacion.isConfirmed) return;

      setIsLoadingPublicidad(true);

      // Obtener la empresa a actualizar
      let empresaToUpdate = empresaSeleccionada;

      if (!empresaToUpdate) {
        // Si no hay empresa seleccionada, obtener la empresa del usuario
        const authUser = firebase.auth().currentUser;
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
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo determinar la empresa a actualizar.",
          });
          return;
        }
      }

      // Eliminar de la lista local
      const updatedPublicidadItems = [...publicidadItems];
      updatedPublicidadItems.splice(index, 1);
      setPublicidadItems(updatedPublicidadItems);

      // Actualizar en Firebase
      const tarifarioRef = collection(db, "pantallasTarifario");
      const tarifarioQuery = query(
        tarifarioRef,
        where("empresa", "==", empresaToUpdate)
      );
      const tarifarioSnapshot = await getDocs(tarifarioQuery);

      if (!tarifarioSnapshot.empty) {
        const updatePromises = [];

        tarifarioSnapshot.forEach((doc) => {
          updatePromises.push(
            updateDoc(doc.ref, {
              publicidad: updatedPublicidadItems,
              ultimaActualizacion: serverTimestamp(),
            })
          );
        });

        await Promise.all(updatePromises);
      }

      Swal.fire({
        icon: "success",
        title: "Eliminada",
        text: "La publicidad ha sido eliminada correctamente",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error("Error al eliminar publicidad:", error);
      Swal.fire({
        icon: "error",
        title: "Error al eliminar",
        text: error.message,
      });
    } finally {
      setIsLoadingPublicidad(false);
    }
  };

  // Cargar datos de publicidad
  const cargarPublicidad = async () => {
    try {
      console.log("Iniciando carga de publicidad...");
      const authUser = firebase.auth().currentUser;
      let empresa = empresaSeleccionada;

      if (!empresa) {
        console.log(
          "No hay empresa seleccionada, obteniendo empresa del usuario actual..."
        );
        const usuariosRef = collection(db, "usuarios");
        const usuariosQuery = query(
          usuariosRef,
          where("email", "==", authUser.email)
        );
        const usuariosSnapshot = await getDocs(usuariosQuery);

        if (!usuariosSnapshot.empty) {
          empresa = usuariosSnapshot.docs[0].data().empresa || "";
          console.log("Empresa obtenida del usuario:", empresa);
        } else {
          console.log(
            "No se encontró información del usuario en la base de datos"
          );
        }
      } else {
        console.log("Usando empresa seleccionada:", empresa);
      }

      if (empresa) {
        console.log("Buscando publicidad para la empresa:", empresa);
        const tarifarioRef = collection(db, "pantallasTarifario");
        const tarifarioQuery = query(
          tarifarioRef,
          where("empresa", "==", empresa)
        );
        const tarifarioSnapshot = await getDocs(tarifarioQuery);

        if (!tarifarioSnapshot.empty) {
          console.log("Se encontraron datos de tarifario para la empresa");
          const pantallaData = tarifarioSnapshot.docs[0].data();
          if (pantallaData.publicidad) {
            console.log(
              "Publicidad encontrada:",
              pantallaData.publicidad.length,
              "items"
            );
            setPublicidadItems(pantallaData.publicidad);
          } else {
            console.log("No hay datos de publicidad para esta empresa");
            setPublicidadItems([]);
          }
        } else {
          console.log("No hay datos de tarifario para esta empresa");
          setPublicidadItems([]);
        }
      } else {
        console.log(
          "No se pudo determinar la empresa, no se puede cargar publicidad"
        );
        setPublicidadItems([]);
      }
    } catch (error) {
      console.error("Error al cargar publicidad:", error);
      // Resetear los items de publicidad en caso de error
      setPublicidadItems([]);
    }
  };

  // No olvides añadir este useEffect después del código anterior:
  useEffect(() => {
    cargarPublicidad();
  }, [empresaSeleccionada]);
  // Cargar datos del usuario y número de pantallas
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const authUser = firebase.auth().currentUser;
        console.log("Fetching user data for:", authUser?.email);

        if (authUser) {
          const usuariosRef = collection(db, "usuarios");
          let usuariosQuery;

          // Si hay una empresa seleccionada, buscar usuarios con esa empresa
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
          console.log("User snapshot empty?", usuariosSnapshot.empty);

          if (!usuariosSnapshot.empty) {
            const user = usuariosSnapshot.docs[0].data();
            console.log("User data:", user);
            const numberOfScreens = user.pt || 0; // Usar pt en lugar de ps para tarifario
            console.log("Number of screens:", numberOfScreens);

            // Obtener los nombres de pantallas de la colección
            const nombresPantallasColeccion =
              user.nombrePantallasTarifario || [];
            console.log("Screen names:", nombresPantallasColeccion);

            // Asegurarnos de que tengamos suficientes nombres para el número de pantallas
            const namesArray = Array.from(
              { length: numberOfScreens },
              (_, index) =>
                nombresPantallasColeccion[index] || `Tarifario ${index + 1}`
            );

            setNombreEmpresa(user);
            setNombrePantallas(namesArray);
            setPt(numberOfScreens);
          }
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            "Hubo un problema al cargar los datos del usuario: " +
            error.message,
        });
      }
    };

    fetchUserData();
  }, [empresaSeleccionada]);

  // Cargar configuración de las pantallas
  useEffect(() => {
    const cargarConfiguracionPantallas = async () => {
      try {
        const authUser = firebase.auth().currentUser;
        console.log("Loading screen configuration for:", authUser?.email);

        if (authUser) {
          // Obtener empresa del usuario actual
          const usuariosRef = collection(db, "usuarios");
          const usuariosQuery = query(
            usuariosRef,
            where("email", "==", authUser.email)
          );
          const usuariosSnapshot = await getDocs(usuariosQuery);

          let empresa = "";
          if (!usuariosSnapshot.empty) {
            empresa = usuariosSnapshot.docs[0].data().empresa || "";
            console.log("Empresa del usuario:", empresa);
          }

          // Determinar qué empresa usar para cargar la configuración
          const empresaToLoad = empresaSeleccionada || empresa;
          console.log("Empresa a cargar configuración:", empresaToLoad);

          if (empresaToLoad) {
            // Buscar documento en TemplateTarifario
            const templateTarifarioRef = collection(db, "TemplateTarifario");
            const templateTarifarioQuery = query(
              templateTarifarioRef,
              where("empresa", "==", empresaToLoad)
            );
            const templateTarifarioSnapshot = await getDocs(
              templateTarifarioQuery
            );
            console.log(
              "Template snapshot empty?",
              templateTarifarioSnapshot.empty
            );

            if (!templateTarifarioSnapshot.empty) {
              const templateData = templateTarifarioSnapshot.docs[0].data();
              console.log("Template data:", templateData);

              // Establecer datos de configuración
              setSelectedTemplate(templateData.template || 1);
              setFontColor(templateData.fontColor || "#000000");
              setTemplateColor(templateData.templateColor || "#D1D5DB");
              setOrientacion(templateData.orientacion || "horizontal");
              setDireccionRotacion(templateData.direccionRotacion || "derecha");

              // Establecer ciudad si existe
              if (templateData.ciudad) {
                const selectedCityOption = cityOptions.find(
                  (option) => option.value === templateData.ciudad
                );
                setSelectedCity(selectedCityOption || null);
              }

              // Establecer fuente
              const selectedFontStyleOption = fontStyleOptions.find(
                (option) => option.value === templateData.fontStyle
              );
              setSelectedFontStyle(
                selectedFontStyleOption || fontStyleOptions[0]
              );

              // Establecer logo
              setSelectedLogo(templateData.logo || null);

              // Establecer idioma
              setSelectedLanguage(templateData.idioma || "es");
            } else {
              console.log(
                "No hay configuración guardada para la empresa:",
                empresaToLoad
              );
              // Establecer valores predeterminados
              setSelectedTemplate(1);
              setFontColor("#000000");
              setTemplateColor("#D1D5DB");
              setOrientacion("horizontal");
              setSelectedFontStyle(fontStyleOptions[0]);
              setSelectedCity(null);
            }
          }
        }
      } catch (error) {
        console.error("Error al cargar configuración de pantallas:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Hubo un problema al cargar la configuración: " + error.message,
        });
      }
    };

    cargarConfiguracionPantallas();
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

  const handleOrientacionChange = (e) => {
    setOrientacion(e.target.value);
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo y tamaño del archivo
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!validTypes.includes(file.type)) {
      Swal.fire({
        icon: "error",
        title: "Tipo de archivo no válido",
        text: "Por favor, seleccione una imagen en formato JPG, PNG o GIF.",
      });
      return;
    }

    if (file.size > maxSize) {
      Swal.fire({
        icon: "error",
        title: "Archivo demasiado grande",
        text: "El tamaño máximo permitido es de 2MB.",
      });
      return;
    }

    // Mostrar indicador de carga
    Swal.fire({
      title: "Subiendo imagen...",
      text: "Por favor espere mientras se procesa la imagen",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      // Crear una referencia única para la imagen
      const storageRef = ref(
        storage,
        `tarifarioLogos/${Date.now()}-${file.name}`
      );

      // Subir el archivo
      await uploadBytes(storageRef, file);

      // Obtener URL de descarga
      const logoUrl = await getDownloadURL(storageRef);

      // Actualizar estado
      setSelectedLogo(logoUrl);

      // Cerrar indicador de carga
      Swal.close();

      // Mostrar mensaje de éxito
      Swal.fire({
        icon: "success",
        title: "Imagen subida correctamente",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error("Error al subir el logo a Firebase Storage:", error);
      Swal.fire({
        icon: "error",
        title: "Error al subir la imagen",
        text: "Por favor, intente de nuevo: " + error.message,
      });
    }
  };

  const templates = [
    {
      id: 1,
      name: "Template 1",
      previewUrl: "/img/previewTarifario.png",
      description: "Diseño clásico con información clara y ordenada",
    },
  ];

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const guardarConfiguracionPantallas = async () => {
    try {
      const authUser = firebase.auth().currentUser;

      if (!authUser) {
        Swal.fire({
          icon: "error",
          title: "Usuario no autenticado",
          text: "No se puede guardar la configuración sin autenticación.",
        });
        return;
      }

      if (pt === 0) {
        Swal.fire({
          icon: "error",
          title: "No hay licencias activas para tarifarios",
          text: "No se pueden personalizar las pantallas de tarifario sin licencias activas.",
        });
        return;
      }

      if (!selectedLogo) {
        Swal.fire({
          icon: "error",
          title: "Falta el logo",
          text: "Por favor, selecciona un logo para continuar.",
        });
        return;
      }

      if (!selectedLanguage) {
        Swal.fire({
          icon: "error",
          title: "Selecciona un idioma",
          text: "Por favor, selecciona un idioma para la pantalla.",
        });
        return;
      }

      if (!selectedCity) {
        Swal.fire({
          icon: "error",
          title: "Selecciona una ciudad",
          text: "Por favor, selecciona una ciudad para el tarifario.",
        });
        return;
      }

      // Validar que la ciudad sea válida para la API de clima
      try {
        // Mostrar indicador de carga mientras verificamos
        Swal.fire({
          title: "Verificando ciudad...",
          didOpen: () => {
            Swal.showLoading();
          },
          allowOutsideClick: false,
          allowEscapeKey: false,
        });

        // Intentar obtener datos del clima para la ciudad seleccionada
        await fetchWeatherData(selectedCity.value);

        // Si llegamos aquí, la ciudad es válida, cerrar el indicador de carga
        Swal.close();
      } catch (error) {
        // Si hay un error, la ciudad podría no ser válida para la API
        Swal.fire({
          icon: "error",
          title: "Error de validación",
          text: "No se pudo verificar la ciudad seleccionada. Por favor, seleccione otra ciudad o inténtelo más tarde.",
        });
        return;
      }

      // Mostrar indicador de carga
      Swal.fire({
        title: "Guardando configuración...",
        text: "Por favor espere mientras se guardan los cambios",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Obtener la empresa a actualizar
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
          Swal.close();
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo determinar la empresa a actualizar.",
          });
          return;
        }
      }

      console.log("Guardando configuración para la empresa:", empresaToUpdate);

      // Actualizar los nombres de pantalla para todos los usuarios de la misma empresa
      const usuariosRef = collection(db, "usuarios");
      const usuariosEmpresaQuery = query(
        usuariosRef,
        where("empresa", "==", empresaToUpdate)
      );
      const usuariosEmpresaSnapshot = await getDocs(usuariosEmpresaQuery);

      const updateNombrePantallasPromises = [];

      usuariosEmpresaSnapshot.forEach((usuarioDoc) => {
        const usuarioRef = usuarioDoc.ref;
        const nombrePantallasObject = {};

        nombrePantallas.forEach((nombre, index) => {
          nombrePantallasObject[`nombrePantallasTarifario.${index}`] = nombre;
        });

        updateNombrePantallasPromises.push(
          updateDoc(usuarioRef, nombrePantallasObject)
        );
      });

      await Promise.all(updateNombrePantallasPromises);

      // Datos a guardar en TemplateTarifariof
      const configuracionData = {
        template: selectedTemplate,
        fontColor: fontColor,
        templateColor: templateColor,
        fontStyle: selectedFontStyle.value,
        logo: selectedLogo,
        empresa: empresaToUpdate,
        idioma: selectedLanguage,
        orientacion: orientacion,
        direccionRotacion:
          orientacion === "vertical" ? direccionRotacion : null, // Guardar solo si es vertical
        ciudad: selectedCity ? selectedCity.value : null,
        timestamp: serverTimestamp(),
      };

      // Buscar el documento existente en TemplateTarifario
      const templateTarifarioRef = collection(db, "TemplateTarifario");
      const templateTarifarioQuery = query(
        templateTarifarioRef,
        where("empresa", "==", empresaToUpdate)
      );
      const templateTarifarioSnapshot = await getDocs(templateTarifarioQuery);

      // Actualizar o crear documento en TemplateTarifario
      if (!templateTarifarioSnapshot.empty) {
        const templateTarifarioDocRef = templateTarifarioSnapshot.docs[0].ref;
        await updateDoc(templateTarifarioDocRef, configuracionData);
        console.log("Documento actualizado en TemplateTarifario");
      } else {
        // Si no hay documento existente para esta empresa, crear uno nuevo
        await addDoc(templateTarifarioRef, configuracionData);
        console.log("Nuevo documento creado en TemplateTarifario");
      }

      // Actualizar la colección de pantallasTarifario
      const tarifarioRef = collection(db, "pantallasTarifario");
      const tarifarioQuery = query(
        tarifarioRef,
        where("empresa", "==", empresaToUpdate)
      );
      const tarifarioSnapshot = await getDocs(tarifarioQuery);

      // Si ya existen pantallas de tarifario, actualizar apariencia
      if (!tarifarioSnapshot.empty) {
        const updatePromises = [];

        tarifarioSnapshot.forEach((doc) => {
          updatePromises.push(
            updateDoc(doc.ref, {
              template: selectedTemplate,
              fontColor: fontColor,
              templateColor: templateColor,
              fontStyle: selectedFontStyle.value,
              logo: selectedLogo,
              orientacion: orientacion,
              direccionRotacion:
                orientacion === "vertical" ? direccionRotacion : null, // Añadir esta línea
              ciudad: selectedCity ? selectedCity.value : null,
              publicidad: publicidadItems || [], // Añadir los items de publicidad
              idioma: selectedLanguage, // Añadir el idioma seleccionado
              ultimaActualizacion: serverTimestamp(),
            })
          );
        });

        await Promise.all(updatePromises);
        console.log("Pantallas de tarifario actualizadas");
      }
      // Si no existen, crear al menos una pantalla por defecto
      else if (pt > 0) {
        await addDoc(tarifarioRef, {
          nombre: "Tarifario Principal",
          descripcion: "Pantalla de tarifas principal",
          template: selectedTemplate,
          fontColor: fontColor,
          templateColor: templateColor,
          fontStyle: selectedFontStyle.value,
          logo: selectedLogo,
          orientacion: orientacion,
          direccionRotacion:
            orientacion === "vertical" ? direccionRotacion : null, // Añadir esta línea
          empresa: empresaToUpdate,
          idioma: selectedLanguage,
          ciudad: selectedCity ? selectedCity.value : null,
          publicidad: publicidadItems || [], // Añadir los items de publicidad
          fechaCreacion: serverTimestamp(),
          ultimaActualizacion: serverTimestamp(),
        });
        console.log("Pantalla de tarifario creada por defecto");
      }
      // Cerrar indicador de carga
      Swal.close();

      // Mostrar mensaje de éxito
      Swal.fire({
        icon: "success",
        title: "Información guardada",
        text: "La configuración de las pantallas ha sido guardada con éxito",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      console.error("Error al guardar la información:", error);
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: "Ocurrió un error al guardar la configuración: " + error.message,
      });
    }
  };

  const handlePreviewClick = (imageUrl) => {
    setPreviewImage(imageUrl);
    setIsModalOpen(true);
  };

  // Función para guardar con feedback visual
  const handleSaveWithFeedback = () => {
    guardarConfiguracionPantallas();
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
            {t("rateScreens.title")}
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-base text-gray-500 sm:text-lg">
            {t("rateScreens.description")}
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
              {t("rateScreens.generalConfig")}
            </button>

            <button
              onClick={() => setActiveTab("screens")}
              className={`flex-1 py-4 px-4 text-center font-medium text-sm sm:text-base ${
                activeTab === "screens"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t("rateScreens.screens")}
            </button>
            <button
              onClick={() => setActiveTab("appearance")}
              className={`flex-1 py-4 px-4 text-center font-medium text-sm sm:text-base ${
                activeTab === "appearance"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t("rateScreens.appearance")}
            </button>
            <button
              onClick={() => setActiveTab("publicidad")}
              className={`flex-1 py-4 px-4 text-center font-medium text-sm sm:text-base ${
                activeTab === "publicidad"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t("rateScreens.publicity")}
            </button>
          </div>

          {/* Contenido de las pestañas */}
          <div className="p-6">
            {/* Pestaña de Configuración General */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  {t("rateScreens.generalConfig")}
                </h2>

                {/* Logo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("rateScreens.logo")}
                  </label>
                  <div className="mt-1">
                    <label className="w-full flex flex-col justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-gray-400">
                      <div className="space-y-3 text-center w-full">
                        {selectedLogo ? (
                          <div className="mx-auto">
                            <img
                              src={selectedLogo}
                              alt="Logo Actual"
                              className="h-24 w-auto object-contain mx-auto"
                            />
                          </div>
                        ) : (
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
                        )}
                        <div className="flex justify-center text-sm text-gray-600">
                          <span>
                            {selectedLogo
                              ? t("rateScreens.changeLogo")
                              : t("rateScreens.uploadLogo")}
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
                          {t("rateScreens.logoDescription")}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Ciudad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("rateScreens.weatherCity")}
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

                {/* Orientación */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("rateScreens.orientation")}
                  </label>
                  <div className="mt-2 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:space-x-6">
                    <div className="flex items-center">
                      <input
                        id="horizontal"
                        name="orientacion"
                        type="radio"
                        value="horizontal"
                        checked={orientacion === "horizontal"}
                        onChange={handleOrientacionChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label
                        htmlFor="horizontal"
                        className="ml-3 block text-sm font-medium text-gray-700"
                      >
                        {t("rateScreens.landscape")}
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="vertical"
                        name="orientacion"
                        type="radio"
                        value="vertical"
                        checked={orientacion === "vertical"}
                        onChange={handleOrientacionChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label
                        htmlFor="vertical"
                        className="ml-3 block text-sm font-medium text-gray-700"
                      >
                        {t("rateScreens.portrait")}
                      </label>
                    </div>
                  </div>

                  {/* Agregar esto: Control de dirección de rotación (visible solo cuando orientación es vertical) */}
                  {orientacion === "vertical" && (
                    <div className="mt-4 border-t pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("rateScreens.rotationDirection")}
                      </label>
                      <div className="flex space-x-4">
                        <div className="flex items-center">
                          <input
                            id="rotacion-derecha"
                            name="direccionRotacion"
                            type="radio"
                            value="derecha"
                            checked={direccionRotacion === "derecha"}
                            onChange={(e) =>
                              setDireccionRotacion(e.target.value)
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label
                            htmlFor="rotacion-derecha"
                            className="ml-2 block text-sm font-medium text-gray-700"
                          >
                            90° {t("rateScreens.right")}
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="rotacion-izquierda"
                            name="direccionRotacion"
                            type="radio"
                            value="izquierda"
                            checked={direccionRotacion === "izquierda"}
                            onChange={(e) =>
                              setDireccionRotacion(e.target.value)
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label
                            htmlFor="rotacion-izquierda"
                            className="ml-2 block text-sm font-medium text-gray-700"
                          >
                            -90° {t("rateScreens.left")}
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Idioma */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t("rateScreens.language")}
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
                        {t("rateScreens.spanish")}
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
                        {t("rateScreens.english")}
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
                        {t("rateScreens.spanish/english")}
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
                  {t("rateScreens.screens")}
                </h2>

                <div className="space-y-4">
                  {Array.from({ length: pt }, (_, index) => (
                    <div
                      className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200"
                      key={index}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="text-sm font-medium text-gray-700 mr-2 w-32">
                              {t("rateScreens.screens")} {""}
                              {index + 1}:
                            </span>
                            <input
                              type="text"
                              placeholder={`Tarifario ${index + 1}`}
                              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              value={nombrePantallas[index] || ""}
                              onChange={(e) => {
                                const enteredValue = e.target.value;
                                const truncatedValue = enteredValue.slice(
                                  0,
                                  50
                                );
                                const updatedNombres = [...nombrePantallas];
                                updatedNombres[index] = truncatedValue;
                                setNombrePantallas(updatedNombres);
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <Link
                            href={`/pantallaTarifario/${
                              index + 1
                            }${isProduction}/?emp=${nombreEmpresa?.empresa}`}
                            target="_blank"
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            URL
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {pt === 0 && (
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                    <p className="text-yellow-600">
                      {t("rateScreens.noScreens")}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Pestaña de Apariencia */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  {t("rateScreens.appearance")}
                </h2>

                {/* Selección de Template */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("rateScreens.selectTemplate")}
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
                              handlePreviewClick(template.previewUrl);
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
                      {t("rateScreens.textStyle")}
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
                      <p> {t("rateScreens.exampleText")}</p>
                    </div>
                  </div>
                  {/* Color de Texto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("rateScreens.textColor")}
                    </label>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleFontColorChange}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {t("rateScreens.selectColor")}
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
                          {t("rateScreens.done")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Color de Plantilla */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("rateScreens.templateColor")}
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleTemplateColorChange}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {t("rateScreens.selectColor")}
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
                        {t("rateScreens.done")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Pestaña de Publicidad */}
            {activeTab === "publicidad" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  {t("rateScreens.publicity")}
                </h2>

                {/* Agregar nueva publicidad */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
                  <h3 className="text-md font-medium text-gray-800 mb-4">
                    {t("rateScreens.addNewPublicity")}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Selector de imagen */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("rateScreens.selectImage")}
                      </label>
                      {previewImagen ? (
                        <div className="mb-4">
                          <div className="relative">
                            <img
                              src={previewImagen}
                              alt="Vista previa"
                              className="max-h-48 w-auto mx-auto border rounded-md"
                            />
                            <button
                              onClick={() => {
                                setImagenSeleccionada(null);
                                setPreviewImagen(null);
                              }}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
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
                      ) : (
                        <label className="flex justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-blue-400 focus:outline-none">
                          <span className="flex items-center space-x-2 h-full">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-6 h-6 text-gray-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="font-medium text-gray-600">
                              {t("rateScreens.uploadImage")}
                              <span className="text-blue-600 underline ml-1">
                                {t("rateScreens.browse")}
                              </span>
                            </span>
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImagenPublicidadChange}
                          />
                        </label>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        {t("rateScreens.imageDescription")}
                      </p>
                    </div>

                    {/* Tiempo de visualización */}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("rateScreens.displayTime")}
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        {["horas", "minutos", "segundos"].map((unit) => (
                          <div key={unit} className="flex flex-col">
                            <label className="text-sm text-gray-600 mb-1 capitalize">
                              {t(`rateScreens.${unit}`)}
                            </label>
                            <input
                              type="number"
                              name={unit}
                              min={unit === "segundos" ? "10" : "0"}
                              max={unit === "horas" ? "23" : "59"}
                              value={publicidadTiempos[unit]}
                              onChange={handlePublicidadTiempoChange}
                              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
                            />
                          </div>
                        ))}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {t("rateScreens.recommendedTime")}
                      </p>
                      {/* Selector de orientación para la publicidad */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("rateScreens.screenOrientation")}
                        </label>
                        <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                          <div
                            className={`relative border rounded-lg p-3 cursor-pointer ${
                              publicidadOrientacion === "horizontal"
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                            onClick={() =>
                              setPublicidadOrientacion("horizontal")
                            }
                          >
                            <div className="flex items-start">
                              <div
                                className={`flex-shrink-0 h-5 w-5 ${
                                  publicidadOrientacion === "horizontal"
                                    ? "text-blue-600"
                                    : "text-gray-400"
                                }`}
                              >
                                {publicidadOrientacion === "horizontal" ? (
                                  <svg
                                    className="h-5 w-5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    ></path>
                                  </svg>
                                ) : (
                                  <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    ></path>
                                  </svg>
                                )}
                              </div>
                              <div className="ml-3">
                                <h4 className="text-sm font-medium text-gray-900">
                                  {t("rateScreens.landscape")}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {t("rateScreens.landscapeDescription")}
                                </p>
                              </div>
                            </div>
                            <input
                              id="pub-horizontal"
                              name="publicidadOrientacion"
                              type="radio"
                              value="horizontal"
                              checked={publicidadOrientacion === "horizontal"}
                              onChange={(e) =>
                                setPublicidadOrientacion(e.target.value)
                              }
                              className="sr-only" // Oculto visualmente pero accesible
                            />
                          </div>

                          <div
                            className={`relative border rounded-lg p-3 cursor-pointer ${
                              publicidadOrientacion === "vertical"
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                            onClick={() => setPublicidadOrientacion("vertical")}
                          >
                            <div className="flex items-start">
                              <div
                                className={`flex-shrink-0 h-5 w-5 ${
                                  publicidadOrientacion === "vertical"
                                    ? "text-blue-600"
                                    : "text-gray-400"
                                }`}
                              >
                                {publicidadOrientacion === "vertical" ? (
                                  <svg
                                    className="h-5 w-5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    ></path>
                                  </svg>
                                ) : (
                                  <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    ></path>
                                  </svg>
                                )}
                              </div>
                              <div className="ml-3">
                                <h4 className="text-sm font-medium text-gray-900">
                                  {t("rateScreens.portrait")}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {t("rateScreens.portraitDescription")}
                                </p>
                              </div>
                            </div>
                            <input
                              id="pub-vertical"
                              name="publicidadOrientacion"
                              type="radio"
                              value="vertical"
                              checked={publicidadOrientacion === "vertical"}
                              onChange={(e) =>
                                setPublicidadOrientacion(e.target.value)
                              }
                              className="sr-only" // Oculto visualmente pero accesible
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={agregarPublicidad}
                      disabled={isLoadingPublicidad || !imagenSeleccionada}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                        isLoadingPublicidad || !imagenSeleccionada
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      }`}
                    >
                      {isLoadingPublicidad ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          {t("rateScreens.loading")}
                        </>
                      ) : (
                        t("rateScreens.addAdvertisement")
                      )}
                    </button>
                  </div>
                </div>

                {/* Lista de publicidad actual */}
                <div>
                  <h3 className="text-md font-medium text-gray-800 mb-4">
                    {t("rateScreens.currentAdvertisement")}(
                    {publicidadItems.length}/10)
                  </h3>

                  {publicidadItems.length === 0 ? (
                    <div className="text-center p-8 bg-gray-50 border border-gray-200 rounded-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        {t("rateScreens.noAdvertisement")}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {t("rateScreens.addAdvertisement")}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {publicidadItems.map((item, index) => (
                        <div
                          key={item.id}
                          className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-medium text-gray-700">
                              {t("rateScreens.advertisement")} {""}
                              {index + 1}
                            </h4>
                            <button
                              onClick={() => eliminarPublicidad(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                          <div className="mb-2">
                            <img
                              src={item.imageUrl}
                              alt={`Publicidad ${index + 1}`}
                              className="w-full h-32 object-contain border border-gray-200 rounded-md"
                            />
                          </div>
                          <div className="text-xs text-gray-600 flex justify-between">
                            <div>
                              <span>
                                {t("rateScreens.time")}{" "}
                                {item.horas > 0 ? `${item.horas}h ` : ""}
                                {item.minutos > 0 ? `${item.minutos}m ` : ""}
                                {item.segundos}s
                              </span>
                              <span className="ml-2 bg-gray-200 px-2 py-1 rounded-full">
                                {item.orientacion === "vertical"
                                  ? t("rateScreens.portrait")
                                  : t("rateScreens.landscape")}
                              </span>
                            </div>
                            <span>
                              {item.fechaCreacion
                                ? new Date(
                                    item.fechaCreacion.seconds
                                      ? item.fechaCreacion.seconds * 1000
                                      : item.fechaCreacion
                                  ).toLocaleDateString()
                                : t("rateScreens.unknownDate")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Nota informativa */}
                <div className="mt-6 bg-blue-50 p-4 rounded-md border border-blue-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-blue-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        {t("rateScreens.publicityNote")}
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <ul className="list-disc pl-5 space-y-1">
                          <li>{t("rateScreens.adImageLimit")}</li>
                          <li>{t("rateScreens.imageDisplayLocation")}</li>
                          <li>{t("rateScreens.minimumDisplayTime")}</li>
                          <li>{t("rateScreens.imageRecommendation")}</li>
                        </ul>
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
                    setSelectedTemplate(templates[0]?.id || 1);
                    setOrientacion("horizontal");
                    setDireccionRotacion("derecha"); // Restablecer dirección de rotación
                    setSelectedCity(null); // Resetear la ciudad seleccionada
                  }
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {t("rateScreens.reset")}
              </button>
              <button
                onClick={handleSaveWithFeedback}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t("rateScreens.save")}
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
                  {t("rateScreens.successMessage")}
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

      {/* Modal para vista previa de Template */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {t("rateScreens.templatePreview")}
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
                {t("rateScreens.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PantallasTarifario;
