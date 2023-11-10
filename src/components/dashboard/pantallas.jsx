import Link from "next/link";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// Initialize Firebase
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
const db = getFirestore(app);

function Pantallas() {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [screen1AspectRatio, setScreen1AspectRatio] = useState("16:9");
  const [screen2AspectRatio, setScreen2AspectRatio] = useState("9:16");
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe(); // Cleanup function
  }, [auth]);

  useEffect(() => {
    const fetchEvents = async () => {
      if (user) {
        try {
          const eventosRef = collection(db, "eventos");
          const q = query(
            eventosRef,

            where("personalizacionTemplate", "!=", null)
          );
          const querySnapshot = await getDocs(q);

          const eventsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          console.log("eventsData", eventsData); // Verifica si se están recibiendo datos

          setEvents(eventsData);
        } catch (error) {
          console.error("Error al obtener eventos:", error);
        }
      }
    };

    fetchEvents();
  }, [user, db]);

  const handleGuardar = async () => {
    // Update Firebase document with the selected event
    if (user && selectedEvent) {
      const eventoDocRef = doc(db, "eventos", selectedEvent.id);
      await updateDoc(eventoDocRef, { assignedScreen: "pantalla1" });
      alert("Evento asignado a pantalla1 correctamente");
    } else {
      console.error("Usuario no autenticado o evento no seleccionado");
    }
  };

  return (
    <section className="pl-14 md:px-32">
      <h1 className="text-3xl font-extrabold text-gray-900">
        Ajuste de pantallas
      </h1>

      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Nombre
              </th>
              <th scope="col" className="px-6 py-3">
                Seleccionar eventos
              </th>
              <th scope="col" className="px-6 py-3">
                Ver pantalla
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <th
                scope="row"
                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
              >
                pantalla1
              </th>

              <div className="mb-4">
                <label className="text-white dark:text-gray-200 block mb-1">
                  Seleccionar Evento
                </label>
                <select
                  className="w-full py-2 px-3 border rounded-lg bg-gray-700 text-white"
                  value={selectedEvent ? selectedEvent.id : ""}
                  onChange={async (e) => {
                    const eventId = e.target.value;
                    const event = events.find((event) => event.id === eventId);
                    setSelectedEvent(event);
                  }}
                >
                  <option value="">Seleccionar Evento</option>
                  {events.length > 0 &&
                    events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.nombreEvento}
                      </option>
                    ))}
                  {events.length === 0 && (
                    <option value="" disabled>
                      No hay eventos disponibles
                    </option>
                  )}
                </select>
              </div>
              <td className="px-6 py-4">
                <button
                  onClick={handleGuardar}
                  className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                >
                  Guardar
                </button>
                <Link
                  href="/pantalla1"
                  className="bg-gray-300 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full active:bg-gray-500"
                >
                  pantalla completa
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default Pantallas;
