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

  const handleFileChange = (event, setFile, setPreview, setType = null) => {
    const file = event.target.files[0];
    setFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      if (setType) {
        // Detectar el tipo de archivo por su extensión
        const isVideo = file.name.match(/\.(mp4|webm|ogg)$/i);
        setType(isVideo ? "video" : "image");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleScreenChange = async (selectedOption) => {
    setSelectedScreen(selectedOption);
    setImage1(null);
    setImage2(null);
    setImageOrVideo3(null);
    setImagePreview1(null);
    setImagePreview2(null);
    setPreview3(null);
    setType3(null);
    setHours(0);
    setMinutes(0);
    setSeconds(10);

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

          if (data.img1) setImagePreview1(data.img1);
          if (data.img2) setImagePreview2(data.img2);
          if (data.imgovideo3) {
            console.log("Data imgovideo3:", data.imgovideo3); // Agregar registro
            setPreview3(data.imgovideo3);

            // Extraer la extensión del archivo de la URL
            const fileExtension = data.imgovideo3
              .split("?alt=")[0]
              .split(".")
              .pop()
              .toLowerCase();

            // Verificar si la extensión del archivo corresponde a una extensión de video
            const isVideo = ["mp4", "webm", "ogg"].includes(fileExtension);
            setType3(isVideo ? "video" : "image");

            console.log("Tipo de archivo:", isVideo ? "video" : "image"); // Agregar registro
          }

          if (data.tiempoDeVisualizacion) {
            const { hours, minutes, seconds } = data.tiempoDeVisualizacion;
            console.log("Tiempo de visualización:", hours, minutes, seconds);
            setHours(hours || 0);
            setMinutes(minutes || 0);
            setSeconds(seconds || 10);
          }
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

      const urls = {};
      if (image1) {
        const url1 = await uploadFile(
          image1,
          `TemplateSalonesVistaimg/${image1.name}`
        );
        urls.img1 = url1;
      }

      if (image2) {
        const url2 = await uploadFile(
          image2,
          `TemplateSalonesVistaimg/${image2.name}`
        );
        urls.img2 = url2;
      }

      if (imageOrVideo3) {
        const url3 = await uploadFile(
          imageOrVideo3,
          `TemplateSalonesVistaimg/${imageOrVideo3.name}`
        );
        urls.imgovideo3 = url3;
      }

      // Crear objeto para almacenar las fechas inicial y final
      const fechas = {
        fechaInicial: selectedDate,
        fechaFinal: selectedDateFin, // Asegúrate de tener selectedDateFin como estado
      };

      // Buscar si ya existe un documento con la misma empresa y nombre de pantalla
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
          tiempoDeVisualizacion: {
            hours,
            minutes,
            seconds,
          },
          ...urls,
          ...fechas, // Agregar fechas al documento
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
              tiempoDeVisualizacion: {
                hours,
                minutes,
                seconds,
              },
              ...urls,
              ...fechas, // Agregar fechas al documento
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

  const [dateRange, setDateRange] = useState({
    startDate: selectedDate,
    endDate: selectedDateFin,
  });

  const handleDateChange = (newDateRange) => {
    setSelectedDate(newDateRange.startDate);
    setSelectedDateFin(newDateRange.endDate);
    setDateRange(newDateRange);
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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="mb-6">
          <label className="text-white dark:text-gray-200 block mb-0.5">
            Seleccionar Imagen 1
          </label>
          <input
            type="file"
            accept="image/"
            onChange={(event) =>
              handleFileChange(event, setImage1, setImagePreview1)
            }
            className="bg-gray-700 text-white py-2 px-3 border rounded-lg w-full"
          />
          {imagePreview1 && (
            <img
              src={imagePreview1}
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
              handleFileChange(event, setImage2, setImagePreview2)
            }
            className="bg-gray-700 text-white py-2 px-3 border rounded-lg w-full"
          />
          {imagePreview2 && (
            <img
              src={imagePreview2}
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
              handleFileChange(event, setImageOrVideo3, setPreview3, setType3)
            }
            className="bg-gray-700 text-white py-2 px-3 border rounded-lg w-full"
          />
          {preview3 && type3 === "video" && (
            <div className="mt-2">
              <video src={preview3} controls className="rounded-lg">
                Your browser does not support the video tag.
              </video>
            </div>
          )}
          {preview3 && type3 === "image" && (
            <img
              src={preview3}
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
            value={dateRange}
            onChange={handleDateChange}
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
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="bg-gray-700 text-white py-2 px-3 border rounded-l-lg w-full"
            />
            <input
              type="number"
              min="0"
              max="59"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="bg-gray-700 text-white py-2 px-3 border w-full"
            />
            <input
              type="number"
              min="10"
              value={seconds}
              onChange={(e) => setSeconds(e.target.value)}
              className="bg-gray-700 text-white py-2 px-3 border rounded-r-lg w-full"
            />
          </div>
        </div>
      </div>
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
