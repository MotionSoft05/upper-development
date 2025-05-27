// src/components/DeviceLinker.jsx
import React, { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";
import auth from "@/firebase/auth";
import db from "@/firebase/firestore";
import { linkDevice } from "@/utils/deviceManager";

const DeviceLinker = ({ onDeviceLinked }) => {
  const [user] = useAuthState(auth);
  const [code, setCode] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Limpiar código y convertir a mayúsculas
  const handleCodeChange = (e) => {
    const newCode = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (newCode.length <= 6) {
      setCode(newCode);
      setError("");
      setSuccess("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!code || code.length !== 6) {
      setError("El código debe tener exactamente 6 caracteres");
      return;
    }

    if (!user) {
      setError("Debes iniciar sesión para vincular un dispositivo");
      return;
    }

    setIsLinking(true);
    setError("");
    setSuccess("");

    try {
      // Obtener datos del usuario actual
      const userRef = doc(db, "usuarios", user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error("No se encontraron los datos del usuario");
      }

      const userData = userDoc.data();

      // Vincular dispositivo con userData del usuario
      await linkDevice(code, user.uid, userData);

      setSuccess(`¡Dispositivo ${code} vinculado exitosamente!`);
      setCode("");

      // Callback opcional para notificar al componente padre
      if (onDeviceLinked) {
        onDeviceLinked(code, userData);
      }
    } catch (error) {
      console.error("Error vinculando dispositivo:", error);

      // Mensajes de error específicos
      if (error.message.includes("no encontrado")) {
        setError("Código no válido. Verifica que el código sea correcto.");
      } else if (error.message.includes("ya está vinculado")) {
        setError("Este dispositivo ya está vinculado a otro usuario.");
      } else {
        setError(`Error al vincular: ${error.message}`);
      }
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-8">
        <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold mb-4">
          Vincular Nueva Pantalla
        </div>

        <p className="text-gray-600 text-sm mb-6">
          Ingresa el código de 6 caracteres que aparece en tu pantalla Android
          TV
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="deviceCode"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Código del Dispositivo
            </label>
            <input
              type="text"
              id="deviceCode"
              value={code}
              onChange={handleCodeChange}
              placeholder="ABC123"
              className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase tracking-wider"
              disabled={isLinking}
              autoComplete="off"
            />
            <p className="text-xs text-gray-500 mt-1">
              Formato: 6 caracteres (letras y números)
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLinking || code.length !== 6}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isLinking || code.length !== 6
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 transform hover:scale-105 transition-all duration-200"
            }`}
          >
            {isLinking ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Vinculando...
              </div>
            ) : (
              "Vincular Dispositivo"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            ¿Cómo encontrar el código?
          </h3>
          <ol className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                1
              </span>
              Enciende tu Android TV Box
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                2
              </span>
              Abre la aplicación UpperDS
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                3
              </span>
              El código aparecerá en la pantalla
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                4
              </span>
              Ingresa el código aquí y presiona &quot;Vincular&quot;
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default DeviceLinker;
