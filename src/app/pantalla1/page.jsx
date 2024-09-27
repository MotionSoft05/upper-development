"use client";
import {
  collection,
  getDocs,
  where,
  query,
  doc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import auth from "@/firebase/auth";
import db, { getUserData, getEventsByCompany } from "@/firebase/firestore";

import { useKeenSlider } from "keen-slider/react";
import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import LogIn from "../login/page"; // Importa el componente LogIn
import { Swiper, SwiperSlide } from "swiper/react";
import { usePathname } from "next/navigation";
// Import Swiper styles
import "../../../node_modules/swiper/swiper-bundle.min.css";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// import required modules
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import { useTranslation } from "react-i18next";
import GetLanguageDate from "@/components/getLanguageDate";

const obtenerHora = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

function Pantalla1() {
  const { t, ready } = useTranslation();
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [currentHour, setCurrentHour] = useState(obtenerHora());
  const [eventosEnCurso, setEventosEnCurso] = useState([]); // Nuevo estado
  const [publicidadesUsuario, setPublicidadesUsuario] = useState([]);
  const [dispositivoCoincidenteLAL, setDispositivoCoincidente] = useState(null);
  const [templateData, setTemplateData] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const numeroPantallaActual = "1";

  const swiperRef = useRef(null);

  function obtenerHoraActual() {
    setCurrentHour(obtenerHora()); // Actualizar el estado con la hora actual
  }
  // Señal no se apage monitor-------------------------------

  // Hora actual---------------------------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      obtenerHoraActual(); // Llamar a obtenerHoraActual cada segundo
    }, 1000);

    return () => clearInterval(interval); // Limpiar el intervalo al desmontar el componente
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

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

  useEffect(() => {
    if (user && db) {
      const userRef = doc(db, "usuarios", user.uid);
      const obtenerUsuario = async () => {
        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            const userCompany = userData.empresa;
            const nombrePantallasUsuario = userData.nombrePantallas || {};
            const pantallasNumeradas = {};

            Object.keys(nombrePantallasUsuario).forEach((key, index) => {
              pantallasNumeradas[nombrePantallasUsuario[key]] = index + 1;
            });

            const eventosRef = collection(db, "eventos");
            const eventosQuery = query(
              eventosRef,
              where("empresa", "==", userCompany)
            );
            const querySnapshot = await getDocs(eventosQuery);

            const eventosData = [];

            let dispositivoCoincidente = null;

            querySnapshot.forEach((doc) => {
              const evento = { id: doc.id, ...doc.data() };
              const devicesEvento = evento.devices || [];

              const pantallasAsignadas = devicesEvento.reduce(
                (pantallas, device) => {
                  if (Object.keys(pantallasNumeradas).includes(device)) {
                    const posicionPantalla = pantallasNumeradas[device];
                    pantallas.push({ posicion: posicionPantalla, device });
                  }
                  return pantallas;
                },
                []
              );

              if (pantallasAsignadas.length > 0) {
                const posicionActual = parseInt(numeroPantallaActual, 10);

                const dispositivosCoincidentes = pantallasAsignadas.filter(
                  (pantalla) => pantalla.posicion === posicionActual
                );

                if (dispositivosCoincidentes.length > 0) {
                  dispositivoCoincidente = dispositivosCoincidentes[0].device;

                  setDispositivoCoincidente(dispositivoCoincidente);
                  eventosData.push(evento);
                }
              }
            });

            // Filtrar por fecha y hora los eventos filtrados por pantalla
            const eventosEnCursoEffect = eventosData.filter((evento) => {
              // Obtener fecha actual (solo día)
              const fechaActual = new Date();

              // Obtener fechas de inicio y finalización del evento (solo día)
              const fechaInicioEvento = new Date(evento.fechaInicio);
              fechaInicioEvento.setDate(fechaInicioEvento.getDate() + 1); // Sumar un día
              fechaInicioEvento.setHours(0, 0, 0, 0); // Establecer hora, minutos, segundos y milisegundos a cero

              const fechaFinalEvento = new Date(evento.fechaFinal);
              fechaFinalEvento.setDate(fechaFinalEvento.getDate() + 1); // Sumar un día
              fechaFinalEvento.setHours(23, 59, 59, 0); // Establecer hora, minutos, segundos y milisegundos a cero

              const horaActual = obtenerHora();
              const horaInicialEvento = evento.horaInicialSalon;
              const horaFinalEvento = evento.horaFinalSalon;
              const fechaActualEnRango =
                fechaActual >= fechaInicioEvento &&
                fechaActual <= fechaFinalEvento;
              const horaActualEnRango =
                horaActual >= horaInicialEvento &&
                horaActual <= horaFinalEvento;

              // Filtrar eventos por empresa
              const empresaCoincidente = evento.empresa === userCompany;

              return (
                fechaActualEnRango && horaActualEnRango && empresaCoincidente
              );
            });
            //  Sección template
            const templateRef = collection(db, "TemplateSalones");
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
              setTemplateData(templateData);
            } else {
              console.log(
                // "No se encontró información en TemplateDirectorios para este usuario."
                t("pantalla.error.templateDirectoryNotFound")
              );
            }
            //  Sección template
            //  Sección publicidad

            if (eventosEnCursoEffect.length === 0) {
              const pantalla = "salon";
              const publicidadesRef = collection(db, "Publicidad");
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
                  console.log(
                    "🚀 ~ querySnapshot.forEach ~ publicidad:",
                    publicidad
                  );

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
            //  Sección publicidad
            // console.log("eventosEnCursoEffect.", eventosEnCursoEffect);
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
          console.error(t("pantalla.error.userDataFetchError"), error);
        }
      };

      obtenerUsuario();

      const interval = setInterval(() => {
        obtenerUsuario(); // Llamar a la función cada 5 segundos
      }, 60000);

      return () => clearInterval(interval); // Limpiar el intervalo al desmontar el componente
    }
  }, [user, db]);
  // console.log("publicidadesUsuario.", publicidadesUsuario);
  const eventoActualCopy = eventosEnCurso[0]; // Obtener el primer evento de la lista

  const [opacities, setOpacities] = useState([]);

  let img = 1;
  if (eventoActualCopy) {
    img = eventoActualCopy.images.length;
  }

  // Slider
  const [sliderRef] = useKeenSlider(
    {
      slides: img,
      loop: true,
      detailsChanged(s) {
        const new_opacities = s.track.details.slides.map(
          (slide) => slide.portion
        );
        setOpacities(new_opacities);
      },
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
          }, 7000);
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
  if (!eventosEnCurso || eventosEnCurso.length === 0) {
    if (!publicidadesUsuario || publicidadesUsuario.length === 0) {
      // Renderizar cuenta regresiva

      return (
        <>
          <section className="relative inset-0 w-full min-h-screen md:fixed sm:fixed min-[120px]:fixed bg-white">
            <p>
              {/* No se a encontrado ningún evento o publicidad. La pagina se
              reiniciara en {countdown} segundos */}
              {t("pantalla.noEventsOrAdvertisements", { countdown })}
            </p>
          </section>
        </>
      );
    }

    const currentAd = publicidadesUsuario[currentMediaIndex];
    const isVideo = !!currentAd?.videoUrl;

    return (
      <>
        <section className="relative ">
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
                  src={currentAd?.imageUrl}
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
  const eventoActual = eventosEnCurso[0]; // Obtener el primer evento de la lista
  if (eventoActual.primeraImagen && eventoActual.images.length > 0) {
    return (
      <div className="fixed top-0 left-0 w-screen h-screen z-50">
        <img
          src={eventoActual.images[0]} // Mostrar la primera imagen
          alt="Primera imagen del evento"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const templateActual = templateData[0]; // Obtener el primer evento de la lista

  const {
    personalizacionTemplate,

    nombreEvento,
    images,
    horaInicialReal,
    tipoEvento,
    description,
  } = eventoActual;
  // h-screen PONE LA SCROLL BAR?!?!?!?!
  // console.log("🚀 ~ IDIOMA ~ templateData:", templateData[0].idioma)

  return (
    <section className="flex flex-col p-4  h-screen flex-grow flex-shrink-0 overflow-hidden">
      {/* Línea superior: Logo, título y clima */}
      <div className="flex justify-between items-center mb-4">
        {templateActual.logo && (
          <>
            <div style={{ height: "100%" }}>
              <img
                src={templateActual.logo}
                alt="Logo"
                className=" object-cover"
                style={{
                  width: windowSize.width / 6, // Dividir por 5 o cualquier otro factor para ajustar el tamaño
                  height: windowSize.height / 6, // Dividir por 10 o cualquier otro factor para ajustar el tamaño
                }}
              />
            </div>
          </>
        )}
        <h1
          className={`font-bold uppercase sm:text-xs md:text-2xl lg:text-4xl xl:text-6xl   text-color `}
          style={{ fontFamily: templateActual.fontStyle }}
        >
          {dispositivoCoincidenteLAL}
        </h1>
      </div>

      {/* Línea inferior */}
      <div className="flex flex-col flex-grow">
        {/* Nombre del evento */}
        <div className="mb-4">
          {/* Linea arriba */}
          <div
            className={`text-white  py-3 uppercase  sm:text-xs md:text-3xl lg:text-5xl xl:text-7xl  font-bold px-20 rounded-t-xl`}
            style={{
              backgroundColor: templateActual.templateColor,
              color: templateActual.fontColor,
              fontFamily: templateActual.fontStyle,
            }}
          >
            <h2>{nombreEvento}</h2>
          </div>
        </div>

        <div className="flex-grow mb-4">
          {/* contenido principal */}
          <div className="bg-gradient-to-b from-gray-100 via-white to-gray-100 text-gray-50 h-full flex flex-col">
            <div className="grid grid-cols-3 gap-x-4 text-black flex-grow">
              <div className="col-span-1 mr-4 my-auto flex justify-center items-center">
                <Swiper
                  ref={swiperRef}
                  spaceBetween={30}
                  effect="fade"
                  autoplay={{
                    delay: 2500,
                    disableOnInteraction: false,
                  }}
                  loop
                  modules={[Autoplay, Pagination, EffectFade]}
                  className="mySwiper"
                  style={{ width: "100%", height: "100%" }}
                >
                  {images.map((image, index) => (
                    <SwiperSlide key={index + 1}>
                      <img
                        src={image}
                        alt={index + 1}
                        className="object-cover"
                        style={{
                          maxHeight: "80vh", // Opcional, para limitar la altura si es necesario
                        }}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
                {images.length === 0 && (
                  <p
                    style={{
                      color: templateActual.fontColor,
                      fontFamily: templateActual.fontStyle,
                    }}
                  >
                    No hay imágenes disponibles
                  </p>
                )}
              </div>

              <div className="col-span-2 space-y-8 my-4">
                <div>
                  <p
                    className="text-3xl md:text-4xl text-color font-bold"
                    style={{ fontFamily: templateActual.fontStyle }}
                  >
                    {/* Sesión: */}
                    {t("pantalla.session")}
                  </p>
                  <p
                    className="text-3xl md:text-4xl text-color font-bold"
                    style={{ fontFamily: templateActual.fontStyle }}
                  >
                    {horaInicialReal}
                    <span className="text-2x1"> hrs.</span>
                  </p>
                </div>
                <div>
                  <h1
                    className="text-3xl md:text-4xl text-color font-bold"
                    style={{ fontFamily: templateActual.fontStyle }}
                  >
                    {tipoEvento}
                  </h1>
                  <div className="text-center flex px-0 mt-6">
                    <p
                      className="text-3xl text-color md:text-4xl"
                      style={{ fontFamily: templateActual.fontStyle }}
                    >
                      {description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fecha */}
        <div className="mt-auto">
          {/* Linea abajo */}
          <div
            id="Abajo"
            className={` text-3xl md:text-4xl md:py-4 py-2 font-semibold mt-1 text-center justify-between flex px-20 rounded-b-xl`}
            style={{
              backgroundColor: templateActual.templateColor,
              color: templateActual.fontColor,
              fontFamily: templateActual.fontStyle,
            }}
          >
            <p
              className="font-bold uppercase"
              style={{
                color: templateActual.fontColor,
                fontFamily: templateActual.fontStyle,
              }}
            >
              {/* FECHA Y HORA EN IDIOMA DEL TEMPLATE */}
              <GetLanguageDate idioma={templateData[0].idioma} />
            </p>
            <div className="flex items-center justify-center mb-1">
              <img src="/img/reloj.png" className="p-1 h-8 mt-1" />
              <p
                className=" uppercase"
                style={{
                  color: templateActual.fontColor,
                  fontFamily: templateActual.fontStyle,
                }}
              >
                {currentHour}
              </p>{" "}
              {/* Mostrar la hora actual */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Pantalla1;
