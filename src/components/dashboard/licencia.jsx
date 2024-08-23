import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import auth from "@/firebase/auth";
import db from "@/firebase/firestore";

function Licencia() {
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState(null);
  console.log("🚀 ~ Licencia ~ currentUser:", currentUser);
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
              DatosFiscales(datosFiscalesDocSnap.data());
            }
          } else {
            const userData = {
              nombre: "Nombre predeterminado",
            };
            await setDoc(userDocRef, userData);
            setCurrentUser(userData);
          }
        } catch (error) {
          // "Error al obtener datos del usuario:"
          console.error(t("licencia.messages.userFetch"), error);
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
          {/* Mis datos */}
          {t("licencia.myData")}
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
              <span className="ml-3">
                {/* Mi cuenta */}
                {t("licencia.account")}
              </span>
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
              <span className="ml-3">
                {/* Datos de facturación */}
                {t("licencia.billingData")}
              </span>
            </button>
          </li>
        </ul>
      </div>
      <main>
        <main className="main ">
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
  const { t } = useTranslation();

  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [datosFiscales, setDatosFiscales] = useState({
    rfc: "",
    razonSocial: "",
    codigoPostal: "",
    regimenFiscal: "",
    usoCdfi: "",
    email: "",
  });

  useEffect(() => {
    const fetchDatosFiscales = async () => {
      try {
        const user = getAuth().currentUser;

        if (user) {
          const userId = user.uid;
          const datosFiscalesDocRef = doc(db, "DatosFiscales", userId);
          const datosFiscalesDocSnap = await getDoc(datosFiscalesDocRef);

          if (datosFiscalesDocSnap.exists()) {
            const datosFiscalesData = datosFiscalesDocSnap.data();
            setDatosFiscales(datosFiscalesData);
            // "Datos Fiscales recibidos:"
            console.log(
              t("licencia.messages.fiscalDataReceived"),
              datosFiscalesData
            );
          } else {
            // "No se encontraron datos fiscales para el usuario."
            console.log(t("licencia.messages.noFiscalData"));
          }
        }
      } catch (error) {
        // "Error al obtener datos fiscales:"
        console.error(t("licencia.messages.fiscalDataFetch"), error);
      }
    };

    fetchDatosFiscales();
  }, []);
  const handleSubmit = async (event) => {
    event.preventDefault();

    const user = auth.currentUser;

    if (!user) {
      // "No se ha obtenido el usuario actual."
      console.error(t("licencia.messages.currentUserFetch"));
      return;
    }

    const userId = user.uid;

    if (!userId) {
      // "No se ha obtenido el UID del usuario actual."
      console.error(t("licencia.messages.uidFetch"));
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
      // "Por favor, completa todos los campos."
      console.error(t("licencia.messages.fieldsIncomplete"));
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
      setGuardadoExitoso(true);
      // "Datos fiscales enviados correctamente."
      console.log(t("licencia.messages.fiscalDataSent"));
    } catch (error) {
      // "Error al enviar datos fiscales:"
      console.error(t("licencia.messages.fiscalDataError"), error);
    }
  };
  return (
    <section className="px-8 py-12">
      <h1>
        {/* Datos Fiscales */}
        {t("licencia.fiscalData")}
      </h1>
      {guardadoExitoso && (
        <div className="text-green-500 font-bold mb-4">
          {/* ¡Datos fiscales guardados correctamente! */}
          {t("licencia.fiscalDataSaved")}
        </div>
      )}
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
            defaultValue={datosFiscales.rfc}
            required
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="razonSocial"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            {/* Nombre/Razón social */}
            {t("licencia.nameOrBusiness")}
          </label>
          <input
            type="text"
            id="razonSocial"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder=""
            maxLength="100"
            defaultValue={datosFiscales.razonSocial}
            required
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="codigoPostal"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            {/* Código postal */}
            {t("licencia.postalCode")}
          </label>
          <input
            type="text"
            id="codigoPostal"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="01000"
            maxLength="10"
            defaultValue={datosFiscales.codigoPostal}
            required
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="regimenFiscal"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            {/* Régimen fiscal */}
            {t("licencia.taxRegime")}
          </label>
          <input
            type="text"
            id="regimenFiscal"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder=""
            maxLength="70"
            defaultValue={datosFiscales.regimenFiscal}
            required
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="usoCdfi"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            {/* Uso de CDFI */}
            {t("licencia.cfdiUsage")}
          </label>
          <input
            type="text"
            id="usoCdfi"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder=""
            maxLength="24"
            defaultValue={datosFiscales.usoCdfi}
            required
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            {/* Tu correo electrónico */}
            {t("licencia.youEmail")}
          </label>
          <input
            type="email"
            id="email"
            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="ejemplo@gmail.com"
            defaultValue={datosFiscales.email}
            required
          />
        </div>
        <button
          type="submit"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
        >
          {/* Guardar */}
          {t("licencia.save")}
        </button>
      </form>
    </section>
  );
}

function DatosNegocio({ currentUser }) {
  const { t } = useTranslation();
  return (
    <section className="px-8 py-12">
      <h1>
        {/* Datos de Negocio */}
        {t("licencia.businessData")}
      </h1>
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <tbody>
            <tr className="bg-white border-b">
              <th
                scope="row"
                className="px-6 py-4 font-extrabold text-gray-900"
              >
                {/* Nombre */}
                {t("licencia.name")}
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
                {/* Apellido */}
                {t("licencia.surname")}
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
                {/* Correo */}
                {t("licencia.email")}
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
                {/* Teléfono de contacto */}
                {t("licencia.contactPhone")}
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
                {/* Fecha de Inicio */}
                {t("licencia.startDate")}
              </th>
              <td className="px-6 py-4">
                {currentUser ? currentUser.inicio : ""}
              </td>
            </tr>
            <tr className="bg-white border-b">
              <th
                scope="row"
                className="px-6 py-4 font-extrabold text-gray-900"
              >
                {/* Fecha de expiración */}
                {t("licencia.expirationDate")}
              </th>
              <td className="px-6 py-4">
                {currentUser ? currentUser.final : ""}
              </td>
            </tr>
            <tr className="bg-white border-b">
              <th
                scope="row"
                className="px-6 py-4 font-extrabold text-gray-900"
              >
                {/* Tipo de membresía */}
                {t("licencia.membershipType")}
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
                {/* Número de licencias */}
                {t("licencia.licenseNumber")}
              </th>
              {/* Esto es con pantalla servicios o sin esto? */}
              <td className="px-6 py-4">
                {currentUser ? +currentUser.pd + +currentUser.ps : ""}
              </td>
            </tr>
            <tr className="bg-white border-b">
              <th
                scope="row"
                className="px-6 py-4 font-extrabold text-gray-900"
              >
                {/* Nombre de la empresa */}
                {t("licencia.companyName")}
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
