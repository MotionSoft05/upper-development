"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  getDoc,
  addDoc,
} from "firebase/firestore";
import Swal from "sweetalert2";
import { firebaseConfig } from "@/firebase/firebaseConfig";

const MensajesDinamicos = () => {
  const { t } = useTranslation();

  // Estados principales
  const [authUser, setAuthUser] = useState(null);
  const [userCompany, setUserCompany] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Mensajes dinámicos
  const [dynamicMessages, setDynamicMessages] = useState([
    {
      id: "shuttle",
      text: {
        es: "🚐 Shuttle al aeropuerto cada hora - Contacte Concierge",
        en: "🚐 Airport shuttle every hour - Contact Concierge",
      },
      enabled: true,
    },
    {
      id: "checkin",
      text: {
        es: "✈️ Check-in online disponible 24h antes del vuelo",
        en: "✈️ Online check-in available 24h before flight",
      },
      enabled: true,
    },
    {
      id: "baggage",
      text: {
        es: "🧳 Consulte límites de equipaje con su aerolínea",
        en: "🧳 Check baggage limits with your airline",
      },
      enabled: false,
    },
  ]);

  // Firebase initialization
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        setAuthUser(user);
        try {
          const userDoc = await getDoc(doc(db, "usuarios", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserCompany(userData.empresa || "");
            await loadConfig(userData.empresa);
          }
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  const loadConfig = async (empresa) => {
    if (!empresa) return;

    try {
      const templateVuelosRef = collection(db, "TemplateVuelos");
      const templateVuelosQuery = query(
        templateVuelosRef,
        where("empresa", "==", empresa)
      );
      const templateVuelosSnapshot = await getDocs(templateVuelosQuery);

      if (!templateVuelosSnapshot.empty) {
        const templateData = templateVuelosSnapshot.docs[0].data();
        setDynamicMessages(templateData.dynamicMessages || dynamicMessages);
      }
    } catch (error) {
      console.error("Error loading dynamic messages config:", error);
    }
  };

  const handleSaveConfig = async () => {
    if (!authUser || !userCompany) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo obtener la información del usuario",
      });
      return false;
    }

    try {
      const templateVuelosRef = collection(db, "TemplateVuelos");
      const templateVuelosQuery = query(
        templateVuelosRef,
        where("empresa", "==", userCompany)
      );
      const templateVuelosSnapshot = await getDocs(templateVuelosQuery);

      if (!templateVuelosSnapshot.empty) {
        // Actualizar documento existente - solo actualizar dynamicMessages
        const templateVuelosDocRef = templateVuelosSnapshot.docs[0].ref;
        await updateDoc(templateVuelosDocRef, {
          dynamicMessages: dynamicMessages,
          updatedAt: serverTimestamp(),
          updatedBy: authUser.email || ""
        });
      } else {
        // Crear nuevo documento con la estructura completa
        const templateData = {
          empresa: userCompany,
          dynamicMessages: dynamicMessages,
          updatedAt: serverTimestamp(),
          updatedBy: authUser.email || ""
        };
        await addDoc(templateVuelosRef, templateData);
      }

      Swal.fire({
        icon: "success",
        title: "Configuración guardada con éxito",
        showConfirmButton: false,
        timer: 2000,
      });

      setHasUnsavedChanges(false);
      return true;

    } catch (error) {
      console.error("Error al guardar configuración:", error);
      Swal.fire({
        icon: "error",
        title: "Error al guardar la configuración",
        text: error.message,
      });
      return false;
    }
  };

  const addDynamicMessage = () => {
    const newMessage = {
      id: `msg_${Date.now()}`,
      text: { es: "", en: "" },
      enabled: true,
    };
    setDynamicMessages([...dynamicMessages, newMessage]);
    setHasUnsavedChanges(true);
  };

  const removeDynamicMessage = (messageId) => {
    setDynamicMessages(dynamicMessages.filter((msg) => msg.id !== messageId));
    setHasUnsavedChanges(true);
  };

  const updateDynamicMessage = (messageId, field, value) => {
    setDynamicMessages(
      dynamicMessages.map((msg) =>
        msg.id === messageId ? { ...msg, [field]: value } : msg
      )
    );
    setHasUnsavedChanges(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t("dynamicMessages.title")}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {t("dynamicMessages.description")}
              </p>
              {userCompany && (
                <p className="text-xs text-blue-600 mt-1">
                  {t("dynamicMessages.company")}: {userCompany}
                </p>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleSaveConfig}
                disabled={!hasUnsavedChanges}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  hasUnsavedChanges
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {t("dynamicMessages.saveChanges")}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-lg font-semibold text-gray-900">
                {t("dynamicMessages.messageConfiguration")}
              </h2>
              <button
                onClick={addDynamicMessage}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                {t("dynamicMessages.addMessage")}
              </button>
            </div>

            {dynamicMessages.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">
                  {t("dynamicMessages.noMessages")}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {dynamicMessages.map((message, index) => (
                  <div key={message.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-md font-medium text-gray-900">
                        {t("dynamicMessages.message")} {index + 1}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={message.enabled}
                            onChange={(e) =>
                              updateDynamicMessage(
                                message.id,
                                "enabled",
                                e.target.checked
                              )
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {t("dynamicMessages.enabled")}
                          </span>
                        </label>
                        <button
                          onClick={() => removeDynamicMessage(message.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          {t("dynamicMessages.delete")}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("dynamicMessages.textSpanish")}
                        </label>
                        <textarea
                          value={message.text.es}
                          onChange={(e) =>
                            updateDynamicMessage(message.id, "text", {
                              ...message.text,
                              es: e.target.value,
                            })
                          }
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          rows={2}
                          placeholder={t("dynamicMessages.spanishPlaceholder")}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("dynamicMessages.textEnglish")}
                        </label>
                        <textarea
                          value={message.text.en}
                          onChange={(e) =>
                            updateDynamicMessage(message.id, "text", {
                              ...message.text,
                              en: e.target.value,
                            })
                          }
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          rows={2}
                          placeholder={t("dynamicMessages.englishPlaceholder")}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer con indicador de cambios */}
        {hasUnsavedChanges && (
          <div className="px-6 py-3 bg-yellow-50 border-t border-yellow-200">
            <p className="text-sm text-yellow-800">
              {t("dynamicMessages.unsavedChanges")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MensajesDinamicos;