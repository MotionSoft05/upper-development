/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import { useDeviceSync } from "@/hook/useDeviceSync";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import auth from "@/firebase/auth";
import db from "@/firebase/firestore";
import DeviceConfiguration from "./DeviceConfiguration";
import DeviceLinkingModal from "./DeviceLinkingModal";
import { deleteDevice } from "@/utils/deviceManager";
import {
  ComputerDesktopIcon,
  Cog6ToothIcon,
  SignalIcon,
  SignalSlashIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon as ClockIconSolid,
} from "@heroicons/react/24/solid";
import Swal from "sweetalert2";

const DevicesList = () => {
  // ✅ NUEVO: Estados para manejo de empresa
  const [empresas, setEmpresas] = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // ✅ Hook principal - ACTUALIZADO para empresa
  const { devices, userData, user, loading, stats } =
    useDeviceSync(empresaSeleccionada);

  // ✅ Fallback directo a Firebase Auth
  const [authUser, authLoading] = useAuthState(auth);

  // ✅ Usar el usuario que esté disponible
  const currentUser = user || authUser;

  const [selectedFilter, setSelectedFilter] = useState("all");
  const [configurationModalOpen, setConfigurationModalOpen] = useState(false);
  const [linkingModalOpen, setLinkingModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [expandedDevices, setExpandedDevices] = useState(new Set());

  // ✅ NUEVO: Determinar si es admin
  useEffect(() => {
    if (currentUser?.email) {
      const adminEmails = [
        "uppermex10@gmail.com",
        "ulises.jacobo@hotmail.com",
        "contacto@upperds.mx",
      ];
      setIsAdmin(adminEmails.includes(currentUser.email));
    }
  }, [currentUser]);

  // ✅ NUEVO: Cargar empresas disponibles para admin
  useEffect(() => {
    const fetchEmpresas = async () => {
      if (!isAdmin) return;

      try {
        const usuariosRef = collection(db, "usuarios");
        const usuariosSnapshot = await getDocs(usuariosRef);

        const empresasSet = new Set();
        usuariosSnapshot.forEach((doc) => {
          const empresa = doc.data().empresa;
          if (empresa && empresa.trim() !== "") {
            empresasSet.add(empresa);
          }
        });

        const empresasArray = Array.from(empresasSet).sort();
        setEmpresas(empresasArray);
      } catch (error) {
        console.error("Error al obtener empresas:", error);
      }
    };

    fetchEmpresas();
  }, [isAdmin]);

  // ✅ NUEVO: Establecer empresa por defecto para usuarios no admin
  useEffect(() => {
    if (!isAdmin && userData?.empresa && !empresaSeleccionada) {
      setEmpresaSeleccionada(userData.empresa);
    }
  }, [isAdmin, userData, empresaSeleccionada]);

  // Función para obtener el color del estado
  const getStatusColor = (status, lastSeen) => {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    const lastSeenTime = lastSeen?.toDate?.() || new Date(lastSeen || 0);

    switch (status) {
      case "online":
        return lastSeenTime.getTime() > fiveMinutesAgo ? "green" : "yellow";
      case "configured":
      case "linked":
        return "blue";
      case "waiting":
        return "yellow";
      case "offline":
      default:
        return "red";
    }
  };

  // Función para obtener el texto del estado
  const getStatusText = (status, lastSeen) => {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    const lastSeenTime = lastSeen?.toDate?.() || new Date(lastSeen || 0);

    switch (status) {
      case "online":
        return lastSeenTime.getTime() > fiveMinutesAgo
          ? "En línea"
          : "Desconectado recientemente";
      case "configured":
      case "linked":
        return "Vinculado";
      case "waiting":
        return "Esperando vinculación";
      case "offline":
      default:
        return "Desconectado";
    }
  };

  // Función para obtener el ícono del estado
  const getStatusIcon = (status, lastSeen) => {
    const color = getStatusColor(status, lastSeen);
    const iconClass = `h-5 w-5 text-${color}-500`;

    switch (status) {
      case "online":
        return color === "green" ? (
          <SignalIcon className={iconClass} />
        ) : (
          <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />
        );
      case "configured":
      case "linked":
        return <CheckCircleIcon className={iconClass} />;
      case "waiting":
        return <ClockIconSolid className={iconClass} />;
      case "offline":
      default:
        return <SignalSlashIcon className={iconClass} />;
    }
  };

  // Función para formatear fecha
  const formatDate = (timestamp) => {
    if (!timestamp) return "Nunca";
    const date = timestamp.toDate?.() || new Date(timestamp);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Función para calcular tiempo transcurrido
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "Nunca";
    const now = Date.now();
    const time = timestamp.toDate?.() || new Date(timestamp);
    const diffMs = now - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Ahora mismo";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffMins < 1440) return `Hace ${Math.floor(diffMins / 60)} h`;
    return `Hace ${Math.floor(diffMins / 1440)} días`;
  };

  // ✅ NUEVO: Función para obtener el nombre real de la pantalla
  const getScreenName = (screenType, screenNumber) => {
    if (!userData || !screenType || !screenNumber)
      return `Pantalla ${screenNumber}`;

    const index = screenNumber - 1; // Los arrays empiezan en 0

    switch (screenType) {
      case "salon":
        return (
          userData.nombrePantallas?.[index] || `Pantalla Salón ${screenNumber}`
        );
      case "directorio":
        return (
          userData.nombrePantallasDirectorio?.[index] ||
          `Pantalla Directorio ${screenNumber}`
        );
      case "tarifario":
        return (
          userData.nombrePantallasTarifario?.[index] ||
          `Pantalla Tarifario ${screenNumber}`
        );
      case "promociones":
        return (
          userData.nombrePantallasPromociones?.[index] ||
          `Pantalla Promociones ${screenNumber}`
        );
      case "vuelos":
        return (
          userData.nombrePantallasVuelos?.[index] ||
          `Pantalla Vuelos ${screenNumber}`
        );
      default:
        return `Pantalla ${screenNumber}`;
    }
  };

  // Filtrar dispositivos según el filtro seleccionado
  const filteredDevices = devices.filter((device) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "online") {
      const now = Date.now();
      const fiveMinutesAgo = now - 5 * 60 * 1000;
      const lastSeenTime =
        device.lastSeen?.toDate?.() || new Date(device.lastSeen || 0);
      return (
        device.status === "online" && lastSeenTime.getTime() > fiveMinutesAgo
      );
    }
    if (selectedFilter === "offline") {
      const now = Date.now();
      const fiveMinutesAgo = now - 5 * 60 * 1000;
      const lastSeenTime =
        device.lastSeen?.toDate?.() || new Date(device.lastSeen || 0);
      return (
        device.status === "offline" ||
        (device.status === "online" && lastSeenTime.getTime() <= fiveMinutesAgo)
      );
    }
    return device.status === selectedFilter;
  });

  // Función para eliminar dispositivo
  const handleDeleteDevice = async (device) => {
    if (!currentUser) return;

    // ✅ CORREGIDO: Usar el código del dispositivo, no el ID del documento
    const deviceCode = device.code || device.id;

    const deviceName = device.configuration?.screenName || deviceCode;
    const result = await Swal.fire({
      title: "¿Eliminar dispositivo?",
      text: `¿Estás seguro de que quieres eliminar el dispositivo ${deviceName}? Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await deleteDevice(deviceCode, currentUser.uid);
        Swal.fire({
          title: "¡Eliminado!",
          text: `El dispositivo ${deviceName} ha sido eliminado.`,
          icon: "success",
          timer: 3000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error eliminando dispositivo:", error);
        Swal.fire({
          title: "Error",
          text: `No se pudo eliminar el dispositivo: ${error.message}`,
          icon: "error",
        });
      }
    }
  };

  // Función para configurar dispositivo
  const handleConfigureDevice = (device) => {
    setSelectedDevice(device);
    setConfigurationModalOpen(true);
  };

  // Función para expandir/colapsar detalles del dispositivo
  const toggleDeviceExpansion = (deviceId) => {
    const newExpanded = new Set(expandedDevices);
    if (newExpanded.has(deviceId)) {
      newExpanded.delete(deviceId);
    } else {
      newExpanded.add(deviceId);
    }
    setExpandedDevices(newExpanded);
  };

  // Función para validar licencias
  const validateLicense = (device, screenType, screenNumber) => {
    const licenseField = `p${screenType.charAt(0)}`;
    const availableLicenses = device.userData?.[licenseField] || 0;
    
    if (availableLicenses < screenNumber) {
      throw new Error(`No tienes licencia para ${screenType} ${screenNumber}`);
    }
    
    return true;
  };

  // Función para verificar si el usuario puede controlar el dispositivo
  const canControlDevice = (user, device) => {
    if (!user) return false;
    
    const isAdmin = ["uppermex10@gmail.com", "ulises.jacobo@hotmail.com", "contacto@upperds.mx"]
      .includes(user.email);
    const isOwner = device.ownerId === user.uid;
    const sameCompany = device.empresa === userData?.empresa;
    
    return isAdmin || isOwner || sameCompany;
  };

  // Función para enviar comando remoto
  const sendToScreen = async (deviceId, screenType, screenNumber) => {
    try {
      const device = devices.find(d => d.id === deviceId);
      if (!device) {
        throw new Error('Dispositivo no encontrado');
      }

      // Validar licencias antes de enviar
      validateLicense(device, screenType, screenNumber);

      await updateDoc(doc(db, 'devices', deviceId), {
        configuration: {
          type: screenType,
          screenId: screenNumber.toString(),
          assignedAt: serverTimestamp(),
          assignedBy: currentUser.email,
          
          // Mantener campos para compatibilidad
          screenType: screenType,
          screenNumber: screenNumber,
          screenName: `${screenType} ${screenNumber}`,
          autoStart: true,
          configuredAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        }
      });
      
      Swal.fire({
        icon: 'success',
        title: `Enviado a ${screenType} ${screenNumber}`,
        showConfirmButton: false,
        timer: 2000
      });
      
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error enviando comando',
        text: error.message
      });
    }
  };

  // Función para manejar dispositivos vinculados exitosamente
  const handleDeviceLinked = (deviceCode, userData) => {
    console.log(`Dispositivo ${deviceCode} vinculado correctamente:`, userData);
    // El hook useDeviceSync automáticamente actualizará la lista
  };

  // Estados de loading y error
  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ✅ Validación de autenticación
  if (!loading && !authLoading && !currentUser) {
    return (
      <div className="text-center py-12">
        <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Error de autenticación
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          No se pudo verificar tu identidad. Por favor, recarga la página o
          inicia sesión nuevamente.
        </p>
        <div className="mt-4">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isAdmin ? "Gestión de Dispositivos" : "Mis Dispositivos TV"}
            </h1>
            <p className="text-gray-600">
              {isAdmin
                ? `Administra dispositivos Android TV${
                    empresaSeleccionada
                      ? ` de ${empresaSeleccionada}`
                      : " de todas las empresas"
                  }`
                : "Gestiona y monitorea tus dispositivos Android TV"}
            </p>
          </div>

          <button
            onClick={() => setLinkingModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Vincular dispositivo
          </button>
        </div>
      </div>

      {/* ✅ NUEVO: Selector de empresa para admin */}
      {isAdmin && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <label
              htmlFor="empresa"
              className="text-gray-700 font-medium mb-2 sm:mb-0"
            >
              Empresa:
            </label>
            <div className="w-full sm:w-1/2">
              <select
                id="empresa"
                value={empresaSeleccionada}
                onChange={(e) => setEmpresaSeleccionada(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Seleccionar empresa...</option>
                {empresas.map((empresa) => (
                  <option key={empresa} value={empresa}>
                    {empresa}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {!empresaSeleccionada && (
            <p className="mt-2 text-sm text-gray-500">
              Selecciona una empresa para ver sus dispositivos vinculados
            </p>
          )}
        </div>
      )}

      {/* Controles */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        {/* ✅ CONDICIONAL: Mostrar mensaje si admin no ha seleccionado empresa */}
        {isAdmin && !empresaSeleccionada ? (
          <div className="p-12 text-center">
            <ComputerDesktopIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Selecciona una empresa
            </h3>
            <p className="text-gray-500">
              Elige una empresa del selector superior para ver sus dispositivos
              vinculados
            </p>
          </div>
        ) : filteredDevices.length === 0 ? (
          /* Lista vacía */
          <div className="p-12 text-center">
            <ComputerDesktopIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {devices.length === 0
                ? "No hay dispositivos vinculados"
                : "No hay dispositivos que coincidan con el filtro"}
            </h3>
            <p className="text-gray-500 mb-4">
              {devices.length === 0
                ? `Comienza vinculando tu primer dispositivo Android TV${
                    isAdmin && empresaSeleccionada
                      ? ` para ${empresaSeleccionada}`
                      : ""
                  }`
                : `Intenta cambiar el filtro para ver otros dispositivos${
                    isAdmin && empresaSeleccionada
                      ? ` de ${empresaSeleccionada}`
                      : ""
                  }`}
            </p>
            {devices.length === 0 && (
              <button
                onClick={() => setLinkingModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Vincular dispositivo
              </button>
            )}
          </div>
        ) : (
          /* Lista de dispositivos */
          <div className="divide-y divide-gray-200">
            {filteredDevices.map((device) => (
              <div key={device.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {device.configuration?.screenType
                          ? device.configuration.screenType === "salon"
                            ? "🎭"
                            : device.configuration.screenType === "directorio"
                            ? "📋"
                            : device.configuration.screenType === "promociones"
                            ? "📢"
                            : device.configuration.screenType === "tarifario"
                            ? "💰"
                            : device.configuration.screenType === "vuelos"
                            ? "✈️"
                            : "📺"
                          : "📺"}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {device.configuration?.screenName ? (
                            <>
                              {device.configuration.screenName}
                              <span className="text-gray-500 font-normal ml-2">
                                ({device.code || device.id})
                              </span>
                              {/* ✅ NUEVO: Badge para mostrar que está configurado */}
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Configurado
                              </span>
                            </>
                          ) : (
                            <>
                              {device.code || device.id}
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Sin configurar
                              </span>
                            </>
                          )}
                        </p>
                        <span
                          className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getStatusColor(device.status, device.lastSeen) ===
                            "green"
                              ? "bg-green-100 text-green-800"
                              : getStatusColor(
                                  device.status,
                                  device.lastSeen
                                ) === "blue"
                              ? "bg-blue-100 text-blue-800"
                              : getStatusColor(
                                  device.status,
                                  device.lastSeen
                                ) === "yellow"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {getStatusText(device.status, device.lastSeen)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500 space-x-4">
                        {device.ownerEmail && (
                          <span>👤 {device.ownerEmail}</span>
                        )}
                        {device.empresa && <span>🏢 {device.empresa}</span>}
                        {device.lastSeen && (
                          <span>🕒 {getTimeAgo(device.lastSeen)}</span>
                        )}
                        {/* ✅ NUEVO: Mostrar información de pantalla configurada */}
                        {device.configuration?.screenType && (
                          <span className="inline-flex items-center">
                            {device.configuration.screenType === "salon" &&
                              "🎭"}
                            {device.configuration.screenType === "directorio" &&
                              "📋"}
                            {device.configuration.screenType === "promociones"}
                            {device.configuration.screenType === "tarifario" &&
                              "💰"}
                            {device.configuration.screenType === "vuelos" &&
                              "✈️"}{" "}
                            {/* ✅ ACTUALIZADO: Mostrar nombre real de la pantalla */}
                            {getScreenName(
                              device.configuration.screenType,
                              device.configuration.screenNumber
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleDeviceExpansion(device.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                      title="Ver detalles"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>

                    {(device.status === "linked" ||
                      device.status === "configured" ||
                      device.status === "online") && (
                      <button
                        onClick={() => handleConfigureDevice(device)}
                        className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
                        title="Configurar"
                      >
                        <Cog6ToothIcon className="h-5 w-5" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteDevice(device)}
                      className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                      title="Eliminar"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* NUEVA SECCIÓN: Control Remoto */}
                {device.status === "linked" && canControlDevice(currentUser, device) && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Control Remoto - Enviar a:
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {/* Promociones */}
                      {Array.from({length: device.userData?.pp || 0}, (_, i) => (
                        <button 
                          key={`promo-${i}`}
                          onClick={() => sendToScreen(device.id, 'promociones', i+1)}
                          className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                        >
                          Promo {i+1}
                        </button>
                      ))}
                      
                      {/* NUEVO: Vuelos */}
                      {Array.from({length: device.userData?.pv || 0}, (_, i) => (
                        <button 
                          key={`vuelo-${i}`}
                          onClick={() => sendToScreen(device.id, 'vuelos', i+1)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                        >
                          Vuelos {i+1}
                        </button>
                      ))}
                      
                      {/* Salon */}
                      {Array.from({length: device.userData?.ps || 0}, (_, i) => (
                        <button 
                          key={`salon-${i}`}
                          onClick={() => sendToScreen(device.id, 'salon', i+1)}
                          className="bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600"
                        >
                          Salón {i+1}
                        </button>
                      ))}
                      
                      {/* Directorio */}
                      {Array.from({length: device.userData?.pd || 0}, (_, i) => (
                        <button 
                          key={`directorio-${i}`}
                          onClick={() => sendToScreen(device.id, 'directorio', i+1)}
                          className="bg-orange-500 text-white px-2 py-1 rounded text-xs hover:bg-orange-600"
                        >
                          Directorio {i+1}
                        </button>
                      ))}
                      
                      {/* Tarifario */}
                      {Array.from({length: device.userData?.pt || 0}, (_, i) => (
                        <button 
                          key={`tarifario-${i}`}
                          onClick={() => sendToScreen(device.id, 'tarifario', i+1)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                        >
                          Tarifario {i+1}
                        </button>
                      ))}
                    </div>
                    
                    {/* Información del comando actual */}
                    {device.configuration?.assignedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Última acción: {device.configuration.type} {device.configuration.screenId} 
                        por {device.configuration.assignedBy}
                      </p>
                    )}
                  </div>
                )}

                {/* Detalles expandidos */}
                {expandedDevices.has(device.id) && (
                  <div className="mt-4 pl-14 border-l-2 border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Información del dispositivo
                        </h4>
                        <dl className="space-y-1">
                          {device.code && device.id !== device.code && (
                            <div className="flex justify-between">
                              <dt className="text-gray-500">ID documento:</dt>
                              <dd className="text-gray-900 font-mono text-xs">
                                {device.id}
                              </dd>
                            </div>
                          )}

                          {device.createdAt && (
                            <div className="flex justify-between">
                              <dt className="text-gray-500">Creado:</dt>
                              <dd className="text-gray-900">
                                {formatDate(device.createdAt)}
                              </dd>
                            </div>
                          )}
                        </dl>
                      </div>

                      {device.userData && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Propietario
                          </h4>
                          <dl className="space-y-1">
                            <div className="flex justify-between">
                              <dt className="text-gray-500">Nombre:</dt>
                              <dd className="text-gray-900">
                                {device.userData.nombre}{" "}
                                {device.userData.apellido}
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-500">Email:</dt>
                              <dd className="text-gray-900">
                                {device.userData.email}
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-500">Empresa:</dt>
                              <dd className="text-gray-900">
                                {device.empresa || "No asignada"}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modales */}
      <DeviceLinkingModal
        isOpen={linkingModalOpen}
        onClose={() => setLinkingModalOpen(false)}
        onDeviceLinked={handleDeviceLinked}
      />

      {configurationModalOpen && selectedDevice && (
        <DeviceConfiguration
          isOpen={configurationModalOpen}
          onClose={() => {
            setConfigurationModalOpen(false);
            setSelectedDevice(null);
          }}
          device={selectedDevice}
          userData={userData}
          onConfigurationSaved={() => {
            console.log(
              "✅ Configuración guardada - lista se actualizará automáticamente"
            );
          }}
        />
      )}
    </div>
  );
};

export default DevicesList;
