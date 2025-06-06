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
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import Swal from "sweetalert2";
import {
  getDownloadURL,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getStorage,
} from "firebase/storage";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { firebaseConfig } from "@/firebase/firebaseConfig";
import Datepicker from "react-tailwindcss-datepicker";
import moment from "moment";
import { CalendarIcon } from "@heroicons/react/20/solid";

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = getFirestore();
const storage = getStorage();

function PantallasPromociones() {
  const isProduction = process.env.NEXT_PUBLIC_PRODUCTION;
  const currentDate = new Date();

  const { t } = useTranslation();
  const [nombrePantallas, setNombrePantallas] = useState([]);
  const [pp, setPp] = useState(0);
  const [fontColor, setFontColor] = useState("#000000");
  const [showFontColorPicker, setShowFontColorPicker] = useState(false);
  const [empresas, setEmpresas] = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("es");
  const [nombreEmpresa, setNombreEmpresa] = useState(null);
  const [activeTab, setActiveTab] = useState("general");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Gestión de pantallas y contenido
  const [selectedPantalla, setSelectedPantalla] = useState(null);
  const [pantallaSettings, setPantallaSettings] = useState({});
  const [showContentModal, setShowContentModal] = useState(false);
  const [showSectionConfigModal, setShowSectionConfigModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [editingContent, setEditingContent] = useState(null);
  const [newContentItem, setNewContentItem] = useState({
    type: "image",
    url: "",
    duration: 10,
    name: "",
    date: {
      startDate: null,
      endDate: null,
    },
  });
  const [contentDate, setContentDate] = useState({
    startDate: null,
    endDate: null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Lista de ciudades para el clima
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
    { value: "Acapulco", label: "Acapulco, Guerrero" },
    { value: "Oaxaca", label: "Oaxaca, Oaxaca" },
  ]);

  // Ordenar alfabéticamente
  cityOptions.sort((a, b) => a.label.localeCompare(b.label));

  const [selectedCity, setSelectedCity] = useState(null);

  // Templates disponibles
  const templates = [
    { id: 1, name: t("promotionScreens.oneSection"), sections: 1 },
    { id: 2, name: t("promotionScreens.threeSections"), sections: 3 },
    { id: 3, name: t("promotionScreens.sixSections"), sections: 6 },
  ];

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

  const fontStyleOptions = [
    { value: "Arial", label: "Arial" },
    { value: "Avenir", label: "Avenir" },
    { value: "Bebas Neue", label: "Bebas Neue" },
    { value: "Cabin", label: "Cabin" },
    { value: "Helvetica", label: "Helvetica" },
    { value: "Montserrat", label: "Montserrat" },
    { value: "Open Sans", label: "Open Sans" },
    { value: "Roboto", label: "Roboto" },
    { value: "Poppins", label: "Poppins" },
    { value: "Raleway", label: "Raleway" },
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

          if (empresaSeleccionada) {
            usuariosQuery = query(
              usuariosRef,
              where("empresa", "==", empresaSeleccionada)
            );
          } else {
            usuariosQuery = query(
              usuariosRef,
              where("email", "==", authUser.email)
            );
          }

          const usuariosSnapshot = await getDocs(usuariosQuery);

          if (!usuariosSnapshot.empty) {
            const user = usuariosSnapshot.docs[0].data();
            const numberOfScreens = user.pp || 0;

            const nombresPantallasColeccion =
              user.nombrePantallasPromociones || [];

            const namesArray = Array.from(
              { length: numberOfScreens },
              (_, index) =>
                nombresPantallasColeccion[index] || `Promociones ${index + 1}`
            );

            setNombreEmpresa(user);
            setNombrePantallas(namesArray);
            setPp(numberOfScreens);
          }
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
      }
    };

    fetchUserData();
  }, [empresaSeleccionada]);

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
          let empresa = "";

          if (!usuariosSnapshot.empty) {
            empresa = usuariosSnapshot.docs[0].data().empresa || "";
          }

          // Determinar qué empresa usar para cargar datos
          const empresaToUse = empresaSeleccionada || empresa;

          if (empresaToUse) {
            // Buscar configuración en la colección TemplatePromociones
            const templatePromoRef = collection(db, "TemplatePromociones");
            const templatePromoQuery = query(
              templatePromoRef,
              where("empresa", "==", empresaToUse)
            );

            const templatePromoSnapshot = await getDocs(templatePromoQuery);

            if (!templatePromoSnapshot.empty) {
              const templatePromoData = templatePromoSnapshot.docs[0].data();

              // Cargar configuración básica
              setFontColor(templatePromoData.fontColor || "#000000");

              // Cargar fuente seleccionada
              const selectedFontStyleOption = fontStyleOptions.find(
                (option) => option.value === templatePromoData.fontStyle
              );
              setSelectedFontStyle(
                selectedFontStyleOption || fontStyleOptions[0]
              );

              // Cargar idioma y ciudad seleccionada
              setSelectedLanguage(templatePromoData.idioma || "es");

              if (templatePromoData.selectedCity) {
                setSelectedCity(templatePromoData.selectedCity);
              }

              // Cargar configuración por pantalla
              if (templatePromoData.pantallasConfig) {
                setPantallaSettings(templatePromoData.pantallasConfig);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error al cargar datos de personalización:", error);
      }
    };

    cargarDatosPersonalizacion();
  }, [empresaSeleccionada]);

  const handleFontColorChange = () => {
    setShowFontColorPicker(!showFontColorPicker);
  };

  const handleColorChange = (color) => {
    setFontColor(color.hex);
    setHasUnsavedChanges(true);
  };

  const handleFontStyleChange = (selectedOption) => {
    setSelectedFontStyle(selectedOption);
    setHasUnsavedChanges(true);
  };

  const handleCityChange = (selectedOption) => {
    setSelectedCity(selectedOption);
    setHasUnsavedChanges(true);
  };

  const handleDateValueChange = (newValue) => {
    setContentDate(newValue);
    setNewContentItem({
      ...newContentItem,
      date: newValue,
    });
  };

  const handleContentFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileType = file.type.startsWith("video/") ? "video" : "image";

    // Validar tipo y tamaño del archivo
    const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
    const validVideoTypes = ["video/mp4", "video/webm", "video/ogg"];
    const validTypes = [...validImageTypes, ...validVideoTypes];

    const maxSize = fileType === "video" ? 50 * 1024 * 1024 : 5 * 1024 * 1024; // 50MB para videos, 5MB para imágenes

    if (!validTypes.includes(file.type)) {
      Swal.fire({
        icon: "error",
        title: "Tipo de archivo no válido",
        text: "Por favor, seleccione una imagen (JPG, PNG, GIF) o un video (MP4, WEBM, OGG).",
      });
      return;
    }

    if (file.size > maxSize) {
      Swal.fire({
        icon: "error",
        title: "Archivo demasiado grande",
        text: `El tamaño máximo permitido es de ${
          fileType === "video" ? "50MB" : "5MB"
        }.`,
      });
      return;
    }

    // Mostrar indicador de carga
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Crear una referencia única para el archivo
      const storageRef = ref(
        storage,
        `pantallaPromocionesContent/${fileType}/${Date.now()}-${file.name}`
      );

      // Usar uploadBytesResumable para monitoreo de progreso
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Agregar oyente para el progreso de carga
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Calcular progreso
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          // Manejar errores
          console.error("Error al subir el archivo:", error);
          Swal.fire({
            icon: "error",
            title: "Error al subir el archivo",
            text: "Por favor, intente de nuevo: " + error.message,
          });
          setIsUploading(false);
          setUploadProgress(0);
        },
        async () => {
          // Cuando la carga se completa
          const fileUrl = await getDownloadURL(uploadTask.snapshot.ref);

          // Actualizar el estado del nuevo elemento de contenido
          setNewContentItem({
            ...newContentItem,
            type: fileType,
            url: fileUrl,
            name: file.name,
          });

          setIsUploading(false);

          // Mostrar mensaje de éxito
          Swal.fire({
            icon: "success",
            title: "Archivo subido correctamente",
            showConfirmButton: false,
            timer: 1500,
          });
        }
      );
    } catch (error) {
      console.error("Error al iniciar la carga del archivo:", error);
      Swal.fire({
        icon: "error",
        title: "Error al subir el archivo",
        text: "Por favor, intente de nuevo: " + error.message,
      });
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSelectPantalla = async (pantallaIndex) => {
    // Si hay cambios sin guardar, mostrar advertencia
    if (hasUnsavedChanges) {
      const result = await Swal.fire({
        title: "Cambios sin guardar",
        text: "Tiene cambios sin guardar. ¿Desea guardarlos antes de continuar?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Guardar",
        cancelButtonText: "Descartar cambios",
      });

      if (result.isConfirmed) {
        await guardarInformacionPersonalizacion();
      }

      setHasUnsavedChanges(false);
    }

    // Obtener la configuración actual de la pantalla
    const pantallaNombre = nombrePantallas[pantallaIndex];
    const pantallaId = `promo${pantallaIndex + 1}`;

    // Configuración por defecto si no existe
    let config = pantallaSettings[pantallaId] || {
      templateId: 1,
      sections: {
        1: { content: [] },
      },
    };

    // Establecer la pantalla seleccionada con su configuración
    setSelectedPantalla({
      id: pantallaId,
      index: pantallaIndex,
      nombre: pantallaNombre,
      config: config,
    });

    setActiveTab("pantalla");
  };

  const handleSaveContent = () => {
    if (!newContentItem.url) {
      Swal.fire({
        icon: "error",
        title: "Falta contenido",
        text: "Por favor, suba una imagen o video primero.",
      });
      return;
    }

    if (newContentItem.duration <= 0) {
      Swal.fire({
        icon: "error",
        title: "Duración inválida",
        text: "La duración debe ser mayor a 0 segundos.",
      });
      return;
    }
    if (!newContentItem.date.startDate || !newContentItem.date.endDate) {
      Swal.fire({
        icon: "error",
        title: "Fechas no seleccionadas",
        text: "Por favor, seleccione las fechas de inicio y fin para el contenido.",
      });
      return;
    }
    const sectionId = selectedSection.id;

    // Crear una copia de la configuración actual
    const updatedConfig = { ...selectedPantalla.config };

    if (editingContent !== null) {
      // Actualizar contenido existente
      updatedConfig.sections[sectionId].content[editingContent.index] = {
        ...newContentItem,
      };
    } else {
      // Agregar nuevo contenido
      if (!updatedConfig.sections[sectionId].content) {
        updatedConfig.sections[sectionId].content = [];
      }
      updatedConfig.sections[sectionId].content.push({ ...newContentItem });
    }

    // Actualizar el estado
    setSelectedPantalla({
      ...selectedPantalla,
      config: updatedConfig,
    });

    // Actualizar configuración global
    setPantallaSettings({
      ...pantallaSettings,
      [selectedPantalla.id]: updatedConfig,
    });

    setHasUnsavedChanges(true);
    setShowContentModal(false);
    setEditingContent(null);
    setNewContentItem({
      type: "image",
      url: "",
      duration: 10,
      name: "",
      date: {
        startDate: null,
        endDate: null,
      },
    });
  };

  const handleAddContent = (sectionId) => {
    setSelectedSection({ id: sectionId });
    setEditingContent(null);
    setNewContentItem({
      type: "image",
      url: "",
      duration: 10,
      name: "",
      date: {
        startDate: null,
        endDate: null,
      },
    });
    setContentDate({
      startDate: null,
      endDate: null,
    });

    setShowContentModal(true);
  };

  const handleEditContent = (sectionId, contentIndex) => {
    const content =
      selectedPantalla.config.sections[sectionId].content[contentIndex];
    setSelectedSection({ id: sectionId });
    setEditingContent({ index: contentIndex });

    // Recuperar las fechas o usar fechas por defecto si no existen
    const startDate = content.date?.startDate
      ? new Date(content.date.startDate)
      : new Date();
    const endDate = content.date?.endDate
      ? new Date(content.date.endDate)
      : new Date(new Date().setMonth(new Date().getMonth() + 1));

    setContentDate({
      startDate: startDate,
      endDate: endDate,
    });

    setNewContentItem({
      ...content,
      date: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });

    setShowContentModal(true);
  };

  const handleDeleteContent = (sectionId, contentIndex) => {
    Swal.fire({
      title: "¿Está seguro?",
      text: "Esta acción eliminará este elemento de contenido.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        // Crear una copia de la configuración actual
        const updatedConfig = { ...selectedPantalla.config };

        // Eliminar el elemento de contenido
        updatedConfig.sections[sectionId].content.splice(contentIndex, 1);

        // Actualizar el estado
        setSelectedPantalla({
          ...selectedPantalla,
          config: updatedConfig,
        });

        // Actualizar configuración global
        setPantallaSettings({
          ...pantallaSettings,
          [selectedPantalla.id]: updatedConfig,
        });

        setHasUnsavedChanges(true);

        Swal.fire(
          "Eliminado",
          "El contenido ha sido eliminado correctamente.",
          "success"
        );
      }
    });
  };

  const handleChangeTemplate = (templateId) => {
    // Obtener el template seleccionado
    const template = templates.find((t) => t.id === templateId);

    if (!template) return;

    // Verificar si ya hay contenido configurado
    let hasContent = false;
    if (selectedPantalla.config.sections) {
      for (const sectionId in selectedPantalla.config.sections) {
        if (selectedPantalla.config.sections[sectionId].content?.length > 0) {
          hasContent = true;
          break;
        }
      }
    }

    // Si hay contenido y se está cambiando de template, mostrar advertencia
    if (hasContent && selectedPantalla.config.templateId !== templateId) {
      Swal.fire({
        title: "¿Está seguro?",
        text: "Cambiar de template puede afectar al contenido configurado. Es posible que deba volver a configurar el contenido para las nuevas secciones.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, cambiar template",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          applyTemplateChange(template, templateId);
        }
      });
    } else {
      applyTemplateChange(template, templateId);
    }
  };

  const applyTemplateChange = (template, templateId) => {
    // Crear nueva configuración basada en el template
    const newSections = {};
    for (let i = 1; i <= template.sections; i++) {
      // Conservar el contenido existente si es posible
      if (
        selectedPantalla.config.sections &&
        selectedPantalla.config.sections[i]
      ) {
        newSections[i] = selectedPantalla.config.sections[i];
      } else {
        newSections[i] = { content: [] };
      }
    }

    // Crear configuración actualizada
    const updatedConfig = {
      ...selectedPantalla.config,
      templateId: templateId,
      sections: newSections,
    };

    // Actualizar el estado
    setSelectedPantalla({
      ...selectedPantalla,
      config: updatedConfig,
    });

    // Actualizar configuración global
    setPantallaSettings({
      ...pantallaSettings,
      [selectedPantalla.id]: updatedConfig,
    });

    setHasUnsavedChanges(true);
  };

  const handleMoveContent = (sectionId, contentIndex, direction) => {
    // Obtener el contenido actual
    const sectionContent = [
      ...selectedPantalla.config.sections[sectionId].content,
    ];

    // Verificar límites
    if (
      (direction === "up" && contentIndex === 0) ||
      (direction === "down" && contentIndex === sectionContent.length - 1)
    ) {
      return; // No se puede mover más
    }

    // Calcular nuevo índice
    const newIndex = direction === "up" ? contentIndex - 1 : contentIndex + 1;

    // Hacer el intercambio
    const temp = sectionContent[contentIndex];
    sectionContent[contentIndex] = sectionContent[newIndex];
    sectionContent[newIndex] = temp;

    // Crear configuración actualizada
    const updatedConfig = { ...selectedPantalla.config };
    updatedConfig.sections[sectionId].content = sectionContent;

    // Actualizar el estado
    setSelectedPantalla({
      ...selectedPantalla,
      config: updatedConfig,
    });

    // Actualizar configuración global
    setPantallaSettings({
      ...pantallaSettings,
      [selectedPantalla.id]: updatedConfig,
    });

    setHasUnsavedChanges(true);
  };

  const guardarInformacionPersonalizacion = async () => {
    try {
      const authUser = firebase.auth().currentUser;

      if (pp === 0) {
        Swal.fire({
          icon: "error",
          title: "No hay licencias activas para pantallas de promociones",
        });
        return;
      }

      if (!authUser) {
        Swal.fire({
          icon: "error",
          title: "Usuario no autenticado",
        });
        return;
      }

      if (!selectedFontStyle) {
        Swal.fire({
          icon: "error",
          title: "Por favor, selecciona un estilo de texto",
        });
        return;
      }

      // Validar que todas las pantallas tengan un template asignado
      for (const pantallaId in pantallaSettings) {
        if (!pantallaSettings[pantallaId].templateId) {
          Swal.fire({
            icon: "error",
            title: `La pantalla ${pantallaId} no tiene un template asignado`,
          });
          return;
        }
      }

      // Obtener la empresa a actualizar
      let empresaToUpdate = empresaSeleccionada;

      if (!empresaToUpdate) {
        const usuariosRef = collection(db, "usuarios");
        const usuariosQuery = query(
          usuariosRef,
          where("email", "==", authUser.email)
        );
        const usuariosSnapshot = await getDocs(usuariosQuery);

        if (!usuariosSnapshot.empty) {
          empresaToUpdate = usuariosSnapshot.docs[0].data().empresa || "";
        } else {
          console.error("No se encontró la empresa del usuario autenticado");
          return;
        }
      }

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
        const usuarioData = usuarioDoc.data();

        if (usuarioRef && usuarioData) {
          const nombrePantallasObject = {};
          nombrePantallas.forEach((nombre, index) => {
            nombrePantallasObject[`nombrePantallasPromociones.${index}`] =
              nombre;
          });
          updateNombrePantallasPromises.push(
            updateDoc(usuarioRef, nombrePantallasObject)
          );
        }
      });

      await Promise.all(updateNombrePantallasPromises);

      // Buscar documento existente en TemplatePromociones
      const templatePromoRef = collection(db, "TemplatePromociones");
      const templatePromoQuery = query(
        templatePromoRef,
        where("empresa", "==", empresaToUpdate)
      );
      const templatePromoSnapshot = await getDocs(templatePromoQuery);

      const templateData = {
        fontColor: fontColor,
        fontStyle: selectedFontStyle.value,
        empresa: empresaToUpdate,
        idioma: selectedLanguage,
        pantallasConfig: pantallaSettings,
        selectedCity: selectedCity,
        timestamp: serverTimestamp(),
      };

      if (!templatePromoSnapshot.empty) {
        // Actualizar documento existente
        const templatePromoDocRef = templatePromoSnapshot.docs[0].ref;
        await updateDoc(templatePromoDocRef, templateData);
      } else {
        // Crear nuevo documento
        await addDoc(templatePromoRef, templateData);
      }

      Swal.fire({
        icon: "success",
        title: "Información guardada con éxito",
        showConfirmButton: false,
        timer: 2000,
      });

      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);

      setHasUnsavedChanges(false);

      return true;
    } catch (error) {
      console.error("Error al guardar la información:", error);
      Swal.fire({
        icon: "error",
        title: "Error al guardar la información",
        text: error.message,
      });
      return false;
    }
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
    setHasUnsavedChanges(true);
  };

  // Función para guardar con feedback
  const handleSaveWithFeedback = () => {
    guardarInformacionPersonalizacion();
  };

  // Función para volver a lista de pantallas guardando cambios
  const handleBackToScreensList = async () => {
    if (hasUnsavedChanges) {
      const result = await guardarInformacionPersonalizacion();
      if (result) {
        setActiveTab("screens");
        setSelectedPantalla(null);
      }
    } else {
      setActiveTab("screens");
      setSelectedPantalla(null);
    }
  };

  // Función para renderizar el preview del template
  const renderTemplatePreview = (templateId) => {
    switch (templateId) {
      case 1:
        return (
          <div className="w-full aspect-[16/9] bg-black relative grid grid-cols-1 grid-rows-1 gap-2 p-2 rounded">
            <div className="bg-gray-700 rounded flex items-center justify-center">
              <span className="text-white text-sm">
                {" "}
                {t("promotionScreens.uniqueSection")}
              </span>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="w-full aspect-[16/9] bg-black relative grid grid-cols-3 grid-rows-2 gap-2 p-2 rounded">
            <div className="col-span-1 row-span-1 bg-gray-700 rounded flex items-center justify-center">
              <span className="text-white text-xs">
                {" "}
                {t("promotionScreens.sectionCount")} 1
              </span>
            </div>
            <div className="col-span-2 row-span-2 bg-gray-700 rounded flex items-center justify-center">
              <span className="text-white text-sm">
                {" "}
                {t("promotionScreens.sectionCount")} 3
              </span>
            </div>
            <div className="col-span-1 row-span-1 bg-gray-700 rounded flex items-center justify-center">
              <span className="text-white text-xs">
                {" "}
                {t("promotionScreens.sectionCount")} 2
              </span>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="w-full aspect-[16/9] bg-black relative grid grid-cols-3 grid-rows-2 gap-2 p-2 rounded">
            <div className="col-span-1 row-span-1 bg-gray-700 rounded flex items-center justify-center">
              <span className="text-white text-xs">1</span>
            </div>
            <div className="col-span-1 row-span-1 bg-gray-700 rounded flex items-center justify-center">
              <span className="text-white text-xs">2</span>
            </div>
            <div className="col-span-1 row-span-1 bg-gray-700 rounded flex items-center justify-center">
              <span className="text-white text-xs">3</span>
            </div>
            <div className="col-span-1 row-span-1 bg-gray-700 rounded flex items-center justify-center">
              <span className="text-white text-xs">4</span>
            </div>
            <div className="col-span-1 row-span-1 bg-gray-700 rounded flex items-center justify-center">
              <span className="text-white text-xs">5</span>
            </div>
            <div className="col-span-1 row-span-1 bg-gray-700 rounded flex items-center justify-center">
              <span className="text-white text-xs">6</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 bg-gray-50 min-h-screen">
      {/* Cabecera con título y descripción */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {t("promotionScreens.title")}
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-base text-gray-500 sm:text-lg">
            {t("promotionScreens.description")}
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
              onClick={() => {
                if (hasUnsavedChanges) {
                  Swal.fire({
                    title: "Cambios sin guardar",
                    text: "¿Desea guardar los cambios antes de cambiar de pestaña?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Guardar",
                    cancelButtonText: "Descartar",
                  }).then((result) => {
                    if (result.isConfirmed) {
                      guardarInformacionPersonalizacion();
                    }
                    setActiveTab("general");
                    setSelectedPantalla(null);
                    setHasUnsavedChanges(false);
                  });
                } else {
                  setActiveTab("general");
                  setSelectedPantalla(null);
                }
              }}
              className={`flex-1 py-4 px-4 text-center font-medium text-sm sm:text-base ${
                activeTab === "general"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t("promotionScreens.generalConfig")}
            </button>
            <button
              onClick={() => {
                if (hasUnsavedChanges) {
                  Swal.fire({
                    title: "Cambios sin guardar",
                    text: "¿Desea guardar los cambios antes de cambiar de pestaña?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Guardar",
                    cancelButtonText: "Descartar",
                  }).then((result) => {
                    if (result.isConfirmed) {
                      guardarInformacionPersonalizacion();
                    }
                    setActiveTab("screens");
                    setSelectedPantalla(null);
                    setHasUnsavedChanges(false);
                  });
                } else {
                  setActiveTab("screens");
                  setSelectedPantalla(null);
                }
              }}
              className={`flex-1 py-4 px-4 text-center font-medium text-sm sm:text-base ${
                activeTab === "screens"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t("promotionScreens.screens")}
            </button>
            {/* <button
              onClick={() => {
                if (hasUnsavedChanges) {
                  Swal.fire({
                    title: "Cambios sin guardar",
                    text: "¿Desea guardar los cambios antes de cambiar de pestaña?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Guardar",
                    cancelButtonText: "Descartar",
                  }).then((result) => {
                    if (result.isConfirmed) {
                      guardarInformacionPersonalizacion();
                    }
                    setActiveTab("appearance");
                    setHasUnsavedChanges(false);
                  });
                } else {
                  setActiveTab("appearance");
                }
              }}
              className={`flex-1 py-4 px-4 text-center font-medium text-sm sm:text-base ${
                activeTab === "appearance"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t("promotionScreens.appearance")}
            </button> */}
            {selectedPantalla && (
              <button
                onClick={() => setActiveTab("pantalla")}
                className={`flex-1 py-4 px-4 text-center font-medium text-sm sm:text-base ${
                  activeTab === "pantalla"
                    ? "text-blue-600 border-b-2 border-blue-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {selectedPantalla.nombre}
              </button>
            )}
          </div>

          {/* Contenido de las pestañas */}
          <div className="p-6">
            {/* Pestaña de Configuración General */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  {t("promotionScreens.generalConfig")}
                </h2>

                {/* Idioma */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t("promotionScreens.language")}
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
                        {t("promotionScreens.spanish")}
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
                        {t("promotionScreens.english")}
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
                        {t("promotionScreens.spanish/english")}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Ciudad para el clima */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("promotionScreens.weatherCity")}
                  </label>
                  <Select
                    options={cityOptions}
                    value={selectedCity}
                    onChange={handleCityChange}
                    placeholder="Seleccione una ciudad para mostrar el clima"
                    className="w-full"
                    isSearchable
                    isClearable={true}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {t("promotionScreens.weatherCityDescription")}
                  </p>
                </div>
              </div>
            )}

            {/* Pestaña de Pantallas */}
            {activeTab === "screens" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  {t("promotionScreens.screens")}
                </h2>

                <div className="space-y-4">
                  {Array.from({ length: pp }, (_, index) => (
                    <div
                      className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200"
                      key={index}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="text-sm font-medium text-gray-700 mr-2 w-32">
                              {t("promotionScreens.screens")} {index + 1}:
                            </span>
                            <input
                              type="text"
                              placeholder={`Promociones ${index + 1}`}
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
                                setHasUnsavedChanges(true);
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSelectPantalla(index)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            {t("promotionScreens.configure")}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {pp === 0 && (
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                    <p className="text-yellow-600">
                      {t("promotionScreens.noScreens")}
                    </p>
                  </div>
                )}
                {/* Instrucciones generales */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">
                    {t("promotionScreens.instructions.title")}
                  </h3>
                  <p className="text-sm text-blue-700 mb-2">
                    {t("promotionScreens.instructions.description")}
                  </p>
                  <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1 ml-2">
                    <li> {t("promotionScreens.instructions.step1")}</li>
                    <li> {t("promotionScreens.instructions.step2")}</li>
                    <li> {t("promotionScreens.instructions.step3")}</li>
                    <li> {t("promotionScreens.instructions.step4")}</li>
                    <li> {t("promotionScreens.instructions.step5")}</li>
                    <li> {t("promotionScreens.instructions.step6")}</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Pestaña de Apariencia */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  {t("promotionScreens.appearance")}
                </h2>

                {/* Estilo de Texto */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("promotionScreens.textStyle")}
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
                      <p> {t("promotionScreens.exampleText")}</p>
                    </div>
                  </div>

                  {/* Color de Texto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("promotionScreens.textColor")}
                    </label>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleFontColorChange}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {t("promotionScreens.selectColor")}
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
                          {t("promotionScreens.saveColor")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Vista previa */}
                <div className="mt-4 p-4 border rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    {t("promotionScreens.preview")}
                  </h3>
                  <div
                    className="p-4 rounded-md bg-gray-100"
                    style={{
                      fontFamily: selectedFontStyle?.value || "Arial",
                      color: fontColor,
                    }}
                  >
                    <div className="text-lg font-bold">
                      {t("promotionScreens.exampleTitle")}
                    </div>
                    <p className="mt-2">{t("promotionScreens.exampleText")}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Pestaña de Pantalla Específica */}
            {activeTab === "pantalla" && selectedPantalla && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b pb-2">
                  <div className="border-b pb-2">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {t("promotionScreens.configOf")} &quot;
                      {selectedPantalla.nombre}&quot;
                    </h2>
                  </div>
                </div>

                {/* Selección de Template */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("promotionScreens.selectTemplate")}
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                          selectedPantalla.config.templateId === template.id
                            ? "border-blue-500 ring-2 ring-blue-300"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        onClick={() => handleChangeTemplate(template.id)}
                      >
                        <div className="p-3 bg-gray-50 border-b">
                          <div className="text-center font-medium">
                            {template.name}
                          </div>
                          <div className="text-xs text-center text-gray-500">
                            {template.sections}{" "}
                            {t("promotionScreens.sectionCount", {
                              count: template.sections,
                            })}
                          </div>
                        </div>
                        <div className="p-3">
                          {renderTemplatePreview(template.id)}
                        </div>
                        <div className="p-2 bg-gray-50 border-t flex justify-center">
                          <div
                            className={`inline-flex items-center justify-center px-2 py-1 text-xs rounded ${
                              selectedPantalla.config.templateId === template.id
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {selectedPantalla.config.templateId === template.id
                              ? t("promotionScreens.selected")
                              : t("promotionScreens.select")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Administración de Contenido por Sección */}
                <div className="mt-8">
                  <h3 className="text-md font-medium text-gray-800 mb-3">
                    {t("promotionScreens.contentPerSection")}
                  </h3>

                  <div className="space-y-6">
                    {selectedPantalla.config.templateId &&
                      Object.entries(selectedPantalla.config.sections).map(
                        ([sectionId, section]) => (
                          <div
                            key={sectionId}
                            className="border border-gray-200 rounded-lg overflow-hidden"
                          >
                            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                              <h4 className="font-medium text-gray-700">
                                {t("promotionScreens.sectionCount")} {sectionId}
                              </h4>
                              <button
                                onClick={() => handleAddContent(sectionId)}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                {t("promotionScreens.addContent")}
                              </button>
                            </div>

                            <div className="p-4">
                              {section.content && section.content.length > 0 ? (
                                <div className="space-y-3">
                                  {section.content.map((item, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between border border-gray-200 rounded-lg p-3 bg-white"
                                    >
                                      <div className="flex items-center space-x-3">
                                        <div className="h-14 w-14 flex-shrink-0 rounded overflow-hidden border border-gray-200">
                                          {item.type === "video" ? (
                                            <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-8 w-8 text-gray-400"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                              >
                                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                              </svg>
                                            </div>
                                          ) : (
                                            <img
                                              src={item.url}
                                              alt={item.name}
                                              className="h-full w-full object-cover"
                                            />
                                          )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <p className="text-sm font-medium text-gray-900 truncate">
                                            {item.name ||
                                              (item.type === "image"
                                                ? t("promotionScreens.image")
                                                : t("promotionScreens.video"))}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            {item.type === "image"
                                              ? t("promotionScreens.image")
                                              : t(
                                                  "promotionScreens.video"
                                                )}{" "}
                                            •{" "}
                                            {t(
                                              "promotionScreens.durationLabel"
                                            )}
                                            : {item.duration}s
                                            {/* Agregar la lógica de estado basada en fecha */}
                                            {item.date &&
                                              (() => {
                                                const startDate = new Date(
                                                  item.date.startDate
                                                );
                                                const endDate = new Date(
                                                  item.date.endDate
                                                );
                                                let statusKey = "";
                                                let statusClass = "";

                                                if (currentDate < startDate) {
                                                  statusKey =
                                                    item.type === "image"
                                                      ? "promotionScreens.scheduledImage"
                                                      : "promotionScreens.scheduledVideo";
                                                  statusClass =
                                                    "text-amber-500"; // Amarillo para contenido programado
                                                } else if (
                                                  currentDate > endDate
                                                ) {
                                                  statusKey =
                                                    item.type === "image"
                                                      ? "promotionScreens.finishedImage"
                                                      : "promotionScreens.finishedVideo";
                                                  statusClass = "text-red-600"; // Rojo para contenido finalizado
                                                } else {
                                                  statusKey =
                                                    item.type === "image"
                                                      ? "promotionScreens.liveImage"
                                                      : "promotionScreens.liveVideo";
                                                  statusClass =
                                                    "text-green-600"; // Verde para contenido en vivo
                                                }

                                                return (
                                                  <span
                                                    className={`ml-1 font-medium ${statusClass}`}
                                                  >
                                                    {t(statusKey)}
                                                  </span>
                                                );
                                              })()}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            {t("promotionScreens.validity")}:{" "}
                                            {item.date
                                              ? new Date(
                                                  item.date.startDate
                                                ).toLocaleDateString() +
                                                " - " +
                                                new Date(
                                                  item.date.endDate
                                                ).toLocaleDateString()
                                              : t(
                                                  "promotionScreens.notDefined"
                                                )}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center space-x-2">
                                        <button
                                          onClick={() =>
                                            handleMoveContent(
                                              sectionId,
                                              index,
                                              "up"
                                            )
                                          }
                                          disabled={index === 0}
                                          className={`p-1 rounded ${
                                            index === 0
                                              ? "text-gray-300 cursor-not-allowed"
                                              : "text-gray-600 hover:bg-gray-100"
                                          }`}
                                          title="Mover arriba"
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleMoveContent(
                                              sectionId,
                                              index,
                                              "down"
                                            )
                                          }
                                          disabled={
                                            index === section.content.length - 1
                                          }
                                          className={`p-1 rounded ${
                                            index === section.content.length - 1
                                              ? "text-gray-300 cursor-not-allowed"
                                              : "text-gray-600 hover:bg-gray-100"
                                          }`}
                                          title="Mover abajo"
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleEditContent(sectionId, index)
                                          }
                                          className="p-1 rounded text-blue-600 hover:bg-blue-50"
                                          title="Editar contenido"
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                          >
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                          </svg>
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDeleteContent(
                                              sectionId,
                                              index
                                            )
                                          }
                                          className="p-1 rounded text-red-600 hover:bg-red-50"
                                          title="Eliminar contenido"
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
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
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
                                      strokeWidth={1}
                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                                    {t("promotionScreens.noContent")}
                                  </h3>
                                  <p className="mt-1 text-sm text-gray-500">
                                    {t("promotionScreens.addContentToSection")}
                                  </p>
                                  <div className="mt-4">
                                    <button
                                      onClick={() =>
                                        handleAddContent(sectionId)
                                      }
                                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                      <svg
                                        className="-ml-1 mr-2 h-5 w-5"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      {t("promotionScreens.addContent")}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      )}
                  </div>
                </div>
                {/* Botones de acción para la pantalla seleccionada */}
                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setActiveTab("screens");
                      setSelectedPantalla(null);
                      setHasUnsavedChanges(false);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {t("promotionScreens.cancel")}
                  </button>
                  <button
                    onClick={() => {
                      guardarInformacionPersonalizacion().then(() => {
                        setActiveTab("screens");
                        setSelectedPantalla(null);
                        setHasUnsavedChanges(false);
                      });
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {t("promotionScreens.saveVideosImages")}
                  </button>
                </div>
              </div>
            )}

            {/* Botones de acción - Solo mostrar cuando no se está editando una pantalla */}
            {activeTab !== "pantalla" && (
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "¿Está seguro que desea restablecer todos los valores?"
                      )
                    ) {
                      setFontColor("#000000");
                      setSelectedFontStyle(fontStyleOptions[0]);
                      setSelectedCity(null);
                      setHasUnsavedChanges(true);
                    }
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {t("promotionScreens.resetValues")}
                </button>
                <button
                  onClick={handleSaveWithFeedback}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {t("promotionScreens.saveChanges")}
                </button>
              </div>
            )}
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
                  {t("promotionScreens.changesSaved")}
                </p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    onClick={() => setShowSuccessMessage(false)}
                    className="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <span className="sr-only">
                      {" "}
                      {t("promotionScreens.back")}
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

      {/* Modal para agregar/editar contenido */}
      {showContentModal && selectedSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingContent
                  ? t("promotionScreens.editContent")
                  : t("promotionScreens.addContent")}
              </h3>
              <button
                onClick={() => {
                  setShowContentModal(false);
                  setEditingContent(null);
                  setNewContentItem({
                    type: "image",
                    url: "",
                    duration: 10,
                    name: "",
                    date: {
                      startDate: null,
                      endDate: null,
                    },
                  });
                }}
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

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("promotionScreens.contentType")}
                </label>
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="content-type-image"
                      name="content-type"
                      value="image"
                      checked={newContentItem.type === "image"}
                      onChange={() =>
                        setNewContentItem({ ...newContentItem, type: "image" })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label
                      htmlFor="content-type-image"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      {t("promotionScreens.image")}
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="content-type-video"
                      name="content-type"
                      value="video"
                      checked={newContentItem.type === "video"}
                      onChange={() =>
                        setNewContentItem({ ...newContentItem, type: "video" })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label
                      htmlFor="content-type-video"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      {t("promotionScreens.video")}
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("promotionScreens.uploadFile")}
                </label>
                {newContentItem.url ? (
                  <div className="mb-2 p-3 border rounded-md">
                    <div className="flex items-center space-x-3">
                      {newContentItem.type === "image" ? (
                        <img
                          src={newContentItem.url}
                          alt="Preview"
                          className="h-14 w-14 object-cover rounded"
                        />
                      ) : (
                        <div className="h-14 w-14 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium truncate">
                          {newContentItem.name ||
                            (newContentItem.type === "image"
                              ? t("promotionScreens.imageUploaded")
                              : t("promotionScreens.videoUploaded"))}
                        </p>
                        <p className="text-xs text-gray-500">
                          {newContentItem.type === "image" ? "Imagen" : "Video"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1">
                    <label className="w-full flex flex-col justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-gray-400">
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
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload-content"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                            <span> {t("promotionScreens.uploadFile")}</span>
                            <input
                              id="file-upload-content"
                              name="file-upload-content"
                              type="file"
                              className="sr-only"
                              onChange={handleContentFileUpload}
                              accept={
                                newContentItem.type === "image"
                                  ? "image/*"
                                  : "video/*"
                              }
                            />
                          </label>
                          <p className="pl-1">
                            {" "}
                            {t("promotionScreens.dragAndDrop")}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          {newContentItem.type === "image"
                            ? t("promotionScreens.imageFormats")
                            : t("promotionScreens.videoFormats")}
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {/* Indicador de progreso durante la carga */}
                {isUploading && (
                  <div className="mt-2">
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 mb-2 text-xs flex rounded bg-blue-200">
                        <div
                          style={{ width: `${uploadProgress}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                        ></div>
                      </div>
                      <div className="text-xs text-blue-600 text-center">
                        {t("promotionScreens.uploadingContent")}
                        {Math.round(uploadProgress)}%
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="content-name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("promotionScreens.contentName")}
                </label>
                <input
                  type="text"
                  id="content-name"
                  value={newContentItem.name || ""}
                  onChange={(e) =>
                    setNewContentItem({
                      ...newContentItem,
                      name: e.target.value,
                    })
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder={t("promotionScreens.contentNamePlaceholder")}
                />
              </div>

              <div>
                <label
                  htmlFor="content-duration"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("promotionScreens.duration")}
                </label>
                <input
                  type="number"
                  id="content-duration"
                  value={newContentItem.duration}
                  onChange={(e) =>
                    setNewContentItem({
                      ...newContentItem,
                      duration: Math.max(1, parseInt(e.target.value) || 0),
                    })
                  }
                  min="1"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {t("promotionScreens.durationDescription")}
                </p>
              </div>

              {/* Selector de fecha */}
              <div>
                <div className="flex items-center mb-2">
                  <CalendarIcon className="h-4 w-4 text-blue-500 mr-1" />
                  <label
                    htmlFor="date-picker"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("promotionScreens.validityPeriod")}
                  </label>
                </div>
                <Datepicker
                  useRange={true}
                  value={contentDate}
                  onChange={handleDateValueChange}
                  inputClassName="w-full py-2 bg-gray-50 border border-gray-300 text-gray-900 rounded text-base"
                  displayFormat={"DD/MM/YYYY"}
                  placeholder={t("promotionScreens.selectDate")}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {t("promotionScreens.validityDescription")}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowContentModal(false);
                  setEditingContent(null);
                  setNewContentItem({
                    type: "image",
                    url: "",
                    duration: 10,
                    name: "",
                    date: {
                      startDate: null,
                      endDate: null,
                    },
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                {t("promotionScreens.cancel")}
              </button>
              <button
                onClick={handleSaveContent}
                disabled={!newContentItem.url || isUploading}
                className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${
                  !newContentItem.url || isUploading
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {t("promotionScreens.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PantallasPromociones;
