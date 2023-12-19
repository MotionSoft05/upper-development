/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import {
  collection,
  deleteDoc,
  query,
  where,
  getDocs,
  docRef,
  update,
} from "firebase/firestore";

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
  const [imagenesSalon, setImagenesSalon] = useState([null]);
  const [tiemposSalon, setTiemposSalon] = useState([
    { horas: 0, minutos: 0, segundos: 0 },
  ]);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleImagenSelect = (event) => {
    const file = event.target.files[0];
    const nuevasImagenesSalon = [...imagenesSalon];
    nuevasImagenesSalon[imagenesSalon.length - 1] = file;
    setImagenesSalon(nuevasImagenesSalon);
  };

  const eliminarImagen = (index) => {
    const nuevasImagenesSalon = [...imagenesSalon];
    nuevasImagenesSalon.splice(index, 1);
    setImagenesSalon(nuevasImagenesSalon);
  };

  const handleTiempoChange = (event, index) => {
    const { name, value } = event.target;
    const newTiempos = [...tiemposSalon];
    newTiempos[index][name] = parseInt(value || 0);
    setTiemposSalon(newTiempos);
  };

  const handleAgregarPublicidad = async () => {
    try {
      const storageRef = storage.ref();
      const userUid = user.uid;

      const promises = imagenesSalon.map(async (imagen, index) => {
        if (imagen) {
          const imageRef = storageRef.child(
            `publicidad/${userUid}/salon_${index}_${Date.now()}_${imagen.name}`
          );
          await imageRef.put(imagen);

          const imageUrl = await imageRef.getDownloadURL();

          // Agregar datos a la colección "Publicidad"
          await db.collection("Publicidad").add({
            imageUrl,
            horas: tiemposSalon[index].horas,
            minutos: tiemposSalon[index].minutos,
            segundos: tiemposSalon[index].segundos,
            tipo: "salon",
            userId: userUid,
          });
        }
      });

      await Promise.all(promises);

      // Limpiar campos después de agregar publicidad
      setImagenesSalon([...imagenesSalon, null]);
      setTiemposSalon([...tiemposSalon, { horas: 0, minutos: 0, segundos: 0 }]);

      setSuccessMessage("Publicidad salon agregada exitosamente");
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (error) {
      console.error("Error al agregar publicidad:", error);
    }
  };

  const handleEliminarPublicidad = async (index) => {
    try {
      const userUid = user.uid;

      // Obtener una referencia al documento que quieres eliminar
      const publicidadQuery = query(
        collection(db, "Publicidad"),
        where("userId", "==", userUid)
      );

      const querySnapshot = await getDocs(publicidadQuery);

      if (!querySnapshot.empty) {
        const documentToDelete = querySnapshot.docs[index];
        await deleteDoc(documentToDelete.ref);
      }

      // Eliminar el campo correspondiente en el estado local
      const nuevasImagenesSalon = [...imagenesSalon];
      nuevasImagenesSalon.splice(index, 1);
      setImagenesSalon(nuevasImagenesSalon);

      setTiemposSalon((prevTiempos) => {
        const newTiempos = [...prevTiempos];
        newTiempos.splice(index, 1);
        return newTiempos;
      });

      setSuccessMessage("Publicidad salon eliminada exitosamente");
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);

      // Update the remaining advertisements if needed
      const remainingPublicidades = querySnapshot.docs.filter(
        (_, i) => i !== index
      );

      for (const doc of remainingPublicidades) {
        const docRef = doc.ref;
        await docRef.delete(); // Use delete instead of update
      }
    } catch (error) {
      console.error("Error al eliminar publicidad:", error);
    }
  };

  const renderCamposImagenes = () => {
    const allFieldsEmpty = imagenesSalon.every((imagen) => !imagen);
    return (
      <section>
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800">
            Salón de Eventos
          </h3>
          {imagenesSalon.map((imagen, index) => (
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
                  onChange={handleImagenSelect}
                />
                <label
                  htmlFor={`imagenSalon-${index}`}
                  className="block p-3 border rounded-lg cursor-pointer text-blue-500 border-blue-500 hover:bg-blue-100 hover:text-blue-700 w-1/2"
                >
                  Seleccionar Imagen
                </label>

                {imagen && (
                  <div className="flex items-center mt-2">
                    <span className="block">{imagen.name}</span>
                    <button
                      onClick={() => eliminarImagen(index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <label className="text-gray-800">
                  Tiempo de visualización:
                </label>
                <div className="flex mt-2">
                  <div className="flex items-center">
                    <input
                      type="number"
                      name="horas"
                      min="0"
                      max="24"
                      value={tiemposSalon[index].horas || 0}
                      onChange={(event) => handleTiempoChange(event, index)}
                      className="w-16 px-2 py-1 mr-2 border rounded-md border-gray-300 focus:outline-none"
                    />
                    <span className="text-gray-600">horas</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      name="minutos"
                      min="0"
                      max="59"
                      value={tiemposSalon[index].minutos || 0}
                      onChange={(event) => handleTiempoChange(event, index)}
                      className="w-16 px-2 py-1 ml-4 border rounded-md border-gray-300 focus:outline-none"
                    />
                    <span className="text-gray-600">minutos</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      name="segundos"
                      min="0"
                      max="59"
                      value={tiemposSalon[index].segundos || 0}
                      onChange={(event) => handleTiempoChange(event, index)}
                      className="w-16 px-2 py-1 ml-4 border rounded-md border-gray-300 focus:outline-none"
                    />
                    <span className="text-gray-600">segundos</span>
                  </div>
                </div>
              </div>

              {/* Botón de eliminar campo */}
              <button
                onClick={() => handleEliminarPublicidad(index)}
                className={`mt-4 px-2 py-1 text-red-500 hover:text-red-700 ${
                  allFieldsEmpty && "disabled:opacity-50 cursor-not-allowed"
                }`}
                disabled={allFieldsEmpty}
              >
                Eliminar Campo
              </button>
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <section className="px-5 md:px-32">
      <div>
        <section className="">
          {/* Selección de pantallas */}
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

          {/* Configuración de Salón de Eventos */}
          <div className="mb-8">
            {renderCamposImagenes()}
            {imagenesSalon.length < 10 && (
              <div className="mt-4">
                <button
                  onClick={handleAgregarPublicidad}
                  className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md focus:outline-none"
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
