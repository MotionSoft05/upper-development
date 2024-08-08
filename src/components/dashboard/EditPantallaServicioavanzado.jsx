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
} from "firebase/firestore";
import db from "@/firebase/firestore";
import auth from "@/firebase/auth";
import Swal from "sweetalert2";

const guardarConfiguracionAvanzada = async (config, lugar, docId) => {
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

      if (docId) {
        const docRef = doc(templateServiciosAvanzadoRef, docId);
        await updateDoc(docRef, {
          ...config,
          userId: user.uid,
          userEmail: user.email,
          empresa: empresa,
          lugar: lugar,
        });
      } else {
        await addDoc(templateServiciosAvanzadoRef, {
          ...config,
          userId: user.uid,
          userEmail: user.email,
          empresa: empresa,
          lugar: lugar,
        });
      }

      Swal.fire({
        icon: "success",
        title: "Configuración avanzada guardada con éxito",
        showConfirmButton: false,
        timer: 2000,
      });
    }
  } catch (error) {
    console.error("Error al guardar datos avanzados de configuración:", error);
    Swal.fire({
      icon: "error",
      title: "Error al guardar configuración avanzada",
      text: error.message,
    });
  }
};

const cargarConfiguraciones = async (
  selectedScreenName,
  selectedSection,
  setConfigurations
) => {
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
        setConfigurations([
          {
            startDate: null,
            endDate: null,
            image: null,
            visualizationTime: { hours: 0, minutes: 0, seconds: 0 },
            docId: null,
          },
        ]);
      } else {
        const configurations = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            startDate: data.startDate
              ? new Date(data.startDate.seconds * 1000)
              : null,
            endDate: data.endDate
              ? new Date(data.endDate.seconds * 1000)
              : null,
            docId: doc.id,
          };
        });
        setConfigurations(configurations);
      }
    }
  } catch (error) {
    console.error("Error al cargar configuraciones avanzadas:", error);
  }
};

const SectionDetails = ({ selectedScreenName, selectedSection }) => {
  const [configurations, setConfigurations] = useState([
    {
      startDate: null,
      endDate: null,
      image: null,
      visualizationTime: { hours: 0, minutes: 0, seconds: 0 },
      docId: null,
    },
  ]);
  const [configCount, setConfigCount] = useState(1);

  useEffect(() => {
    cargarConfiguraciones(
      selectedScreenName,
      selectedSection,
      setConfigurations
    );
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
      newConfigurations[index].image = URL.createObjectURL(e.target.files[0]);
      setConfigurations(newConfigurations);
    }
  };

  const handleTimeChange = (index, e) => {
    const { name, value } = e.target;
    const newConfigurations = [...configurations];
    newConfigurations[index].visualizationTime[name] = value;
    setConfigurations(newConfigurations);
  };

  const handleSave = (index) => {
    const user = auth.currentUser;
    if (user) {
      const config = configurations[index];
      const lugar = ["a", "b", "c"][index];

      guardarConfiguracionAvanzada(
        {
          selectedScreenName: selectedScreenName.label,
          selectedSection: selectedSection.label,
          ...config,
        },
        lugar,
        config.docId
      );

      if (index === configurations.length - 1 && configurations.length < 3) {
        setConfigCount(configCount + 1);
        setConfigurations([
          ...configurations,
          {
            startDate: null,
            endDate: null,
            image: null,
            visualizationTime: { hours: 0, minutes: 0, seconds: 0 },
            docId: null,
          },
        ]);
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
                dateFormat="dd/MM/yyyy"
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-white text-lg mb-2">Fecha final</label>
              <DatePicker
                selected={config.endDate}
                onChange={(date) => handleEndDateChange(index, date)}
                dateFormat="dd/MM/yyyy"
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-white text-lg mb-2">Subir imagen</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(index, e)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
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
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
                placeholder="Horas"
              />
              <input
                type="number"
                name="minutes"
                value={config.visualizationTime.minutes}
                onChange={(e) => handleTimeChange(index, e)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
                placeholder="Minutos"
              />
              <input
                type="number"
                name="seconds"
                value={config.visualizationTime.seconds}
                onChange={(e) => handleTimeChange(index, e)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
                placeholder="Segundos"
              />
            </div>
          </div>
          <button
            onClick={() => handleSave(index)}
            className="mt-4 px-6 py-2 bg-pink-500 text-white rounded-md"
            disabled={index < configCount - 1}
          >
            {configCount > 3 && index === 2
              ? "Configuración Completa"
              : "Guardar Configuración Avanzada"}
          </button>
        </div>
      ))}
    </div>
  );
};

export default SectionDetails;
