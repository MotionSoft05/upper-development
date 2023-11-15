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
  const [sliderRef] = useKeenSlider({
    loop: true,
  });
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

  useEffect(() => {
    if (user && firestore) {
      // Check if firestore is defined
      const eventosRef = collection(firestore, "eventos");

      const assignedScreenValue = "pantalla1";
      const q = firestoreQuery(
        eventosRef,
        where("assignedScreen", "==", assignedScreenValue),
        where("userId", "==", user.uid)
      );

      getDocs(q).then((snapshot) => {
        if (!snapshot.empty) {
          const primerEvento = snapshot.docs[0].data();
          console.log("eventData:", primerEvento);
          setEventData(primerEvento);
        }
      });
    }
  }, [user, firestore]);
  //
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHour(obtenerHora());
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

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

  const {
    personalizacionTemplate,
    lugar,
    nombreEvento,
    images,
    horaInicialReal,
    tipoEvento,
    description,
  } = eventData;

  return (
    <section className="relative inset-0 w-full min-h-screen md:fixed sm:fixed min-[120px]:fixed bg-white">
      <div className="bg-white  text-black h-full flex flex-col justify-center">
        <div className="flex items-center justify-between">
          {personalizacionTemplate.logo && (
            <img
              src={personalizacionTemplate.logo}
              alt="Logo"
              className="w-96"
            />
          )}
          <h1
            className={`font-bold text-5xl mr-16`}
            style={{ color: personalizacionTemplate.fontColor }}
          >
            {lugar}
          </h1>
        </div>
        <div className="bg-gradient-to-t from-gray-50  to-white text-gray-50">
          <div className=" mx-2">
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
            <div className="grid grid-cols-2 gap-x-4 text-black">
              <div className="mr-4 my-4">
                {images && images.length > 0 ? (
                  <>
                    <div className="mr-4">
                      <div ref={sliderRef} className="keen-slider">
                        {images.map((image, index) => (
                          // eslint-disable-next-line react/jsx-key
                          <div className="keen-slider__slide number-slide1 flex items-center justify-center">
                            <img
                              key={index}
                              src={image}
                              alt={`Imagen ${index + 1}`}
                              className="h-10"
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

              <div className=" space-y-8 pl-10 mb-12 my-4">
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
                <div className="max-w-xs">
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
            <div>
              <div
                className={`text-4xl py-4 font-semibold mt-1 text-center  justify-between flex px-20 rounded-b-xl`}
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
        </div>
      </div>
    </section>
  );
}

export default Pantalla1;
