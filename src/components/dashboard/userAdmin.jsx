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
import { useTranslation } from "react-i18next";
import Select from "react-select";
import db from "@/firebase/firestore";
import auth from "@/firebase/auth";

function UserAdmin() {
  const { t } = useTranslation(); // Traducciones i18N

  const [cantidadPd, setCantidadPd] = useState(0);
  const [cantidadPs, setCantidadPs] = useState(0);
  const [cantidadPservice, setCantidadPservice] = useState(0);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [userEvents, setUserEvents] = useState([]);
  const [cantidadPublicidad, setCantidadPublicidad] = useState(0);
  const [cantidadPublicidadSalon, setCantidadPublicidadSalon] = useState(0);
  const [cantidadPublicidadDirectorio, setCantidadPublicidadDirectorio] =
    useState(0);
  const [empresas, setEmpresas] = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");

  const total =
    parseInt(cantidadPd) + parseInt(cantidadPs) + parseInt(cantidadPservice);

  useEffect(() => {

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
            const cantidadPservice = userData.pservice || 0;

            setCantidadPd(cantidadPd);
            setCantidadPs(cantidadPs);
            setCantidadPservice(cantidadPservice);

            const nombreUsuario = userData.nombre || "";
            setNombreUsuario(nombreUsuario);

            console.log("Inicio del bloque de inicialización de publicidad");

            const publicidadSalonQuery = query(
              collection(db, "Publicidad"),
              where("empresa", "==", userData.empresa),
              where("tipo", "==", "salon")
            );
            const publicidadSalonSnapshot = await getDocs(publicidadSalonQuery);
            const cantidadSalon = publicidadSalonSnapshot.docs.length;
            setCantidadPublicidadSalon(cantidadSalon);
            console.log("Cantidad de publicidad de salón:", cantidadSalon);

            // Bloque de inicialización de publicidad de directorio
            const publicidadDirectorioQuery = query(
              collection(db, "Publicidad"),
              where("empresa", "==", userData.empresa),
              where("tipo", "==", "directorio")
            );
            const publicidadDirectorioSnapshot = await getDocs(
              publicidadDirectorioQuery
            );
            const cantidadDirectorio = publicidadDirectorioSnapshot.docs.length;
            setCantidadPublicidadDirectorio(cantidadDirectorio);
            console.log(
              "Cantidad de publicidad de directorio:",
              cantidadDirectorio
            );

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
              where("empresa", "==", userData.empresa) // Modifica aquí para usar el campo "empresa"
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

  useEffect(() => {
    const obtenerEmpresas = async () => {
      const firebaseConfig = {
        /* Configuración de Firebase */
      };
      const db = getFirestore();
      const usuariosRef = collection(db, "usuarios");
      const usuariosSnapshot = await getDocs(usuariosRef);
      const empresas = usuariosSnapshot.docs.map((doc) => doc.data().empresa);
      const empresasFiltradas = [...new Set(empresas)];
      setEmpresas(empresasFiltradas);
    };

    obtenerEmpresas();
  }, []);

  useEffect(() => {
    const obtenerEventos = async () => {
      if (empresaSeleccionada) {
        const firebaseConfig = {
          /* Configuración de Firebase */
        };
        const db = getFirestore();
        const eventosRef = collection(db, "eventos");
        const eventosQuery = query(
          eventosRef,
          where("empresa", "==", empresaSeleccionada)
        );
        const eventosSnapshot = await getDocs(eventosQuery);
        const eventos = eventosSnapshot.docs.map((doc) => doc.data());
        setUserEvents(eventos);
      }
    };

    obtenerEventos();
  }, [empresaSeleccionada]);

  useEffect(() => {
    const obtenerDatosEmpresa = async () => {
      if (empresaSeleccionada) {
        const firebaseConfig = {
          /* Configuración de Firebase */
        };
        const db = getFirestore();

        // Obtener datos de la empresa seleccionada
        const usuariosRef = collection(db, "usuarios");
        const usuariosQuery = query(
          usuariosRef,
          where("empresa", "==", empresaSeleccionada)
        );
        const usuariosSnapshot = await getDocs(usuariosQuery);
        const datosEmpresa = usuariosSnapshot.docs[0].data();

        setCantidadPd(datosEmpresa.pd || 0);
        setCantidadPs(datosEmpresa.ps || 0);
        setCantidadPservice(datosEmpresa.pservice || 0);

        // Obtener cantidad de publicidades de salón
        const publicidadSalonQuery = query(
          collection(db, "Publicidad"),
          where("empresa", "==", empresaSeleccionada),
          where("tipo", "==", "salon")
        );
        const publicidadSalonSnapshot = await getDocs(publicidadSalonQuery);
        setCantidadPublicidadSalon(publicidadSalonSnapshot.docs.length);

        // Obtener cantidad de publicidades de directorio
        const publicidadDirectorioQuery = query(
          collection(db, "Publicidad"),
          where("empresa", "==", empresaSeleccionada),
          where("tipo", "==", "directorio")
        );
        const publicidadDirectorioSnapshot = await getDocs(
          publicidadDirectorioQuery
        );
        setCantidadPublicidadDirectorio(
          publicidadDirectorioSnapshot.docs.length
        );
      }
    };

    obtenerDatosEmpresa();
  }, [empresaSeleccionada]);

  const handleChangeEmpresa = (e) => {
    setEmpresaSeleccionada(e.target.value);
  };

  return (
    <section className="pl-10 md:px-32">
      <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6x2">
        {/* Bienvenido */}
        {t("userAdmin.welcome")}
        <span className="text-blue-600 "> {nombreUsuario}</span>
      </h1>
      <div className=" mb-6 ">
        <div className="h-full py-8 px-6 space-y-6 rounded-xl border border-gray-200 bg-white">
          <div className="px-6 pt-6 2xl:container">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {/* Selector de empresas */}
              {userInfo && userInfo.permisos === 10 && (
                <div className="md:col-span-2 lg:col-span-1">
                  <select
                    className="block w-full bg-white border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                    onChange={handleChangeEmpresa}
                    value={empresaSeleccionada}
                  >
                    <option value="">{t("userAdmin.selectCompany")}</option>
                    {empresas.map((empresa, index) => (
                      <option key={index} value={empresa}>
                        {empresa}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
          <div className="px-6 pt-6 2xl:container">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              <div className="md:col-span-2 lg:col-span-1">
                <div className="h-full py-8 px-6 space-y-6 rounded-xl border border-gray-200 bg-white">
                  <table className="table-auto w-full">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left border-b-2 w-full">
                          <h2 className="text-ml font-bold ">
                            {/* Información de eventos */}
                            {t("userAdmin.eventInfo")}
                          </h2>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b w-full">
                        <td className="px-4 py-2 text-left align-top w-1/2">
                          <div>
                            {/* Eventos Hoy */}
                            <h2>{t("userAdmin.todayEvents")}</h2>
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
                            <h2>
                              {/* Eventos Semana */}
                              {t("userAdmin.weekEvents")}
                            </h2>
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
                            <h2>
                              {/* Eventos finalizados */}
                              {t("userAdmin.finishedEvents")}
                            </h2>
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
                            {/* Plan de suscripción */}
                            {t("userAdmin.subscriptionPlan")}
                          </h2>
                          <p className="text-ml font-bold text-gray-600">
                            {t("userAdmin.currentSubscriptions")}
                            <span className="ml-2 text-cyan-500 w-1/2">
                              {total}
                            </span>
                          </p>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b w-full">
                        <td className="px-4 py-2 text-left align-top w-1/2">
                          <div>
                            <h2>
                              {/* Pantalla salon */}
                              {t("userAdmin.roomScreen")}
                            </h2>
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
                            <h2>
                              {/* Pantalla directorio */}
                              {t("userAdmin.directoryScreen")}
                            </h2>
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
                            <h2>
                              {/* Pantalla directorio */}
                              {t("userAdmin.servicescreen")}
                            </h2>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right text-cyan-500 w-1/2">
                          <p>
                            <span>{cantidadPservice}</span>
                          </p>
                        </td>
                      </tr>
                      <tr className="border-b w-full">
                        <td className="px-4 py-2 text-left align-top w-1/2">
                          <div>
                            <h2>
                              {/* Publicidad Salón */}
                              {t("userAdmin.roomAdvertisement")}
                            </h2>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right text-cyan-500 w-1/2">
                          <p>
                            <span>{cantidadPublicidadSalon}</span>
                          </p>
                        </td>
                      </tr>

                      <tr className="border-b w-full">
                        <td className="px-4 py-2 text-left align-top w-1/2">
                          <div>
                            <h2>
                              {/* Publicidad Directorio */}
                              {t("userAdmin.directoryAdvertisement")}
                            </h2>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right text-cyan-500 w-1/2">
                          <p>
                            <span>{cantidadPublicidadDirectorio}</span>
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
