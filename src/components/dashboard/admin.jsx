import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  setDoc,
  deleteDoc,
  updateData,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrashAlt,
  faToggleOff,
  faToggleOn,
  faSave,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

const firebaseConfig = {
  apiKey: "AIzaSyAiP1248hBEZt3iS2H4UVVjdf_xbuJHD3k",
  authDomain: "upper-8c817.firebaseapp.com",
  projectId: "upper-8c817",
  storageBucket: "upper-8c817.appspot.com",
  messagingSenderId: "798455798906",
  appId: "1:798455798906:web:f58a3e51b42eebb6436fc3",
  measurementId: "G-6VHX927GH1",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

function Admin() {
  const { t } = useTranslation();
  const [usuarios, setUsuarios] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [filtroSeleccionado, setFiltroSeleccionado] = useState("todos");
  const [modoEdiciontransaccion, setModoEdiciontransaccion] = useState(false);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
  const [selectedEmpresa, setSelectedEmpresa] = useState("");
  const [datosFiscalesConNombre, setDatosFiscalesConNombre] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [mensajeEstilo, setMensajeEstilo] = useState(null);

  // Función para mostrar un mensaje y ocultarlo después de 3 segundos
  const mostrarMensaje = (mensaje, estilo) => {
    setMensaje(mensaje);
    setMensajeEstilo({ color: estilo }); // Cambia aquí
    setTimeout(() => {
      setMensaje(null);
    }, 3000);
  };

  const [datosFiscalesEditados, setDatosFiscalesEditados] = useState({
    userId: "",
    id: "",
    codigoPostal: "",
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
    let unsubscribe;

    const obtenerDatosFiscales = async () => {
      try {
        const datosFiscalesCollection = collection(db, "DatosFiscales");
        const usuariosCollection = collection(db, "usuarios");

        const [datosFiscalesSnapshot, usuariosSnapshot] = await Promise.all([
          getDocs(datosFiscalesCollection),
          getDocs(usuariosCollection),
        ]);

        const datosFiscalesData = datosFiscalesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const usuariosData = usuariosSnapshot.docs.reduce((acc, doc) => {
          const userData = doc.data();
          acc[doc.id] = userData.empresa;
          return acc;
        }, {});

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

        setDatosFiscalesConNombre(datosFiscalesConNombreData);

        // Escucha cambios en DatosFiscales
        unsubscribe = onSnapshot(datosFiscalesCollection, (snapshot) => {
          const updatedDatosFiscalesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const updatedDatosFiscalesConNombreData = usuariosSnapshot.docs.map(
            (doc) => {
              const userId = doc.id;
              const datosFiscales =
                updatedDatosFiscalesData.find(
                  (datos) => datos.userId === userId
                ) || {};
              return {
                ...datosFiscales,
                userId,
                nombreEmpresa: usuariosData[userId],
              };
            }
          );

          setDatosFiscalesConNombre(updatedDatosFiscalesConNombreData);
        });
      } catch (error) {
        console.error(
          // "Error al obtener los datos fiscales de Firebase:",
          t("admin.messages.errorFetchingFiscalData"),
          error
        );
      }
    };

    obtenerDatosFiscales();

    // Asegúrate de llamar a unsubscribe cuando dejes de necesitar la escucha en tiempo real
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const handleGuardarCambiosDatosFiscales = async () => {
    try {
      // Verificar que todos los campos estén completos
      if (
        !datosFiscalesEditados.usoCdfi ||
        !datosFiscalesEditados.email ||
        !datosFiscalesEditados.razonSocial ||
        !datosFiscalesEditados.regimenFiscal ||
        !datosFiscalesEditados.rfc ||
        !datosFiscalesEditados.codigoPostal
        // Agregar más verificaciones según tus necesidades
      ) {
        // ("Todos los campos deben estar completos", "red")
        mostrarMensaje(t("admin.messages.allFieldsRequired"), "red");
        return;
      }

      const datosFiscalesCollection = collection(db, "DatosFiscales");

      // Verificar si el documento existe
      const datosFiscalesDocRef = datosFiscalesEditados.id
        ? doc(db, "DatosFiscales", datosFiscalesEditados.id)
        : doc(db, "DatosFiscales", datosFiscalesEditados.userId); // Usar userId como id del documento

      await setDoc(datosFiscalesDocRef, {
        userId: datosFiscalesEditados.userId,
        usoCdfi: datosFiscalesEditados.usoCdfi,
        email: datosFiscalesEditados.email,
        codigoPostal: datosFiscalesEditados.codigoPostal,
        razonSocial: datosFiscalesEditados.razonSocial,
        regimenFiscal: datosFiscalesEditados.regimenFiscal,
        rfc: datosFiscalesEditados.rfc,
        // Otros campos según tu estructura de datos
      });

      // ("Guardado con éxito", "green")
      mostrarMensaje(t("admin.messages.successSaveMessage"), "green");
    } catch (error) {
      // "Error al guardar los cambios en datos fiscales:"
      console.error(t("admin.messages.errorSavingFiscalChanges"), error);

      // ("Error al guardar los cambios", "red")
      mostrarMensaje(t("admin.messages.errorSavingChanges"), "red");
    }
  };

  const handleEliminarDatosFiscales = async (datosFiscalesId) => {
    // Mostrar un alert antes de la confirmación
    const confirmacion = window.confirm(
      // "¿Estás seguro de que deseas eliminar estos datos fiscales?"
      t("admin.messages.confirmDeleteFiscalData")
    );

    if (confirmacion) {
      try {
        const datosFiscalesDocRef = doc(db, "DatosFiscales", datosFiscalesId);

        // Eliminar el documento en Firebase
        await deleteDoc(datosFiscalesDocRef);

        // Filtra los datos fiscales eliminados de la lista
        const nuevosDatosFiscales = datosFiscalesConNombre.map((datos) =>
          datos.id === datosFiscalesId
            ? {
                ...datos,
                ...{
                  codigoPostal: "",
                  email: "",
                  razonSocial: "",
                  regimenFiscal: "",
                  rfc: "",
                  usoCdfi: "",
                },
              }
            : datos
        );

        setDatosFiscalesConNombre(nuevosDatosFiscales);
        // ("Eliminado con éxito", "green");
        mostrarMensaje(t("admin.messages.successDeleteMessage"), "green");
      } catch (error) {
        // "Error al eliminar datos fiscales:"
        console.error(t("admin.messages.errorDeletingFiscalData"), error);
        // "Error al eliminar datos fiscales", "red"
        mostrarMensaje(t("admin.messages.errorDeletingFiscalMessage"), "red");
      }
    } else {
      // Alerta si no se confirma la eliminación "No se eliminaron los datos fiscales."
      alert(t("admin.messages.alertDeleteFiscalData"));
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
        // "Por favor, completa todos los campos de la transacción."
        alert(t("admin.messages.alertTransactionFields"));
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
      // "Error al guardar la transacción en Firebase:"
      console.error(t("admin.messages.errorSavingTransactionFirebase"), error);
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
      // console.error("Error al guardar los cambios en Firebase:", error);
      console.error(t("admin.messages.errorSavingFirebaseChanges"), error);
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
      // "Error al eliminar la transacción de Firebase:"
      console.error(
        t("admin.messages.errorDeletingTransactionFirebase"),
        error
      );
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
        // "No hay campos válidos para actualizar."
        console.warn(t("admin.messages.noValidFieldsUpdate"));
      }
    } catch (error) {
      // "Error al guardar los cambios en Firebase:"
      console.error(t("admin.messages.errorSavingFirebaseChanges"), error);
    }
  };

  const handleEliminarUsuario = async (usuarioId) => {
    const confirmacion = window.confirm(
      // "¿Estás seguro de que deseas eliminar este usuario?"
      t("admin.messages.confirmDeleteUser")
    );

    if (confirmacion) {
      try {
        // Eliminar usuario de Firestore
        await deleteDoc(doc(db, "usuarios", usuarioId));

        // Hacer la solicitud DELETE al backend usando Axios
        const response = await axios.delete(
          `https://upperds.onrender.com/eliminar-usuario/${usuarioId}`
        );

        if (response.status === 200) {
          console.log(`Usuario con ID ${usuarioId} eliminado correctamente.`);
        } else {
          console.error(
            // "Error al eliminar usuario del backend:"
            t("admin.messages.errorDeleteUserBackend"),
            response.statusText
          );
        }

        // Actualizar el estado de React eliminando al usuario de la lista
        setUsuarios((prevUsuarios) =>
          prevUsuarios.filter((usuario) => usuario.id !== usuarioId)
        );
      } catch (error) {
        console.error(
          // "Error al eliminar el usuario de Firestore o al hacer la solicitud al backend:"
          t("admin.messages.errorDeletingFirestoreUser"),
          error
        );
      }
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
          status: doc.data().status,
        }));
        setUsuarios(usuariosData);
      } catch (error) {
        // "Error al obtener los usuarios de Firebase:"
        console.error(t("admin.messages.errorFetchingFirebaseUsers"), error);
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

  const handleHabilitarUsuario = async (usuarioId) => {
    try {
      // Hacer la solicitud PUT al backend usando Axios
      const response = await axios.put(
        `http://localhost:8000/usuarios/${usuarioId}`,
        { habilitar: true }
      );

      if (response.status === 200) {
        // console.log(`Usuario con ID ${usuarioId} habilitado correctamente.`)
        console.log(
          t("admin.messages.errorDeletingFiscalData", { usuarioId: usuarioId })
        );
        // Actualizar el estado de React para reflejar el cambio
        setUsuarios((prevUsuarios) =>
          prevUsuarios.map((usuario) =>
            usuario.id === usuarioId ? { ...usuario, status: true } : usuario
          )
        );

        // Actualizar el campo 'status' en Firestore
        const usuarioRef = doc(db, "usuarios", usuarioId);
        await updateDoc(usuarioRef, { status: true });
      } else {
        console.error(
          // "Error al habilitar usuario en el backend:",
          t("admin.messages.errorEnableUserBackend"),
          response.statusText
        );
      }
    } catch (error) {
      // "Error al habilitar el usuario:"
      console.error(t("admin.messages.errorEnableUser"), error);
    }
  };

  const handleDeshabilitarUsuario = async (usuarioId) => {
    try {
      // Hacer la solicitud PUT al backend usando Axios
      const response = await axios.put(
        `http://localhost:8000/usuarios/${usuarioId}`,
        { habilitar: false }
      );

      if (response.status === 200) {
        // console.log(`Usuario con ID ${usuarioId} deshabilitado correctamente.`);
        console.log(
          t("admin.messages.successDisableUserMessage", {
            usuarioId: usuarioId,
          })
        );
        // Actualizar el estado de React para reflejar el cambio
        setUsuarios((prevUsuarios) =>
          prevUsuarios.map((usuario) =>
            usuario.id === usuarioId ? { ...usuario, status: false } : usuario
          )
        );

        // Actualizar el campo 'status' en Firestore
        const usuarioRef = doc(db, "usuarios", usuarioId);
        await updateDoc(usuarioRef, { status: false });
      } else {
        console.error(
          // "Error al deshabilitar usuario en el backend:",
          t("admin.messages.errorDisableUserBackend"),
          response.statusText
        );
      }
    } catch (error) {
      // "Error al deshabilitar el usuario:"
      console.error(t("admin.messages.errorDisableUser"), error);
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
              {/* Datos de Usuarios */}
              {t("admin.titles.userDetails")}
            </h2>
            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => setFiltroSeleccionado("todos")}
                className={`${
                  filtroSeleccionado === "todos" ? "bg-blue-500" : "bg-gray-300"
                } text-white font-semibold py-2 px-4 rounded`}
              >
                {/* Todos */}
                {t("admin.buttons.all")}
              </button>
              <button
                onClick={() => setFiltroSeleccionado("conNumero")}
                className={`${
                  filtroSeleccionado === "conNumero"
                    ? "bg-blue-500"
                    : "bg-gray-300"
                } text-white font-semibold py-2 px-4 rounded`}
              >
                {/* Licencias */}
                {t("admin.buttons.licensed")}
              </button>
              <button
                onClick={() => setFiltroSeleccionado("sinNumero")}
                className={`${
                  filtroSeleccionado === "sinNumero"
                    ? "bg-blue-500"
                    : "bg-gray-300"
                } text-white font-semibold py-2 px-4 rounded`}
              >
                {/* Sin Licencias */}
                {t("admin.buttons.unlicensed")}
              </button>
            </div>

            <div class="my-1"></div>
            <div class="bg-gradient-to-r from-cyan-300 to-cyan-500 h-px mb-6"></div>
            <table class="w-full table-auto text-sm">
              <thead>
                <tr class="text-sm leading-normal">
                  <th className="bg-grey-lightest  font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left">
                    {/* Nombre y Apellido */}
                    {t("admin.nameAndSurname")}
                  </th>
                  <th className="bg-grey-lightest font-bold px-2 uppercase text-sm text-grey-light border-b border-grey-light text-left">
                    {/* Email */}
                    {t("admin.email")}
                  </th>
                  <th className="py-2 bg-grey-lightest px-2 font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left">
                    {/* Empresa */}
                    {t("admin.company")}
                  </th>
                  <th className="py-2 bg-grey-lightest  px-2 font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left">
                    {/* Teléfono */}
                    {t("admin.phone")}
                  </th>

                  <th className="bg-grey-lightest  px-2 text-center font-bold uppercase text-sm text-grey-light border-b border-grey-light">
                    PS
                  </th>
                  <th className="bg-grey-lightest  px-2 text-center font-bold uppercase text-sm text-grey-light border-b border-grey-light">
                    PD
                  </th>
                  <th className="bg-grey-lightest px-2 text-center font-bold uppercase text-sm text-grey-light border-b border-grey-light">
                    T
                  </th>
                  <th className="py-2 px-4 bg-grey-lightest  font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left">
                    {/* Inicio */}
                    {t("admin.start")}
                  </th>
                  <th className="py-2 px-4 bg-grey-lightest  font-bold uppercase text-sm text-grey-light border-b border-grey-light text-center">
                    {/* Final */}
                    {t("admin.end")}
                  </th>
                  <th className="py-2 px-4 bg-grey-lightest  font-bold uppercase text-sm text-grey-light border-b border-grey-light text-center">
                    {/* Tipo de Plan */}
                    {t("admin.planType")}
                  </th>
                  <th className="py-2 px-4 bg-grey-lightest  font-bold uppercase text-sm text-grey-light border-b border-grey-light text-center">
                    {/* Acciones */}
                    {t("admin.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {aplicarFiltro().map((usuario) => (
                  <tr className={`hover:bg-gray-200 ${modoEdicion && usuarioEditado.id === usuario.id && 'bg-stone-100'}`} key={usuario.id}>
                    {/* NOMBRE Y APELLIDO */}
                    <td className="border-b border-grey-light">
                      {modoEdicion && usuarioEditado.id === usuario.id ? (
                        <input
                          type="text"
                          value={`${usuarioEditado.nombre} ${usuarioEditado.apellido}`}
                          className="bg-stone-100"
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
                    {/* EMAIL */}
                    <td className="border-b  px-2 border-grey-light ">
                      {modoEdicion && usuarioEditado.id === usuario.id ? (
                        <input
                          type="text"
                          value={usuarioEditado.email}
                          className="bg-stone-100"
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
                    {/* EMPRESA */}
                    <td className="py-2 px-2 border-b border-grey-light">
                      {modoEdicion && usuarioEditado.id === usuario.id ? (
                        <input
                          type="text"
                          value={usuarioEditado.empresa}
                          className="bg-stone-100 max-w-[180px]"
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
                    {/* TELEFONO */}
                    <td className="py-2 px-2 border-b border-grey-light">
                      {modoEdicion && usuarioEditado.id === usuario.id ? (
                        <input
                          type="text"
                          value={usuarioEditado.telefono}
                          className="w-36 bg-stone-100"
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
                    {/* PS */}
                    <td className="border-b border-grey-light text-center">
                      {modoEdicion && usuarioEditado.id === usuario.id ? (
                        <input
                          type="text"
                          value={usuarioEditado.ps}
                          className="max-w-[30px] text-center bg-stone-100"
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
                    {/* PD */}
                    <td className="border-b border-grey-light text-center ">
                      {modoEdicion && usuarioEditado.id === usuario.id ? (
                        <input
                          type="text"
                          value={usuarioEditado.pd}
                          className="max-w-[30px] text-center bg-stone-100"
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
                    {/* TOTAL */}
                    <td className="border-b border-grey-light text-center">
                      {modoEdicion && usuarioEditado.id === usuario.id ? (
                        <input
                          type="text"
                          value={usuarioEditado.total}
                          className="max-w-[30px] text-center bg-stone-100"
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
                    {/* INICIO */}
                    <td className="border-b border-grey-light text-center">
                      {modoEdicion && usuarioEditado.id === usuario.id ? (
                        <input
                          type="text"
                          value={usuarioEditado.inicio}
                          className="max-w-[70px] text-center bg-stone-100"
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
                    {/* FINAL */}
                    <td className="py-2 px-4 border-b border-grey-light text-center">
                      {modoEdicion && usuarioEditado.id === usuario.id ? (
                        <input
                          type="text"
                          value={usuarioEditado.final}
                          className="max-w-[70px] text-center bg-stone-100"
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
                    {/* TIPO DE PLAN */}
                    <td className="py-2 px-4 border-b border-grey-light text-center">
                      {modoEdicion && usuarioEditado.id === usuario.id ? (
                        <input
                          type="text"
                          value={usuarioEditado.tipoPlan}
                          className="max-w-[80px] text-center bg-stone-100"
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
                    {/* ACCIONES */}
                    <td className="py-2 px-4 border-b border-grey-light">
                      {modoEdicion && usuarioEditado.id === usuario.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={handleGuardarCambios}
                            className="bg-green-500 hover:bg-green-700 text-white font-semibold py-1 px-2 rounded"
                          >
                            <FontAwesomeIcon icon={faSave} />
                          </button>
                          <button
                            onClick={() => setModoEdicion(false)}
                            className="bg-gray-500 hover:bg-gray-700 text-white font-semibold py-1 px-2 rounded"
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditar(usuario)}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-1 px-2 rounded"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={() => handleEliminarUsuario(usuario.id)}
                            className="bg-red-500 hover:bg-red-700 text-white font-semibold py-1 px-2 rounded"
                          >
                            <FontAwesomeIcon icon={faTrashAlt} />
                          </button>
                          {/* Botón para habilitar/deshabilitar */}
                          {usuario.status ? (
                            <button
                              onClick={() =>
                                handleDeshabilitarUsuario(usuario.id)
                              }
                              className="bg-green-500 hover:bg-green-700 text-white font-semibold py-1 px-2 rounded"
                            >
                              <FontAwesomeIcon icon={faToggleOn} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleHabilitarUsuario(usuario.id)}
                              className="bg-yellow-500 hover:bg-yellow-700 text-white font-semibold py-1 px-2 rounded"
                            >
                              <FontAwesomeIcon icon={faToggleOff} />
                            </button>
                          )}
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
                {/* Transacciones */}
                {t("admin.titles.transactions")}
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
                  // "Nombre y Apellido"
                  placeholder={t("admin.nameAndSurname")}
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
                  // "Fecha"
                  placeholder={t("admin.date")}
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
                  // "Monto"
                  placeholder={t("admin.amount")}
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
                  {/* Guardar */}
                  {t("admin.buttons.save")}
                </button>
              </div>
              <table className="w-full table-auto text-sm">
                <thead>
                  <tr className="text-sm leading-normal">
                    <th className="py-2 px-4 bg-grey-lightest font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left">
                      {/* Nombre y Apellido */}
                      {t("admin.nameAndSurname")}
                    </th>
                    <th className="py-2 px-4 bg-grey-lightest font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left">
                      {/* Fecha */}
                      {t("admin.date")}
                    </th>
                    <th className="py-2 px-4 bg-grey-lightest font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left">
                      {/* Monto */}
                      {t("admin.amount")}
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
                      {/* Acciones */}
                      {t("admin.actions")}
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
                              {/* Guardar */}
                              {t("admin.buttons.save")}
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
                              {/* Cancelar */}
                              {t("admin.buttons.cancel")}
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
                              {/* Editar */}
                              {t("admin.buttons.edit")}
                            </button>
                            <button
                              onClick={() =>
                                handleEliminarTransaccion(transaccion.id)
                              }
                              className="bg-red-500 hover:bg-red-700 text-white font-semibold py-1 px-2 rounded"
                            >
                              {/* Eliminar */}
                              {t("admin.buttons.delete")}
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
                {/* Licencias */}
                {t("admin.titles.licenses")}
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
                    setDatosFiscalesEditados({
                      userId: selectedCompany?.userId || "", // Añadir userId
                      id: selectedCompany?.id || "",
                      codigoPostal: selectedCompany?.codigoPostal || "",
                      email: selectedCompany?.email || "",
                      razonSocial: selectedCompany?.razonSocial || "",
                      regimenFiscal: selectedCompany?.regimenFiscal || "",
                      rfc: selectedCompany?.rfc || "",
                      usoCdfi: selectedCompany?.usoCdfi || "",
                    });
                  }}
                >
                  <option value="">
                    {/* Seleccione Empresa */}
                    {t("admin.selectCompany")}
                  </option>
                  {usuarios.map((usuario) => (
                    <option key={usuario.id} value={usuario.empresa}>
                      {usuario.empresa}
                    </option>
                  ))}
                </select>
              </div>
              {empresaSeleccionada && (
                <div className="mt-4">
                  {/* Include input fields for editing */}
                  <label className="block text-sm font-semibold text-gray-600">
                    {/* Código Postal: */}
                    {t("admin.postalCode")}
                  </label>
                  <input
                    type="text"
                    value={datosFiscalesEditados.codigoPostal}
                    onChange={(e) =>
                      setDatosFiscalesEditados({
                        ...datosFiscalesEditados,
                        codigoPostal: e.target.value,
                      })
                    }
                    // "Código Postal"
                    placeholder={t("admin.postalCode")}
                    className="p-2 rounded border border-gray-300 mr-2"
                  />

                  <label className="block text-sm font-semibold text-gray-600">
                    {/* Correo Electrónico: */}
                    {t("admin.email")}
                  </label>
                  <input
                    type="text"
                    value={datosFiscalesEditados.email}
                    onChange={(e) =>
                      setDatosFiscalesEditados({
                        ...datosFiscalesEditados,
                        email: e.target.value,
                      })
                    }
                    // "Correo Electrónico"
                    placeholder={t("admin.email")}
                    className="p-2 rounded border border-gray-300 mr-2"
                  />

                  <label className="block text-sm font-semibold text-gray-600">
                    {/* Razón Social: */}
                    {t("admin.companyName")}
                  </label>
                  <input
                    type="text"
                    value={datosFiscalesEditados.razonSocial}
                    onChange={(e) =>
                      setDatosFiscalesEditados({
                        ...datosFiscalesEditados,
                        razonSocial: e.target.value,
                      })
                    }
                    // "Razón Social"
                    placeholder={t("admin.companyName")}
                    className="p-2 rounded border border-gray-300 mr-2"
                  />

                  <label className="block text-sm font-semibold text-gray-600">
                    {/* Régimen Fiscal: */}
                    {t("admin.fiscalRegime")}
                  </label>
                  <input
                    type="text"
                    value={datosFiscalesEditados.regimenFiscal}
                    onChange={(e) =>
                      setDatosFiscalesEditados({
                        ...datosFiscalesEditados,
                        regimenFiscal: e.target.value,
                      })
                    }
                    // "Régimen Fiscal"
                    placeholder={t("admin.fiscalRegime")}
                    className="p-2 rounded border border-gray-300 mr-2"
                  />

                  <label className="block text-sm font-semibold text-gray-600">
                    RFC:
                  </label>
                  <input
                    type="text"
                    value={datosFiscalesEditados.rfc}
                    onChange={(e) =>
                      setDatosFiscalesEditados({
                        ...datosFiscalesEditados,
                        rfc: e.target.value,
                      })
                    }
                    placeholder="RFC"
                    className="p-2 rounded border border-gray-300 mr-2"
                  />

                  <label className="block text-sm font-semibold text-gray-600">
                    {/* Uso CDFI: */}
                    {t("admin.cdfiUsage")}
                  </label>
                  <input
                    type="text"
                    value={datosFiscalesEditados.usoCdfi}
                    onChange={(e) =>
                      setDatosFiscalesEditados({
                        ...datosFiscalesEditados,
                        usoCdfi: e.target.value,
                      })
                    }
                    // "Uso CDFI"
                    placeholder={t("admin.cdfiUsage")}
                    className="p-2 rounded border border-gray-300 mr-2"
                  />
                  <div style={mensajeEstilo}>{mensaje}</div>

                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={handleGuardarCambiosDatosFiscales}
                      className="bg-green-500 hover:bg-green-700 text-white font-semibold py-1 px-2 rounded"
                    >
                      {/* Guardar Cambios */}
                      {t("admin.buttons.saveChanges")}
                    </button>
                    <button
                      onClick={() =>
                        handleEliminarDatosFiscales(datosFiscalesEditados.id)
                      }
                      className="bg-red-500 hover:bg-red-700 text-white font-semibold py-1 px-2 rounded"
                    >
                      {/* Eliminar */}
                      {t("admin.buttons.delete")}
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
