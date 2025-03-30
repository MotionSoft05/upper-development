/* eslint-disable react-hooks/exhaustive-deps */
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  setDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
  query,
  where,
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
  faSearch,
  faUserShield,
  faFileInvoiceDollar,
  faUsers,
  faFilter,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import db from "@/firebase/firestore";
import auth from "@/firebase/auth";
import Datepicker from "react-tailwindcss-datepicker";

/**
 * Usuarios y Licencias
 * Esta función representa la administración de usuarios y licencias.
 * @returns {JSX.Element} El componente de administración de usuarios.
 */
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
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("usuarios");
  const [sortDirection, setSortDirection] = useState("asc");
  const [sortColumn, setSortColumn] = useState("nombre");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  // Función para mostrar un mensaje y ocultarlo después de 3 segundos
  const mostrarMensaje = (mensaje, estilo) => {
    setMensaje(mensaje);
    setMensajeEstilo({ color: estilo });
    setTimeout(() => {
      setMensaje(null);
    }, 3000);
  };

  const [datosFiscalesEditados, setDatosFiscalesEditados] = useState({
    codigoPostal: "",
    usoCdfi: "",
    email: "",
    razonSocial: "",
    regimenFiscal: "",
    rfc: "",
  });

  const [usuarioEditado, setUsuarioEditado] = useState({
    id: "",
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    ps: "",
    pd: "",
    pservice: "",
    pt: "", // Añadir campo para pantallas de tarifario
    tipoPlan: "",
    empresa: "",
    inicio: "",
    final: "",
  });

  const [nuevaTransaccion, setNuevaTransaccion] = useState({
    nombre: "",
    fecha: "",
    monto: "",
    ps: "",
    pd: "",
    pservice: "",
    tipoPlan: "",
  });

  const [transaccionEditada, setTransaccionEditada] = useState({
    id: "",
    nombre: "",
    fecha: "",
    monto: "",
    ps: "",
    pd: "",
    pservice: "",
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

        // Usar un Set para eliminar duplicados
        const uniqueDatosFiscalesConNombreData = Array.from(
          new Set(datosFiscalesConNombreData.map((item) => item.nombreEmpresa))
        ).map((nombreEmpresa) => {
          return datosFiscalesConNombreData.find(
            (item) => item.nombreEmpresa === nombreEmpresa
          );
        });

        setDatosFiscalesConNombre(uniqueDatosFiscalesConNombreData);

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

          // Usar un Set para eliminar duplicados en datos actualizados
          const uniqueUpdatedDatosFiscalesConNombreData = Array.from(
            new Set(
              updatedDatosFiscalesConNombreData.map(
                (item) => item.nombreEmpresa
              )
            )
          ).map((nombreEmpresa) => {
            return updatedDatosFiscalesConNombreData.find(
              (item) => item.nombreEmpresa === nombreEmpresa
            );
          });

          setDatosFiscalesConNombre(uniqueUpdatedDatosFiscalesConNombreData);
        });
      } catch (error) {
        console.error(t("admin.messages.errorFetchingFiscalData"), error);
      }
    };

    obtenerDatosFiscales();

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
      ) {
        mostrarMensaje(t("admin.messages.allFieldsRequired"), "red");
        return;
      }

      const datosFiscalesCollection = collection(db, "DatosFiscales");

      // Buscar si ya existe un documento con el mismo nombre de empresa
      const querySnapshot = await getDocs(
        query(datosFiscalesCollection, where("empresa", "==", selectedEmpresa))
      );

      let datosFiscalesDocRef;
      if (!querySnapshot.empty) {
        // Si existe, usa el primer documento encontrado
        const docFound = querySnapshot.docs[0];
        datosFiscalesDocRef = doc(db, "DatosFiscales", docFound.id);
      } else {
        // Si no existe, crea un nuevo documento
        datosFiscalesDocRef = doc(datosFiscalesCollection);
      }

      // Sobrescribir el documento
      await setDoc(datosFiscalesDocRef, {
        codigoPostal: datosFiscalesEditados.codigoPostal,
        email: datosFiscalesEditados.email,
        razonSocial: datosFiscalesEditados.razonSocial,
        regimenFiscal: datosFiscalesEditados.regimenFiscal,
        rfc: datosFiscalesEditados.rfc,
        usoCdfi: datosFiscalesEditados.usoCdfi,
        empresa: selectedEmpresa,
      });

      mostrarMensaje(t("admin.messages.successSaveMessage"), "green");
    } catch (error) {
      console.error(t("admin.messages.errorSavingFiscalChanges"), error);
      mostrarMensaje(t("admin.messages.errorSavingChanges"), "red");
    }
  };

  const handleEliminarDatosFiscales = async (datosFiscalesId) => {
    const confirmacion = window.confirm(
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
        mostrarMensaje(t("admin.messages.successDeleteMessage"), "green");
      } catch (error) {
        console.error(t("admin.messages.errorDeletingFiscalData"), error);
        mostrarMensaje(t("admin.messages.errorDeletingFiscalMessage"), "red");
      }
    }
  };

  const handleValueChange = (newValue) => {
    setNuevaTransaccion({
      ...nuevaTransaccion,
      fecha: newValue.startDate,
    });
  };

  const handleGuardarTransaccion = async () => {
    try {
      if (
        !nuevaTransaccion.nombre ||
        !nuevaTransaccion.fecha ||
        !nuevaTransaccion.monto ||
        !nuevaTransaccion.ps ||
        !nuevaTransaccion.pd ||
        !nuevaTransaccion.pservice
      ) {
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
        ps: "",
        pd: "",
        pservice: "",
      });
    } catch (error) {
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
  // Añade este useEffect después de los otros useEffect en tu componente
  useEffect(() => {
    // Resetear a la página 1 cuando cambien los criterios de búsqueda o filtrado
    setCurrentPage(1);
  }, [searchTerm, filtroSeleccionado]);
  // Cambio a la función handleGuardarCambios para permitir más pantallas directorio
  const handleGuardarCambios = async () => {
    try {
      const usuarioDocRef = doc(db, "usuarios", usuarioEditado.id);
      const updateData = {
        nombre: usuarioEditado.nombre,
        apellido: usuarioEditado.apellido,
        telefono: usuarioEditado.telefono,
        ps: usuarioEditado.ps,
        pd: usuarioEditado.pd,
        pservice: usuarioEditado.pservice,
        pt: usuarioEditado.pt, // Añadir el campo pt
        tipoPlan: usuarioEditado.tipoPlan,
        empresa: usuarioEditado.empresa,
        inicio: usuarioEditado.inicio,
        final: usuarioEditado.final,
      };

      const validUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      );

      if (Object.keys(validUpdateData).length > 0) {
        // Actualizar el usuario en Firestore
        await updateDoc(usuarioDocRef, validUpdateData);

        // Verificar si el nombre de la empresa ya existe
        const empresaExistente = usuarios.find(
          (usuario) =>
            usuario.empresa.toLowerCase() ===
              usuarioEditado.empresa.toLowerCase() &&
            usuario.id !== usuarioEditado.id
        );

        if (empresaExistente) {
          // Obtener el dato nombrePantallas y nombrePantallasDirectorio del usuario existente
          const empresaExistenteDocRef = doc(
            db,
            "usuarios",
            empresaExistente.id
          );
          const empresaExistenteDoc = await getDoc(empresaExistenteDocRef);

          if (empresaExistenteDoc.exists()) {
            const {
              nombrePantallas,
              nombrePantallasDirectorio,
              nombrePantallasTarifario,
            } = empresaExistenteDoc.data();

            // Crear un objeto para almacenar los campos que se deben actualizar
            const updateFields = {};

            // Solo actualizar si nombrePantallas existe y no es undefined
            if (nombrePantallas !== undefined) {
              updateFields.nombrePantallas = nombrePantallas;
            }

            // Solo actualizar si nombrePantallasDirectorio existe y no es undefined
            if (nombrePantallasDirectorio !== undefined) {
              updateFields.nombrePantallasDirectorio =
                nombrePantallasDirectorio;
            }

            // Solo actualizar si nombrePantallasTarifario existe y no es undefined
            if (nombrePantallasTarifario !== undefined) {
              updateFields.nombrePantallasTarifario = nombrePantallasTarifario;
            }

            if (Object.keys(updateFields).length > 0) {
              await updateDoc(usuarioDocRef, updateFields);

              // Actualizar el estado local del usuario editado
              Object.assign(validUpdateData, updateFields);
            }
          }
        }

        // Actualizar estado local
        setUsuarios((prevUsuarios) => {
          // Actualizar usuario modificado
          const updatedUsuarios = prevUsuarios.map((usuario) =>
            usuario.id === usuarioEditado.id
              ? {
                  ...usuario,
                  ...validUpdateData,
                }
              : usuario
          );

          // Ordenar usuarios nuevamente
          const usuariosOrdenados =
            ordenarUsuariosAlfabeticamente(updatedUsuarios);
          return usuariosOrdenados;
        });

        setModoEdicion(false);
        setUsuarioEditado({
          id: "",
          nombre: "",
          apellido: "",
          telefono: "",
          ps: "",
          pd: "",
          pservice: "",
          pt: "", // Asegúrate de incluir el campo pt aquí
          tipoPlan: "",
          empresa: "",
          inicio: "",
          final: "",
        });

        mostrarMensaje(t("admin.messages.successSaveMessage"), "green");
      } else {
        console.warn(t("admin.messages.noValidFieldsUpdate"));
      }
    } catch (error) {
      console.error(t("admin.messages.errorSavingFirebaseChanges"), error);
      mostrarMensaje(t("admin.messages.errorSavingChanges"), "red");
    }
  };

  // Función para ordenar usuarios alfabéticamente por empresa y nombre
  const ordenarUsuariosAlfabeticamente = (usuarios) => {
    const usuariosPorEmpresa = usuarios.reduce((acc, usuario) => {
      const empresa = usuario.empresa.toLowerCase();
      acc[empresa] = acc[empresa] || [];
      acc[empresa].push(usuario);
      return acc;
    }, {});

    const usuariosOrdenados = Object.keys(usuariosPorEmpresa)
      .sort()
      .map((empresa) => usuariosPorEmpresa[empresa])
      .flat();

    return usuariosOrdenados;
  };

  const handleEliminarUsuario = async (usuarioId) => {
    const confirmacion = window.confirm(t("admin.messages.confirmDeleteUser"));

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
          mostrarMensaje(t("admin.messages.successDeleteUserMessage"), "green");
        } else {
          console.error(
            t("admin.messages.errorDeleteUserBackend"),
            response.statusText
          );
          mostrarMensaje(t("admin.messages.errorDeletingUserMessage"), "red");
        }

        // Actualizar el estado de React eliminando al usuario de la lista
        setUsuarios((prevUsuarios) =>
          prevUsuarios.filter((usuario) => usuario.id !== usuarioId)
        );
      } catch (error) {
        console.error(t("admin.messages.errorDeletingFirestoreUser"), error);
        mostrarMensaje(t("admin.messages.errorDeletingUserMessage"), "red");
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

        // Agrupar usuarios por empresa
        const usuariosPorEmpresa = usuariosData.reduce((acc, usuario) => {
          const empresa = usuario.empresa.toLowerCase();
          acc[empresa] = acc[empresa] || [];
          acc[empresa].push(usuario);
          return acc;
        }, {});

        // Ordenar los grupos alfabéticamente por empresa
        const usuariosOrdenados = Object.keys(usuariosPorEmpresa)
          .sort()
          .map((empresa) => usuariosPorEmpresa[empresa])
          .flat();

        setUsuarios(usuariosOrdenados);
      } catch (error) {
        console.error(t("admin.messages.errorFetchingFirebaseUsers"), error);
      }
    };

    obtenerUsuarios();
  }, []);

  if (currentUser && currentUser.email !== "uppermex10@gmail.com") {
    return <p>No tienes permiso para acceder a esta página.</p>;
  }

  // Modificar la función aplicarFiltro para incluir la paginación
  const aplicarFiltro = () => {
    let usuariosFiltrados = [...usuarios];

    // Filtro por licencias
    if (filtroSeleccionado === "conNumero") {
      usuariosFiltrados = usuariosFiltrados.filter(
        (usuario) => usuario.ps !== "" && usuario.ps !== 0
      );
    } else if (filtroSeleccionado === "sinNumero") {
      usuariosFiltrados = usuariosFiltrados.filter(
        (usuario) =>
          (usuario.ps === "" || usuario.ps === 0) &&
          (usuario.pd === "" || usuario.pd === 0)
      );
    }

    // Filtro por búsqueda
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      usuariosFiltrados = usuariosFiltrados.filter(
        (usuario) =>
          usuario.nombre.toLowerCase().includes(searchTermLower) ||
          usuario.apellido.toLowerCase().includes(searchTermLower) ||
          usuario.email.toLowerCase().includes(searchTermLower) ||
          usuario.empresa.toLowerCase().includes(searchTermLower)
      );
    }

    // Ordenamiento
    if (sortColumn) {
      usuariosFiltrados.sort((a, b) => {
        let valueA, valueB;

        // Determinar los valores a comparar según la columna
        if (sortColumn === "nombre") {
          valueA = `${a.nombre} ${a.apellido}`.toLowerCase();
          valueB = `${b.nombre} ${b.apellido}`.toLowerCase();
        } else if (sortColumn === "email") {
          valueA = a.email.toLowerCase();
          valueB = b.email.toLowerCase();
        } else if (sortColumn === "empresa") {
          valueA = a.empresa.toLowerCase();
          valueB = b.empresa.toLowerCase();
        } else {
          valueA = a[sortColumn];
          valueB = b[sortColumn];

          // Convertir a números si es posible para columnas numéricas
          if (!isNaN(valueA) && !isNaN(valueB)) {
            valueA = Number(valueA) || 0;
            valueB = Number(valueB) || 0;
          }
        }

        // Aplicar la dirección de ordenamiento
        if (sortDirection === "asc") {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      });
    }

    return usuariosFiltrados;
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleHabilitarUsuario = async (usuarioId) => {
    try {
      // Hacer la solicitud PUT al backend usando Axios
      const response = await axios.put(
        `https://upperds.onrender.com/usuarios/${usuarioId}`,
        { habilitar: true }
      );

      if (response.status === 200) {
        console.log(
          t("admin.messages.successEnableUserMessage", { usuarioId: usuarioId })
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

        mostrarMensaje(t("admin.messages.successEnableUserMessage"), "green");
      } else {
        console.error(
          t("admin.messages.errorEnableUserBackend"),
          response.statusText
        );
        mostrarMensaje(t("admin.messages.errorEnableUserMessage"), "red");
      }
    } catch (error) {
      console.error(t("admin.messages.errorEnableUser"), error);
      mostrarMensaje(t("admin.messages.errorEnableUserMessage"), "red");
    }
  };

  const handleDeshabilitarUsuario = async (usuarioId) => {
    try {
      // Hacer la solicitud PUT al backend usando Axios
      const response = await axios.put(
        `https://upperds.onrender.com/usuarios/${usuarioId}`,
        { habilitar: false }
      );

      if (response.status === 200) {
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

        mostrarMensaje(t("admin.messages.successDisableUserMessage"), "green");
      } else {
        console.error(
          t("admin.messages.errorDisableUserBackend"),
          response.statusText
        );
        mostrarMensaje(t("admin.messages.errorDisableUserMessage"), "red");
      }
    } catch (error) {
      console.error(t("admin.messages.errorDisableUser"), error);
      mostrarMensaje(t("admin.messages.errorDisableUserMessage"), "red");
    }
  };

  // Función para paginar los usuarios
  const getPaginatedUsers = (users) => {
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    return users.slice(indexOfFirstUser, indexOfLastUser);
  };

  // Componente de paginación
  const Pagination = ({ totalUsers }) => {
    const pageNumbers = [];

    for (let i = 1; i <= Math.ceil(totalUsers / usersPerPage); i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex justify-center mt-4 mb-6">
        <nav className="flex items-center">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 mx-1 rounded border bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            {t("admin.buttons.previous")}
          </button>

          <div className="flex space-x-1 mx-2">
            {pageNumbers.map((number) => (
              <button
                key={number}
                onClick={() => setCurrentPage(number)}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentPage === number
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {number}
              </button>
            ))}
          </div>

          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(
                  prev + 1,
                  Math.ceil(aplicarFiltro().length / usersPerPage)
                )
              )
            }
            disabled={
              currentPage === Math.ceil(aplicarFiltro().length / usersPerPage)
            }
            className="px-3 py-2 mx-1 rounded border bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            {t("admin.buttons.next")}
          </button>
        </nav>
      </div>
    );
  };
  const uniqueEmpresas = [
    ...new Set(usuarios.map((usuario) => usuario.empresa)),
  ];

  // Renderizado condicional del encabezado de columna para mostrar el orden
  const renderColumnHeader = (column, label) => {
    return (
      <th
        onClick={() => handleSort(column)}
        className="bg-grey-lightest font-bold uppercase text-sm text-grey-light border-b border-grey-light text-left px-4 py-2 cursor-pointer"
      >
        <div className="flex items-center">
          {label}
          {sortColumn === column && (
            <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
          )}
        </div>
      </th>
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-8">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          {t("admin.titles.pageTitle")}
        </h1>

        {/* Mensaje de notificación */}
        {mensaje && (
          <div
            className={`p-4 mb-4 rounded-md ${
              mensajeEstilo.color === "red"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {mensaje}
          </div>
        )}

        {/* Pestañas de navegación */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-3 px-6 ${
              activeTab === "usuarios"
                ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("usuarios")}
          >
            <FontAwesomeIcon icon={faUsers} className="mr-2" />
            {t("admin.tabs.users")}
          </button>
          <button
            className={`py-3 px-6 ${
              activeTab === "licencias"
                ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("licencias")}
          >
            <FontAwesomeIcon icon={faFileInvoiceDollar} className="mr-2" />
            {t("admin.tabs.licenses")}
          </button>
        </div>

        {activeTab === "usuarios" && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Cabecera con buscador y filtros */}
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex flex-wrap justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-700 mb-3 sm:mb-0">
                  <FontAwesomeIcon
                    icon={faUserShield}
                    className="mr-2 text-blue-500"
                  />
                  {t("admin.titles.userManagement")}
                </h2>

                <div className="flex flex-col md:flex-row md:items-center md:space-x-4 w-full md:w-auto">
                  <div className="relative mb-3 md:mb-0">
                    <input
                      type="text"
                      placeholder={t("admin.search")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full md:w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setFiltroSeleccionado("todos")}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        filtroSeleccionado === "todos"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {t("admin.buttons.all")}
                    </button>
                    <button
                      onClick={() => setFiltroSeleccionado("conNumero")}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        filtroSeleccionado === "conNumero"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {t("admin.buttons.licensed")}
                    </button>
                    <button
                      onClick={() => setFiltroSeleccionado("sinNumero")}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        filtroSeleccionado === "sinNumero"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {t("admin.buttons.unlicensed")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Tabla de usuarios */}
            <div className="overflow-x-auto rounded-lg shadow">
              <table className="w-full table-auto text-sm">
                <thead>
                  <tr className="text-xs text-white uppercase bg-blue-600">
                    <th className="px-4 py-3 text-center">#</th>
                    {renderColumnHeader("nombre", t("admin.nameAndSurname"))}
                    {renderColumnHeader("email", t("admin.email"))}
                    {renderColumnHeader("empresa", t("admin.company"))}
                    {renderColumnHeader("telefono", t("admin.phone"))}
                    <th className="px-4 py-3 text-center">PS</th>
                    <th className="px-4 py-3 text-center">PD</th>
                    <th className="px-4 py-3 text-center">PDS</th>
                    <th className="px-4 py-3 text-center">PT</th>{" "}
                    {/* Nueva columna para PT */}
                    <th className="px-4 py-3 text-center">
                      {t("admin.start")}
                    </th>
                    <th className="px-4 py-3 text-center">{t("admin.end")}</th>
                    <th className="px-4 py-3 text-center">
                      {t("admin.planType")}
                    </th>
                    <th className="px-4 py-3 text-center">
                      {t("admin.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedUsers(aplicarFiltro()).map((usuario, index) => (
                    <tr
                      key={usuario.id}
                      className={`${
                        modoEdicion && usuarioEditado.id === usuario.id
                          ? "bg-blue-50"
                          : index % 2 === 0
                          ? "bg-white"
                          : "bg-gray-50"
                      } border-b hover:bg-gray-100 transition-colors duration-150`}
                    >
                      {/* Columna de numeración */}
                      <td className="px-4 py-3 text-center font-medium text-gray-700">
                        {(currentPage - 1) * usersPerPage + index + 1}
                      </td>
                      {/* Nombre y Apellido */}
                      <td className="px-4 py-3">
                        {modoEdicion && usuarioEditado.id === usuario.id ? (
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={usuarioEditado.nombre}
                              onChange={(e) =>
                                setUsuarioEditado({
                                  ...usuarioEditado,
                                  nombre: e.target.value,
                                })
                              }
                              className="w-1/2 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              value={usuarioEditado.apellido}
                              onChange={(e) =>
                                setUsuarioEditado({
                                  ...usuarioEditado,
                                  apellido: e.target.value,
                                })
                              }
                              className="w-1/2 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        ) : (
                          <div className="font-medium text-gray-900">
                            {usuario.nombre} {usuario.apellido}
                          </div>
                        )}
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 max-w-[200px] truncate">
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
                            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            readOnly
                            title={usuario.email}
                          />
                        ) : (
                          <div
                            className="text-gray-600 text-sm truncate"
                            title={usuario.email}
                          >
                            {usuario.email}
                          </div>
                        )}
                      </td>

                      {/* Empresa */}
                      <td className="px-4 py-3">
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
                            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="text-gray-700">{usuario.empresa}</div>
                        )}
                      </td>

                      {/* Teléfono */}
                      <td className="px-4 py-3">
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
                            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="text-gray-700">
                            {usuario.telefono}
                          </div>
                        )}
                      </td>

                      {/* PS */}
                      <td className="px-4 py-3 text-center">
                        {modoEdicion && usuarioEditado.id === usuario.id ? (
                          <input
                            type="number"
                            value={usuarioEditado.ps}
                            onChange={(e) =>
                              setUsuarioEditado({
                                ...usuarioEditado,
                                ps: e.target.value,
                              })
                            }
                            className="w-16 px-2 py-1 text-sm text-center border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="inline-flex items-center justify-center bg-blue-100 text-blue-800 text-sm font-semibold w-8 h-8 rounded-full">
                            {usuario.ps || 0}
                          </div>
                        )}
                      </td>
                      {/* PD */}
                      <td className="px-4 py-3 text-center">
                        {modoEdicion && usuarioEditado.id === usuario.id ? (
                          <input
                            type="number"
                            min="0"
                            max="99" // Cambiado de 1 a 99 para permitir múltiples pantallas directorio
                            value={usuarioEditado.pd}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Eliminamos la restricción para permitir más de 1 pantalla directorio
                              setUsuarioEditado({
                                ...usuarioEditado,
                                pd: value,
                              });
                            }}
                            className="w-16 px-2 py-1 text-sm text-center border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="inline-flex items-center justify-center bg-green-100 text-green-800 text-sm font-semibold w-8 h-8 rounded-full">
                            {usuario.pd || 0}
                          </div>
                        )}
                      </td>

                      {/* PDS */}
                      <td className="px-4 py-3 text-center">
                        {modoEdicion && usuarioEditado.id === usuario.id ? (
                          <input
                            type="number"
                            value={usuarioEditado.pservice}
                            onChange={(e) =>
                              setUsuarioEditado({
                                ...usuarioEditado,
                                pservice: e.target.value,
                              })
                            }
                            className="w-16 px-2 py-1 text-sm text-center border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="inline-flex items-center justify-center bg-purple-100 text-purple-800 text-sm font-semibold w-8 h-8 rounded-full">
                            {usuario.pservice || 0}
                          </div>
                        )}
                      </td>

                      {/* PT - Nueva celda para pantallas de tarifario */}
                      <td className="px-4 py-3 text-center">
                        {modoEdicion && usuarioEditado.id === usuario.id ? (
                          <input
                            type="number"
                            min="0"
                            value={usuarioEditado.pt}
                            onChange={(e) =>
                              setUsuarioEditado({
                                ...usuarioEditado,
                                pt: e.target.value,
                              })
                            }
                            className="w-16 px-2 py-1 text-sm text-center border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="inline-flex items-center justify-center bg-amber-100 text-amber-800 text-sm font-semibold w-8 h-8 rounded-full">
                            {usuario.pt || 0}
                          </div>
                        )}
                      </td>
                      {/* Inicio */}
                      <td className="px-4 py-3 text-center">
                        {modoEdicion && usuarioEditado.id === usuario.id ? (
                          <input
                            type="date"
                            value={usuarioEditado.inicio}
                            onChange={(e) =>
                              setUsuarioEditado({
                                ...usuarioEditado,
                                inicio: e.target.value,
                              })
                            }
                            className="w-32 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="text-gray-700 whitespace-nowrap">
                            {usuario.inicio}
                          </div>
                        )}
                      </td>

                      {/* Final */}
                      <td className="px-4 py-3 text-center">
                        {modoEdicion && usuarioEditado.id === usuario.id ? (
                          <input
                            type="date"
                            value={usuarioEditado.final}
                            onChange={(e) =>
                              setUsuarioEditado({
                                ...usuarioEditado,
                                final: e.target.value,
                              })
                            }
                            className="w-32 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="text-gray-700 whitespace-nowrap">
                            {usuario.final}
                          </div>
                        )}
                      </td>

                      {/* Tipo Plan */}
                      <td className="px-4 py-3 text-center">
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
                            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              usuario.tipoPlan?.toLowerCase() === "premium"
                                ? "bg-yellow-100 text-yellow-800"
                                : usuario.tipoPlan?.toLowerCase() === "test"
                                ? "bg-indigo-100 text-indigo-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {usuario.tipoPlan || "—"}
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-3">
                        <div className="flex justify-center space-x-1">
                          {modoEdicion && usuarioEditado.id === usuario.id ? (
                            <>
                              <button
                                onClick={handleGuardarCambios}
                                className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-md transition-colors"
                                title={t("admin.buttons.save")}
                              >
                                <FontAwesomeIcon icon={faSave} />
                              </button>
                              <button
                                onClick={() => setModoEdicion(false)}
                                className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-md transition-colors"
                                title={t("admin.buttons.cancel")}
                              >
                                <FontAwesomeIcon icon={faTimes} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditar(usuario)}
                                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition-colors"
                                title={t("admin.buttons.edit")}
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button
                                onClick={() =>
                                  handleEliminarUsuario(usuario.id)
                                }
                                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md transition-colors"
                                title={t("admin.buttons.delete")}
                              >
                                <FontAwesomeIcon icon={faTrashAlt} />
                              </button>
                              {usuario.status ? (
                                <button
                                  onClick={() =>
                                    handleDeshabilitarUsuario(usuario.id)
                                  }
                                  className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-md transition-colors"
                                  title={t("admin.buttons.disable")}
                                >
                                  <FontAwesomeIcon icon={faToggleOn} />
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleHabilitarUsuario(usuario.id)
                                  }
                                  className="bg-teal-500 hover:bg-teal-600 text-white p-2 rounded-md transition-colors"
                                  title={t("admin.buttons.enable")}
                                >
                                  <FontAwesomeIcon icon={faToggleOff} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {aplicarFiltro().length > 0 && (
              <Pagination totalUsers={aplicarFiltro().length} />
            )}
            {aplicarFiltro().length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FontAwesomeIcon icon={faFilter} className="text-4xl mb-2" />
                <p>{t("admin.messages.noUsersFound")}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "licencias" && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-6">
                <FontAwesomeIcon
                  icon={faFileInvoiceDollar}
                  className="mr-2 text-blue-500"
                />
                {t("admin.titles.licenses")}
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("admin.selectCompany")}
                </label>
                <select
                  className="w-full md:w-96 bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedEmpresa}
                  onChange={async (e) => {
                    setSelectedEmpresa(e.target.value);

                    try {
                      // Hacer consulta a la colección "DatosFiscales" en base a la empresa seleccionada
                      const datosFiscalesCollection = collection(
                        db,
                        "DatosFiscales"
                      );
                      const q = query(
                        datosFiscalesCollection,
                        where("empresa", "==", e.target.value)
                      );
                      const querySnapshot = await getDocs(q);

                      if (!querySnapshot.empty) {
                        // Extraer los datos fiscales de la empresa seleccionada
                        const selectedCompany = querySnapshot.docs[0].data();

                        // Actualizar el estado con los datos fiscales obtenidos
                        setEmpresaSeleccionada(selectedCompany);
                        setDatosFiscalesEditados({
                          codigoPostal: selectedCompany.codigoPostal || "",
                          email: selectedCompany.email || "",
                          razonSocial: selectedCompany.razonSocial || "",
                          regimenFiscal: selectedCompany.regimenFiscal || "",
                          rfc: selectedCompany.rfc || "",
                          usoCdfi: selectedCompany.usoCdfi || "",
                          empresa: selectedCompany.empresa || "",
                        });
                      } else {
                        // Si no se encuentran datos fiscales, mostrar campos vacíos
                        setEmpresaSeleccionada({});
                        setDatosFiscalesEditados({
                          codigoPostal: "",
                          email: "",
                          razonSocial: "",
                          regimenFiscal: "",
                          rfc: "",
                          usoCdfi: "",
                          empresa: e.target.value, // Mantener el nombre de la empresa seleccionada
                        });
                      }
                    } catch (error) {
                      // Si hay un error, mostrar los campos vacíos también
                      setEmpresaSeleccionada({});
                      setDatosFiscalesEditados({
                        codigoPostal: "",
                        email: "",
                        razonSocial: "",
                        regimenFiscal: "",
                        rfc: "",
                        usoCdfi: "",
                        empresa: e.target.value, // Mantener el nombre de la empresa seleccionada
                      });
                    }
                  }}
                >
                  <option value="">{t("admin.selectCompany")}</option>
                  {uniqueEmpresas.map((empresa, index) => (
                    <option key={index} value={empresa}>
                      {empresa}
                    </option>
                  ))}
                </select>
              </div>

              {selectedEmpresa && (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">
                    {t("admin.fiscalData")}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("admin.rfc")}
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                          placeholder={t("admin.companyName")}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                          placeholder={t("admin.postalCode")}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                          placeholder={t("admin.fiscalRegime")}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                          placeholder={t("admin.cdfiUsage")}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("admin.email")}
                        </label>
                        <input
                          type="email"
                          value={datosFiscalesEditados.email}
                          onChange={(e) =>
                            setDatosFiscalesEditados({
                              ...datosFiscalesEditados,
                              email: e.target.value,
                            })
                          }
                          placeholder={t("admin.email")}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end space-x-3">
                    <button
                      onClick={handleGuardarCambiosDatosFiscales}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      {t("admin.buttons.saveChanges")}
                    </button>
                    <button
                      onClick={() =>
                        handleEliminarDatosFiscales(datosFiscalesEditados.id)
                      }
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      {t("admin.buttons.delete")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
