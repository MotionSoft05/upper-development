import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";

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

function Admin() {
  const [usuarios, setUsuarios] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioEditado, setUsuarioEditado] = useState({
    id: "",
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
  });
  const [nuevaTransaccion, setNuevaTransaccion] = useState({
    nombre: "",
    fecha: "",
    monto: "",
    plan: "",
  });
  const [transaccionEditada, setTransaccionEditada] = useState({
    id: "",
    nombre: "",
    fecha: "",
    monto: "",
    plan: "",
  });
  const [transacciones, setTransacciones] = useState([]);

  useEffect(() => {
    const obtenerTransacciones = async () => {
      try {
        const transaccionesCollection = collection(db, "transacciones");
        const transaccionesSnapshot = await getDocs(transaccionesCollection);
        const transaccionesData = transaccionesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTransacciones(transaccionesData);
      } catch (error) {
        console.error("Error al obtener las transacciones de Firebase:", error);
      }
    };

    obtenerTransacciones();
  }, []);

  const handleGuardarTransaccion = async () => {
    if (
      !nuevaTransaccion.nombre ||
      !nuevaTransaccion.fecha ||
      !nuevaTransaccion.monto ||
      !nuevaTransaccion.plan
    ) {
      alert("Por favor, completa todos los campos de la transacción.");
      return;
    }

    try {
      const transaccionRef = await addDoc(collection(db, "transacciones"), {
        nombre: nuevaTransaccion.nombre,
        fecha: nuevaTransaccion.fecha,
        monto: nuevaTransaccion.monto,
        plan: nuevaTransaccion.plan,
      });
      setTransacciones([
        ...transacciones,
        { id: transaccionRef.id, ...nuevaTransaccion },
      ]);
      setNuevaTransaccion({
        nombre: "",
        fecha: "",
        monto: "",
        plan: "",
      });
    } catch (error) {
      console.error("Error al guardar la transacción en Firebase:", error);
    }
  };

  const handleEditarTransaccion = (transaccion) => {
    setModoEdicion(true);
    setNuevaTransaccion(transaccion);
  };

  const handleGuardarCambiosTransaccion = async () => {
    console.log("ID del documento a actualizar:", transaccionEditada.id);
    try {
      console.log("ID del documento a actualizar:", transaccionEditada.id);
      const transaccionDocRef = doc(db, "transacciones", transaccionEditada.id);

      await updateDoc(transaccionDocRef, {
        nombre: transaccionEditada.nombre,
        fecha: transaccionEditada.fecha,
        monto: transaccionEditada.monto,
        plan: transaccionEditada.plan,
      });
      setTransacciones((prevTransacciones) =>
        prevTransacciones.map((transaccion) =>
          transaccion.id === transaccionEditada.id
            ? {
                ...transaccion,
                nombre: transaccionEditada.nombre,
                fecha: transaccionEditada.fecha,
                monto: transaccionEditada.monto,
                plan: transaccionEditada.plan,
              }
            : transaccion
        )
      );
      setModoEdicion(false);
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
      await updateDoc(usuarioDocRef, {
        nombre: usuarioEditado.nombre,
        apellido: usuarioEditado.apellido,
        email: usuarioEditado.email,
        telefono: usuarioEditado.telefono,
      });

      setUsuarios((prevUsuarios) =>
        prevUsuarios.map((usuario) =>
          usuario.id === usuarioEditado.id
            ? {
                ...usuario,
                nombre: usuarioEditado.nombre,
                apellido: usuarioEditado.apellido,
                email: usuarioEditado.email,
                telefono: usuarioEditado.telefono,
              }
            : usuario
        )
      );

      setModoEdicion(false);
      setUsuarioEditado({
        id: "",
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
      });
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
      const usuariosCollection = collection(db, "usuarios");
      const usuariosSnapshot = await getDocs(usuariosCollection);
      const usuariosData = usuariosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsuarios(usuariosData);
    };

    obtenerUsuarios();
  }, []);

  return (
    <div class="flex flex-col  bg-gray-100">
      <div class="flex-1 flex flex-wrap">
        <div class="flex-1 p-4 ">
          <div class="relative max-w-md w-full">
            <div class="absolute top-1 left-2 inline-flex items-center p-2">
              <i class="fas fa-search text-gray-400"></i>
            </div>
            <input
              class="w-full h-10 pl-10 pr-4 py-1 text-base placeholder-gray-500 border rounded-full focus:shadow-outline"
              type="search"
              placeholder="Buscar..."
            />
          </div>
          <div class="mt-8 bg-white p-4 shadow rounded-lg">
            <h2 class="text-gray-500 text-lg font-semibold pb-4">
              Datos de Usuarios
            </h2>
            <div class="my-1"></div>
            <div class="bg-gradient-to-r from-cyan-300 to-cyan-500 h-px mb-6"></div>
            <table class="w-full table-auto text-sm">
              <thead>
                <tr class="text-sm leading-normal">
                  <th className="py-2 px-4 bg-grey-lightest font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left">
                    Nombre y Apellido
                  </th>
                  <th className="py-2 px-4 bg-grey-lightest font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left">
                    Email
                  </th>
                  <th className="py-2 px-4 bg-grey-lightest font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left">
                    Teléfono
                  </th>
                  <th className="py-2 px-4 bg-grey-lightest font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left">
                    Acciones
                  </th>
                  <th className="py-2 px-4 bg-grey-lightest font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left">
                    Plan
                  </th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr className="hover:bg-grey-lighter" key={usuario.id}>
                    <td className="py-2 px-4 border-b border-grey-light">
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
                    <td className="py-2 px-4 border-b border-grey-light">
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
                        />
                      ) : (
                        usuario.email
                      )}
                    </td>
                    <td className="py-2 px-4 border-b border-grey-light">
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
              <div className="flex items-center mb-4">
                {/* Campos de entrada para nueva transacción */}
                <input
                  className="w-38 h-10 mr-4 pl-2 border rounded focus:outline-none"
                  type="text"
                  placeholder="Nombre y Apellido"
                  value={nuevaTransaccion.nombre}
                  onChange={(e) =>
                    setNuevaTransaccion({
                      ...nuevaTransaccion,
                      nombre: e.target.value,
                    })
                  }
                />
                <input
                  className="w-32 h-10 mr-4 pl-2 border rounded focus:outline-none"
                  type="text"
                  placeholder="Fecha"
                  value={nuevaTransaccion.fecha}
                  onChange={(e) =>
                    setNuevaTransaccion({
                      ...nuevaTransaccion,
                      fecha: e.target.value,
                    })
                  }
                />
                <input
                  className="w-32 h-10 mr-4 pl-2 border rounded focus:outline-none"
                  type="text"
                  placeholder="Monto"
                  value={nuevaTransaccion.monto}
                  onChange={(e) =>
                    setNuevaTransaccion({
                      ...nuevaTransaccion,
                      monto: e.target.value,
                    })
                  }
                />
                <input
                  className="w-32 h-10 mr-4 pl-2 border rounded focus:outline-none"
                  type="text"
                  placeholder="Plan"
                  value={nuevaTransaccion.plan}
                  onChange={(e) =>
                    setNuevaTransaccion({
                      ...nuevaTransaccion,
                      plan: e.target.value,
                    })
                  }
                />
                <button
                  onClick={handleGuardarTransaccion}
                  className="bg-green-500 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
                >
                  Guardar Transacción
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
                    <th className="py-2 px-4 bg-grey-lightest font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left">
                      Plan
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
                        {modoEdicion &&
                        nuevaTransaccion.id === transaccion.id ? (
                          <input
                            type="text"
                            value={nuevaTransaccion.nombre}
                            onChange={(e) =>
                              setNuevaTransaccion({
                                ...nuevaTransaccion,
                                nombre: e.target.value,
                              })
                            }
                          />
                        ) : (
                          transaccion.nombre
                        )}
                      </td>
                      <td className="py-2 px-4 border-b border-grey-light">
                        {modoEdicion &&
                        nuevaTransaccion.id === transaccion.id ? (
                          <input
                            type="text"
                            value={nuevaTransaccion.fecha}
                            onChange={(e) =>
                              setNuevaTransaccion({
                                ...nuevaTransaccion,
                                fecha: e.target.value,
                              })
                            }
                          />
                        ) : (
                          transaccion.fecha
                        )}
                      </td>
                      <td className="py-2 px-4 border-b border-grey-light">
                        {modoEdicion &&
                        nuevaTransaccion.id === transaccion.id ? (
                          <input
                            type="text"
                            value={nuevaTransaccion.monto}
                            onChange={(e) =>
                              setNuevaTransaccion({
                                ...nuevaTransaccion,
                                monto: e.target.value,
                              })
                            }
                          />
                        ) : (
                          transaccion.monto
                        )}
                      </td>
                      <td className="py-2 px-4 border-b border-grey-light">
                        {modoEdicion &&
                        nuevaTransaccion.id === transaccion.id ? (
                          <input
                            type="text"
                            value={nuevaTransaccion.plan}
                            onChange={(e) =>
                              setNuevaTransaccion({
                                ...nuevaTransaccion,
                                plan: e.target.value,
                              })
                            }
                          />
                        ) : (
                          transaccion.plan
                        )}
                      </td>
                      <td className="py-2 px-4 border-b border-grey-light">
                        {modoEdicion &&
                        nuevaTransaccion.id === transaccion.id ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                handleGuardarCambiosTransaccion(transaccion.id)
                              }
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
        </div>
      </div>
    </div>
  );
}

export default Admin;
