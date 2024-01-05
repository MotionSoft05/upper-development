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
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";
function UserAdmin() {
  const [cantidadPd, setCantidadPd] = useState(0);
  const [cantidadPs, setCantidadPs] = useState(0);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [userEvents, setUserEvents] = useState([]);
  const [cantidadPublicidad, setCantidadPublicidad] = useState(0);

  let total = cantidadPd + cantidadPs;

  useEffect(() => {
    const firebaseConfig = {
      apiKey: "AIzaSyDpo0u-nVMA4LnbInj_qAkzcUfNtT8h29o",
      authDomain: "upper-b0be3.firebaseapp.com",
      projectId: "upper-b0be3",
      storageBucket: "upper-b0be3.appspot.com",
      messagingSenderId: "295362615418",
      appId: "1:295362615418:web:c22cac2f406e4596c2c3c3",
      measurementId: "G-2E66K5XY81",
    };
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

            const cantidadPd = userData.pd || 0;
            const cantidadPs = userData.ps || 0;

            setCantidadPd(cantidadPd);
            setCantidadPs(cantidadPs);

            const nombreUsuario = userData.nombre || "";
            setNombreUsuario(nombreUsuario);

            const publicidadQuery = query(
              collection(db, "Publicidad"),
              where("userId", "==", user.uid)
            );
            const publicidadSnapshot = await getDocs(publicidadQuery);
            const cantidadPublicidad = publicidadSnapshot.docs.length;

            // Update the state with the count of advertisements
            setCantidadPublicidad(cantidadPublicidad);
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

            const eventsQuery = query(
              collection(db, "eventos"),
              where("userId", "==", user.uid)
            );
            const eventsSnapshot = await getDocs(eventsQuery);
            const userEventsData = eventsSnapshot.docs.map((doc) => doc.data());

            const fechaActual = new Date();
            const eventosEnCurso = userEventsData.filter((evento) => {
              const fechaInicial = new Date(evento.fechaInicial);
              const fechaFinal = new Date(evento.fechaFinal);
              return fechaActual >= fechaInicial && fechaActual <= fechaFinal;
            });
            const eventosFinalizados = userEventsData.filter((evento) => {
              const fechaFinal = new Date(evento.fechaFinal);
              return fechaFinal < fechaActual;
            });

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
      <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6x2">
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
                          <h2 className="text-ml font-bold ">
                            Información de eventos
                          </h2>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b w-full">
                        <td className="px-4 py-2 text-left align-top w-1/2">
                          <div>
                            <h2>Eventos Hoy</h2>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right text-cyan-500 w-1/2">
                          <p>
                            <span>
                              {
                                userEvents.filter((evento) => {
                                  const fechaInicial = new Date(
                                    evento.fechaInicio + "T00:00:00"
                                  );
                                  const fechaFinal = new Date(
                                    evento.fechaFinal + "T23:59:59"
                                  );
                                  const fechaActual = new Date();
                                  return (
                                    evento.status &&
                                    fechaActual >= fechaInicial &&
                                    fechaActual <= fechaFinal
                                  );
                                }).length
                              }
                            </span>
                          </p>
                        </td>
                      </tr>
                      <tr className="border-b w-full">
                        <td className="px-4 py-2 text-left align-top w-1/2">
                          <div>
                            <h2>Eventos Semana</h2>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right text-cyan-500 w-1/2">
                          <p>
                            <span>
                              {
                                userEvents.filter((evento) => {
                                  const fechaInicial = new Date(
                                    evento.fechaInicio + "T00:00:00"
                                  );
                                  const fechaFinal = new Date(
                                    evento.fechaFinal + "T23:59:59"
                                  );
                                  const fechaActual = new Date();
                                  const finSemana = new Date(fechaActual);
                                  finSemana.setDate(fechaActual.getDate() + 6);
                                  return (
                                    evento.status &&
                                    fechaActual <= fechaFinal &&
                                    finSemana >= fechaInicial
                                  );
                                }).length
                              }
                            </span>
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
                            <span>
                              {
                                userEvents.filter((evento) => {
                                  const fechaFinal = new Date(
                                    evento.fechaFinal + "T23:59:59"
                                  );
                                  const fechaActual = new Date();
                                  return (
                                    !evento.status && fechaFinal < fechaActual
                                  );
                                }).length
                              }
                            </span>
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
                          <h2 className="text-ml font-bold ">
                            Plan de suscripción
                          </h2>
                          <p className="text-ml font-bold text-gray-600">
                            Actualmente tienes{" "}
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
                            <h2>Publicidad</h2>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right text-cyan-500 w-1/2">
                          <p>
                            <span>{cantidadPublicidad}</span>
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
