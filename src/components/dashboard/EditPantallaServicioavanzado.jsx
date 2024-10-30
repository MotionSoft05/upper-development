import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import db from "@/firebase/firestore";
import auth from "@/firebase/auth";
import Swal from "sweetalert2";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const guardarConfiguracionAvanzada = async (
  config,
  lugar,
  docId,
  imageFile
) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const usersRef = collection(db, "usuarios");
      const userDoc = doc(usersRef, user.uid);
      const userSnapshot = await getDoc(userDoc);

      if (!userSnapshot.exists()) {
        throw new Error("No se encontró la información del usuario.");
      }

      const userData = userSnapshot.data();
      const empresa = userData.empresa;

      if (!empresa) {
        throw new Error("El campo empresa no está definido.");
      }

      const templateServiciosAvanzadoRef = collection(
        db,
        "TemplateServiciosAvanzado"
      );

      let imageUrl = config.image;
      if (imageFile) {
        imageUrl = await uploadImageToStorage(
          imageFile,
          user.uid,
          docId || "new"
        );
      }

      const formatDate = (date) => {
        if (date instanceof Date) {
          return date.toISOString().split("T")[0]; // Esto dará el formato "YYYY-MM-DD"
        }
        return null;
      };

      // Prepare the data to be saved
      const dataToSave = {
        ...config,
        userId: user.uid,
        userEmail: user.email,
        empresa: empresa,
        lugar: lugar,
        startDate: formatDate(config.startDate),
        endDate: formatDate(config.endDate),
        visualizationTime: {
          hours: parseInt(config.visualizationTime.hours) || 0,
          minutes: parseInt(config.visualizationTime.minutes) || 0,
          seconds: parseInt(config.visualizationTime.seconds) || 0,
        },
        image: imageUrl,
      };

      // Remove undefined values and the imageFile property
      Object.keys(dataToSave).forEach((key) => {
        if (dataToSave[key] === undefined) {
          delete dataToSave[key];
        }
      });
      delete dataToSave.imageFile;

      if (docId) {
        const docRef = doc(templateServiciosAvanzadoRef, docId);
        await updateDoc(docRef, dataToSave);
        return docId;
      } else {
        const docRef = await addDoc(templateServiciosAvanzadoRef, dataToSave);
        return docRef.id; // Return the new document ID
      }
    }
  } catch (error) {
    console.error("Error al guardar datos avanzados de configuración:", error);
    Swal.fire({
      icon: "error",
      title: "Error al guardar configuración avanzada",
      text: error.message,
    });
    return false; // Indica que hubo un error al guardar
  }
};

const uploadImageToStorage = async (imageFile, userId, configId) => {
  if (!imageFile) return null;

  const storage = getStorage();
  const imageRef = ref(
    storage,
    `configurations/${userId}/${configId}/${imageFile.name}`
  );

  try {
    const snapshot = await uploadBytes(imageRef, imageFile);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

const cargarConfiguraciones = async (selectedScreenName, selectedSection) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const templateServiciosAvanzadoRef = collection(
        db,
        "TemplateServiciosAvanzado"
      );
      const q = query(
        templateServiciosAvanzadoRef,
        where("userId", "==", user.uid),
        where("selectedScreenName", "==", selectedScreenName.label),
        where("selectedSection", "==", selectedSection.label)
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return [
          {
            startDate: null,
            endDate: null,
            image: null,
            visualizationTime: { hours: 0, minutes: 0, seconds: 10 },
            docId: null,
          },
        ];
      } else {
        return querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            startDate: data.startDate ? data.startDate : null,
            endDate: data.endDate ? data.endDate : null,
            visualizationTime: data.visualizationTime || {
              hours: 0,
              minutes: 0,
              seconds: 10,
            },
            docId: doc.id,
          };
        });
      }
    }
    return []; // Retorna un array vacío si no hay usuario autenticado
  } catch (error) {
    console.error("Error al cargar configuraciones avanzadas:", error);
    return []; // Retorna un array vacío en caso de error
  }
};

