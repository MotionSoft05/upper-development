import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore";
import { useTranslation } from "react-i18next";
import auth from "@/firebase/auth";
import db from "@/firebase/firestore";

function Licencia() {
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState(null);
  const [fiscalData, setFiscalData] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "usuarios", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setCurrentUser(userData);

            // Fetch all fiscal data for the company
            const empresa = userData.empresa;
            if (empresa) {
              const q = query(
                collection(db, "DatosFiscales"),
                where("empresa", "==", empresa)
              );
              const querySnapshot = await getDocs(q);
              const fetchedFiscalData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
              setFiscalData(fetchedFiscalData);
            }
          } else {
            const userData = {
              nombre: "Nombre predeterminado",
            };
            await setDoc(userDocRef, userData);
            setCurrentUser(userData);
          }
        } catch (error) {
          console.error(t("licencia.messages.userFetch"), error);
          setErrorMessage(t("licencia.messages.userFetch"));
        }
      } else {
        setCurrentUser(null);
        setFiscalData([]);
      }
    });

    return () => unsubscribe();
  }, [t]);

  // Function to show success message and clear it after 3 seconds
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  // Function to show error message and clear it after 3 seconds
  const showErrorMessage = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage(null);
    }, 3000);
  };

  return (
    <section className="px-5 md:px-32 py-6">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          {t("licencia.myTitle")}
        </h1>
        <p className="text-gray-600">{t("licencia.billingData")}</p>
      </div>

      {/* Status Messages */}
      {successMessage && (
        <div
          className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6"
          role="alert"
        >
          <p className="font-bold">{t("licencia.fiscalDataSaved")}</p>
          <p>{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
          role="alert"
        >
          <p className="font-bold">{t("licencia.messages.fiscalDataError")}</p>
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <DatosFiscales
            currentUser={currentUser}
            showSuccessMessage={showSuccessMessage}
            showErrorMessage={showErrorMessage}
          />
        </div>
      </div>
    </section>
  );
}

function DatosFiscales({ currentUser, showSuccessMessage, showErrorMessage }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [fiscalData, setFiscalData] = useState({
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
        setLoading(true);
        if (currentUser && currentUser.empresa) {
          const empresa = currentUser.empresa;
          console.log("Nombre de empresa del usuario:", empresa);

          const q = query(
            collection(db, "DatosFiscales"),
            where("empresa", "==", empresa)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const datosFiscalesData = querySnapshot.docs[0].data();
            setFiscalData(datosFiscalesData);
            console.log(
              t("licencia.messages.fiscalDataReceived"),
              datosFiscalesData
            );
          } else {
            console.log(t("licencia.messages.noFiscalData"));
          }
        }
      } catch (error) {
        console.error(t("licencia.messages.fiscalDataFetch"), error);
        showErrorMessage(t("licencia.messages.fiscalDataFetch"));
      } finally {
        setLoading(false);
      }
    };

    fetchDatosFiscales();
  }, [currentUser, t, showErrorMessage]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFiscalData({ ...fiscalData, [id]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const user = auth.currentUser;

    if (!user) {
      showErrorMessage(t("licencia.messages.currentUserFetch"));
      setLoading(false);
      return;
    }

    const formData = {
      rfc: event.target.rfc.value,
      razonSocial: event.target.razonSocial.value,
      codigoPostal: event.target.codigoPostal.value,
      regimenFiscal: event.target.regimenFiscal.value,
      usoCdfi: event.target.usoCdfi.value,
      email: event.target.email.value,
      empresa: currentUser?.empresa || fiscalData.empresa,
    };

    // Validate all fields are filled
    const requiredFields = Object.entries(formData).filter(
      ([key]) => key !== "id"
    );
    const missingFields = requiredFields.filter(([_, value]) => !value);

    if (missingFields.length > 0) {
      showErrorMessage(t("licencia.messages.fieldsIncomplete"));
      setLoading(false);
      return;
    }

    try {
      // Query to verify if a document with the company name already exists
      const q = query(
        collection(db, "DatosFiscales"),
        where("empresa", "==", formData.empresa)
      );
      const querySnapshot = await getDocs(q);

      let docRef;
      if (!querySnapshot.empty) {
        // If we find the company, we get the reference of the first document
        const existingDoc = querySnapshot.docs[0];
        docRef = doc(db, "DatosFiscales", existingDoc.id);
      } else {
        // If there are no documents for that company, we create a new document with a unique ID
        docRef = doc(collection(db, "DatosFiscales"));
      }

      // Overwrite or create the document
      await setDoc(docRef, formData);

      showSuccessMessage(t("licencia.messages.fiscalDataSent"));
      console.log(t("licencia.messages.fiscalDataSent"));
    } catch (error) {
      console.error(t("licencia.messages.fiscalDataError"), error);
      showErrorMessage(t("licencia.messages.fiscalDataError"));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !fiscalData.rfc) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {t("licencia.fiscalData")}
      </h2>
      <p className="text-gray-600 mb-6">{t("licencia.billingData")}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* RFC Field */}
          <div>
            <label
              htmlFor="rfc"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              RFC
            </label>
            <input
              type="text"
              id="rfc"
              value={fiscalData.rfc || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="ABC 680524 P-76"
              maxLength="20"
            />
          </div>

          {/* Business Name Field */}
          <div>
            <label
              htmlFor="razonSocial"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("licencia.nameOrBusiness")}
            </label>
            <input
              type="text"
              id="razonSocial"
              value={fiscalData.razonSocial || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your Company Name"
              maxLength="100"
            />
          </div>

          {/* Postal Code Field */}
          <div>
            <label
              htmlFor="codigoPostal"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("licencia.postalCode")}
            </label>
            <input
              type="text"
              id="codigoPostal"
              value={fiscalData.codigoPostal || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="01000"
              maxLength="10"
            />
          </div>

          {/* Tax Regime Field */}
          <div>
            <label
              htmlFor="regimenFiscal"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("licencia.taxRegime")}
            </label>
            <input
              type="text"
              id="regimenFiscal"
              value={fiscalData.regimenFiscal || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tax Regime"
              maxLength="70"
            />
          </div>

          {/* CFDI Usage Field */}
          <div>
            <label
              htmlFor="usoCdfi"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("licencia.cfdiUsage")}
            </label>
            <input
              type="text"
              id="usoCdfi"
              value={fiscalData.usoCdfi || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="CFDI Usage"
              maxLength="24"
            />
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("licencia.youEmail")}
            </label>
            <input
              type="email"
              id="email"
              value={fiscalData.email || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="ejemplo@gmail.com"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {loading ? (
              <span className="flex items-center">
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
                {t("licencia.save")}
              </span>
            ) : (
              t("licencia.save")
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// Account data section removed as requested

export default Licencia;
