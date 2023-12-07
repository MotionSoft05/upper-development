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
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
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

  // Función para obtener la hora actual
  function obtenerHoraActual() {
    setCurrentHour(obtenerHora()); // Actualizar el estado con la hora actual
  }

  useEffect(() => {
    const interval = setInterval(() => {
      obtenerHoraActual(); // Llamar a obtenerHoraActual cada segundo
    }, 50000);

    return () => clearInterval(interval); // Limpiar el intervalo al desmontar el componente
  }, []);

  // Slider
  const [sliderRef] = useKeenSlider(
    {
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
          }, 4000);
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
      apiKey: "AIzaSyCzD--npY_6fZcXH-8CzBV7UGzPBqg85y8",
      authDomain: "upper-a544e.firebaseapp.com",
      projectId: "upper-a544e",
      storageBucket: "upper-a544e.appspot.com",
      messagingSenderId: "665713417470",
      appId: "1:665713417470:web:73f7fb8ee518bea35999af",
      measurementId: "G-QTFQ55YY5D",
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
    if (selectedCity) {
      setIsLoading(true);
      setError(null);

      const apiKey = "d6bfb64ec94a413cabc181954232010";
      const baseUrl = "http://api.weatherapi.com/v1";

      axios
        .get(`${baseUrl}/current.json?key=${apiKey}&q=${selectedCity.value}`)
        .then((response) => {
          console.log("Datos del clima:", response.data);
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
            console.log("eventosData:", eventosData);
            const eventosFiltrados = eventosData.filter((evento) => {
              const fechaFinalEvento = new Date(evento.fechaFinal);
              const fechaActual = new Date();

              // Si la fecha final del evento es anterior a la fecha actual, se filtra
              return fechaActual <= fechaFinalEvento;
            });
            console.log("eventosFiltrados:", eventosFiltrados);
            // Ordenar los eventos por fecha y hora más cercanas a la actual
            // Suponiendo que tienes eventos ordenados en eventosEnCurso
            const eventosOrdenados = eventosFiltrados.slice().sort((a, b) => {
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

            console.log("Eventos ordenados:", eventosOrdenados);

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
              });
              setTemplateData(templateData);
              // Aquí puedes hacer algo con la información obtenida de TemplateDirectorios
            } else {
              // console.log(
              //   "No se encontró información en TemplateDirectorios para este usuario."
              // );
            }
            // Filtrar por fecha y hora los eventos filtrados por pantalla

            setEventosEnCurso(eventosFiltrados);
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

  if (!eventosEnCurso) {
    return <p>Cargando...</p>;
  }

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

  if (!eventosEnCurso || eventosEnCurso.length === 0) {
    return <p>No hay eventos disponibles en este momento.</p>;
  }
  console.log("EVENTOSSSS", eventosEnCurso);
  // console.log("templateData", templateData);
  const templateActual = templateData[0]; // Obtener el primer evento de la lista

  return (
    <section className="relative inset-0 w-full min-h-screen md:fixed sm:fixed min-[120px]:fixed bg-white">
      {" "}
      <div className="bg-white  text-black h-full flex flex-col justify-center mx-2 my-2">
        <div id="Content" className="flex-grow flex flex-col justify-center ">
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
                    />
                  </div>{" "}
                </>
              )}
            </div>

            <div
              className="flex flex-col items-center"
              style={{ color: templateActual.fontColor }}
            >
              <p className="text-2xl text-center font-semibold mb-2">
                {obtenerFecha()}
              </p>
              <h1 className="text-4xl font-bold">Eventos del día</h1>
            </div>

            <div
              className="flex flex-col"
              style={{ color: templateActual.fontColor }}
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
          {/* Linea arriba */}
          <div className="bg-gradient-to-t from-gray-50  to-white text-gray-50">
            <div className="">
              <div
                className={`text-white py-5 uppercase text-5xl  md:text-7xl font-bold px-20 rounded-t-xl`}
                style={{
                  backgroundColor: templateActual.templateColor,
                  color: templateActual.fontColor,
                  fontStyle: templateActual.fontStyle, //! NO FUNCIONA
                }}
              >
                {/* Título */}
                <h2 className=" text-white"> </h2>
              </div>
              <div className=" text-black">
                {/* Imagen a la izquierda */}
                <div
                  className="flex flex-col
              "
                >
                  <div className="flex items-center border-b border-black w-full">
                    <div className="space-y-5 pl-5 flex-grow">
                      {eventosEnCurso.map((event) => {
                        return (
                          <div
                            key={event.id}
                            className="flex items-center space-x-4"
                          >
                            {/* Imagen a la izquierda */}
                            <img
                              src={event.images[0]}
                              alt={event.nombreEvento}
                              style={{
                                width: "130px",
                                height: "110px",
                              }}
                            />

                            {/* Detalles del evento */}
                            <div
                            // style={{
                            //   color: fontColor,
                            //   fontFamily: selectedFontStyle
                            //     ? selectedFontStyle.value
                            //     : "Arial",
                            // }}
                            >
                              {/* Aplicando el color seleccionado */}
                              <h3>{event.nombreEvento}</h3>
                              <p>{event.tipoEvento}</p>
                              <p>{event.lugar}</p>
                              {/* Agrega más detalles según sea necesario */}
                              <div className="text-right">
                                <p>{event.horaInicialReal}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                {/* Fecha y hora en la esquina inferior */}

                <div
                  className={`text-2xl font-semibold mt-1 text-center text-white bg-black justify-between flex px-20 rounded-b-xl`}
                  // style={{
                  //   color: fontColor,
                  //   backgroundColor: templateColor,
                  //   fontFamily: selectedFontStyle
                  //     ? selectedFontStyle.value
                  //     : "Arial",
                  // }}
                >
                  <p> </p>
                </div>
              </div>
            </div>
          </div>
          {/* contenido principal */}
          <div className="flex justify-between items-center">
            <p
              className=""
              // style={{
              //   color: fontColor,
              //   fontFamily: selectedFontStyle
              //     ? selectedFontStyle.value
              //     : "Arial",
              // }}
            >
              Grupo renueca el mejor programa de recompensa para asistentes ejec
            </p>
            <img src="/img/licensed-image.jpeg" alt="Logo" className="h-12" />
          </div>
          {/* Linea abajo */}
        </div>
      </div>
    </section>
  );
}

export default PantallaDirec1;
