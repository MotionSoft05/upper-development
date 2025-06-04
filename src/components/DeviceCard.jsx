// src/components/DeviceCard.jsx
import React from "react";

const DeviceCard = ({ device, onUnlink, onDelete, onConfigure }) => {
  // Calcular tiempo desde última conexión
  const getLastSeenText = () => {
    if (!device.lastSeen) return "Nunca";

    const lastSeenDate =
      device.lastSeen.toDate?.() || new Date(device.lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - lastSeenDate.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Ahora mismo";
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24)
      return `Hace ${diffInHours} hora${diffInHours !== 1 ? "s" : ""}`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays} día${diffInDays !== 1 ? "s" : ""}`;
  };

  // Determinar el color y estado visual
  const getStatusConfig = () => {
    const now = new Date();
    const lastSeenDate = device.lastSeen
      ? device.lastSeen.toDate?.() || new Date(device.lastSeen)
      : null;
    const minutesSinceLastSeen = lastSeenDate
      ? Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60))
      : null;

    switch (device.status) {
      case "online":
        if (minutesSinceLastSeen && minutesSinceLastSeen > 5) {
          return {
            color: "yellow",
            bgColor: "bg-yellow-50",
            borderColor: "border-yellow-200",
            iconColor: "text-yellow-500",
            statusText: "Posible problema",
            statusDot: "bg-yellow-400",
          };
        }
        return {
          color: "green",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          iconColor: "text-green-500",
          statusText: "En línea",
          statusDot: "bg-green-400",
        };
      case "offline":
        return {
          color: "red",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          iconColor: "text-red-500",
          statusText: "Sin conexión",
          statusDot: "bg-red-400",
        };
      case "waiting":
        return {
          color: "blue",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          iconColor: "text-blue-500",
          statusText: "Esperando vinculación",
          statusDot: "bg-blue-400",
        };
      case "linked":
        return {
          color: "indigo",
          bgColor: "bg-indigo-50",
          borderColor: "border-indigo-200",
          iconColor: "text-indigo-500",
          statusText: "Vinculado",
          statusDot: "bg-indigo-400",
        };
      default:
        return {
          color: "gray",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          iconColor: "text-gray-500",
          statusText: "Desconocido",
          statusDot: "bg-gray-400",
        };
    }
  };

  const statusConfig = getStatusConfig();
  const lastSeenText = getLastSeenText();
  const linkedDate = device.linkedAt
    ? (
        device.linkedAt.toDate?.() || new Date(device.linkedAt)
      ).toLocaleDateString()
    : "No vinculado";

  // Determinar qué tipo de pantalla está configurada
  const getScreenTypeInfo = () => {
    if (!device.userData) return { type: "Sin configurar", count: 0 };

    const { ps = 0, pd = 0, pp = 0 } = device.userData;

    if (ps > 0) return { type: "Pantallas Salón", count: ps };
    if (pd > 0) return { type: "Pantallas Directorio", count: pd };
    if (pp > 0) return { type: "Pantallas Promociones", count: pp };

    return { type: "Sin pantallas asignadas", count: 0 };
  };

  const screenInfo = getScreenTypeInfo();

  return (
    <div
      className={`rounded-lg border-2 ${statusConfig.borderColor} ${statusConfig.bgColor} p-6 shadow-sm hover:shadow-md transition-shadow duration-200`}
    >
      {/* Header con código y estado */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div
              className={`p-3 rounded-lg ${statusConfig.bgColor} border ${statusConfig.borderColor}`}
            >
              <svg
                className={`h-6 w-6 ${statusConfig.iconColor}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900 font-mono">
              {device.code}
            </h3>
            <div className="flex items-center mt-1">
              <div
                className={`h-2 w-2 rounded-full ${statusConfig.statusDot} mr-2`}
              ></div>
              <span
                className={`text-sm font-medium text-${statusConfig.color}-700`}
              >
                {statusConfig.statusText}
              </span>
            </div>
          </div>
        </div>

        {/* Dropdown de acciones */}
        <div className="relative">
          <div className="flex space-x-1">
            {device.status !== "waiting" && (
              <button
                onClick={onConfigure}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white transition-colors duration-200"
                title="Configurar dispositivo"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            )}

            <button
              onClick={onUnlink}
              className="p-2 text-gray-400 hover:text-yellow-600 rounded-full hover:bg-white transition-colors duration-200"
              title="Desvincular dispositivo"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                />
              </svg>
            </button>

            <button
              onClick={onDelete}
              className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-white transition-colors duration-200"
              title="Eliminar dispositivo"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Información del dispositivo */}
      <div className="space-y-3">
        {/* Configuración de pantallas */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Configuración:</span>
          <span className="text-sm font-medium text-gray-900">
            {screenInfo.type}
            {screenInfo.count > 0 && (
              <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {screenInfo.count}
              </span>
            )}
          </span>
        </div>

        {/* Empresa */}
        {device.userData?.empresa && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Empresa:</span>
            <span className="text-sm font-medium text-gray-900">
              {device.userData.empresa}
            </span>
          </div>
        )}

        {/* Última conexión */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Última conexión:</span>
          <span className="text-sm text-gray-900">{lastSeenText}</span>
        </div>

        {/* Fecha de vinculación */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Vinculado:</span>
          <span className="text-sm text-gray-900">{linkedDate}</span>
        </div>

        {/* Información técnica expandible */}
        <details className="mt-4">
          <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
            Información técnica
          </summary>
          <div className="mt-2 pl-4 border-l-2 border-gray-200 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">ID:</span>
              <span className="text-gray-700 font-mono">{device.id}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Plataforma:</span>
              <span className="text-gray-700">
                {device.deviceInfo?.platform || "Android"}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Versión App:</span>
              <span className="text-gray-700">
                {device.deviceInfo?.appVersion || "1.0.0"}
              </span>
            </div>
            {device.createdAt && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Creado:</span>
                <span className="text-gray-700">
                  {(
                    device.createdAt.toDate?.() || new Date(device.createdAt)
                  ).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </details>
      </div>

      {/* Acciones principales (solo para dispositivos vinculados) */}
      {device.status !== "waiting" && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <button
              onClick={onConfigure}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md border border-${statusConfig.color}-300 text-${statusConfig.color}-700 bg-white hover:bg-${statusConfig.color}-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${statusConfig.color}-500 transition-colors duration-200`}
            >
              Configurar
            </button>

            {device.status === "online" && (
              <button
                className="px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-300 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                title="Dispositivo funcionando correctamente"
              >
                ✓ Activo
              </button>
            )}
          </div>
        </div>
      )}

      {/* Estado de espera para dispositivos no vinculados */}
      {device.status === "waiting" && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Este dispositivo está esperando ser vinculado
            </p>
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-pulse h-2 w-2 bg-blue-400 rounded-full"></div>
              <div
                className="animate-pulse h-2 w-2 bg-blue-400 rounded-full"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="animate-pulse h-2 w-2 bg-blue-400 rounded-full"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceCard;
