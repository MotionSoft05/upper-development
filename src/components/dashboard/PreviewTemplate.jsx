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
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [imageOrVideo3, setImageOrVideo3] = useState(null);
  const [type3, setType3] = useState(null); // Estado adicional para el tipo de archivo
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(10); // Siempre establecido en 10 segundos

  const [imagePreview1, setImagePreview1] = useState(null);
  const [imagePreview2, setImagePreview2] = useState(null);
  const [preview3, setPreview3] = useState(null);

  const [screenNames, setScreenNames] = useState([]);
  const [selectedScreen, setSelectedScreen] = useState(null);
  const [empresa, setEmpresa] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateFin, setSelectedDateFin] = useState(new Date());

  const [events, setEvents] = useState([
    {
      image1: null,
      image2: null,
      imageOrVideo3: null,
      type3: null,
      imagePreview1: null,
      imagePreview2: null,
      preview3: null,
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

  const handleFileChange = (
    event,
    index,
    field,
    previewField,
    setType = null
  ) => {
    const file = event.target.files[0];
    const newEvents = [...events];
    newEvents[index][field] = file;

    const reader = new FileReader();
    reader.onload = () => {
      newEvents[index][previewField] = reader.result;
      if (setType) {
        // Detectar el tipo de archivo por su extensión
        const isVideo = file.name.match(/\.(mp4|webm|ogg)$/i);
        newEvents[index][setType] = isVideo ? "video" : "image";
      }
      setEvents(newEvents);
    };
    reader.readAsDataURL(file);
  };

  const handleEventChange = (index, field, value) => {
    const newEvents = [...events];
    newEvents[index][field] = value;
    setEvents(newEvents);
  };

  const handleScreenChange = async (selectedOption) => {
    setSelectedScreen(selectedOption);
    setEvents([
      {
        image1: null,
        image2: null,
        imageOrVideo3: null,
        type3: null,
        imagePreview1: null,
        imagePreview2: null,
        preview3: null,
        dateRange: {
          startDate: new Date(),
          endDate: new Date(),
        },
        hours: 0,
        minutes: 0,
        seconds: 10,
      },
    ]);

    try {
      const templatesCollection = collection(db, "TemplateSalonesVista");
      const q = query(
        templatesCollection,
        where("empresa", "==", empresa),
        where("nombreDePantalla", "==", selectedOption.value)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Aquí debes cargar la configuración de los eventos
          const newEvents = data.events.map((event) => ({
            image1: null,
            image2: null,
            imageOrVideo3: null,
            type3: null,
            imagePreview1: event.img1 || null,
            imagePreview2: event.img2 || null,
            preview3: event.imgovideo3 || null,
            dateRange: {
              startDate: event.fechaInicial.toDate(),
              endDate: event.fechaFinal.toDate(),
            },
            hours: event.tiempoDeVisualizacion.hours || 0,
            minutes: event.tiempoDeVisualizacion.minutes || 0,
            seconds: event.tiempoDeVisualizacion.seconds || 10,
          }));
          setEvents(newEvents);
        });
      }
    } catch (error) {
      console.error("Error al obtener la configuración de la pantalla:", error);
    }
  };

  const guardarConfiguracion = async () => {
    try {
      const uploadFile = async (file, path) => {
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
      };

      const newEvents = await Promise.all(
        events.map(async (event, index) => {
          const urls = {};
          if (event.image1) {
            const url1 = await uploadFile(
              event.image1,
              `TemplateSalonesVistaimg/event${index + 1}/${event.image1.name}`
            );
            urls.img1 = url1;
          }

          if (event.image2) {
            const url2 = await uploadFile(
              event.image2,
              `TemplateSalonesVistaimg/event${index + 1}/${event.image2.name}`
            );
            urls.img2 = url2;
          }

          if (event.imageOrVideo3) {
            const url3 = await uploadFile(
              event.imageOrVideo3,
              `TemplateSalonesVistaimg/event${index + 1}/${
                event.imageOrVideo3.name
              }`
            );
            urls.imgovideo3 = url3;
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

      const templatesCollection = collection(db, "TemplateSalonesVista");
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
          events: newEvents,
        });
      } else {
        // Si existe, actualizar el documento existente
        querySnapshot.forEach(async (docSnapshot) => {
          const docRef = doc(db, "TemplateSalonesVista", docSnapshot.id);
          await setDoc(
            docRef,
            {
              empresa: empresa,
              nombreDePantalla: selectedScreen.value,
              events: newEvents,
            },
            { merge: true }
          );
        });
      }

      console.log("Configuración guardada correctamente.");
    } catch (error) {
      console.error("Error al guardar la configuración:", error);
    }
  };

  const addEvent = () => {
    if (events.length < 3) {
      setEvents([
        ...events,
        {
          image1: null,
          image2: null,
          imageOrVideo3: null,
          type3: null,
          imagePreview1: null,
          imagePreview2: null,
          preview3: null,
          dateRange: {
            startDate: new Date(),
            endDate: new Date(),
          },
          hours: 0,
          minutes: 0,
          seconds: 10,
        },
      ]);
    }
  };

  return (
    <section className="max-w-4xl p-6 mx-auto rounded-md shadow-md bg-gray-800 mt-7 pl-10 md:px-32">
      <h1 className="text-3xl font-bold text-white capitalize mb-4">
        Personalización del Template
      </h1>
      <div className="mb-6">
        <label className="text-white dark:text-gray-200 block mb-0.5">
          Seleccionar Pantalla del Servicio
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
      {events.map((event, index) => (
        <div key={index} className="mb-6 border-t border-gray-700 pt-6">
          <h2 className="text-2xl font-bold text-white capitalize mb-4">
            Evento {index + 1}
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="mb-6">
              <label className="text-white dark:text-gray-200 block mb-0.5">
                Seleccionar Imagen 1
              </label>
              <input
                type="file"
                accept="image/"
                onChange={(event) =>
                  handleFileChange(event, index, "image1", "imagePreview1")
                }
                className="bg-gray-700 text-white py-2 px-3 border rounded-lg w-full"
              />
              {event.imagePreview1 && (
                <img
                  src={event.imagePreview1}
                  alt="Vista previa"
                  className="mt-2 rounded-lg"
                />
              )}
            </div>
            <div className="mb-6">
              <label className="text-white dark:text-gray-200 block mb-0.5">
                Seleccionar Imagen 2
              </label>
              <input
                type="file"
                accept="image/"
                onChange={(event) =>
                  handleFileChange(event, index, "image2", "imagePreview2")
                }
                className="bg-gray-700 text-white py-2 px-3 border rounded-lg w-full"
              />
              {event.imagePreview2 && (
                <img
                  src={event.imagePreview2}
                  alt="Vista previa"
                  className="mt-2 rounded-lg"
                />
              )}
            </div>
            <div className="mb-6">
              <label className="text-white dark:text-gray-200 block mb-0.5">
                Seleccionar Imagen o Video 3
              </label>
              <input
                type="file"
                accept="image/,video/"
                onChange={(event) =>
                  handleFileChange(
                    event,
                    index,
                    "imageOrVideo3",
                    "preview3",
                    "type3"
                  )
                }
                className="bg-gray-700 text-white py-2 px-3 border rounded-lg w-full"
              />
              {event.preview3 && event.type3 === "video" && (
                <div className="mt-2">
                  <video src={event.preview3} controls className="rounded-lg">
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
              {event.preview3 && event.type3 === "image" && (
                <img
                  src={event.preview3}
                  alt="Vista previa"
                  className="mt-2 rounded-lg"
                />
              )}
            </div>
            <div className="mb-6">
              <label className="text-white dark:text-gray-200 block mb-0.5">
                Seleccionar Fecha
              </label>
              <Datepicker
                useRange={true}
                value={event.dateRange}
                onChange={(newDateRange) =>
                  handleEventChange(index, "dateRange", newDateRange)
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
                    handleEventChange(index, "hours", e.target.value)
                  }
                  className="bg-gray-700 text-white py-2 px-3 border rounded-l-lg w-full"
                />
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={event.minutes}
                  onChange={(e) =>
                    handleEventChange(index, "minutes", e.target.value)
                  }
                  className="bg-gray-700 text-white py-2 px-3 border w-full"
                />
                <input
                  type="number"
                  min="10"
                  value={event.seconds}
                  onChange={(e) =>
                    handleEventChange(index, "seconds", e.target.value)
                  }
                  className="bg-gray-700 text-white py-2 px-3 border rounded-r-lg w-full"
                />
              </div>
            </div>
          </div>
        </div>
      ))}
      {events.length < 3 && (
        <button
          onClick={addEvent}
          className="px-6 py-2 leading-5 text-white transition-colors duration-200 transform bg-blue-500 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-600 mt-6"
        >
          Agregar Evento
        </button>
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
