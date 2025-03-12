import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/storage";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import storage from "@/firebase/storage";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import {
  CalendarIcon,
  ClockIcon,
  BookmarkIcon,
  TrashIcon,
  PencilSquareIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/20/solid";

function ConsultaModEvento() {
  // Mock translation function if i18n is not set up
  const {
    t = (key) => {
      const translations = {
        "consultaModEventos.title": "Event Query",
        "consultaModEventos.viewAll": "View All",
        "consultaModEventos.selectCompany": "Select Company",
        "consultaModEventos.search": "Search events...",
        "consultaModEventos.activeEvents": "Active Events",
        "consultaModEventos.finishedEvents": "Finished Events",
        "consultaModEventos.showing": "Showing",
        "consultaModEventos.of": "of",
        "consultaModEventos.events": "events",
        "consultaModEventos.rowsPerPage": "Rows per page:",
        "consultaModEventos.user": "User",
        "consultaModEventos.name": "Name",
        "consultaModEventos.type": "Type",
        "consultaModEventos.roomName": "Room Name",
        "consultaModEventos.dates": "Dates",
        "consultaModEventos.roomTime": "Room Time",
        "consultaModEventos.actions": "Actions",
        "consultaModEventos.noMatchingEvents": "No matching events found",
        "consultaModEventos.noActiveEvents": "No active events found",
        "consultaModEventos.noFinishedEvents": "No finished events found",
        "consultaModEventos.noScreens": "No screens assigned",
        "consultaModEventos.viewEdit": "View/Edit",
        "consultaModEventos.delete": "Delete",
        "consultaModEventos.editEvent": "Edit Event",
        "consultaModEventos.eventName": "Event Name",
        "consultaModEventos.eventType": "Event Type",
        "consultaModEventos.eventLocation": "Event Location",
        "consultaModEventos.eventDescription": "Event Description",
        "consultaModEventos.startDate": "Start Date",
        "consultaModEventos.endDate": "End Date",
        "consultaModEventos.eventSchedule": "Event Schedule",
        "consultaModEventos.realStartTime": "Real Start Time",
        "consultaModEventos.realEndTime": "Real End Time",
        "consultaModEventos.screenSchedule": "Screen Schedule",
        "consultaModEventos.roomStartTime": "Room Start Time",
        "consultaModEventos.roomEndTime": "Room End Time",
        "consultaModEventos.eventImages": "Event Images",
        "consultaModEventos.selectedDevices": "Selected Devices",
        "consultaModEventos.saveChanges": "Save Changes",
        "consultaModEventos.close": "Close",
        "consultaModEventos.confirmDelete": "Confirm Delete",
        "consultaModEventos.deleteWarning":
          "Are you sure you want to delete this event? This action cannot be undone.",
        "consultaModEventos.cancel": "Cancel",
        "consultaModEventos.page": "Page",
        "consultaModEventos.previous": "Previous",
        "consultaModEventos.next": "Next",
      };
      return translations[key] || key;
    },
  } = useTranslation();
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
  const [empresas, setEmpresas] = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);

  // Estados nuevos para las funcionalidades mejoradas
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [showTooltip, setShowTooltip] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage, setEventsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const empresasSnapshot = await firebase
          .firestore()
          .collection("usuarios")
          .get();
        const empresasData = empresasSnapshot.docs.map((doc) => ({
          value: doc.data().empresa,
          label: doc.data().empresa,
        }));
        // Eliminar duplicados de empresas
        const uniqueEmpresas = empresasData.filter(
          (empresa, index, self) =>
            index ===
            self.findIndex(
              (t) => t.value === empresa.value && t.label === empresa.label
            )
        );
        setEmpresas(uniqueEmpresas);
      } catch (error) {
        console.error("Error al obtener las empresas:", error);
      }
    };
    fetchEmpresas();
  }, []);

  const handleEmpresaChange = (selectedOption) => {
    setEmpresaSeleccionada(selectedOption);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Filtrar eventos según la empresa seleccionada
  const eventosFiltradosPorEmpresa = eventos.filter((evento) => {
    if (empresaSeleccionada === null || empresaSeleccionada.value === null) {
      return true; // Mostrar todos los eventos si no hay empresa seleccionada
    } else {
      return evento.empresa === empresaSeleccionada.value;
    }
  });

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
        // Obtener el nombre de la empresa del usuario actual
        const usuarioData = await firebase
          .firestore()
          .collection("usuarios")
          .doc(user.uid)
          .get();
        const empresaUsuario = usuarioData.data().empresa;

        eventosRef = firebase
          .firestore()
          .collection("eventos")
          .where("empresa", "==", empresaUsuario);
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
          const imagenRef = ref(
            storage,
            decodeURIComponent(imagen.split("/o/")[1].split("?alt=media")[0])
          );

          try {
            await deleteObject(imagenRef);
          } catch (error) {
            console.warn(`Error al eliminar imagen: ${error.message}`);
          }
        });
      }

      setConfirmDelete(null);
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
              // Extraer el path relativo del archivo desde la URL
              const path = decodeURIComponent(
                imagen.split("/o/")[1].split("?alt=media")[0]
              );

              // Crear la referencia al archivo en Firebase Storage
              const imagenRef = ref(storage, path);

              try {
                // Verificar si la imagen existe antes de intentar eliminarla
                //await imagenRef.getMetadata();

                // Si la imagen existe, entonces eliminarla
                await deleteObject(imagenRef);
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

      const storageRef = ref(storage, `imagenes/${uniqueName}`);

      try {
        const snapshot = await uploadBytes(storageRef, nuevaImagen);
        const url = await getDownloadURL(snapshot.ref);
        setImagenesEvento((prev) => [...prev, url]);
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

  // Nueva funcionalidad: búsqueda, ordenamiento y confirmación de eliminación
  const filteredEvents = eventosFiltradosPorEmpresa.filter((evento) => {
    // First filter by active/finished status
    if (filtro === "activos") {
      if (evento.status !== true) return false;
    } else if (filtro === "finalizados") {
      if (evento.status !== false) return false;
    }

    // Then filter by search term
    if (!searchTerm) return true;

    const searchableFields = [
      evento.nombreEvento,
      evento.tipoEvento,
      evento.lugar,
      ...(evento.devices || []),
    ];

    return searchableFields.some(
      (field) =>
        field &&
        field.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Sorting functionality
  const sortedEvents = React.useMemo(() => {
    let sortableItems = [...filteredEvents];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (sortConfig.key === "usuario") {
          const usuarioA = usuarios.find((usuario) => usuario.id === a.userId);
          const usuarioB = usuarios.find((usuario) => usuario.id === b.userId);
          const valA = usuarioA?.nombre || "";
          const valB = usuarioB?.nombre || "";

          if (valA < valB) {
            return sortConfig.direction === "ascending" ? -1 : 1;
          }
          if (valA > valB) {
            return sortConfig.direction === "ascending" ? 1 : -1;
          }
          return 0;
        } else {
          let valA = a[sortConfig.key] || "";
          let valB = b[sortConfig.key] || "";

          if (
            sortConfig.key === "fechaInicio" ||
            sortConfig.key === "fechaFinal"
          ) {
            valA = new Date(valA);
            valB = new Date(valB);
          }

          if (valA < valB) {
            return sortConfig.direction === "ascending" ? -1 : 1;
          }
          if (valA > valB) {
            return sortConfig.direction === "ascending" ? 1 : -1;
          }
          return 0;
        }
      });
    } else {
      // Default sort by user first, then by end date
      sortableItems.sort((a, b) => {
        const usuarioA = usuarios.find((usuario) => usuario.id === a.userId);
        const usuarioB = usuarios.find((usuario) => usuario.id === b.userId);
        const ordenPorUsuario =
          usuarioA?.nombre?.localeCompare(usuarioB?.nombre) || 0;

        if (ordenPorUsuario === 0) {
          const fechaHoraFinalA = new Date(
            `${a.fechaFinal}T${a.horaFinalSalon}`
          );
          const fechaHoraFinalB = new Date(
            `${b.fechaFinal}T${b.horaFinalSalon}`
          );
          return fechaHoraFinalA - fechaHoraFinalB;
        }

        return ordenPorUsuario;
      });
    }
    return sortableItems;
  }, [filteredEvents, sortConfig, usuarios]);

  // Calculate pagination
  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(sortedEvents.length / eventsPerPage)));
    // If current page is greater than total pages, reset to page 1
    if (currentPage > Math.ceil(sortedEvents.length / eventsPerPage)) {
      setCurrentPage(1);
    }
  }, [sortedEvents, eventsPerPage, currentPage]);

  // Get current events for the page
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = sortedEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Previous page
  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? " ↑" : " ↓";
  };

  const handleDeleteClick = (eventoId) => {
    setConfirmDelete(eventoId);
  };

  const confirmDeleteAction = () => {
    if (confirmDelete) {
      eliminarEvento(confirmDelete);
    }
  };

  const cancelDeleteAction = () => {
    setConfirmDelete(null);
  };

  const handleRowsPerPageChange = (e) => {
    setEventsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <section className="pl-4 md:pl-10 pr-4 md:pr-10 py-6 max-w-full overflow-hidden">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-4 md:mb-0">
            {t("consultaModEventos.title")}
          </h1>

          {/* Admin company selector */}
          {user &&
            (user.email === "uppermex10@gmail.com" ||
              user.email === "ulises.jacobo@hotmail.com" ||
              user.email === "contacto@upperds.mx") && (
              <div className="w-full md:w-64 mb-4 md:mb-0 md:ml-4">
                <Select
                  options={[
                    { value: null, label: t("consultaModEventos.viewAll") },
                    ...empresas,
                  ]}
                  onChange={handleEmpresaChange}
                  value={empresaSeleccionada}
                  placeholder={t("consultaModEventos.selectCompany")}
                  className="text-sm"
                />
              </div>
            )}
        </div>

        {/* Search and filter controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center mb-6 space-y-4 md:space-y-0">
          <div className="relative w-full md:w-64 mr-0 md:mr-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder={t("consultaModEventos.search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setFiltro("activos")}
              className={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                filtro === "activos"
                  ? "bg-blue-600 text-white shadow-md hover:bg-blue-700 focus:ring-blue-500"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500"
              }`}
            >
              {t("consultaModEventos.activeEvents")}
            </button>
            <button
              onClick={() => setFiltro("finalizados")}
              className={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                filtro === "finalizados"
                  ? "bg-red-600 text-white shadow-md hover:bg-red-700 focus:ring-red-500"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500"
              }`}
            >
              {t("consultaModEventos.finishedEvents")}
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-600 mb-4">
          {t("consultaModEventos.showing")} {sortedEvents.length}{" "}
          {t("consultaModEventos.events")}
        </div>

        {/* Table container with horizontal scroll for mobile */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                {(usuarioLogeado === "uppermex10@gmail.com" ||
                  usuarioLogeado === "ulises.jacobo@hotmail.com" ||
                  usuarioLogeado === "contacto@upperds.mx") && (
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort("usuario")}
                  >
                    {t("consultaModEventos.user")}
                    {getSortIndicator("usuario")}
                  </th>
                )}
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  #
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort("nombreEvento")}
                >
                  {t("consultaModEventos.name")}
                  {getSortIndicator("nombreEvento")}
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort("tipoEvento")}
                >
                  {t("consultaModEventos.type")}
                  {getSortIndicator("tipoEvento")}
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("consultaModEventos.roomName")}
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort("fechaInicio")}
                >
                  {t("consultaModEventos.dates")}
                  {getSortIndicator("fechaInicio")}
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("consultaModEventos.roomTime")}
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("consultaModEventos.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedEvents.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      usuarioLogeado === "uppermex10@gmail.com" ||
                      usuarioLogeado === "ulises.jacobo@hotmail.com" ||
                      usuarioLogeado === "contacto@upperds.mx"
                        ? 8
                        : 7
                    }
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    {searchTerm
                      ? t("consultaModEventos.noMatchingEvents")
                      : filtro === "activos"
                      ? t("consultaModEventos.noActiveEvents")
                      : t("consultaModEventos.noFinishedEvents")}
                  </td>
                </tr>
              ) : (
                currentEvents.map((evento, index) => {
                  const usuario = usuarios.find(
                    (usuario) => usuario.id === evento.userId
                  );

                  return (
                    <tr
                      key={evento.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      {(usuarioLogeado === "uppermex10@gmail.com" ||
                        usuarioLogeado === "ulises.jacobo@hotmail.com" ||
                        usuarioLogeado === "contacto@upperds.mx") && (
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {usuario ? usuario.empresa : "N/A"}
                        </td>
                      )}

                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {indexOfFirstEvent + index + 1}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {modoEdicion && evento.id === eventoEditado?.id ? (
                          <input
                            type="text"
                            value={eventoEditado.nombreEvento}
                            onChange={(e) =>
                              handleFieldEdit("nombreEvento", e.target.value)
                            }
                            className="w-full px-2 py-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        ) : (
                          <div
                            className="relative"
                            onMouseEnter={() =>
                              evento.nombreEvento.length > 15 &&
                              setShowTooltip(`nombre-${evento.id}`)
                            }
                            onMouseLeave={() => setShowTooltip(null)}
                          >
                            <span>
                              {eventoEditado?.id === evento.id
                                ? eventoEditado.nombreEvento.length > 15
                                  ? eventoEditado.nombreEvento.substring(
                                      0,
                                      15
                                    ) + "..."
                                  : eventoEditado.nombreEvento
                                : evento.nombreEvento.length > 15
                                ? evento.nombreEvento.substring(0, 15) + "..."
                                : evento.nombreEvento}
                            </span>
                            {showTooltip === `nombre-${evento.id}` &&
                              evento.nombreEvento.length > 15 && (
                                <div className="absolute z-10 p-2 bg-gray-800 text-white text-xs rounded shadow-lg">
                                  {evento.nombreEvento}
                                </div>
                              )}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {modoEdicion && evento.id === eventoEditado?.id ? (
                          <input
                            type="text"
                            value={eventoEditado.tipoEvento || ""}
                            onChange={(e) =>
                              handleFieldEdit("tipoEvento", e.target.value)
                            }
                            className="w-full px-2 py-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        ) : (
                          <div
                            className="relative"
                            onMouseEnter={() =>
                              evento.tipoEvento?.length > 15 &&
                              setShowTooltip(`tipo-${evento.id}`)
                            }
                            onMouseLeave={() => setShowTooltip(null)}
                          >
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
                            {showTooltip === `tipo-${evento.id}` &&
                              evento.tipoEvento?.length > 15 && (
                                <div className="absolute z-10 p-2 bg-gray-800 text-white text-xs rounded shadow-lg">
                                  {evento.tipoEvento}
                                </div>
                              )}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4 whitespace-normal max-w-xs text-sm text-gray-900">
                        {modoEdicion && evento.id === eventoEditado?.id ? (
                          <input
                            type="text"
                            value={eventoEditado.devices || ""}
                            onChange={(e) =>
                              handleFieldEdit("devices", e.target.value)
                            }
                            className="w-full px-2 py-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        ) : eventoEditado?.id === evento.id ? (
                          eventoEditado.devices
                        ) : (
                          <div className="max-h-20 overflow-y-auto">
                            {evento.devices.length === 0 ? (
                              <span className="text-red-500 italic">
                                {t("consultaModEventos.noScreens")}
                              </span>
                            ) : (
                              <div className="space-y-1">
                                {evento.devices.map((device, key) => (
                                  <div
                                    key={key}
                                    className="text-sm text-gray-700 bg-gray-100 rounded px-2 py-1 inline-block mr-1 mb-1"
                                  >
                                    {device}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {modoEdicion &&
                        evento.id === eventoEditado?.id &&
                        edicionFechas ? (
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <CalendarIcon className="text-gray-400 mr-2 h-5" />
                              <input
                                type="date"
                                value={eventoEditado.fechaInicio || ""}
                                onChange={(e) =>
                                  handleFieldEdit("fechaInicio", e.target.value)
                                }
                                className="w-full px-2 py-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>
                            <div className="flex items-center">
                              <CalendarIcon className="text-gray-400 mr-2 h-5" />
                              <input
                                type="date"
                                value={eventoEditado.fechaFinal || ""}
                                onChange={(e) =>
                                  handleFieldEdit("fechaFinal", e.target.value)
                                }
                                className="w-full px-2 py-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            {evento.fechaInicio === evento.fechaFinal ? (
                              <div className="flex items-center">
                                <CalendarIcon className="text-gray-400 mr-2 h-5" />
                                <span>{evento.fechaInicio}</span>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center">
                                  <CalendarIcon className="text-gray-400 mr-2 h-5" />
                                  <span>{evento.fechaInicio}</span>
                                </div>
                                <div className="flex items-center mt-1">
                                  <CalendarIcon className="text-gray-400 mr-2 h-5" />
                                  <span>{evento.fechaFinal}</span>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          {modoEdicion && evento.id === eventoEditado?.id ? (
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <ClockIcon className="text-gray-400 mr-2 h-5" />
                                <input
                                  type="time"
                                  value={eventoEditado.horaInicialSalon || ""}
                                  onChange={(e) =>
                                    handleFieldEdit(
                                      "horaInicialSalon",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-2 py-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                />
                              </div>
                              <div className="flex items-center">
                                <ClockIcon className="text-gray-400 mr-2 h-5" />
                                <input
                                  type="time"
                                  value={eventoEditado.horaFinalSalon || ""}
                                  onChange={(e) =>
                                    handleFieldEdit(
                                      "horaFinalSalon",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-2 py-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                />
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center">
                                <ClockIcon className="text-gray-400 mr-2 h-5" />
                                <span>{evento.horaInicialSalon}</span>
                              </div>
                              <div className="flex items-center mt-1">
                                <ClockIcon className="text-gray-400 mr-2 h-5" />
                                <span>{evento.horaFinalSalon}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        <div className="flex flex-wrap justify-center gap-2">
                          <button
                            onClick={() => abrirModalEdicion(evento)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            title={t("consultaModEventos.viewEdit")}
                          >
                            <PencilSquareIcon className="mr-1" />
                            <span className="hidden sm:inline">
                              {t("consultaModEventos.viewEdit")}
                            </span>
                          </button>

                          <button
                            onClick={() => handleDeleteClick(evento.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            title={t("consultaModEventos.delete")}
                          >
                            <TrashIcon className="mr-1" />
                            <span className="hidden sm:inline">
                              {t("consultaModEventos.delete")}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {sortedEvents.length > 0 && (
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-3 sm:mb-0">
              <button
                onClick={previousPage}
                disabled={currentPage === 1}
                className={`flex items-center justify-center p-2 rounded-md ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>

              <div className="flex space-x-1">
                {/* First page button */}
                {currentPage > 2 && (
                  <button
                    onClick={() => paginate(1)}
                    className="px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    1
                  </button>
                )}

                {/* Ellipsis for skipped pages */}
                {currentPage > 3 && (
                  <span className="px-3 py-1 text-gray-500">...</span>
                )}

                {/* Previous page number if not first page */}
                {currentPage > 1 && (
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    className="px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    {currentPage - 1}
                  </button>
                )}

                {/* Current page */}
                <button className="px-3 py-1 rounded-md bg-blue-600 text-white">
                  {currentPage}
                </button>

                {/* Next page number if not last page */}
                {currentPage < totalPages && (
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    className="px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    {currentPage + 1}
                  </button>
                )}

                {/* Ellipsis for skipped pages */}
                {currentPage < totalPages - 2 && (
                  <span className="px-3 py-1 text-gray-500">...</span>
                )}

                {/* Last page button */}
                {currentPage < totalPages - 1 && totalPages > 1 && (
                  <button
                    onClick={() => paginate(totalPages)}
                    className="px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    {totalPages}
                  </button>
                )}
              </div>

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`flex items-center justify-center p-2 rounded-md ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Edit Event Modal */}
        {modalAbierto && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6 flex items-center">
                        <PencilSquareIcon className="mr-2 h-5" />{" "}
                        {t("consultaModEventos.editEvent")}
                      </h3>

                      <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Left column */}
                          <div>
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t("consultaModEventos.eventName")}
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>

                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t("consultaModEventos.eventType")}
                              </label>
                              <input
                                type="text"
                                value={eventoEditado?.tipoEvento || ""}
                                onChange={(e) =>
                                  handleFieldEdit("tipoEvento", e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>

                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t("consultaModEventos.eventLocation")}
                              </label>
                              <input
                                type="text"
                                value={eventoEditado?.lugar || ""}
                                onChange={(e) =>
                                  handleFieldEdit("lugar", e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>

                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t("consultaModEventos.eventDescription")} (
                                {255 -
                                  (eventoEditado?.description || "").length}
                                )
                              </label>
                              <textarea
                                value={eventoEditado?.description || ""}
                                onChange={(e) => {
                                  handleFieldEdit(
                                    "description",
                                    e.target.value
                                  );
                                  setDescription(e.target.value);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                rows={4}
                                maxLength={255}
                              />
                            </div>
                          </div>

                          {/* Right column */}
                          <div>
                            <div className="mb-4 grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  {t("consultaModEventos.startDate")}
                                </label>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <CalendarIcon className="text-gray-400" />
                                  </div>
                                  <input
                                    type="date"
                                    value={eventoEditado?.fechaInicio || ""}
                                    onChange={(e) =>
                                      handleFieldEdit(
                                        "fechaInicio",
                                        e.target.value
                                      )
                                    }
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  {t("consultaModEventos.endDate")}
                                </label>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <CalendarIcon className="text-gray-400" />
                                  </div>
                                  <input
                                    type="date"
                                    value={eventoEditado?.fechaFinal || ""}
                                    onChange={(e) =>
                                      handleFieldEdit(
                                        "fechaFinal",
                                        e.target.value
                                      )
                                    }
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-700 mb-2 border-b pb-1">
                                {t("consultaModEventos.eventSchedule")}
                              </h4>

                              <div className="grid grid-cols-2 gap-4 mb-2">
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">
                                    {t("consultaModEventos.realStartTime")}
                                  </label>
                                  <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <ClockIcon className="text-gray-400" />
                                    </div>
                                    <input
                                      type="time"
                                      value={horaInicialReal}
                                      onChange={(e) =>
                                        setHoraInicialReal(e.target.value)
                                      }
                                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">
                                    {t("consultaModEventos.realEndTime")}
                                  </label>
                                  <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <ClockIcon className="text-gray-400" />
                                    </div>
                                    <input
                                      type="time"
                                      value={horaFinalReal}
                                      onChange={(e) =>
                                        setHoraFinalReal(e.target.value)
                                      }
                                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-700 mb-2 border-b pb-1">
                                {t("consultaModEventos.screenSchedule")}
                              </h4>

                              <div className="grid grid-cols-2 gap-4 mb-2">
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">
                                    {t("consultaModEventos.roomStartTime")}
                                  </label>
                                  <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <ClockIcon className="text-gray-400" />
                                    </div>
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
                                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">
                                    {t("consultaModEventos.roomEndTime")}
                                  </label>
                                  <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <ClockIcon className="text-gray-400" />
                                    </div>
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
                                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t("consultaModEventos.eventImages")}
                              </label>

                              <div className="flex flex-wrap gap-3 mt-2">
                                {imagenesEvento.map((imagen, index) => (
                                  <div key={index} className="relative group">
                                    <img
                                      src={imagen}
                                      alt={`Imagen ${index + 1}`}
                                      className="h-24 w-24 object-cover rounded-lg border border-gray-300"
                                    />
                                    <button
                                      onClick={() => eliminarImagen(index)}
                                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                      title={t("consultaModEventos.delete")}
                                    >
                                      <TrashIcon size={12} />
                                    </button>
                                  </div>
                                ))}

                                {imagenesEvento.length < 3 && (
                                  <label className="h-24 w-24 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <span className="text-gray-500">+</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={handleImagenChange}
                                      className="hidden"
                                    />
                                  </label>
                                )}
                              </div>
                            </div>

                            <div className="mb-4">
                              <label className="flex items-center text-sm text-gray-700">
                                <input
                                  type="checkbox"
                                  checked={
                                    eventoEditado?.primeraImagen || false
                                  }
                                  onChange={(e) =>
                                    handleFieldEdit(
                                      "primeraImagen",
                                      e.target.checked
                                    )
                                  }
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <span className="ml-2">
                                  Activar Pantalla Completa (1280 x 720 px)
                                </span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Devices selection section */}
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3 border-b pb-1">
                          {t("consultaModEventos.selectedDevices")}
                        </h4>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {pantallas
                            .filter(
                              (usuario) => eventoEditado?.userId === usuario.id
                            )
                            .map((usuario) => {
                              const nombrePantallas =
                                Array.isArray(usuario.nombrePantallas) &&
                                usuario.nombrePantallas.length
                                  ? usuario.nombrePantallas
                                  : typeof usuario.nombrePantallas === "object"
                                  ? Object.values(usuario.nombrePantallas)
                                  : ["N/A"];

                              const nombrePantallasDirectorio =
                                Array.isArray(
                                  usuario.nombrePantallasDirectorio
                                ) && usuario.nombrePantallasDirectorio.length
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
                                      className="flex items-center bg-white p-2 rounded-md border border-gray-200"
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
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                      />
                                      <label
                                        htmlFor={`checkbox-${pantalla}`}
                                        className="ml-2 block text-sm text-gray-900 truncate"
                                        title={pantalla}
                                      >
                                        {pantalla}
                                      </label>
                                    </div>
                                  ))}

                                  {nombrePantallasDirectorio.map(
                                    (pantallaDir) => (
                                      <div
                                        key={`pantallaDir-${pantallaDir}`}
                                        className="flex items-center bg-white p-2 rounded-md border border-gray-200"
                                      >
                                        <input
                                          type="checkbox"
                                          id={`checkbox-${pantallaDir}`}
                                          value={pantallaDir}
                                          checked={eventoEditado?.devices.includes(
                                            pantallaDir
                                          )}
                                          onChange={() =>
                                            handleCheckboxChange(pantallaDir)
                                          }
                                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label
                                          htmlFor={`checkbox-${pantallaDir}`}
                                          className="ml-2 block text-sm text-gray-900 truncate"
                                          title={pantallaDir}
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
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={guardarCambios}
                    className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    <BookmarkIcon className="mr-2 h-5" />
                    {t("consultaModEventos.saveChanges")}
                  </button>
                  <button
                    type="button"
                    onClick={cerrarModal}
                    className="mt-3 w-full inline-flex justify-center items-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    <XMarkIcon className="mr-2" />
                    {t("consultaModEventos.close")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        {confirmDelete && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <TrashIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {t("consultaModEventos.confirmDelete")}
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          {t("consultaModEventos.deleteWarning")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={confirmDeleteAction}
                  >
                    {t("consultaModEventos.delete")}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={cancelDeleteAction}
                  >
                    {t("consultaModEventos.cancel")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default ConsultaModEvento;
