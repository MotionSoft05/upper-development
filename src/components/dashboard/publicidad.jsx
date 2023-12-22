import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
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
const storage = firebase.storage();
const db = firebase.firestore();

function Publicidad() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagenesSalon, setImagenesSalon] = useState([null]);
  const [previewImages, setPreviewImages] = useState([]);
  const [publicidadesIds, setPublicidadesIds] = useState([]);

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

  useEffect(() => {
    const obtenerPublicidades = async () => {
      try {
        setIsLoading(true);

        const publicidadesSnapshot = await db.collection("Publicidad").get();
        const publicidadesData = await Promise.all(
          publicidadesSnapshot.docs.map(async (doc) => {
            const data = doc.data();
            const imageUrl = await storage
              .refFromURL(data.imageUrl)
              .getDownloadURL();

            return {
              id: doc.id,
              ...data,
              imageUrl,
            };
          })
        );

        // Obtén el número de publicidades existentes
        const cantidadPublicidades = publicidadesData.length;

        // Siempre genera un campo adicional
        const cantidadNuevasPublicidades = 1;

        const nuevasImagenes = Array.from(
          { length: cantidadNuevasPublicidades },
          (_, index) =>
            storage
              .ref()
              .child(
                `publicidad/salon_${
                  cantidadPublicidades + index + 1
                }_${Date.now()}.jpg`
              )
        );

        const nuevosTiempos = Array.from(
          { length: cantidadNuevasPublicidades },
          () => ({
            horas: 0,
            minutos: 0,
            segundos: 0,
          })
        );

        const nuevasVistasPrevias = nuevasImagenes.map(() => null);

        // Actualiza el estado con las publicidades obtenidas y los nuevos campos vacíos
        setPublicidadesIds(publicidadesData.map((publicidad) => publicidad.id));
        setImagenesSalon([
          ...publicidadesData.map(() => null),
          ...nuevasImagenes,
        ]);
        setTiemposSalon([
          ...publicidadesData.map((publicidad) => ({
            horas: publicidad.horas || 0,
            minutos: publicidad.minutos || 0,
            segundos: publicidad.segundos || 0,
          })),
          ...nuevosTiempos,
        ]);
        setPreviewImages([
          ...publicidadesData.map((publicidad) => publicidad.imageUrl),
          ...nuevasVistasPrevias,
        ]);
      } catch (error) {
        console.error("Error al obtener publicidades:", error);
      } finally {
        setIsLoading(false);
      }
    };

    obtenerPublicidades();
  }, []);

  const handleInputChange = (event, index, type) => {
    const { name, value } = event.target;
    const newValues = [...type];
    newValues[index][name] = parseInt(value || 0);
    type === tiemposSalon
      ? setTiemposSalon(newValues)
      : setImagenesSalon(newValues);
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

      let hasValidData = false;
      let newIds = [];

      // Almacena las nuevas imágenes y tiempos
      const newImages = [];
      const newTimes = [];
      const newPreviews = [];

      await Promise.all(
        imagenesSalon.map(async (imagen, index) => {
          if (imagen) {
            const imageRef = storageRef.child(
              `publicidad/salon_${index}_${Date.now()}_${imagen.name}`
            );
            await imageRef.put(imagen);

            const imageUrl = await imageRef.getDownloadURL();

            const { horas, minutos, segundos } = tiemposSalon[index];

            hasValidData = true;

            if (horas > 0 || minutos > 0 || segundos > 0) {
              const publicidadRef = await db.collection("Publicidad").add({
                imageUrl,
                horas,
                minutos,
                segundos,
                tipo: "salon",
                userId: userUid,
              });

              console.log("Publicidad agregada:", publicidadRef.id);

              newIds = [...newIds, publicidadRef.id];
            }

            // Almacena las nuevas imágenes y tiempos
            newImages.push(null);
            newTimes.push({ horas: 0, minutos: 0, segundos: 0 });
            newPreviews.push(null);
          }
        })
      );

      if (hasValidData) {
        setPublicidadesIds([...publicidadesIds, ...newIds]);

        // Actualiza los estados con las nuevas imágenes y tiempos
        setImagenesSalon([...imagenesSalon, ...newImages]);
        setTiemposSalon([...tiemposSalon, ...newTimes]);
        setPreviewImages([...previewImages, ...newPreviews]);

        setSuccessMessage("Publicidad salon agregada exitosamente");
        setTimeout(() => {
          setSuccessMessage(null);
        }, 4000);
      } else {
        console.warn("No valid data to add");
      }
    } catch (error) {
      console.error("Error al agregar publicidad:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminarPublicidad = async (publicidadId, index) => {
    try {
      await db.collection("Publicidad").doc(publicidadId).delete();

      // Elimina localmente la publicidad eliminada
      const newImages = [...imagenesSalon];
      newImages.splice(index, 1);

      const newPreviewImages = [...previewImages];
      newPreviewImages.splice(index, 1);

      const newTiemposSalon = [...tiemposSalon];
      newTiemposSalon.splice(index, 1);

      const newIds = [...publicidadesIds];
      newIds.splice(index, 1);

      setImagenesSalon(newImages);
      setPreviewImages(newPreviewImages);
      setTiemposSalon(newTiemposSalon);
      setPublicidadesIds(newIds);
    } catch (error) {
      console.error("Error al eliminar publicidad:", error);
    }
  };

  const isValidData = (index) => {
    const hasImage =
      imagenesSalon[index] !== null && imagenesSalon[index] !== undefined;
    const isNewImageSelected =
      imagenesSalon[index] !== null && imagenesSalon[index].name !== undefined;
    const { horas, minutos, segundos } = tiemposSalon[index];
    const isAdditionalField = index >= publicidadesIds.length;

    if (isAdditionalField) {
      // Verifica si hay una nueva imagen seleccionada y al menos uno de los campos de tiempo completado
      return isNewImageSelected && (horas > 0 || minutos > 0 || segundos > 0);
    }

    // Para campos anteriores, verifica la existencia de una imagen y espera a que al menos uno de los campos de tiempo esté completado
    // Además, verifica si el campo imageUrl ya está presente para evitar habilitar el botón si la imagen aún no se ha subido
    return (
      hasImage &&
      (horas > 0 || minutos > 0 || segundos > 0) &&
      previewImages[index]
    );
  };

  const renderCamposImagenes = () => (
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
                      value={tiemposSalon[index][unit] || 0}
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
            {publicidadesIds[index] && (
              <button
                onClick={() =>
                  handleEliminarPublicidad(publicidadesIds[index], index)
                }
                className="text-red-500 ml-4 mt-2 p-2 px-4 bg-white border border-red-500 rounded-full cursor-pointer hover:bg-red-100 hover:text-red-700"
              >
                Eliminar
              </button>
            )}
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
                  disabled={!isValidData(imagenesSalon.length - 1)}
                  className={`px-4 py-2 text-white ${
                    isValidData(imagenesSalon.length - 1)
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
