"use client";
import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const obtenerHora = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

function Pantalla1() {
  const [eventData, setEventData] = useState(null);
  const [currentHour, setCurrentHour] = useState(obtenerHora());

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
    const firestore = getFirestore(app);

    // Consultar la colección 'eventos' en Firebase
    const eventosRef = collection(firestore, "eventos");
    const q = query(eventosRef, where("assignedScreen", "==", "pantalla1"));

    getDocs(q).then((snapshot) => {
      if (!snapshot.empty) {
        // Buscar el primer documento que tenga tanto personalizacionTemplate como evento
        const primerEvento = snapshot.docs.find((doc) => {
          const data = doc.data();
          console.log("Documento completo:", data); // Agregamos este log
          return data.personalizacionTemplate && data.evento;
        });

        if (primerEvento) {
          console.log("Primer evento encontrado:", primerEvento.data()); // Agregamos este log
          const evento = primerEvento.data().evento;
          const personalizacionTemplate =
            primerEvento.data().personalizacionTemplate;
          console.log("Evento Datos:", evento);

          // Configurar el estado con los datos necesarios
          setEventData({
            ...personalizacionTemplate,
            ...evento,
          });
        } else {
          console.log("Ningún evento encontrado con los campos necesarios."); // Agregamos este log
        }
      }
    });
  }, []);

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

  return (
    <section className="relative inset-0 w-full min-h-screen md:fixed sm:fixed min-[120px]:fixed bg-white">
      <div className="bg-white text-black h-full flex flex-col justify-center">
        <div className="flex items-center justify-between">
          {/* Reemplaza el logo con el valor de 'logo' del evento */}
          <img src={eventData.logo} alt="Logo" className="w-96" />
          <h1 className="font-bold text-5xl mr-16">{eventData.lugar}</h1>
        </div>
        <div className="bg-gradient-to-t from-gray-50 to-white text-gray-50">
          <div className="mx-2">
            <div
              className={`text-white py-5 text-5xl font-bold bg-gradient-to-r from-black to-black px-20 rounded-t-xl`}
            >
              {/* Reemplaza 'REUNION DE FIN DE CURSO' con el valor de 'nombreEvento' del evento */}
              <h2>{eventData.nombreEvento}</h2>
            </div>
            <div className="grid grid-cols-[max-content_1fr] gap-x-4 text-black">
              <div className="mr-4 my-4">
                {/* Reemplaza el src del logo con el valor de 'logo' del evento */}
                <img className="w-96 ml-12" src={logo} />
              </div>

              <div className="space-y-8 pl-10 mb-12 my-4">
                <div>
                  <h1 className="text-4xl font-bold">Sesión:</h1>
                  {/* Reemplaza 'Hora Inicial hrs.' con el valor de 'horaInicialReal' del evento */}
                  <p className="text-4xl font-bold">{`Hora Inicial ${eventData.horaInicialReal}hrs.`}</p>
                </div>
                <div className="max-w-xs">
                  {/* Tipo de evento y descripción */}
                  {/* Reemplaza 'Tipo de Evento Desconocido' con el valor adecuado del evento */}
                  <h1 className="text-4xl font-bold">{eventData.eventoTipo}</h1>
                  <div className="text-center flex px-0">
                    {/* Reemplaza 'EJEMPLO' con el valor adecuado del evento */}
                    <p className="text-4xl font-bold text-left">
                      {eventData.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="text-4xl py-4 font-semibold mt-1 text-center bg-gradient-to-r from-black to-black justify-between flex px-20 rounded-b-xl">
                {/* Agrega la fecha actual o la fecha del evento si es relevante */}
                <p>{obtenerFecha()}</p>
                {/* Reemplaza '01:12:13' con el valor de 'currentHour' del estado si es relevante */}
                <p>{currentHour}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Pantalla1;
