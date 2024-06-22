"use client";
import {
  getFirestore,
  collection,
  getDocs,
  where,
  query,
  doc,
  getDoc,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState, useRef } from "react";
import SliderRSS from "@/components/SliderRSS";
import axios from "axios";
import { firebaseConfig } from "@/firebase/firebaseConfig";

const obtenerHora = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};
function PantallaServicio() {
  const empresaNombre = "SN";
  const [user, setUser] = useState(null);
  const [firestore, setFirestore] = useState(null);
  const [eventosEnCurso, setEventosEnCurso] = useState([]); // Nuevo estado
  const [currentHour, setCurrentHour] = useState(obtenerHora());
  const [selectedCity, setSelectedCity] = useState(null);
  const [templateData, setTemplateData] = useState([]);
  const [publicidadesUsuario, setPublicidadesUsuario] = useState([]);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [eventoActualIndex, setEventoActualIndex] = useState(0);
  const [rssItems, setRssItems] = useState([]); // Estado para almacenar los elementos del RSS
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  //* Función para obtener la hora actual
  function obtenerHoraActual() {
    setCurrentHour(obtenerHora()); // Actualizar el estado con la hora actual
  }
  useEffect(() => {
    const interval = setInterval(() => {
      obtenerHoraActual();
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  //* Función para obtener la hora actual
  //* ----------------- Datos Firebase ---------------------------
  useEffect(() => {
    // Importar Firebase solo en el lado del cliente
    const app = initializeApp(firebaseConfig);
    const firestoreInstance = getFirestore(app); // Save the reference to firestore
    setFirestore(firestoreInstance); // Set the firestore variable

    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);
  // *----------------- //Datos Firebase ---------------------------
  //* ----------------- Eventos ---------------------------

  useEffect(() => {
    if (user && firestore) {
      const userRef = doc(firestore, "usuarios", user.uid);
      const obtenerUsuario = async () => {
        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            let userCompany = "";
            const nombrePantallasUsuario = userData.nombrePantallas || {};
            const pantallasNumeradas = {};

            Object.keys(nombrePantallasUsuario).forEach((key, index) => {
              pantallasNumeradas[nombrePantallasUsuario[key]] = index + 1;
            });
            if (userData.empresa === empresaNombre) {
              userCompany = userData.empresa;
            } else {
              userCompany = empresaNombre;
            }
            console.log("🚀 ~ obtenerUsuario ~ userCompany:", userCompany);

            const eventosRef = collection(firestore, "TemplateServiciosVista");
            const eventosQuery = query(
              eventosRef,
              where("empresa", "==", userCompany)
            );
            const querySnapshot = await getDocs(eventosQuery);

            const eventosData = [];
            console.log("🚀 ~ obtenerUsuario ~ eventosData:", eventosData);

            let dispositivoCoincidente = null;

            querySnapshot.forEach((doc) => {
              const evento = { id: doc.id, ...doc.data() };
              const nombreDePantalla = evento.nombreDePantalla;
              console.log(
                "🚀 ~ querySnapshot.forEach ~ evento:",
                evento.events
              );
              // Verificar si el nombreDePantalla del evento está en NombrePantallasServicios del usuario
              const nombrePantallasServicios = Object.values(
                userData.NombrePantallasServicios || {}
              );
              console.log(
                "🚀 ~ querySnapshot.forEach ~ nombrePantallasServicios:",
                nombrePantallasServicios
              );
              if (nombrePantallasServicios.includes(nombreDePantalla)) {
                dispositivoCoincidente = evento;
                console.log(
                  "Dispositivo coincidente encontrado:",
                  dispositivoCoincidente
                );
                evento.events.forEach((event) => {
                  eventosData.push(event);
                });
              }
            });

            // Filtrar por fecha y hora los eventos filtrados por pantalla
            const eventosEnCursoEffect = eventosData.filter((evento) => {
              // Obtener fecha actual (solo día)
              const fechaActual = new Date();
              fechaActual.setHours(0, 0, 0, 0); // Establecer hora, minutos, segundos y milisegundos a cero

              // Obtener fechas de inicio y finalización del evento (solo día)
              const fechaInicioEvento = new Date(evento.fechaInicial);
              fechaInicioEvento.setDate(fechaInicioEvento.getDate() + 1); // Sumar un día
              fechaInicioEvento.setHours(0, 0, 0, 0); // Establecer hora, minutos, segundos y milisegundos a cero

              const fechaFinalEvento = new Date(evento.fechaFinal);
              fechaFinalEvento.setDate(fechaFinalEvento.getDate() + 1); // Sumar un día
              fechaFinalEvento.setHours(23, 59, 59, 0); // Establecer hora, minutos, segundos y milisegundos a cero

              console.log(
                "🚀 ~ eventosEnCursoEffect ~ fechaInicioEvento:",
                fechaInicioEvento
              );
              console.log(
                "🚀 ~ eventosEnCursoEffect ~ fechaFinalEvento:",
                fechaFinalEvento
              );

              const fechaActualEnRango =
                fechaActual >= fechaInicioEvento &&
                fechaActual <= fechaFinalEvento;
              console.log(
                "🚀 ~ eventosEnCursoEffect ~ fechaActualEnRango:",
                fechaActualEnRango
              );

              return fechaActualEnRango;
            });
            console.log(
              "🚀 ~ eventosEnCursoEffect ~ eventosEnCursoEffect:",
              eventosEnCursoEffect
            );
            //  Sección template
            const templateRef = collection(firestore, "TemplateServicios");
            const templateQuery = query(
              templateRef,
              where("empresa", "==", userCompany)
            );
            const templateSnapshot = await getDocs(templateQuery);
            console.log(
              "🚀 ~ obtenerUsuario ~ templateSnapshot:",
              templateSnapshot
            );

            if (!templateSnapshot.empty) {
              const templateData = [];
              console.log("🚀 ~ obtenerUsuario ~ templateData:", templateData);
              templateSnapshot.forEach((doc) => {
                const template = { id: doc.id, ...doc.data() };

                setSelectedCity({
                  value: template.ciudad,
                  label: template.ciudad,
                });
                templateData.push(template);
              });

              setTemplateData(templateData);
            } else {
              console.log(
                // "No se encontró información en TemplateDirectorios para este usuario."
                t("pantalla.error.templateDirectoryNotFound")
              );
            }

            //  Sección template

            console.log("eventosEnCursoEffect.", eventosEnCursoEffect);
            setEventosEnCurso(eventosEnCursoEffect);

            // console.log(
            //   "🚀 ~ obtenerUsuario ~ eventosEnCursoEffect:",
            //   eventosEnCursoEffect
            // );
            // Aquí puedes hacer algo con los eventos filtrados por fecha y hora
            // setEventData(eventosEnCurso);
          } else {
            // console.log("No se encontraron datos para este usuario.");
            console.log(t("pantalla.error.noDataFound"));
          }
        } catch (error) {
          // console.error("Error al obtener datos del usuario:", error);
          console.error("pantalla.error.userDataFetchError", error);
        }
      };

      obtenerUsuario();

      const interval = setInterval(() => {
        obtenerUsuario(); // Llamar a la función cada 5 segundos
      }, 100000);

      return () => clearInterval(interval); // Limpiar el intervalo al desmontar el componente
    }
  }, [user, firestore]);
  // *----------------- //Eventos ---------------------------
  // *----------------- Timer de los eventos ---------------------------

  useEffect(() => {
    if (tiempoRestante > 0) {
      const timer = setTimeout(() => {
        setTiempoRestante(tiempoRestante - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Pasar al siguiente evento
      if (eventosEnCurso.length > 0) {
        const siguienteIndex = (eventoActualIndex + 1) % eventosEnCurso.length;
        setEventoActualIndex(siguienteIndex);
        setTiempoRestante(
          eventosEnCurso[siguienteIndex].tiempoDeVisualizacion.seconds || 0
        );
      }
    }
  }, [tiempoRestante, eventosEnCurso, eventoActualIndex]);
  // *----------------- //Timer de los eventos ---------------------------
  // *----------------- RSS ---------------------------
  useEffect(() => {
    axios
      .get("https://upperds.onrender.com/fetch-rss")
      .then((response) => {
        const items = response.data.items.map((item) => ({
          title: removeSymbols(item.title),
          link: item.link,
          description: removeSymbols(item.description),
        }));
        setRssItems(items);
      })
      .catch((error) =>
        // "Error fetching or parsing data:"
        console.error(t("pantallaDirec.fetchingOrParsingDataError"), error)
      );
  }, []);

  // Función para eliminar símbolos de una cadena de texto
  const removeSymbols = (text) => {
    // Expresión regular para eliminar símbolos
    const regex = /[^a-zA-Z0-9\s,.:-]/g;
    // Aplicar el regex y reemplazar los símbolos con una cadena vacía
    return text.replace(regex, "");
  };

  let timeOutRss = 7000; // valor de cambio de animacion de RSS
  const [displayedItem, setDisplayedItem] = useState("");

  useEffect(() => {
    let currentIndex = 0;

    const interval = setInterval(() => {
      setDisplayedItem(rssItems[currentIndex].title);

      // Cambiar al siguiente índice, o volver al principio si llegamos al final
      currentIndex = (currentIndex + 1) % rssItems.length;
    }, 7000); // Cambia cada 2000 milisegundos (2 segundos)

    // Limpiar el intervalo cuando el componente se desmonta
    return () => clearInterval(interval);
  }, [rssItems]);

  //* ----------------- RSS ---------------------------
  //* ----------------- Clima ---------------------------
  useEffect(() => {
    if (selectedCity) {
      setIsLoading(true);
      setError(null);

      const apiKey = "a067ad0b3d4440b192b223344240201";
      const baseUrl = "https://api.weatherapi.com/v1";

      axios
        .get(`${baseUrl}/current.json?key=${apiKey}&q=${selectedCity.value}`)
        .then((response) => {
          setWeatherData(response.data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error(t("pantallaDirec.weatherDataFetchError"), error); // "Error al obtener datos del clima:"
          setError(t("pantallaDirec.weatherInfoUnavailable")); // "No se pudo obtener la información del clima"
          setIsLoading(false);
        });
    }
  }, [selectedCity]);
  //* ----------------- Clima ---------------------------
  const eventoActual = eventosEnCurso[eventoActualIndex] || {};
  return (
    <div className="min-h-screen bg-red-100 grid grid-rows-6 gap-1">
      {/* SECCION 1, 2, 3 */}
      <div className="grid grid-cols-3 gap-1 mb-1 h-full row-span-5">
        {/* Seccion superior izquierda */}
        <div className="grid grid-rows-2 gap-1">
          <div className="bg-cyan-200 border-2 border-slate-300 p-1">
            <img src={eventoActual.img1} alt="Imagen 1" />
          </div>
          <div className="bg-cyan-200 border-2 border-slate-300 p-1">
            <img src={eventoActual.img2} alt="Imagen 2" />
          </div>
        </div>

        {/* Seccion superior derecha */}
        <div className="bg-green-100 col-span-2 border-2 border-slate-300 p-1">
          {eventoActual.imgovideo3 &&
          eventoActual.imgovideo3.endsWith(".mp4") ? (
            <video src={eventoActual.imgovideo3} controls alt=" video" />
          ) : (
            <img src={eventoActual.imgovideo3} alt="Imagen" />
          )}
        </div>
      </div>

      {/* SECCION FECHA, RSS, CLIMA */}
      <div className="grid grid-cols-3 gap-1 h-full flex-grow row-span-1">
        <div className="bg-orange-200 border-2 border-slate-300 p-1">
          {" "}
          {currentHour}
        </div>
        <div className="bg-orange-200 border-2 border-slate-300 p-1">
          {" "}
          <SliderRSS />
        </div>
        <div className="bg-orange-200 border-2 border-slate-300 p-1">
          {" "}
          <div className="flex text-color flex-col">
            {isLoading ? (
              <p>
                {/* Cargando datos del clima... */}
                {"pantallaDirec.loadingWeatherData"}
              </p>
            ) : weatherData &&
              weatherData.current &&
              weatherData.current.temp_c ? (
              <div className="flex items-center justify-center mr-4">
                <img
                  src={weatherData.current.condition.icon}
                  alt="Clima"
                  className="w-28"
                />
                <p className="text-5xl font-bold ml-2 mr-6">
                  {weatherData.current.temp_c} °C
                </p>
              </div>
            ) : (
              //si no da el Clima muestra un mensaje de Bienvenida
              <h2 className="text-4xl mr-16">
                {/* Bienvenido */}
                {t("pantallaDirec.welcomeTitle")}
              </h2>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PantallaServicio;
