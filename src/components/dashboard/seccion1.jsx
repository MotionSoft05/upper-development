import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Seccion1 = () => {
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
    <div className="p-6 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl text-white mb-6">Hola, estoy en la sección 1</h2>
      <div className="mb-6">
        <label className="text-white block mb-2">
          Seleccione la Issssmagen
        </label>
        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          onChange={handleFileChange}
          className="bg-gray-700 text-white py-2 px-3 border border-gray-600 rounded-lg w-full"
        />
        {imagePreview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imagePreview}
            alt="Vista previa"
            className="mt-4 rounded-lg border border-gray-600"
            style={{ maxWidth: "150px", maxHeight: "150px" }}
          />
        )}
      </div>
      <div className="mb-6">
        <label className="text-white block mb-2">Seleccione la Fecha</label>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          className="bg-gray-700 text-white py-2 px-3 border border-gray-600 rounded-lg w-full"
        />
      </div>
      <div className="mb-6">
        <label className="text-white block mb-2">
          Tiempo de visualización (HH:MM:SS)
        </label>
        <div className="flex space-x-2">
          <input
            type="number"
            name="hours"
            min="0"
            value={time.hours}
            onChange={handleTimeChange}
            className="bg-gray-700 text-white py-2 px-3 border border-gray-600 rounded-lg w-full"
            placeholder="HH"
          />
          <input
            type="number"
            name="minutes"
            min="0"
            max="59"
            value={time.minutes}
            onChange={handleTimeChange}
            className="bg-gray-700 text-white py-2 px-3 border border-gray-600 rounded-lg w-full"
            placeholder="MM"
          />
          <input
            type="number"
            name="seconds"
            min="0"
            max="59"
            value={time.seconds}
            onChange={handleTimeChange}
            className="bg-gray-700 text-white py-2 px-3 border border-gray-600 rounded-lg w-full"
            placeholder="SS"
          />
        </div>
      </div>
    </div>
  );
};

export default Seccion1;
