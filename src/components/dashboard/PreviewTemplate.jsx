import React, { useState, useEffect } from "react";
import Select from "react-select";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Datepicker from "react-tailwindcss-datepicker";
import "keen-slider/keen-slider.min.css";
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
const storage = getStorage(app);

const PantallaServicio = () => {
  const [screenNames, setScreenNames] = useState([]);
  const [selectedScreen, setSelectedScreen] = useState(null);
  const [selectedImage, setSelectedImage] = useState("A"); // Agregar selectedImage al estado
  const [empresa, setEmpresa] = useState("");
  const [eventsA, setEventsA] = useState([
    {
      image: null,
      imagePreview: null,
      dateRange: {
        startDate: new Date(),
        endDate: new Date(),
      },
      hours: 0,
      minutes: 0,
      seconds: 10,
    },
  ]);
  const [eventsB, setEventsB] = useState([
    {
      image: null,
      imagePreview: null,
      dateRange: {
        startDate: new Date(),
        endDate: new Date(),
      },
      hours: 0,
      minutes: 0,
      seconds: 10,
    },
  ]);
  const [eventsC, setEventsC] = useState([
    {
      image: null,
      imagePreview: null,
      dateRange: {
        startDate: new Date(),
        endDate: new Date(),
      },
      hours: 0,
      minutes: 0,
      seconds: 10,
    },
  ]);

  useEffect(() => {
    const fetchScreenNames = async () => {
      try {
        const user = auth.currentUser;
        const userEmail = user ? user.email : null;

        if (userEmail) {
          const usersCollection = collection(db, "usuarios");
          const q = query(usersCollection, where("email", "==", userEmail));
          const querySnapshot = await getDocs(q);

          querySnapshot.forEach((doc) => {
            const user = doc.data();
            const nombresPantallas = user.NombrePantallasServicios || [];
            setScreenNames(nombresPantallas);
            setEmpresa(user.empresa);
          });
        }
      } catch (error) {
        console.error("Error al obtener nombres de pantallas:", error);
      }
    };

    fetchScreenNames();
  }, [auth, db]);

  const handleFileChange = (event, index, type) => {
    const file = event.target.files[0];
    const newEvents =
      type === "A" ? [...eventsA] : type === "B" ? [...eventsB] : [...eventsC]; // Selecciona el arreglo adecuado basado en el tipo

    newEvents[index].image = file;

    const reader = new FileReader();
    reader.onload = () => {
      newEvents[index].imagePreview = reader.result;
      // Establece el arreglo adecuado basado en el tipo
      if (type === "A") {
        setEventsA(newEvents);
      } else if (type === "B") {
        setEventsB(newEvents);
      } else {
        setEventsC(newEvents);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEventChange = (index, field, value, type) => {
    const newEvents =
      type === "A" ? [...eventsA] : type === "B" ? [...eventsB] : [...eventsC]; // Selecciona el arreglo adecuado basado en el tipo
    newEvents[index][field] = value;

    // Establece el arreglo adecuado basado en el tipo
    if (type === "A") {
      setEventsA(newEvents);
    } else if (type === "B") {
      setEventsB(newEvents);
    } else {
      setEventsC(newEvents);
    }
  };

  const handleScreenChange = async (selectedOption) => {
    setSelectedScreen(selectedOption);

    try {
      const templatesCollection = collection(db, "TemplateServiciosVista");
      const q = query(
        templatesCollection,
        where("empresa", "==", empresa),
        where("nombreDePantalla", "==", selectedOption.value)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const newEventsA =
            data.eventsA?.map((event) => ({
              image: null,
              imagePreview: event.img1 || null,
              dateRange: {
                startDate: event.fechaInicial.toDate(),
                endDate: event.fechaFinal.toDate(),
              },
              hours: event.tiempoDeVisualizacion.hours || 0,
              minutes: event.tiempoDeVisualizacion.minutes || 0,
              seconds: event.tiempoDeVisualizacion.seconds || 10,
            })) || [];
          const newEventsB =
            data.eventsB?.map((event) => ({
              image: null,
              imagePreview: event.img1 || null,
              dateRange: {
                startDate: event.fechaInicial.toDate(),
                endDate: event.fechaFinal.toDate(),
              },
              hours: event.tiempoDeVisualizacion.hours || 0,
              minutes: event.tiempoDeVisualizacion.minutes || 0,
              seconds: event.tiempoDeVisualizacion.seconds || 10,
            })) || [];
          const newEventsC =
            data.eventsC?.map((event) => ({
              image: null,
              imagePreview: event.img1 || null,
              dateRange: {
                startDate: event.fechaInicial.toDate(),
                endDate: event.fechaFinal.toDate(),
              },
              hours: event.tiempoDeVisualizacion.hours || 0,
              minutes: event.tiempoDeVisualizacion.minutes || 0,
              seconds: event.tiempoDeVisualizacion.seconds || 10,
            })) || [];
          setEventsA(newEventsA);
          setEventsB(newEventsB);
          setEventsC(newEventsC);
        });
      }
    } catch (error) {
      console.error("Error al obtener la configuración de la pantalla:", error);
    }
  };

  const guardarConfiguracion = async () => {
    try {
      if (!selectedScreen) {
        Swal.fire({
          icon: "error",
          title: "Por favor, seleccione una pantalla",
        });
        return;
      }

      // Verifica que se hayan seleccionado fechas para todos los eventos
      for (const event of [...eventsA, ...eventsB, ...eventsC]) {
        if (
          !event.dateRange ||
          !event.dateRange.startDate ||
          !event.dateRange.endDate
        ) {
          Swal.fire({
            icon: "error",
            title: "Por favor, seleccione una fecha para todos los eventos",
          });
          return;
        }
      }

      // Función para subir archivos al almacenamiento
      const uploadFile = async (file, path) => {
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
      };

      // Procesamiento de eventosA
      const newEventsA = await Promise.all(
        eventsA.map(async (event, index) => {
          const urls = {};
          if (event.image) {
            const url = await uploadFile(
              event.image,
              `TemplateServiciosVistaimg/eventA${index + 1}/${event.image.name}`
            );
            urls.img1 = url;
          }

          return {
            ...urls,
            fechaInicial: event.dateRange.startDate.toLocaleString("es-AR", {
              timeZone: "America/Argentina/Buenos_Aires",
            }),
            fechaFinal: event.dateRange.endDate.toLocaleString("es-AR", {
              timeZone: "America/Argentina/Buenos_Aires",
            }),
            tiempoDeVisualizacion: {
              hours: event.hours,
              minutes: event.minutes,
              seconds: event.seconds,
            },
            tipo: "A", // Agregar el campo 'tipo' para el tipo A
          };
        })
      );

      // Procesamiento de eventosB
      const newEventsB = await Promise.all(
        eventsB.map(async (event, index) => {
          const urls = {};
          if (event.image) {
            const url = await uploadFile(
              event.image,
              `TemplateServiciosVistaimg/eventB${index + 1}/${event.image.name}`
            );
            urls.img1 = url;
          }

          return {
            ...urls,
            fechaInicial: event.dateRange.startDate.toLocaleString("es-AR", {
              timeZone: "America/Argentina/Buenos_Aires",
            }),
            fechaFinal: event.dateRange.endDate.toLocaleString("es-AR", {
              timeZone: "America/Argentina/Buenos_Aires",
            }),
            tiempoDeVisualizacion: {
              hours: event.hours,
              minutes: event.minutes,
              seconds: event.seconds,
            },
            tipo: "B", // Agregar el campo 'tipo' para el tipo B
          };
        })
      );

      // Procesamiento de eventosC
      const newEventsC = await Promise.all(
        eventsC.map(async (event, index) => {
          const urls = {};
          if (event.image) {
            const url = await uploadFile(
              event.image,
              `TemplateServiciosVistaimg/eventC${index + 1}/${event.image.name}`
            );
            urls.img1 = url;
          }

          return {
            ...urls,
            fechaInicial: event.dateRange.startDate.toLocaleString("es-AR", {
              timeZone: "America/Argentina/Buenos_Aires",
            }),
            fechaFinal: event.dateRange.endDate.toLocaleString("es-AR", {
              timeZone: "America/Argentina/Buenos_Aires",
            }),
            tiempoDeVisualizacion: {
              hours: event.hours,
              minutes: event.minutes,
              seconds: event.seconds,
            },
            tipo: "C", // Agregar el campo 'tipo' para el tipo C
          };
        })
      );

      // Consulta y actualización de la configuración en la base de datos
      const templatesCollection = collection(db, "TemplateServiciosVista");
      const q = query(
        templatesCollection,
        where("empresa", "==", empresa),
        where("nombreDePantalla", "==", selectedScreen.value)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Si no existe, crear uno nuevo
        await setDoc(doc(templatesCollection), {
          empresa: empresa,
          nombreDePantalla: selectedScreen.value,
          eventsA: newEventsA,
          eventsB: newEventsB,
          eventsC: newEventsC,
        });
      } else {
        // Si existe, actualizar el documento existente
        querySnapshot.forEach(async (docSnapshot) => {
          const docRef = doc(db, "TemplateServiciosVista", docSnapshot.id);
          await setDoc(
            docRef,
            {
              empresa: empresa,
              nombreDePantalla: selectedScreen.value,
              eventsA: newEventsA,
              eventsB: newEventsB,
              eventsC: newEventsC,
            },
            { merge: true }
          );
        });
      }

      // Notificación de éxito
      Swal.fire({
        icon: "success",
        title: "Configuración guardada exitosamente",
        showConfirmButton: false,
        timer: 2000,
      });

      console.log("Configuración guardada correctamente.");
    } catch (error) {
      // Manejo de errores
      console.error("Error al guardar la configuración:", error);
      Swal.fire({
        icon: "error",
        title: "Error al guardar la configuración",
      });
    }
  };

  const addEvent = (type) => {
    if (type === "A" && eventsA.length >= 3) {
      Swal.fire({
        icon: "error",
        title: "No puedes agregar más de 3 imágenes para el tipo A",
      });
      return;
    }

    if (type === "B" && eventsB.length >= 3) {
      Swal.fire({
        icon: "error",
        title: "No puedes agregar más de 3 imágenes para el tipo B",
      });
      return;
    }

    if (type === "C" && eventsC.length >= 3) {
      Swal.fire({
        icon: "error",
        title: "No puedes agregar más de 3 imágenes para el tipo C",
      });
      return;
    }

    const newEvent = {
      image: null,
      imagePreview: null,
      dateRange: {
        startDate: new Date(),
        endDate: new Date(),
      },
      hours: 0,
      minutes: 0,
      seconds: 10,
    };

    if (type === "A") {
      setEventsA([...eventsA, newEvent]);
    } else if (type === "B") {
      setEventsB([...eventsB, newEvent]);
    } else {
      setEventsC([...eventsC, newEvent]);
    }
  };

  const removeEvent = (index, type) => {
    if (type === "A") {
      setEventsA(eventsA.filter((_, i) => i !== index));
    } else if (type === "B") {
      setEventsB(eventsB.filter((_, i) => i !== index));
    } else {
      setEventsC(eventsC.filter((_, i) => i !== index));
    }
  };

  return (
    <section className="max-w-4xl p-2 mx-auto rounded-md shadow-md bg-gray-800 mt-7 pl-10 md:px-5">
      <h1 className="text-3xl font-bold text-white capitalize mb-4">
        Personalización de Plantilla
      </h1>
      <div className="mb-6">
        <label className="text-white dark:text-gray-200 block mb-0.5">
          Seleccione la Pantalla del Servicio
        </label>
        <Select
          options={Object.values(screenNames).map((name) => ({
            value: name,
            label: name,
          }))}
          value={selectedScreen}
          onChange={handleScreenChange}
          placeholder="Seleccione una pantalla"
        />
      </div>
      {selectedScreen && (
        <>
          {/* Resto del código existente */}
          <div className="mb-6">
            <label className="text-white dark:text-gray-200 block mb-0.5">
              Seleccione la Imagen
            </label>
            <div className="flex justify-between">
              <button
                className={`px-4 py-2 ${
                  selectedImage === "A" ? "bg-blue-500" : "bg-gray-400"
                } rounded-l-md text-white transition-colors duration-200 transform hover:bg-blue-700 focus:outline-none focus:bg-blue-600`}
                onClick={() => setSelectedImage("A")}
              >
                Imagen A
              </button>
              <button
                className={`px-4 py-2 ${
                  selectedImage === "B" ? "bg-blue-500" : "bg-gray-400"
                } rounded-md text-white transition-colors duration-200 transform hover:bg-blue-700 focus:outline-none focus:bg-blue-600`}
                onClick={() => setSelectedImage("B")}
              >
                Imagen B
              </button>
              <button
                className={`px-4 py-2 ${
                  selectedImage === "C" ? "bg-blue-500" : "bg-gray-400"
                } rounded-r-md text-white transition-colors duration-200 transform hover:bg-blue-700 focus:outline-none focus:bg-blue-600`}
                onClick={() => setSelectedImage("C")}
              >
                Imagen o Video C
              </button>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white capitalize mb-4">
            {`IMAGEN ${selectedImage.toUpperCase()}`}
          </h2>
          {selectedImage === "A" && (
            <>
              {eventsA.map((event, index) => (
                <div key={index} className="mb-6 border-t border-gray-700 pt-6">
                  <h3 className="text-xl font-bold text-white capitalize mb-4">
                    {`Imagen ${index + 1}`}
                  </h3>
                  <div className="flex flex-col md:flex-row">
                    <div className="mb-6 md:mr-6 flex flex-col">
                      <label className="text-white dark:text-gray-200 block mb-0.5">
                        Seleccione la Imagen
                      </label>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg" // Cambiado para aceptar solo imágenes
                        onChange={(e) => handleFileChange(e, index, "A")}
                        className="bg-gray-700 text-white py-2 px-3 border rounded-lg w-full mr-2"
                      />

                      {event.imagePreview && (
                        <img
                          src={event.imagePreview}
                          alt="Vista previa"
                          className="mt-2 rounded-lg"
                          style={{ maxWidth: "150px", maxHeight: "150px" }}
                        />
                      )}
                    </div>
                    <div className="mb-6 md:mr-6 flex flex-col">
                      <label className="text-white dark:text-gray-200 block mb-0.5">
                        Seleccione la Fecha
                      </label>
                      <Datepicker
                        useRange={true}
                        value={event.dateRange}
                        onChange={(newDateRange) =>
                          handleEventChange(
                            index,
                            "dateRange",
                            newDateRange,
                            "A"
                          )
                        }
                        className="bg-gray-700 text-white py-2 px-3 border rounded-lg w-full mr-2"
                      />
                    </div>
                    <div className="mb-6 flex flex-col">
                      <label className="text-white dark:text-gray-200 block mb-0.5">
                        Tiempo de visualización (HH:MM:SS)
                      </label>
                      <div className="flex">
                        <input
                          type="number"
                          min="0"
                          value={event.hours}
                          onChange={(e) =>
                            handleEventChange(
                              index,
                              "hours",
                              e.target.value,
                              "A"
                            )
                          }
                          className="bg-gray-700 text-white py-2 px-3 border rounded-l-lg w-full mr-1"
                        />
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={event.minutes}
                          onChange={(e) =>
                            handleEventChange(
                              index,
                              "minutes",
                              e.target.value,
                              "A"
                            )
                          }
                          className="bg-gray-700 text-white py-2 px-3 border w-full mr-1"
                        />
                        <input
                          type="number"
                          min="10"
                          value={event.seconds}
                          onChange={(e) =>
                            handleEventChange(
                              index,
                              "seconds",
                              e.target.value,
                              "A"
                            )
                          }
                          className="bg-gray-700 text-white py-2 px-3 border rounded-r-lg w-full"
                        />
                      </div>
                    </div>
                  </div>
                  {eventsA.length < 3 && (
                    <button
                      onClick={() => addEvent("A")}
                      className="px-6 py-2 leading-5 text-white transition-colors duration-200 transform bg-blue-500 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-600 mt-6"
                    >
                      Agregar nueva imagen
                    </button>
                  )}

                  {index > 0 && (
                    <button
                      onClick={() => removeEvent(index, "A")}
                      className="px-6 py-2 leading-5 text-white transition-colors duration-200 transform bg-red-500 rounded-md hover:bg-red-700 focus:outline-none focus:bg-red-600"
                    >
                      Eliminar Imagen
                    </button>
                  )}
                </div>
              ))}
            </>
          )}
          {selectedImage === "B" && (
            <>
              {eventsB.map((event, index) => (
                <div key={index} className="mb-6 border-t border-gray-700 pt-6">
                  <h3 className="text-xl font-bold text-white capitalize mb-4">
                    {`Imagen ${index + 1}`}
                  </h3>
                  <div className="flex flex-col md:flex-row">
                    <div className="mb-6 md:mr-6 flex flex-col">
                      <label className="text-white dark:text-gray-200 block mb-0.5">
                        Seleccione la Imagen
                      </label>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg" // Cambiado para aceptar solo imágenes
                        onChange={(e) => handleFileChange(e, index, "B")}
                        className="bg-gray-700 text-white py-2 px-3 border rounded-lg w-full mr-2"
                      />
                      {event.imagePreview && (
                        <img
                          src={event.imagePreview}
                          alt="Vista previa"
                          className="mt-2 rounded-lg"
                          style={{ maxWidth: "150px", maxHeight: "150px" }}
                        />
                      )}
                    </div>
                    <div className="mb-6 md:mr-6 flex flex-col">
                      <label className="text-white dark:text-gray-200 block mb-0.5">
                        Seleccione la Fecha
                      </label>
                      <Datepicker
                        useRange={true}
                        value={event.dateRange}
                        onChange={(newDateRange) =>
                          handleEventChange(
                            index,
                            "dateRange",
                            newDateRange,
                            "B"
                          )
                        }
                        className="bg-gray-700 text-white py-2 px-3 border rounded-lg w-full mr-2"
                      />
                    </div>
                    <div className="mb-6 flex flex-col">
                      <label className="text-white dark:text-gray-200 block mb-0.5">
                        Tiempo de visualización (HH:MM:SS)
                      </label>
                      <div className="flex">
                        <input
                          type="number"
                          min="0"
                          value={event.hours}
                          onChange={(e) =>
                            handleEventChange(
                              index,
                              "hours",
                              e.target.value,
                              "B"
                            )
                          }
                          className="bg-gray-700 text-white py-2 px-3 border rounded-l-lg w-full mr-1"
                        />
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={event.minutes}
                          onChange={(e) =>
                            handleEventChange(
                              index,
                              "minutes",
                              e.target.value,
                              "B"
                            )
                          }
                          className="bg-gray-700 text-white py-2 px-3 border w-full mr-1"
                        />
                        <input
                          type="number"
                          min="10"
                          value={event.seconds}
                          onChange={(e) =>
                            handleEventChange(
                              index,
                              "seconds",
                              e.target.value,
                              "B"
                            )
                          }
                          className="bg-gray-700 text-white py-2 px-3 border rounded-r-lg w-full"
                        />
                      </div>
                    </div>
                  </div>
                  {eventsB.length < 3 && (
                    <button
                      onClick={() => addEvent("B")}
                      className="px-6 py-2 leading-5 text-white transition-colors duration-200 transform bg-blue-500 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-600 mt-6"
                    >
                      Agregar nueva imagen
                    </button>
                  )}

                  {index > 0 && (
                    <button
                      onClick={() => removeEvent(index, "B")}
                      className="px-6 py-2 leading-5 text-white transition-colors duration-200 transform bg-red-500 rounded-md hover:bg-red-700 focus:outline-none focus:bg-red-600"
                    >
                      Eliminar Imagen
                    </button>
                  )}
                </div>
              ))}
            </>
          )}
          {selectedImage === "C" && (
            <>
              {eventsC.map((event, index) => (
                <div key={index} className="mb-6 border-t border-gray-700 pt-6">
                  <h3 className="text-xl font-bold text-white capitalize mb-4">
                    {`Imagen o Video ${index + 1}`}
                  </h3>
                  <div className="flex flex-col md:flex-row">
                    <div className="mb-6 md:mr-6 flex flex-col">
                      <label className="text-white dark:text-gray-200 block mb-0.5">
                        Seleccione la Imagen o Video
                      </label>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={(e) => handleFileChange(e, index, "C")}
                        className="bg-gray-700 text-white py-2 px-3 border rounded-lg w-full mr-2"
                      />
                      {event.imagePreview && (
                        <img
                          src={event.imagePreview}
                          alt="Vista previa"
                          className="mt-2 rounded-lg"
                          style={{ maxWidth: "150px", maxHeight: "150px" }}
                        />
                      )}
                    </div>
                    <div className="mb-6 md:mr-6 flex flex-col">
                      <label className="text-white dark:text-gray-200 block mb-0.5">
                        Seleccione la Fecha
                      </label>
                      <Datepicker
                        useRange={true}
                        value={event.dateRange}
                        onChange={(newDateRange) =>
                          handleEventChange(
                            index,
                            "dateRange",
                            newDateRange,
                            "C"
                          )
                        }
                        className="bg-gray-700 text-white py-2 px-3 border rounded-lg w-full mr-2"
                      />
                    </div>
                    <div className="mb-6 flex flex-col">
                      <label className="text-white dark:text-gray-200 block mb-0.5">
                        Tiempo de visualización (HH:MM:SS)
                      </label>
                      <div className="flex">
                        <input
                          type="number"
                          min="0"
                          value={event.hours}
                          onChange={(e) =>
                            handleEventChange(
                              index,
                              "hours",
                              e.target.value,
                              "C"
                            )
                          }
                          className="bg-gray-700 text-white py-2 px-3 border rounded-l-lg w-full mr-1"
                        />
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={event.minutes}
                          onChange={(e) =>
                            handleEventChange(
                              index,
                              "minutes",
                              e.target.value,
                              "C"
                            )
                          }
                          className="bg-gray-700 text-white py-2 px-3 border w-full mr-1"
                        />
                        <input
                          type="number"
                          min="10"
                          value={event.seconds}
                          onChange={(e) =>
                            handleEventChange(
                              index,
                              "seconds",
                              e.target.value,
                              "C"
                            )
                          }
                          className="bg-gray-700 text-white py-2 px-3 border rounded-r-lg w-full"
                        />
                      </div>
                    </div>
                  </div>
                  {eventsC.length < 3 && (
                    <button
                      onClick={() => addEvent("C")}
                      className="px-6 py-2 leading-5 text-white transition-colors duration-200 transform bg-blue-500 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-600 mt-6"
                    >
                      Agregar nueva imagen
                    </button>
                  )}

                  {index > 0 && (
                    <button
                      onClick={() => removeEvent(index, "C")}
                      className="px-6 py-2 leading-5 text-white transition-colors duration-200 transform bg-red-500 rounded-md hover:bg-red-700 focus:outline-none focus:bg-red-600"
                    >
                      Eliminar Imagen
                    </button>
                  )}
                </div>
              ))}
            </>
          )}
          {/* Buttons and other controls */}
        </>
      )}
      <div className="flex justify-end mt-6">
        <button
          onClick={guardarConfiguracion}
          className="px-6 py-2 leading-5 text-white transition-colors duration-200 transform bg-pink-500 rounded-md hover:bg-pink-700 focus:outline-none focus:bg-gray-600"
        >
          Guardar
        </button>
      </div>
    </section>
  );
};

export default PantallaServicio;
