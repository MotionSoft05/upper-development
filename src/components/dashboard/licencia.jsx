import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCzD--npY_6fZcXH-8CzBV7UGzPBqg85y8",
  authDomain: "upper-a544e.firebaseapp.com",
  projectId: "upper-a544e",
  storageBucket: "upper-a544e.appspot.com",
  messagingSenderId: "665713417470",
  appId: "1:665713417470:web:73f7fb8ee518bea35999af",
  measurementId: "G-QTFQ55YY5D",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function Licencia() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("datosNegocio");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "usuarios", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            setCurrentUser(userDocSnap.data());

            // Obtener datos fiscales si existen
            const datosFiscalesDocRef = doc(db, "DatosFiscales", user.uid);
            const datosFiscalesDocSnap = await getDoc(datosFiscalesDocRef);

            if (datosFiscalesDocSnap.exists()) {
              setDatosFiscales(datosFiscalesDocSnap.data());
            }
          } else {
            const userData = {
              nombre: "Nombre predeterminado",
            };
            await setDoc(userDocRef, userData);
            setCurrentUser(userData);
          }
        } catch (error) {
          console.error("Error al obtener datos del usuario:", error);
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <section className="px-5 md:px-32">
      <div className="p-5">
        <h1 className="mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl">
          Mis datos
        </h1>
      </div>
      <div className="text-lg font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              onClick={() => setSelectedFilter("datosNegocio")}
              className={`${
                selectedFilter === "datosNegocio"
                  ? "border-b-2 border-blue-500"
                  : "hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
              } inline-block p-4 rounded-t-lg`}
            >
              <span className="ml-3">Mi cuenta</span>
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setSelectedFilter("datosFiscales")}
              className={`${
                selectedFilter === "datosFiscales"
                  ? "border-b-2 border-blue-500"
                  : "hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
              } inline-block p-4 rounded-t-lg`}
            >
              <span className="ml-3">Datos de facturación</span>
            </button>
          </li>
        </ul>
      </div>
      <main>
        <main className="main flex flex-col flex-grow -ml-64 md:ml-0 transition-all duration-150 ease-in">
          <div className="main-content flex flex-col flex-grow p-4">
            {selectedFilter === "datosNegocio" && (
              <DatosNegocio currentUser={currentUser} />
            )}
            {selectedFilter === "datosFiscales" && (
              <DatosFiscales currentUser={currentUser} />
            )}
          </div>
        </main>
      </main>
    </section>
  );
}

