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
    const newEvents = type === "A" ? [...eventsA] : [...eventsB];
    newEvents[index].image = file;

    const reader = new FileReader();
    reader.onload = () => {
      newEvents[index].imagePreview = reader.result;
      type === "A" ? setEventsA(newEvents) : setEventsB(newEvents);
    };
    reader.readAsDataURL(file);
  };

  const handleEventChange = (index, field, value, type) => {
    const newEvents = type === "A" ? [...eventsA] : [...eventsB];
    newEvents[index][field] = value;
    type === "A" ? setEventsA(newEvents) : setEventsB(newEvents);
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
          setEventsA(newEventsA);
          setEventsB(newEventsB);
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

      for (const event of [...eventsA, ...eventsB]) {
        if (
          !event.dateRange ||
          !event.dateRange.startDate ||
          !event.dateRange.endDate
        ) {
          Swal.fire({
            icon: "error",
            title: "Por favor, seleccione una fecha",
          });
          return;
        }
      }

      const uploadFile = async (file, path) => {
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
      };

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
            fechaInicial: event.dateRange.startDate,
            fechaFinal: event.dateRange.endDate,
            tiempoDeVisualizacion: {
              hours: event.hours,
              minutes: event.minutes,
              seconds: event.seconds,
            },
          };
        })
      );

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
            fechaInicial: event.dateRange.startDate,
            fechaFinal: event.dateRange.endDate,
            tiempoDeVisualizacion: {
              hours: event.hours,
              minutes: event.minutes,
              seconds: event.seconds,
            },
          };
        })
      );

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
            },
            { merge: true }
          );
        });
      }
      Swal.fire({
        icon: "success",
        title: "Configuración guardada exitosamente",
        showConfirmButton: false,
        timer: 2000,
      });

      console.log("Configuración guardada correctamente.");
    } catch (error) {
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
        title: "No puedes agregar más de 3 imágenes",
      });
      return;
    }

    if (type === "B" && eventsB.length >= 3) {
      Swal.fire({
        icon: "error",
        title: "No puedes agregar más de 3 imágenes",
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

    type === "A"
      ? setEventsA([...eventsA, newEvent])
      : setEventsB([...eventsB, newEvent]);
  };

  const removeEvent = (index, type) => {
    type === "A"
      ? setEventsA(eventsA.filter((_, i) => i !== index))
      : setEventsB(eventsB.filter((_, i) => i !== index));
  };

  return (
    <section className="max-w-4xl p-6 mx-auto rounded-md shadow-md bg-gray-800 mt-7 pl-10 md:px-32">
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
          <h2 className="text-2xl font-bold text-white capitalize mb-4">
            IMAGEN A
          </h2>
          {eventsA.map((event, index) => (
            <div key={index} className="mb-6 border-t border-gray-700 pt-6">
              <h3 className="text-xl font-bold text-white capitalize mb-4">
                {`Imagen ${index + 1}`}
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="mb-6">
                  <label className="text-white dark:text-gray-200 block mb-0.5">
                    Seleccione la Imagen
                  </label>
                  <input
                    type="file"
                    accept="image/"
                    onChange={(e) => handleFileChange(e, index, "A")}
                    className="bg-gray-700 text-white py-2 px-3 border rounded-lg w-full"
                  />
                  {event.imagePreview && (
                    <img
                      src={event.imagePreview}
                      alt="Vista previa"
                      className="mt-2 rounded-lg"
                    />
                  )}
                </div>
                <div className="mb-6">
                  <label className="text-white dark:text-gray-200 block mb-0.5">
                    Seleccione la Fecha
                  </label>
                  <Datepicker
                    useRange={true}
                    value={event.dateRange}
                    onChange={(newDateRange) =>
                      handleEventChange(index, "dateRange", newDateRange, "A")
                    }
                  />
                </div>
                <div className="mb-6">
                  <label className="text-white dark:text-gray-200 block mb-0.5">
                    Tiempo de visualización (HH:MM:SS)
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      min="0"
                      value={event.hours}
                      onChange={(e) =>
                        handleEventChange(index, "hours", e.target.value, "A")
                      }
                      className="bg-gray-700 text-white py-2 px-3 border rounded-l-lg w-full"
                    />
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={event.minutes}
                      onChange={(e) =>
                        handleEventChange(index, "minutes", e.target.value, "A")
                      }
                      className="bg-gray-700 text-white py-2 px-3 border w-full"
                    />
                    <input
                      type="number"
                      min="10"
                      value={event.seconds}
                      onChange={(e) =>
                        handleEventChange(index, "seconds", e.target.value, "A")
                      }
                      className="bg-gray-700 text-white py-2 px-3 border rounded-r-lg w-full"
                    />
                  </div>
                </div>
              </div>
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
          {eventsA.length < 3 && (
            <button
              onClick={() => addEvent("A")}
              className="px-6 py-2 leading-5 text-white transition-colors duration-200 transform bg-blue-500 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-600 mt-6"
            >
              Agregar Imagen
            </button>
          )}
        </>
      )}
      {selectedScreen && (
        <>
          <h2 className="text-2xl font-bold text-white capitalize mb-4">
            IMAGEN B
          </h2>
          {eventsB.map((event, index) => (
            <div key={index} className="mb-6 border-t border-gray-700 pt-6">
              <h3 className="text-xl font-bold text-white capitalize mb-4">
                {`Imagen ${index + 1}`}
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="mb-6">
                  <label className="text-white dark:text-gray-200 block mb-0.5">
                    Seleccione la Imagen
                  </label>
                  <input
                    type="file"
                    accept="image/"
                    onChange={(e) => handleFileChange(e, index, "B")}
                    className="bg-gray-700 text-white py-2 px-3 border rounded-lg w-full"
                  />
                  {event.imagePreview && (
                    <img
                      src={event.imagePreview}
                      alt="Vista previa"
                      className="mt-2 rounded-lg"
                    />
                  )}
                </div>
                <div className="mb-6">
                  <label className="text-white dark:text-gray-200 block mb-0.5">
                    Seleccione la Fecha
                  </label>
                  <Datepicker
                    useRange={true}
                    value={event.dateRange}
                    onChange={(newDateRange) =>
                      handleEventChange(index, "dateRange", newDateRange, "B")
                    }
                  />
                </div>
                <div className="mb-6">
                  <label className="text-white dark:text-gray-200 block mb-0.5">
                    Tiempo de visualización (HH:MM:SS)
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      min="0"
                      value={event.hours}
                      onChange={(e) =>
                        handleEventChange(index, "hours", e.target.value, "B")
                      }
                      className="bg-gray-700 text-white py-2 px-3 border rounded-l-lg w-full"
                    />
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={event.minutes}
                      onChange={(e) =>
                        handleEventChange(index, "minutes", e.target.value, "B")
                      }
                      className="bg-gray-700 text-white py-2 px-3 border w-full"
                    />
                    <input
                      type="number"
                      min="10"
                      value={event.seconds}
                      onChange={(e) =>
                        handleEventChange(index, "seconds", e.target.value, "B")
                      }
                      className="bg-gray-700 text-white py-2 px-3 border rounded-r-lg w-full"
                    />
                  </div>
                </div>
              </div>
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
          {eventsB.length < 3 && (
            <button
              onClick={() => addEvent("B")}
              className="px-6 py-2 leading-5 text-white transition-colors duration-200 transform bg-blue-500 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-600 mt-6"
            >
              Agregar Imagen
            </button>
          )}
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
