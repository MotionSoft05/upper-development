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
  faChartLine,
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
  const [detailedLogs, setDetailedLogs] = useState([]);
  const [showLogsModal, setShowLogsModal] = useState(false);

  // URLs específicas de Firebase Functions v2
  const FUNCTION_URLS = {
    systemHealth: "https://systemhealth-wsvcv36oca-uc.a.run.app",
    cronControl: "https://croncontrol-wsvcv36oca-uc.a.run.app",
    testFlightUpdate: "https://testflightupdate-wsvcv36oca-uc.a.run.app",
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadSystemStatus();
    loadRecentLogs();
    loadAPIStats();
    loadCronStatus();
  }, []);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      loadSystemStatus();
      loadAPIStats();
      loadCronStatus();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Actualizar próxima ejecución cada minuto
  useEffect(() => {
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

  // NUEVA: Función para calcular próxima ejecución
  const calculateNextExecution = (lastExecution, isEnabled) => {
    if (!isEnabled) return "Sistema pausado";
    
    const now = new Date();
    const next = new Date(now);
    
    // El cron job se ejecuta cada 15 minutos: 0, 15, 30, 45
    const currentMinutes = now.getMinutes();
    const nextMinutes = Math.ceil((currentMinutes + 1) / 15) * 15;
    
    if (nextMinutes >= 60) {
      next.setHours(next.getHours() + 1, 0, 0, 0);
    } else {
      next.setMinutes(nextMinutes, 0, 0);
    }
    
    const diffMinutes = Math.round((next - now) / (1000 * 60));
    
    if (diffMinutes <= 1) return "En menos de 1 minuto";
    return `En ${diffMinutes} minutos (${next.toLocaleTimeString()})`;
  };

  // NUEVA: Función para ejecutar actualización manual
  const executeManualUpdate = async () => {
    setIsExecutingManual(true);
    
    try {
      const airports = ['MEX', 'GDL', 'CUN'];
      const results = [];
      
      for (const airport of airports) {
        console.log(`🚀 Ejecutando actualización manual para ${airport}...`);
        
        const response = await fetch(
          `${FUNCTION_URLS.testFlightUpdate}?airport=${airport}&force=true`,
          { method: 'GET' }
        );
        
        const result = await response.json();
        results.push({
          airport,
          success: result.success,
          data: result.data,
          error: result.error
        });
      }

      // AGREGAR ESTE CÓDIGO NUEVO: Activar Google Distance Matrix
      console.log('🗺️ Activando Google Distance Matrix...');
      try {
        const distanceResponse = await fetch(
          `${FUNCTION_URLS.testFlightUpdate}?airport=MEX&force=true&includeDistance=true`,
          { method: 'GET' }
        );

        if (distanceResponse.ok) {
          console.log('✅ Google Distance Matrix activado');
        }
      } catch (error) {
        console.error('❌ Error activando Distance Matrix:', error);
      }

      // Mostrar resultado
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      Swal.fire({
        title: "✅ Ejecución manual completada",
        html: `
          <div class="text-left">
            <p><strong>Exitosos:</strong> ${successful}/${airports.length}</p>
            <p><strong>Fallidos:</strong> ${failed}/${airports.length}</p>
            ${failed > 0 ? '<p class="text-red-600 mt-2">Ver logs detallados para más información.</p>' : '<p class="text-green-600 mt-2">Todos los aeropuertos actualizados correctamente.</p>'}
          </div>
        `,
        icon: "success",
        timer: 5000,
      });
      
      // Recargar estado del sistema
      await loadSystemStatus();
      await loadAPIStats();
      
    } catch (error) {
      console.error('Error en ejecución manual:', error);
      Swal.fire({
        title: "❌ Error en ejecución manual",
        text: error.message,
        icon: "error"
      });
    } finally {
      setIsExecutingManual(false);
    }
  };

  // NUEVA: Función para obtener logs detallados
  const fetchDetailedLogs = async () => {
    try {
      const response = await fetch(`${FUNCTION_URLS.systemHealth}`);
      const data = await response.json();
      
      // Procesar logs para mostrar errores detallados
      const errorLogs = data.recentLogs?.filter(log => 
        log.level === 'error' || 
        log.context?.includes('error') || 
        log.message?.toLowerCase().includes('error') ||
        log.message?.toLowerCase().includes('timeout') ||
        log.message?.toLowerCase().includes('failed')
      ) || [];
      
      setDetailedLogs(errorLogs);
      setShowLogsModal(true);
      
    } catch (error) {
      console.error('Error obteniendo logs:', error);
      Swal.fire({
        title: "❌ Error",
        text: "Error obteniendo logs detallados",
        icon: "error"
      });
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
        
        // Recargar estado del sistema
        loadSystemStatus();
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

          <button
            onClick={() => setActiveTab("stats")}
            className={`flex items-center px-6 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === "stats"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FontAwesomeIcon icon={faChartLine} className="mr-2" />
            Estadísticas
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
                  {cronStatus.enabled ? 'Ejecutándose cada 15 min' : 'Pausado manualmente'}
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
                  <h3 className="text-lg font-semibold text-gray-900">Panel de Testing</h3>
                  <p className="text-sm text-gray-600 mt-1">Prueba las APIs de vuelos manualmente</p>
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
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => runAPITest(selectedTestAirport, false)}
                      disabled={isTestingLoading}
                      className="flex items-center justify-center px-4 py-3 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 disabled:opacity-50 transition-colors"
                    >
                      {isTestingLoading ? (
                        <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <FontAwesomeIcon icon={faPlane} className="mr-2" />
                      )}
                      Solo Consultar
                    </button>

                    <button
                      onClick={() => runAPITest(selectedTestAirport, true)}
                      disabled={isTestingLoading}
                      className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {isTestingLoading ? (
                        <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <FontAwesomeIcon icon={faServer} className="mr-2" />
                      )}
                      Consultar y Guardar
                    </button>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Nota Importante</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Las actualizaciones automáticas continúan ejecutándose cada 15 minutos independientemente de estos tests manuales.
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
                  <p className="text-sm text-gray-600 mt-1">Gestiona las actualizaciones programadas cada 15 minutos</p>
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

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <FontAwesomeIcon icon={faCog} className="text-blue-500 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Información del Sistema</p>
                        <div className="text-sm text-blue-700 mt-1 space-y-1">
                          <p>• Frecuencia: Cada 15 minutos</p>
                          <p>• APIs: OpenSky Network (OAuth2) + AviationStack (backup)</p>
                          <p>• Aeropuertos: MEX, GDL, CUN</p>
                          <p>• Costo estimado: ~$5/mes máximo</p>
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
                        {cronStatus.lastRun ? new Date(cronStatus.lastRun).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600">Próxima ejecución</span>
                      <span className="font-medium text-blue-600">
                        {nextExecution || 'Calculando...'}
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

        {/* TAB: Estadísticas */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            {/* Stats Cards con botón ejecutar ahora */}
            <div className="mb-6 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">📈 Estadísticas de APIs</h3>
              <button
                onClick={executeManualUpdate}
                disabled={isExecutingManual}
                className={`px-6 py-3 rounded-lg text-white font-medium transition-colors ${
                  isExecutingManual 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isExecutingManual ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Ejecutando...
                  </>
                ) : (
                  '🚀 Ejecutar Ahora'
                )}
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{apiStats.totalRequests}</p>
                  <p className="text-sm text-gray-600 mt-1">Total de Peticiones</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{apiStats.successfulRequests}</p>
                  <p className="text-sm text-gray-600 mt-1">Exitosas</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600">{apiStats.failedRequests}</p>
                  <p className="text-sm text-gray-600 mt-1">Fallidas</p>
                  {apiStats.failedRequests > 0 && (
                    <button
                      onClick={fetchDetailedLogs}
                      className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                    >
                      Ver detalles
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">
                    {apiStats.totalRequests > 0 ? 
                      Math.round((apiStats.successfulRequests / apiStats.totalRequests) * 100) : 0}%
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Tasa de Éxito</p>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Resumen de APIs</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">OpenSky Network</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado:</span>
                        <span className="text-green-600">✅ OAuth2 Activo</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Client ID:</span>
                        <span className="font-mono text-xs">kevinbarrios05-api-client</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Límite diario:</span>
                        <span>4000-8000 créditos</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">AviationStack (Backup)</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado:</span>
                        <span className="text-blue-600">🔄 Standby</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">API Key:</span>
                        <span className="font-mono text-xs">ce631...810503</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Límite mensual:</span>
                        <span>1000 requests</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* NUEVO: Modal de Logs Detallados */}
            {showLogsModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
                  <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-lg font-semibold">🔍 Logs Detallados de Errores</h3>
                    <button
                      onClick={() => setShowLogsModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {detailedLogs.length > 0 ? (
                      <div className="space-y-4">
                        {detailedLogs.map((log, index) => (
                          <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm font-medium text-red-800">
                                {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Sin timestamp'}
                              </span>
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                {log.context || log.level || 'Error'}
                              </span>
                            </div>
                            <p className="text-sm text-red-700 font-mono mb-2">
                              {log.message || 'Sin mensaje de error'}
                            </p>
                            {log.details && (
                              <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-x-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            )}
                            {log.error && (
                              <div className="mt-2 text-xs bg-red-100 p-2 rounded">
                                <strong>Error:</strong> {log.error}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-green-500 mb-4" />
                        <p className="text-gray-500 font-medium">No se encontraron logs de errores recientes.</p>
                        <p className="text-sm text-gray-400 mt-2">
                          Esto significa que las APIs están funcionando correctamente.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 border-t bg-gray-50">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        Mostrando errores de las últimas 24 horas
                      </p>
                      <div className="space-x-3">
                        <button
                          onClick={fetchDetailedLogs}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          🔄 Actualizar
                        </button>
                        <button
                          onClick={() => setShowLogsModal(false)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Cerrar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAPIMonitor;