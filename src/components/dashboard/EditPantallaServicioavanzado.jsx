import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { collection, addDoc } from "firebase/firestore";
import db from "@/firebase/firestore";
import auth from "@/firebase/auth";
import Swal from "sweetalert2";

const guardarConfiguracionAvanzada = async (config, empresa) => {
  try {
    const user = auth.currentUser;
    if (user) {
      if (!empresa) {
        throw new Error("El campo empresa no está definido.");
      }
      const templateServiciosAvanzadoRef = collection(
        db,
        "TemplateServiciosAvanzado"
      );

      await addDoc(templateServiciosAvanzadoRef, {
        ...config,
        userId: user.uid,
        userEmail: user.email,
        empresa: empresa, // Usar el argumento de empresa
      });

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

const SectionDetails = ({ selectedScreenName, selectedSection }) => {
  const [date, setDate] = useState(null);
  const [image, setImage] = useState(null);
  const [visualizationTime, setVisualizationTime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const handleDateChange = (date) => {
    setDate(date);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    setVisualizationTime((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = () => {
    const user = auth.currentUser;
    if (user) {
      const config = {
        selectedScreenName: selectedScreenName.label,
        selectedSection: selectedSection.label,
        date,
        image,
        visualizationTime,
      };

      // Pasar empresa desde el estado de EditPantallaServicio
      guardarConfiguracionAvanzada(config, empresa);
    } else {
      console.error("Usuario no autenticado");
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold text-white capitalize mb-4">
        {`Detalles de ${selectedSection.label} para ${selectedScreenName.label}`}
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col">
          <label className="text-white text-lg mb-2">Fecha</label>
          <DatePicker
            selected={date}
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-white text-lg mb-2">Subir imagen</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
          />
          {image && (
            <img src={image} alt="Selected" className="mt-2 rounded-md" />
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-white text-lg mb-2">
            Tiempo de visualización
          </label>
          <input
            type="number"
            name="hours"
            value={visualizationTime.hours}
            onChange={handleTimeChange}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
            placeholder="Horas"
          />
          <input
            type="number"
            name="minutes"
            value={visualizationTime.minutes}
            onChange={handleTimeChange}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
            placeholder="Minutos"
          />
          <input
            type="number"
            name="seconds"
            value={visualizationTime.seconds}
            onChange={handleTimeChange}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
            placeholder="Segundos"
          />
        </div>
      </div>
      <button
        onClick={handleSave}
        className="mt-4 px-6 py-2 bg-pink-500 text-white rounded-md"
      >
        Guardar Configuración Avanzada
      </button>
    </div>
  );
};

export default SectionDetails;
