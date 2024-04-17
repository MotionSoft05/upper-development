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

function QrDinamic({ searchQuery }) {
  //   console.log("🚀 ~ QrPage ~ params:", searchQuery)
  const [user, setUser] = useState(searchQuery);
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

  //   console.log("🚀 ~ useEffect ~ firestore:", firestore)
  //   console.log("🚀 ~ useEffect ~ user:", user)
  useEffect(() => {
    if (user && firestore) {
      const userRef = doc(firestore, "usuarios", searchQuery); //! revisar antes era doc(firestore, "usuarios", user)
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
              where("userId", "==", searchQuery)
            ); //! revisar antes era ("userId", "==", user)
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
              where("userId", "==", searchQuery) //! revisar antes era ("userId", "==", user)
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
      //http://api.weatherapi.com/v1/current.json?key=a067ad0b3d4440b192b223344240201&q=Aguascalientes
      //https://api.weatherapi.com/v1/current.json?key=a067ad0b3d4440b192b223344240201&q=Aguascalientes

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
          where("userId", "==", searchQuery) //! revisar antes era ("userId", "==", user)
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
    <section className="relative w-full  bg-white overflow-y-auto">
      <div
        className="bg-white text-black  flex flex-col justify-center  "
        // style={{
        //   transform: templateData[0]?.setPortrait
        //     ? "rotate(0deg)"
        //     : "rotate(90deg) ",
        //   maxWidth: templateData[0]?.setPortrait ? "" : "100vh", // Establecer el ancho máximo para ajustarse a la pantalla
        //   height: templateData[0]?.setPortrait ? "" : "100vh", // Ajustar la altura según la orientación
        //   width: templateData[0]?.setPortrait ? "" : "100%", // Asegurar que el ancho se ajuste correctamente
        //   marginLeft: templateData[0]?.setPortrait ? "" : "auto",
        //   marginRight: templateData[0]?.setPortrait ? "" : "auto",
        // }}
      >
        <div
          id="Content"
          className="flex-grow flex flex-col justify-center mx-2 my-2 "
        >
          {/* Header */}
          <div className="flex flex-col items-center justify-center md:flex-row md:justify-between">
            {/* Logo en la esquina superior izquierda */}
            <div className=" ">
              {templateActual.logo && (
                <>
                  {" "}
                  <div
                    className="max-w-[150px] lg:max-w-[250px]"
                    style={{
                      // width: "18vw",
                      // height: "10vw",
                      // overflow: "hidden",
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
            {/* Titulo , fecha y hora central */}
            <div className="flex flex-col text-color items-center md:ml-4">
              <p className="text-xs lg:text-2xl text-center mb-2">
                {obtenerFecha()} Hr: {currentHour}
              </p>
              <h1 className="text-2xl lg:text-4xl font-bold">
                Eventos del día
              </h1>
            </div>

            {/* Clima e Icono */}
            <div className="flex flex-col md:flex-row text-color items-center md:ml-4">
              {isLoading ? (
                <p>Cargando datos del clima...</p>
              ) : weatherData &&
                weatherData.current &&
                weatherData.current.temp_c ? (
                <div className="flex items-center justify-center md:mr-4">
                  <img
                    src={weatherData.current.condition.icon}
                    alt="Clima"
                    className="w-12"
                  />
                  <p className="text-2xl font-bold ml-2 mr-6">
                    {weatherData.current.temp_c} °C
                  </p>
                </div>
              ) : (
                <h2 className="text-2xl mr-16">Bienvenido</h2>
              )}
            </div>
          </div>
          <div className="">
            {/* Linea arriba */}
            <div
              className={`text-white py-1 uppercase text-5xl  md:text-7xl font-bold px-20 rounded-t-xl h-16`}
              style={{
                background: `linear-gradient(to bottom, ${templateActual.templateColor} 70%, #e3e3e3d9)`, // Ajusta el punto de inicio del degradado
                color: templateActual.fontColor,
                fontFamily: templateActual.fontStyle,
              }}
            >
              {/* Título */}
              <h2
                className="text-white text-4xl text-center"
                style={{
                  color: templateActual.fontColor,
                }}
              >
                EVENTOS
              </h2>
            </div>

            {/* Contenido principal */}
            <div className="bg-gradient-to-t from-white to-gray-200 text-gray-50">
              <div className="text-black">
                {/* Imagen a la izquierda */}
                <div className="flex flex-col">
                  <div className="">
                    <div className="space-y-5 pl-2 flex-grow">
                      {/* Slots predeterminados */}
                      <div ref={sliderRef} className="keen-slider">
                        {eventosPorSlide.map((slideEventos, index) => (
                          <div key={index} className="keen-slider__slide my-2">
                            {Array.from({
                              length: templateData[0]?.setPortrait ? 5 : 10,
                            }).map((_, innerIndex) => {
                              const evento = slideEventos[innerIndex];

                              return (
                                <div
                                  key={innerIndex}
                                  className="flex items-center space-x-4 space-y-5 border-b pr-8"
                                  style={{
                                    height: evento ? "auto" : "110px",
                                    borderColor: templateActual.templateColor,
                                  }}
                                >
                                  {/* Evento */}
                                  {evento ? (
                                    <>
                                      <img
                                        className="object-contain my-2 shadow-xl"
                                        src={evento.images[0]}
                                        alt={evento.nombreEvento}
                                        style={{
                                          width: "20vw",
                                          height: "20vw",
                                          objectFit: "cover",
                                        }}
                                      />
                                      <div className="w-full ">
                                        <h3 className="font-bold mb-4 text-base lg:text-3xl">
                                          {evento.nombreEvento}
                                        </h3>
                                        <div className="grid grid-cols-3 gap-1 font-bold text-xs ">
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
                                            {evento.horaInicialSalon + " a "}
                                            {evento.horaFinalSalon}
                                            {"HRS"}
                                          </p>
                                        </div>
                                      </div>
                                    </>
                                  ) : (
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
                color: templateActual.fontColor,
                fontFamily: templateActual.fontStyle,
              }}
            >
              {/* Título */}
              <h2 className="text-white"></h2>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default QrDinamic;
