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
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Add this line
import { useKeenSlider } from "keen-slider/react";
import { useEffect, useState } from "react";
import parser from "fast-xml-parser";
import "keen-slider/keen-slider.min.css";
import axios from "axios";
import QRCode from "qrcode.react";
import Textra from "react-textra"; // Slider para RSS
const obtenerHora = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

export default function SliderDirecStatic() {
  const [user, setUser] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [currentHour, setCurrentHour] = useState(obtenerHora());
  const [firestore, setFirestore] = useState(null);
  const [eventosEnCurso, setEventosEnCurso] = useState([]); // Nuevo estado
  const [weatherData, setWeatherData] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [templateData, setTemplateData] = useState([]);
  const numeroPantallaActual = "1";
  const [isPortrait, setIsPortrait] = useState(false); // Estado para controlar la orientación
  const [error, setError] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [publicidadesUsuario, setPublicidadesUsuario] = useState([]);
  const [rssItems, setRssItems] = useState([]); // Estado para almacenar los elementos del RSS
  console.log("🚀 ~ PantallaDirec1 ~ rssItems:", rssItems);

  useEffect(() => {
    if (user) {
      // Obtén la URL base del navegador
      const baseUrl = window.location.origin;

      // Actualiza la URL del código QR al cambiar el usuario
      setQrCodeUrl(`${baseUrl}/paginasAleatorias.html?qr=${user.uid}`);
    }
  }, [user]);

  const cambiarOrientacion = () => {
    setIsPortrait((prevState) => !prevState); // Cambia el estado de portrait a landscape y viceversa
  };
  // Función para obtener la hora actual
  function obtenerHoraActual() {
    setCurrentHour(obtenerHora()); // Actualizar el estado con la hora actual
  }

  useEffect(() => {
    const interval = setInterval(() => {
      obtenerHoraActual(); // Llamar a obtenerHoraActual cada segundo
    }, 1000);

    return () => clearInterval(interval); // Limpiar el intervalo al desmontar el componente
  }, []);

  // Slider
  const chunkArray = (arr, chunkSize) => {
    const totalEvents = arr.length;
    const maxContainers = templateData[0]?.setPortrait
      ? Math.ceil(totalEvents / (chunkSize * 2))
      : Math.ceil(totalEvents / chunkSize);

    const result = [];
    for (let i = 0; i < totalEvents; i += chunkSize) {
      result.push(arr.slice(i, i + Math.min(chunkSize, totalEvents - i)));
    }
    while (result.length < maxContainers) {
      result.push([]);
    }
    return result;
  };

  // Calcular eventos por slide
  const eventosPorSlide = chunkArray(
    eventosEnCurso,
    templateData[0]?.setPortrait ? 8 : 5
  );

  useEffect(() => {
    // Actualizar la configuración de loop cuando eventosEnCurso cambia
    sliderRef.current?.refresh();
  }, [eventosEnCurso]);

  // Función para determinar la condición de loop
  const determineLoopCondition = (isPortrait, eventos) => {
    const limite = isPortrait ? 8 : 5;
    if (!eventos || eventos.length === 0) {
      return true;
    }

    if (isPortrait && eventos.length > 8) {
      // Si es portrait y supera los 8 eventos, recargar la página

      return false; // No es necesario volver a habilitar el loop, ya que la página se recargará
    }

    if (!isPortrait && eventos.length > 5) {
      // Si no es portrait y supera los 5 eventos, recargar la página

      return false; // No es necesario volver a habilitar el loop, ya que la página se recargará
    }

    return true;
  };
  // Uso de eventosPorSlide en useKeenSlider
  const [sliderRef] = useKeenSlider(
    {
      slides: eventosPorSlide.length,
      loop: false,
    },
    [
      (slider) => {
        let timeout;
        let mouseOver = false;
        function clearNextTimeout() {
          clearTimeout(timeout);
        }
        function nextTimeout() {
          clearTimeout(timeout);
          if (mouseOver) return;
          timeout = setTimeout(() => {
            slider.next();
          }, 1000000000000000);
        }
        slider.on("created", () => {
          slider.container.addEventListener("mouseover", () => {
            mouseOver = true;
            clearNextTimeout();
          });
          slider.container.addEventListener("mouseout", () => {
            mouseOver = false;
            nextTimeout();
          });
          nextTimeout();
        });
        slider.on("dragStarted", clearNextTimeout);
        slider.on("animationEnded", nextTimeout);
        slider.on("updated", nextTimeout);
      },
    ]
  );

  useEffect(() => {
    // Importar Firebase solo en el lado del cliente
    const firebaseConfig = {
      apiKey: "AIzaSyDpo0u-nVMA4LnbInj_qAkzcUfNtT8h29o",
      authDomain: "upper-b0be3.firebaseapp.com",
      projectId: "upper-b0be3",
      storageBucket: "upper-b0be3.appspot.com",
      messagingSenderId: "295362615418",
      appId: "1:295362615418:web:c22cac2f406e4596c2c3c3",
      measurementId: "G-2E66K5XY81",
    };

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

  useEffect(() => {
    if (user && firestore) {
      const userRef = doc(firestore, "usuarios", user.uid);
      const obtenerUsuario = async () => {
        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            const nombrePantallasUsuario =
              userData.nombrePantallasDirectorio || {};
            const pantallasNumeradas = {};

            Object.keys(nombrePantallasUsuario).forEach((key, index) => {
              pantallasNumeradas[nombrePantallasUsuario[key]] = index + 1;
            });

            const eventosRef = collection(firestore, "eventos");
            const eventosQuery = query(
              eventosRef,
              where("userId", "==", user.uid)
            );
            const querySnapshot = await getDocs(eventosQuery);

            const eventosData = [];
            querySnapshot.forEach((doc) => {
              const evento = { id: doc.id, ...doc.data() };
              const devicesEvento = evento.devices || [];

              const pantallaCoincidente = devicesEvento.find((device) =>
                Object.keys(pantallasNumeradas).includes(device)
              );

              if (pantallaCoincidente) {
                const posicionPantalla =
                  pantallasNumeradas[pantallaCoincidente];
                const posicionActual = parseInt(numeroPantallaActual, 10);
                if (posicionPantalla === posicionActual) {
                  // Agregar el filtro para eventos del día en curso

                  const fechaInicio = new Date(
                    `${evento.fechaInicio}T00:00:00`
                  );
                  fechaInicio.setDate(fechaInicio.getDate()); // Sumar 1 día

                  const fechaFinal = new Date(`${evento.fechaFinal}T23:59:59`);
                  fechaFinal.setDate(fechaFinal.getDate()); // Sumar 1 día

                  const hoy = new Date();

                  if (fechaInicio <= hoy && hoy <= fechaFinal) {
                    eventosData.push(evento);
                  }
                }
              }
            });

            const eventosOrdenados = eventosData.slice().sort((a, b) => {
              const fechaFinalA = new Date(a.fechaFinal);
              const fechaFinalB = new Date(b.fechaFinal);

              // Ordenar por fechaFinal más cercana a la actual
              if (fechaFinalA > fechaFinalB) return 1;
              if (fechaFinalA < fechaFinalB) return -1;

              // Si la fecha final es la misma, ordenar por horaInicialSalon
              const horaInicioA = new Date(`2000-01-01T${a.horaInicialSalon}`);
              const horaInicioB = new Date(`2000-01-01T${b.horaInicialSalon}`);

              return horaInicioA - horaInicioB;
            });

            const templateRef = collection(firestore, "TemplateDirectorios");
            const templateQuery = query(
              templateRef,
              where("userId", "==", user.uid)
            );
            const templateSnapshot = await getDocs(templateQuery);

            if (!templateSnapshot.empty) {
              const templateData = [];
              templateSnapshot.forEach((doc) => {
                const template = { id: doc.id, ...doc.data() };
                templateData.push(template);
                setSelectedCity({
                  value: template.ciudad,
                  label: template.ciudad,
                });
              });
              setTemplateData(templateData);
            } else {
              console.log(
                "No se encontró información en TemplateDirectorios para este usuario."
              );
            }

            setEventosEnCurso(eventosOrdenados);
          } else {
            console.log("No se encontraron datos para este usuario.");
          }
        } catch (error) {
          console.error("Error al obtener datos del usuario:", error);
        }
      };

      obtenerUsuario();

      const interval = setInterval(() => {
        obtenerUsuario(); // Llamar a la función cada 5 segundos
      }, 50000);

      return () => clearInterval(interval); // Limpiar el intervalo al desmontar el componente
    }
  }, [user, firestore]);
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
          console.error("Error al obtener datos del clima:", error);
          setError("No se pudo obtener la información del clima");
          setIsLoading(false);
        });
    }
  }, [selectedCity]);

  const pantalla = "directorio";

  useEffect(() => {
    const fetchPublicidades = () => {
      if (user && firestore) {
        const publicidadesRef = collection(firestore, "Publicidad");
        const publicidadesQuery = query(
          publicidadesRef,
          where("userId", "==", user.uid)
        );

        getDocs(publicidadesQuery)
          .then((querySnapshot) => {
            const publicidades = [];
            querySnapshot.forEach((doc) => {
              const publicidad = { id: doc.id, ...doc.data() };
              // Comparar el tipo de la publicidad con la pantalla deseada
              if (publicidad.tipo === pantalla) {
                publicidades.push(publicidad);
              }
            });

            setPublicidadesUsuario(publicidades);
          })
          .catch((error) => {
            console.error("Error al obtener las publicidades:", error);
          });
      }
    };

    const interval = setInterval(() => {
      fetchPublicidades();
    }, 120000);

    fetchPublicidades(); // Llamar inicialmente

    return () => clearInterval(interval); // Limpiar el intervalo al desmontar el componente
  }, [user, firestore, pantalla]);

  const templateActual = templateData[0]; // Obtener el primer evento de la lista
  console.log("🚀 ~ PantallaDirec1 ~ templateActual:", templateActual);

  return (
    <>
      {/* contenido principal */}
      <div className="bg-gradient-to-t from-white  to-gray-200 text-gray-50 ">
        <div className=" text-black">
          {/* Imagen a la izquierda */}
          <div
            className="flex flex-col
              "
          >
            <div className="">
              <div className="space-y-5 pl-5 flex-grow">
                {/* Slots predeterminados */}
                <div ref={sliderRef} className="keen-slider">
                  {eventosPorSlide.map((slideEventos, index) => (
                    <div key={index} className="keen-slider__slide my-2">
                      {Array.from({
                        length: templateData[0]?.setPortrait ? 10 : 5,
                      }).map((_, innerIndex) => {
                        const evento = slideEventos[innerIndex]; // Obtener el evento si existe

                        return (
                          <div
                            key={innerIndex}
                            className="flex items-center space-x-4 space-y-5 border-b pr-8"
                            style={{
                              height: evento ? "auto" : "110px",
                              borderColor: templateActual.templateColor,
                            }} // Establecer la altura dependiendo de si hay evento o no
                          >
                            {/* ---- Evento ---- */}
                            {evento ? (
                              // Si hay evento, mostrar los detalles
                              <>
                                <div
                                  style={{
                                    position: "relative",
                                    overflow: "hidden",
                                    width: "5vw", // Ajusta el ancho del contenedor según sea necesario
                                    height: "5vw", // Ajusta el alto del contenedor según sea necesario
                                  }}
                                >
                                  <img
                                    style={{
                                      width: "5vw",
                                      height: "5vw",
                                      objectFit: "cover",
                                    }}
                                    src={evento.images[0]}
                                    alt={evento.nombreEvento}
                                  />
                                </div>

                                <div className="w-full ">
                                  <h3 className="font-bold mb-4 text-3xl">
                                    {evento.nombreEvento}
                                  </h3>
                                  <div className="grid grid-cols-7 gap-4 font-bold text-2xl ">
                                    {/* Columna 1: Nombre (a la izquierda) */}
                                    <p className="col-span-3 ">
                                      {evento.tipoEvento}
                                    </p>

                                    {/* Columna 2: Lugar (en el centro) */}
                                    <p className="col-span-3 text-center ">
                                      {evento.lugar}
                                    </p>

                                    {/* Columna 3: Rango de horas (a la derecha) */}
                                    <p className="col-span-1 text-right ">
                                      {evento.horaInicialSalon + " a "}

                                      {evento.horaFinalSalon}
                                      {"HRS"}
                                    </p>
                                  </div>
                                </div>
                              </>
                            ) : (
                              // Si no hay evento, mostrar el mensaje de casillero vacío
                              <p></p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
