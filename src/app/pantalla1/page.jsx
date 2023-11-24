"use client";
import {
  getFirestore,
  collection,
  getDocs,
  where,
  query as firestoreQuery,
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

function Pantalla1() {
  const [user, setUser] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [currentHour, setCurrentHour] = useState(obtenerHora());
  const [firestore, setFirestore] = useState(null);

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
    if (user && firestore) {
      const eventosRef = collection(firestore, "eventos");
      const eventosQuery = firestoreQuery(
        eventosRef,
        where("userId", "==", user.uid)
      );

      const obtenerEventos = async () => {
        try {
          const querySnapshot = await getDocs(eventosQuery);
          const eventos = querySnapshot.docs.map((doc) => doc.data());

          // Obtener fecha y hora actual
          const fechaActual = new Date();
          const horaActual = obtenerHora();

          // Filtrar eventos en función de la fecha y hora actual
          const eventosEnCurso = eventos.filter((evento) => {
            const fechaInicio = new Date(evento.fechaInicio);
            const fechaFinal = new Date(evento.fechaFinal);
            const horaInicial = evento.horaInicialReal;
            const horaFinal = evento.horaFinalReal;

            // Comparar si la fecha actual está dentro del rango de fechas del evento
            const fechaActualEnRango =
              fechaActual >= fechaInicio && fechaActual <= fechaFinal;

            // Comparar si la hora actual está dentro del rango horario del evento
            const horaActualEnRango =
              horaActual >= horaInicial && horaActual <= horaFinal;

            return fechaActualEnRango && horaActualEnRango;
          });

          // Actualizar el estado con los eventos en curso
          setEventData(eventosEnCurso);
        } catch (error) {
          console.error("Error al obtener eventos:", error);
        }
      };

      obtenerEventos();

      const interval = setInterval(() => {
        obtenerEventos(); // Llamar a la función cada 5 segundos
      }, 5000);

      return () => clearInterval(interval); // Limpiar el intervalo al desmontar el componente
    }
  }, [user, firestore]);

  if (!eventData) {
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

  console.log(eventData);

  if (!eventData || eventData.length === 0) {
    return <p>No hay eventos disponibles en este momento.</p>;
  }

  const eventoActual = eventData[0]; // Obtener el primer evento de la lista

  const {
    personalizacionTemplate,
    lugar,
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
            {personalizacionTemplate.logo && (
              <img
                src={personalizacionTemplate.logo}
                alt="Logo"
                className="w-44"
              />
            )}
            <h1
              className={`font-bold text-5xl mr-16`}
              style={{ color: personalizacionTemplate.fontColor }}
            >
              {lugar}
            </h1>
          </div>
          {/* Linea arriba */}
          <div
            className={`text-white py-5 text-5xl font-bold px-20 rounded-t-xl`}
            style={{
              backgroundColor: personalizacionTemplate.templateColor,
              color: personalizacionTemplate.fontColor,
              fontStyle: personalizacionTemplate.fontStyle, //! NO FUNCIONA
            }}
          >
            <h2>{nombreEvento}</h2>
          </div>
          {/* contenido principal */}
          <div className="bg-gradient-to-t from-gray-50  to-white text-gray-50">
            <div className="grid grid-cols-3 gap-x-4 text-black">
              <div className="col-span-1  mr-4 my-auto">
                {images && images.length > 0 ? (
                  <>
                    <div className="">
                      <div ref={sliderRef} className="keen-slider">
                        {images.map((image, index) => (
                          // eslint-disable-next-line react/jsx-key
                          <div className="keen-slider__slide number-slide1 flex items-center justify-center">
                            <img
                              key={index}
                              src={image}
                              alt={`Imagen ${index + 1}`}
                              className=""
                              style={{ maxWidth: "100%", maxHeight: "600px" }}
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
                  <h1
                    className={`text-4xl font-bold`}
                    style={{ color: personalizacionTemplate.fontColor }}
                  >
                    Sesión:
                  </h1>
                  <p
                    className={`text-4xl font-bold`}
                    style={{ color: personalizacionTemplate.fontColor }}
                  >
                    {horaInicialReal}
                    <span className="text-2x1">hrs.</span>
                  </p>
                </div>
                <div className="">
                  {/* Tipo de evento y descripción */}
                  <h1
                    className={`text-4xl font-bold`}
                    style={{ color: personalizacionTemplate.fontColor }}
                  >
                    {tipoEvento}
                  </h1>
                  <div className="text-center flex px-0">
                    <p
                      className={` text-4xl font-bold text-left`}
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
            className={`text-4xl py-4 font-semibold mt-1 text-center justify-between flex px-20 rounded-b-xl`}
            style={{
              backgroundColor: personalizacionTemplate.templateColor,
              color: personalizacionTemplate.fontColor,
              fontStyle: personalizacionTemplate.fontStyle, //! NO FUNCIONA
            }}
          >
            <p style={{ color: personalizacionTemplate.fontColor }}>
              {obtenerFecha()}
            </p>
            <p style={{ color: personalizacionTemplate.fontColor }}>
              {currentHour}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Pantalla1;
