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
  updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import PantallaServicio from "./PreviewTemplate";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";

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
  const { t } = useTranslation();
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

          console.log("pservice count:", pdsCount); // Log the count of pservice

          let newScreenNames = Array.from({ length: pdsCount }, () => "");

          const nombresPantallas = userData.NombrePantallasServicios;
          if (nombresPantallas) {
            const nombresPantallasArray = Object.values(nombresPantallas);
            // Ensure the length of nombresPantallasArray matches pdsCount
            for (let i = 0; i < pdsCount; i++) {
              newScreenNames[i] = nombresPantallasArray[i] || "";
            }
            console.log(
              "Updated number of screen name fields:",
              nombresPantallasArray.length
            ); // Log the updated number of screen name fields
          }

          setScreenNames(newScreenNames);
          console.log("Number of screen name fields:", newScreenNames.length); // Log the number of screen name fields

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
        if (!selectedFontStyle) {
          Swal.fire({
            icon: "error",
            title: t("screenService.fontStyleError"),
          });
          return;
        }
        if (!selectedCity) {
          Swal.fire({
            icon: "error",
            title: t("screenService.cityError"),
          });
          return;
        }
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

          // Usar update() en lugar de setDoc() para sobrescribir solo el campo NombrePantallasServicios
          await updateDoc(userDoc, {
            NombrePantallasServicios: pantallaServiciosMap,
          });
          Swal.fire({
            icon: "success",
            title: t("screenService.customizationSavedSuccess"),
            showConfirmButton: false,
            timer: 2000,
          });
        } else {
          await addDoc(templateServiciosRef, {
            colorLetra: fontColor,
            colorPlantilla: templateColor,
            estilodetexto: selectedFontStyle?.value || "",
            ciudad: selectedCity?.value || "",
            empresa: userData.empresa,
          });
          Swal.fire({
            icon: "success",
            title: t("screenService.customizationSavedSuccess"),
            showConfirmButton: false,
            timer: 2000,
          });
        }
      }
    } catch (error) {
      console.error("Error al guardar datos de configuración:", error);
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
          {/* Personalización general */}
          {t("screenService.generalcustomization")}
        </button>
        <button
          className={`mx-5 px-6 py-2 leading-5 transition-colors duration-200 transform rounded-md ${
            view === "preview"
              ? "bg-blue-500 text-white"
              : "bg-gray-500 text-white hover:bg-gray-700"
          } focus:outline-none`}
          onClick={() => setView("preview")}
        >
          {/* Personalización avanzada */}
          {t("screenService.advancedcustomization")}
        </button>
      </div>

      {view === "personalization" && (
        <section className="max-w-4xl p-6 mx-auto rounded-md shadow-md bg-gray-800 mt-7 pl-10 md:px-32">
          <h1 className="text-3xl font-bold text-white capitalize mb-4">
            {/* Personalización del Template*/}
            {t("screenService.templatecustomization")}
          </h1>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="mb-4">
              <div>
                <label className="text-white dark:text-gray-200">
                  {/* Color de letra*/}
                  {t("screenService.fontColor")}
                </label>
                <div className="flex items-center relative">
                  <button
                    onClick={handleFontColorChange}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
                  >
                    {/* Seleccionar Color*/}
                    {t("screenService.selectColor")}
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
                        {/* Listo*/}
                        {t("screenService.done")}
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
                  {/* Color de la plantilla*/}
                  {t("screenService.templateColor")}
                </label>
                <div className="flex items-center relative">
                  <button
                    onClick={handleTemplateColorChange}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
                  >
                    {/* Seleccionar Color*/}
                    {t("screenService.selectColor")}
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
                        {/* Listo*/}
                        {t("screenService.done")}
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
                {/*Estilo de texto*/}
                {t("screenService.fontStyle")}
              </label>
              <Select
                options={fontStyleOptions}
                value={selectedFontStyle}
                onChange={handleFontStyleChange}
                placeholder={t("screenService.styletext")}
              />
            </div>

            <div className="mb-4">
              <label className="text-white dark:text-gray-200">
                {/*  Seleccionar Ciudad*/}
                {t("screenService.city")}
              </label>
              <Select
                options={cityOptions}
                value={selectedCity}
                onChange={handleCityChange}
                placeholder={t("screenService.selectCity")}
                className="w-full"
                isSearchable
                isClearable={false}
                required
              />
            </div>

            <div className="mb-4">
              <label className="text-white dark:text-gray-200 block mb-0.5">
                {/*  Nombres de pantallas*/}
                {t("screenService.screenName")}
              </label>
              <div className="flex flex-col">
                {screenNames.map((name, index) => (
                  <input
                    key={index}
                    type="text"
                    value={name}
                    placeholder={`${t("screenService.screenName")} ${
                      index + 1
                    }`}
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
              {/*Guardar*/}
              {t("screenService.save")}
            </button>
          </div>
        </section>
      )}

      {view === "preview" && <PantallaServicio />}
    </div>
  );
};

export default EditPantallaServicio;