function DatosFiscales({ currentUser }) {
  console.log("currentUser en DatosFiscales:", currentUser);
  const handleSubmit = async (event) => {
    event.preventDefault();

    const user = auth.currentUser;

    if (!user) {
      console.error("No se ha obtenido el usuario actual.");
      return;
    }

    const userId = user.uid;

    if (!userId) {
      console.error("No se ha obtenido el UID del usuario actual.");
      return;
    }

    const rfc = event.target.rfc.value;
    const razonSocial = event.target.razonSocial.value;
    const codigoPostal = event.target.codigoPostal.value;
    const regimenFiscal = event.target.regimenFiscal.value;
    const usoCdfi = event.target.usoCdfi.value;
    const email = event.target.email.value;

    if (
      !rfc ||
      !razonSocial ||
      !codigoPostal ||
      !regimenFiscal ||
      !usoCdfi ||
      !email
    ) {
      console.error("Por favor, completa todos los campos.");
      return;
    }

    const datosFiscalesDocRef = doc(db, "DatosFiscales", userId);
    const datosFiscalesData = {
      userId,
      rfc,
      razonSocial,
      codigoPostal,
      regimenFiscal,
      usoCdfi,
      email,
    };

    try {
      await setDoc(datosFiscalesDocRef, datosFiscalesData);
      console.log("Datos fiscales enviados correctamente.");
    } catch (error) {
      console.error("Error al enviar datos fiscales:", error);
    }
  };
  return (
    <section className="px-8 py-12">
      <h1>Datos Fiscales</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label
            htmlFor="rfc"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            RFC
          </label>
          <input
            type="text"
            id="rfc"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="ABC 680524 P-76"
            maxLength="20"
            defaultValue={currentUser ? currentUser.rfc : ""}
            required
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="razonSocial"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Nombre/Razón social
          </label>
          <input
            type="text"
            id="razonSocial"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder=""
            maxLength="100"
            defaultValue={currentUser ? currentUser.razonSocial : ""}
            required
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="codigoPostal"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Código postal
          </label>
          <input
            type="text"
            id="codigoPostal"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="01000"
            maxLength="10"
            defaultValue={currentUser ? currentUser.codigoPostal : ""}
            required
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="regimenFiscal"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Régimen fiscal
          </label>
          <input
            type="text"
            id="regimenFiscal"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder=""
            maxLength="70"
            defaultValue={currentUser ? currentUser.regimenFiscal : ""}
            required
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="usoCdfi"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Uso de CDFI
          </label>
          <input
            type="text"
            id="usoCdfi"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder=""
            maxLength="24"
            defaultValue={currentUser ? currentUser.usoCdfi : ""}
            required
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Tu correo electrónico
          </label>
          <input
            type="email"
            id="email"
            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="ejemplo@gmail.com"
            defaultValue={currentUser ? currentUser.email : ""}
            required
          />
        </div>
        <button
          type="submit"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
        >
          Enviar
        </button>
      </form>
    </section>
  );
}

function DatosNegocio({ currentUser }) {
  return (
    <section className="px-8 py-12">
      <h1>Datos de Negocio</h1>
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <tbody>
            <tr className="bg-white border-b">
              <th
                scope="row"
                className="px-6 py-4 font-extrabold text-gray-900"
              >
                Nombre
              </th>
              <td className="px-6 py-4">
                {currentUser ? currentUser.nombre : ""}
              </td>
            </tr>
            <tr className="bg-white border-b">
              <th
                scope="row"
                className="px-6 py-4 font-extrabold text-gray-900"
              >
                Apellido
              </th>
              <td className="px-6 py-4">
                {currentUser ? currentUser.apellido : ""}
              </td>
            </tr>
            <tr className="bg-white border-b">
              <th
                scope="row"
                className="px-6 py-4 font-extrabold text-gray-900"
              >
                Correo
              </th>
              <td className="px-6 py-4">
                {currentUser ? currentUser.email : ""}
              </td>
            </tr>
            <tr className="bg-white border-b">
              <th
                scope="row"
                className="px-6 py-4 font-extrabold text-gray-900"
              >
                Teléfono de contacto
              </th>
              <td className="px-6 py-4">
                {currentUser ? currentUser.telefono : ""}
              </td>
            </tr>
            <tr className="bg-white border-b">
              <th
                scope="row"
                className="px-6 py-4 font-extrabold text-gray-900"
              >
                Fecha de expiración
              </th>
              <td className="px-6 py-4">
                {currentUser ? currentUser.fechaExpiracion : ""}
              </td>
            </tr>
            <tr className="bg-white border-b">
              <th
                scope="row"
                className="px-6 py-4 font-extrabold text-gray-900"
              >
                Tipo de membresía
              </th>
              <td className="px-6 py-4">
                {currentUser ? currentUser.tipoPlan : ""}
              </td>
            </tr>
            <tr className="bg-white border-b">
              <th
                scope="row"
                className="px-6 py-4 font-extrabold text-gray-900"
              >
                Número de licencias
              </th>
              <td className="px-6 py-4">
                {currentUser ? currentUser.total : ""}
              </td>
            </tr>
            <tr className="bg-white border-b">
              <th
                scope="row"
                className="px-6 py-4 font-extrabold text-gray-900"
              >
                Nombre de la empresa
              </th>
              <td className="px-6 py-4">
                {currentUser ? currentUser.empresa : ""}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default Licencia;
