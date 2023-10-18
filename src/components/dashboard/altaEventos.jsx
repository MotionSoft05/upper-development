import React, { useState } from "react";
import Datepicker from "react-tailwindcss-datepicker";
import "keen-slider/keen-slider.min.css";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCzD--npY_6fZcXH-8CzBV7UGzPBqg85y8",
  authDomain: "upper-a544e.firebaseapp.com",
  projectId: "upper-a544e",
  storageBucket: "upper-a544e.appspot.com",
  messagingSenderId: "665713417470",
  appId: "1:665713417470:web:73f7fb8ee518bea35999af",
  measurementId: "G-QTFQ55YY5D",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

function AltaEventos() {
  const [value, setValue] = useState({
    startDate: new Date(),
    endDate: new Date().setMonth(11),
  });
  const [alertaEnviada, setAlertaEnviada] = useState(false);
  const [images, setImages] = useState([]);

  const handleImageUpload = async (e) => {
    const files = e.target.files;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imageRef = ref(storage, `imagenes/${file.name}`);

      try {
        await uploadBytes(imageRef, file);
        const imageUrl = await getDownloadURL(imageRef);

        setImages((prevImages) => [...prevImages, imageUrl]);
      } catch (error) {
        console.error("Error al subir imagen:", error);
      }
    }
  };

  const deleteImage = (index) => {
    setImages((prevImages) => {
      const updatedImages = [...prevImages];
      updatedImages.splice(index, 1);
      return updatedImages;
    });
  };

  const handleValueChange = (newValue) => {
    setValue(newValue);
  };

  const [repeatingDays, setRepeatingDays] = useState({
    Lunes: false,
    Martes: false,
    Miércoles: false,
    Jueves: false,
    Viernes: false,
    Sábado: false,
    Domingo: false,
  });

  const handleRepeatingDayChange = (day) => {
    setRepeatingDays({
      ...repeatingDays,
      [day]: !repeatingDays[day],
    });
  };

  const enviarDatosAFirebase = () => {
    event.preventDefault();
    const nombreEvento = document.getElementById("floating_name").value;
    const tipoEvento = document.getElementById("floating_event").value;
    const lugar = document.getElementById("floating_floor").value;
    const horaInicialReal = `${
      document.getElementById("hourSelectorInicio").value
    }:${document.getElementById("minuteSelectorInicio").value}`;
    const horaFinalReal = `${
      document.getElementById("hourSelectorFinal").value
    }:${document.getElementById("minuteSelectorFinal").value}`;
    const horaInicialSalon = `${
      document.getElementById("hourSelectorInicioSalon").value
    }:${document.getElementById("minuteSelectorInicioSalon").value}`;
    const horaFinalSalon = `${
      document.getElementById("hourSelectorFinalSalon").value
    }:${document.getElementById("minuteSelectorFinalSalon").value}`;

    const fechaInicio = new Date(value.startDate);
    fechaInicio.setHours(
      horaInicialReal.split(":")[0],
      horaInicialReal.split(":")[1]
    );
    const fechaFinal = new Date(value.endDate);
    fechaFinal.setHours(
      horaFinalReal.split(":")[0],
      horaFinalReal.split(":")[1]
    );
    const formattedFechaInicio = fechaInicio.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const formattedFechaFinal = fechaFinal.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const diasSeleccionados = Object.keys(repeatingDays).filter(
      (day) => repeatingDays[day]
    );
    const devices = selectedDevices;
    setImages([]);

    const eventoData = {
      nombreEvento,
      tipoEvento,
      lugar,
      horaInicialReal,
      horaFinalReal,
      horaInicialSalon,
      horaFinalSalon,
      fechaInicio: formattedFechaInicio,
      fechaFinal: formattedFechaFinal,
      diasSeleccionados,
      images,
      devices,
    };

    firebase
      .firestore()
      .collection("eventos")
      .add(eventoData)
      .then((docRef) => {
        document.getElementById("floating_name").value = "";
        document.getElementById("floating_event").value = "";
        document.getElementById("floating_floor").value = "";
        document.getElementById("hourSelectorInicio").value = "00";
        document.getElementById("minuteSelectorInicio").value = "00";
        document.getElementById("hourSelectorFinal").value = "00";
        document.getElementById("minuteSelectorFinal").value = "00";
        document.getElementById("hourSelectorInicioSalon").value = "00";
        document.getElementById("minuteSelectorInicioSalon").value = "00";
        document.getElementById("hourSelectorFinalSalon").value = "00";
        document.getElementById("minuteSelectorFinalSalon").value = "00";
        setValue({
          startDate: new Date(),
          endDate: new Date().setMonth(11),
        });
        setRepeatingDays({
          Lunes: false,
          Martes: false,
          Miércoles: false,
          Jueves: false,
          Viernes: false,
          Sábado: false,
          Domingo: false,
        });
        setAlertaEnviada(true);
        setSelectedDevices([]);
        setSelectedImages([]);
        setImages([]);
        resetForm();

        setTimeout(() => {
          setAlertaEnviada(false);
        }, 6000);
      })
      .catch((error) => {
        console.error("Error al enviar datos a Firebase:", error);
      });
  };
  const [] = useKeenSlider();

  const [selectedDevices, setSelectedDevices] = useState([]);
  const deviceOptions = [
    "Dispositivo 1",
    "Dispositivo 2",
    "Dispositivo 3",
    "Dispositivo 4",
    "Dispositivo 5",
    "Dispositivo 6",
    "Dispositivo 7",
  ];

  const handleDeviceChange = (e) => {
    const selectedDevice = e.target.value;
    setSelectedDevices((prevDevices) => {
      if (prevDevices.includes(selectedDevice)) {
        return prevDevices.filter((device) => device !== selectedDevice);
      } else {
        return [...prevDevices, selectedDevice];
      }
    });
  };

  return (
    <section className="px-16 md:px-32">
      <div>
        <div className="p-5">
          <h1 className="mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl">
            Alta de eventos
          </h1>
        </div>
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-300 p-4">
            <form>
              <div className="relative z-0 w-full mb-6 group">
                <input
                  type="text"
                  name="floating_name"
                  id="floating_name"
                  className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2  appearance-none  border-gray-600  focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  placeholder=" "
                  required
                />
                <label
                  for="floating_name"
                  className="peer-focus:font-medium absolute text-sm text-gray-500  duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600  peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  Nombre del evento
                </label>
              </div>
              <div className="relative z-0 w-full mb-6 group">
                <input
                  type="text"
                  name="floating_event"
                  id="floating_event"
                  className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2  appearance-none  border-gray-600  focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  placeholder=" "
                  required
                />
                <label
                  for="floating_event"
                  className="peer-focus:font-medium absolute text-sm text-gray-500  duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600  peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  Tipo de evento
                </label>
              </div>
              <div className="relative z-0 w-full mb-6 group">
                <input
                  type="text"
                  name="floating_floor"
                  id="floating_floor"
                  className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2  appearance-none  border-gray-600  focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  placeholder=" "
                  required
                />
                <label
                  for="floating_floor"
                  className="peer-focus:font-medium absolute text-sm text-gray-500  duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600  peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  Lugar
                </label>
              </div>
              <div className="bg-gray-300 p-4">
                <h4 className="mb-4 text-2xl leading-none tracking-tight text-gray-900 ">
                  Seleccione la fecha:
                </h4>
                <Datepicker
                  useRange={false}
                  value={value}
                  onChange={handleValueChange}
                />
                <div className="mb-4"></div>{" "}
                <h4 className="mb-4 text-2xl leading-none tracking-tight text-gray-900 ">
                  Seleccione los días:
                </h4>
                <div className="grid grid-cols-4 gap-4">
                  {Object.keys(repeatingDays).map((day, index) => (
                    <div key={index} className="text-center">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-blue-500 form-checkbox focus:ring-blue-500"
                        checked={repeatingDays[day]}
                        onChange={() => handleRepeatingDayChange(day)}
                      />
                      <label className="block text-xs text-gray-700">
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="mb-4"></div>{" "}
                <h4 className="mb-4 text-2xl leading-none tracking-tight text-gray-900 ">
                  Seleccione las horas:
                </h4>
                <div className="bg-white p-3 sm:p-4 mb-3 sm:mb-4 rounded-lg shadow-md">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="relative mb-2 sm:mb-0">
                      <div className="text-gray-600 font-medium text-xs sm:text-sm">
                        Hora inicial real:
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="relative">
                          <div className="text-gray-600 font-medium text-xs sm:text-sm">
                            Horas:
                          </div>
                          <select
                            className="block appearance-none w-14 sm:w-16 border border-gray-300 text-gray-700 py-1 sm:py-2 px-1 sm:px-2 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-xs sm:text-sm"
                            id="hourSelectorInicio"
                          >
                            {Array.from({ length: 24 }, (_, i) => (
                              <option
                                key={i}
                                value={i.toString().padStart(2, "0")}
                              >
                                {i.toString().padStart(2, "0")}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="relative">
                          <div className="text-gray-600 font-medium text-xs sm:text-sm">
                            Minutos:
                          </div>
                          <select
                            className="block appearance-none w-14 sm:w-16 border border-gray-300 text-gray-700 py-1 sm:py-2 px-1 sm:px-2 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-xs sm:text-sm"
                            id="minuteSelectorInicio"
                          >
                            {Array.from({ length: 60 }, (_, i) => (
                              <option
                                key={i}
                                value={i.toString().padStart(2, "0")}
                              >
                                {i.toString().padStart(2, "0")}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="text-gray-600 font-medium text-xs sm:text-sm">
                        Hora final real:
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="relative">
                          <div className="text-gray-600 font-medium text-xs sm:text-sm">
                            Horas:
                          </div>
                          <select
                            className="block appearance-none w-14 sm:w-16 border border-gray-300 text-gray-700 py-1 sm:py-2 px-1 sm:px-2 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-xs sm:text-sm"
                            id="hourSelectorFinal"
                          >
                            {Array.from({ length: 24 }, (_, i) => (
                              <option
                                key={i}
                                value={i.toString().padStart(2, "0")}
                              >
                                {i.toString().padStart(2, "0")}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="relative">
                          <div className="text-gray-600 font-medium text-xs sm:text-sm">
                            Minutos:
                          </div>
                          <select
                            className="block appearance-none w-14 sm:w-16 border border-gray-300 text-gray-700 py-1 sm:py-2 px-1 sm:px-2 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-xs sm:text-sm"
                            id="minuteSelectorFinal"
                          >
                            {Array.from({ length: 60 }, (_, i) => (
                              <option
                                key={i}
                                value={i.toString().padStart(2, "0")}
                              >
                                {i.toString().padStart(2, "0")}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-3 sm:p-4 mb-3 sm:mb-4 rounded-lg shadow-md">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="relative mb-2 sm:mb-0">
                      <div className="text-gray-600 font-medium text-xs sm:text-sm">
                        Hora inicial salón:
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="relative">
                          <div className="text-gray-600 font-medium text-xs sm:text-sm">
                            Horas:
                          </div>
                          <select
                            className="block appearance-none w-14 sm:w-16 border border-gray-300 text-gray-700 py-1 sm:py-2 px-1 sm:px-2 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-xs sm:text-sm"
                            id="hourSelectorInicioSalon"
                          >
                            {Array.from({ length: 24 }, (_, i) => (
                              <option
                                key={i}
                                value={i.toString().padStart(2, "0")}
                              >
                                {i.toString().padStart(2, "0")}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="relative">
                          <div className="text-gray-600 font-medium text-xs sm:text-sm">
                            Minutos:
                          </div>
                          <select
                            className="block appearance-none w-14 sm:w-16 border border-gray-300 text-gray-700 py-1 sm:py-2 px-1 sm:px-2 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-xs sm:text-sm"
                            id="minuteSelectorInicioSalon"
                          >
                            {Array.from({ length: 60 }, (_, i) => (
                              <option
                                key={i}
                                value={i.toString().padStart(2, "0")}
                              >
                                {i.toString().padStart(2, "0")}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="text-gray-600 font-medium text-xs sm:text-sm">
                        Hora final salón:
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="relative">
                          <div className="text-gray-600 font-medium text-xs sm:text-sm">
                            Horas:
                          </div>
                          <select
                            className="block appearance-none w-14 sm:w-16 border border-gray-300 text-gray-700 py-1 sm:py-2 px-1 sm:px-2 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-xs sm:text-sm"
                            id="hourSelectorFinalSalon"
                          >
                            {Array.from({ length: 24 }, (_, i) => (
                              <option
                                key={i}
                                value={i.toString().padStart(2, "0")}
                              >
                                {i.toString().padStart(2, "0")}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="relative">
                          <div className="text-gray-600 font-medium text-xs sm:text-sm">
                            {" "}
                            Minutos:
                          </div>
                          <select
                            className="block appearance-none w-14 sm:w-16 border border-gray-300 text-gray-700 py-1 sm:py-2 px-1 sm:px-2 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-xs sm:text-sm"
                            id="minuteSelectorFinalSalon"
                          >
                            {Array.from({ length: 60 }, (_, i) => (
                              <option
                                key={i}
                                value={i.toString().padStart(2, "0")}
                              >
                                {i.toString().padStart(2, "0")}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={enviarDatosAFirebase}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4"
                >
                  Enviar
                </button>
                {alertaEnviada && (
                  <div className="mt-4 text-green-500">
                    Los datos se enviaron correctamente.
                  </div>
                )}
              </div>
            </form>
          </div>
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-gray-300 p-4 col-span-2">
              <div className="mb-4">
                <h4 className="mb-4 text-2xl leading-none tracking-tight text-gray-900">
                  Subir Imágenes:
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="col-span-1">
                      <label
                        htmlFor={`imageUpload${index}`}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded cursor-pointer"
                      >
                        +
                      </label>
                      <input
                        id={`imageUpload${index}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      {images[index] && (
                        <button
                          onClick={() => deleteImage(index)}
                          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mt-2"
                        >
                          x
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {images.map((imageUrl, index) => (
                    <div
                      key={index}
                      className="w-40 h-40 flex items-center justify-center"
                    >
                      <img
                        src={imageUrl}
                        alt={`Imagen ${index + 1}`}
                        className="max-w-full max-h-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-gray-300 p-4 col-span-2">
              {" "}
              <div className="mb-4">
                <h4 className="mb-2 text-2xl leading-none tracking-tight text-gray-900">
                  Seleccionar Dispositivos:
                </h4>
                <div className="mb-4">
                  {deviceOptions.map((device, index) => (
                    <label key={index} className="block mb-2">
                      <input
                        type="checkbox"
                        value={device}
                        checked={selectedDevices.includes(device)}
                        onChange={handleDeviceChange}
                        className="mr-2"
                      />
                      {device}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-gray-300 p-4 col-span-2">
              {" "}
              <h4 className="mb-2 text-2xl leading-none tracking-tight text-gray-900">
                Se muestra en:
              </h4>
              <ul>
                {selectedDevices.map((device, index) => (
                  <li key={index}>{device}</li>
                ))}
              </ul>
            </div>
          </section>
        </section>
      </div>
    </section>
  );
}

export default AltaEventos;
