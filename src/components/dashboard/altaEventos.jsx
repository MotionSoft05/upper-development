import React, { useState, useContext, useEffect } from "react";
import Datepicker from "react-tailwindcss-datepicker";
import "keen-slider/keen-slider.min.css";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, currentUser, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  doc,
  getFirestore,
  getDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAiP1248hBEZt3iS2H4UVVjdf_xbuJHD3k",
  authDomain: "upper-8c817.firebaseapp.com",
  projectId: "upper-8c817",
  storageBucket: "upper-8c817.appspot.com",
  messagingSenderId: "798455798906",
  appId: "1:798455798906:web:f58a3e51b42eebb6436fc3",
  measurementId: "G-6VHX927GH1",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);
const db = getFirestore(app);

function AltaEventos() {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [nombrePantallas, setNombrePantallas] = useState([]);
  const [nombrePantallasDirectorio, setNombrePantallasDirectorio] = useState(
    []
  );
  const [value, setValue] = useState({
    startDate: new Date(),
    endDate: new Date().setMonth(11),
  });
  const [hasImage, setHasImage] = useState(false);

  const [alertaEnviada, setAlertaEnviada] = useState(false);
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserPantallas, setSelectedUserPantallas] = useState([]);
  const [selectedUserPantallasDirectorio, setSelectedUserPantallasDirectorio] =
    useState([]);

  useEffect(() => {
    if (user && user.email === "uppermex10@gmail.com") {
      const usuariosRef = collection(db, "usuarios");
      const usuariosSnapshot = getDocs(usuariosRef);

      usuariosSnapshot.then((snapshot) => {
        const usuariosList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllUsers(usuariosList);
      });
    }
  }, [user]);

  const handleUserSelect = (e) => {
    const selectedUserId = e.target.value;

    // Obtener las pantallas del usuario seleccionado
    const selectedUserPantallas =
      allUsers.find((user) => user.id === selectedUserId)?.nombrePantallas ||
      [];

    // Obtener las pantallas del directorio del usuario seleccionado
    const selectedUserPantallasDirectorio =
      allUsers.find((user) => user.id === selectedUserId)
        ?.nombrePantallasDirectorio || [];

    // Establecer las pantallas del usuario seleccionado en el estado
    setSelectedUserPantallas(selectedUserPantallas);

    // Establecer las pantallas del directorio del usuario seleccionado en el estado
    setSelectedUserPantallasDirectorio(selectedUserPantallasDirectorio);

    // Restablecer las pantallas seleccionadas al cambiar de usuario
    setSelectedDevices([]);
    setImages([]);
    // Otros restablecimientos que puedas necesitar...

    // Finalmente, establecer el usuario seleccionado en el estado
    setSelectedUser(selectedUserId);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setUserId(user.uid);

        // Obtener datos del usuario desde Firestore
        const usuarioRef = doc(db, "usuarios", user.uid);
        const usuarioDoc = await getDoc(usuarioRef);

        if (usuarioDoc.exists()) {
          const userData = usuarioDoc.data();
          setNombrePantallas(userData.nombrePantallas || []);
          setNombrePantallasDirectorio(
            userData.nombrePantallasDirectorio || []
          );
        }
      } else {
        setUser(null);
        setUserId(null);
        setNombrePantallas([]);
        setNombrePantallasDirectorio([]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleDescriptionChange = (e) => {
    const inputText = e.target.value;
    setDescription(inputText);
    setCharCount(inputText.length);
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imageRef = ref(storage, `imagenes/${file.name}`);

      try {
        await uploadBytes(imageRef, file);
        const imageUrl = await getDownloadURL(imageRef);

        setImages((prevImages) => [...prevImages, imageUrl]);
        setHasImage(true); // Establecer que hay al menos una imagen
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

  const obtenerInformacionPersonalizacion = async (userId) => {
    try {
      const templateSalonesRef = collection(db, "TemplateSalones");
      const templateSalonesQuery = query(
        templateSalonesRef,
        where("userId", "==", userId)
      );
      const templateSalonesSnapshot = await getDocs(templateSalonesQuery);

      if (!templateSalonesSnapshot.empty) {
        // Si se encuentra un documento, devuelve la información de personalización
        const templateSalonesDoc = templateSalonesSnapshot.docs[0].data();
        return templateSalonesDoc;
      } else {
        // Si no hay información de personalización, puedes devolver un valor por defecto o null
        return null;
      }
    } catch (error) {
      console.error(
        "Error al obtener la información de personalización del template:",
        error
      );
      return null;
    }
  };

  const enviarDatosAFirebase = async () => {
    event.preventDefault();
    if (!hasImage) {
      alert("Debes subir al menos una imagen antes de enviar el formulario.");
      return;
    }
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
    fechaInicio.setDate(fechaInicio.getDate() + 1); // Agregar un día a la fecha de inicio
    fechaInicio.setHours(
      horaInicialReal.split(":")[0],
      horaInicialReal.split(":")[1]
    );
    const fechaFinal = new Date(value.endDate);
    fechaFinal.setDate(fechaFinal.getDate() + 1); // Agregar un día a la fecha final
    fechaFinal.setHours(
      horaFinalReal.split(":")[0],
      horaFinalReal.split(":")[1]
    );

    const formattedFechaInicio = fechaInicio.toISOString().split("T")[0];
    const formattedFechaFinal = fechaFinal.toISOString().split("T")[0];
    const devices = selectedDevices;
    setImages([]);
    setDescription("");

    const fechaHoraActual = new Date();
    const fechaHoraFinalSalon = new Date(value.endDate);
    fechaHoraFinalSalon.setDate(fechaHoraFinalSalon.getDate() + 1); // Agregar un día
    fechaHoraFinalSalon.setHours(
      parseInt(horaFinalSalon.split(":")[0]),
      parseInt(horaFinalSalon.split(":")[1])
    );
    const status = fechaHoraActual <= fechaHoraFinalSalon;

    const eventoData = {
      nombreEvento,
      tipoEvento,
      lugar,
      description,
      horaInicialReal,
      horaFinalReal,
      horaInicialSalon,
      horaFinalSalon,
      fechaInicio: formattedFechaInicio,
      fechaFinal: formattedFechaFinal,
      images,
      devices,
      userId: userId,
      userId: user.uid,
      status,
    };

    if (selectedUser) {
      // Asignar el evento al usuario seleccionado (solo si está seleccionado)
      eventoData.userId = selectedUser;
    }

    const personalizacionTemplate = await obtenerInformacionPersonalizacion(
      userId
    );

    // Aplicar la información de personalización al evento
    if (personalizacionTemplate) {
      eventoData.personalizacionTemplate = {
        fontColor: personalizacionTemplate.fontColor,
        templateColor: personalizacionTemplate.templateColor,
        fontStyle: personalizacionTemplate.fontStyle,
        logo: personalizacionTemplate.logo,
      };
    }

    firebase
      .firestore()
      .collection("eventos")
      .add(eventoData)
      .then((docRef) => {
        document.getElementById("floating_name").value = "";
        document.getElementById("floating_event").value = "";
        document.getElementById("floating_floor").value = "";
        document.getElementById("description").value = "";
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
        setDescription("");

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

  const handleDeviceChange = (e) => {
    const selectedDevice = e.target.value;
    setSelectedDevices((prevDevices) => {
      const updatedDevices = prevDevices.includes(selectedDevice)
        ? prevDevices.filter((device) => device !== selectedDevice)
        : [...prevDevices, selectedDevice];

      return updatedDevices;
    });
  };

  return (
    <section className="px-5 md:px-32">
      <div>
        <div className="p-5">
          <h1 className="mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl">
            Alta de eventos
          </h1>
        </div>
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-300 p-4">
            <form>
              {user && user.email === "uppermex10@gmail.com" && (
                <div className="relative z-0 w-full mb-6 group">
                  <select
                    value={selectedUser || ""}
                    onChange={handleUserSelect}
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2  appearance-none  border-gray-600  focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  >
                    <option value="" disabled>
                      Seleccionar Empresa
                    </option>
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {`${u.empresa}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
              <div className="relative z-0 w-full mb-6 group">
                <textarea
                  name="description"
                  id="description"
                  className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2  appearance-none  border-gray-600  focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  placeholder=" "
                  rows="1"
                  maxLength="255"
                  value={description}
                  onChange={handleDescriptionChange}
                />
                <label
                  for="description"
                  className="peer-focus:font-medium absolute text-sm text-gray-500  duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600  peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  Descripción
                </label>
                <span id="charCount" className="text-sm text-gray-500">
                  {charCount}/255 caracteres
                </span>
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
                <div className="mb-4"></div> <div className="mb-4"></div>{" "}
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
                <div className="hidden md:block">
                  <button
                    onClick={enviarDatosAFirebase}
                    disabled={!hasImage}
                    className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4 ${
                      !hasImage && "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    Enviar
                  </button>
                </div>
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
                  {user && user.email !== "uppermex10@gmail.com" ? (
                    // Renderizar pantallas del usuario logeado particular
                    <>
                      {Array.isArray(nombrePantallas)
                        ? nombrePantallas.map((nombrePantalla, index) => (
                            <label key={index} className="block mb-2">
                              <input
                                type="checkbox"
                                value={nombrePantalla}
                                checked={selectedDevices.includes(
                                  nombrePantalla
                                )}
                                onChange={handleDeviceChange}
                                className="mr-2"
                              />
                              {nombrePantalla}
                            </label>
                          ))
                        : Object.values(nombrePantallas).map(
                            (nombrePantalla, index) => (
                              <label key={index} className="block mb-2">
                                <input
                                  type="checkbox"
                                  value={nombrePantalla}
                                  checked={selectedDevices.includes(
                                    nombrePantalla
                                  )}
                                  onChange={handleDeviceChange}
                                  className="mr-2"
                                />
                                {nombrePantalla}
                              </label>
                            )
                          )}
                      {/* Adding the devices from nombrePantallasDirectorio */}
                      {Array.isArray(nombrePantallasDirectorio)
                        ? nombrePantallasDirectorio.map(
                            (nombrePantalla, index) => (
                              <label key={index} className="block mb-2">
                                <input
                                  type="checkbox"
                                  value={nombrePantalla}
                                  checked={selectedDevices.includes(
                                    nombrePantalla
                                  )}
                                  onChange={handleDeviceChange}
                                  className="mr-2"
                                />
                                {nombrePantalla}
                              </label>
                            )
                          )
                        : Object.values(nombrePantallasDirectorio).map(
                            (nombrePantalla, index) => (
                              <label key={index} className="block mb-2">
                                <input
                                  type="checkbox"
                                  value={nombrePantalla}
                                  checked={selectedDevices.includes(
                                    nombrePantalla
                                  )}
                                  onChange={handleDeviceChange}
                                  className="mr-2"
                                />
                                {nombrePantalla}
                              </label>
                            )
                          )}
                    </>
                  ) : (
                    // Renderizar pantallas del usuario "uppermex10@gmail.com"
                    <>
                      {Array.isArray(selectedUserPantallas)
                        ? selectedUserPantallas.map((nombrePantalla, index) => (
                            <label key={index} className="block mb-2">
                              <input
                                type="checkbox"
                                value={nombrePantalla}
                                checked={selectedDevices.includes(
                                  nombrePantalla
                                )}
                                onChange={handleDeviceChange}
                                className="mr-2"
                              />
                              {nombrePantalla}
                            </label>
                          ))
                        : Object.values(selectedUserPantallas).map(
                            (nombrePantalla, index) => (
                              <label key={index} className="block mb-2">
                                <input
                                  type="checkbox"
                                  value={nombrePantalla}
                                  checked={selectedDevices.includes(
                                    nombrePantalla
                                  )}
                                  onChange={handleDeviceChange}
                                  className="mr-2"
                                />
                                {nombrePantalla}
                              </label>
                            )
                          )}
                      {/* Adding the devices from selectedUserPantallasDirectorio */}
                      {Array.isArray(selectedUserPantallasDirectorio)
                        ? selectedUserPantallasDirectorio.map(
                            (nombrePantalla, index) => (
                              <label key={index} className="block mb-2">
                                <input
                                  type="checkbox"
                                  value={nombrePantalla}
                                  checked={selectedDevices.includes(
                                    nombrePantalla
                                  )}
                                  onChange={handleDeviceChange}
                                  className="mr-2"
                                />
                                {nombrePantalla}
                              </label>
                            )
                          )
                        : Object.values(selectedUserPantallasDirectorio).map(
                            (nombrePantalla, index) => (
                              <label key={index} className="block mb-2">
                                <input
                                  type="checkbox"
                                  value={nombrePantalla}
                                  checked={selectedDevices.includes(
                                    nombrePantalla
                                  )}
                                  onChange={handleDeviceChange}
                                  className="mr-2"
                                />
                                {nombrePantalla}
                              </label>
                            )
                          )}
                    </>
                  )}
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
            <div className=" md:hidden">
              <button
                onClick={enviarDatosAFirebase}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4"
              >
                Enviar
              </button>
            </div>
          </section>
        </section>
      </div>
    </section>
  );
}

export default AltaEventos;
