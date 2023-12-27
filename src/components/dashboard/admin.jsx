import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  updateData,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

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
const auth = getAuth(app);

function Admin() {
  const [usuarios, setUsuarios] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [filtroSeleccionado, setFiltroSeleccionado] = useState("todos");
  const [modoEdiciontransaccion, setModoEdiciontransaccion] = useState(false);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
  const [selectedEmpresa, setSelectedEmpresa] = useState("");
  const [datosFiscalesConNombre, setDatosFiscalesConNombre] = useState([]);

  const [datosFiscalesEditados, setDatosFiscalesEditados] = useState({
    id: "",
    usoCdfi: "",
    email: "",
    razonSocial: "",
    regimenFiscal: "",
    rfc: "",
    // Agrega otros campos según tu estructura de datos
  });

  const [usuarioEditado, setUsuarioEditado] = useState({
    id: "",
    nombre: "",
    apellido: "",
    email: "", // Inicializa con un valor vacío o el correo actual del usuario
    telefono: "",
    ps: "",
    pd: "",
    total: "",
    tipoPlan: "",
    empresa: "",
    inicio: "",
    final: "",
  });
  const [nuevaTransaccion, setNuevaTransaccion] = useState({
    nombre: "",
    fecha: "",
    monto: "",
    ps: "", // Cambiado de "plan" a "ps"
    pd: "", // Nuevo campo "pd"
    total: "", // Nuevo campo "numero"
    tipoPlan: "",
  });

  const [transaccionEditada, setTransaccionEditada] = useState({
    id: "",
    nombre: "",
    fecha: "",
    monto: "",
    ps: "", // Cambiado de "plan" a "ps"
    pd: "", // Nuevo campo "pd"
    total: "", // Nuevo campo "numero"
  });
  const [transacciones, setTransacciones] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const obtenerDatosFiscales = async () => {
      try {
        const datosFiscalesCollection = collection(db, "DatosFiscales");
        const datosFiscalesSnapshot = await getDocs(datosFiscalesCollection);
        const datosFiscalesData = datosFiscalesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch data from usuarios
        const usuariosCollection = collection(db, "usuarios");
        const usuariosSnapshot = await getDocs(usuariosCollection);
        const usuariosData = usuariosSnapshot.docs.reduce((acc, doc) => {
          const userData = doc.data();
          acc[doc.id] = userData.empresa; // Use doc.id as the key instead of userData.userId
          return acc;
        }, {});

        // Combine data from DatosFiscales and usuarios, including companies without datos fiscales
        const datosFiscalesConNombreData = usuariosSnapshot.docs.map((doc) => {
          const userId = doc.id;
          const datosFiscales =
            datosFiscalesData.find((datos) => datos.userId === userId) || {};
          return {
            ...datosFiscales,
            userId,
            nombreEmpresa: usuariosData[userId],
          };
        });

        // Update the state variable and set loading to false
        setDatosFiscalesConNombre(datosFiscalesConNombreData);

        console.log(
          "Nombres de Empresas:",
          datosFiscalesConNombreData.map((empresa) => empresa.nombreEmpresa)
        );
      } catch (error) {
        console.error(
          "Error al obtener los datos fiscales de Firebase:",
          error
        );
      }
    };

    obtenerDatosFiscales();
  }, []);

  const handleEditarDatosFiscales = (datosFiscales) => {
    setDatosFiscalesEditados({
      id: datosFiscales.id,
      usoCdfi: datosFiscales.usoCdfi,
      email: datosFiscales.email,
      razonSocial: datosFiscales.razonSocial,
      regimenFiscal: datosFiscales.regimenFiscal,
      rfc: datosFiscales.rfc,
      // Agrega otros campos según tu estructura de datos
    });
    // Puedes añadir más lógica aquí según tus necesidades
  };

  const handleGuardarCambiosDatosFiscales = async () => {
    try {
      const datosFiscalesDocRef = doc(
        db,
        "DatosFiscales",
        datosFiscalesEditados.id
      );

      await updateDoc(datosFiscalesDocRef, {
        usoCdfi: datosFiscalesEditados.usoCdfi,
        email: datosFiscalesEditados.email,
        razonSocial: datosFiscalesEditados.razonSocial,
        regimenFiscal: datosFiscalesEditados.regimenFiscal,
        rfc: datosFiscalesEditados.rfc,
        // Actualiza otros campos según tu estructura de datos
      });

      // Actualiza la lista de datos fiscales
      const nuevosDatosFiscales = datosFiscalesConNombre.map((datos) =>
        datos.id === datosFiscalesEditados.id
          ? { ...datos, ...datosFiscalesEditados }
          : datos
      );

      setDatosFiscalesConNombre(nuevosDatosFiscales);
      setDatosFiscalesEditados({
        id: "",
        usoCdfi: "",
        email: "",
        razonSocial: "",
        regimenFiscal: "",
        rfc: "",

        // Restablece otros campos según tu estructura de datos
      });
    } catch (error) {
      console.error("Error al guardar los cambios en datos fiscales:", error);
    }
  };

  const handleEliminarDatosFiscales = async (datosFiscalesId) => {
    // Mostrar una alerta de confirmación
    const confirmacion = window.confirm(
      "¿Estás seguro de que deseas eliminar estos datos fiscales?"
    );

    if (confirmacion) {
      try {
        const datosFiscalesDocRef = doc(db, "DatosFiscales", datosFiscalesId);
        await deleteDoc(datosFiscalesDocRef);

        // Filtra los datos fiscales eliminados de la lista
        const nuevosDatosFiscales = datosFiscalesConNombre.map((datos) =>
          datos.id === datosFiscalesId
            ? {
                ...datos,
                ...{
                  codigoPostal: "",
                  usoCdfi: "",
                  email: "",
                  razonSocial: "",
                  regimenFiscal: "",
                  rfc: "",
                },
              }
            : datos
        );

        setDatosFiscalesConNombre(nuevosDatosFiscales);

        // No restablezcas el valor seleccionado en el select para mantenerlo
        // setSelectedEmpresa("");
      } catch (error) {
        console.error("Error al eliminar datos fiscales:", error);
      }
    }
  };

  const handleGuardarTransaccion = async () => {
    try {
      if (
        !nuevaTransaccion.nombre ||
        !nuevaTransaccion.fecha ||
        !nuevaTransaccion.monto ||
        !nuevaTransaccion.ps || // Cambiado de "plan" a "ps"
        !nuevaTransaccion.pd ||
        !nuevaTransaccion.total
      ) {
        alert("Por favor, completa todos los campos de la transacción.");
        return;
      }

      const transaccionRef = await addDoc(
        collection(db, "transacciones"),
        nuevaTransaccion
      );

      setTransacciones([
        ...transacciones,
        { id: transaccionRef.id, ...nuevaTransaccion },
      ]);

      setNuevaTransaccion({
        nombre: "",
        fecha: "",
        monto: "",
        ps: "", // Cambiado de "plan" a "ps"
        pd: "",
        total: "",
      });
    } catch (error) {
      console.error("Error al guardar la transacción en Firebase:", error);
    }
  };

  const handleEditarTransaccion = (transaccion) => {
    setModoEdiciontransaccion(true);
    setTransaccionEditada({ ...transaccion });
  };

  const handleGuardarCambiosTransaccion = async () => {
    try {
      const { id, ...restoTransaccion } = transaccionEditada;
      await updateDoc(doc(db, "transacciones", id), restoTransaccion);
      setTransacciones((prevTransacciones) =>
        prevTransacciones.map((transaccion) =>
          transaccion.id === id ? { id, ...restoTransaccion } : transaccion
        )
      );
      setModoEdiciontransaccion(false);
      setTransaccionEditada({
        id: "",
        nombre: "",
        fecha: "",
        monto: "",
        plan: "",
      });
    } catch (error) {
      console.error("Error al guardar los cambios en Firebase:", error);
    }
  };

  const handleEliminarTransaccion = async (transaccionId) => {
    try {
      await deleteDoc(doc(db, "transacciones", transaccionId));
      setTransacciones((prevTransacciones) =>
        prevTransacciones.filter(
          (transaccion) => transaccion.id !== transaccionId
        )
      );
    } catch (error) {
      console.error("Error al eliminar la transacción de Firebase:", error);
    }
  };

  const handleEditar = (usuario) => {
    setModoEdicion(true);
    setUsuarioEditado(usuario);
  };

  const handleGuardarCambios = async () => {
    try {
      const usuarioDocRef = doc(db, "usuarios", usuarioEditado.id);

      const psNumber = parseInt(usuarioEditado.ps || 0);
      const pdNumber = parseInt(usuarioEditado.pd || 0);

      const updateData = {
        nombre: usuarioEditado.nombre,
        apellido: usuarioEditado.apellido,
        telefono: usuarioEditado.telefono,
        ps: isNaN(psNumber) ? undefined : psNumber,
        pd: isNaN(pdNumber) ? undefined : pdNumber,
        total:
          isNaN(psNumber) || isNaN(pdNumber) ? undefined : psNumber + pdNumber,
        tipoPlan: usuarioEditado.tipoPlan,
        empresa: usuarioEditado.empresa,
        inicio: usuarioEditado.inicio,
        final: usuarioEditado.final,
        // Agrega otros campos opcionales aquí...
      };

      const validUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      );

      if (Object.keys(validUpdateData).length > 0) {
        await updateDoc(usuarioDocRef, validUpdateData);

        setUsuarios((prevUsuarios) =>
          prevUsuarios.map((usuario) =>
            usuario.id === usuarioEditado.id
              ? {
                  ...usuario,
                  ...validUpdateData,
                }
              : usuario
          )
        );

        setModoEdicion(false);
        setUsuarioEditado({
          id: "",
          nombre: "",
          apellido: "",
          telefono: "",
          ps: "",
          pd: "",
          total: "",
          tipoPlan: "",
          empresa: "",
          inicio: "",
          final: "",
        });
      } else {
        console.warn("No hay campos válidos para actualizar.");
      }
    } catch (error) {
      console.error("Error al guardar los cambios en Firebase:", error);
    }
  };

  const handleEliminarUsuario = async (usuarioId) => {
    try {
      await deleteDoc(doc(db, "usuarios", usuarioId));
      setUsuarios((prevUsuarios) =>
        prevUsuarios.filter((usuario) => usuario.id !== usuarioId)
      );
    } catch (error) {
      console.error("Error al eliminar el usuario de Firebase:", error);
    }
  };
  useEffect(() => {
    const obtenerUsuarios = async () => {
      try {
        const usuariosCollection = collection(db, "usuarios");
        const usuariosSnapshot = await getDocs(usuariosCollection);
        const usuariosData = usuariosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsuarios(usuariosData);
      } catch (error) {
        console.error("Error al obtener los usuarios de Firebase:", error);
      }
    };

    obtenerUsuarios();
  }, []);
  if (currentUser && currentUser.email !== "uppermex10@gmail.com") {
    return <p>No tienes permiso para acceder a esta página.</p>;
  }

  const aplicarFiltro = () => {
    if (filtroSeleccionado === "conNumero") {
      return usuarios.filter(
        (usuario) => usuario.ps !== "" && usuario.ps !== 0
      );
    } else if (filtroSeleccionado === "sinNumero") {
      return usuarios.filter(
        (usuario) =>
          (usuario.ps === "" || usuario.ps === 0) &&
          (usuario.pd === "" || usuario.pd === 0) &&
          (usuario.total === "" || usuario.total === 0)
      );
    } else {
      return usuarios;
    }
  };

  return (
    <div class="flex flex-col  bg-gray-100">
      <div class="flex-1 flex flex-wrap">
        <div class="flex-1 p-4 ">
          <div class="relative max-w-xs w-full">
            <div class="absolute top-1 left-2 inline-flex items-center p-2">
              <i class="fas fa-search text-gray-400"></i>
            </div>
          </div>
          <div class="mt-8 bg-white p-4 shadow rounded-lg">
            <h2 class="text-gray-500 text-lg font-semibold pb-4">
              Datos de Usuarios
            </h2>
            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => setFiltroSeleccionado("todos")}
                className={`${
                  filtroSeleccionado === "todos" ? "bg-blue-500" : "bg-gray-300"
                } text-white font-semibold py-2 px-4 rounded`}
              >
                Todos
              </button>
              <button
                onClick={() => setFiltroSeleccionado("conNumero")}
                className={`${
                  filtroSeleccionado === "conNumero"
                    ? "bg-blue-500"
                    : "bg-gray-300"
                } text-white font-semibold py-2 px-4 rounded`}
              >
                Licencias
              </button>
              <button
                onClick={() => setFiltroSeleccionado("sinNumero")}
                className={`${
                  filtroSeleccionado === "sinNumero"
                    ? "bg-blue-500"
                    : "bg-gray-300"
                } text-white font-semibold py-2 px-4 rounded`}
              >
                Sin Licencias
              </button>
            </div>

            <div class="my-1"></div>
            <div class="bg-gradient-to-r from-cyan-300 to-cyan-500 h-px mb-6"></div>
            <table class="w-full table-auto text-sm">
              <thead>
                <tr class="text-sm leading-normal">
                  <th className="bg-grey-lightest font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left">
                    Nombre y Apellido
                  </th>
                  <th className="bg-grey-lightest font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left">
                    Email
                  </th>
                  <th className="py-2 px-0 bg-grey-lightest font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left">
                    Empresa
                  </th>
                  <th className="py-2 px-0 bg-grey-lightest font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left">
                    Teléfono
                  </th>

                  <th className="bg-grey-lightest font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left">
                    PS
                  </th>
                  <th className="bg-grey-lightest font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left">
                    PD
                  </th>
                  <th className="bg-grey-lightest font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left">
                    T
                  </th>
                  <th className="py-2 px-4 bg-grey-lightest font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left">
                    Inicio
                  </th>
                  <th className="py-2 px-4 bg-grey-lightest font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left">
                    Final
                  </th>
                  <th className="py-2 px-4 bg-grey-lightest font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left">
                    Tipo de Plan
                  </th>
                  <th className="py-2 px-4 bg-grey-lightest font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {aplicarFiltro().map((usuario) => (
                  <tr className="hover:bg-grey-lighter" key={usuario.id}>
                    <td className="border-b border-grey-light">
                      {modoEdicion && usuarioEditado.id === usuario.id ? (
                        <input
                          type="text"
                          value={`${usuarioEditado.nombre} ${usuarioEditado.apellido}`}
                          onChange={(e) => {
                            const [nombre, apellido] =
                              e.target.value.split(" ");
                            setUsuarioEditado({
                              ...usuarioEditado,
                              nombre: nombre,
                              apellido: apellido,
                            });
                          }}
                        />
                      ) : (
                        `${usuario.nombre} ${usuario.apellido}`
                      )}
                    </td>
                    <td className="border-b border-grey-light">
                      {modoEdicion && usuarioEditado.id === usuario.id ? (
                        <input
                          type="text"
                          value={usuarioEditado.email}
                          onChange={(e) =>
                            setUsuarioEditado({
                              ...usuarioEditado,
                              email: e.target.value,
                            })
                          }
                          readOnly // Agrega la propiedad readOnly
                        />
                      ) : (
                        <div>{usuario.email}</div>
                      )}
                    </td>
                    <td className="py-2 px-0 border-b border-grey-light">
                      {modoEdicion && usuarioEditado.id === usuario.id ? (
                        <input
                          type="text"
                          value={usuarioEditado.empresa}
                          onChange={(e) =>
                            setUsuarioEditado({
                              ...usuarioEditado,
                              empresa: e.target.value,
                            })
                          }
                        />
                      ) : (
                        usuario.empresa
                      )}
                    </td>
                    <td className="py-2 px-0 border-b border-grey-light">
                      {modoEdicion && usuarioEditado.id === usuario.id ? (
                        <input
                          type="text"
                          value={usuarioEditado.telefono}
                          onChange={(e) =>
                            setUsuarioEditado({
                              ...usuarioEditado,
                              telefono: e.target.value,
                            })
                          }
                        />
                      ) : (
                        usuario.telefono
                      )}
                    </td>
                    <td className="border-b border-grey-light">
                      {modoEdicion && usuarioEditado.id === usuario.id ? (
                        <input
                          type="text"
                          value={usuarioEditado.ps}
                          onChange={(e) =>
                            setUsuarioEditado({
                              ...usuarioEditado,
                              ps: e.target.value,
                              total:
                                parseInt(e.target.value) +
                                parseInt(usuarioEditado.pd),
                            })
                          }
                        />
                      ) : (
                        usuario.ps
                      )}
                    </td>

                    <td className="border-b border-grey-light">
                      {modoEdicion && usuarioEditado.id === usuario.id ? (
                        <input
                          type="text"
                          value={usuarioEditado.pd}
                          onChange={(e) =>
                            setUsuarioEditado({
                              ...usuarioEditado,
                              pd: e.target.value,
                              total:
                                parseInt(usuarioEditado.ps) +
                                parseInt(e.target.value),
                            })
                          }
                        />
                      ) : (
                        usuario.pd
                      )}
                    </td>
                    <td className="border-b border-grey-light">
                      {modoEdicion && usuarioEditado.id === usuario.id ? (
                        <input
                          type="text"
                          value={usuarioEditado.total}
                          onChange={(e) =>
                            setUsuarioEditado({
                              ...usuarioEditado,
                              total: e.target.value,
                            })
                          }
                        />
                      ) : (
                        usuario.total
                      )}
                    </td>
                    <td className="py-2 px-4 border-b border-grey-light">
                      {modoEdicion && usuarioEditado.id === usuario.id ? (
                        <input
                          type="text"
                          value={usuarioEditado.inicio}
                          onChange={(e) =>
                            setUsuarioEditado({
                              ...usuarioEditado,
                              inicio: e.target.value,
                            })
                          }
                        />
                      ) : (
                        usuario.inicio
                      )}
                    </td>
                    <td className="py-2 px-4 border-b border-grey-light">
                      {modoEdicion && usuarioEditado.id === usuario.id ? (
                        <input
                          type="text"
                          value={usuarioEditado.final}
                          onChange={(e) =>
                            setUsuarioEditado({
                              ...usuarioEditado,
                              final: e.target.value,
                            })
                          }
                        />
                      ) : (
                        usuario.final
                      )}
                    </td>
                    <td className="py-2 px-4 border-b border-grey-light">
                      {modoEdicion && usuarioEditado.id === usuario.id ? (
                        <input
                          type="text"
                          value={usuarioEditado.tipoPlan}
                          onChange={(e) =>
                            setUsuarioEditado({
                              ...usuarioEditado,
                              tipoPlan: e.target.value,
                            })
                          }
                        />
                      ) : (
                        usuario.tipoPlan
                      )}
                    </td>

                    <td className="py-2 px-4 border-b border-grey-light">
                      {modoEdicion && usuarioEditado.id === usuario.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={handleGuardarCambios}
                            className="bg-green-500 hover:bg-green-700 text-white font-semibold py-1 px-2 rounded"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setModoEdicion(false)}
                            className="bg-gray-500 hover:bg-gray-700 text-white font-semibold py-1 px-2 rounded"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditar(usuario)}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-1 px-2 rounded"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleEliminarUsuario(usuario.id)}
                            className="bg-red-500 hover:bg-red-700 text-white font-semibold py-1 px-2 rounded"
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8 bg-white p-4 shadow rounded-lg">
            <div className="bg-white p-4 rounded-md mt-4">
              <h2 className="text-gray-500 text-lg font-semibold pb-4">
                Transacciones
              </h2>
              <div className="mb-6 border-b border-gray-300"></div>
              <div className="flex items-center mb-4 space-x-2">
                <input
                  className="p-2 rounded border border-gray-300 w-40"
                  type="text"
                  value={nuevaTransaccion.nombre}
                  onChange={(e) =>
                    setNuevaTransaccion({
                      ...nuevaTransaccion,
                      nombre: e.target.value,
                    })
                  }
                  placeholder="Nombre y Apellido"
                />
                <input
                  className="p-2 rounded border border-gray-300 w-40"
                  type="text"
                  value={nuevaTransaccion.fecha}
                  onChange={(e) =>
                    setNuevaTransaccion({
                      ...nuevaTransaccion,
                      fecha: e.target.value,
                    })
                  }
                  placeholder="Fecha"
                />
                <input
                  className="p-2 rounded border border-gray-300 w-25"
                  type="text"
                  value={nuevaTransaccion.monto}
                  onChange={(e) =>
                    setNuevaTransaccion({
                      ...nuevaTransaccion,
                      monto: e.target.value,
                    })
                  }
                  placeholder="Monto"
                />
                <input
                  className="p-2 rounded border border-gray-300 w-10"
                  type="text"
                  value={nuevaTransaccion.ps}
                  onChange={(e) =>
                    setNuevaTransaccion({
                      ...nuevaTransaccion,
                      ps: e.target.value,
                    })
                  }
                  placeholder="PS"
                />
                <input
                  className="p-2 rounded border border-gray-300 w-10"
                  type="text"
                  value={nuevaTransaccion.pd}
                  onChange={(e) =>
                    setNuevaTransaccion({
                      ...nuevaTransaccion,
                      pd: e.target.value,
                    })
                  }
                  placeholder="PD"
                />
                <input
                  className="p-2 rounded border border-gray-300 w-20"
                  type="text"
                  value={nuevaTransaccion.total}
                  onChange={(e) =>
                    setNuevaTransaccion({
                      ...nuevaTransaccion,
                      total: e.target.value,
                    })
                  }
                  placeholder="Total"
                />
                <button
                  onClick={handleGuardarTransaccion}
                  className="bg-green-500 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
                >
                  Guardar
                </button>
              </div>
              <table className="w-full table-auto text-sm">
                <thead>
                  <tr className="text-sm leading-normal">
                    <th className="py-2 px-4 bg-grey-lightest font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left">
                      Nombre y Apellido
                    </th>
                    <th className="py-2 px-4 bg-grey-lightest font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left">
                      Fecha
                    </th>
                    <th className="py-2 px-4 bg-grey-lightest font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left">
                      Monto
                    </th>
                    <th className="bg-grey-lightest font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left">
                      PS
                    </th>
                    <th className="bg-grey-lightest font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left">
                      PD
                    </th>
                    <th className="bg-grey-lightest font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left">
                      T
                    </th>
                    <th className="py-2 px-4 bg-grey-lightest font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transacciones.map((transaccion) => (
                    <tr className="hover:bg-grey-lighter" key={transaccion.id}>
                      <td className="py-2 px-4 border-b border-grey-light">
                        {modoEdiciontransaccion &&
                        transaccionEditada.id === transaccion.id ? (
                          <input
                            type="text"
                            value={transaccionEditada.nombre}
                            onChange={(e) =>
                              setTransaccionEditada({
                                ...transaccionEditada,
                                nombre: e.target.value,
                              })
                            }
                            className="p-2 rounded border border-gray-300 -mx-1"
                          />
                        ) : (
                          transaccion.nombre
                        )}
                      </td>
                      <td className="py-2 px-4 border-b border-grey-light">
                        {modoEdiciontransaccion &&
                        transaccionEditada.id === transaccion.id ? (
                          <input
                            type="text"
                            value={transaccionEditada.fecha}
                            onChange={(e) =>
                              setTransaccionEditada({
                                ...transaccionEditada,
                                fecha: e.target.value,
                              })
                            }
                            className="p-2 rounded border border-gray-300 -mx-1"
                          />
                        ) : (
                          transaccion.fecha
                        )}
                      </td>
                      <td className="py-2 px-4 border-b border-grey-light">
                        {modoEdiciontransaccion &&
                        transaccionEditada.id === transaccion.id ? (
                          <input
                            type="text"
                            value={transaccionEditada.monto}
                            onChange={(e) =>
                              setTransaccionEditada({
                                ...transaccionEditada,
                                monto: e.target.value,
                              })
                            }
                            className="p-2 rounded border border-gray-300 -mx-1"
                          />
                        ) : (
                          transaccion.monto
                        )}
                      </td>
                      <td className="border-b border-grey-light">
                        {modoEdiciontransaccion &&
                        transaccionEditada.id === transaccion.id ? (
                          <input
                            type="text"
                            value={transaccionEditada.ps}
                            onChange={(e) =>
                              setTransaccionEditada({
                                ...transaccionEditada,
                                ps: e.target.value,
                              })
                            }
                            className="p-2 rounded border border-gray-300 -mx-1"
                          />
                        ) : (
                          transaccion.ps
                        )}
                      </td>
                      <td className="border-b border-grey-light">
                        {modoEdiciontransaccion &&
                        transaccionEditada.id === transaccion.id ? (
                          <input
                            type="text"
                            value={transaccionEditada.pd}
                            onChange={(e) =>
                              setTransaccionEditada({
                                ...transaccionEditada,
                                pd: e.target.value,
                              })
                            }
                            className="p-2 rounded border border-gray-300 -mx-1"
                          />
                        ) : (
                          transaccion.pd
                        )}
                      </td>
                      <td className="border-b border-grey-light">
                        {modoEdiciontransaccion &&
                        transaccionEditada.id === transaccion.id ? (
                          <input
                            type="text"
                            value={transaccionEditada.total}
                            onChange={(e) =>
                              setTransaccionEditada({
                                ...transaccionEditada,
                                total: e.target.value,
                              })
                            }
                            className="p-2 rounded border border-gray-300 -mx-1"
                          />
                        ) : (
                          transaccion.total
                        )}
                      </td>
                      <td className="py-2 px-4 border-b border-grey-light">
                        {modoEdiciontransaccion &&
                        transaccionEditada.id === transaccion.id ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={handleGuardarCambiosTransaccion}
                              className="bg-green-500 hover:bg-green-700 text-white font-semibold py-1 px-2 rounded"
                            >
                              Guardar
                            </button>
                            <button
                              onClick={() => {
                                setModoEdiciontransaccion(false);
                                setTransaccionEditada({
                                  id: "",
                                  nombre: "",
                                  fecha: "",
                                  monto: "",
                                  plan: "",
                                });
                              }}
                              className="bg-gray-500 hover:bg-gray-700 text-white font-semibold py-1 px-2 rounded"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                handleEditarTransaccion(transaccion)
                              }
                              className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-1 px-2 rounded"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() =>
                                handleEliminarTransaccion(transaccion.id)
                              }
                              className="bg-red-500 hover:bg-red-700 text-white font-semibold py-1 px-2 rounded"
                            >
                              Eliminar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-8 bg-white p-4 shadow rounded-lg">
            <div className="bg-white p-4 rounded-md mt-4">
              <h2 className="text-gray-500 text-lg font-semibold pb-4">
                Licencias
              </h2>
              <div className="mb-6 border-b border-gray-300"></div>
              <div className="flex items-center mb-4 space-x-2">
                <select
                  className="p-2 rounded border border-gray-300 w-90"
                  value={selectedEmpresa}
                  onChange={(e) => {
                    setSelectedEmpresa(e.target.value);
                    const selectedCompany = datosFiscalesConNombre.find(
                      (empresa) => empresa.nombreEmpresa === e.target.value
                    );
                    setEmpresaSeleccionada(selectedCompany);
                  }}
                >
                  <option value="">Seleccione Empresa</option>
                  {datosFiscalesConNombre.map((empresa) => (
                    <option key={empresa.id} value={empresa.nombreEmpresa}>
                      {empresa.nombreEmpresa}
                    </option>
                  ))}
                </select>
              </div>

              {empresaSeleccionada && (
                <div>
                  <p>
                    <strong>Código Postal:</strong>{" "}
                    {empresaSeleccionada.codigoPostal}
                  </p>
                  <p>
                    <strong>Email:</strong> {empresaSeleccionada.email}
                  </p>
                  <p>
                    <strong>Razón Social:</strong>{" "}
                    {empresaSeleccionada.razonSocial}
                  </p>
                  <p>
                    <strong>Regimen Fiscal:</strong>{" "}
                    {empresaSeleccionada.regimenFiscal}
                  </p>
                  <p>
                    <strong>RFC:</strong> {empresaSeleccionada.rfc}
                  </p>

                  <p>
                    <strong>Uso CDFI:</strong> {empresaSeleccionada.usoCdfi}
                  </p>

                  {/* Botones de Editar y Eliminar */}
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() =>
                        handleEditarDatosFiscales(empresaSeleccionada)
                      }
                      className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-1 px-2 rounded"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() =>
                        handleEliminarDatosFiscales(empresaSeleccionada.id)
                      }
                      className="bg-red-500 hover:bg-red-700 text-white font-semibold py-1 px-2 rounded"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
