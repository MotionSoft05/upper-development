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
import "keen-slider/keen-slider.min.css";

const obtenerHora = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

function Pantalla2() {
  const [user, setUser] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [currentHour, setCurrentHour] = useState(obtenerHora());
  const [firestore, setFirestore] = useState(null);
  const [eventosEnCurso, setEventosEnCurso] = useState([]); // Nuevo estado
  const [publicidadesUsuario, setPublicidadesUsuario] = useState([]);
  const [dispositivoCoincidenteLAL, setDispositivoCoincidente] = useState(null);
  const [templateData, setTemplateData] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const numeroPantallaActual = "2";

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
      "ENERO",
      "FEBRERO",
      "MARZO",
      "ABRIL",
      "MAYO",
      "JUNIO",
      "JULIO",
      "AGOSTO",
      "SEPTIEMBRE",
      "OCTUBRE",
      "NOVIEMBRE",
      "DICIEMBRE",
    ];

    const now = new Date();
    const diaSemana = diasSemana[now.getDay()];
    const dia = now.getDate();
    const mes = meses[now.getMonth()];
    const año = now.getFullYear();

    return `${diaSemana} ${dia} DE ${mes} ${año}`;
  };
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
  // Datos Firebase------------------------------------------
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
  // Publicidades-------------------------------------------
  const pantalla = "salon";

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
    }, 10000);

    fetchPublicidades(); // Llamar inicialmente

    return () => clearInterval(interval); // Limpiar el intervalo al desmontar el componente
  }, [user, firestore, pantalla]);
  // Eventos------------------------------------------------
  useEffect(() => {
    if (user && firestore) {
      const userRef = doc(firestore, "usuarios", user.uid);
      const obtenerUsuario = async () => {
        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            const nombrePantallasUsuario = userData.nombrePantallas || {};
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
              console.log(
                "🚀 ~ eventosEnCursoEffect ~ horaActual:",
                horaActual
              );
              const horaInicialEvento = evento.horaInicialSalon;
              console.log(
                "🚀 ~ eventosEnCursoEffect ~ horaInicialEvento:",
                horaInicialEvento
              );
              const horaFinalEvento = evento.horaFinalSalon;
              console.log(
                "🚀 ~ eventosEnCursoEffect ~ horaFinalEvento:",
                horaFinalEvento
              );
              const fechaActualEnRango =
                fechaActual >= fechaInicioEvento &&
                fechaActual <= fechaFinalEvento;
              const horaActualEnRango =
                horaActual >= horaInicialEvento &&
                horaActual <= horaFinalEvento;
              console.log("evento", evento);
              console.log(
                "🚀 ~ eventosEnCursoEffect ~ horaActualEnRango:",
                horaActualEnRango
              );

              return fechaActualEnRango && horaActualEnRango;
            });
            console.log(
              "🚀 ~ eventosEnCursoEffect ~ eventosEnCursoEffect:",
              eventosEnCursoEffect
            );

            const templateRef = collection(firestore, "TemplateSalones");
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
            // console.log("eventosEnCursoEffect.", eventosEnCursoEffect);
            setEventosEnCurso(eventosEnCursoEffect);
            // Aquí puedes hacer algo con los eventos filtrados por fecha y hora
            // setEventData(eventosEnCurso);
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
      }, 10000);

      return () => clearInterval(interval); // Limpiar el intervalo al desmontar el componente
    }
  }, [user, firestore]);
  // console.log("publicidadesUsuario.", publicidadesUsuario);
  const eventoActualCopy = eventosEnCurso[0]; // Obtener el primer evento de la lista

  const [opacities, setOpacities] = useState([]);

  let loop = true; // Establecer el valor predeterminado
  let img = 1;
  if (eventoActualCopy) {
    img = eventoActualCopy.images.length;
  }

  // Slider
  const [sliderRef] = useKeenSlider(
    {
      slides: img,
      loop: loop,
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

        function clearNextTimeout() {
          clearTimeout(timeout);
        }
        function nextTimeout() {
          clearTimeout(timeout);

          timeout = setTimeout(() => {
            slider.next();
          }, 5000);
        }

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
        (prevIndex) => (prevIndex + 1) % publicidadesUsuario.length
      );
    };

    const currentAd = publicidadesUsuario[currentMediaIndex];
    if (currentAd) {
      const isVideo = !!currentAd.videoUrl; // Verifica si hay una URL de video
      const totalSeconds = isVideo
        ? currentAd.segundos + currentAd.minutos * 60 + currentAd.horas * 3600
        : 5; // Si es un video, utiliza la duración del video; de lo contrario, 5 segundos por defecto

      timeoutId = setTimeout(changeMedia, totalSeconds * 1000);
    } else {
      timeoutId = setTimeout(changeMedia, 5000); // Cambiar cada 5 segundos si no hay datos
    }

    return () => clearTimeout(timeoutId);
  }, [currentMediaIndex, publicidadesUsuario]);

  if (!eventosEnCurso || eventosEnCurso.length === 0) {
    if (!publicidadesUsuario || publicidadesUsuario.length === 0) {
      return "No hay publicidad ni eventos";
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
  const eventoActual = eventosEnCurso[0]; // Obtener el primer evento de la lista
  const templateActual = templateData[0]; // Obtener el primer evento de la lista
  // console.log("🚀 ~ Pantalla1 ~ templateActual:", templateActual);

  const {
    personalizacionTemplate,

    nombreEvento,
    images,
    horaInicialReal,
    tipoEvento,
    description,
  } = eventoActual;

  return (
    <section className="relative inset-0 w-full min-h-screen md:fixed sm:fixed min-[120px]:fixed bg-white">
      <div className="bg-white  text-black h-full flex flex-col justify-center mx-2 my-2">
        <div id="Content" className="flex-grow flex flex-col justify-center ">
          {/* Header */}
          <div className="flex items-center justify-between ">
            {templateActual.logo && (
              <>
                {" "}
                <div
                  style={{
                    width: "18vw",
                    height: "10vw",
                    overflow: "hidden",
                  }}
                >
                  <img src={templateActual.logo} alt="Logo" className="w-72" />
                </div>{" "}
              </>
            )}
            <h1
              className={`font-bold uppercase text-6xl md:text-8xl text-color mr-16`}
              style={{ fontFamily: templateActual.fontStyle }}
            >
              {dispositivoCoincidenteLAL}
            </h1>
          </div>
          {/* Linea arriba */}
          <div
            className={`text-white py-5 uppercase text-5xl  md:text-7xl font-bold px-20 rounded-t-xl`}
            style={{
              backgroundColor: templateActual.templateColor,
              color: templateActual.fontColor,
              fontFamily: templateActual.fontStyle,
            }}
          >
            <h2>{nombreEvento}</h2>
          </div>
          {/* contenido principal */}
          <div className="bg-gradient-to-b from-gray-100  via-white to-gray-100 text-gray-50 py-5">
            <div className="grid grid-cols-3 gap-x-4 text-black">
              <div className="col-span-1  mr-4 my-auto">
                <div
                  ref={sliderRef}
                  className={`fader${
                    images.length === 1 ? " single-image" : ""
                  }`}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    width: "30vw", // Ajusta el ancho del contenedor según sea necesario
                    height: "30vw", // Ajusta el alto del contenedor según sea necesario
                  }}
                >
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="fader__slide "
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        opacity: opacities[index],
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <img
                        src={image}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-full object-cover"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  ))}
                </div>

                {images.length === 1 && (
                  <div>
                    <img
                      src={images[0]}
                      alt={`Imagen 1`}
                      style={{
                        width: "30vw",
                        height: "30vw",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}

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

              <div className="col-span-2 space-y-8  my-4">
                <div>
                  <p
                    className={`text-3xl md:text-4xl text-color font-bold`}
                    style={{ fontFamily: templateActual.fontStyle }}
                  >
                    Sesión:
                  </p>
                  <p
                    className={`text-3xl md:text-4xl text-color font-bold`}
                    style={{ fontFamily: templateActual.fontStyle }}
                  >
                    {horaInicialReal}
                    <span className="text-2x1"> hrs.</span>
                  </p>
                </div>
                <div className="">
                  {/* Tipo de evento y descripción */}
                  <h1
                    className={`text-3xl md:text-4xl text-color font-bold`}
                    style={{ fontFamily: templateActual.fontStyle }}
                  >
                    {tipoEvento}
                  </h1>
                  <div className="text-center flex px-0 mt-6">
                    <p
                      className={`text-3xl text-color md:text-4xl`}
                      style={{ fontFamily: templateActual.fontStyle }}
                    >
                      {description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Linea abajo */}
          <div
            id="Abajo"
            className={` text-3xl md:text-4xl  py-4 font-semibold mt-1 text-center justify-between flex px-20 rounded-b-xl`}
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
              {obtenerFecha()}
            </p>
            <div className="flex items-center justify-center">
              <img src="/img/reloj.png" className="p-1 h-8" />
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

export default Pantalla2;
