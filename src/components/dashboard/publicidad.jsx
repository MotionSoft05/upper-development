import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import "firebase/compat/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCzD--npY_6fZcXH-8CzBV7UGzPBqg85y8",
  authDomain: "upper-a544e.firebaseapp.com",
  projectId: "upper-a544e",
  storageBucket: "upper-a544e.appspot.com",
  messagingSenderId: "665713417470",
  appId: "1:665713417470:web:73f7fb8ee518bea35999af",
  measurementId: "G-QTFQ55YY5D",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

function Publicidad() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [publicidadRef, setPublicidadRef] = useState([]);
  const [imagenesSalon, setImagenesSalon] = useState([null]);
  const [previewImages, setPreviewImages] = useState([]);
  const [tiemposSalon, setTiemposSalon] = useState([
    { horas: 0, minutos: 0, segundos: 0 },
  ]);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        cargarPublicidades(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const cargarPublicidades = async (userId) => {
    try {
      setIsLoading(true);
      console.log("Fetching publicidades for user:", userId);

      const publicidadesSnapshot = await getDocs(
        query(collection(db, "Publicidad"), where("userId", "==", userId))
      );

      const imagenes = [];
      const previews = [];
      const tiempos = [];
      const refs = [];

      const publicidadesData = publicidadesSnapshot.docs.map((doc) => {
        const data = doc.data();
        imagenes.push(null); // Placeholder for imagenesSalon
        previews.push(data.imageUrl); // Use imageUrl from Firebase directly
        tiempos.push({
          horas: data.horas || 0,
          minutos: data.minutos || 0,
          segundos: data.segundos || 0,
        });
        refs.push({ ref: doc.ref, index: imagenes.length - 1 });
        return data;
      });

      // Update state variables with deep copies
      setImagenesSalon([...imagenes]);
      setPreviewImages([...previews]);
      setTiemposSalon([...tiempos]);
      setPublicidadRef([...refs]);

      console.log("Publicidades data:", publicidadesData);
    } catch (error) {
      console.error("Error al cargar publicidades:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (event, index, type) => {
    const { name, value } = event.target;
    const newValues = [...type];

    console.log("Type:", type);
    console.log("New Values (before):", newValues);

    if (!newValues[index]) {
      newValues[index] = {};
    }

    if (name === "horas" || name === "minutos" || name === "segundos") {
      // Actualizar el objeto de tiempos
      newValues[index][name] = parseInt(value || 0);
      setTiemposSalon(newValues);
    } else {
      // Actualizar el array de imágenes
      newValues[index] = event.target.files[0];
      setImagenesSalon(newValues);

      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviewImages = [...previewImages];
        newPreviewImages[index] = reader.result;
        setPreviewImages(newPreviewImages);
      };
      reader.readAsDataURL(newValues[index]);
    }

    console.log("New Values (after):", newValues);
    console.log("Tiempos Salon:", tiemposSalon);
    console.log("Imagenes Salon:", imagenesSalon);
  };

  const handleImagenSelect = (event, index) => {
    const file = event.target.files[0];
    const newImages = [...imagenesSalon];
    newImages[index] = file;
    setImagenesSalon(newImages);

    const reader = new FileReader();
    reader.onloadend = () => {
      const newPreviewImages = [...previewImages];
      newPreviewImages[index] = reader.result;
      setPreviewImages(newPreviewImages);
    };
    reader.readAsDataURL(file);
  };

  const handleAgregarPublicidad = async () => {
    try {
      setIsLoading(true);
      const storageRef = storage.ref();
      const userUid = user.uid;

      const lastImageIndex = imagenesSalon.length - 1;

      // Verifica si hay una imagen seleccionada para la última posición
      if (imagenesSalon[lastImageIndex]) {
        const existingRef = publicidadRef.find(
          (ref) => ref && ref.index === lastImageIndex
        );

        if (!existingRef) {
          const imageRef = storageRef.child(
            `publicidad/salon_${lastImageIndex}_${Date.now()}_${
              imagenesSalon[lastImageIndex].name
            }`
          );
          await imageRef.put(imagenesSalon[lastImageIndex]);

          const imageUrl = await imageRef.getDownloadURL();

          const { horas, minutos, segundos } = tiemposSalon[lastImageIndex];

          const hasTimeData = horas > 0 || minutos > 0 || segundos > 0;

          if (hasTimeData) {
            const publicidadRef = await db.collection("Publicidad").add({
              imageUrl,
              horas,
              minutos,
              segundos,
              tipo: "salon",
              userId: userUid,
            });

            setPublicidadRef((prevRefs) => [
              ...prevRefs,
              { ref: publicidadRef, index: lastImageIndex },
            ]);

            setImagenesSalon((prevImages) => [...prevImages, null]);
            setTiemposSalon((prevTiempos) => [
              ...prevTiempos,
              { horas: 0, minutos: 0, segundos: 0 },
            ]);

            setSuccessMessage("Publicidad salon agregada exitosamente");
            setTimeout(() => {
              setSuccessMessage(null);
            }, 4000);
          }
        }
      } else {
        console.warn("No image selected for the last position.");
      }
    } catch (error) {
      console.error("Error al agregar publicidad:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isValidData = () => {
    const hasImages = imagenesSalon.every((imagen) => imagen !== null);

    const hasValidTimeData = tiemposSalon.some((tiempo) => {
      const { horas, minutos, segundos } = tiempo;
      return horas > 0 || minutos > 0 || segundos > 0;
    });

    return hasImages && hasValidTimeData;
  };

  const renderCamposImagenes = () => (
    <section>
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800">
          Salón de Eventos
        </h3>
        {[...imagenesSalon, null].map((imagen, index) => (
          <div key={index} className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800">
              Salón de Eventos - Imagen {index + 1}
            </h3>
            <div className="mt-4">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id={`imagenSalon-${index}`}
                onChange={(event) => handleImagenSelect(event, index)}
              />
              <label
                htmlFor={`imagenSalon-${index}`}
                className="block p-3 border rounded-lg cursor-pointer text-blue-500 border-blue-500 hover:bg-blue-100 hover:text-blue-700 w-1/2"
              >
                Seleccionar Imagen
              </label>
            </div>
            {previewImages[index] && (
              <img
                src={previewImages[index]}
                alt={`Vista previa de la imagen ${index + 1}`}
                className="mt-4 max-w-xs h-auto"
              />
            )}
            <div className="mt-4">
              <label className="text-gray-800">Tiempo de visualización:</label>
              <div className="flex mt-2">
                {["horas", "minutos", "segundos"].map((unit) => (
                  <div key={unit} className="flex items-center">
                    <input
                      type="number"
                      name={unit}
                      min="0"
                      max={unit === "horas" ? "24" : "59"}
                      value={
                        (tiemposSalon[index] && tiemposSalon[index][unit]) || 0
                      }
                      onChange={(event) =>
                        handleInputChange(event, index, tiemposSalon)
                      }
                      className="w-16 px-2 py-1 ml-4 border rounded-md border-gray-300 focus:outline-none"
                    />
                    <span className="text-gray-600">{unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <section className="px-5 md:px-32">
      <div>
        <section className="">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">
              CONFIGURACIÓN DE PUBLICIDAD
            </h2>
            <p className="text-gray-600">
              Ingresar imágenes que serán desplegadas cuando no se cuente con
              eventos.
            </p>
          </div>
          {successMessage && (
            <div className="bg-green-500 text-white p-2 mb-4 rounded-md">
              {successMessage}
            </div>
          )}
          <div className="mb-8">
            {renderCamposImagenes()}
            {imagenesSalon.length < 10 && (
              <div className="mt-4">
                <button
                  onClick={handleAgregarPublicidad}
                  disabled={!isValidData()}
                  className={`px-4 py-2 text-white ${
                    isValidData()
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-gray-400 cursor-not-allowed"
                  } rounded-md focus:outline-none`}
                >
                  + Agregar Publicidad Salón
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

export default Publicidad;
