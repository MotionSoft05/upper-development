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

function Pantalla6() {
  const [user, setUser] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [currentHour, setCurrentHour] = useState(obtenerHora());
  const [firestore, setFirestore] = useState(null);
  const [eventosEnCurso, setEventosEnCurso] = useState([]); // Nuevo estado

  const numeroPantallaActual = "6";

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

            // Filtrar por fecha y hora los eventos filtrados por pantalla
            const eventosEnCurso = eventosData.filter((evento) => {
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
              console.log("evento", evento);
              // console.log("fechaActual", fechaActual);
              // console.log("fechaInicioEvento", fechaInicioEvento);
              // console.log("fechaFinalEvento", fechaFinalEvento);
              // console.log(
              //   "---------------------------------------------------"
              // );
              // console.log("fechaActualEnRango", fechaActualEnRango);
              // console.log(
              //   "---------------------------------------------------"
              // );

              // console.log("horaActual", horaActual);
              // console.log("horaInicialEvento", horaInicialEvento);
              // console.log("horaFinalEvento", horaFinalEvento);
              // console.log(
              //   "---------------------------------------------------"
              // );
              // console.log("horaActualEnRango", horaActualEnRango);
              // console.log(
              //   "---------------------------------------------------"
              // );
              return fechaActualEnRango && horaActualEnRango;
            });

            console.log("Eventos filtrados por fecha y hora:", eventosEnCurso);
            setEventosEnCurso(eventosEnCurso);
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
      }, 5000);

      return () => clearInterval(interval); // Limpiar el intervalo al desmontar el componente
    }
  }, [user, firestore]);
  const eventoActualCopy = eventosEnCurso[0]; // Obtener el primer evento de la lista

  const [opacities, setOpacities] = useState([]);

  let loop = true; // Establecer el valor predeterminado
  let img = 1;
  if (eventoActualCopy) {
    loop =
      eventoActualCopy.images && eventoActualCopy.images.length === 1
        ? false
        : true;
    img = eventoActualCopy.images.length;
  }

  console.log("loop", img);
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
        console.log("new_opacities", new_opacities);
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

  if (!eventosEnCurso || eventosEnCurso.length === 0) {
    return <p>No hay eventos disponibles en este momento.</p>;
  }

  const eventoActual = eventosEnCurso[0]; // Obtener el primer evento de la lista
  // console.log("eventoActual", eventoActual);
  const {
    personalizacionTemplate,
    lugar,
    nombreEvento,
    images,
    horaInicialReal,
    tipoEvento,
    description,
    devices,
  } = eventoActual;

  return (
    <section className="relative inset-0 w-full min-h-screen md:fixed sm:fixed min-[120px]:fixed bg-white">
      <div className="bg-white  text-black h-full flex flex-col justify-center mx-2 my-2">
        <div id="Content" className="flex-grow flex flex-col justify-center ">
          {/* Header */}
          <div className="flex items-center justify-between ">
            {personalizacionTemplate.logo && (
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
                    src={personalizacionTemplate.logo}
                    alt="Logo"
                    className="w-72"
                  />
                </div>{" "}
              </>
            )}
            <h1
              className={`font-bold uppercase text-5xl md:text-7xl  mr-16`}
              style={{ color: personalizacionTemplate.fontColor }}
            >
              {devices[0]}
            </h1>
          </div>
          {/* Linea arriba */}
          <div
            className={`text-white py-5 uppercase text-5xl  md:text-7xl font-bold px-20 rounded-t-xl`}
            style={{
              backgroundColor: personalizacionTemplate.templateColor,
              color: personalizacionTemplate.fontColor,
              fontStyle: personalizacionTemplate.fontStyle, //! NO FUNCIONA
            }}
          >
            <h2>{nombreEvento}</h2>
          </div>
          {/* contenido principal */}
          <div className="bg-gradient-to-b from-gray-100  via-white to-gray-100 text-gray-50 py-5">
            <div className="grid grid-cols-3 gap-x-4 text-black">
              <div className="col-span-1  mr-4 my-auto">
                {images && images.length > 0 ? (
                  <>
                    <div className="slider-container">
                      <div
                        ref={sliderRef}
                        className="keen-slider"
                        style={{
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        {images.map((image, index) => (
                          <div
                            key={index}
                            className="keen-slider__slide number-slide1 flex justify-center items-center overflow-hidden"
                            style={{
                              width: "30vw",
                              height: "30vw",
                              opacity: opacities[index],
                              top: "0",
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
                                position: "absolute",
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <p style={{ color: personalizacionTemplate.fontColor }}>
                    No hay imágenes disponibles
                  </p>
                )}
              </div>

              <div className="col-span-2 space-y-8  my-4">
                <div>
                  <p
                    className={`text-3xl md:text-4xl font-bold`}
                    style={{ color: personalizacionTemplate.fontColor }}
                  >
                    {horaInicialReal}
                    <span className="text-2x1"> hrs.</span>
                  </p>
                </div>
                <div className="">
                  {/* Tipo de evento y descripción */}
                  <h1
                    className={`text-3xl md:text-4xl font-bold`}
                    style={{ color: personalizacionTemplate.fontColor }}
                  >
                    {tipoEvento}
                  </h1>
                  <div className="text-center flex px-0 mt-6">
                    <p
                      className={`text-3xl md:text-4xl`}
                      style={{ color: personalizacionTemplate.fontColor }}
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
              backgroundColor: personalizacionTemplate.templateColor,
              color: personalizacionTemplate.fontColor,
              fontStyle: personalizacionTemplate.fontStyle,
            }}
          >
            <p
              className="font-bold uppercase"
              style={{ color: personalizacionTemplate.fontColor }}
            >
              {obtenerFecha()}
            </p>
            <div className="flex items-center justify-center">
              <img src="/img/clock.png" className="p-1 h-8" />
              <p
                className=" uppercase"
                style={{ color: personalizacionTemplate.fontColor }}
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

export default Pantalla6;
