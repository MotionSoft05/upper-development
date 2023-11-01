import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
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
  });
  const [transacciones, setTransacciones] = useState([]);

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

      // Actualiza el estado local con los datos editados
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

      // Después de guardar los cambios, resetea el modo de edición y el usuario editado.
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
                        <button
                          onClick={handleGuardarCambios}
                          className="bg-green-500 hover-bg-green-700 text-white font-semibold py-2 px-4 rounded"
                        >
                          Guardar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEditar(usuario)}
                          className="bg-blue-500 hover-bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                        >
                          Editar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div class="mt-8 bg-white p-4 shadow rounded-lg">
            <div class="bg-white p-4 rounded-md mt-4">
              <h2 class="text-gray-500 text-lg font-semibold pb-4">
                Transacciones
              </h2>
              <div class="my-1"></div>
              <div class="bg-gradient-to-r from-cyan-300 to-cyan-500 h-px mb-6"></div>
              <table class="w-full table-auto text-sm">
                <thead>
                  <tr class="text-sm leading-normal">
                    <th className="py-2 px-4 bg-grey-lightest font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left">
                      Nombre
                    </th>
                    <th className="py-2 px-4 bg-grey-lightest font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left">
                      Fecha
                    </th>
                    <th className="py-2 px-4 bg-grey-lightest font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left">
                      Monto
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="hover:bg-grey-lighter">
                    <td class="py-2 px-4 border-b border-grey-light">
                      Carlos Sánchez
                    </td>
                    <td class="py-2 px-4 border-b border-grey-light">
                      27/07/2023
                    </td>
                    <td class="py-2 px-4 border-b border-grey-light">$1500</td>
                  </tr>
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
