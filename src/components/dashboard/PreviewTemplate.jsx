import React, { useState, useEffect } from "react";
import Select from "react-select";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

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

const PantallaServicio = () => {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [imageOrVideo3, setImageOrVideo3] = useState(null);
  const [screenNames, setScreenNames] = useState([]);
  const [selectedScreen, setSelectedScreen] = useState(null);

  useEffect(() => {
    const fetchScreenNames = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        const userEmail = user ? user.email : null;

        if (userEmail) {
          console.log("Correo electrónico del usuario logueado:", userEmail);

          const usersCollection = collection(db, "usuarios"); // Utiliza db en lugar de firestore
          const q = query(usersCollection, where("email", "==", userEmail));
          const querySnapshot = await getDocs(q);

          querySnapshot.forEach((doc) => {
            const user = doc.data();
            const nombresPantallas = user.NombrePantallasServicios || [];
            console.log("Nombres de las pantallas:", nombresPantallas);
            setScreenNames(nombresPantallas);
          });
        }
      } catch (error) {
        console.error("Error al obtener nombres de pantallas:", error);
      }
    };

    fetchScreenNames();
  }, []);

  const handleImage1Change = (event) => {
    setImage1(URL.createObjectURL(event.target.files[0]));
  };

  const handleImage2Change = (event) => {
    setImage2(URL.createObjectURL(event.target.files[0]));
  };

  const handleImageOrVideo3Change = (event) => {
    setImageOrVideo3(URL.createObjectURL(event.target.files[0]));
  };

  const handleScreenChange = (selectedOption) => {
    setSelectedScreen(selectedOption);
    // Aquí podrías realizar alguna acción adicional al seleccionar una pantalla
  };

  const guardarConfiguracion = () => {
    // Lógica para guardar la configuración
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
            accept="image/*"
            onChange={handleImage1Change}
            className="bg-gray-700 text-white py-2 px-3 border rounded-lg w-full"
          />
          {image1 && (
            <img src={image1} alt="Imagen 1" className="mt-2 rounded-lg" />
          )}
        </div>

        <div className="mb-6">
          <label className="text-white dark:text-gray-200 block mb-0.5">
            Seleccionar Imagen 2
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImage2Change}
            className="bg-gray-700 text-white py-2 px-3 border rounded-lg w-full"
          />
          {image2 && (
            <img src={image2} alt="Imagen 2" className="mt-2 rounded-lg" />
          )}
        </div>

        <div className="mb-6">
          <label className="text-white dark:text-gray-200 block mb-0.5">
            Seleccionar Imagen o Video 3
          </label>
          <input
            type="file"
            accept="image/*, video/*"
            onChange={handleImageOrVideo3Change}
            className="bg-gray-700 text-white py-2 px-3 border rounded-lg w-full"
          />
          {imageOrVideo3 && (
            <video
              controls
              className="mt-2 rounded-lg"
              style={{ width: "100%" }}
            >
              <source src={imageOrVideo3} type="video/mp4" />
              Tu navegador no admite el elemento de video.
            </video>
          )}
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
