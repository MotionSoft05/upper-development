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
import { CalendarIcon, ClockIcon } from "@heroicons/react/20/solid";
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
    <div className="max-w-full mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t("altaEventos.title")}</h1>

      {/* Formulario en 3 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Columna 1: Información básica */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-3 pb-1 border-b border-gray-200">
            {t("altaEventos.basicInfo")}
          </h2>

          {/* Admin selector para empresas */}
          {user &&
            (user.email === "uppermex10@gmail.com" ||
              user.email === "ulises.jacobo@hotmail.com" ||
              user.email === "contacto@upperds.mx") && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("altaEventos.selectCompany")}
                </label>
                <select
                  value={selectedUser || ""}
                  onChange={handleUserSelect}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded p-2 text-sm"
                >
                  <option value="" disabled>
                    {t("altaEventos.selectCompany")}
                  </option>
                  {allUsers
                    .filter(
                      (u, index, self) =>
                        self.findIndex((t) => t.empresa === u.empresa) === index
                    )
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {`${u.empresa}`}
                      </option>
                    ))}
                </select>
              </div>
            )}

          {/* Campos de información */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("altaEventos.eventName")}
              </label>
              <input
                type="text"
                name="floating_name"
                id="floating_name"
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded p-2 text-sm"
                placeholder={t("altaEventos.eventNamePlaceholder")}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("altaEventos.eventType")}
              </label>
              <input
                type="text"
                name="floating_event"
                id="floating_event"
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded p-2 text-sm"
                placeholder={t("altaEventos.eventTypePlaceholder")}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("altaEventos.location")}
              </label>
              <input
                type="text"
                name="floating_floor"
                id="floating_floor"
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded p-2 text-sm"
                placeholder={t("altaEventos.locationPlaceholder")}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("altaEventos.description")}
              </label>
              <textarea
                name="description"
                id="description"
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded p-2 text-sm"
                placeholder={t("altaEventos.descriptionPlaceholder")}
                rows="3"
                maxLength="255"
                value={description}
                onChange={handleDescriptionChange}
              />
              <p className="text-xs text-gray-500 mt-1">{`${charCount}/255 ${t(
                "altaEventos.characters"
              )}`}</p>
            </div>
          </div>

          {/* Selector de fecha */}
          <div className="mt-4">
            <div className="flex items-center mb-2">
              <CalendarIcon className="h-4 w-4 text-blue-500 mr-1" />
              <h3 className="text-sm font-medium text-gray-700">
                {t("altaEventos.selectDate")}
              </h3>
            </div>
            <Datepicker
              useRange={false}
              value={value}
              onChange={handleValueChange}
              inputClassName="w-full py-2 bg-gray-50 border border-gray-300 text-gray-900 rounded text-sm"
            />
          </div>
        </div>

        {/* Columna 2: Horarios y dispositivos */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          {/* Sección de horarios */}
          <div>
            <div className="flex items-center mb-2">
              <ClockIcon className="h-4 w-4 text-blue-500 mr-1" />
              <h3 className="text-sm font-medium text-gray-700">
                {t("altaEventos.selectHours")}
              </h3>
            </div>

            {/* Horario real del evento */}
            <div className="bg-gray-50 p-3 rounded border border-gray-200 mb-3">
              <h4 className="text-xs font-medium text-gray-700 mb-2">
                {t("altaEventos.realInitialTime")}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    {t("altaEventos.realInitialHour")}
                  </label>
                  <div className="flex space-x-1">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        {t("altaEventos.hours")}
                      </p>
                      <select
                        className="border border-gray-300 text-gray-700 rounded p-1 text-xs w-14"
                        id="hourSelectorInicio"
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i.toString().padStart(2, "0")}>
                            {i.toString().padStart(2, "0")}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        {t("altaEventos.minutes")}
                      </p>
                      <select
                        className="border border-gray-300 text-gray-700 rounded p-1 text-xs w-14"
                        id="minuteSelectorInicio"
                      >
                        {Array.from({ length: 60 }, (_, i) => (
                          <option key={i} value={i.toString().padStart(2, "0")}>
                            {i.toString().padStart(2, "0")}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    {t("altaEventos.realFinalHour")}
                  </label>
                  <div className="flex space-x-1">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        {t("altaEventos.hours")}
                      </p>
                      <select
                        className="border border-gray-300 text-gray-700 rounded p-1 text-xs w-14"
                        id="hourSelectorFinal"
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i.toString().padStart(2, "0")}>
                            {i.toString().padStart(2, "0")}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        {t("altaEventos.minutes")}
                      </p>
                      <select
                        className="border border-gray-300 text-gray-700 rounded p-1 text-xs w-14"
                        id="minuteSelectorFinal"
                      >
                        {Array.from({ length: 60 }, (_, i) => (
                          <option key={i} value={i.toString().padStart(2, "0")}>
                            {i.toString().padStart(2, "0")}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Horario en que se mostrará en pantallas */}
            <div className="bg-gray-50 p-3 rounded border border-gray-200 mb-4">
              <h4 className="text-xs font-medium text-gray-700 mb-2">
                {t("altaEventos.realFinalTime")}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    {t("altaEventos.loungeInitialHour")}
                  </label>
                  <div className="flex space-x-1">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        {t("altaEventos.hours")}
                      </p>
                      <select
                        className="border border-gray-300 text-gray-700 rounded p-1 text-xs w-14"
                        id="hourSelectorInicioSalon"
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i.toString().padStart(2, "0")}>
                            {i.toString().padStart(2, "0")}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        {t("altaEventos.minutes")}
                      </p>
                      <select
                        className="border border-gray-300 text-gray-700 rounded p-1 text-xs w-14"
                        id="minuteSelectorInicioSalon"
                      >
                        {Array.from({ length: 60 }, (_, i) => (
                          <option key={i} value={i.toString().padStart(2, "0")}>
                            {i.toString().padStart(2, "0")}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    {t("altaEventos.loungeFinalHour")}
                  </label>
                  <div className="flex space-x-1">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        {t("altaEventos.hours")}
                      </p>
                      <select
                        className="border border-gray-300 text-gray-700 rounded p-1 text-xs w-14"
                        id="hourSelectorFinalSalon"
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i.toString().padStart(2, "0")}>
                            {i.toString().padStart(2, "0")}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        {t("altaEventos.minutes")}
                      </p>
                      <select
                        className="border border-gray-300 text-gray-700 rounded p-1 text-xs w-14"
                        id="minuteSelectorFinalSalon"
                      >
                        {Array.from({ length: 60 }, (_, i) => (
                          <option key={i} value={i.toString().padStart(2, "0")}>
                            {i.toString().padStart(2, "0")}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dispositivos */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              {t("altaEventos.selectDevicesTitle")}
            </h3>

            <div className="max-h-56 overflow-y-auto bg-gray-50 p-2 border border-gray-200 rounded">
              <div className="grid grid-cols-2 gap-y-1 gap-x-2">
                {(user && user.email !== "uppermex10@gmail.com") ||
                (user && user.email === "ulises.jacobo@hotmail.com") ||
                (user && user.email === "contacto@upperds.mx") ? (
                  <>
                    {/* Pantallas de salón */}
                    {Array.isArray(nombrePantallas)
                      ? nombrePantallas.map((nombrePantalla, index) => (
                          <label
                            key={index}
                            className="flex items-center text-xs hover:bg-gray-100 p-1 rounded"
                          >
                            <input
                              type="checkbox"
                              value={nombrePantalla}
                              checked={selectedDevices.includes(nombrePantalla)}
                              onChange={handleDeviceChange}
                              className="mr-1 h-3 w-3"
                            />
                            <span className="truncate">{nombrePantalla}</span>
                          </label>
                        ))
                      : Object.values(nombrePantallas).map(
                          (nombrePantalla, index) => (
                            <label
                              key={index}
                              className="flex items-center text-xs hover:bg-gray-100 p-1 rounded"
                            >
                              <input
                                type="checkbox"
                                value={nombrePantalla}
                                checked={selectedDevices.includes(
                                  nombrePantalla
                                )}
                                onChange={handleDeviceChange}
                                className="mr-1 h-3 w-3"
                              />
                              <span className="truncate">{nombrePantalla}</span>
                            </label>
                          )
                        )}

                    {/* Pantallas directorio */}
                    {Array.isArray(nombrePantallasDirectorio)
                      ? nombrePantallasDirectorio.map(
                          (nombrePantalla, index) => (
                            <label
                              key={`dir-${index}`}
                              className="flex items-center text-xs hover:bg-gray-100 p-1 rounded"
                            >
                              <input
                                type="checkbox"
                                value={nombrePantalla}
                                checked={selectedDevices.includes(
                                  nombrePantalla
                                )}
                                onChange={handleDeviceChange}
                                className="mr-1 h-3 w-3"
                              />
                              <span className="truncate">{nombrePantalla}</span>
                            </label>
                          )
                        )
                      : Object.values(nombrePantallasDirectorio).map(
                          (nombrePantalla, index) => (
                            <label
                              key={`dir-${index}`}
                              className="flex items-center text-xs hover:bg-gray-100 p-1 rounded"
                            >
                              <input
                                type="checkbox"
                                value={nombrePantalla}
                                checked={selectedDevices.includes(
                                  nombrePantalla
                                )}
                                onChange={handleDeviceChange}
                                className="mr-1 h-3 w-3"
                              />
                              <span className="truncate">{nombrePantalla}</span>
                            </label>
                          )
                        )}
                  </>
                ) : (
                  // Renderizar pantallas del usuario "uppermex10@gmail.com"
                  <>
                    {Array.isArray(selectedUserPantallas)
                      ? selectedUserPantallas.map((nombrePantalla, index) => (
                          <label
                            key={index}
                            className="flex items-center text-xs hover:bg-gray-100 p-1 rounded"
                          >
                            <input
                              type="checkbox"
                              value={nombrePantalla}
                              checked={selectedDevices.includes(nombrePantalla)}
                              onChange={handleDeviceChange}
                              className="mr-1 h-3 w-3"
                            />
                            <span className="truncate">{nombrePantalla}</span>
                          </label>
                        ))
                      : Object.values(selectedUserPantallas).map(
                          (nombrePantalla, index) => (
                            <label
                              key={index}
                              className="flex items-center text-xs hover:bg-gray-100 p-1 rounded"
                            >
                              <input
                                type="checkbox"
                                value={nombrePantalla}
                                checked={selectedDevices.includes(
                                  nombrePantalla
                                )}
                                onChange={handleDeviceChange}
                                className="mr-1 h-3 w-3"
                              />
                              <span className="truncate">{nombrePantalla}</span>
                            </label>
                          )
                        )}

                    {Array.isArray(selectedUserPantallasDirectorio)
                      ? selectedUserPantallasDirectorio.map(
                          (nombrePantalla, index) => (
                            <label
                              key={`dir-${index}`}
                              className="flex items-center text-xs hover:bg-gray-100 p-1 rounded"
                            >
                              <input
                                type="checkbox"
                                value={nombrePantalla}
                                checked={selectedDevices.includes(
                                  nombrePantalla
                                )}
                                onChange={handleDeviceChange}
                                className="mr-1 h-3 w-3"
                              />
                              <span className="truncate">{nombrePantalla}</span>
                            </label>
                          )
                        )
                      : Object.values(selectedUserPantallasDirectorio).map(
                          (nombrePantalla, index) => (
                            <label
                              key={`dir-${index}`}
                              className="flex items-center text-xs hover:bg-gray-100 p-1 rounded"
                            >
                              <input
                                type="checkbox"
                                value={nombrePantalla}
                                checked={selectedDevices.includes(
                                  nombrePantalla
                                )}
                                onChange={handleDeviceChange}
                                className="mr-1 h-3 w-3"
                              />
                              <span className="truncate">{nombrePantalla}</span>
                            </label>
                          )
                        )}
                  </>
                )}
              </div>
            </div>

            {/* Dispositivos seleccionados */}
            <div className="mt-3">
              <h4 className="text-xs font-medium text-gray-700 mb-1">
                {t("altaEventos.showTitle")}
              </h4>
              <div className="bg-gray-50 p-2 border border-gray-200 rounded max-h-24 overflow-y-auto">
                {selectedDevices.length > 0 ? (
                  <ul className="text-xs">
                    {selectedDevices.map((device, index) => (
                      <li key={index} className="flex items-center py-0.5">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5 flex-shrink-0"></span>
                        <span className="truncate">{device}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500 italic">
                    {t("altaEventos.noDevicesSelected")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Columna 3: Imágenes */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-3 pb-1 border-b border-gray-200">
            {t("altaEventos.uploadImagesTitle")}
          </h2>

          <div className="grid grid-cols-3 gap-3 mb-3">
            {[0, 1, 2].map((index) => (
              <div key={index} className="flex flex-col items-center">
                {images && images[index] ? (
                  <div className="relative w-full">
                    <div className="w-full h-24 lg:h-32 relative">
                      <img
                        src={images[index]}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        onClick={() => deleteImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white font-bold w-5 h-5 rounded-full flex items-center justify-center text-xs shadow-sm"
                      >
                        ×
                      </button>
                    </div>
                    <p className="text-xs text-center mt-1 text-gray-500">
                      {t("altaEventos.image")} {index + 1}
                    </p>
                  </div>
                ) : (
                  <label
                    htmlFor={`imageUpload${index}`}
                    className="flex flex-col items-center justify-center w-full h-24 lg:h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-2xl text-blue-500">+</span>
                      <p className="text-xs text-gray-500 mt-1">
                        {t("altaEventos.image")} {index + 1}
                      </p>
                    </div>
                    <input
                      id={`imageUpload${index}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
            ))}
          </div>

          <div className="mt-3 mb-4">
            <label className="inline-flex items-center">
              <input
                id="fullscreenImage"
                type="checkbox"
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                checked={primeraImagen}
                onChange={(e) => setPrimeraImagen(e.target.checked)}
              />
              <span className="ml-2 text-xs text-gray-700">
                {t("altaEventos.activateFullScreen")}
              </span>
            </label>
          </div>

          {/* Botón enviar ubicado al final del flujo */}
          <div className="mt-10">
            <button
              onClick={enviarDatosAFirebase}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors"
            >
              {t("altaEventos.sendButton")}
            </button>
            {alertaEnviada && (
              <div className="mt-3 p-2 bg-green-100 text-green-800 rounded-md text-sm text-center">
                {t("altaEventos.successMessage")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AltaEventos;
