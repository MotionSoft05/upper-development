/* eslint-disable @next/next/no-img-element */
import React, { useState, useContext, useEffect } from "react";
import Datepicker from "react-tailwindcss-datepicker";
import "keen-slider/keen-slider.min.css";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, currentUser, onAuthStateChanged } from "firebase/auth";
import Swal from "sweetalert2";
import moment from "moment";
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
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "react-i18next";
import db from "@/firebase/firestore";
import auth from "@/firebase/auth";
import storage from "@/firebase/storage";

// const app = initializeApp(firebaseConfig);
// const storage = getStorage(app);
// const auth = getAuth(app);
// const db = getFirestore(app);

function AltaEventos({ setShowAltaEvento, setShowUserAdmin }) {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [nombrePantallas, setNombrePantallas] = useState([]);
  const [nombrePantallasDirectorio, setNombrePantallasDirectorio] = useState(
    []
  );
  const [value, setValue] = useState({
    startDate: 0,
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
  const [dbError, setDbError] = useState(false); // Nuevo estado para manejar errores de base de datos
  const [loading, setLoading] = useState(true); // Nuevo estado para manejar la carga inicial
  const [primeraImagen, setPrimeraImagen] = useState(false);

  useEffect(() => {
    const usuariosRef = collection(db, "usuarios");

    if (userId) {
      const usuarioRef = doc(usuariosRef, userId);

      getDoc(usuarioRef)
        .then((doc) => {
          if (doc.exists()) {
            const userData = doc.data();
            if (userData.pd === 0 && userData.ps === 0) {
              // Si ambos son 0, muestra la alerta con SweetAlert y recarga la página
              Swal.fire({
                icon: "error",
                title: "Oops...",
                // text: "En este momento no cuenta con licencias activas, no es posible continuar con el alta de eventos",
                text: t("altaEventos.noActiveLicenses"),
                confirmButtonColor: "#4482F6",
              }).then(() => {
                // window.location.reload();
                setShowAltaEvento(false);
                setShowUserAdmin(true);
              });
            } else {
              // Verificar si hay publicidad para el usuario
              const publicidadRef = collection(db, "Publicidad");
              const publicidadQuery = query(
                publicidadRef,
                where("empresa", "==", userData.empresa)
              );

              getDocs(publicidadQuery).then((snapshot) => {
                const tienePublicidadSalon = snapshot.docs.some((doc) => {
                  const publicidadData = doc.data();
                  return publicidadData.tipo === "salon" && userData.ps >= 1;
                });

                const tienePublicidadDirectorio = snapshot.docs.some((doc) => {
                  const publicidadData = doc.data();
                  return (
                    publicidadData.tipo === "directorio" && userData.pd >= 1
                  );
                });

                if (
                  !tienePublicidadSalon &&
                  !tienePublicidadDirectorio &&
                  userData.ps >= 1 &&
                  userData.pd >= 1
                ) {
                  // Si no tiene publicidad adecuada, muestra la alerta con SweetAlert y recarga la página
                  Swal.fire({
                    icon: "warning",
                    title: "¡Atención!",
                    // text: "Actualmente no cuenta con Publicidad en Salones y Directorio de Eventos, sugerimos configurar imágenes/videos para una mejor experiencia para sus clientes.",
                    text: t("altaEventos.noAdvertisementSalonAndDirectory"),
                    confirmButtonColor: "#4482F6",
                  }).then(() => {
                    // window.location.reload();
                    setShowAltaEvento(false);
                    setShowUserAdmin(true);
                  });
                } else if (!tienePublicidadSalon && userData.ps >= 1) {
                  // Si no tiene publicidad en salones y ps es distinto de 0, muestra la alerta correspondiente con SweetAlert y recarga la página
                  Swal.fire({
                    icon: "warning",
                    title: "¡Atención!",
                    // text: "Actualmente no cuenta con Publicidad en Salones de Eventos, sugerimos configurar imágenes/videos para una mejor experiencia para sus clientes.",
                    text: t("altaEventos.noAdvertisementSalon"),
                    confirmButtonColor: "#4482F6",
                  }).then(() => {
                    // window.location.reload();
                    setShowAltaEvento(false);
                    setShowUserAdmin(true);
                  });
                } else if (!tienePublicidadDirectorio && userData.pd >= 1) {
                  // Si no tiene publicidad en directorio y pd es distinto de 0, muestra la alerta correspondiente con SweetAlert y recarga la página
                  Swal.fire({
                    icon: "warning",
                    title: "¡Atención!",
                    // text: "Actualmente no cuenta con Publicidad en Directorio de Eventos, sugerimos configurar imágenes/videos para una mejor experiencia para sus clientes.",
                    text: t("altaEventos.noAdvertisementDirectory"),
                    confirmButtonColor: "#4482F6",
                  }).then(() => {
                    // window.location.reload();
                    setShowAltaEvento(false);
                    setShowUserAdmin(true);
                  });
                }
              });
            }
          } else {
            setDbError(true);
          }
        })
        .catch((error) => {
          // "Error al obtener datos de usuario:"
          console.error(t("altaEventos.userDataError"), error);
          setDbError(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (
      user &&
      (user.email === "uppermex10@gmail.com" ||
        user.email === "ulises.jacobo@hotmail.com" ||
        user.email === "contacto@upperds.mx")
    ) {
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

    const selectedUserPantallas =
      allUsers.find((user) => user.id === selectedUserId)?.nombrePantallas ||
      [];

    const selectedUserPantallasDirectorio =
      allUsers.find((user) => user.id === selectedUserId)
        ?.nombrePantallasDirectorio || [];

    setSelectedUserPantallas(selectedUserPantallas);
    setSelectedUserPantallasDirectorio(selectedUserPantallasDirectorio);

    setSelectedDevices([]);
    setImages([]);
    setSelectedUser(selectedUserId);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setUserId(user.uid);

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
      const randomString = Math.random().toString(36).substring(7);
      const uniqueName = `${randomString}_${file.name}`;
      const imageRef = ref(storage, `imagenes/${uniqueName}`);

      try {
        await uploadBytes(imageRef, file);
        const imageUrl = await getDownloadURL(imageRef);

        setImages((prevImages) => [...prevImages, imageUrl]);
        setHasImage(true); // Establecer que hay al menos una imagen
      } catch (error) {
        // "Error al subir imagen:"
        console.error(t("altaEventos.uploadImageError"), error);
      }
    }
    e.target.value = null;
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

  const obtenerInformacionPersonalizacion = async (userId) => {
    try {
      const templateSalonesRef = collection(db, "TemplateSalones");
      const templateSalonesQuery = query(
        templateSalonesRef,
        where("userId", "==", userId)
      );
      const templateSalonesSnapshot = await getDocs(templateSalonesQuery);

      if (!templateSalonesSnapshot.empty) {
        const templateSalonesDoc = templateSalonesSnapshot.docs[0].data();
        return templateSalonesDoc;
      } else {
        return null;
      }
    } catch (error) {
      console.error(
        // "Error al obtener la información de personalización del template:",
        t("altaEventos.templateInfoError"),
        error
      );
      return null;
    }
  };

  const enviarDatosAFirebase = async () => {
    event.preventDefault();
    if (!value.startDate || value.startDate === 0) {
      // alert("Debes seleccionar una fecha antes de enviar el formulario.");
      alert(t("altaEventos.selectDateAlert"));
      return;
    }
    if (!hasImage) {
      // "Debes subir al menos una imagen antes de enviar el formulario."
      alert(t("altaEventos.uploadImageAlert"));
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

    const fechaInicio = moment(value.startDate).set({
      hour: horaInicialReal.split(":")[0],
      minute: horaInicialReal.split(":")[1],
    });

    const fechaFinal = moment(value.endDate)
      .hour(horaFinalReal.split(":")[0])
      .minute(horaFinalReal.split(":")[1]);

    // Agregar líneas de console.log para visualizar las fechas
    // "Fecha Inicio antes de enviar a Firebase:"
    console.log(t("altaEventos.logStartDate"), fechaInicio._i);

    // "Fecha Final antes de enviar a Firebase:"
    console.log(t("altaEventos.logEndDate"), fechaFinal._i);

    const devices = selectedDevices;
    setImages([]);
    setDescription("");

    const fechaHoraActual = new Date();
    const fechaHoraFinalSalon = moment(fechaFinal); // Utilizar la fechaFinal creada con moment
    fechaHoraFinalSalon.set({
      hour: parseInt(horaFinalSalon.split(":")[0]),
      minute: parseInt(horaFinalSalon.split(":")[1]),
    });
    const status = fechaHoraActual <= fechaHoraFinalSalon.toDate();

    const usuarioRef = doc(db, "usuarios", userId);
    const usuarioDoc = await getDoc(usuarioRef);

    if (usuarioDoc.exists()) {
      const userData = usuarioDoc.data();
      const empresa = userData.empresa;

      const eventoData = {
        nombreEvento,
        tipoEvento,
        lugar,
        description,
        horaInicialReal,
        horaFinalReal,
        horaInicialSalon,
        horaFinalSalon,
        fechaInicio: fechaInicio._i,
        fechaFinal: fechaFinal._i,
        images,
        devices,
        userId: userId,
        status,
        uuid: `${uuidv4().slice(0, 4)}-${uuidv4().slice(0, 4)}-${uuidv4().slice(
          0,
          3
        )}`,
        empresa: empresa,
        primeraImagen,
      };

      if (selectedUser) {
        eventoData.userId = selectedUser;
      }

      const personalizacionTemplate = await obtenerInformacionPersonalizacion(
        userId
      );

      if (personalizacionTemplate) {
        eventoData.personalizacionTemplate = {
          fontColor: personalizacionTemplate.fontColor,
          templateColor: personalizacionTemplate.templateColor,
          fontStyle: personalizacionTemplate.fontStyle,
          logo: personalizacionTemplate.logo,
        };
      }

      const resetFormState = () => {
        setValue({
          startDate: 0,
          endDate: new Date().setMonth(11),
        });
        setImages([]);
        setDescription("");
        setHasImage(false);
      };

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
          setImages([]);
          resetFormState();
          setDescription("");
          setHasImage(false);
          resetFormState();
          setTimeout(() => {
            setAlertaEnviada(false);
          }, 6000);
        })
        .catch((error) => {
          // "Error al enviar datos a Firebase:"
          console.error(t("altaEventos.firebaseSendError"), error);
        });
    }
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

  const handleCheckboxChange = (e) => {
    setPrimeraImagen(e.target.checked);
  };

  return (
    <section className="pl-10 md:px-12 border-4">
      <div>
        <div className="p-5">
          <h1 className="mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl">
            {/* Alta de eventos */}
            {t("altaEventos.title")}
          </h1>
        </div>
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-300 p-4">
            <form>
              {user &&
                (user.email === "uppermex10@gmail.com" ||
                  user.email === "ulises.jacobo@hotmail.com" ||
                  user.email === "contacto@upperds.mx") && (
                  <div className="relative z-0 w-full mb-6 group">
                    <select
                      value={selectedUser || ""}
                      onChange={handleUserSelect}
                      className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2  appearance-none  border-gray-600  focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    >
                      <option value="" disabled>
                        {/* Seleccionar Empresa */}
                        {t("altaEventos.selectCompany")}
                      </option>
                      {allUsers
                        .filter(
                          (u, index, self) =>
                            self.findIndex((t) => t.empresa === u.empresa) ===
                            index
                        )
                        .map((u) => (
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
                  htmlFor="floating_name"
                  className="peer-focus:font-medium absolute text-sm text-gray-500  duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600  peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  {/* Nombre del evento */}
                  {t("altaEventos.eventName")}
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
                  htmlFor="floating_event"
                  className="peer-focus:font-medium absolute text-sm text-gray-500  duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600  peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  {/* Tipo de evento */}
                  {t("altaEventos.eventType")}
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
                  htmlFor="floating_floor"
                  className="peer-focus:font-medium absolute text-sm text-gray-500  duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600  peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  {/* Lugar */}
                  {t("altaEventos.location")}
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
                  htmlFor="description"
                  className="peer-focus:font-medium absolute text-sm text-gray-500  duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600  peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  {/* Descripción */}
                  {t("altaEventos.description")}
                </label>
                <span id="charCount" className="text-sm text-gray-500">
                  {/* caracteres */}
                  {`${charCount} /255 ${t("altaEventos.characters")}`}
                </span>
              </div>
              <div className="bg-gray-300 p-4">
                <h4 className="mb-4 text-2xl leading-none tracking-tight text-gray-900 ">
                  {/* Seleccione la fecha: */}
                  {t("altaEventos.selectDate")}
                </h4>
                <Datepicker
                  useRange={false}
                  value={value}
                  onChange={handleValueChange}
                />
                <div className="mb-4"></div> <div className="mb-4"></div>{" "}
                <h4 className="mb-4 text-2xl leading-none tracking-tight text-gray-900 ">
                  {/* Seleccione las horas: */}
                  {t("altaEventos.selectHours")}
                </h4>
                <div className="bg-white p-3 sm:p-4 mb-3 sm:mb-4 rounded-lg shadow-md">
                  <p className="text-gray-700 font-medium text-sm sm:text-base mb-2">
                    {/* Horario en que se tiene programado el evento */}
                    {t("altaEventos.realInitialTime")}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="relative mb-2 sm:mb-0">
                      <div className="text-gray-600 font-medium text-xs sm:text-sm">
                        {/* Hora inicial real: */}
                        {t("altaEventos.realInitialHour")}
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="relative">
                          <div className="text-gray-600 font-medium text-xs sm:text-sm">
                            {/* Horas: */}
                            {t("altaEventos.hours")}
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
                            {/* Minutos: */}
                            {t("altaEventos.minutes")}
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
                        {/* Hora final real: */}
                        {t("altaEventos.realFinalHour")}
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="relative">
                          <div className="text-gray-600 font-medium text-xs sm:text-sm">
                            {/* Horas: */}
                            {t("altaEventos.hours")}
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
                            {/* Minutos: */}
                            {t("altaEventos.minutes")}
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
                  <p className="text-gray-700 font-medium text-sm sm:text-base mb-2">
                    {/* Horario en que se mostrará la información ... */}
                    {t("altaEventos.realFinalTime")}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="relative mb-2 sm:mb-0">
                      <div className="text-gray-600 font-medium text-xs sm:text-sm">
                        {/* Hora inicial salón: */}
                        {t("altaEventos.loungeInitialHour")}
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="relative">
                          <div className="text-gray-600 font-medium text-xs sm:text-sm">
                            {/* Horas: */}
                            {t("altaEventos.hours")}
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
                            {/* Minutos: */}
                            {t("altaEventos.minutes")}
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
                        {/* Hora final salón: */}
                        {t("altaEventos.loungeFinalHour")}
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="relative">
                          <div className="text-gray-600 font-medium text-xs sm:text-sm">
                            {/* Horas: */}
                            {t("altaEventos.hours")}
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
                            {/* Minutos: */}
                            {t("altaEventos.minutes")}
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
                    className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4`}
                  >
                    {/* Enviar */}
                    {t("altaEventos.sendButton")}
                  </button>
                  {alertaEnviada && (
                    <div className="mt-4 text-green-500">
                      {/* Los datos se enviaron correctamente. */}
                      {t("altaEventos.successMessage")}
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-gray-300 p-4 flex justify-between flex-col col-span-2 ">
              <div className="mb-4">
                <h4 className="mb-4 text-2xl leading-none tracking-tight text-gray-900">
                  {/* Subir Imágenes: */}
                  {t("altaEventos.uploadImagesTitle")}
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                        <div>
                          <button
                            onClick={() => deleteImage(index)}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mt-2"
                          >
                            x
                          </button>
                          <div className="w-30 h-40 flex items-center justify-center mt-2">
                            <img
                              src={images[index]}
                              alt={`Imagen ${index + 1}`}
                              className="max-w-full max-h-full"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {/* Boton para adelante */}
              <div className="mt-4 flex items-center">
                <input
                  id="fullscreenImage"
                  type="checkbox"
                  className="mr-2"
                  checked={primeraImagen} // Asegúrate de que el checkbox refleje el estado actual
                  onChange={(e) => setPrimeraImagen(e.target.checked)} // Actualiza el estado según la selección
                />
                <label htmlFor="fullscreenImage" className="text-gray-900">
                  Activar Pantalla Completa (1280 x 720 px)
                </label>
              </div>
            </div>
            <div className="bg-gray-300 p-4 col-span-2">
              {" "}
              <div className="mb-4">
                <h4 className="mb-2 text-2xl leading-none tracking-tight text-gray-900">
                  {/* Seleccionar Dispositivos: */}
                  {t("altaEventos.selectDevicesTitle")}
                </h4>
                <div className="mb-4">
                  {(user && user.email !== "uppermex10@gmail.com") ||
                  (user && user.email === "ulises.jacobo@hotmail.com") ||
                  (user && user.email === "contacto@upperds.mx") ? (
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
                {/* Se muestra en: */}
                {t("altaEventos.showTitle")}
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
                {/* Enviar */}
                {t("altaEventos.sendButton")}
              </button>
            </div>
          </section>
        </section>
      </div>
    </section>
  );
}

export default AltaEventos;
