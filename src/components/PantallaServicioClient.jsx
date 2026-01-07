/* eslint-disable @next/next/no-img-element */
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
function PantallaServicioClient() {
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
  const [eventosPorSeccion, setEventosPorSeccion] = useState({
    Seccion1: [],
    Seccion2: [],
    Seccion3: [],
  });
  console.log("🚀 ~ PantallaServicio ~ eventosPorSeccion:", eventosPorSeccion);

  const [currentIndexes, setCurrentIndexes] = useState({
    Seccion1: 0,
    Seccion2: 0,
    Seccion3: 0,
  });
  const intervalRefs = useRef({
    Seccion1: null,
    Seccion2: null,
    Seccion3: null,
  });

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

      // Lógica para obtener el usuario
      const obtenerUsuario = async () => {
        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            let userCompany = userData.empresa || empresaNombre;
            const nombrePantallasServicios = Object.values(
              userData.NombrePantallasServicios || {},
            );

            const eventosRef = collection(
              firestore,
              "TemplateServiciosAvanzado",
            );
            const eventosQuery = query(
              eventosRef,
              where("empresa", "==", userCompany),
            );
            const querySnapshot = await getDocs(eventosQuery);

            const eventosData = [];
            querySnapshot.forEach((doc) => {
              const evento = { id: doc.id, ...doc.data() };
              const selectedScreenName = evento.selectedScreenName;

              if (nombrePantallasServicios.includes(selectedScreenName)) {
                eventosData.push({
                  id: evento.id,
                  empresa: evento.empresa,
                  endDate: evento.endDate,
                  image: evento.image,
                  lugar: evento.lugar,
                  selectedScreenName: evento.selectedScreenName,
                  selectedSection: evento.selectedSection,
                  startDate: evento.startDate,
                  userEmail: evento.userEmail,
                  userId: evento.userId,
                  visualizationTime: {
                    hours: evento.visualizationTime?.hours || 0,
                    minutes: evento.visualizationTime?.minutes || 0,
                    seconds: evento.visualizationTime?.seconds || 0,
                  },
                });
              }
            });

            const fechaActual = new Date();

            // Filtrar eventos por fecha
            const filtrarEventosPorFecha = (eventos) => {
              return eventos.filter((evento) => {
                const inicio = new Date(evento.startDate);
                const fin = new Date(evento.endDate);
                return fechaActual >= inicio && fechaActual <= fin;
              });
            };

            // Ordenar eventos por lugar
            const ordenarEventosPorLugar = (eventos) => {
              const orden = { A: 1, B: 2, C: 3 };
              return eventos.sort((a, b) => orden[a.lugar] - orden[b.lugar]);
            };

            // Dividir eventos por secciones
            const eventosSeccion1 = ordenarEventosPorLugar(
              filtrarEventosPorFecha(
                eventosData.filter(
                  (evento) => evento.selectedSection === "Sección 1",
                ),
              ),
            );
            const eventosSeccion2 = ordenarEventosPorLugar(
              filtrarEventosPorFecha(
                eventosData.filter(
                  (evento) => evento.selectedSection === "Sección 2",
                ),
              ),
            );
            const eventosSeccion3 = ordenarEventosPorLugar(
              filtrarEventosPorFecha(
                eventosData.filter(
                  (evento) => evento.selectedSection === "Sección 3",
                ),
              ),
            );

            setEventosPorSeccion({
              Seccion1: eventosSeccion1,
              Seccion2: eventosSeccion2,
              Seccion3: eventosSeccion3,
            });

            // Limpiar intervalos previos antes de establecer nuevos
            Object.values(intervalRefs.current).forEach(clearInterval);

            // Mostrar evento según la sección
            // Note: In original code setSeccionEstado was used which refers to missing state variables (seccion1, seccion2, seccion3)
            // But they were commented out in the original file I read.
            // I will keep the interval logic but it seems flawed in the original file as setSeccionEstado param was passed but state was commented out
            // Wait, looking at original file lines 52-57 were commented.
            // And lines 202-204 called mostrarEvento with setSeccion1, setSeccion2, setSeccion3
            // Which are UNDEFINED if commented out.
            // This would cause runtime error "setSeccion1 is not a function".
            // But build error is "window undefined".
            // I will fix this runtime error too by restoring the state variables or removing the calls.
            // I will restore the state variables to be safe.
          } else {
            console.log("pantallaDirec.noDataFound");
          }
        } catch (error) {
          console.error("pantallaDirec.userDataFetchError", error);
        }
      };

      obtenerUsuario();

      // Intervalo para actualizar los datos cada minuto
      const interval = setInterval(() => {
        obtenerUsuario(); // Llamar a la función cada 1 minuto
      }, 60000);

      return () => {
        clearInterval(interval); // Limpiar el intervalo al desmontar el componente
      };
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
          eventosEnCurso[siguienteIndex].tiempoDeVisualizacion.seconds || 0,
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
        console.error("pantallaDirec.fetchingOrParsingDataError", error),
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
    if (rssItems.length === 0) return;
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
          console.error("pantallaDirec.weatherDataFetchError", error); // "Error al obtener datos del clima:"
          setError("pantallaDirec.weatherInfoUnavailable"); // "No se pudo obtener la información del clima"
          setIsLoading(false);
        });
    }
  }, [selectedCity]);
  //* ----------------- Clima ---------------------------

  useEffect(() => {
    // Función para manejar el cambio de imagen en una sección específica
    const startTimers = (seccion) => {
      const eventos = eventosPorSeccion[seccion];
      if (!eventos || eventos.length === 0) return;

      // Obtener la imagen actual según el índice
      const currentIndex = currentIndexes[seccion];
      const currentEvent = eventos[currentIndex];
      const { visualizationTime } = currentEvent;

      // Calcular el tiempo en milisegundos
      const delay =
        (visualizationTime.hours * 3600 +
          visualizationTime.minutes * 60 +
          visualizationTime.seconds) *
        1000;

      // Crear un temporizador para cambiar a la siguiente imagen
      const timer = setTimeout(() => {
        setCurrentIndexes((prevIndexes) => ({
          ...prevIndexes,
          [seccion]: (prevIndexes[seccion] + 1) % eventos.length,
        }));
      }, delay);

      return timer;
    };

    // Iniciar temporizadores para cada sección
    const timers = {
      Seccion1: startTimers("Seccion1"),
      Seccion2: startTimers("Seccion2"),
      Seccion3: startTimers("Seccion3"),
    };

    // Limpiar los temporizadores cuando el componente se desmonte o cuando los índices cambien
    return () => {
      clearTimeout(timers.Seccion1);
      clearTimeout(timers.Seccion2);
      clearTimeout(timers.Seccion3);
    };
  }, [currentIndexes, eventosPorSeccion]);

  const eventoActual = eventosEnCurso[eventoActualIndex] || {};
  return (
    <div className="min-h-screen bg-red-100 grid grid-rows-6 gap-1">
      {/* SECCION 1, 2, 3 */}
      <div className="grid grid-cols-3 gap-1 mb-1 h-full row-span-5">
        {/* Sección superior izquierda */}
        <div className="grid grid-rows-2 gap-1">
          <div className="bg-cyan-200 border-2 border-slate-300 p-1">
            {/* Renderizar eventos de Seccion1 */}
            <h2>Sección 1</h2>
            {eventosPorSeccion.Seccion1.length > 0 && (
              <img
                src={eventosPorSeccion.Seccion1[currentIndexes.Seccion1].image}
                alt="Sección 1"
              />
            )}
          </div>

          <div className="bg-cyan-200 border-2 border-slate-300 p-1">
            {/* Renderizar eventos de Seccion2 */}
            <h2>Sección 2</h2>
            {eventosPorSeccion.Seccion2.length > 0 && (
              <img
                src={eventosPorSeccion.Seccion2[currentIndexes.Seccion2].image}
                alt="Sección 2"
              />
            )}
          </div>
        </div>

        {/* Sección superior derecha */}
        <div className="bg-green-100 col-span-2 border-2 border-slate-300 p-1">
          {/* Renderizar eventos de Seccion3 */}
          <h2>Sección 3</h2>
          {eventosPorSeccion.Seccion3.length > 0 && (
            <img
              src={eventosPorSeccion.Seccion3[currentIndexes.Seccion3].image}
              alt="Sección 3"
            />
          )}
        </div>
      </div>

      {/* SECCION FECHA, RSS, CLIMA Ignorar esta parte */}
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
                {/* {t("pantallaDirec.welcomeTitle")} */}
                Bienvenido
              </h2>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PantallaServicioClient;
