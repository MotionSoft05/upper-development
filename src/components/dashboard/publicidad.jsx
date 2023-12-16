/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
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

const auth = firebase.auth(); // Obtener la instancia de Auth
const db = firebase.firestore();
const storage = firebase.storage();

function Publicidad() {
  const [user, setUser] = useState(null);
  const [imagenesSalon, setImagenesSalon] = useState([null]);
  const [imagenesDirectorio, setImagenesDirectorio] = useState([null]);
  const [tiemposSalon, setTiemposSalon] = useState([
    { horas: 0, minutos: 0, segundos: 0 },
  ]);
  const [tiemposDirectorio, setTiemposDirectorio] = useState([
    { horas: 0, minutos: 0, segundos: 0 },
  ]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleImagenSelect = (event, tipo) => {
    const file = event.target.files[0];

    if (tipo === "salon") {
      const nuevasImagenesSalon = [...imagenesSalon];
      nuevasImagenesSalon[imagenesSalon.length - 1] = file;
      setImagenesSalon(nuevasImagenesSalon);
    } else if (tipo === "directorio") {
      const nuevasImagenesDirectorio = [...imagenesDirectorio];
      nuevasImagenesDirectorio[imagenesDirectorio.length - 1] = file;
      setImagenesDirectorio(nuevasImagenesDirectorio);
    }
  };

  const eliminarImagen = (index, tipo) => {
    if (tipo === "salon") {
      const nuevasImagenesSalon = [...imagenesSalon];
      nuevasImagenesSalon.splice(index, 1);
      setImagenesSalon(nuevasImagenesSalon);
    } else if (tipo === "directorio") {
      const nuevasImagenesDirectorio = [...imagenesDirectorio];
      nuevasImagenesDirectorio.splice(index, 1);
      setImagenesDirectorio(nuevasImagenesDirectorio);
    }
  };

  const handleTiempoChange = (event, index, tipo) => {
    const { name, value } = event.target;
    const newTiempos =
      tipo === "salon" ? [...tiemposSalon] : [...tiemposDirectorio];
    newTiempos[index][name] = parseInt(value || 0);
    tipo === "salon"
      ? setTiemposSalon(newTiempos)
      : setTiemposDirectorio(newTiempos);
  };

  const handlePreviewClick = () => {
    // Lógica para mostrar la vista previa de las imágenes con los tiempos configurados
  };

  const handleEliminarCampo = (index, tipo) => {
    if (tipo === "salon") {
      const nuevasImagenesSalon = [...imagenesSalon];
      const nuevosTiemposSalon = [...tiemposSalon];
      nuevasImagenesSalon.splice(index, 1);
      nuevosTiemposSalon.splice(index, 1);
      setImagenesSalon(nuevasImagenesSalon);
      setTiemposSalon(nuevosTiemposSalon);
    } else if (tipo === "directorio") {
      const nuevasImagenesDirectorio = [...imagenesDirectorio];
      const nuevosTiemposDirectorio = [...tiemposDirectorio];
      nuevasImagenesDirectorio.splice(index, 1);
      nuevosTiemposDirectorio.splice(index, 1);
      setImagenesDirectorio(nuevasImagenesDirectorio);
      setTiemposDirectorio(nuevosTiemposDirectorio);
    }
  };

  const handleAgregarPublicidad = async (tipo) => {
    try {
      const storageRef = storage.ref();
      const userUid = user.uid;

      const promises = imagenesSalon.map(async (imagen, index) => {
        if (imagen) {
          const imageRef = storageRef.child(
            `publicidad/${userUid}/${tipo}_${index}_${Date.now()}_${
              imagen.name
            }`
          );
          await imageRef.put(imagen);

          const imageUrl = await imageRef.getDownloadURL();

          // Agregar datos a la colección "Publicidad"
          await db.collection("Publicidad").add({
            imageUrl,
            horas: tiemposSalon[index].horas,
            minutos: tiemposSalon[index].minutos,
            segundos: tiemposSalon[index].segundos,
            tipo,
            userId: userUid,
          });
        }
      });

      await Promise.all(promises);

      // Limpiar campos después de agregar publicidad
      if (tipo === "salon") {
        setImagenesSalon([...imagenesSalon, null]);
        setTiemposSalon([
          ...tiemposSalon,
          { horas: 0, minutos: 0, segundos: 0 },
        ]);
      } else if (tipo === "directorio") {
        setImagenesDirectorio([...imagenesDirectorio, null]);
        setTiemposDirectorio([
          ...tiemposDirectorio,
          { horas: 0, minutos: 0, segundos: 0 },
        ]);
      }
    } catch (error) {
      console.error("Error al agregar publicidad:", error);
    }
  };

  const renderCamposImagenes = (imagenes, tiempos, tipo, titulo) => {
    return (
      <section>
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800">{titulo}</h3>
          {imagenes.map((imagen, index) => (
            <div key={index} className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800">
                {tipo === "directorio" ? "Directorio" : "Salón de Eventos"} -
                Imagen {index + 1}
              </h3>
              <div className="mt-4">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id={`imagen${tipo}-${index}`}
                  onChange={(event) => handleImagenSelect(event, tipo)}
                />
                <label
                  htmlFor={`imagen${tipo}-${index}`}
                  className="block p-3 border rounded-lg cursor-pointer text-blue-500 border-blue-500 hover:bg-blue-100 hover:text-blue-700 w-1/2"
                >
                  Seleccionar Imagen
                </label>

                {imagen && (
                  <div className="flex items-center mt-2">
                    <span className="block">{imagen.name}</span>
                    <button
                      onClick={() => eliminarImagen(index, tipo)}
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
                      value={tiempos[index].horas || 0}
                      onChange={(event) =>
                        handleTiempoChange(event, index, tipo)
                      }
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
                      value={tiempos[index].minutos || 0}
                      onChange={(event) =>
                        handleTiempoChange(event, index, tipo)
                      }
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
                      value={tiempos[index].segundos || 0}
                      onChange={(event) =>
                        handleTiempoChange(event, index, tipo)
                      }
                      className="w-16 px-2 py-1 ml-4 border rounded-md border-gray-300 focus:outline-none"
                    />
                    <span className="text-gray-600">segundos</span>
                  </div>
                </div>
              </div>

              {/* Botón de eliminar campo */}
              <button
                onClick={() => handleEliminarCampo(index, tipo)}
                className="mt-4 px-2 py-1 text-red-500 hover:text-red-700"
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

          {/* Configuración de Salón de Eventos */}
          <div className="mb-8">
            {renderCamposImagenes(
              imagenesSalon,
              tiemposSalon,
              "salon",
              "Salón de Eventos"
            )}
            {imagenesSalon.length < 10 && (
              <div className="mt-4">
                <button
                  onClick={() => handleAgregarPublicidad("salon")}
                  className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md focus:outline-none"
                >
                  + Agregar Publicidad Salón
                </button>
              </div>
            )}
          </div>

          {/* Configuración de Directorio */}
          <div className="mb-8">
            {renderCamposImagenes(
              imagenesDirectorio,
              tiemposDirectorio,
              "directorio",
              "Directorio"
            )}
            {imagenesDirectorio.length < 10 && (
              <div className="mt-4">
                <button
                  onClick={() => handleAgregarPublicidad("directorio")}
                  className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md focus:outline-none"
                >
                  + Agregar Publicidad Directorio
                </button>
              </div>
            )}
          </div>

          {/* Botón de vista previa */}
          <div className="text-center">
            <button
              onClick={handlePreviewClick}
              className="px-6 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md focus:outline-none"
            >
              Vista Previa
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}

export default Publicidad;
