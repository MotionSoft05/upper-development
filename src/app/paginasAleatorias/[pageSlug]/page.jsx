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
const obtenerHora = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

function QrPage({ params }) {
  console.log("🚀 ~ QrPage ~ params:", params.pageSlug)
  const [user, setUser] = useState(params.pageSlug);
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

//   useEffect(() => {
//     if (user) {
//       // Obtén la URL base del navegador
//       const baseUrl = window.location.origin;

//       // Actualiza la URL del código QR al cambiar el usuario
//       setQrCodeUrl(`${baseUrl}/paginasAleatorias/${user.uid}`);
//     }
//   }, [user]);

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

  const [rssItems, setRssItems] = useState([]); // Estado para almacenar los elementos del RSS

//   useEffect(() => {
//     axios
//       .get(
//         "https://www.feedspot.com/infiniterss.php?_src=feed_title&followfeedid=4381919&q=site:https%3A%2F%2Fwww.excelsior.com.mx%2Frss.xml"
//       )
//       .then((response) => {
//         if (parser.validate(response.data) === true) {
//           const jsonObj = parser.parse(response.data);
//           const items = jsonObj.rss.channel.item.map((item) => {
//             return {
//               title: item.title,
//               link: item.link,
//               description: item.description,
//               // ... otros campos que desees obtener
//             };
//           });

//           setRssItems(items); // Guardar los elementos del RSS en el estado
//           console.log("Items del RSS:", items); // Agregar un console.log aquí
//         } else {
//           console.error("Invalid XML format");
//         }
//       })
//       .catch((error) =>
//         console.error("Error fetching or parsing data:", error)
//       );
//   }, []);

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
      setUser(user);
    });

    return () => unsubscribe();
  }, []);
//   console.log("user", user);
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

  console.log("🚀 ~ useEffect ~ firestore:", firestore)
  console.log("🚀 ~ useEffect ~ user:", user)
  useEffect(() => {
    if (user && firestore) {
      const userRef = doc(firestore, "usuarios", user);
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
            const eventosQuery = query(eventosRef, where("userId", "==", user));
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
              where("userId", "==", user)
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
      const baseUrl = "http://api.weatherapi.com/v1";

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
  const pantalla = "directorio";

  useEffect(() => {
    const fetchPublicidades = () => {
      if (user && firestore) {
        const publicidadesRef = collection(firestore, "Publicidad");
        const publicidadesQuery = query(
          publicidadesRef,
          where("userId", "==", user)
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

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    let timeoutId;

    const changeImage = () => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % publicidadesUsuario.length
      );
    };

    const currentAd = publicidadesUsuario[currentImageIndex];
    if (currentAd) {
      // console.log("currentAd", currentAd);
      const totalSeconds =
        currentAd.segundos + currentAd.minutos * 60 + currentAd.horas * 3600;
      // console.log("totalSeconds", totalSeconds);
      timeoutId = setTimeout(changeImage, totalSeconds * 1000);
      // console.log("timeoutId", timeoutId);
    } else {
      timeoutId = setTimeout(changeImage, 5000); // Cambiar cada 5 segundos si no hay datos
    }

    return () => clearTimeout(timeoutId); // Limpiar el timeout anterior al desmontar o cuando se ejecute este efecto nuevamente
  }, [currentImageIndex, publicidadesUsuario]);
  if (!eventosEnCurso || eventosEnCurso.length === 0) {
    if (!publicidadesUsuario || publicidadesUsuario.length === 0) {
      return "No hay publicidad ni eventos"; // O cualquier elemento que quieras mostrar cuando no haya publicidades
    }

    return (
      <>
        <section className="relative inset-0 w-full min-h-screen md:fixed sm:fixed min-[120px]:fixed bg-white">
          <div className="slider-container">
            <div ref={sliderRef} className="fader" style={{ height: "100vh" }}>
              <img
                src={publicidadesUsuario[currentImageIndex]?.imageUrl}
                alt={currentImageIndex}
                style={{}}
              />
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

  // console.log("screenWidth", screenWidth);
//   console.log("templateData[0]?.setPortrait", templateData[0]?.setPortrait);
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
            <div className="">
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
                    <img
                      src={templateActual.logo}
                      alt="Logo"
                      className="w-72"
                      onClick={() => {
                        cambiarOrientacion();
                      }}
                    />
                  </div>{" "}
                </>
              )}
            </div>

            <div
              className="flex flex-col text-color items-center"
              style={{
                color: templateActual.fontColor,
                fontFamily: templateActual.fontStyle,
              }}
            >
              <p className="text-2xl text-center  mb-2">
                {obtenerFecha()}-{currentHour}
              </p>
              <h1 className="text-4xl font-bold">Eventos del día</h1>
            </div>

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
                <p className="text-3xl font-bold">
                  {weatherData.current.temp_c} °C
                </p>
              ) : (
                <p>No se pudo obtener la información del clima</p>
              )}
            </div>
          </div>
          {/* Linea arriba */}{" "}
          <div
            className={`text-white py-1 uppercase text-5xl  md:text-7xl font-bold px-20 rounded-t-xl`}
            style={{
              backgroundColor: templateActual.templateColor,
              color: templateActual.fontColor,
              fontFamily: templateActual.fontStyle,
            }}
          >
            {/* Título */}
            <h2 className=" text-white"> </h2>
          </div>
          {/* contenido principal */}
          <div className="bg-gradient-to-t from-gray-50  to-white text-gray-50">
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
                            length: templateData[0]?.setPortrait ? 5 : 8,
                          }).map((_, innerIndex) => {
                            const evento = slideEventos[innerIndex]; // Obtener el evento si existe

                            return (
                              <div
                                key={innerIndex}
                                className="flex items-center space-x-4 space-y-5 border-b border-black"
                                style={{ height: evento ? "auto" : "110px" }} // Establecer la altura dependiendo de si hay evento o no
                              >
                                {evento ? (
                                  // Si hay evento, mostrar los detalles
                                  <>
                                    <img
                                      src={evento.images[0]}
                                      alt={evento.nombreEvento}
                                      style={{
                                        width: "130px",
                                        height: "110px",
                                        margin: "0",
                                      }}
                                    />
                                    <div className="grid grid-cols-2">
                                      <div className="min-w-5">
                                        <h3 className="font-bold mb-4">
                                          {evento.nombreEvento}
                                        </h3>
                                        <p>{evento.tipoEvento}</p>
                                        <p>{evento.lugar}</p>
                                      </div>
                                      <div className="text-right">
                                        <p>{evento.horaInicialSalon} HRS</p>
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
            className={`text-white py-1 uppercase text-5xl  md:text-7xl font-bold px-20 rounded-b-xl`}
            style={{
              backgroundColor: templateActual.templateColor,
              color: templateActual.fontColor,
              fontFamily: templateActual.fontStyle,
            }}
          >
            {/* Título */}
            <h2 className=" text-white"> </h2>
          </div>
          {/* texto de abajo */}
          <div className="flex justify-between text-color items-center">
            {/* -------------------------
            -------------------------
            ------------ RSS aqui -------------
            -------------------------
            -------------------------
            -------------------------
            ------------------------- */}
            <div style={{ marginTop: "20px", marginRight: "20px" }}>
              {qrCodeUrl && (
                <a
                  href={qrCodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ cursor: "pointer" }}
                >
                  {/* Muestra el código QR */}
                  <QRCode value={qrCodeUrl} size={80} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default QrPage;
