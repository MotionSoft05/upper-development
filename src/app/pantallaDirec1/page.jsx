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
      ? Math.ceil(totalEvents / chunkSize)
      : Math.ceil(totalEvents / (chunkSize * 2));

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
    templateData[0]?.setPortrait ? 5 : 8
  );

  // Uso de eventosPorSlide en useKeenSlider
  const [sliderRef] = useKeenSlider({
    slides: eventosPorSlide.length,
    loop: true,
  });

  useEffect(() => {
    // Importar Firebase solo en el lado del cliente
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
                  eventosData.push(evento);
                }
              }
            });
            // console.log("eventosData:", eventosData);
            // const eventosFiltrados = eventosData.filter((evento) => {
            //   const fechaFinalEvento = new Date(evento.fechaFinal);
            //   const fechaActual = new Date();

            // Si la fecha final del evento es anterior a la fecha actual, se filtra
            //   return fechaActual <= fechaFinalEvento;
            // });
            // console.log("eventosFiltrados:", eventosFiltrados);
            // Ordenar los eventos por fecha y hora más cercanas a la actual
            // Suponiendo que tienes eventos ordenados en eventosEnCurso
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

            // Filtrar por eventos cuya horaInicialSalon sea mayor que la hora actual
            // const horaActual = new Date();
            // const eventosFiltradosv1 = eventosOrdenados.filter((evento) => {
            //   const horaInicioEvento = new Date(
            //     `2000-01-01T${evento.horaInicialSalon}`
            //   );
            //   return horaInicioEvento > horaActual;
            // });

            // Usar eventosFiltrados en tu componente
            // setEventosEnCurso(eventosFiltradosv1);

            // console.log("Eventos ordenados:", eventosOrdenados);

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
            // Filtrar por fecha y hora los eventos filtrados por pantalla

            setEventosEnCurso(eventosOrdenados);
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
          // console.log("Datos del clima:", response.data);
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
      // .get("http://localhost:10000/fetch-rss")
      .get("https://upperds.onrender.com/fetch-rss")
      .then((response) => {
        const items = response.data.items;
        setRssItems(items);
        console.log("Items del RSS:", items);
      })
      .catch((error) =>
        console.error("Error fetching or parsing data:", error)
      );
  }, []);

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
    }, 40000);

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
  // console.log("EVENTOSSSS", eventosEnCurso);
  // console.log("templateData", templateData);
  const templateActual = templateData[0]; // Obtener el primer evento de la lista

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  console.log("CLIMA", weatherData);
  // console.log("CLIMA", weatherData.current.condition.icon);

  return (
    <section className="relative inset-0 w-full min-h-screen md:fixed sm:fixed min-[120px]:fixed bg-white">
      <div
        className="bg-white text-black h-screen flex flex-col justify-center  "
        style={{
          transform: templateData[0]?.setPortrait
            ? "rotate(0deg)"
            : "rotate(90deg) ",
          maxWidth: templateData[0]?.setPortrait ? "" : "100vh", // Establecer el ancho máximo para ajustarse a la pantalla
          height: templateData[0]?.setPortrait ? "" : "100vh", // Ajustar la altura según la orientación
          width: templateData[0]?.setPortrait ? "" : "100%", // Asegurar que el ancho se ajuste correctamente
          marginLeft: templateData[0]?.setPortrait ? "" : "auto",
          marginRight: templateData[0]?.setPortrait ? "" : "auto",
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
                  {" "}
                  <div
                    style={{
                      width: "18vw",
                      height: "10vw",
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
                  </div>{" "}
                </>
              )}
            </div>
            {/* ---- Titulo Eventos del dia y Fecha---- */}
            <div
              className="flex flex-col text-color items-center"
              style={{
                color: templateActual.fontColor,
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
                color: templateActual.fontColor,
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
          {/* Contenerdor de eventos */}
          <div className="">
            {/* Linea arriba */}{" "}
            <div
              className={`text-white py-1 uppercase text-5xl  md:text-7xl font-bold px-20 rounded-t-xl h-16`}
              style={{
                // backgroundColor: templateActual.templateColor,
                background: `linear-gradient(${templateActual.templateColor}, #e3e3e3d9)`,
                color: templateActual.fontColor,
                fontFamily: templateActual.fontStyle,
              }}
            >
              {/* Título */}
              <h2 className="text-white text-4xl text-center">EVENTOS</h2>
            </div>
            {/* contenido principal */}
            <div className="bg-gradient-to-t from-white  to-gray-200 text-gray-50">
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
                              length: templateData[0]?.setPortrait ? 5 : 10,
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
                                      <img
                                        className="object-contain w-auto h-[100px] my-2 shadow-xl "
                                        src={evento.images[0]}
                                        alt={evento.nombreEvento}
                                      />
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
                                            {evento.horaInicialSalon + " HRS"}
                                            {/* {"HRS hasta "}
                                            {evento.horaFinalSalon} */}
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
              className={`text-white py-1 uppercase text-5xl  md:text-7xl font-bold px-20 rounded-b-xl h-16`}
              style={{
                // backgroundColor: templateActual.templateColor,
                background: `linear-gradient(#ffffff,${templateActual.templateColor})`,
                color: templateActual.fontColor,
                fontFamily: templateActual.fontStyle,
              }}
            >
              {/* Título */}
              <h2 className="text-white text-4xl text-center">NOTICIAS</h2>
            </div>
          </div>

          {/* texto de abajo */}
          <div className="flex justify-between text-color items-center">
            {/* --- RSS --- */}
            <div className="w-full ">
              <div className="flex items-center my-3 font-black bg-gradient-to-r from-gray-300 to-white w-full h-12 rounded-md">
                <Textra
                  className="ml-12 text-xl "
                  effect="rightLeft"
                  duration={1000}
                  stopduration={timeOutRss}
                  data={[displayedItem]}
                  // data={[rssItems[currentIndex].title]}
                />
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
              style={{
                marginTop: "20px",
                marginRight: "20px",
                marginBottom: "20px",
              }}
            >
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
        </div>
      </div>
    </section>
  );
}

export default PantallaDirec1;
