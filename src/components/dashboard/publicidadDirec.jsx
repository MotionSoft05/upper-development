import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/storage";
import "firebase/compat/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAiP1248hBEZt3iS2H4UVVjdf_xbuJHD3k",
  authDomain: "upper-8c817.firebaseapp.com",
  projectId: "upper-8c817",
  storageBucket: "upper-8c817.appspot.com",
  messagingSenderId: "798455798906",
  appId: "1:798455798906:web:f58a3e51b42eebb6436fc3",
  measurementId: "G-6VHX927GH1",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const storage = firebase.storage();
const db = firebase.firestore();

function PublicidadDirec() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagenesSalon, setImagenesSalon] = useState([null]);
  const [previewImages, setPreviewImages] = useState([]);
  const [publicidadesIds, setPublicidadesIds] = useState([]);
  const [imagenesSalonOriginales, setImagenesSalonOriginales] = useState([
    null,
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [tiemposSalon, setTiemposSalon] = useState([
    { horas: 0, minutos: 0, segundos: 0 },
  ]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [originalTiemposSalon, setOriginalTiemposSalon] = useState({
    horas: 0,
    minutos: 0,
    segundos: 0,
  });
  const [originalImagen, setOriginalImagen] = useState(null);
  const [originalImageUrl, setOriginalImageUrl] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        await obtenerPublicidades(user, "directorio");
      } else {
        console.warn("El objeto user es nulo.");
      }
    });

    return () => unsubscribe();
  }, []);

  const obtenerPublicidades = async (currentUser, tipo) => {
    try {
      setIsLoading(true);

      if (currentUser && currentUser.uid) {
        const userUid = currentUser.uid;
        const publicidadesSnapshot = await db
          .collection("Publicidad")
          .where("userId", "==", userUid)
          .where("tipo", "==", tipo)
          .get();
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

        publicidadesData.sort((a, b) => a.fechaDeSubida - b.fechaDeSubida);

        const cantidadPublicidades = publicidadesData.length;
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
        setImagenesSalonOriginales(publicidadesData.map(() => null));
      } else {
        console.warn("El objeto user es nulo o no tiene la propiedad uid.");
      }
    } catch (error) {
      console.error("Error al obtener publicidades:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditarPublicidad = (index) => {
    setEditIndex(index);
    setOriginalTiemposSalon({ ...tiemposSalon[index] });
    setOriginalImagen(imagenesSalon[index]);
    setOriginalImageUrl(previewImages[index]);
  };

  const handleCancelarEdicion = () => {
    setEditIndex(null);
    setTiemposSalon((prevTiempos) => [
      ...prevTiempos.slice(0, editIndex),
      originalTiemposSalon,
      ...prevTiempos.slice(editIndex + 1),
    ]);
    setImagenesSalon((prevImages) => [
      ...prevImages.slice(0, editIndex),
      originalImagen,
      ...prevImages.slice(editIndex + 1),
    ]);
    setPreviewImages((prevPreviews) => [
      ...prevPreviews.slice(0, editIndex),
      originalImageUrl,
      ...prevPreviews.slice(editIndex + 1),
    ]);
  };

  const handleGuardarCambios = async (index) => {
    try {
      setIsLoading(true);
      setIsUploading(true);

      const nuevaImagen = imagenesSalon[index];
      const { horas, minutos, segundos } = tiemposSalon[index];

      const isEditingExistingPublicidad = index < publicidadesIds.length;
      const hasNewImage = nuevaImagen && nuevaImagen.name !== undefined;

      if (!isEditingExistingPublicidad && !hasNewImage) {
        console.warn("No se ha seleccionado una nueva imagen");
        return;
      }

      const hasValidData =
        horas > 0 &&
        minutos >= 0 &&
        minutos <= 59 &&
        segundos >= 0 &&
        segundos <= 59;

      if (!hasValidData) {
        console.warn("No hay datos válidos para actualizar");
        return;
      }

      const userUid = user.uid;
      const publicidadId = publicidadesIds[index];

      const publicidadRef = db.collection("Publicidad").doc(publicidadId);
      let imageUrl = previewImages[index];

      if (hasNewImage) {
        const imageRef = storage
          .ref()
          .child(`publicidad/salon_${index}_${Date.now()}_${nuevaImagen.name}`);

        const uploadTask = imageRef.put(nuevaImagen);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          },
          (error) => {
            console.error("Error durante la carga de la imagen:", error);
          },
          async () => {
            imageUrl = await imageRef.getDownloadURL();
            await publicidadRef.update({
              imageUrl,
              horas,
              minutos,
              segundos,
            });

            setEditIndex(null);
            setIsUploading(false);
          }
        );
      } else {
        await publicidadRef.update({
          horas,
          minutos,
          segundos,
        });

        setEditIndex(null);
        setIsUploading(false);
      }
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      setIsUploading(false);
    } finally {
      setIsLoading(false);
    }
  };

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
      setIsUploading(true);
      const storageRef = storage.ref();
      const userUid = user.uid;
      let hasValidData = false;
      let newIds = [];

      for (let index = 0; index < imagenesSalon.length; index++) {
        const imagen = imagenesSalon[index];

        if (imagen) {
          const imageRef = storageRef.child(
            `publicidad/salon_${index}_${Date.now()}_${imagen.name}`
          );
          await imageRef.put(imagen);
          const imageUrl = await imageRef.getDownloadURL();
          const { horas, minutos, segundos } = tiemposSalon[index];
          hasValidData = true;

          if (horas > 0 || minutos > 0 || segundos > 0) {
            const fechaDeSubida =
              firebase.firestore.FieldValue.serverTimestamp();

            const publicidadRef = await db.collection("Publicidad").add({
              imageUrl,
              horas,
              minutos,
              segundos,
              tipo: "directorio",
              userId: userUid,
              fechaDeSubida,
            });

            newIds = [...newIds, publicidadRef.id];

            setImagenesSalon((prevImages) => {
              const newImages = [...prevImages];
              newImages[index] = null;
              return newImages;
            });

            setTiemposSalon((prevTiempos) => [
              ...prevTiempos,
              { horas: 0, minutos: 0, segundos: 0 },
            ]);

            setPreviewImages((prevPreviews) => [...prevPreviews, null]);
          }
        }
      }

      if (hasValidData) {
        setPublicidadesIds((prevIds) => [...prevIds, ...newIds]);
      } else {
        console.warn("No valid data to add");
      }

      setImagenesSalon((prevImages) => [...prevImages, null]);
      setTiemposSalon((prevTiempos) => [
        ...prevTiempos,
        { horas: 0, minutos: 0, segundos: 0 },
      ]);
      setPreviewImages((prevPreviews) => [...prevPreviews, null]);
    } catch (error) {
      console.error("Error al agregar publicidad:", error);
    } finally {
      setIsUploading(false);
      setIsLoading(false);
    }
  };

  const handleEliminarPublicidad = async (publicidadId, index) => {
    try {
      const confirmacion = window.confirm(
        "¿Estás seguro de que quieres eliminar esta publicidad?"
      );
      setIsLoading(true);
      await db.collection("Publicidad").doc(publicidadId).delete();
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
    } finally {
      setIsLoading(false);
    }
  };

  const isValidData = (index) => {
    const hasImage = imagenesSalon[index] !== null;
    const isNewImageSelected =
      imagenesSalon[index] && imagenesSalon[index].name !== undefined;
    const { horas, minutos, segundos } = tiemposSalon[index];
    const isAdditionalField = index >= publicidadesIds.length;
    if (isAdditionalField) {
      return (
        isNewImageSelected &&
        (horas > 0 || minutos > 0 || segundos > 0) &&
        previewImages[index] !== null
      );
    }
    return (
      hasImage &&
      (horas > 0 || minutos > 0 || segundos > 0) &&
      previewImages[index] !== null
    );
  };

  const renderCamposImagenes = () => (
    <section>
      <div className="mb-8">
        {imagenesSalon.slice(0, 10).map((imagen, index) => (
          <div key={index} className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800">
              Directorio de Eventos - Imagen {index + 1}
            </h3>
            <div className="mt-4">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id={`imagenSalon-${index}`}
                onChange={(event) => handleImagenSelect(event, index)}
                disabled={
                  (editIndex !== null && editIndex !== index) ||
                  (editIndex === null && publicidadesIds[index])
                }
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
                className="mt-4"
                style={{ maxWidth: "200px", height: "auto" }}
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
                      disabled={
                        (editIndex !== null && editIndex !== index) ||
                        (editIndex === null && publicidadesIds[index])
                      }
                    />
                    <span className="text-gray-600 ml-1">{unit}</span>
                  </div>
                ))}
              </div>
            </div>
            {publicidadesIds[index] && (
              <div className="flex mt-4">
                {editIndex === null && (
                  <>
                    <button
                      onClick={() => handleEditarPublicidad(index)}
                      className="text-yellow-500 p-2 px-4 bg-white border border-yellow-500 rounded-full cursor-pointer hover:bg-yellow-100 hover:text-yellow-700 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() =>
                        handleEliminarPublicidad(publicidadesIds[index], index)
                      }
                      className="text-red-500 p-2 px-4 bg-white border border-red-500 rounded-full cursor-pointer hover:bg-red-100 hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  </>
                )}
                {editIndex === index && (
                  <>
                    <button
                      onClick={() => handleCancelarEdicion()}
                      className="text-gray-500 p-2 px-4 bg-white border border-gray-500 rounded-full cursor-pointer hover:bg-gray-100 hover:text-gray-700 mr-4"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleGuardarCambios(index)}
                      className="text-green-500 p-2 px-4 bg-white border border-green-500 rounded-full cursor-pointer hover:bg-green-100 hover:text-green-700"
                    >
                      Guardar Cambios
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <section className="md:mt-3 ">
      <div>
        {successMessage && (
          <div className="bg-green-500 text-white p-2 mb-4 rounded-md">
            {successMessage}
          </div>
        )}
        <div className="mb-8" style={{ cursor: isUploading ? "wait" : "auto" }}>
          {renderCamposImagenes()}
          {isUploading}
          {imagenesSalon.length < 11 && (
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
                Guardar Publicidad
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default PublicidadDirec;
