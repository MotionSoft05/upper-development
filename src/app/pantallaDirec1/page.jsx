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
import SliderRSS from "@/components/SliderRSS";
import LogIn from "../login/page"; // Importa el componente LogIn
import { usePathname } from "next/navigation";
const obtenerHora = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

function PantallaDirec1() {
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
  const pathname = usePathname();
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
    templateData[0]?.setPortrait ? 7 : 5
  );

  useEffect(() => {
    // Actualizar la configuración de loop cuando eventosEnCurso cambia
    sliderRef.current?.refresh();
  }, [eventosEnCurso]);
  console.log("🚀 ~ PantallaDirec1 ~ eventosEnCurso:", eventosEnCurso);

  // Función para determinar la condición de loop
  const determineLoopCondition = (isPortrait, eventos) => {
    const limite = isPortrait ? 7 : 5;
    if (!eventos || eventos.length === 0) {
      return true;
    }

    if (isPortrait && eventos.length > 7) {
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
      loop: true,
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
          }, 10000);
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
  //? console.log("user", user);
  const obtenerDiaActual = () => {
    const diasSemana = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    const now = new Date();
    return diasSemana[now.getDay()];
  };

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
              console.log("🚀 ~ obtenerUsuario ~ templateData:", templateData);
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
  // Publicidades-------------------------------------------

  // ----------------- RSS ---------------------------
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
        console.error("Error fetching or parsing data:", error)
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

  // const [currentIndex, setCurrentIndex] = useState(0);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     // Cambiar al siguiente índice, o volver al principio si llegamos al final
  //     setCurrentIndex((prevIndex) =>
  //       prevIndex === rssItems.length - 1 ? 0 : prevIndex + 1
  //     );
  //   }, 3000); // Cambia cada 3000 milisegundos (3 segundos)

  //   // Limpiar el intervalo cuando el componente se desmonta
  //   return () => clearInterval(interval);
  // }, [rssItems]); // Asegúrate de que el efecto se ejecute cuando rssItems cambie

  // ----------------- RSS ---------------------------

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

  const obtenerFecha = () => {
    const diasSemana = [
      "DOMINGO",
      "LUNES",
      "MARTES",
      "MIÉRCOLES",
      "JUEVES",
      "VIERNES",
      "SÁBADO",
    ];

    const meses = [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
    ];

    const now = new Date();
    const diaSemana = diasSemana[now.getDay()];
    const dia = now.getDate();
    const mes = meses[now.getMonth()];

    return `${diaSemana} ${dia}/${mes} `;
  };

  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  useEffect(() => {
    let timeoutId;

    const changeMedia = () => {
      setCurrentMediaIndex(
        (prevIndex) => (prevIndex + 1) % publicidadesUsuario.length
      );
    };

    const currentAd = publicidadesUsuario[currentMediaIndex];
    if (currentAd) {
      const isVideo = !!currentAd.videoUrl;
      const totalSeconds = isVideo
        ? currentAd.segundos + currentAd.minutos * 60 + currentAd.horas * 3600
        : currentAd.segundos; // Utilizamos el tiempo de la imagen si no es un vídeo

      timeoutId = setTimeout(changeMedia, totalSeconds * 1000);
    } else {
      timeoutId = setTimeout(changeMedia, 5000); // Cambiar cada 5 segundos si no hay datos
    }

    return () => clearTimeout(timeoutId);
  }, [currentMediaIndex, publicidadesUsuario]);

  // Iniciar cuenta regresiva
  const [countdown, setCountdown] = useState(15); // Cambia 10 por el tiempo deseado en segundos
  useEffect(() => {
    let timer;
    if (!eventosEnCurso || eventosEnCurso.length === 0) {
      if (!publicidadesUsuario || publicidadesUsuario.length === 0) {
        if (countdown > 0) {
          timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else {
          window.location.reload(); // Reiniciar página al llegar a cero
        }
        return;
      }
      return;
    }

    return () => clearTimeout(timer);
  }, [countdown, publicidadesUsuario]);
  if (!user) {
    return <LogIn url={pathname} />;
  }
  if (!eventosEnCurso || eventosEnCurso.length === 0) {
    if (!publicidadesUsuario || publicidadesUsuario.length === 0) {
      // Renderizar cuenta regresiva

      return (
        <>
          <section className="relative inset-0 w-full min-h-screen md:fixed sm:fixed min-[120px]:fixed bg-white">
            <p>
              No se a encontrado ningún evento o publicidad. La pagina se
              reiniciara en {countdown} segundos
            </p>
          </section>
        </>
      );
    }

    const currentAd = publicidadesUsuario[currentMediaIndex];
    const isVideo = !!currentAd.videoUrl;

    return (
      <>
        <section className="relative inset-0 w-full min-h-screen md:fixed sm:fixed min-[120px]:fixed bg-white">
          <div className="slider-container">
            <div ref={sliderRef} className="fader" style={{ height: "100vh" }}>
              {isVideo ? (
                // Si es un video, muestra un elemento de video
                <video
                  src={currentAd.videoUrl}
                  alt={`Video ${currentMediaIndex}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                // Si no es un video, muestra una imagen
                <img
                  src={currentAd.imageUrl}
                  alt={`Image ${currentMediaIndex}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
            </div>
          </div>
        </section>
      </>
    );
  }

  const templateActual = templateData[0]; // Obtener el primer evento de la lista
  console.log("🚀 ~ PantallaDirec1 ~ templateActual:", templateActual);

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // console.log("CLIMA", weatherData.current.condition.icon);

  return (
    <section className="relative inset-0 w-full min-h-screen md:fixed sm:fixed min-[120px]:fixed bg-white">
      <div
        className="bg-white text-black h-screen flex flex-col justify-center  "
        style={{
          transform: templateData[0]?.setPortrait
            ? "rotate(90deg)"
            : "rotate(0deg)  ",
          maxWidth: templateData[0]?.setPortrait ? "100vh" : "", // Establecer el ancho máximo para ajustarse a la pantalla
          height: templateData[0]?.setPortrait ? "100vh" : "", // Ajustar la altura según la orientación
          width: templateData[0]?.setPortrait ? "100%" : "", // Asegurar que el ancho se ajuste correctamente
          marginLeft: templateData[0]?.setPortrait ? "auto" : "",
          marginRight: templateData[0]?.setPortrait ? "auto" : "",
        }}
      >
        <div
          id="Content"
          className="flex-grow flex flex-col justify-center mx-2 my-2 "
        >
          {/* Header */}
          <div className="flex items-center justify-between ">
            {/* Logo en la esquina superior izquierda */}
            <div className=" ">
              {templateActual.logo && (
                <>
                  <div
                    style={{
                      width: "15vw",
                      height: "8vw",
                      overflow: "hidden",
                      marginBottom: "20px",
                    }}
                  >
                    <img
                      src={templateActual.logo}
                      alt="Logo"
                      className="rounded-lg object-contain w-full h-full  "
                      onClick={() => {
                        cambiarOrientacion();
                      }}
                    />
                  </div>
                </>
              )}
            </div>
            {/* ---- Titulo Eventos del dia y Fecha---- */}
            <div
              className="flex flex-col text-color items-center"
              style={{
                fontFamily: templateActual.fontStyle,
              }}
            >
              <p className="text-3xl text-center  mb-2">
                {obtenerFecha()}-{currentHour}
              </p>
              <h1 className="text-5xl font-bold">Eventos del día</h1>
            </div>

            {/* ---- Clima e Icono ---- */}
            <div
              className="flex text-color flex-col"
              style={{
                fontFamily: templateActual.fontStyle,
              }}
            >
              {isLoading ? (
                <p>Cargando datos del clima...</p>
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
                <h2 className="text-4xl mr-16">Bienvenido</h2> //si no da el Clima muestra un mensaje de Bienvenida
              )}
            </div>
          </div>
          {/* Contenedor de eventos */}
          {!templateData[0]?.setPortrait ? (
            <div className="grid grid-cols-4 bg-white">
              <div className="col-span-3 md:col-span-3  mx-3">
                {/* Linea arriba */}{" "}
                <div
                  className={` text-black py-1 uppercase text-5xl  md:text-7xl font-bold px-20 rounded-t-xl h-16`}
                  style={{
                    background: `linear-gradient(to bottom, ${templateActual.templateColor} 70%, #e3e3e3d9)`, // Ajusta el punto de inicio del degradado
                    color: templateActual.fontColor,
                    fontFamily: templateActual.fontStyle,
                  }}
                >
                  {/* Título */}
                  <h2 className=" text-4xl text-center">EVENTOS</h2>
                </div>
                {/* contenido principal */}
                <div
                  className=" bg-gradient-to-t from-white to-gray-200  relative z-20"
                  style={{}}
                >
                  <div className=" ">
                    <div className="flex flex-col">
                      <div className="space-y-5 pl-5 flex-grow">
                        <div className="">
                          {/* Parte con slider horizontal  ------------------------------------------------------------------ */}
                          <div
                            className=""
                            style={{
                              display:
                                (templateData[0]?.setPortrait &&
                                  eventosEnCurso.length < 8) ||
                                (!templateData[0]?.setPortrait &&
                                  eventosEnCurso.length < 6)
                                  ? "none"
                                  : "",
                            }}
                          >
                            <div ref={sliderRef} className="keen-slider">
                              {eventosPorSlide.map((slideEventos, index) => (
                                <div
                                  key={index}
                                  className="keen-slider__slide my-2"
                                >
                                  {Array.from({
                                    length: templateData[0]?.setPortrait
                                      ? 7
                                      : 5,
                                  }).map((_, innerIndex) => {
                                    const evento = slideEventos[innerIndex]; // Obtener el evento si existe

                                    return (
                                      <div
                                        key={innerIndex}
                                        className="flex items-center space-x-4 space-y-5 border-b pr-8"
                                        style={{
                                          height: evento ? "auto" : "110px",
                                          borderColor:
                                            templateActual.templateColor,
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
                                              <div className="grid grid-cols-3 gap-1 font-bold text-2xl ">
                                                {/* Columna 1: Nombre (a la izquierda) */}
                                                <p className="col-span-3">
                                                  {evento.tipoEvento}
                                                </p>
                                                <p className=" ">
                                                  {evento.devices[0]}
                                                </p>
                                                {/* Columna 2: Lugar (en el centro) */}
                                                <p className="text-center ">
                                                  {evento.lugar}
                                                </p>

                                                {/* Columna 3: Rango de horas (a la derecha) */}
                                                <p className=" text-right ">
                                                  {evento.horaInicialSalon +
                                                    " a "}
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
                          {/* Parte sin slider horizontal ------------------------------------------------------------------ */}
                          <div
                            className=""
                            style={{
                              display:
                                (templateData[0]?.setPortrait &&
                                  eventosEnCurso.length > 7) ||
                                (!templateData[0]?.setPortrait &&
                                  eventosEnCurso.length > 5)
                                  ? "none"
                                  : "",
                            }}
                          >
                            {eventosPorSlide.map((slideEventos, index) => (
                              <div key={index} className="my-2 ">
                                {Array.from({
                                  length: templateData[0]?.setPortrait ? 7 : 5,
                                }).map((_, innerIndex) => {
                                  const evento = slideEventos[innerIndex]; // Obtener el evento si existe

                                  return (
                                    <div
                                      key={innerIndex}
                                      className="flex items-center space-x-4 space-y-5 border-b pr-8"
                                      style={{
                                        height: evento ? "auto" : "110px",
                                        borderColor:
                                          templateActual.templateColor,
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
                                            <div className="grid grid-cols-3 gap-1 font-bold text-2xl ">
                                              {/* Columna 1: Nombre (a la izquierda) */}
                                              <p className="col-span-3">
                                                {evento.tipoEvento}
                                              </p>
                                              <p className=" ">
                                                {evento.devices[0]}
                                              </p>
                                              {/* Columna 2: Lugar (en el centro) */}
                                              <p className="text-center ">
                                                {evento.lugar}
                                              </p>

                                              {/* Columna 3: Rango de horas (a la derecha) */}
                                              <p className=" text-right ">
                                                {evento.horaInicialSalon +
                                                  " a "}
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
                {/* Linea abajo */}
                <div
                  className={`text-white py-1 uppercase text-5xl md:text-7xl font-bold px-20 rounded-b-xl h-16 flex justify-center items-end`}
                  style={{
                    background: `linear-gradient(to top, ${templateActual.templateColor} 70%, #e3e3e3d9)`, // Ajusta el punto de inicio del degradado

                    fontFamily: templateActual.fontStyle,
                  }}
                >
                  {/* Título */}
                  <h2
                    className="text-color text-4xl text-center align-bottom "
                    style={{ color: templateActual.fontColor }}
                  >
                    NOTICIAS
                  </h2>
                </div>
              </div>
              <div className="col-span-3 md:col-span-1 flex items-center justify-center  m-3">
                <div
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    width: "100%", // Hacer que ocupe el 100% del ancho del contenedor
                    height: "100%", // Hacer que ocupe el 100% del alto del contenedor
                    borderRadius: "10px", // Redondear las esquinas
                  }}
                >
                  <img
                    style={{
                      width: "100%", // Hacer que la imagen ocupe el 100% del ancho del contenedor
                      height: "100%", // Hacer que la imagen ocupe el 100% del alto del contenedor
                      borderRadius: "10px", // Redondear las esquinas objectFit: "cover",
                    }}
                    src={templateData[0].publicidad}
                    alt="Publicidad"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="">
              {/* Linea arriba */}{" "}
              <div
                className={` py-1 uppercase text-5xl  md:text-7xl font-bold px-20 rounded-t-xl h-16`}
                style={{
                  // backgroundColor: templateActual.templateColor,
                  background: `linear-gradient(to bottom, ${templateActual.templateColor} 70%, #e3e3e3d9)`,

                  fontFamily: templateActual.fontStyle,
                }}
              >
                {/* Título */}
                <h2
                  className=" text-4xl text-center"
                  style={{
                    // backgroundColor: templateActual.templateColor,

                    color: templateActual.fontColor,
                  }}
                >
                  EVENTOS
                </h2>
              </div>
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
                        <div className="">
                          {/* Parte con slider Vertical ------------------------------------------------------------------ */}

                          <div
                            className=""
                            style={{
                              display:
                                (templateData[0]?.setPortrait &&
                                  eventosEnCurso.length < 8) ||
                                (!templateData[0]?.setPortrait &&
                                  eventosEnCurso.length < 6)
                                  ? "none"
                                  : "",
                            }}
                          >
                            <div ref={sliderRef} className="keen-slider">
                              {eventosPorSlide.map((slideEventos, index) => (
                                <div
                                  key={index}
                                  className="keen-slider__slide my-2"
                                >
                                  {Array.from({
                                    length: templateData[0]?.setPortrait
                                      ? 7
                                      : 5,
                                  }).map((_, innerIndex) => {
                                    const evento = slideEventos[innerIndex]; // Obtener el evento si existe

                                    return (
                                      <div
                                        key={innerIndex}
                                        className="flex items-center space-x-4 space-y-5 border-b pr-8"
                                        style={{
                                          height: evento ? "auto" : "110px",
                                          borderColor:
                                            templateActual.templateColor,
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
                                              <div className="grid grid-cols-3 gap-4 font-bold text-2xl ">
                                                {/* Columna 1: Nombre (a la izquierda) */}
                                                <p className="col-span-3">
                                                  {evento.tipoEvento}
                                                </p>
                                                <p className=" ">
                                                  {evento.devices[0]}
                                                </p>
                                                {/* Columna 2: Lugar (en el centro) */}
                                                <p className="text-center ">
                                                  {evento.lugar}
                                                </p>

                                                {/* Columna 3: Rango de horas (a la derecha) */}
                                                <p className=" text-right ">
                                                  {evento.horaInicialSalon +
                                                    " a "}
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
                          {/* Parte sin slider Vertical ------------------------------------------------------------------*/}
                          <div
                            className=""
                            style={{
                              display:
                                (templateData[0]?.setPortrait &&
                                  eventosEnCurso.length > 7) ||
                                (!templateData[0]?.setPortrait &&
                                  eventosEnCurso.length > 5)
                                  ? "none"
                                  : "",
                            }}
                          >
                            {eventosPorSlide.map((slideEventos, index) => (
                              <div key={index} className="my-2 ">
                                {Array.from({
                                  length: templateData[0]?.setPortrait ? 7 : 5,
                                }).map((_, innerIndex) => {
                                  const evento = slideEventos[innerIndex]; // Obtener el evento si existe

                                  return (
                                    <div
                                      key={innerIndex}
                                      className="flex items-center space-x-4 space-y-5 border-b pr-8"
                                      style={{
                                        height: evento ? "auto" : "110px",
                                        borderColor:
                                          templateActual.templateColor,
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
                                            <div className="grid grid-cols-3 gap-4 font-bold text-2xl ">
                                              {/* Columna 1: Nombre (a la izquierda) */}
                                              <p className="col-span-3">
                                                {evento.tipoEvento}
                                              </p>
                                              <p className=" ">
                                                {evento.devices[0]}
                                              </p>
                                              {/* Columna 2: Lugar (en el centro) */}
                                              <p className="text-center ">
                                                {evento.lugar}
                                              </p>

                                              {/* Columna 3: Rango de horas (a la derecha) */}
                                              <p className=" text-right ">
                                                {evento.horaInicialSalon +
                                                  " a "}
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
              </div>
              {/* Linea abajo */}
              <div
                className={`text-white py-1 uppercase text-5xl  md:text-7xl font-bold px-20 rounded-b-xl h-16`}
                style={{
                  // backgroundColor: templateActual.templateColor,
                  background: `linear-gradient(to top, ${templateActual.templateColor} 70%, #e3e3e3d9)`,
                  color: templateActual.fontColor,
                  fontFamily: templateActual.fontStyle,
                }}
              >
                {/* Título */}
                <h2
                  className="text-color text-4xl text-center"
                  style={{
                    color: templateActual.fontColor,
                  }}
                >
                  NOTICIAS
                </h2>
              </div>
            </div>
          )}
          {/* texto de abajo */}
          <div className=" bg-white">
            <div className="flex justify-between text-color items-center">
              {/* --- RSS --- */}
              <div className="w-9/12 ">
                <div className="flex ml-3  items-center my-3 font-black bg-gradient-to-r from-gray-300 to-white w-full h-36 rounded-md">
                  <SliderRSS />
                </div>
                {/* {rssItems.map((item, index) => (
                <div className="my-3 font-black" key={index}>
                  <Textra
                    effect="topDown"
                    duration={1000}
                    stopDuration={4000}
                    data={[rssItems[index].title]}
                  />
                </div>
              ))} */}
              </div>
              {/* --- QR image --- */}
              <div
                className="flex flex-col items-center"
                style={{
                  marginTop: "20px",
                  marginRight: "20px",
                  marginBottom: "20px",
                }}
              >
                <p style={{ marginBottom: "10px" }}>
                  Eventos en tu dispositivo
                </p>
                {qrCodeUrl && (
                  <a
                    href={qrCodeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ cursor: "pointer" }}
                  >
                    {/* Muestra el código QR */}
                    <QRCode value={qrCodeUrl} size={100} />
                  </a>
                )}
              </div>
            </div>
            <div
              className={`col-span-3 md:col-span-1 flex items-center justify-center m-3 ${
                !templateData[0]?.setPortrait ? "hidden" : ""
              }`}
            >
              <div
                style={{
                  position: "relative",
                  overflow: "hidden",
                  width: "100%", // Ajusta el ancho del contenedor según sea necesario
                  height: "27vw", // Ajusta el alto del contenedor según sea necesario
                  borderRadius: "10px", // Redondear las esquinas
                }}
              >
                <img
                  style={{
                    width: "100%",
                    height: "27vw",
                    objectFit: "cover",
                  }}
                  src={templateData[0]?.publicidad}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PantallaDirec1;
