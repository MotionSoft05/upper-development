"use client";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import app from "@/firebase/firebaseConfig";
import { firestore as db } from "@/components/firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faStop,
  faSync,
  faCheckCircle,
  faExclamationTriangle,
  faTimesCircle,
  faCog,
  faServer,
  faPlane,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";

function AdminAPIMonitor() {
  const { t } = useTranslation();

  // Estados principales
  const [activeTab, setActiveTab] = useState("monitor");
  const [systemStatus, setSystemStatus] = useState({
    flightUpdates: "unknown",
    distanceMatrix: "unknown",
    cronJobs: "unknown",
    apiHealth: "unknown",
  });

  // Estados de testing
  const [testingResults, setTestingResults] = useState([]);
  const [isTestingLoading, setIsTestingLoading] = useState(false);
  const [selectedTestAirport, setSelectedTestAirport] = useState("MEX");

  // Estados para control de aeropuertos
  const [airportStatus, setAirportStatus] = useState({
    MEX: { enabled: true, name: "Ciudad de México", apiCalls: 0 },
    GDL: { enabled: true, name: "Guadalajara", apiCalls: 0 },
    CUN: { enabled: true, name: "Cancún", apiCalls: 0 },
    MTY: { enabled: false, name: "Monterrey", apiCalls: 0 },
    PVR: { enabled: false, name: "Puerto Vallarta", apiCalls: 0 },
  });
  const [isLoading, setIsLoading] = useState(false);

  // Estados de logs y estadísticas
  const [recentLogs, setRecentLogs] = useState([]);
  const [apiStats, setApiStats] = useState({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    lastUpdate: null,
  });

  // Estados de control
  const [cronStatus, setCronStatus] = useState({
    enabled: true,
    lastRun: null,
    nextRun: null,
  });

  // Nuevos estados para mejoras
  const [nextExecution, setNextExecution] = useState(null);
  const [isExecutingManual, setIsExecutingManual] = useState(false);

  // URLs específicas de Firebase Functions v2
  const FUNCTION_URLS = {
    systemHealth: "https://us-central1-upper-8c817.cloudfunctions.net/systemHealth",
    cronControl: "https://us-central1-upper-8c817.cloudfunctions.net/cronControl",
    testFlightUpdate: "https://us-central1-upper-8c817.cloudfunctions.net/testFlightUpdate",
    executeManualUpdate: "https://us-central1-upper-8c817.cloudfunctions.net/executeManualUpdate",
    // NUEVOS: Endpoints para control de aeropuertos
    getAirportServiceStatus: "https://us-central1-upper-8c817.cloudfunctions.net/getAirportServiceStatus",
    toggleAirportService: "https://us-central1-upper-8c817.cloudfunctions.net/toggleAirportService",
  };

  // 🔧 FUNCIÓN OPTIMIZADA: Una sola llamada para todos los datos
  const loadAllSystemData = async () => {
    try {
      const response = await fetch(`${FUNCTION_URLS.systemHealth}`);
      if (response.ok) {
        const health = await response.json();

        // Distribuir datos a todos los estados
        setSystemStatus({
          healthy: health.success,
          flightUpdates: health.flightUpdates,
          distanceMatrix: health.distanceMatrix,
          apiHealth: health.apiHealth,
          timestamp: health.timestamp,
        });

        setApiStats({
          totalRequests: health.recentLogs?.length || 0,
          successfulRequests: health.recentLogs?.filter(log => log.level !== 'error').length || 0,
          failedRequests: health.recentErrors?.length || 0,
          lastUpdate: new Date(health.timestamp),
        });

        setCronStatus({
          enabled: health.cronJobs?.enabled || health.cronJobs?.status === 'active' || false,
          lastRun: health.cronJobs?.lastRun || null,
          lastAction: health.cronJobs?.lastAction || 'unknown',
          status: health.cronJobs?.status || 'inactive',
        });

        // Cargar logs recientes también
        if (health.recentLogs) {
          setRecentLogs(health.recentLogs.slice(0, 10));
        }
      }
    } catch (error) {
      console.error("Error loading system data:", error);
      setSystemStatus({ healthy: false, error: error.message });
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadAllSystemData();
    loadAirportStatus();
  }, []);

  // Auto-refresh cada 30 segundos (UNA SOLA LLAMADA)
  useEffect(() => {
    const interval = setInterval(() => {
      loadAllSystemData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Actualizar próxima ejecución cada minuto
  useEffect(() => {
    // Calcular inmediatamente cuando cambie el cronStatus
    const nextExec = calculateNextExecution(cronStatus.lastRun, cronStatus.enabled);
    setNextExecution(nextExec);

    // Actualizar cada minuto si está habilitado
    if (cronStatus.enabled) {
      const interval = setInterval(() => {
        const nextExec = calculateNextExecution(cronStatus.lastRun, cronStatus.enabled);
        setNextExecution(nextExec);
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [cronStatus]);

  // Función para cargar estado del sistema
  const loadSystemStatus = async () => {
    try {
      // Verificar estado general del sistema
      const response = await fetch(`${FUNCTION_URLS.systemHealth}`);
      if (response.ok) {
        const health = await response.json();
        setSystemStatus(health);
      }
    } catch (error) {
      console.error("Error loading system status:", error);
      setSystemStatus({
        flightUpdates: "error",
        distanceMatrix: "error", 
        cronJobs: "error",
        apiHealth: "error",
      });
    }
  };

  // Función para cargar logs recientes
  const loadRecentLogs = async () => {
    try {
      const logsQuery = query(
        collection(db, "systemLogs"),
        orderBy("timestamp", "desc"),
        limit(10)
      );
      const logsSnapshot = await getDocs(logsQuery);
      const logs = logsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecentLogs(logs);
    } catch (error) {
      console.error("Error loading logs:", error);
    }
  };

  // Función para cargar estadísticas de API
  const loadAPIStats = async () => {
    try {
      // Obtener estadísticas reales del endpoint systemHealth
      const response = await fetch(`${FUNCTION_URLS.systemHealth}`);
      if (response.ok) {
        const health = await response.json();
        // Por ahora mostrar estadísticas básicas hasta que implementemos métricas reales
        setApiStats({
          totalRequests: health.recentLogs?.length || 0,
          successfulRequests: health.recentLogs?.filter(log => log.level !== 'error').length || 0,
          failedRequests: health.recentErrors?.length || 0,
          lastUpdate: new Date(health.timestamp),
        });
      } else {
        // Valores por defecto si no hay datos
        setApiStats({
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          lastUpdate: new Date(),
        });
      }
    } catch (error) {
      console.error("Error loading API stats:", error);
      // Valores por defecto en caso de error
      setApiStats({
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        lastUpdate: new Date(),
      });
    }
  };

  // NUEVA: Función para calcular próxima ejecución (cada 40 minutos)
  const calculateNextExecution = (lastExecution, isEnabled) => {
    if (!isEnabled) return "En espera (sistema pausado)";

    const now = new Date();
    const next = new Date(now);

    // El cron job se ejecuta cada 40 minutos: 00:00, 00:40, 01:20, 02:00, etc.
    const currentMinutes = now.getMinutes();

    // Calcular el próximo múltiplo de 40 minutos
    const nextMinutes = Math.ceil((currentMinutes + 1) / 40) * 40;

    if (nextMinutes >= 60) {
      // Si pasa de 60, va a la próxima hora
      next.setHours(next.getHours() + 1, nextMinutes - 60, 0, 0);
    } else {
      // Establecer en la misma hora
      next.setMinutes(nextMinutes, 0, 0);
    }

    const diffMinutes = Math.round((next - now) / (1000 * 60));

    if (diffMinutes <= 1) return "Calculando próxima ejecución...";
    return `En ${diffMinutes} minutos (${next.toLocaleTimeString()})`;
  };

  // 🔧 FIX: Función para ejecutar actualización manual SIN afectar el CRON
  const executeManualUpdate = async () => {
    setIsExecutingManual(true);

    try {
      console.log('🚀 Ejecutando actualización manual independiente...');

      // 🔧 FIX: Usar la nueva función executeManualUpdate que NO activa el cron
      const response = await fetch(`${FUNCTION_URLS.executeManualUpdate}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // No se necesitan parámetros
      });

      const result = await response.json();

      if (result.success) {
        const { summary } = result;

        Swal.fire({
          title: "✅ Ejecución manual completada",
          html: `
            <div class="text-left">
              <p><strong>Aeropuertos procesados:</strong> ${summary.flightAirports}</p>
              <p><strong>Vuelos exitosos:</strong> ${summary.flightSuccessful}/${summary.flightAirports}</p>
              <p><strong>Hoteles procesados:</strong> ${summary.hotelsProcessed}</p>
              <p><strong>Tiempo de ejecución:</strong> ${(summary.executionTime / 1000).toFixed(1)}s</p>
              <p class="text-green-600 mt-2">✅ Estado del CRON sin cambios</p>
              <p class="text-sm text-gray-500 mt-2">Solo se ejecutaron las APIs - el cronograma automático no fue afectado</p>
            </div>
          `,
          icon: "success",
          timer: 6000,
        });

        console.log('✅ Actualización manual exitosa:', result.summary);
      } else {
        throw new Error(result.error || 'Error desconocido');
      }

      // Recargar estado del sistema
      await loadAllSystemData();

    } catch (error) {
      console.error('❌ Error en ejecución manual:', error);
      Swal.fire({
        title: "❌ Error en ejecución manual",
        text: error.message,
        icon: "error"
      });
    } finally {
      setIsExecutingManual(false);
    }
  };


  // Función para cargar estado de cron jobs
  const loadCronStatus = async () => {
    try {
      const response = await fetch(`${FUNCTION_URLS.systemHealth}`);
      if (response.ok) {
        const health = await response.json();
        if (health.cronJobs) {
          const cronData = {
            enabled: health.cronJobs.enabled || false,
            lastRun: health.cronJobs.lastRun,
            nextRun: health.cronJobs.nextRun
          };
          setCronStatus(cronData);
          
          // Calcular próxima ejecución
          const nextExec = calculateNextExecution(cronData.lastRun, cronData.enabled);
          setNextExecution(nextExec);
        }
      }
    } catch (error) {
      console.error("Error loading cron status:", error);
    }
  };

  // Función para testing manual
  const runAPITest = async (airport, saveData = false) => {
    setIsTestingLoading(true);
    const testId = Date.now();

    try {
      const url = `${FUNCTION_URLS.testFlightUpdate}?airport=${airport}&force=${saveData}`;
      const startTime = Date.now();
      
      const response = await fetch(url);
      const result = await response.json();
      const duration = Date.now() - startTime;

      const testResult = {
        id: testId,
        timestamp: new Date(),
        airport,
        duration,
        success: result.success,
        data: result.data,
        error: result.error,
        savedToFirestore: saveData,
      };

      setTestingResults(prev => [testResult, ...prev.slice(0, 4)]);

      if (result.success) {
        Swal.fire({
          title: "✅ Test Exitoso",
          html: `
            <div class="text-left">
              <p><strong>Aeropuerto:</strong> ${airport}</p>
              <p><strong>Tiempo:</strong> ${duration}ms</p>
              <p><strong>Salidas:</strong> ${result.data?.departures?.length || 0}</p>
              <p><strong>Llegadas:</strong> ${result.data?.arrivals?.length || 0}</p>
              <p><strong>Guardado:</strong> ${saveData ? 'Sí' : 'No'}</p>
            </div>
          `,
          icon: "success",
          timer: 3000,
        });
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      const testResult = {
        id: testId,
        timestamp: new Date(),
        airport,
        duration: 0,
        success: false,
        error: error.message,
        savedToFirestore: false,
      };

      setTestingResults(prev => [testResult, ...prev.slice(0, 4)]);

      Swal.fire({
        title: "❌ Error en Test",
        text: error.message,
        icon: "error"
      });
    } finally {
      setIsTestingLoading(false);
    }
  };

  // Función para controlar cron jobs
  const controlCronJob = async (action) => {
    try {
      const response = await fetch(`${FUNCTION_URLS.cronControl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      const result = await response.json();
      
      if (result.success) {
        setCronStatus(result.cronStatus);
        Swal.fire({
          title: `✅ Cron Job ${action === 'enable' ? 'Activado' : action === 'disable' ? 'Desactivado' : 'Reiniciado'}`,
          icon: "success",
          timer: 2000,
        });
        
        // Recargar estado del sistema (OPTIMIZADO)
        loadAllSystemData();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      Swal.fire({
        title: "❌ Error",
        text: `No se pudo ${action} el cron job: ${error.message}`,
        icon: "error"
      });
    }
  };

  // NUEVAS: Funciones para control de aeropuertos individuales
  const loadAirportStatus = async () => {
    try {
      const response = await fetch(`${FUNCTION_URLS.getAirportServiceStatus}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAirportStatus(result.airportStatus);
        }
      }
    } catch (error) {
      console.error("Error loading airport status:", error);
    }
  };

  const toggleAirportService = async (airportCode) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${FUNCTION_URLS.toggleAirportService}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ airportCode })
      });

      const result = await response.json();

      if (result.success) {
        // Mostrar confirmación
        Swal.fire({
          title: "✅ Éxito",
          text: result.message,
          icon: "success",
          timer: 3000,
        });

        // Refrescar datos
        await Promise.all([loadSystemStatus(), loadAirportStatus()]);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Error toggling airport service:', error);
      Swal.fire({
        title: "❌ Error",
        text: "Error de conexión. Intente nuevamente.",
        icon: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Función para obtener color de estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  // Función para obtener icono de estado
  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return faCheckCircle;
      case 'warning': return faExclamationTriangle;
      case 'error': return faTimesCircle;
      default: return faCog;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🔧 Monitor de APIs y Sistema
          </h1>
          <p className="text-gray-600">
            Panel de control para monitoreo y administración de servicios
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("monitor")}
            className={`flex items-center px-6 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === "monitor"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FontAwesomeIcon icon={faServer} className="mr-2" />
            Estado del Sistema
          </button>

          <button
            onClick={() => setActiveTab("testing")}
            className={`flex items-center px-6 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === "testing"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FontAwesomeIcon icon={faPlane} className="mr-2" />
            Testing de APIs
          </button>

          <button
            onClick={() => setActiveTab("control")}
            className={`flex items-center px-6 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === "control"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FontAwesomeIcon icon={faCog} className="mr-2" />
            Control de Servicios
          </button>

        </div>

        {/* TAB: Estado del Sistema */}
        {activeTab === "monitor" && (
          <div className="space-y-6">
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Actualización de Vuelos</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      <FontAwesomeIcon 
                        icon={getStatusIcon(systemStatus.flightUpdates)} 
                        className={`mr-2 ${getStatusColor(systemStatus.flightUpdates)}`} 
                      />
                    </p>
                  </div>
                  <div className={`text-3xl ${getStatusColor(systemStatus.flightUpdates)}`}>
                    <FontAwesomeIcon icon={faPlane} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {systemStatus.flightUpdates === 'healthy' ? 'Funcionando correctamente' : 
                   systemStatus.flightUpdates === 'warning' ? 'Con problemas menores' : 
                   systemStatus.flightUpdates === 'error' ? 'Con errores' : 'Estado desconocido'}
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Distance Matrix</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      <FontAwesomeIcon 
                        icon={getStatusIcon(systemStatus.distanceMatrix)} 
                        className={`mr-2 ${getStatusColor(systemStatus.distanceMatrix)}`} 
                      />
                    </p>
                  </div>
                  <div className={`text-3xl ${getStatusColor(systemStatus.distanceMatrix)}`}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {systemStatus.distanceMatrix === 'healthy' ? 'Funcionando correctamente' : 
                   systemStatus.distanceMatrix === 'warning' ? 'Con problemas menores' : 
                   systemStatus.distanceMatrix === 'error' ? 'Con errores' : 'Estado desconocido'}
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Cron Jobs</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      <FontAwesomeIcon 
                        icon={cronStatus.enabled ? faPlay : faPause} 
                        className={`mr-2 ${cronStatus.enabled ? 'text-green-500' : 'text-orange-500'}`} 
                      />
                    </p>
                  </div>
                  <div className={`text-3xl ${cronStatus.enabled ? 'text-green-500' : 'text-orange-500'}`}>
                    <FontAwesomeIcon icon={faSync} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {cronStatus.enabled ? 'Ejecutándose cada 40 min' : 'Pausado manualmente'}
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">APIs Externas</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      <FontAwesomeIcon 
                        icon={getStatusIcon(systemStatus.apiHealth)} 
                        className={`mr-2 ${getStatusColor(systemStatus.apiHealth)}`} 
                      />
                    </p>
                  </div>
                  <div className={`text-3xl ${getStatusColor(systemStatus.apiHealth)}`}>
                    <FontAwesomeIcon icon={faServer} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  OpenSky + AviationStack
                </p>
              </div>
            </div>

            {/* Control de Servicios por Aeropuerto */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Control de Servicios por Aeropuerto
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Active/pause aeropuertos individuales para optimizar costos de API y gestionar servicios por región.
              </p>

              <div className="space-y-4">
                {Object.entries(airportStatus).map(([code, airport]) => (
                  <div key={code} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      {/* Status indicator */}
                      <div className={`w-3 h-3 rounded-full ${airport.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>

                      {/* Airport info */}
                      <div>
                        <h4 className="font-medium text-gray-900">{airport.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Código: {code}</span>
                          <span>Prioridad: {code === 'MEX' || code === 'CUN' ? 'Alta' : code === 'GDL' ? 'Media' : 'Baja'}</span>
                          {airport.enabled && <span>✈️ ~{Math.floor(Math.random() * 100 + 50)} vuelos/día</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Status badge */}
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        airport.enabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {airport.enabled ? 'Activo' : 'Inactivo'}
                      </span>

                      {/* Toggle button */}
                      <button
                        onClick={() => toggleAirportService(code)}
                        disabled={isLoading}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          airport.enabled
                            ? 'bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50'
                            : 'bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50'
                        }`}
                      >
                        {isLoading ? '...' : airport.enabled ? 'Pausar' : 'Activar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  💡 <strong>Tip:</strong> Pausar aeropuertos no utilizados reduce costos de API.
                  Los datos existentes se mantienen disponibles por 24 horas.
                </p>
              </div>
            </div>

            {/* Recent Logs */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Logs Recientes</h3>
                  <button
                    onClick={loadRecentLogs}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <FontAwesomeIcon icon={faSync} className="mr-1" />
                    Actualizar
                  </button>
                </div>
              </div>
              <div className="p-6">
                {recentLogs.length > 0 ? (
                  <div className="space-y-3">
                    {recentLogs.map((log) => (
                      <div key={log.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`mt-1 ${
                          log.level === 'error' ? 'text-red-500' :
                          log.level === 'warning' ? 'text-yellow-500' : 'text-green-500'
                        }`}>
                          <FontAwesomeIcon
                            icon={log.level === 'error' ? faTimesCircle :
                                 log.level === 'warning' ? faExclamationTriangle : faCheckCircle}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{log.message}</p>
                          <p className="text-xs text-gray-500">
                            {log.timestamp?.toDate?.()?.toLocaleString() || new Date(log.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FontAwesomeIcon icon={faServer} className="text-4xl mb-4" />
                    <p>No hay logs disponibles</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: Testing de APIs */}
        {activeTab === "testing" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Panel de Control */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Testing de Conectividad</h3>
                  <p className="text-sm text-gray-600 mt-1">Verifica la conectividad con APIs individuales sin guardar datos</p>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aeropuerto para Test
                    </label>
                    <select
                      value={selectedTestAirport}
                      onChange={(e) => setSelectedTestAirport(e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="MEX">Ciudad de México (MEX)</option>
                      <option value="GDL">Guadalajara (GDL)</option>
                      <option value="CUN">Cancún (CUN)</option>
                      <option value="MTY">Monterrey (MTY)</option>
                      <option value="PVR">Puerto Vallarta (PVR)</option>
                    </select>
                  </div>

                  <div className="w-full">
                    <button
                      onClick={() => runAPITest(selectedTestAirport, false)}
                      disabled={isTestingLoading}
                      className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {isTestingLoading ? (
                        <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <FontAwesomeIcon icon={faPlane} className="mr-2" />
                      )}
                      🔍 Probar Conectividad API
                    </button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <FontAwesomeIcon icon={faPlane} className="text-blue-500 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Función de Testing</p>
                        <p className="text-sm text-blue-700 mt-1">
                          Esta prueba solo verifica la conectividad con las APIs y NO guarda datos en Firestore.
                          Para actualizaciones reales, usa "Prueba Manual de APIs" en Control de Servicios.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resultados de Testing */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Resultados de Testing</h3>
                </div>
                <div className="p-6">
                  {testingResults.length > 0 ? (
                    <div className="space-y-4">
                      {testingResults.map((result) => (
                        <div key={result.id} className={`p-4 rounded-lg border ${
                          result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <FontAwesomeIcon 
                                  icon={result.success ? faCheckCircle : faTimesCircle} 
                                  className={`mr-2 ${result.success ? 'text-green-500' : 'text-red-500'}`}
                                />
                                <span className="font-medium text-gray-900">
                                  {result.airport} - {result.success ? 'Exitoso' : 'Falló'}
                                </span>
                              </div>
                              <div className="mt-2 text-sm text-gray-600">
                                <p>Tiempo: {result.duration}ms</p>
                                {result.success && result.data && (
                                  <p>
                                    Salidas: {result.data.departures?.length || 0}, 
                                    Llegadas: {result.data.arrivals?.length || 0}
                                  </p>
                                )}
                                {result.error && (
                                  <p className="text-red-600">Error: {result.error}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {result.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FontAwesomeIcon icon={faPlane} className="text-4xl mb-4" />
                      <p>Ejecuta un test para ver los resultados</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Control de Servicios */}
        {activeTab === "control" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Control de Cron Jobs */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Control de Actualizaciones Automáticas</h3>
                  <p className="text-sm text-gray-600 mt-1">Gestiona las actualizaciones programadas cada 40 minutos</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Estado Actual</p>
                      <p className={`text-sm ${cronStatus.enabled ? 'text-green-600' : 'text-orange-600'}`}>
                        {cronStatus.enabled ? 'Activo - Ejecutándose automáticamente' : 'Pausado - Sin actualizaciones'}
                      </p>
                    </div>
                    <FontAwesomeIcon 
                      icon={cronStatus.enabled ? faPlay : faPause} 
                      className={`text-2xl ${cronStatus.enabled ? 'text-green-500' : 'text-orange-500'}`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => controlCronJob('enable')}
                      disabled={cronStatus.enabled}
                      className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FontAwesomeIcon icon={faPlay} className="mr-2" />
                      Activar
                    </button>

                    <button
                      onClick={() => controlCronJob('disable')}
                      disabled={!cronStatus.enabled}
                      className="flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FontAwesomeIcon icon={faPause} className="mr-2" />
                      Pausar
                    </button>

                    <button
                      onClick={() => controlCronJob('restart')}
                      className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <FontAwesomeIcon icon={faSync} className="mr-2" />
                      Reiniciar
                    </button>
                  </div>

                  {/* Botón de Prueba Manual */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="font-medium text-gray-900">Prueba Manual de APIs</h4>
                        <p className="text-sm text-gray-600">Ejecuta una prueba inmediata sin afectar el cronograma automático</p>
                      </div>
                      <button
                        onClick={executeManualUpdate}
                        disabled={isExecutingManual}
                        className={`px-6 py-3 rounded-lg text-white font-medium transition-colors ${
                          isExecutingManual
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-purple-600 hover:bg-purple-700'
                        }`}
                      >
                        {isExecutingManual ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                            Ejecutando prueba...
                          </>
                        ) : (
                          '🧪 Prueba Manual de APIs'
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <FontAwesomeIcon icon={faCog} className="text-blue-500 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Información del Sistema</p>
                        <div className="text-sm text-blue-700 mt-1 space-y-1">
                          <p>• Frecuencia: Cada 40 minutos</p>
                          <p>• APIs: AviationStack</p>
                          <p>• Aeropuertos: MEX, GDL, CUN, MTY, PVR</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información del Sistema */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Información del Sistema</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600">Última ejecución</span>
                      <span className="font-medium">
                        {cronStatus.lastRun ? (
                          cronStatus.lastRun._seconds ?
                            new Date(cronStatus.lastRun._seconds * 1000).toLocaleString() :
                            new Date(cronStatus.lastRun).toLocaleString()
                        ) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600">Próxima ejecución</span>
                      <span className="font-medium text-blue-600">
                        {nextExecution || (cronStatus.enabled ? 'Calculando próxima ejecución...' : 'En espera (sistema pausado)')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600">Versión de Functions</span>
                      <span className="font-medium">1.0.0</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600">Región</span>
                      <span className="font-medium">us-central1</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminAPIMonitor;