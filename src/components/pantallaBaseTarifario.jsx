"use client";
import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  onSnapshot, // Importar onSnapshot para tiempo real
} from "firebase/firestore";
import app from "@/firebase/firebaseConfig";
import PTTemplateManager from "@/components/templates/PTTemplateManager";
import useHeartbeat from "@/hook/useHeartbeat"; // Importamos el hook de heartbeat
import { v4 as uuidv4 } from "uuid"; // Importamos uuid para generar IDs únicos

const db = getFirestore(app);

const PantallaBaseTarifario = ({ id }) => {
  const [pantalla, setPantalla] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [tarifarioData, setTarifarioData] = useState(null);
  const [templateData, setTemplateData] = useState(null);
  const [screenId, setScreenId] = useState(""); // Estado para almacenar el ID único de la pantalla

  useEffect(() => {
    // Obtener la empresa de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const empresaParam = urlParams.get("emp");
    setEmpresa(empresaParam);

    // Generar o recuperar un ID único para esta pantalla
    const storageKey = `pantalla_tarifario_${id}`;
    let storedId =
      typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;

    if (!storedId) {
      // Si no existe, crear uno nuevo y guardarlo
      storedId = `tarifario_${id}_${uuidv4().substring(0, 8)}`;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(storageKey, storedId);
        } catch (e) {
          console.error("Error al guardar screenId:", e);
        }
      }
    }

    setScreenId(storedId);

    // Obtener datos iniciales y configurar suscripciones
    setupDataAndSubscriptions(empresaParam, id);
  }, [id]);

  // Integrar hook de heartbeat
  const heartbeat = useHeartbeat({
    screenId,
    screenType: "tarifario",
    screenNumber: parseInt(id, 10),
    deviceName: pantalla?.nombre || `Tarifario ${id}`,
    userId: "tarifario-user", // Usamos un ID fijo para cumplir con el requisito del hook
    companyName: empresa,
    interval: 60000, // Cada 60 segundos
  });

  // Opcional: Mostrar indicador de conexión para depuración
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Estado de conexión:", heartbeat.isConnected);
      console.log("Último heartbeat:", heartbeat.lastBeat);
      console.log("Información de heartbeat:", {
        screenId,
        screenType: "tarifario",
        screenNumber: parseInt(id, 10),
        deviceName: pantalla?.nombre || `Tarifario ${id}`,
        userId: "tarifario-user",
        companyName: empresa,
        error: heartbeat.error,
        debugInfo: heartbeat.debugInfo,
      });
    }
  }, [
    heartbeat.isConnected,
    heartbeat.lastBeat,
    heartbeat.error,
    heartbeat.debugInfo,
    pantalla,
    id,
    screenId,
    empresa,
  ]);

  // Función para configurar suscripciones y datos iniciales
  const setupDataAndSubscriptions = async (empresaParam, pantallaId) => {
    if (!empresaParam) {
      setError("No se especificó la empresa en la URL");
      setLoading(false);
      return;
    }

    // Mantener un registro de las suscripciones para limpiarlas después
    const unsubscribes = [];

    try {
      // 1. Suscripción a pantallasTarifario para actualizaciones en tiempo real
      const pantallasTarifarioRef = query(
        collection(db, "pantallasTarifario"),
        where("empresa", "==", empresaParam)
      );

      const unsubscribePantallas = onSnapshot(
        pantallasTarifarioRef,
        async (querySnapshot) => {
          console.log(
            `Se encontraron ${querySnapshot.docs.length} pantallas (tiempo real)`
          );

          if (querySnapshot.empty) {
            // Si no hay pantallas, intentar obtener datos del template
            setupTemplateSubscription(empresaParam, unsubscribes);
            return;
          }

          // Convertimos el id a número para comparar
          const idNum = parseInt(pantallaId, 10) - 1; // Restamos 1 porque los arrays empiezan en 0

          let pantallaDoc;
          if (idNum >= 0 && idNum < querySnapshot.docs.length) {
            // Seleccionamos el documento según el índice
            pantallaDoc = querySnapshot.docs[idNum];
          } else {
            // Si el índice no es válido, tomamos el primer documento
            console.log(
              `Índice ${idNum} fuera de rango, usando el primer documento`
            );
            pantallaDoc = querySnapshot.docs[0];
          }

          const pantallaData = pantallaDoc.data();
          console.log("Pantalla actualizada (tiempo real):", pantallaData);

          // Guardar los datos de la pantalla
          const pantallaCompleta = {
            id: pantallaDoc.id,
            ...pantallaData,
          };

          // Si tenemos datos de tarifario, combinarlos
          if (tarifarioData) {
            Object.assign(pantallaCompleta, {
              tarifas: tarifarioData.tarifas || pantallaData.tarifas,
              gerente: tarifarioData.gerente || pantallaData.gerente,
              tipoCambio: tarifarioData.tipoCambio || pantallaData.tipoCambio,
              leyendaTarifas:
                tarifarioData.leyendaTarifas || pantallaData.leyendaTarifas,
              leyendaExtras:
                tarifarioData.leyendaExtras || pantallaData.leyendaExtras,
              checkIn: tarifarioData.checkIn || pantallaData.checkIn,
              checkOut: tarifarioData.checkOut || pantallaData.checkOut,
              monedaActiva:
                tarifarioData.monedaActiva ||
                pantallaData.monedaActiva ||
                "usd",
            });
          }

          setPantalla(pantallaCompleta);

          // Configurar suscripción a Tarifarios si hay un tarifarioId
          if (pantallaData.tarifarioId) {
            setupTarifarioSubscription(pantallaData.tarifarioId, unsubscribes);
          } else {
            // Si no hay referencia específica, buscar por empresa
            setupGenericTarifarioSubscription(empresaParam, unsubscribes);
          }

          setLoading(false);
        },
        (error) => {
          console.error("Error en suscripción a pantallasTarifario:", error);
          setError(`Error en la suscripción: ${error.message}`);
          setLoading(false);
        }
      );

      unsubscribes.push(unsubscribePantallas);
    } catch (error) {
      console.error("Error al configurar suscripciones:", error);
      setError(`Error al configurar suscripciones: ${error.message}`);
      setLoading(false);
    }

    // Retornar una función de limpieza que desactive todas las suscripciones
    return () => {
      console.log("Limpiando suscripciones...");
      unsubscribes.forEach((unsub) => unsub());
    };
  };

  // Configurar suscripción al template si no hay pantallas
  const setupTemplateSubscription = (empresaParam, unsubscribes) => {
    const templateRef = query(
      collection(db, "TemplateTarifario"),
      where("empresa", "==", empresaParam)
    );

    const unsubscribeTemplate = onSnapshot(
      templateRef,
      async (templateSnapshot) => {
        if (templateSnapshot.empty) {
          console.log("No se encontró configuración de template");
          setError("No se encontraron pantallas ni template para esta empresa");
          setLoading(false);
          return;
        }

        const templateDoc = templateSnapshot.docs[0];
        const templateData = templateDoc.data();
        console.log("Template actualizado (tiempo real):", templateData);
        setTemplateData(templateData);

        // Configurar suscripción a Tarifarios si hay un tarifarioId
        if (templateData.tarifarioId) {
          setupTarifarioSubscription(templateData.tarifarioId, unsubscribes);
        } else {
          // Si no hay referencia específica, buscar por empresa
          setupGenericTarifarioSubscription(empresaParam, unsubscribes);
        }

        // Usar template como pantalla si no tenemos datos de pantalla específica
        if (!pantalla) {
          const pantallaData = {
            id: templateDoc.id,
            ...templateData,
          };

          // Si tenemos datos de tarifario, combinarlos
          if (tarifarioData) {
            Object.assign(pantallaData, {
              tarifas: tarifarioData.tarifas || templateData.tarifas,
              gerente: tarifarioData.gerente || templateData.gerente,
              tipoCambio: tarifarioData.tipoCambio || templateData.tipoCambio,
              leyendaTarifas:
                tarifarioData.leyendaTarifas || templateData.leyendaTarifas,
              leyendaExtras:
                tarifarioData.leyendaExtras || templateData.leyendaExtras,
              checkIn: tarifarioData.checkIn || templateData.checkIn,
              checkOut: tarifarioData.checkOut || templateData.checkOut,
              monedaActiva:
                tarifarioData.monedaActiva ||
                templateData.monedaActiva ||
                "usd",
            });
          }

          setPantalla(pantallaData);
        }

        setLoading(false);
      },
      (error) => {
        console.error("Error en suscripción a TemplateTarifario:", error);
        setError(`Error en la suscripción: ${error.message}`);
        setLoading(false);
      }
    );

    unsubscribes.push(unsubscribeTemplate);
  };

  // Configurar suscripción a un documento específico de Tarifarios
  const setupTarifarioSubscription = (tarifarioId, unsubscribes) => {
    const tarifarioRef = doc(db, "Tarifarios", tarifarioId);

    const unsubscribeTarifario = onSnapshot(
      tarifarioRef,
      (docSnapshot) => {
        if (!docSnapshot.exists()) {
          console.log("No se encontró el documento de tarifario");
          return;
        }

        const data = docSnapshot.data();
        console.log("Tarifario actualizado (tiempo real):", data);
        setTarifarioData(data);

        // Actualizar pantalla con los nuevos datos
        if (pantalla) {
          setPantalla((prev) => ({
            ...prev,
            tarifas: data.tarifas || prev.tarifas,
            gerente: data.gerente || prev.gerente,
            tipoCambio: data.tipoCambio || prev.tipoCambio,
            leyendaTarifas: data.leyendaTarifas || prev.leyendaTarifas,
            leyendaExtras: data.leyendaExtras || prev.leyendaExtras,
            checkIn: data.checkIn || prev.checkIn,
            checkOut: data.checkOut || prev.checkOut,
            monedaActiva: data.monedaActiva || prev.monedaActiva || "usd",
          }));
        }
      },
      (error) => {
        console.error("Error en suscripción a Tarifarios:", error);
      }
    );

    unsubscribes.push(unsubscribeTarifario);
  };

  // Configurar suscripción genérica a Tarifarios por empresa
  const setupGenericTarifarioSubscription = (empresaParam, unsubscribes) => {
    const tarifarioQuery = query(
      collection(db, "Tarifarios"),
      where("empresa", "==", empresaParam)
    );

    const unsubscribeTarifarios = onSnapshot(
      tarifarioQuery,
      (querySnapshot) => {
        if (querySnapshot.empty) {
          console.log(
            "No se encontraron documentos en Tarifarios para esta empresa"
          );
          return;
        }

        // Usar el primer documento encontrado
        const docData = querySnapshot.docs[0].data();
        console.log(
          "Tarifarios generales actualizados (tiempo real):",
          docData
        );
        setTarifarioData(docData);

        // Actualizar pantalla con los nuevos datos
        if (pantalla) {
          setPantalla((prev) => ({
            ...prev,
            tarifas: docData.tarifas || prev.tarifas,
            gerente: docData.gerente || prev.gerente,
            tipoCambio: docData.tipoCambio || prev.tipoCambio,
            leyendaTarifas: docData.leyendaTarifas || prev.leyendaTarifas,
            leyendaExtras: docData.leyendaExtras || prev.leyendaExtras,
            checkIn: docData.checkIn || prev.checkIn,
            checkOut: docData.checkOut || prev.checkOut,
            monedaActiva: docData.monedaActiva || prev.monedaActiva || "usd",
          }));
        }
      },
      (error) => {
        console.error("Error en suscripción genérica a Tarifarios:", error);
      }
    );

    unsubscribes.push(unsubscribeTarifarios);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        <p className="ml-4 text-xl">Cargando pantalla de tarifario...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-red-600">
          {error}
          <button
            onClick={() => window.location.reload()}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!pantalla) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-red-600">
          No se encontró la pantalla de tarifario
          <button
            onClick={() => window.location.reload()}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-hidden">
      <PTTemplateManager pantalla={pantalla} />
      {/* Indicador de conexión - solo visible en modo desarrollo */}
      {process.env.NODE_ENV === "development" && (
        <div
          className="fixed bottom-2 right-2 z-50 rounded-full w-4 h-4 border border-gray-300"
          style={{
            backgroundColor: heartbeat.isConnected ? "#10b981" : "#ef4444",
            boxShadow: "0 0 5px rgba(0,0,0,0.3)",
          }}
          title={`Monitoreo: ${
            heartbeat.isConnected ? "Conectado" : "Desconectado"
          }`}
        ></div>
      )}
    </div>
  );
};

export default PantallaBaseTarifario;