const SectionDetails = ({ selectedScreenName, selectedSection }) => {
  const [configurations, setConfigurations] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);

  useEffect(() => {
    const loadConfigurations = async () => {
      const loadedConfigs = await cargarConfiguraciones(
        selectedScreenName,
        selectedSection
      );

      // Mapea y formatea las fechas de inicio y finalización
      const formattedConfigs = loadedConfigs.map((config) => ({
        ...config,
        startDate: config.startDate ? new Date(config.startDate) : null,
        endDate: config.endDate ? new Date(config.endDate) : null,
      }));

      // Si el número de configuraciones es menor a 3, agrega una vacía
      if (formattedConfigs.length < 3) {
        formattedConfigs.push({
          startDate: null,
          endDate: null,
          image: null,
          imageFile: null,
          visualizationTime: { hours: 0, minutes: 0, seconds: 10 },
          docId: null,
        });
      }

      setConfigurations(formattedConfigs);
    };

    loadConfigurations();
  }, [selectedScreenName, selectedSection]);

  const handleStartDateChange = (index, date) => {
    const newConfigurations = [...configurations];
    newConfigurations[index].startDate = date;
    setConfigurations(newConfigurations);
  };

  const handleEndDateChange = (index, date) => {
    const newConfigurations = [...configurations];
    newConfigurations[index].endDate = date;
    setConfigurations(newConfigurations);
  };

  const handleImageChange = (index, e) => {
    if (e.target.files && e.target.files[0]) {
      const newConfigurations = [...configurations];
      newConfigurations[index].imageFile = e.target.files[0];
      newConfigurations[index].image = URL.createObjectURL(e.target.files[0]);
      setConfigurations(newConfigurations);
    }
  };

  const handleTimeChange = (index, e) => {
    const { name, value } = e.target;
    const newConfigurations = [...configurations];
    newConfigurations[index].visualizationTime[name] = parseInt(value, 10);
    setConfigurations(newConfigurations);
  };

  const handleSave = async (index) => {
    const user = auth.currentUser;
    if (user) {
      const config = configurations[index];

      if (
        !config.startDate ||
        !config.endDate ||
        (!config.image && !config.imageFile)
      ) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Por favor, asegúrese de establecer la fecha de inicio, la fecha final y subir una imagen antes de guardar los cambios.",
        });
        return;
      }

      const lugar = ["a", "b", "c"][index];

      const saveResult = await guardarConfiguracionAvanzada(
        {
          selectedScreenName: selectedScreenName.label,
          selectedSection: selectedSection.label,
          ...config,
        },
        lugar,
        config.docId,
        config.imageFile
      );

      if (saveResult) {
        await Swal.fire({
          icon: "success",
          title: "Configuración avanzada guardada con éxito",
          showConfirmButton: false,
          timer: 2000,
        });

        // Update the configuration with the new docId if it's a new configuration
        const updatedConfigurations = [...configurations];
        if (typeof saveResult === "string") {
          updatedConfigurations[index] = {
            ...config,
            docId: saveResult,
            imageFile: null, // Clear the imageFile after successful upload
          };
        } else {
          updatedConfigurations[index] = {
            ...config,
            imageFile: null, // Clear the imageFile after successful upload
          };
        }
        setConfigurations(updatedConfigurations);

        setEditingIndex(-1);

        if (index === configurations.length - 1 && configurations.length < 3) {
          setConfigurations([
            ...updatedConfigurations,
            {
              startDate: null,
              endDate: null,
              image: null,
              imageFile: null,
              visualizationTime: { hours: 0, minutes: 0, seconds: 10 },
              docId: null,
            },
          ]);
        }
      }
    } else {
      console.error("Usuario no autenticado");
    }
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
  };

  const handleDelete = async (index) => {
    const user = auth.currentUser;
    if (user) {
      const config = configurations[index];
      if (config.docId) {
        try {
          const docRef = doc(db, "TemplateServiciosAvanzado", config.docId);
          await deleteDoc(docRef);

          const newConfigurations = configurations.filter(
            (_, i) => i !== index
          );
          setConfigurations(newConfigurations);

          Swal.fire({
            icon: "success",
            title: "Configuración eliminada con éxito",
            showConfirmButton: false,
            timer: 2000,
          });
        } catch (error) {
          console.error("Error al eliminar la configuración:", error);
          Swal.fire({
            icon: "error",
            title: "Error al eliminar la configuración",
            text: error.message,
          });
        }
      }
    } else {
      console.error("Usuario no autenticado");
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold text-white capitalize mb-4">
        {`Detalles de ${selectedSection.label} para ${selectedScreenName.label}`}
      </h2>
      {configurations.map((config, index) => (
        <div key={index} className="mb-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col">
              <label className="text-white text-lg mb-2">Fecha de inicio</label>
              <DatePicker
                selected={config.startDate}
                onChange={(date) => handleStartDateChange(index, date)}
                dateFormat="yyyy-MM-dd"
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
                disabled={config.docId && editingIndex !== index}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-white text-lg mb-2">Fecha final</label>
              <DatePicker
                selected={config.endDate}
                onChange={(date) => handleEndDateChange(index, date)}
                dateFormat="yyyy-MM-dd"
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
                disabled={config.docId && editingIndex !== index}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-white text-lg mb-2">Subir imagen</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(index, e)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
                disabled={config.docId && editingIndex !== index}
              />
              {config.image && (
                <img
                  src={config.image}
                  alt="Selected"
                  className="mt-2 rounded-md"
                />
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-white text-lg mb-2">
                Tiempo de visualización
              </label>
              <input
                type="number"
                name="hours"
                value={config.visualizationTime.hours}
                onChange={(e) => handleTimeChange(index, e)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-md mb-2"
                placeholder="Horas"
                disabled={config.docId && editingIndex !== index}
              />
              <input
                type="number"
                name="minutes"
                value={config.visualizationTime.minutes}
                onChange={(e) => handleTimeChange(index, e)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-md mb-2"
                placeholder="Minutos"
                disabled={config.docId && editingIndex !== index}
              />
              <input
                type="number"
                name="seconds"
                value={config.visualizationTime.seconds}
                onChange={(e) => handleTimeChange(index, e)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
                placeholder="Segundos"
                disabled={config.docId && editingIndex !== index}
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            {!config.docId || editingIndex === index ? (
              <button
                onClick={() => handleSave(index)}
                className="mx-2 px-4 py-2 bg-green-500 text-white rounded-md"
              >
                Guardar Cambios
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleEdit(index)}
                  className="mx-2 px-4 py-2 bg-blue-500 text-white rounded-md"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="mx-2 px-4 py-2 bg-red-500 text-white rounded-md"
                >
                  Eliminar
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SectionDetails;
