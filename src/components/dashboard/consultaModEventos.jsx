import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCzD--npY_6fZcXH-8CzBV7UGzPBqg85y8",
  authDomain: "upper-a544e.firebaseapp.com",
  projectId: "upper-a544e",
  storageBucket: "upper-a544e.appspot.com",
  messagingSenderId: "665713417470",
  appId: "1:665713417470:web:73f7fb8ee518bea35999af",
  measurementId: "G-QTFQ55YY5D",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

function ConsultaModEvento() {
  const [usuarios, setUsuarios] = useState([]);
  const [user, setUser] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [eventoEditado, setEventoEditado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [edicionFechas, setEdicionFechas] = useState(false);
  const [horaInicialReal, setHoraInicialReal] = useState("");
  const [horaFinalReal, setHoraFinalReal] = useState("");
  const [description, setDescription] = useState("");
  const [usuarioLogeado, setUsuarioLogeado] = useState("");

  useEffect(() => {
    const unsubscribeEventos = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        setUsuarioLogeado(user.email);
        consultarEventos(user.uid);
      } else {
        setUser(null);
        setEventos([]);
        setUsuarioLogeado("");
      }
    });

    const unsubscribeUsuarios = firebase
      .firestore()
      .collection("usuarios")
      .onSnapshot((snapshot) => {
        const usuariosData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsuarios(usuariosData);
      });

    return () => {
      unsubscribeEventos();
      unsubscribeUsuarios();
    };
  }, []);

  const consultarEventos = async () => {
    try {
      const user = firebase.auth().currentUser;

      if (user && user.email === "uppermex10@gmail.com") {
        // Si el usuario es uppermex10@gmail.com, muestra todos los eventos
        const eventosRef = firebase.firestore().collection("eventos");
        eventosRef.onSnapshot((snapshot) => {
          const eventosData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log("Eventos recibidos:", eventosData);
          setEventos(eventosData);
        });
      } else if (user) {
        // Si es otro usuario, muestra solo sus propios eventos
        const eventosRef = firebase
          .firestore()
          .collection("eventos")
          .where("userId", "==", user.uid);

        eventosRef.onSnapshot((snapshot) => {
          const eventosData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log("Eventos recibidos:", eventosData);
          setEventos(eventosData);
        });
      }
    } catch (error) {
      console.error("Error al consultar eventos:", error);
    }
  };

  const eliminarEvento = async (id) => {
    try {
      await firebase.firestore().collection("eventos").doc(id).delete();
    } catch (error) {
      console.error("Error al eliminar el evento:", error);
    }
  };

  const abrirModalEdicion = (evento) => {
    setEventoEditado({ ...evento });
    setHoraInicialReal(evento.horaInicialReal || "");
    setHoraFinalReal(evento.horaFinalReal || "");
    setModalAbierto(true);
    setEdicionFechas(false);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEventoEditado(null);
    setHoraInicialReal("");
    setHoraFinalReal("");
  };

  const guardarCambios = async () => {
    try {
      console.log(description);
      const fechaInicioFormateada = eventoEditado.fechaInicio;
      const fechaFinalFormateada = eventoEditado.fechaFinal;
      await firebase
        .firestore()
        .collection("eventos")
        .doc(eventoEditado.id)
        .update({
          ...eventoEditado,
          horaInicialReal,
          horaFinalReal,
          fechaInicio: fechaInicioFormateada,
          fechaFinal: fechaFinalFormateada,
          description: description,
        });

      setModalAbierto(false);
      setEventoEditado(null);
      setHoraInicialReal("");
      setHoraFinalReal("");
      setDescription("");
    } catch (error) {
      console.error("Error al guardar cambios:", error);
    }
  };

  const handleFieldEdit = (field, value) => {
    setEventoEditado((prevEventoEditado) => ({
      ...prevEventoEditado,
      [field]: value,
    }));
  };

  return (
    <section className="px-5 md:px-32">
      <div>
        <div className="p-5">
          <h1 className="mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl">
            Consulta de Eventos
          </h1>
        </div>
        <div className=" ">
          <table className=" ">
            <thead className="bg-gray-50">
              <tr>
                {usuarioLogeado === "uppermex10@gmail.com" && (
                  <th
                    scope="col"
                    className="px-0.5 py-1 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 "
                  >
                    USUARIO
                  </th>
                )}
                <th
                  scope="col"
                  className="px-0.5 py-1 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 "
                >
                  N
                </th>
                <th
                  scope="col"
                  className="px-2 py-1 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 "
                >
                  NOMBRE
                </th>
                <th
                  scope="col"
                  className="px-2 py-1 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 "
                >
                  TIPO
                </th>
                <th
                  scope="col"
                  className="px-2 py-1 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 "
                >
                  LUGAR
                </th>
                <th
                  scope="col"
                  className="px-2 py-1 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 "
                >
                  FECHA/S
                </th>
                <th
                  scope="col"
                  className="px-2 py-1 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 "
                >
                  HORA SALON
                </th>
                {/*
                <th
                  scope="col"
                  className="hidden md:block px-2 py-1 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 "
                >
                  ID DEL EVENTO
                </th>
                */}
                <th
                  scope="col"
                  className="px-0.5 py-1 md:px-6 md:py-3 text-center text-xs font-medium text-gray-500 "
                >
                  ACCIONES
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {eventos
                .slice() // Realizar una copia para no modificar el array original
                .sort((a, b) => {
                  // Buscar los usuarios correspondientes para a y b
                  const usuarioA = usuarios.find(
                    (usuario) => usuario.id === a.userId
                  );
                  const usuarioB = usuarios.find(
                    (usuario) => usuario.id === b.userId
                  );

                  // Comparar los nombres de los creadores
                  return usuarioA?.nombre.localeCompare(usuarioB?.nombre);
                })
                .map((evento, index) => {
                  // Buscar el usuario correspondiente
                  const usuario = usuarios.find(
                    (usuario) => usuario.id === evento.userId
                  );

                  console.log(`Nombre del evento: ${evento.nombreEvento}`);
                  console.log(
                    `Nombre del creador: ${
                      usuario ? `${usuario.nombre} ${usuario.apellido}` : "N/A"
                    }`
                  );

                  return (
                    <tr key={evento.id} className="text-xs md:text-base">
                      {usuarioLogeado === "uppermex10@gmail.com" && (
                        <td className="md:px-6 md:py-4 ">
                          {usuario
                            ? `${usuario.nombre} ${usuario.apellido}`
                            : "N/A"}
                        </td>
                      )}
                      {/* Contador */}
                      <td className="md:px-6 md:py-4 ">{index + 1}</td>
                      {/* Nombre */}
                      <td className="md:px-6 md:py-4 ">
                        {modoEdicion && evento.id === eventoEditado?.id ? (
                          <input
                            type="text"
                            value={eventoEditado.nombreEvento}
                            onChange={(e) =>
                              handleFieldEdit("nombreEvento", e.target.value)
                            }
                            className="w-full px-2 py-1 border rounded-lg text-center"
                          />
                        ) : eventoEditado?.id === evento.id ? (
                          eventoEditado.nombreEvento
                        ) : (
                          evento.nombreEvento
                        )}
                      </td>

                      {/* Tipo  */}
                      <td className="md:px-6 md:py-4 ">
                        {modoEdicion && evento.id === eventoEditado?.id ? (
                          <input
                            type="text"
                            value={eventoEditado.tipoEvento || ""}
                            onChange={(e) =>
                              handleFieldEdit("tipoEvento", e.target.value)
                            }
                            className="w-full px-2 py-1 border rounded-lg text-center"
                          />
                        ) : eventoEditado?.id === evento.id ? (
                          eventoEditado.tipoEvento
                        ) : (
                          evento.tipoEvento
                        )}
                      </td>
                      {/* Lugar   */}
                      <td className="md:px-6 md:py-4 ">
                        {modoEdicion && evento.id === eventoEditado?.id ? (
                          <input
                            type="text"
                            value={eventoEditado.lugar || ""}
                            onChange={(e) =>
                              handleFieldEdit("lugar", e.target.value)
                            }
                            className="w-full px-2 py-1 border rounded-lg text-center"
                          />
                        ) : eventoEditado?.id === evento.id ? (
                          eventoEditado.lugar
                        ) : (
                          evento.lugar
                        )}
                      </td>
                      {/* Fecha */}
                      <td className="md:px-6 md:py-4 ">
                        {modoEdicion &&
                        evento.id === eventoEditado?.id &&
                        edicionFechas ? (
                          <div>
                            <input
                              type="date"
                              value={eventoEditado.fechaInicio || ""}
                              onChange={(e) =>
                                handleFieldEdit("fechaInicio", e.target.value)
                              }
                              className="w-full px-2 py-1 border rounded-lg text-center"
                            />
                            <br />
                            <input
                              type="date"
                              value={eventoEditado.fechaFinal || ""}
                              onChange={(e) =>
                                handleFieldEdit("fechaFinal", e.target.value)
                              }
                              className="w-full px-2 py-1 border rounded-lg text-center"
                            />
                          </div>
                        ) : evento.id === eventoEditado?.id ? (
                          evento.fechaInicio === eventoEditado.fechaFinal ? (
                            eventoEditado.fechaInicio
                          ) : (
                            <>
                              {eventoEditado.fechaInicio}
                              <br />
                              {eventoEditado.fechaFinal}
                            </>
                          )
                        ) : evento.fechaInicio === evento.fechaFinal ? (
                          evento.fechaInicio
                        ) : (
                          <>
                            {evento.fechaInicio}
                            <br />
                            {evento.fechaFinal}
                          </>
                        )}
                      </td>
                      {/* Hora salon     */}
                      <td className="md:px-6 md:py-4">
                        {modoEdicion && evento.id === eventoEditado?.id ? (
                          <input
                            type="time"
                            value={eventoEditado.horaInicialSalon || ""}
                            onChange={(e) =>
                              handleFieldEdit(
                                "horaInicialSalon",
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 border rounded-lg"
                          />
                        ) : eventoEditado?.id === evento.id ? (
                          eventoEditado.horaInicialSalon
                        ) : (
                          evento.horaInicialSalon
                        )}
                        <br />
                        {modoEdicion && evento.id === eventoEditado?.id ? (
                          <input
                            type="time"
                            value={eventoEditado.horaFinalSalon || ""}
                            onChange={(e) =>
                              handleFieldEdit("horaFinalSalon", e.target.value)
                            }
                            className="w-full px-2 py-1 border rounded-lg"
                          />
                        ) : eventoEditado?.id === evento.id ? (
                          eventoEditado.horaFinalSalon
                        ) : (
                          evento.horaFinalSalon
                        )}
                      </td>
                      {/* Id Evento 
                    <td className="hidden md:block md:px-6 md:py-4">
                      {evento.id}
                    </td>
                    */}
                      {/* Editar */}
                      <td className="md:px-6 md:py-4">
                        {modalAbierto && (
                          <div className="fixed inset-0 flex items-center justify-center z-50">
                            <div className="fixed inset-0 z-40 bg-black opacity-25"></div>
                            <div className="bg-white p-4 md:p-8 rounded shadow-lg z-50 w-full md:w-7/12">
                              <h2 className="text-xl font-bold mb-4">
                                Editar Evento
                              </h2>
                              <div className="grid grid-cols-2 space-x-3">
                                <div>
                                  <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                      Nombre del Evento
                                    </label>
                                    <input
                                      type="text"
                                      value={eventoEditado?.nombreEvento || ""}
                                      onChange={(e) =>
                                        handleFieldEdit(
                                          "nombreEvento",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-2 py-1 border rounded-lg text-center"
                                    />
                                  </div>
                                  <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                      Tipo del Evento
                                    </label>
                                    <input
                                      type="text"
                                      value={eventoEditado?.tipoEvento || ""}
                                      onChange={(e) =>
                                        handleFieldEdit(
                                          "tipoEvento",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-2 py-1 border rounded-lg text-center"
                                    />
                                  </div>
                                  <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                      Lugar del Evento
                                    </label>
                                    <input
                                      type="text"
                                      value={eventoEditado?.lugar || ""}
                                      onChange={(e) =>
                                        handleFieldEdit("lugar", e.target.value)
                                      }
                                      className="w-full px-2 py-1 border rounded-lg text-center"
                                    />
                                  </div>
                                  <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                      Descripción del Evento (
                                      {255 -
                                        (eventoEditado.description || "")
                                          .length}
                                      )
                                    </label>
                                    <textarea
                                      value={eventoEditado?.description || ""}
                                      onChange={(e) =>
                                        handleFieldEdit(
                                          "description",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-2 py-1 border rounded-lg text-center"
                                      rows={4}
                                      maxLength={255}
                                    />
                                  </div>
                                  <div className="mb-4 ">
                                    <label className="block text-sm font-medium text-gray-700">
                                      Id del evento
                                    </label>
                                    <input
                                      value={eventoEditado?.id}
                                      className="w-full px-2 py-1 text-center"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                      Fecha de Inicio
                                    </label>
                                    <input
                                      type="date"
                                      value={eventoEditado?.fechaInicio || ""}
                                      onChange={(e) =>
                                        handleFieldEdit(
                                          "fechaInicio",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-2 py-1 border rounded-lg text-center"
                                    />
                                  </div>
                                  <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                      Fecha de Finalización
                                    </label>
                                    <input
                                      type="date"
                                      value={eventoEditado?.fechaFinal || ""}
                                      onChange={(e) =>
                                        handleFieldEdit(
                                          "fechaFinal",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-2 py-1 border rounded-lg text-center"
                                    />
                                  </div>
                                  <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                      Hora Inicial Salon
                                    </label>
                                    <input
                                      type="time"
                                      value={
                                        eventoEditado?.horaInicialSalon || ""
                                      }
                                      onChange={(e) =>
                                        handleFieldEdit(
                                          "horaInicialSalon",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-2 py-1 border rounded-lg text-center"
                                    />
                                  </div>
                                  <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                      Hora Final Salon
                                    </label>
                                    <input
                                      type="time"
                                      value={
                                        eventoEditado?.horaFinalSalon || ""
                                      }
                                      onChange={(e) =>
                                        handleFieldEdit(
                                          "horaFinalSalon",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-2 py-1 border rounded-lg text-center"
                                    />
                                  </div>
                                  <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                      Hora Inicial Real
                                    </label>
                                    <input
                                      type="time"
                                      value={horaInicialReal}
                                      onChange={(e) =>
                                        setHoraInicialReal(e.target.value)
                                      }
                                      className="w-full px-2 py-1 border rounded-lg text-center"
                                    />
                                  </div>
                                  <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                      Hora Final Real
                                    </label>
                                    <input
                                      type="time"
                                      value={horaFinalReal}
                                      onChange={(e) =>
                                        setHoraFinalReal(e.target.value)
                                      }
                                      className="w-full px-2 py-1 border rounded-lg text-center"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                  Dispositivos Seleccionados
                                </label>
                                <div className="text-center">
                                  {/* Render devices as a comma-separated list */}
                                  {
                                    evento.devices && evento.devices.length > 0
                                      ? evento.devices.join(", ")
                                      : "N/A" // Display "N/A" if no devices are available
                                  }
                                </div>
                              </div>
                              <div className="flex justify-end">
                                <button
                                  onClick={guardarCambios}
                                  className="text-white bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg mr-2"
                                >
                                  Guardar Cambios
                                </button>
                                <button
                                  onClick={cerrarModal}
                                  className="text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
                                >
                                  Cerrar
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        <button
                          onClick={() => abrirModalEdicion(evento)}
                          className="text-white bg-green-500 hover:bg-green-600 px-2 py-1 rounded-lg "
                        >
                          Ver más/Editar
                        </button>
                        <button
                          onClick={() => eliminarEvento(evento.id)}
                          className="text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded-lg"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default ConsultaModEvento;
