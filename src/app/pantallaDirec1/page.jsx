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
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { firebaseConfig } from "@/firebase/firebaseConfig";
const obtenerHora = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

function PantallaDirec1() {
  const searchParams = useSearchParams();
  const empresaNombre = searchParams.get("emp");

  const isProduction = process.env.NEXT_PUBLIC_PRODUCTION; // Deploy (.html) o  en localhost()
  const { t } = useTranslation();
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
  console.log(
    "🚀 ~ PantallaDirec1 ~ publicidadesUsuario:",
    publicidadesUsuario
  );
  const [rssItems, setRssItems] = useState([]); // Estado para almacenar los elementos del RSS
  const pathname = usePathname();
  useEffect(() => {
    if (user) {
      // Obtén la URL base del navegador
      const baseUrl = window.location.origin;

      // Actualiza la URL del código QR al cambiar el usuario
      // setQrCodeUrl(`${baseUrl}/paginasAleatorias.html?qr=${user.uid}`);
      setQrCodeUrl(
        `${baseUrl}/paginasAleatorias${isProduction}?qr=${user.uid}`
      );
    }
  }, [user]);

  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Obtener el tamaño inicial

    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    templateData[0]?.setPortrait ? 5 : 5
  );

  useEffect(() => {
    // Actualizar la configuración de loop cuando eventosEnCurso cambia
    sliderRef.current?.refresh();
  }, [eventosEnCurso]);
  console.log("🚀 ~ PantallaDirec1 ~ eventosEnCurso:", eventosEnCurso);

  // Función para determinar la condición de loop
  const determineLoopCondition = (isPortrait, eventos) => {
    const limite = isPortrait ? 6 : 5;
    if (!eventos || eventos.length === 0) {
      return true;
    }

    if (isPortrait && eventos.length > 6) {
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
            let userCompany = "";

            if (userData.empresa === empresaNombre) {
              userCompany = userData.empresa;
            } else {
              userCompany = empresaNombre;
            }
            console.log("🚀 ~ obtenerUsuario ~ userCompany:", userCompany);
            const nombrePantallasUsuario =
              userData.nombrePantallasDirectorio || {};
            const pantallasNumeradas = {};

            Object.keys(nombrePantallasUsuario).forEach((key, index) => {
              pantallasNumeradas[nombrePantallasUsuario[key]] = index + 1;
            });

            const eventosRef = collection(firestore, "eventos");
            const eventosQuery = query(
              eventosRef,
              where("empresa", "==", userCompany)
            );
            const querySnapshot = await getDocs(eventosQuery);

            const eventosData = [];
            console.log("🚀 ~ obtenerUsuario ~ eventosData:", eventosData);
            querySnapshot.forEach((doc) => {
              const evento = { id: doc.id, ...doc.data() };
              console.log("🚀 ~ querySnapshot.forEach ~ evento:", evento);

              // Validación de devices y status
              const { devices, status } = evento;

              // Verificar si el array de devices no está vacío y al menos un device es válido
              const hasValidDevice =
                devices.length > 0 &&
                devices.some((device) => device in pantallasNumeradas);

              if (hasValidDevice && status) {
                eventosData.push(evento);
              }
            });

            const eventosOrdenados = eventosData.filter((evento) => {
              console.log("🚀 ~ eventosOrdenados ~ evento:", evento);
              // Obtener fecha actual (solo día)
              const fechaActual = new Date();
              fechaActual.setHours(0, 0, 0, 0); // Establecer hora, minutos, segundos y milisegundos a cero
              console.log(
                "🚀 ~ eventosOrdenados ~ fechaActual (sin hora):",
                fechaActual
              );

              // Obtener fechas de inicio y finalización del evento (solo día)
              const fechaInicioEvento = new Date(evento.fechaInicio);

              // Ajustar fecha de inicio al día correcto sumando 24 horas (un día completo)
              fechaInicioEvento.setDate(fechaInicioEvento.getDate() + 1);
              fechaInicioEvento.setHours(0, 0, 0, 0); // Establecer hora, minutos, segundos y milisegundos a cero

              console.log(
                "🚀 ~ eventosOrdenados ~ fechaInicioEvento:",
                fechaInicioEvento
              );

              const fechaFinalEvento = new Date(evento.fechaFinal);

              // Ajustar fecha de finalización al día correcto sumando 24 horas (un día completo)
              fechaFinalEvento.setDate(fechaFinalEvento.getDate() + 1);
              fechaFinalEvento.setHours(0, 0, 0, 0); // Establecer hora, minutos, segundos y milisegundos a cero

              console.log(
                "🚀 ~ eventosOrdenados ~ fechaFinalEvento:",
                fechaFinalEvento
              );
              const horaActual = obtenerHora();
              console.log("🚀 ~ eventosOrdenados ~ horaActual:", horaActual);
              const horaInicialEvento = evento.horaInicialSalon;
              console.log(
                "🚀 ~ eventosOrdenados ~ horaInicialEvento:",
                horaInicialEvento
              );
              const horaFinalEvento = evento.horaFinalSalon;
              console.log(
                "🚀 ~ eventosOrdenados ~ horaFinalEvento:",
                horaFinalEvento
              );

              const fechaActualEnRango =
                fechaActual >= fechaInicioEvento &&
                fechaActual <= fechaFinalEvento;
              console.log(
                "🚀 ~ eventosOrdenados ~ fechaActualEnRango:",
                fechaActualEnRango
              );
              const horaActualEnRango = horaActual <= horaFinalEvento;
              console.log(
                "🚀 ~ eventosOrdenados ~ horaActualEnRango:",
                horaActualEnRango
              );
              // Filtrar eventos por empresa
              const empresaCoincidente = evento.empresa === userCompany;
              console.log(
                "🚀 ~ eventosOrdenados ~ empresaCoincidente:",
                empresaCoincidente
              );

              // Si la fecha final es mayor a la fecha actual, el evento sigue apareciendo.
              const mostrarPorFecha = fechaFinalEvento > fechaActual;
              console.log(
                "🚀 ~ eventosOrdenados ~ mostrarPorFecha:",
                mostrarPorFecha
              );

              return (
                (fechaActualEnRango &&
                  horaActualEnRango &&
                  empresaCoincidente) ||
                (mostrarPorFecha &&
                  fechaActualEnRango &&
                  horaActualEnRango &&
                  empresaCoincidente)
              );
            });

            const templateRef = collection(firestore, "TemplateDirectorios");

            const templateQuery = query(
              templateRef,
              where("empresa", "==", userCompany)
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
                // "No se encontró información en TemplateDirectorios para este usuario."
                t("pantallaDirec.templateDirectoryNotFound")
              );
            }
            //  Sección template
            //  Sección publicidad
            if (eventosOrdenados.length === 0) {
              console.log("🚀 ~ Entro a publicidad:");
              const pantalla = "directorio";
              console.log("🚀 ~ obtenerUsuario ~ pantalla:", pantalla);
              const publicidadesRef = collection(firestore, "Publicidad");
              console.log(
                "🚀 ~ obtenerUsuario ~ publicidadesRef:",
                publicidadesRef
              );

              const publicidadesQuery = query(
                publicidadesRef,
                where("empresa", "==", userCompany)
              );
              const publicidadesSnapshot = await getDocs(publicidadesQuery);

              if (!publicidadesSnapshot.empty) {
                const publicidades = [];
                console.log(
                  "🚀 ~ obtenerUsuario ~ publicidades:",
                  publicidades
                );
                publicidadesSnapshot.forEach((doc) => {
                  const publicidad = { id: doc.id, ...doc.data() };
                  // Comparar el tipo de la publicidad con la pantalla deseada

                  if (publicidad.tipo === pantalla) {
                    publicidades.push(publicidad);
                  }
                });

                setPublicidadesUsuario(publicidades);
              } else {
                console.log(
                  // "No se encontró información en TemplateDirectorios para este usuario."
                  t("pantalla.error.publicidadesDirectoryNotFound")
                );
              }
            }

            setEventosEnCurso(eventosOrdenados);
          } else {
            // "No se encontraron datos para este usuario."
            console.log(t("pantallaDirec.noDataFound"));
          }
        } catch (error) {
          // "Error al obtener datos del usuario:"
          console.error(t("pantallaDirec.userDataFetchError"), error);
        }
      };

      obtenerUsuario();

      const interval = setInterval(() => {
        obtenerUsuario(); // Llamar a la función cada 5 segundos
      }, 60000);

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
          console.error(t("pantallaDirec.weatherDataFetchError"), error); // "Error al obtener datos del clima:"
          setError(t("pantallaDirec.weatherInfoUnavailable")); // "No se pudo obtener la información del clima"
          setIsLoading(false);
        });
    }
  }, [selectedCity]);
  // Publicidades-------------------------------------------

  // ----------------- RSS ---------------------------
  // useEffect(() => {
  //   axios
  //     .get("https://upperds.onrender.com/fetch-rss")
  //     .then((response) => {
  //       const items = response.data.items.map((item) => ({
  //         title: removeSymbols(item.title),
  //         link: item.link,
  //         description: removeSymbols(item.description),
  //       }));
  //       setRssItems(items);
  //     })
  //     .catch((error) =>
  //       // "Error fetching or parsing data:"
  //       console.error(t("pantallaDirec.fetchingOrParsingDataError"), error)
  //     );
  // }, []);

  // // Función para eliminar símbolos de una cadena de texto
  // const removeSymbols = (text) => {
  //   // Expresión regular para eliminar símbolos
  //   const regex = /[^a-zA-Z0-9\s,.:-]/g;
  //   // Aplicar el regex y reemplazar los símbolos con una cadena vacía
  //   return text.replace(regex, "");
  // };

  // let timeOutRss = 7000; // valor de cambio de animacion de RSS
  // const [displayedItem, setDisplayedItem] = useState("");

  // useEffect(() => {
  //   let currentIndex = 0;

  //   const interval = setInterval(() => {
  //     setDisplayedItem(rssItems[currentIndex].title);

  //     // Cambiar al siguiente índice, o volver al principio si llegamos al final
  //     currentIndex = (currentIndex + 1) % rssItems.length;
  //   }, 7000); // Cambia cada 2000 milisegundos (2 segundos)

  //   // Limpiar el intervalo cuando el componente se desmonta
  //   return () => clearInterval(interval);
  // }, [rssItems]);

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

  const obtenerFecha = () => {
    const diasSemana = {
      es: [
        "domingo",
        "lunes",
        "martes",
        "miércoles",
        "jueves",
        "viernes",
        "sábado",
      ],
      en: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
    };

    const meses = {
      es: [
        "enero",
        "febrero",
        "marzo",
        "abril",
        "mayo",
        "junio",
        "julio",
        "agosto",
        "septiembre",
        "octubre",
        "noviembre",
        "diciembre",
      ],
      en: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
    };

    const now = new Date();
    const diaSemanaEs = diasSemana["es"][now.getDay()];
    const dia = now.getDate();
    const mesEs = meses["es"][now.getMonth()];

    const diaSemanaEn = diasSemana["en"][now.getDay()];
    const mesEn = meses["en"][now.getMonth()];

    if (templateActual.idioma === "es") {
      return `${diaSemanaEs} ${dia} ${mesEs}`;
    } else if (templateActual.idioma === "en") {
      return `${diaSemanaEn} ${dia} ${mesEn}`;
    } else if (templateActual.idioma === "es-en") {
      return `${diaSemanaEs} ${dia} ${mesEs} / ${diaSemanaEn} ${dia} ${mesEn}`;
    }
  };

  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  useEffect(() => {
    let timeoutId;

    const changeMedia = () => {
      setCurrentMediaIndex(
        (prevIndex) => (prevIndex + 1) % publicidadesUsuario.length || 0
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
  const [countdown, setCountdown] = useState(60); // Cambia 10 por el tiempo deseado en segundos
  useEffect(() => {
    let timer;
    if (eventosEnCurso.length === 0 && user) {
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
  const templateActual = templateData[0]; // Obtener el primer evento de la lista
  if (!eventosEnCurso || eventosEnCurso.length === 0) {
    if (!publicidadesUsuario || publicidadesUsuario.length === 0) {
      // Renderizar cuenta regresiva

      return (
        <>
          <section className="relative inset-0 w-full min-h-screen md:fixed sm:fixed min-[120px]:fixed bg-white">
            <p>
              {/* No se a encontrado ningún evento o publicidad. La pagina se
              reiniciara en {countdown} segundos */}
              {t("pantallaDirec.noEventsOrAdvertisements", { countdown })}
            </p>
          </section>
        </>
      );
    }

    const currentAd = publicidadesUsuario[currentMediaIndex];
    const isVideo = !!currentAd.videoUrl;

    return (
      <>
        <div
          className=" flex-col h-screen"
          style={{
            transform: templateData[0]?.setPortrait
              ? "rotate(90deg)"
              : "rotate(0deg)  ",
            maxWidth: templateData[0]?.setPortrait ? "100vh" : "", // Establecer el ancho máximo para ajustarse a la pantalla
            height: templateData[0]?.setPortrait ? "100vh" : "", // Ajustar la altura según la orientación
            width: templateData[0]?.setPortrait ? "100%" : "", // Asegurar que el ancho se ajuste correctamente
            marginLeft: templateData[0]?.setPortrait ? "auto" : "",
            marginRight: templateData[0]?.setPortrait ? "0px" : "",
            display: templateData[0]?.setPortrait ? "" : "flex",
          }}
        >
          <section>
            <div className="flex items-center justify-between ">
              {/* Logo en la esquina superior izquierda */}
              <div className=" ">
                {templateActual.logo && (
                  <>
                    <div className="ml-5" style={{ height: "100%" }}>
                      <img
                        src={templateActual.logo}
                        alt="Logo"
                        className="rounded-lg object-contain w-full h-full  "
                        style={{
                          width: windowSize.width / 8.6, // Dividir por 5 o cualquier otro factor para ajustar el tamaño
                          height: windowSize.height / 8.6, // Dividir por 10 o cualquier otro factor para ajustar el tamaño
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
                <p className="text-base text-center  mb-2">
                  {obtenerFecha()}-{currentHour}
                </p>
                <h1 className="text-2xl font-bold">
                  {/* Eventos del día */}
                  {templateActual.idioma === "en" && "Today's Events"}
                  {templateActual.idioma === "es" && "Eventos del día"}
                  {templateActual.idioma === "es-en" &&
                    "Eventos del día / Today's Events"}
                </h1>
              </div>

              {/* ---- Clima e Icono ---- */}
              <div
                className="flex text-color flex-col"
                style={{
                  fontFamily: templateActual.fontStyle,
                }}
              >
                {isLoading ? (
                  <p>
                    {/* Cargando datos del clima... */}
                    {templateActual.idioma === "en" &&
                      "Loading weather data..."}
                    {templateActual.idioma === "es" &&
                      "Cargando datos del clima..."}
                    {templateActual.idioma === "es-en" &&
                      "Cargando datos del clima... / Loading weather data..."}
                  </p>
                ) : weatherData &&
                  weatherData.current &&
                  weatherData.current.temp_c ? (
                  <div className="flex items-center  justify-center mr-4">
                    <img
                      src={weatherData.current.condition.icon}
                      alt="Clima"
                      className="w-16"
                    />
                    <p className="text-2xl font-bold ml-2 mr-6">
                      {weatherData.current.temp_c} °C
                    </p>
                  </div>
                ) : (
                  //si no da el Clima muestra un mensaje de Bienvenida
                  <h2 className="text-4xl mr-16">
                    {/* Bienvenido */}
                    {templateActual.idioma === "en" && "Welcome"}
                    {templateActual.idioma === "es" && "Bienvenido"}
                    {templateActual.idioma === "es-en" &&
                      "Bienvenido / Welcome"}
                  </h2>
                )}
              </div>
            </div>
          </section>

          <div
            ref={sliderRef}
            className="flex justify-center align-middle overflow-hidden"
          >
            <img
              src={currentAd.imageUrl}
              alt={`Image ${currentMediaIndex}`}
              className="w-full"
            />
          </div>
        </div>
      </>
    );
  }

  // Filtrar el primer evento que tenga "primeraImagen" en true
  const eventoConPrimeraImagen = eventosEnCurso.find(
    (evento) => evento.primeraImagen === true && evento.images.length > 0
  );
  if (eventoConPrimeraImagen) {
    return (
      <div
        className=" flex-col h-screen "
        style={{
          transform: templateData[0]?.setPortrait
            ? "rotate(90deg)"
            : "rotate(0deg)  ",
          maxWidth: templateData[0]?.setPortrait ? "100vh" : "", // Establecer el ancho máximo para ajustarse a la pantalla
          height: templateData[0]?.setPortrait ? "100vh" : "", // Ajustar la altura según la orientación
          width: templateData[0]?.setPortrait ? "100%" : "", // Asegurar que el ancho se ajuste correctamente
          marginLeft: templateData[0]?.setPortrait ? "auto" : "",
          marginRight: templateData[0]?.setPortrait ? "0px" : "",
          display: templateData[0]?.setPortrait ? "" : "flex",
        }}
      >
        <section>
          <div className="flex items-center justify-between ">
            {/* Logo en la esquina superior izquierda */}
            <div className=" ">
              {templateActual.logo && (
                <>
                  <div className="ml-5" style={{ height: "100%" }}>
                    <img
                      src={templateActual.logo}
                      alt="Logo"
                      className="rounded-lg object-contain w-full h-full  "
                      style={{
                        width: windowSize.width / 8.6, // Dividir por 5 o cualquier otro factor para ajustar el tamaño
                        height: windowSize.height / 8.6, // Dividir por 10 o cualquier otro factor para ajustar el tamaño
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
              <p className="text-base text-center  mb-2">
                {obtenerFecha()}-{currentHour}
              </p>
              <h1 className="text-2xl font-bold">
                {/* Eventos del día */}
                {templateActual.idioma === "en" && "Today's Events"}
                {templateActual.idioma === "es" && "Eventos del día"}
                {templateActual.idioma === "es-en" &&
                  "Eventos del día / Today's Events"}
              </h1>
            </div>

            {/* ---- Clima e Icono ---- */}
            <div
              className="flex text-color flex-col"
              style={{
                fontFamily: templateActual.fontStyle,
              }}
            >
              {isLoading ? (
                <p>
                  {/* Cargando datos del clima... */}
                  {templateActual.idioma === "en" && "Loading weather data..."}
                  {templateActual.idioma === "es" &&
                    "Cargando datos del clima..."}
                  {templateActual.idioma === "es-en" &&
                    "Cargando datos del clima... / Loading weather data..."}
                </p>
              ) : weatherData &&
                weatherData.current &&
                weatherData.current.temp_c ? (
                <div className="flex items-center  justify-center mr-4">
                  <img
                    src={weatherData.current.condition.icon}
                    alt="Clima"
                    className="w-16"
                  />
                  <p className="text-2xl font-bold ml-2 mr-6">
                    {weatherData.current.temp_c} °C
                  </p>
                </div>
              ) : (
                //si no da el Clima muestra un mensaje de Bienvenida
                <h2 className="text-4xl mr-16">
                  {/* Bienvenido */}
                  {templateActual.idioma === "en" && "Welcome"}
                  {templateActual.idioma === "es" && "Bienvenido"}
                  {templateActual.idioma === "es-en" && "Bienvenido / Welcome"}
                </h2>
              )}
            </div>
          </div>
        </section>

        <div className=" flex justify-center align-middle overflow-hidden">
          <img
            src={eventoConPrimeraImagen.images[0]} // Mostrar la primera imagen del evento
            alt="Primera imagen del evento"
            className="w-full "
          />
        </div>
      </div>
    );
  }

  console.log("🚀 ~ PantallaDirec1 ~ templateActual:", templateActual);

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // console.log("CLIMA", weatherData.current.condition.icon);

  return (
    <section className="relative inset-0 w-full min-h-screen md:fixed sm:fixed min-[120px]:fixed bg-white">
      <div
        className="  "
        style={{
          transform: templateData[0]?.setPortrait
            ? "rotate(90deg)"
            : "rotate(0deg)  ",
          maxWidth: templateData[0]?.setPortrait ? "100vh" : "", // Establecer el ancho máximo para ajustarse a la pantalla
          height: templateData[0]?.setPortrait ? "100vh" : "", // Ajustar la altura según la orientación
          width: templateData[0]?.setPortrait ? "100%" : "", // Asegurar que el ancho se ajuste correctamente
          marginLeft: templateData[0]?.setPortrait ? "auto" : "",
          marginRight: templateData[0]?.setPortrait ? "0px" : "",
        }}
      >
        <div id="Content" className=" ">
          {/* Header */}
          <div className="flex items-center justify-between ">
            {/* Logo en la esquina superior izquierda */}
            {templateActual.logo && (
              <>
                <div className="ml-5" style={{ height: "100%" }}>
                  <img
                    src={templateActual.logo}
                    alt="Logo"
                    className="rounded-lg object-contain w-full h-full  "
                    style={{
                      width: windowSize.width / 8.6, // Dividir por 5 o cualquier otro factor para ajustar el tamaño
                      height: windowSize.height / 8.6, // Dividir por 10 o cualquier otro factor para ajustar el tamaño
                    }}
                  />
                </div>
              </>
            )}
            {/* ---- Titulo Eventos del dia y Fecha---- */}
            <div
              className="flex flex-col text-color items-center"
              style={{
                fontFamily: templateActual.fontStyle,
              }}
            >
              <p className="text-base text-center  mb-2">
                {obtenerFecha()}-{currentHour}
              </p>
              <h1 className="text-2xl font-bold">
                {templateActual.idioma === "en" && "Today's Events"}
                {templateActual.idioma === "es" && "Eventos del día"}
                {templateActual.idioma === "es-en" &&
                  "Eventos del día / Today's Events"}
              </h1>
            </div>

            {/* ---- Clima e Icono ---- */}
            <div
              className="flex text-color "
              style={{
                fontFamily: templateActual.fontStyle,
              }}
            >
              {isLoading ? (
                <p>
                  {/* Cargando datos del clima... */}
                  {templateActual.idioma === "en" && "Loading weather data..."}
                  {templateActual.idioma === "es" &&
                    "Cargando datos del clima..."}
                  {templateActual.idioma === "es-en" &&
                    "Cargando datos del clima... / Loading weather data..."}
                </p>
              ) : weatherData &&
                weatherData.current &&
                weatherData.current.temp_c ? (
                <div className="flex items-center">
                  <img
                    src={weatherData.current.condition.icon}
                    alt="Clima"
                    className="w-16"
                  />
                  <p className="text-2xl font-bold w-36">
                    {weatherData.current.temp_c} °C
                  </p>
                </div>
              ) : (
                //si no da el Clima muestra un mensaje de Bienvenida
                <h2 className="text-4xl mr-16">
                  {/* Bienvenido */}
                  {templateActual.idioma === "en" && "Welcome"}
                  {templateActual.idioma === "es" && "Bienvenido"}
                  {templateActual.idioma === "es-en" && "Bienvenido / Welcome"}
                </h2>
              )}
            </div>
          </div>
          {/* Contenedor de eventos */}
          {!templateData[0]?.setPortrait ? (
            <div className="grid grid-cols-4 bg-white">
              {/* normal */}
              <div className="col-span-3 md:col-span-3  mx-3">
                {/* Linea arriba */}{" "}
                <div
                  className={` text-black  uppercase  font-bold px-20 rounded-t-xl h-6`}
                  style={{
                    background: `linear-gradient(to bottom, ${templateActual.templateColor} 70%, #e3e3e3d9)`, // Ajusta el punto de inicio del degradado
                    color: templateActual.fontColor,
                    fontFamily: templateActual.fontStyle,
                  }}
                >
                  {/* Título */}
                  <h2 className=" text-xl text-center">
                    {/* EVENTOS */}
                    {templateActual.idioma === "en" && "EVENTS"}
                    {templateActual.idioma === "es" && "EVENTOS"}
                    {templateActual.idioma === "es-en" && "EVENTOS / EVENTS"}
                  </h2>
                </div>
                {/* contenido principal */}
                <div
                  className=" bg-gradient-to-t from-white to-gray-200  relative z-20"
                  style={{}}
                >
                  <div className="flex flex-col text-black">
                    <div className=" pl-5 flex-grow">
                      {/* Parte con slider horizontal  ------------------------------------------------------------------ */}
                      <div
                        className=""
                        style={{
                          display:
                            (templateData[0]?.setPortrait &&
                              eventosEnCurso.length < 6) ||
                            (!templateData[0]?.setPortrait &&
                              eventosEnCurso.length < 6)
                              ? "none"
                              : "",
                        }}
                      >
                        <div ref={sliderRef} className="keen-slider">
                          {eventosPorSlide.map((slideEventos, index) => (
                            <div key={index} className="keen-slider__slide ">
                              {Array.from({
                                length: templateData[0]?.setPortrait ? 6 : 5,
                              }).map((_, innerIndex) => {
                                const evento = slideEventos[innerIndex]; // Obtener el evento si existe

                                return (
                                  <div
                                    key={innerIndex}
                                    className="flex items-center space-x-4 space-y-1 border-b pr-8"
                                    style={{
                                      height: evento ? "auto" : "92px",
                                      borderColor: templateActual.templateColor,
                                    }} // Establecer la altura dependiendo de si hay evento o no
                                  >
                                    {/* ---- Evento ---- */}
                                    {evento ? (
                                      // Si hay evento, mostrar los detalles
                                      <>
                                        <div className="my-auto flex justify-center items-center relative overflow-hidden w-[7vw] h-[7vw]">
                                          <img
                                            style={{
                                              objectFit: "cover",
                                            }}
                                            src={evento.images[0]}
                                            alt={evento.nombreEvento}
                                          />
                                        </div>

                                        <div className="w-full ">
                                          <h3 className="font-bold mb-4 text-lg">
                                            {evento.nombreEvento}
                                          </h3>
                                          <div className="grid grid-cols-3 gap-1 font-bold text-2xl ">
                                            {/* Columna 1: Nombre (a la izquierda) */}
                                            <p className="col-span-3 text-sm">
                                              {evento.tipoEvento}
                                            </p>
                                            <p className="text-sm ">
                                              {evento.devices[0]}
                                            </p>
                                            {/* Columna 2: Lugar (en el centro) */}
                                            <p className="text-center text-sm ">
                                              {evento.lugar}
                                            </p>

                                            {/* Columna 3: Rango de horas (a la derecha) */}
                                            <p className=" text-right text-sm ">
                                              {evento.horaInicialReal + " a "}
                                              {evento.horaFinalReal}
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
                              eventosEnCurso.length > 6) ||
                            (!templateData[0]?.setPortrait &&
                              eventosEnCurso.length > 5)
                              ? "none"
                              : "",
                        }}
                      >
                        {eventosPorSlide.map((slideEventos, index) => (
                          <div key={index}>
                            {Array.from({
                              length: templateData[0]?.setPortrait ? 6 : 5,
                            }).map((_, innerIndex) => {
                              const evento = slideEventos[innerIndex]; // Obtener el evento si existe

                              return (
                                <div
                                  key={innerIndex}
                                  className="flex items-center space-x-4 space-y-1 border-b pr-8"
                                  style={{
                                    height: evento ? "auto" : "92px",
                                    borderColor: templateActual.templateColor,
                                  }} // Establecer la altura dependiendo de si hay evento o no
                                >
                                  {/* ---- Evento ---- */}
                                  {evento ? (
                                    // Si hay evento, mostrar los detalles
                                    <>
                                      <div className="my-auto flex justify-center items-center relative overflow-hidden w-[6vw] h-[6vw]">
                                        <img
                                          className="object-cover"
                                          src={evento.images[0]}
                                          alt={evento.nombreEvento}
                                        />
                                      </div>

                                      <div className="w-full ">
                                        <h3 className="font-bold mb-4 text-lg">
                                          {evento.nombreEvento}
                                        </h3>
                                        <div className="grid grid-cols-3 gap-1 font-bold text-2xl ">
                                          {/* Columna 1: Nombre (a la izquierda) */}
                                          <p className="col-span-3 text-sm">
                                            {evento.tipoEvento}
                                          </p>
                                          <p className="text-sm ">
                                            {evento.devices[0]}
                                          </p>
                                          {/* Columna 2: Lugar (en el centro) */}
                                          <p className="text-center text-sm ">
                                            {evento.lugar}
                                          </p>

                                          {/* Columna 3: Rango de horas (a la derecha) */}
                                          <p className=" text-right text-sm ">
                                            {evento.horaInicialReal + " a "}
                                            {evento.horaFinalReal}
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
                {/* Linea abajo */}
                <div
                  className={`text-white uppercase font-bold px-20 rounded-b-xl h-6 flex justify-center items-end`}
                  style={{
                    background: `linear-gradient(to top, ${templateActual.templateColor} 70%, #e3e3e3d9)`, // Ajusta el punto de inicio del degradado

                    fontFamily: templateActual.fontStyle,
                  }}
                >
                  {/* Título */}
                  <h2
                    className="text-color text-xl text-center align-bottom "
                    style={{ color: templateActual.fontColor }}
                  >
                    {/* NOTICIAS */}
                    {templateActual.idioma === "en" && "NEWS"}
                    {templateActual.idioma === "es" && "NOTICIAS"}
                    {templateActual.idioma === "es-en" && "NOTICIAS / NEWS"}
                  </h2>
                </div>
              </div>
              <div className="col-span-1 md:col-span-1 flex items-center justify-center  mx-3">
                <div
                  style={{
                    height: "100%",
                    borderRadius: "10px", // Redondear las esquinas
                  }}
                >
                  <img
                    style={{
                      width: windowSize.width / 4, // Dividir por 5 o cualquier otro factor para ajustar el tamaño
                      height: windowSize.height / 1.41, // Dividir por 10 o cualquier otro factor para ajustar el tamaño
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
              {/* 90 grados */}
              {/* Linea arriba */}{" "}
              <div
                className={` text-black  uppercase  font-bold px-20 rounded-t-xl h-6`}
                style={{
                  // backgroundColor: templateActual.templateColor,
                  background: `linear-gradient(to bottom, ${templateActual.templateColor} 70%, #e3e3e3d9)`,
                  color: templateActual.fontColor,
                  fontFamily: templateActual.fontStyle,
                }}
              >
                {/* Título */}
                <h2 className=" text-xl text-center">
                  {/* EVENTOS */}
                  {templateActual.idioma === "en" && "EVENTS"}
                  {templateActual.idioma === "es" && "EVENTOS"}
                  {templateActual.idioma === "es-en" && "EVENTOS / EVENTS"}
                </h2>
              </div>
              {/* contenido principal */}
              <div className=" bg-gradient-to-t from-white to-gray-200  relative z-20 ">
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
                                  eventosEnCurso.length < 6) ||
                                (!templateData[0]?.setPortrait &&
                                  eventosEnCurso.length < 5)
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
                                      ? 5
                                      : 4,
                                  }).map((_, innerIndex) => {
                                    const evento = slideEventos[innerIndex]; // Obtener el evento si existe

                                    return (
                                      <div
                                        key={innerIndex}
                                        className="flex items-center space-x-4 space-y-5 border-b pr-16"
                                        style={{
                                          height: evento ? "111px" : "110px",
                                          borderColor:
                                            templateActual.templateColor,
                                        }} // Establecer la altura dependiendo de si hay evento o no
                                      >
                                        {/* ---- Evento ---- */}
                                        {evento ? (
                                          // Si hay evento, mostrar los detalles
                                          <>
                                            <div className="my-auto flex justify-center items-center relative overflow-hidden w-[6vw] h-[6vw]">
                                              <img
                                                className="object-cover"
                                                src={evento.images[0]}
                                                alt={evento.nombreEvento}
                                              />
                                            </div>
                                            <div className="w-full ">
                                              <h3 className="font-bold mb-4 text-lg">
                                                {evento.nombreEvento}
                                              </h3>
                                              <div className="grid grid-cols-3 gap-1 font-bold text-2xl ">
                                                {/* Columna 1: Nombre (a la izquierda) */}
                                                <p className="col-span-3 text-sm">
                                                  {evento.tipoEvento}
                                                </p>
                                                <p className=" text-sm">
                                                  {evento.devices[0]}
                                                </p>
                                                {/* Columna 2: Lugar (en el centro) */}
                                                <p className="text-center text-sm ">
                                                  {evento.lugar}
                                                </p>

                                                {/* Columna 3: Rango de horas (a la derecha) */}
                                                <p className=" text-right text-sm ">
                                                  {evento.horaInicialReal +
                                                    " a "}
                                                  {evento.horaFinalReal}
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
                                  eventosEnCurso.length > 5) ||
                                (!templateData[0]?.setPortrait &&
                                  eventosEnCurso.length > 4)
                                  ? "none"
                                  : "",
                            }}
                          >
                            {eventosPorSlide.map((slideEventos, index) => (
                              <div key={index} className=" ">
                                {Array.from({
                                  length: templateData[0]?.setPortrait ? 5 : 5,
                                }).map((_, innerIndex) => {
                                  const evento = slideEventos[innerIndex]; // Obtener el evento si existe

                                  return (
                                    <div
                                      key={innerIndex}
                                      className="flex items-center space-x-4 space-y-1 border-b pr-16"
                                      style={{
                                        height: evento ? "134px" : "134px",
                                        borderColor:
                                          templateActual.templateColor,
                                      }} // Establecer la altura dependiendo de si hay evento o no
                                    >
                                      {/* ---- Evento ---- */}
                                      {evento ? (
                                        // Si hay evento, mostrar los detalles
                                        <>
                                          <div className="my-auto flex justify-center items-center relative overflow-hidden w-[6vw] h-[6vw]">
                                            <img
                                              className="object-cover"
                                              src={evento.images[0]}
                                              alt={evento.nombreEvento}
                                            />
                                          </div>

                                          <div className="w-full ">
                                            <h3 className="font-bold mb-4 text-lg">
                                              {evento.nombreEvento}
                                            </h3>
                                            <div className="grid grid-cols-3 gap-1 font-bold text-2xl ">
                                              {/* Columna 1: Nombre (a la izquierda) */}
                                              <p className="col-span-3 text-sm">
                                                {evento.tipoEvento}
                                              </p>
                                              <p className=" text-sm">
                                                {evento.devices[0]}
                                              </p>
                                              {/* Columna 2: Lugar (en el centro) */}
                                              <p className="text-center text-sm ">
                                                {evento.lugar}
                                              </p>

                                              {/* Columna 3: Rango de horas (a la derecha) */}
                                              <p className=" text-right text-sm ">
                                                {evento.horaInicialReal + " a "}
                                                {evento.horaFinalReal}
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
                className={`text-white uppercase font-bold px-20 rounded-b-xl h-6 flex justify-center items-end`}
                style={{
                  // backgroundColor: templateActual.templateColor,
                  background: `linear-gradient(to top, ${templateActual.templateColor} 70%, #e3e3e3d9)`,
                  color: templateActual.fontColor,
                  fontFamily: templateActual.fontStyle,
                }}
              >
                {/* Título */}
                <h2
                  className="text-color text-xl text-center align-bottom"
                  style={{
                    color: templateActual.fontColor,
                  }}
                >
                  {/* NOTICIAS */}
                  {templateActual.idioma === "en" && "NEWS"}
                  {templateActual.idioma === "es" && "NOTICIAS"}
                  {templateActual.idioma === "es-en" && "NOTICIAS / NEWS"}
                </h2>
              </div>
            </div>
          )}
          {/* texto de abajo */}
          <div className=" bg-white">
            <div className="flex justify-between text-color items-center">
              {/* --- RSS --- */}
              <div className="w-9/12 ">
                <div className="flex ml-3  items-center my-3 font-black bg-gradient-to-r from-gray-300 to-white w-full h- rounded-md">
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
              <div className="flex flex-col items-center mx-2 ">
                <p className="mb-2 text-center">
                  {/* Eventos en tu dispositivo */}
                  {templateActual.idioma === "en" && "Events on your device"}
                  {templateActual.idioma === "es" &&
                    "Eventos en tu dispositivo"}
                  {templateActual.idioma === "es-en" &&
                    "Eventos en tu dispositivo / Events on your device"}
                </p>
                {qrCodeUrl && (
                  <a
                    href={qrCodeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ cursor: "pointer" }}
                  >
                    {/* Muestra el código QR */}
                    <QRCode value={qrCodeUrl} size={78} />
                  </a>
                )}
              </div>
            </div>
            <div
              className={`col-span-3 md:col-span-1 flex items-center justify-center mx-3 ${
                !templateData[0]?.setPortrait ? "hidden" : ""
              }`}
            >
              <div
                style={{
                  position: "relative",
                  overflow: "hidden",
                  width: "100%", // Ajusta el ancho del contenedor según sea necesario
                  height: "22vw", // Ajusta el alto del contenedor según sea necesario
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
