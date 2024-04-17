import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/storage";
const firebaseConfig = {
  apiKey: "AIzaSyAiP1248hBEZt3iS2H4UVVjdf_xbuJHD3k",
  authDomain: "upper-8c817.firebaseapp.com",
  projectId: "upper-8c817",
  storageBucket: "upper-8c817.appspot.com",
  messagingSenderId: "798455798906",
  appId: "1:798455798906:web:f58a3e51b42eebb6436fc3",
  measurementId: "G-6VHX927GH1",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const storage = firebase.storage();

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
  const [imagenesEvento, setImagenesEvento] = useState([]);
  const [pantallas, setPantallas] = useState([]);
  const [filtro, setFiltro] = useState("activos");
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [imagenesPendientesEliminar, setImagenesPendientesEliminar] = useState(
    []
  );
  const [cambiosPendientes, setCambiosPendientes] = useState(false);

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

    const unsubscribePantallas = firebase
      .firestore()
      .collection("usuarios")
      .onSnapshot((snapshot) => {
        const pantallasData = snapshot.docs.map((doc) => ({
          id: doc.id,
          nombrePantallas: doc.data().nombrePantallas || [],
          nombrePantallasDirectorio: doc.data().nombrePantallasDirectorio || [],
        }));
        setPantallas(pantallasData);
      });

    return () => {
      unsubscribeEventos();
      unsubscribeUsuarios();
      unsubscribePantallas();
    };
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        cerrarModal();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const consultarEventos = async () => {
    try {
      const user = firebase.auth().currentUser;

      let eventosRef;

      if (
        user &&
        (user.email === "uppermex10@gmail.com" ||
          user.email === "ulises.jacobo@hotmail.com" ||
          user.email === "contacto@upperds.mx")
      ) {
        eventosRef = firebase.firestore().collection("eventos");
      } else if (user) {
        eventosRef = firebase
          .firestore()
          .collection("eventos")
          .where("userId", "==", user.uid);
      }

      eventosRef.onSnapshot((snapshot) => {
        const eventosData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        eventosData.forEach(async (evento) => {
          if (evento.horaFinalSalon && evento.fechaFinal) {
            const fechaFinalEvento = new Date(
              evento.fechaFinal + "T" + evento.horaFinalSalon
            );

            const now = new Date();

            if (
              fechaFinalEvento.getTime() > now.getTime() &&
              evento.status === false
            ) {
              // Actualizar el status a true si es necesario
              await firebase
                .firestore()
                .collection("eventos")
                .doc(evento.id)
                .update({ status: true });
            } else if (
              fechaFinalEvento.getTime() <= now.getTime() &&
              evento.status !== false
            ) {
              // Actualizar el status a false si es necesario
              await firebase
                .firestore()
                .collection("eventos")
                .doc(evento.id)
                .update({ status: false });
            }
          }
        });

        const eventosFiltradosActivos = eventosData.filter((evento) => {
          if (filtro === "activos") {
            // Mostrar eventos con status true o sin status
            return evento.status || evento.status === undefined;
          } else if (filtro === "finalizados") {
            // Mostrar eventos con status false
            return evento.status === false;
          }
          return true; // Mostrar todos los eventos si no hay filtro aplicado
        });

        setEventos(eventosData);
        setEventosFiltrados(eventosFiltradosActivos);
      });
    } catch (error) {
      console.error("Error al consultar eventos:", error);
    }
  };

  const handleCheckboxChange = (device) => {
    setEventoEditado((prevEventoEditado) => {
      const devices = prevEventoEditado.devices || [];
      const index = devices.indexOf(device);

      if (index === -1) {
        // Si el dispositivo no está en la lista, agrégalo
        return { ...prevEventoEditado, devices: [...devices, device] };
      } else {
        // Si el dispositivo está en la lista, quítalo
        const newDevices = [...devices];
        newDevices.splice(index, 1);
        return { ...prevEventoEditado, devices: newDevices };
      }
    });
  };

  const eliminarEvento = async (id) => {
    try {
      const confirmacion = window.confirm(
        "¿Estás seguro que quieres eliminar este evento?"
      );

      if (confirmacion) {
        // Fetch the event data
        const evento = await firebase
          .firestore()
          .collection("eventos")
          .doc(id)
          .get();

        // Check if the event has images
        const imagenesEvento = evento.data().images || [];

        // Delete the event
        await firebase.firestore().collection("eventos").doc(id).delete();

        // Delete the associated images
        if (imagenesEvento.length > 0) {
          imagenesEvento.forEach(async (imagen) => {
            const imagenRef = storage.refFromURL(imagen);
            await imagenRef.delete();
          });
        }
      }
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
    setImagenesEvento(evento.images || []);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEventoEditado(null);
    setHoraInicialReal("");
    setHoraFinalReal("");
    setDescription("");
    setImagenesPendientesEliminar([]); // Limpiar la lista de imágenes eliminadas
    setCambiosPendientes(false);
  };

  const guardarCambios = async () => {
    try {
      // Eliminar imágenes pendientes del almacenamiento
      if (cambiosPendientes) {
        if (imagenesPendientesEliminar.length > 0) {
          await Promise.all(
            imagenesPendientesEliminar.map(async (imagen) => {
              const imagenRef = storage.refFromURL(imagen);

              try {
                // Verificar si la imagen existe antes de intentar eliminarla
                await imagenRef.getMetadata();

                // Si la imagen existe, entonces eliminarla
                await imagenRef.delete();
              } catch (error) {
                // Manejar el error si la imagen no existe
                console.warn(`La imagen no existe: ${imagen}`);
              }
            })
          );
        }
      }

      // Guardar cambios en el evento
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
          description: eventoEditado.description,
          images: imagenesEvento,
          devices: eventoEditado.devices || [],
        });

      // Cerrar el modal y restablecer estados
      setModalAbierto(false);
      setEventoEditado(null);
      setHoraInicialReal("");
      setHoraFinalReal("");
      setDescription("");
      setImagenesPendientesEliminar([]); // Limpiar la lista de imágenes eliminadas
      setCambiosPendientes(false);
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

  const handleImagenChange = async (e) => {
    const nuevaImagen = e.target.files[0];

    if (nuevaImagen) {
      const randomString = Math.random().toString(36).substring(7);
      const uniqueName = `${randomString}_${nuevaImagen.name}`;

      const storageRef = storage.ref(`imagenes/${uniqueName}`);

      try {
        const snapshot = await storageRef.put(nuevaImagen);
        const url = await snapshot.ref.getDownloadURL();
        setImagenesEvento([...imagenesEvento, url]);
      } catch (error) {
        console.error("Error al subir imagen:", error);
      }
    }
  };

  const eliminarImagen = (index) => {
    const nuevasImagenes = [...imagenesEvento];
    const imagenToDelete = nuevasImagenes[index];

    if (nuevasImagenes.length > 1) {
      nuevasImagenes.splice(index, 1);

      setImagenesPendientesEliminar((prev) => [...prev, imagenToDelete]);
      setImagenesEvento(nuevasImagenes);
      setCambiosPendientes(true); // Indica que hay cambios pendientes
    } else {
      alert("Debe haber al menos una imagen asociada al evento.");
    }
  };

  return (
    <section className="pl-14 md:px-20">
      <div>
        <div className="p-5">
          <h1 className="mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl">
            Consulta de Eventos
          </h1>
        </div>
        <div className="mb-4">
          <button
            onClick={() => setFiltro("activos")}
            className={`${
              filtro === "activos" ? "bg-blue-500" : "bg-gray-300"
            } text-white px-4 py-2 rounded mr-2`}
          >
            Eventos Activos
          </button>
          <button
            onClick={() => setFiltro("finalizados")}
            className={`${
              filtro === "finalizados" ? "bg-red-500" : "bg-gray-300"
            } text-white px-4 py-2 rounded`}
          >
            Eventos Finalizados
          </button>
        </div>
        <div className=" ">
          <table className=" ">
            <thead className="bg-gray-50">
              <tr>
                {(usuarioLogeado === "uppermex10@gmail.com" ||
                  usuarioLogeado === "ulises.jacobo@hotmail.com" ||
                  usuarioLogeado === "contacto@upperds.mx") && (
                  <th
                    scope="col"
                    className="px-0.5 py-1 md:px-3 md:py-3 text-left text-xs font-medium text-gray-500 "
                  >
                    USUARIO
                  </th>
                )}
                <th
                  scope="col"
                  className="px-0.5 py-1 md:px-3 md:py-3 text-left text-xs font-medium text-gray-500 "
                >
                  N
                </th>
                <th
                  scope="col"
                  className="px-2 py-1 md:px-3 md:py-3 text-left text-xs font-medium text-gray-500 "
                >
                  NOMBRE
                </th>
                <th
                  scope="col"
                  className="px-2 py-1 md:px-3 md:py-3 text-left text-xs font-medium text-gray-500 "
                >
                  TIPO
                </th>
                <th
                  scope="col"
                  className="px-2 py-1 md:px-3 md:py-3 text-left text-xs font-medium text-gray-500 "
                >
                  NOMBRE DE SALON
                </th>
                <th
                  scope="col"
                  className="px-2 py-1 md:px-3 md:py-3 text-left text-xs font-medium text-gray-500 "
                >
                  FECHA/S
                </th>
                <th
                  scope="col"
                  className="px-2 py-1 md:px-3 md:py-3 text-left text-xs font-medium text-gray-500 "
                >
                  HORA SALON
                </th>

                <th
                  scope="col"
                  className="px-0.5 py-1 md:px-3 md:py-3 text-center text-xs font-medium text-gray-500 "
                >
                  ACCIONES
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {eventos
                .filter((evento) => {
                  if (filtro === "activos") {
                    return evento.status === true;
                  } else if (filtro === "finalizados") {
                    return evento.status === false;
                  }
                  return true;
                })
                .slice()
                .sort((a, b) => {
                  const usuarioA = usuarios.find(
                    (usuario) => usuario.id === a.userId
                  );
                  const usuarioB = usuarios.find(
                    (usuario) => usuario.id === b.userId
                  );
                  const ordenPorUsuario = usuarioA?.nombre.localeCompare(
                    usuarioB?.nombre
                  );

                  if (ordenPorUsuario === 0) {
                    // Si los usuarios son iguales, ordena por fecha y hora final del salón
                    const fechaHoraFinalA = new Date(
                      `${a.fechaFinal}T${a.horaFinalSalon}`
                    );
                    const fechaHoraFinalB = new Date(
                      `${b.fechaFinal}T${b.horaFinalSalon}`
                    );
                    return fechaHoraFinalA - fechaHoraFinalB;
                  }

                  return ordenPorUsuario;
                })

                .map((evento, index) => {
                  const usuario = usuarios.find(
                    (usuario) => usuario.id === evento.userId
                  );

                  return (
                    <tr key={evento.id} className="text-xs md:text-base">
                      {(usuarioLogeado === "uppermex10@gmail.com" ||
                        usuarioLogeado === "ulises.jacobo@hotmail.com" ||
                        usuarioLogeado === "contacto@upperds.mx") && (
                        <td className="md:px-2 md:py-4 ">
                          {usuario
                            ? `${usuario.nombre} ${usuario.apellido}`
                            : "N/A"}
                        </td>
                      )}
                      {/* Contador */}
                      <td className="md:px-2 md:py-4 ">{index + 1}</td>
                      {/* Nombre */}
                      <td className="md:px-2 md:py-4 ">
                        {modoEdicion && evento.id === eventoEditado?.id ? (
                          <input
                            type="text"
                            value={eventoEditado.nombreEvento}
                            onChange={(e) =>
                              handleFieldEdit("nombreEvento", e.target.value)
                            }
                            className="w-full px-2 py-1 border rounded-lg text-center"
                          />
                        ) : (
                          <span>
                            {eventoEditado?.id === evento.id
                              ? eventoEditado.nombreEvento.length > 15
                                ? eventoEditado.nombreEvento.substring(0, 15) +
                                  "..."
                                : eventoEditado.nombreEvento
                              : evento.nombreEvento.length > 15
                              ? evento.nombreEvento.substring(0, 15) + "..."
                              : evento.nombreEvento}
                          </span>
                        )}
                      </td>
                      {/* Tipo  */}
                      <td className="md:px-2 md:py-4 ">
                        {modoEdicion && evento.id === eventoEditado?.id ? (
                          <input
                            type="text"
                            value={eventoEditado.tipoEvento || ""}
                            onChange={(e) =>
                              handleFieldEdit("tipoEvento", e.target.value)
                            }
                            className="w-full px-2 py-1 border rounded-lg text-center"
                          />
                        ) : (
                          <span>
                            {eventoEditado?.id === evento.id
                              ? eventoEditado.tipoEvento &&
                                eventoEditado.tipoEvento.length > 15
                                ? eventoEditado.tipoEvento.substring(0, 15) +
                                  "..."
                                : eventoEditado.tipoEvento || ""
                              : evento.tipoEvento &&
                                evento.tipoEvento.length > 15
                              ? evento.tipoEvento.substring(0, 15) + "..."
                              : evento.tipoEvento || ""}
                          </span>
                        )}
                      </td>
                      {/* Nombre de salon   */}
                      <td className="md:px-2 md:py-4 ">
                        {modoEdicion && evento.id === eventoEditado?.id ? (
                          <input
                            type="text"
                            value={eventoEditado.devices || ""}
                            onChange={(e) =>
                              handleFieldEdit("devices", e.target.value)
                            }
                            className="w-full px-2 py-1 border rounded-lg text-center"
                          />
                        ) : eventoEditado?.id === evento.id ? (
                          eventoEditado.devices
                        ) : (
                          // Devices names o "Sin pantallas" si no hay ninguna disponible
                          <>
                            {evento.devices.length === 0 ? (
                              "sin Pantallas"
                            ) : (
                              <>
                                {" "}
                                {evento.devices.map((device, key) => {
                                  return <div key={key}>{`* ${device}`}</div>;
                                })}{" "}
                              </>
                            )}
                          </>
                        )}
                      </td>
                      {/* Fecha */}
                      <td className="md:px-2 md:py-4 ">
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
                      <td className="md:px-2 md:py-4">
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

                      {/* Editar */}
                      <td className="md:px-2 md:py-4">
                        {modalAbierto && (
                          <div className="fixed inset-0 flex items-center justify-center z-50">
                            <div className="fixed inset-0 z-40 bg-black opacity-25"></div>
                            <div className="bg-white p-1 md:p-4 rounded shadow-lg z-50 w-full max-w-screen-md overflow-y-auto">
                              <h2 className="text-xl font-bold mb-4">
                                Editar Evento
                              </h2>
                              <div className="grid grid-cols-2 space-x-3">
                                <div>
                                  <div className="mb-2">
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
                                  <div className="mb-2">
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
                                  <div className="mb-2">
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
                                  <div className="mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                      Descripción del Evento (
                                      {255 -
                                        (eventoEditado.description || "")
                                          .length}
                                      )
                                    </label>
                                    <textarea
                                      value={eventoEditado?.description || ""}
                                      onChange={(e) => {
                                        handleFieldEdit(
                                          "description",
                                          e.target.value
                                        );
                                        setDescription(e.target.value); // Agrega esta línea
                                      }}
                                      className="w-full px-2 py-1 border rounded-lg text-center"
                                      rows={4}
                                      maxLength={255}
                                    />
                                  </div>
                                </div>

                                <div>
                                  <div className="mb-2 flex space-x-3">
                                    <div className="w-1/2">
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
                                    <div className="w-1/2">
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
                                  </div>
                                  <p className="md:text-sm">
                                    Horario en que se tiene programado el evento
                                  </p>
                                  {/* Horas Real */}
                                  <div className="mb-2 flex space-x-3">
                                    <div className="w-1/2">
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
                                    <div className="w-1/2">
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
                                  {/* Horas Salon */}{" "}
                                  <p className="md:text-sm">
                                    Horario en que se mostrara la información
                                    del evento en pantallas
                                  </p>
                                  <div className="mb-2 flex space-x-3">
                                    <div className="w-1/2">
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
                                    <div className="w-1/2">
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
                                  </div>
                                  <div className="mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                      Imágenes del Evento (Máximo 3)
                                    </label>
                                    <div className="flex items-center">
                                      {imagenesEvento.map((imagen, index) => (
                                        <div key={index} className="mr-2">
                                          <img
                                            src={imagen}
                                            alt={`Imagen ${index + 1}`}
                                            className="w-16 h-16 object-cover rounded-lg"
                                          />
                                          <button
                                            onClick={() =>
                                              eliminarImagen(index)
                                            }
                                            className="text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded-lg mt-2"
                                          >
                                            Eliminar
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                    {imagenesEvento.length < 3 && (
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImagenChange}
                                        className="mt-2"
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  Dispositivos Seleccionados
                                </label>
                                <div className="flex flex-wrap justify-start items-start">
                                  {pantallas
                                    .filter(
                                      (usuario) =>
                                        eventoEditado?.userId === usuario.id
                                    )
                                    .map((usuario) => {
                                      const nombrePantallas =
                                        Array.isArray(
                                          usuario.nombrePantallas
                                        ) && usuario.nombrePantallas.length
                                          ? usuario.nombrePantallas
                                          : typeof usuario.nombrePantallas ===
                                            "object"
                                          ? Object.values(
                                              usuario.nombrePantallas
                                            )
                                          : ["N/A"];

                                      const nombrePantallasDirectorio =
                                        Array.isArray(
                                          usuario.nombrePantallasDirectorio
                                        ) &&
                                        usuario.nombrePantallasDirectorio.length
                                          ? usuario.nombrePantallasDirectorio
                                          : typeof usuario.nombrePantallasDirectorio ===
                                            "object"
                                          ? Object.values(
                                              usuario.nombrePantallasDirectorio
                                            )
                                          : ["N/A"];

                                      return (
                                        <>
                                          {nombrePantallas.map((pantalla) => (
                                            <div
                                              key={`pantalla-${pantalla}`}
                                              className="flex items-center mb-2 mr-4"
                                            >
                                              <input
                                                type="checkbox"
                                                id={`checkbox-${pantalla}`}
                                                value={pantalla}
                                                checked={eventoEditado?.devices.includes(
                                                  pantalla
                                                )}
                                                onChange={() =>
                                                  handleCheckboxChange(pantalla)
                                                }
                                                className="mr-2"
                                              />
                                              <label
                                                htmlFor={`checkbox-${pantalla}`}
                                              >
                                                {pantalla}
                                              </label>
                                            </div>
                                          ))}
                                          {nombrePantallasDirectorio.map(
                                            (pantallaDir) => (
                                              <div
                                                key={`pantallaDir-${pantallaDir}`}
                                                className="flex items-center mb-2 mr-4"
                                              >
                                                <input
                                                  type="checkbox"
                                                  id={`checkbox-${pantallaDir}`}
                                                  value={pantallaDir}
                                                  checked={eventoEditado?.devices.includes(
                                                    pantallaDir
                                                  )}
                                                  onChange={() =>
                                                    handleCheckboxChange(
                                                      pantallaDir
                                                    )
                                                  }
                                                  className="mr-2"
                                                />
                                                <label
                                                  htmlFor={`checkbox-${pantallaDir}`}
                                                >
                                                  {pantallaDir}
                                                </label>
                                              </div>
                                            )
                                          )}
                                        </>
                                      );
                                    })}
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
