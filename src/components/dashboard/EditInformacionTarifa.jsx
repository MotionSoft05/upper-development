// components/dashboard/EditInformacionTarifa.jsx

import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Swal from "sweetalert2";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { useTranslation } from "react-i18next";

// Modifica esta línea de importación en la parte superior
import {
  getFirestore,
  collection,
  query,
  where,
  updateDoc,
  doc,
  getDocs,
  getDoc, // Añadir getDoc aquí
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const db = getFirestore();

function EditInformacionTarifa() {
  const { t } = useTranslation(); // Añadir esta línea
  const [empresas, setEmpresas] = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");
  const [nombreEmpresa, setNombreEmpresa] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Estado para almacenar el ID del documento de tarifario actual (si existe)
  const [tarifarioActualId, setTarifarioActualId] = useState(null);

  // Estados específicos para la información de tarifas
  const [tarifas, setTarifas] = useState([
    { id: uuidv4(), tipo: "", precio: "" },
  ]);

  // Mostrar USD o EUR
  const [mostrarUSD, setMostrarUSD] = useState(true);
  const [monedasActivas, setMonedasActivas] = useState({
    usd: true,
    eur: false,
  });

  // Nuevos estados para leyendas
  const [leyendaTarifas, setLeyendaTarifas] = useState("");
  const [leyendaExtras, setLeyendaExtras] = useState("");
  const [tituloCambio, setTituloCambio] = useState("");

  // Estados para horarios de check-in/out
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const [gerente, setGerente] = useState({ nombre: "" });
  const [tipoCambio, setTipoCambio] = useState({ usd: "", eur: "" });
  const [cambiosRecientes, setCambiosRecientes] = useState([]);
  const [mostrarCambios, setMostrarCambios] = useState(false);
  const usuarioAutorizado =
    firebase.auth().currentUser &&
    [
      "uppermex10@gmail.com",
      "ulises.jacobo@hotmail.com",
      "contacto@upperds.mx",
    ].includes(firebase.auth().currentUser.email);

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

  useEffect(() => {
    const cargarDatosTarifario = async () => {
      try {
        const authUser = firebase.auth().currentUser;

        if (authUser) {
          // Obtener la empresa correcta
          let empresa = empresaSeleccionada;

          if (!empresa) {
            const usuariosRef = collection(db, "usuarios");
            const usuariosQuery = query(
              usuariosRef,
              where("email", "==", authUser.email)
            );
            const usuariosSnapshot = await getDocs(usuariosQuery);

            if (!usuariosSnapshot.empty) {
              empresa = usuariosSnapshot.docs[0].data().empresa || "";
              setNombreEmpresa(usuariosSnapshot.docs[0].data());
            }
          }

          // MODIFICADO: Primero buscar en la nueva colección Tarifarios
          const tarifarioRef = collection(db, "Tarifarios");
          const tarifarioQuery = query(
            tarifarioRef,
            where("empresa", "==", empresa)
          );
          const tarifarioSnapshot = await getDocs(tarifarioQuery);

          if (!tarifarioSnapshot.empty) {
            // Si existe un documento en Tarifarios, cargamos sus datos
            const docData = tarifarioSnapshot.docs[0].data();
            const docId = tarifarioSnapshot.docs[0].id;

            // Guardar el ID del documento para usarlo al actualizar
            setTarifarioActualId(docId);

            // Cargar datos
            if (docData.tarifas && docData.tarifas.length > 0) {
              setTarifas(docData.tarifas);
            }
            if (docData.tituloCambio) setTituloCambio(docData.tituloCambio);
            if (docData.gerente) setGerente(docData.gerente);
            if (docData.tipoCambio) setTipoCambio(docData.tipoCambio);

            // Actualizar correctamente el estado de las monedas activas
            if (docData.monedaActiva) {
              const newMonedasActivas = {
                usd:
                  docData.monedaActiva === "usd" ||
                  docData.monedaActiva === "ambos",
                eur:
                  docData.monedaActiva === "eur" ||
                  docData.monedaActiva === "ambos",
              };
              setMonedasActivas(newMonedasActivas);
            }

            // Cargar las nuevas propiedades
            if (docData.leyendaTarifas)
              setLeyendaTarifas(docData.leyendaTarifas);
            if (docData.leyendaExtras) setLeyendaExtras(docData.leyendaExtras);
            if (docData.checkIn) setCheckIn(docData.checkIn);
            if (docData.checkOut) setCheckOut(docData.checkOut);
          } else {
            // Si no hay datos en la colección Tarifarios, buscar en TemplateTarifario (para migración)
            const templateTarifarioRef = collection(db, "TemplateTarifario");
            const templateTarifarioQuery = query(
              templateTarifarioRef,
              where("empresa", "==", empresa)
            );
            const templateTarifarioSnapshot = await getDocs(
              templateTarifarioQuery
            );

            if (!templateTarifarioSnapshot.empty) {
              const templateData = templateTarifarioSnapshot.docs[0].data();

              // Cargar datos desde el template antiguo
              if (templateData.tarifas && templateData.tarifas.length > 0) {
                setTarifas(templateData.tarifas);
              }
              if (templateData.gerente) setGerente(templateData.gerente);
              if (templateData.tipoCambio)
                setTipoCambio(templateData.tipoCambio);

              // Actualizar correctamente el estado de las monedas activas
              if (templateData.monedaActiva) {
                const newMonedasActivas = {
                  usd:
                    templateData.monedaActiva === "usd" ||
                    templateData.monedaActiva === "ambos",
                  eur:
                    templateData.monedaActiva === "eur" ||
                    templateData.monedaActiva === "ambos",
                };
                setMonedasActivas(newMonedasActivas);
              }

              // Cargar las nuevas propiedades
              if (templateData.leyendaTarifas)
                setLeyendaTarifas(templateData.leyendaTarifas);
              if (templateData.leyendaExtras)
                setLeyendaExtras(templateData.leyendaExtras);
              if (templateData.checkIn) setCheckIn(templateData.checkIn);
              if (templateData.checkOut) setCheckOut(templateData.checkOut);
            }
          }
        }
      } catch (error) {
        console.error("Error al cargar datos del tarifario:", error);
      }
    };

    cargarDatosTarifario();
  }, [empresaSeleccionada]);
  const registrarCambio = (datosAnteriores, datosNuevos) => {
    const fechaHora = new Date();

    // Función auxiliar para comparar arrays de tarifas
    const compararTarifas = (tarifasAnteriores = [], tarifasNuevas = []) => {
      const cambios = [];

      // Verificar tarifas eliminadas
      if (tarifasAnteriores.length > tarifasNuevas.length) {
        cambios.push(
          `Se eliminaron ${
            tarifasAnteriores.length - tarifasNuevas.length
          } tarifa(s)`
        );
      }

      // Verificar tarifas añadidas
      if (tarifasNuevas.length > tarifasAnteriores.length) {
        cambios.push(
          `Se añadieron ${
            tarifasNuevas.length - tarifasAnteriores.length
          } tarifa(s)`
        );
      }

      // Crear un mapa de tarifas anteriores para fácil referencia
      const mapaTarifasAnteriores = {};
      tarifasAnteriores.forEach((t) => {
        mapaTarifasAnteriores[t.id] = t;
      });

      // Verificar cambios en tarifas existentes
      tarifasNuevas.forEach((tarifaNueva) => {
        const tarifaAnterior = mapaTarifasAnteriores[tarifaNueva.id];

        if (tarifaAnterior) {
          if (tarifaAnterior.tipo !== tarifaNueva.tipo) {
            cambios.push(
              `Tarifa '${tarifaAnterior.tipo}' renombrada a '${tarifaNueva.tipo}'`
            );
          }

          if (tarifaAnterior.precio !== tarifaNueva.precio) {
            cambios.push(
              `Precio de ${tarifaNueva.tipo} cambió de ${
                tarifaAnterior.precio || "vacío"
              } a ${tarifaNueva.precio || "vacío"}`
            );
          }
        } else {
          // Es una tarifa nueva que no existía antes (sin ID coincidente)
          cambios.push(
            `Nueva tarifa: ${tarifaNueva.tipo} - ${
              tarifaNueva.precio || "sin precio"
            }`
          );
        }
      });

      return cambios;
    };

    // Identificar todos los cambios realizados
    const cambiosDetectados = [];

    // Comprobar cambios en tarifas (si existen datos anteriores)
    if (datosAnteriores && datosAnteriores.tarifas) {
      const cambiosTarifas = compararTarifas(
        datosAnteriores.tarifas,
        datosNuevos.tarifas
      );
      cambiosDetectados.push(...cambiosTarifas);
    } else if (datosNuevos.tarifas.length > 0) {
      // Primera creación
      cambiosDetectados.push(
        `Se crearon ${datosNuevos.tarifas.length} tarifa(s) iniciales`
      );
    }

    // Comprobar cambio en nombre de gerente
    // Corregido para verificar correctamente si el nombre del gerente ha cambiado
    if (
      !datosAnteriores ||
      !datosAnteriores.gerente ||
      (datosAnteriores.gerente?.nombre !== datosNuevos.gerente.nombre &&
        (datosAnteriores.gerente?.nombre || datosNuevos.gerente.nombre))
    ) {
      cambiosDetectados.push(
        `Gerente cambió de '${
          datosAnteriores?.gerente?.nombre || "vacío"
        }' a '${datosNuevos.gerente.nombre || "vacío"}'`
      );
    }

    // Comprobar cambios en título del tipo de cambio
    if (
      !datosAnteriores ||
      (datosAnteriores.tituloCambio !== datosNuevos.tituloCambio &&
        (datosAnteriores.tituloCambio || datosNuevos.tituloCambio))
    ) {
      cambiosDetectados.push(
        `Título de tipo de cambio cambió de '${
          datosAnteriores?.tituloCambio || "vacío"
        }' a '${datosNuevos.tituloCambio || "vacío"}'`
      );
    }

    // Comprobar cambios en tipo de cambio USD
    if (
      (datosNuevos.monedaActiva === "usd" ||
        datosNuevos.monedaActiva === "ambos") &&
      (!datosAnteriores ||
        !datosAnteriores.tipoCambio ||
        datosAnteriores.tipoCambio?.usd !== datosNuevos.tipoCambio.usd ||
        (datosAnteriores.monedaActiva !== "usd" &&
          datosAnteriores.monedaActiva !== "ambos"))
    ) {
      cambiosDetectados.push(
        `Tipo de cambio USD cambió de ${
          datosAnteriores &&
          (datosAnteriores.monedaActiva === "usd" ||
            datosAnteriores.monedaActiva === "ambos")
            ? datosAnteriores.tipoCambio?.usd || "vacío"
            : "inactivo"
        } a ${datosNuevos.tipoCambio.usd || "vacío"}`
      );
    }

    // Comprobar cambios en tipo de cambio EUR
    if (
      (datosNuevos.monedaActiva === "eur" ||
        datosNuevos.monedaActiva === "ambos") &&
      (!datosAnteriores ||
        !datosAnteriores.tipoCambio ||
        datosAnteriores.tipoCambio?.eur !== datosNuevos.tipoCambio.eur ||
        (datosAnteriores.monedaActiva !== "eur" &&
          datosAnteriores.monedaActiva !== "ambos"))
    ) {
      cambiosDetectados.push(
        `Tipo de cambio EUR cambió de ${
          datosAnteriores &&
          (datosAnteriores.monedaActiva === "eur" ||
            datosAnteriores.monedaActiva === "ambos")
            ? datosAnteriores.tipoCambio?.eur || "vacío"
            : "inactivo"
        } a ${datosNuevos.tipoCambio.eur || "vacío"}`
      );
    }

    // Comprobar cambio de moneda activa
    if (
      datosAnteriores &&
      datosAnteriores.monedaActiva !== datosNuevos.monedaActiva
    ) {
      let monedaAnterior = datosAnteriores.monedaActiva.toUpperCase();
      let monedaNueva = datosNuevos.monedaActiva.toUpperCase();

      // Formatear mejor los valores para el registro
      if (monedaAnterior === "AMBOS") monedaAnterior = "USD y EUR";
      if (monedaNueva === "AMBOS") monedaNueva = "USD y EUR";

      cambiosDetectados.push(
        `Moneda activa cambió de ${monedaAnterior} a ${monedaNueva}`
      );
    }

    // Comprobar cambios en leyendas
    if (
      !datosAnteriores ||
      (datosAnteriores.leyendaTarifas !== datosNuevos.leyendaTarifas &&
        (datosAnteriores.leyendaTarifas || datosNuevos.leyendaTarifas))
    ) {
      cambiosDetectados.push(`Leyenda de tarifas modificada`);
    }

    if (
      !datosAnteriores ||
      (datosAnteriores.leyendaExtras !== datosNuevos.leyendaExtras &&
        (datosAnteriores.leyendaExtras || datosNuevos.leyendaExtras))
    ) {
      cambiosDetectados.push(`Leyenda de extras modificada`);
    }

    // Comprobar cambios en horarios
    if (
      !datosAnteriores ||
      (datosAnteriores.checkIn !== datosNuevos.checkIn &&
        (datosAnteriores.checkIn || datosNuevos.checkIn))
    ) {
      cambiosDetectados.push(
        `Horario de Check-In cambió de '${
          datosAnteriores?.checkIn || "vacío"
        }' a '${datosNuevos.checkIn || "vacío"}'`
      );
    }

    if (
      !datosAnteriores ||
      (datosAnteriores.checkOut !== datosNuevos.checkOut &&
        (datosAnteriores.checkOut || datosNuevos.checkOut))
    ) {
      cambiosDetectados.push(
        `Horario de Check-Out cambió de '${
          datosAnteriores?.checkOut || "vacío"
        }' a '${datosNuevos.checkOut || "vacío"}'`
      );
    }

    // Si no hay cambios detectados pero es una actualización
    if (cambiosDetectados.length === 0 && datosAnteriores) {
      cambiosDetectados.push("Se guardó sin cambios");
    }

    // Crear el objeto de cambio para el registro
    const cambio = {
      id: Date.now(),
      fecha: format(fechaHora, "dd/MM/yyyy", { locale: es }),
      hora: format(fechaHora, "HH:mm:ss", { locale: es }),
      tipoAccion: datosAnteriores ? "Actualización" : "Creación inicial",
      detalles: cambiosDetectados,
      usuario: firebase.auth().currentUser?.email || "Usuario desconocido",
    };

    // Guardar en estado local (últimos 20 cambios como máximo)
    setCambiosRecientes((prevCambios) => {
      const nuevosCambios = [cambio, ...prevCambios].slice(0, 20);

      // Guardar en localStorage para persistencia
      try {
        localStorage.setItem(
          "tarifariosCambiosRecientes",
          JSON.stringify(nuevosCambios)
        );
      } catch (error) {
        console.warn("No se pudo guardar el historial en localStorage", error);
      }

      return nuevosCambios;
    });

    // Opcional: también guardar en Firestore para historial compartido
    try {
      const historialRef = collection(db, "HistorialCambios");
      addDoc(historialRef, {
        ...cambio,
        empresa: empresaSeleccionada || nombreEmpresa?.empresa,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.warn("Error al guardar historial en Firestore", error);
    }

    return cambio;
  };

  // Cargar historial al inicio
  useEffect(() => {
    // Recuperar del localStorage
    try {
      const historialGuardado = localStorage.getItem(
        "tarifariosCambiosRecientes"
      );
      if (historialGuardado) {
        setCambiosRecientes(JSON.parse(historialGuardado));
      }
    } catch (error) {
      console.warn("Error al cargar historial del localStorage", error);
    }
  }, []);
  // Manejo de tarifas
  const handleAddTarifa = () => {
    // Verificar si ya se alcanzó el límite de 10 tarifas
    if (tarifas.length >= 10) {
      // Mostrar una alerta utilizando SweetAlert2
      Swal.fire({
        icon: "info",
        title: "Límite alcanzado",
        text: "Se ha alcanzado el límite máximo de 10 tarifas.",
      });
      return; // No añadir más tarifas
    }

    // Si no hemos alcanzado el límite, añadir una nueva tarifa
    const nuevaTarifa = { id: uuidv4(), tipo: "", precio: "" };
    setTarifas([...tarifas, nuevaTarifa]);
  };

  const handleRemoveTarifa = (id) => {
    setTarifas(tarifas.filter((tarifa) => tarifa.id !== id));
  };

  const handleTarifaChange = (id, field, value) => {
    setTarifas(
      tarifas.map((tarifa) => {
        if (tarifa.id === id) {
          return {
            ...tarifa,
            [field]: value,
          };
        }
        return tarifa;
      })
    );
  };

  // Manejo de datos de gerente y tipo de cambio
  const handleGerenteChange = (e) => {
    setGerente({
      ...gerente,
      nombre: e.target.value,
    });
  };

  const handleTipoCambioChange = (e) => {
    const { name, value } = e.target;
    setTipoCambio({
      ...tipoCambio,
      [name]: value,
    });
  };

  const toggleMoneda = (moneda) => {
    setMonedasActivas((prev) => {
      // Evitar que se desactiven ambas monedas
      if (moneda === "usd" && !prev.eur && prev.usd) return prev;
      if (moneda === "eur" && !prev.usd && prev.eur) return prev;

      return {
        ...prev,
        [moneda]: !prev[moneda],
      };
    });
  };

  const guardarInformacionTarifa = async () => {
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

      // Validar que los títulos no estén vacíos
      const tarifasInvalidas = tarifas.some((tarifa) => !tarifa.tipo.trim());
      if (tarifasInvalidas) {
        Swal.fire({
          icon: "error",
          title: "Títulos incompletos",
          text: "Todos los títulos de tarifa deben tener un valor.",
        });
        return;
      }

      // Obtener la empresa a actualizar
      let empresaToUpdate = empresaSeleccionada;

      if (!empresaToUpdate) {
        // Si no hay empresa seleccionada, obtener la empresa del usuario
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

      // Guardar los datos anteriores para el registro de cambios
      let datosAnteriores = {};
      if (tarifarioActualId) {
        try {
          const tarifarioAnteriorRef = doc(db, "Tarifarios", tarifarioActualId);
          const tarifarioAnteriorSnap = await getDoc(tarifarioAnteriorRef);
          if (tarifarioAnteriorSnap.exists()) {
            datosAnteriores = tarifarioAnteriorSnap.data();
          }
        } catch (e) {
          console.warn("No se pudieron obtener datos anteriores:", e);
        }
      }

      // Mostrar Swal de espera
      Swal.fire({
        title: "Guardando...",
        text: "Por favor espere mientras se guardan los cambios",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Datos básicos a guardar en Tarifarios
      const tarifarioData = {
        empresa: empresaToUpdate,
        tarifas: tarifas,
        gerente: gerente,
        tituloCambio: tituloCambio, // Aquí está correctamente

        // Solo guarda el tipo de cambio de la moneda actualmente visible
        tipoCambio: {
          usd: monedasActivas.usd ? tipoCambio.usd : "",
          eur: monedasActivas.eur ? tipoCambio.eur : "",
        },
        leyendaTarifas: leyendaTarifas,
        leyendaExtras: leyendaExtras,
        checkIn: checkIn,
        checkOut: checkOut,
        ultimaActualizacion: serverTimestamp(),
        // Agregar propiedad para rastrear la moneda activamente configurada
        monedaActiva:
          monedasActivas.usd && monedasActivas.eur
            ? "ambos"
            : monedasActivas.usd
            ? "usd"
            : "eur",
      };

      console.log("Guardando datos:", tarifarioData);
      console.log(
        "Guardando datos con tituloCambio:",
        tarifarioData.tituloCambio
      );

      // PASO 1: Guardar en Tarifarios
      let tarifarioId;
      try {
        if (tarifarioActualId) {
          // Actualizar documento existente
          console.log(
            "Actualizando documento en Tarifarios:",
            tarifarioActualId
          );
          const tarifarioDocRef = doc(db, "Tarifarios", tarifarioActualId);
          await updateDoc(tarifarioDocRef, tarifarioData);
          tarifarioId = tarifarioActualId;
        } else {
          // Crear nuevo documento
          console.log("Creando nuevo documento en Tarifarios");
          const tarifarioRef = collection(db, "Tarifarios");
          const docRef = await addDoc(tarifarioRef, {
            ...tarifarioData,
            fechaCreacion: serverTimestamp(),
          });
          tarifarioId = docRef.id;
          setTarifarioActualId(tarifarioId); // Guardar el ID para futuras actualizaciones
        }
        console.log("Éxito guardando en Tarifarios, ID:", tarifarioId);
      } catch (error) {
        console.error("Error guardando en Tarifarios:", error);
        Swal.fire({
          icon: "error",
          title: "Error al guardar en Tarifarios",
          text: error.message,
        });
        return;
      }

      // PASO 2: Actualizar TemplateTarifario
      try {
        const templateData = {
          tarifarioId: tarifarioId, // Referencia al documento en Tarifarios
          empresa: empresaToUpdate,
          tarifas: tarifas,
          gerente: gerente,
          tituloCambio: tituloCambio, // Aquí está correctamente
          // Actualizar para guardar solo la moneda activa igual que en tarifarioData
          tipoCambio: {
            usd: monedasActivas.usd ? tipoCambio.usd : "",
            eur: monedasActivas.eur ? tipoCambio.eur : "",
          },
          monedaActiva:
            monedasActivas.usd && monedasActivas.eur
              ? "ambos"
              : monedasActivas.usd
              ? "usd"
              : "eur",
          leyendaTarifas: leyendaTarifas,
          leyendaExtras: leyendaExtras,
          checkIn: checkIn,
          checkOut: checkOut,
          templateColor: "#444444",
          fontColor: "#333333",
          fontStyle: "Arial, sans-serif",
          ultimaActualizacion: serverTimestamp(),
        };

        const templateTarifarioRef = collection(db, "TemplateTarifario");
        const templateTarifarioQuery = query(
          templateTarifarioRef,
          where("empresa", "==", empresaToUpdate)
        );
        const templateTarifarioSnapshot = await getDocs(templateTarifarioQuery);

        if (!templateTarifarioSnapshot.empty) {
          const templateTarifarioDocRef = templateTarifarioSnapshot.docs[0].ref;
          console.log(
            "Actualizando TemplateTarifario:",
            templateTarifarioDocRef.id
          );
          await updateDoc(templateTarifarioDocRef, templateData);
        } else {
          // Si no hay documento, crear uno básico
          console.log("Creando nuevo TemplateTarifario");
          await addDoc(templateTarifarioRef, {
            ...templateData,
            template: 1,
            orientacion: "vertical",
            timestamp: serverTimestamp(),
          });
        }
        console.log("Éxito guardando en TemplateTarifario");
      } catch (error) {
        console.error("Error guardando en TemplateTarifario:", error);
        // Continuar aunque haya error, ya tenemos los datos en Tarifarios
      }

      // PASO 3: Actualizar pantallasTarifario
      try {
        // Actualizar todas las pantallas de tarifario existentes para añadir la referencia
        const pantallasTarifarioRef = collection(db, "pantallasTarifario");
        const pantallasTarifarioQuery = query(
          pantallasTarifarioRef,
          where("empresa", "==", empresaToUpdate)
        );
        const pantallasTarifarioSnapshot = await getDocs(
          pantallasTarifarioQuery
        );

        if (!pantallasTarifarioSnapshot.empty) {
          console.log(
            `Actualizando ${pantallasTarifarioSnapshot.docs.length} documentos en pantallasTarifario`
          );
          const updatePromises = [];

          pantallasTarifarioSnapshot.forEach((doc) => {
            console.log("Actualizando pantalla:", doc.id);
            updatePromises.push(
              updateDoc(doc.ref, {
                tarifarioId: tarifarioId, // Referencia al documento en Tarifarios
                // Mantener datos completos para compatibilidad
                tarifas: tarifas,
                gerente: gerente,
                tituloCambio: tituloCambio, // Aquí está correctamente
                // Actualizar para guardar solo la moneda activa
                tipoCambio: {
                  usd: monedasActivas.usd ? tipoCambio.usd : "",
                  eur: monedasActivas.eur ? tipoCambio.eur : "",
                },
                monedaActiva:
                  monedasActivas.usd && monedasActivas.eur
                    ? "ambos"
                    : monedasActivas.usd
                    ? "usd"
                    : "eur",
                leyendaTarifas: leyendaTarifas,
                leyendaExtras: leyendaExtras,
                checkIn: checkIn,
                checkOut: checkOut,
                ultimaActualizacion: serverTimestamp(),
              })
            );
          });

          await Promise.all(updatePromises);
        } else {
          // Si no hay pantallas existentes, crear una nueva
          console.log("Creando nueva pantalla en pantallasTarifario");
          await addDoc(pantallasTarifarioRef, {
            empresa: empresaToUpdate,
            tarifarioId: tarifarioId, // Referencia al documento en Tarifarios
            // Mantener datos completos para compatibilidad
            tarifas: tarifas,
            gerente: gerente,
            tituloCambio: tituloCambio, // Aquí está correctamente
            // Actualizar para guardar solo la moneda activa
            tipoCambio: {
              usd: monedasActivas.usd ? tipoCambio.usd : "",
              eur: monedasActivas.eur ? tipoCambio.eur : "",
            },
            monedaActiva:
              monedasActivas.usd && monedasActivas.eur
                ? "ambos"
                : monedasActivas.usd
                ? "usd"
                : "eur",
            leyendaTarifas: leyendaTarifas,
            leyendaExtras: leyendaExtras,
            checkIn: checkIn,
            checkOut: checkOut,
            template: 1,
            orientacion: "vertical",
            templateColor: "#444444",
            fontColor: "#333333",
            fontStyle: "Arial, sans-serif",
            timestamp: serverTimestamp(),
          });
        }
        console.log("Éxito guardando en pantallasTarifario");
      } catch (error) {
        console.error("Error guardando en pantallasTarifario:", error);
        // Continuar aunque haya error, ya tenemos los datos en Tarifarios y TemplateTarifario
      }

      // PASO 4: Registrar cambios en la colección HistorialCambios
      try {
        // Preparar el registro de cambios
        const cambios = {
          usuario: authUser.email,
          empresa: empresaToUpdate,
          tipo: tarifarioActualId ? "Actualización" : "Creación",
          fecha: new Date(),
          timestamp: serverTimestamp(),
          datosAnteriores: tarifarioActualId
            ? {
                tarifas:
                  datosAnteriores.tarifas?.map((t) => ({
                    id: t.id,
                    tipo: t.tipo,
                    precio: t.precio,
                  })) || [],
                gerente: datosAnteriores.gerente || { nombre: "" }, // CORREGIDO: Mantiene la estructura completa
                monedaActiva: datosAnteriores.monedaActiva || "usd",
                tipoCambio: {
                  usd: datosAnteriores.tipoCambio?.usd || "",
                  eur: datosAnteriores.tipoCambio?.eur || "",
                },
                leyendaTarifas: datosAnteriores.leyendaTarifas || "",
                leyendaExtras: datosAnteriores.leyendaExtras || "",
                checkIn: datosAnteriores.checkIn || "",
                checkOut: datosAnteriores.checkOut || "",
              }
            : null,
          datosNuevos: {
            tarifas: tarifas.map((t) => ({
              id: t.id,
              tipo: t.tipo,
              precio: t.precio,
            })),
            gerente: gerente,
            monedaActiva:
              monedasActivas.usd && monedasActivas.eur
                ? "ambos"
                : monedasActivas.usd
                ? "usd"
                : "eur",
            tipoCambio: {
              usd: monedasActivas.usd ? tipoCambio.usd : "",
              eur: monedasActivas.eur ? tipoCambio.eur : "",
            },
            leyendaTarifas: leyendaTarifas,
            leyendaExtras: leyendaExtras,
            checkIn: checkIn,
            checkOut: checkOut,
          },
        };

        // Guardar en Firestore
        const historialRef = collection(db, "HistorialCambios");
        await addDoc(historialRef, cambios);

        console.log("Cambios registrados en historial:", cambios);

        // También guardar en localStorage para consultarlo más fácilmente
        const historialLocalActual = JSON.parse(
          localStorage.getItem("tarifarioHistorial") || "[]"
        );
        const nuevoHistorial = [
          {
            id: Date.now(),
            ...cambios,
            fecha: new Date().toISOString(), // Convertir a string para JSON
          },
          ...historialLocalActual,
        ].slice(0, 20); // Mantener solo los últimos 20 registros

        localStorage.setItem(
          "tarifarioHistorial",
          JSON.stringify(nuevoHistorial)
        );

        // Registrar cambio para el historial visual de la aplicación
        registrarCambio(cambios.datosAnteriores, cambios.datosNuevos);
      } catch (error) {
        console.error("Error al registrar cambios en historial:", error);
        // Continuar aunque haya error en el registro de cambios
      }

      // Cerrar Swal de espera
      Swal.close();

      // Mostrar mensaje de éxito
      Swal.fire({
        icon: "success",
        title: "Información guardada",
        text: "La información del tarifario ha sido guardada con éxito",
        showConfirmButton: false,
        timer: 2000,
      });

      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error("Error al guardar la información:", error);
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: "Ocurrió un error al guardar la información: " + error.message,
      });
    }
  };

  // El JSX del return se mantiene exactamente igual
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {t("editInformacionTarifa.title")}
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-base text-gray-500 sm:text-lg">
            {t("editInformacionTarifa.description")}
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
                {t("editInformacionTarifa.selectCompany")}:
              </label>
              <div className="w-full sm:w-2/3">
                <select
                  id="empresa"
                  value={empresaSeleccionada}
                  onChange={(e) => setEmpresaSeleccionada(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">{t("sidebar.selectCompany")}</option>
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
          <div className="p-6">
            {/* Información General - MOVIDO AL PRINCIPIO */}
            <div className="space-y-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                {t("editInformacionTarifa.generalInfo")}
              </h2>

              {/* Campo para título personalizado del tipo de cambio */}
              <div className="mb-4">
                <label className="block text-base font-medium text-gray-700 mb-1">
                  {t("editInformacionTarifa.exchangeRateTitle")}
                </label>
                <input
                  type="text"
                  value={tituloCambio}
                  onChange={(e) => setTituloCambio(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded p-2 text-base"
                  placeholder={t(
                    "editInformacionTarifa.exchangeRateTitlePlaceholder"
                  )}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {t("editInformacionTarifa.exchangeRateTitleHelp")}
                </p>
              </div>

              {/* Tipos de cambio */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  {t("editInformacionTarifa.exchangeRate")}
                </label>

                <div className="grid grid-cols-2 gap-4">
                  {/* Input para USD */}
                  <div className="relative">
                    <div className="flex items-center mb-1">
                      <input
                        type="checkbox"
                        id="usd-checkbox"
                        checked={monedasActivas.usd}
                        onChange={() => toggleMoneda("usd")}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="usd-checkbox"
                        className="ml-2 block text-sm font-medium text-gray-700"
                      >
                        USD ($)
                      </label>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="text"
                        name="usd"
                        value={tipoCambio.usd}
                        disabled={!monedasActivas.usd}
                        onChange={handleTipoCambioChange}
                        className={`w-full bg-gray-50 border ${
                          monedasActivas.usd
                            ? "border-blue-500 ring-2 ring-blue-200"
                            : "border-gray-300"
                        } text-gray-900 rounded p-2 text-base pl-7`}
                        placeholder="Ej: 18.50"
                      />
                    </div>
                  </div>

                  {/* Input para EUR */}
                  <div className="relative">
                    <div className="flex items-center mb-1">
                      <input
                        type="checkbox"
                        id="eur-checkbox"
                        checked={monedasActivas.eur}
                        onChange={() => toggleMoneda("eur")}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="eur-checkbox"
                        className="ml-2 block text-sm font-medium text-gray-700"
                      >
                        EUR (€)
                      </label>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">€</span>
                      </div>
                      <input
                        type="text"
                        name="eur"
                        value={tipoCambio.eur}
                        disabled={!monedasActivas.eur}
                        onChange={handleTipoCambioChange}
                        className={`w-full bg-gray-50 border ${
                          monedasActivas.eur
                            ? "border-blue-500 ring-2 ring-blue-200"
                            : "border-gray-300"
                        } text-gray-900 rounded p-2 text-base pl-7`}
                        placeholder="Ej: 19.80"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-base font-medium text-gray-700 mb-1">
                  {t("editInformacionTarifa.manager")}
                </label>
                <input
                  type="text"
                  value={gerente.nombre}
                  onChange={handleGerenteChange}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded p-2 text-base"
                  placeholder={t(
                    "editInformacionTarifa.managerNamePlaceholder"
                  )}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {t("editInformacionTarifa.managerNameHelp")}
                </p>
              </div>
            </div>

            {/* Tarifas */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                {t("editInformacionTarifa.roomRates")}
              </h2>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      {t("editInformacionTarifa.rateConfig")}
                    </p>
                    <p className="text-xs text-gray-400">
                      {tarifas.length}/10 {t("editInformacionTarifa.maxRates")}
                    </p>
                  </div>
                  <button
                    onClick={handleAddTarifa}
                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md ${
                      tarifas.length >= 10
                        ? "text-gray-400 bg-gray-200"
                        : "text-white bg-blue-600 hover:bg-blue-700"
                    }`}
                    disabled={tarifas.length >= 10}
                  >
                    {t("editInformacionTarifa.addItem")}
                  </button>
                </div>

                <div className="space-y-3">
                  {tarifas.length === 0 ? (
                    <div className="text-center p-4 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-500">
                        {t("editInformacionTarifa.noItems")}
                      </p>
                    </div>
                  ) : (
                    tarifas.map((tarifa) => (
                      <div
                        key={tarifa.id}
                        className="flex items-center space-x-4 bg-gray-50 p-3 rounded-md"
                      >
                        <div className="flex-grow">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-base font-medium text-gray-700 mb-1">
                                {t("editInformacionTarifa.title")}
                              </label>
                              <input
                                type="text"
                                value={tarifa.tipo}
                                onChange={(e) =>
                                  handleTarifaChange(
                                    tarifa.id,
                                    "tipo",
                                    e.target.value
                                  )
                                }
                                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded p-2 text-base"
                                placeholder={t(
                                  "editInformacionTarifa.titlePlaceholder"
                                )}
                              />
                            </div>
                            <div>
                              <label className="block text-base font-medium text-gray-700 mb-1">
                                {t("editInformacionTarifa.price")}
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <span className="text-gray-500 sm:text-sm">
                                    $
                                  </span>
                                </div>
                                <input
                                  type="text"
                                  value={tarifa.precio}
                                  onChange={(e) =>
                                    handleTarifaChange(
                                      tarifa.id,
                                      "precio",
                                      e.target.value
                                    )
                                  }
                                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded p-2 text-base pl-7"
                                  placeholder={t(
                                    "editInformacionTarifa.pricePlaceholder"
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveTarifa(tarifa.id)}
                          className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-100 text-red-500 hover:bg-red-200"
                        >
                          <svg
                            className="h-4 w-4"
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
                    ))
                  )}
                </div>
              </div>

              {/* Leyenda 1 - sección tarifas */}
              <div className="mt-4">
                <label className="block text-base font-medium text-gray-700 mb-1">
                  {t("editInformacionTarifa.legend1")}
                </label>
                <textarea
                  value={leyendaTarifas}
                  onChange={(e) => setLeyendaTarifas(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded p-2 text-base"
                  placeholder={t("editInformacionTarifa.legend1Placeholder")}
                  rows="2"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {t("editInformacionTarifa.legend1Help")}
                </p>
              </div>
            </div>

            {/* Horarios y Leyenda 2 */}
            <div className="mt-8 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                {t("editInformacionTarifa.schedules")}
              </h2>

              {/* CHECK IN-OUT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">
                    {t("editInformacionTarifa.checkInTime")}
                  </label>
                  <input
                    type="text"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded p-2 text-base"
                    placeholder={t(
                      "editInformacionTarifa.checkInTimePlaceholder"
                    )}
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">
                    {t("editInformacionTarifa.checkOutTime")}
                  </label>
                  <input
                    type="text"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded p-2 text-base"
                    placeholder={t(
                      "editInformacionTarifa.checkOutTimePlaceholder"
                    )}
                  />
                </div>
              </div>

              {/* Leyenda 2 - sección extras */}
              <div className="mt-4">
                <label className="block text-base font-medium text-gray-700 mb-1">
                  {t("editInformacionTarifa.legend2")}
                </label>
                <textarea
                  value={leyendaExtras}
                  onChange={(e) => setLeyendaExtras(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded p-2 text-base"
                  placeholder={t("editInformacionTarifa.legend2Placeholder")}
                  rows="3"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {t("editInformacionTarifa.legend2Help")}
                </p>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={() => {
                // Reiniciar a valores por defecto
                if (window.confirm(t("editInformacionTarifa.confirmReset"))) {
                  setTarifas([{ id: uuidv4(), tipo: "", precio: "" }]);
                  setGerente({ nombre: "" });
                  setTipoCambio({ usd: "", eur: "" });
                  setLeyendaTarifas("");
                  setLeyendaExtras("");
                  setCheckIn("");
                  setCheckOut("");
                }
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {t("editInformacionTarifa.reset")}
            </button>

            <button
              onClick={guardarInformacionTarifa}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t("editInformacionTarifa.save")}
            </button>
          </div>
        </div>
        {/* Botón flotante para mostrar cambios recientes */}
        <div className="fixed bottom-4 right-4 z-30">
          <button
            onClick={() => setMostrarCambios(!mostrarCambios)}
            className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title={t("editInformacionTarifa.recentChanges")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>

        {/* Modal de cambios recientes */}
        {mostrarCambios && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t("editInformacionTarifa.recentChanges")}
                </h3>
                <button
                  onClick={() => setMostrarCambios(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
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

              <div className="p-4 overflow-y-auto max-h-[calc(80vh-8rem)]">
                {cambiosRecientes.length === 0 ? (
                  <p className="text-gray-500 italic text-center py-4">
                    {t("editInformacionTarifa.noChanges")}
                  </p>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t("editInformacionTarifa.dateTime")}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t("editInformacionTarifa.user")}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t("editInformacionTarifa.action")}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t("editInformacionTarifa.details")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cambiosRecientes.map((cambio) => (
                        <tr key={cambio.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {cambio.fecha} {cambio.hora}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {cambio.usuario}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {cambio.tipoAccion}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <details>
                              <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                                {t("editInformacionTarifa.viewDetails")} (
                                {cambio.detalles.length}{" "}
                                {t("editInformacionTarifa.changes")})
                              </summary>
                              <div className="mt-2 p-3 bg-gray-50 rounded-md text-xs overflow-auto max-h-72">
                                {Array.isArray(cambio.detalles) ? (
                                  <ul className="list-disc pl-4 space-y-1">
                                    {cambio.detalles.map((detalle, idx) => (
                                      <li key={idx}>{detalle}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <pre>
                                    {JSON.stringify(cambio.detalles, null, 2)}
                                  </pre>
                                )}
                              </div>
                            </details>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="p-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setMostrarCambios(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-md"
                >
                  {t("editInformacionTarifa.close")}
                </button>
              </div>
            </div>
          </div>
        )}
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
                  {t("editInformacionTarifa.savedSuccessfully")}
                </p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    onClick={() => setShowSuccessMessage(false)}
                    className="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <span className="sr-only">
                      {t("editInformacionTarifa.close")}
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
    </div>
  );
}
export default EditInformacionTarifa;
