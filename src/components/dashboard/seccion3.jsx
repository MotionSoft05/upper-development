import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Seccion3 = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [time, setTime] = useState({ hours: "", minutes: "", seconds: "" });
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    setTime((prevTime) => ({
      ...prevTime,
      [name]: value,
    }));
  };

  return (
    <div>
      <h2>Hola, estoy en la sección 3</h2>
      <div className="mb-6 flex flex-col">
        <label className="text-white block mb-0.5">Seleccione la Imagen</label>
        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          onChange={handleFileChange}
          className="bg-gray-700 text-white py-2 px-3 border rounded-lg w-full"
        />
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Vista previa"
            className="mt-2 rounded-lg"
            style={{ maxWidth: "150px", maxHeight: "150px" }}
          />
        )}
      </div>
      <div className="mb-6 flex flex-col">
        <label className="text-white block mb-0.5">Seleccione la Fecha</label>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          className="bg-gray-700 text-white py-2 px-3 border rounded-lg w-full"
        />
      </div>
      <div className="mb-6 flex flex-col">
        <label className="text-white block mb-0.5">
          Tiempo de visualización (HH:MM:SS)
        </label>
        <div className="flex">
          <input
            type="number"
            name="hours"
            min="0"
            value={time.hours}
            onChange={handleTimeChange}
            className="bg-gray-700 text-white py-2 px-3 border rounded-l-lg w-full mr-1"
          />
          <input
            type="number"
            name="minutes"
            min="0"
            max="59"
            value={time.minutes}
            onChange={handleTimeChange}
            className="bg-gray-700 text-white py-2 px-3 border w-full mr-1"
          />
          <input
            type="number"
            name="seconds"
            min="0"
            max="59"
            value={time.seconds}
            onChange={handleTimeChange}
            className="bg-gray-700 text-white py-2 px-3 border rounded-r-lg w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Seccion3;
