import { useEffect, useState } from "react";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Importa las funciones necesarias
import { initializeApp } from "firebase/app";
function UserAdmin() {
  const [cantidadPd, setCantidadPd] = useState(0);
  const [cantidadPs, setCantidadPs] = useState(0);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [userEvents, setUserEvents] = useState([]);
  let total = cantidadPd + cantidadPs;
  useEffect(() => {
    // Configuración de Firebase
    // Reemplaza esta configuración con tu propia configuración de Firebase
    const firebaseConfig = {
      apiKey: "AIzaSyCzD--npY_6fZcXH-8CzBV7UGzPBqg85y8",
      authDomain: "upper-a544e.firebaseapp.com",
      projectId: "upper-a544e",
      storageBucket: "upper-a544e.appspot.com",
      messagingSenderId: "665713417470",
      appId: "1:665713417470:web:73f7fb8ee518bea35999af",
      measurementId: "G-QTFQ55YY5D",
    };

    // Inicializa Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(userRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserInfo(userData);

            // Obtener y establecer la cantidad de "pd" y "ps"
            const cantidadPd = userData.pd || 0;
            const cantidadPs = userData.ps || 0;

            setCantidadPd(cantidadPd);
            setCantidadPs(cantidadPs);

            // Obtener y establecer el nombre del usuario
            const nombreUsuario = userData.nombre || "";
            setNombreUsuario(nombreUsuario);
          } else {
            console.log("No se encontraron datos para este usuario.");
          }
        } catch (error) {
          console.error("Error al obtener datos del usuario:", error);
        }
        try {
          const userRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(userRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            console.log("userData", userData);
            setUserInfo(userData);

            // Obtener eventos del usuario
            const eventsQuery = query(
              collection(db, "eventos"),
              where("userId", "==", user.uid)
            );
            const eventsSnapshot = await getDocs(eventsQuery);
            const userEventsData = eventsSnapshot.docs.map((doc) => doc.data());

            // Obtener la fecha actual del dispositivo
            const fechaActual = new Date();
            // Filtro para eventos en curso
            const eventosEnCurso = userEventsData.filter((evento) => {
              const fechaInicial = new Date(evento.fechaInicial);
              const fechaFinal = new Date(evento.fechaFinal);
              return fechaActual >= fechaInicial && fechaActual <= fechaFinal;
            });
            // Filtro para eventos finalizados
            const eventosFinalizados = userEventsData.filter((evento) => {
              const fechaFinal = new Date(evento.fechaFinal);
              return fechaFinal < fechaActual;
            });

            // Filtro para eventos futuros
            const eventosFuturos = userEventsData.filter((evento) => {
              const fechaInicial = new Date(evento.fechaInicial);
              const fechaFinal = new Date(evento.fechaFinal);
              return fechaActual <= fechaFinal && fechaInicial > fechaActual;
            });

            console.log("eventosFinalizados", eventosFinalizados);
            console.log("eventosEnCurso", eventosEnCurso);
            console.log("eventosFuturos", eventosFuturos);
            setUserEvents(userEventsData);
          } else {
            console.log("No se encontraron datos para este usuario.");
          }
        } catch (error) {
          console.error("Error al obtener datos del usuario:", error);
        }
      } else {
        setUserInfo(null);
        setUserEvents([]);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <section className="px-5 md:px-32">
      <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl ">
        Bienvenido
        <span className="text-blue-600 "> {nombreUsuario}</span>
      </h1>
      <div className=" mb-6 ">
        <div className="h-full py-8 px-6 space-y-6 rounded-xl border border-gray-200 bg-white">
          <div className="px-6 pt-6 2xl:container">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              <div className="md:col-span-2 lg:col-span-1">
                <div className="h-full py-8 px-6 space-y-6 rounded-xl border border-gray-200 bg-white">
                  <table className="table-auto w-full">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left border-b-2 w-full">
                          <h2 className="text-ml font-bold text-gray-600">
                            Información de eventos
                          </h2>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b w-full">
                        <td className="px-4 py-2 text-left align-top w-1/2">
                          <div>
                            <h2>Eventos actuales</h2>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right text-cyan-500 w-1/2">
                          <p>
                            <span>5</span>
                          </p>
                        </td>
                      </tr>
                      <tr className="border-b w-full">
                        <td className="px-4 py-2 text-left align-top w-1/2">
                          <div>
                            <h2>Eventos esta semana</h2>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right text-cyan-500 w-1/2">
                          <p>
                            <span>10</span>
                          </p>
                        </td>
                      </tr>
                      <tr className="border-b w-full">
                        <td className="px-4 py-2 text-left align-top w-1/2">
                          <div>
                            <h2>Eventos finalizados</h2>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right text-cyan-500 w-1/2">
                          <p>
                            <span>8</span>
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="md:col-span-2 lg:col-span-1">
                <div className="h-full py-8 px-6 space-y-6 rounded-xl border border-gray-200 bg-white">
                  <table className="table-auto w-full">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left border-b-2 w-full">
                          <h2 className="text-ml font-bold text-gray-600">
                            Plan de suscripción
                          </h2>
                          <p className="text-ml font-bold ">
                            actualmente tiene{" "}
                            <span className=" text-cyan-500 w-1/2">
                              {total}
                            </span>{" "}
                            suscripciones{" "}
                          </p>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b w-full">
                        <td className="px-4 py-2 text-left align-top w-1/2">
                          <div>
                            <h2>Pantalla salon</h2>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right text-cyan-500 w-1/2">
                          <p>
                            <span>{cantidadPs}</span>
                          </p>
                        </td>
                      </tr>
                      <tr className="border-b w-full">
                        <td className="px-4 py-2 text-left align-top w-1/2">
                          <div>
                            <h2>Pantalla directorio</h2>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right text-cyan-500 w-1/2">
                          <p>
                            <span>{cantidadPd}</span>
                          </p>
                        </td>
                      </tr>
                      <tr className="border-b w-full">
                        <td className="px-4 py-2 text-left align-top w-1/2">
                          <div>
                            <h2>publicidad</h2>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right text-cyan-500 w-1/2">
                          <p>
                            <span>8</span>
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default UserAdmin;
