// src/components/EditPantallaServicio.js

import React, { useState, useEffect } from "react";
import Select from "react-select";
import { ChromePicker } from "react-color";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  doc,
  addDoc,
  setDoc,
  getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import PantallaServicio from "./PreviewTemplate";

const firebaseConfig = {
  apiKey: "AIzaSyAiP1248hBEZt3iS2H4UVVjdf_xbuJHD3k",
  authDomain: "upper-8c817.firebaseapp.com",
  projectId: "upper-8c817",
  storageBucket: "upper-8c817.appspot.com",
  messagingSenderId: "798455798906",
  appId: "1:798455798906:web:f58a3e51b42eebb6436fc3",
  measurementId: "G-6VHX927GH1",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const EditPantallaServicio = () => {
  const [fontColor, setFontColor] = useState("#000000");
  const [templateColor, setTemplateColor] = useState("#ffffff");
  const [selectedFontStyle, setSelectedFontStyle] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [screenNames, setScreenNames] = useState([]);
  const [view, setView] = useState("personalization");
  const [showFontColorPicker, setShowFontColorPicker] = useState(false);
  const [showTemplateColorPicker, setShowTemplateColorPicker] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userEmail = user.email;
        const usersRef = collection(db, "usuarios");
        const q = query(usersRef, where("email", "==", userEmail));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data();
          setUserData(userData);
          const pdsCount = userData.pservice;

          const newScreenNames = Array.from({ length: pdsCount }, () => "");
          setScreenNames(newScreenNames);

          const nombresPantallas = userData.NombrePantallasServicios;
          if (nombresPantallas) {
            const nombresPantallasArray = Object.values(nombresPantallas);
            setScreenNames(nombresPantallasArray);
          }

          const templateServiciosRef = collection(db, "TemplateServicios");
          const qEmpresa = query(
            templateServiciosRef,
            where("empresa", "==", userData.empresa)
          );
          const snapshotEmpresa = await getDocs(qEmpresa);
          if (!snapshotEmpresa.empty) {
            const templateData = snapshotEmpresa.docs[0].data();
            setFontColor(templateData.colorLetra);
            setTemplateColor(templateData.colorPlantilla);
            setSelectedFontStyle({
              value: templateData.estilodetexto,
              label: templateData.estilodetexto,
            });
            setSelectedCity({
              value: templateData.ciudad,
              label: templateData.ciudad,
            });
          }
        }
      }
    };

    fetchUserData();
  }, []);

  const guardarConfiguracion = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const templateServiciosRef = collection(db, "TemplateServicios");

        const q = query(
          templateServiciosRef,
          where("empresa", "==", userData.empresa)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const docId = snapshot.docs[0].id;
          await setDoc(doc(templateServiciosRef, docId), {
            colorLetra: fontColor,
            colorPlantilla: templateColor,
            estilodetexto: selectedFontStyle?.value || "",
            ciudad: selectedCity ? selectedCity.label : "",
            empresa: userData.empresa,
          });

          const usersRef = collection(db, "usuarios");
          const userDoc = doc(usersRef, user.uid);
          const pantallaServiciosMap = {};
          screenNames.forEach((name, index) => {
            pantallaServiciosMap[index] = name;
          });
          await setDoc(
            userDoc,
            {
              NombrePantallasServicios: pantallaServiciosMap,
            },
            { merge: true }
          );
        } else {
          await addDoc(templateServiciosRef, {
            colorLetra: fontColor,
            colorPlantilla: templateColor,
            estilodetexto: selectedFontStyle?.value || "",
            ciudad: selectedCity?.value || "",
            empresa: userData.empresa,
          });
        }
      }
    } catch (error) {
      console.error("Error al guardar datos de configuración:", error);
    }
  };

  const fontStyleOptions = [
    { value: "Arial", label: "Arial" },
    { value: "Courier New", label: "Courier New" },
    { value: "Georgia", label: "Georgia" },
    { value: "Times New Roman", label: "Times New Roman" },
    { value: "Verdana", label: "Verdana" },
  ];

  const cityOptions = [
    { value: "new-york", label: "New York" },
    { value: "los-angeles", label: "Los Angeles" },
    { value: "chicago", label: "Chicago" },
    { value: "houston", label: "Houston" },
    { value: "miami", label: "Miami" },
  ];

  const handleFontColorChange = () => {
    setShowFontColorPicker(!showFontColorPicker);
  };

  const handleTemplateColorChange = () => {
    setShowTemplateColorPicker(!showTemplateColorPicker);
  };

  const handleColorChange = (color, setColor) => {
    setColor(color.hex);
  };

  const handleFontStyleChange = (selectedOption) => {
    setSelectedFontStyle(selectedOption);
  };

  const handleCityChange = (selectedOption) => {
    setSelectedCity(selectedOption);
  };

  const handleScreenNameChange = (e, index) => {
    const updatedScreenNames = [...screenNames];
    updatedScreenNames[index] = e.target.value;
    setScreenNames(updatedScreenNames);
  };

  return (
    <div className="pl-10 md:px-32">
      <div className="flex justify-around mt-7">
        <button
          className={`mx-5 px-6 py-2 leading-5 transition-colors duration-200 transform rounded-md ${
            view === "personalization"
              ? "bg-blue-500 text-white"
              : "bg-gray-500 text-white hover:bg-gray-700"
          } focus:outline-none`}
          onClick={() => setView("personalization")}
        >
          Personalización del Template
        </button>
        <button
          className={`mx-5 px-6 py-2 leading-5 transition-colors duration-200 transform rounded-md ${
            view === "preview"
              ? "bg-blue-500 text-white"
              : "bg-gray-500 text-white hover:bg-gray-700"
          } focus:outline-none`}
          onClick={() => setView("preview")}
        >
          Vista Previa del Template
        </button>
      </div>

      {view === "personalization" && (
        <section className="max-w-4xl p-6 mx-auto rounded-md shadow-md bg-gray-800 mt-7 pl-10 md:px-32">
          <h1 className="text-3xl font-bold text-white capitalize mb-4">
            Personalización del Template
          </h1>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                    <div className="absolute z-10 mt-2">
                      <ChromePicker
                        color={fontColor}
                        onChange={(color) =>
                          handleColorChange(color, setFontColor)
                        }
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
              <div>
                <label className="text-white dark:text-gray-200">
                  Color de la plantilla
                </label>
                <div className="flex items-center relative">
                  <button
                    onClick={handleTemplateColorChange}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
                  >
                    Seleccionar Color
                  </button>
                  {showTemplateColorPicker && (
                    <div className="absolute z-10 mt-2">
                      <ChromePicker
                        color={templateColor}
                        onChange={(color) =>
                          handleColorChange(color, setTemplateColor)
                        }
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

            <div className="mb-4">
              <label className="text-white dark:text-gray-200 block mb-0.5">
                Estilo de texto
              </label>
              <Select
                options={fontStyleOptions}
                value={selectedFontStyle}
                onChange={handleFontStyleChange}
              />
            </div>

            <div className="mb-4">
              <label className="text-white dark:text-gray-200">
                Seleccionar Ciudad
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

            <div className="mb-4">
              <label className="text-white dark:text-gray-200 block mb-0.5">
                Nombres de pantallas
              </label>
              <div className="flex flex-col">
                {screenNames.map((name, index) => (
                  <input
                    key={index}
                    type="text"
                    value={name}
                    placeholder={`Pantalla ${index + 1}`}
                    onChange={(e) => handleScreenNameChange(e, index)}
                    className="mb-2 w-full py-2 px-3 border rounded-lg bg-gray-700 text-white"
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={guardarConfiguracion}
              className="mx-5 px-6 py-2 leading-5 text-white transition-colors duration-200 transform bg-pink-500 rounded-md hover:bg-pink-700 focus:outline-none focus:bg-gray-600"
            >
              Guardar
            </button>
          </div>
        </section>
      )}

      {view === "preview" && <PantallaServicio />}
    </div>
  );
};

export default EditPantallaServicio;
