import React, { useState } from "react";
import emailjs from "emailjs-com";
import { useTranslation } from "react-i18next";
import { HiOutlineMail, HiOutlineUser, HiOutlineChat } from "react-icons/hi";
import { FiSend, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

function Soporte() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Categorías de soporte
  const supportCategories = [
    { value: "general", label: t("support.categoryGeneral") || "General" },
    {
      value: "technical",
      label: t("support.categoryTechnical") || "Soporte Técnico",
    },
    { value: "billing", label: t("support.categoryBilling") || "Facturación" },
    {
      value: "feature",
      label: t("support.categoryFeature") || "Sugerencia de Funcionalidad",
    },
  ];

  function sendEmail() {
    // Reset estados
    setError("");

    // Validar campos
    if (!name || !email || !message) {
      setError(
        t("support.errorMessageFields") ||
          "Por favor, completa todos los campos antes de enviar el mensaje."
      );
      return;
    }

    // Validar correo electrónico
    if (!emailRegex.test(email)) {
      setError(
        t("support.validEmailError") ||
          "Por favor, ingresa un correo electrónico válido."
      );
      return;
    }

    // Iniciar loading
    setLoading(true);

    const templateParams = {
      to_name: "motionsoft-@hotmail.com",
      name: name,
      email: email,
      mensaje: message,
      category: category,
    };

    const serviceId = "service_y3wemni";
    const templateId = "template_jas85ew";
    const userId = "IVTJPKKd0ooe1am6U";

    emailjs
      .send(serviceId, templateId, templateParams, userId)
      .then(
        (response) => {
          console.log(
            t("support.consoleSuccess") || "Correo electrónico enviado:",
            response
          );
          setSuccess(true);
          setError("");

          // Limpiar el formulario después de enviar
          setName("");
          setEmail("");
          setMessage("");
          setCategory("general");

          // Quitar mensaje de éxito después de 5 segundos
          setTimeout(() => {
            setSuccess(false);
          }, 5000);
        },
        (error) => {
          console.error(
            t("support.consoleError") ||
              "Error al enviar el correo electrónico:",
            error
          );
          setError(
            t("support.errorMessage") ||
              "Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo más tarde."
          );
        }
      )
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <section className="px-5 md:px-32 py-8">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
          {t("support.contactTitle") || "CONTACTO SOPORTE"}
        </h1>
        <div className="h-1 w-20 bg-blue-500 rounded"></div>
      </div>

      {/* Contenido principal */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Banner superior */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
          <h2 className="text-2xl font-bold mb-3">
            {t("support.bannerTitle") || "Estamos aquí para ayudarte"}
          </h2>
          <p className="opacity-90">
            {t("support.bannerSubtitle") ||
              "Nuestro equipo de soporte está listo para resolver tus dudas"}
          </p>
        </div>

        <div className="p-8 md:flex">
          {/* Columna izquierda - Información */}
          <div className="md:w-1/3 mb-8 md:mb-0 md:pr-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t("support.infoTitle") || "Cómo podemos ayudarte"}
            </h3>

            <div className="space-y-4 text-gray-600">
              <p>
                {t("support.contactSubtitle1") ||
                  "¿Estás experimentando algún problema técnico que necesitas resolver? ¡No te preocupes! Estamos aquí para ayudarte."}
              </p>
              <p>
                {t("support.contactSubtitle2") ||
                  "Para agilizar el proceso y brindarte la asistencia que necesitas, te invitamos a generar un reporte para nuestro equipo de soporte técnico."}
              </p>

              <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-blue-700 mb-2">
                  {t("support.tipTitle") || "Consejo útil"}
                </h4>
                <p className="text-blue-600 text-sm">
                  {t("support.tipContent") ||
                    "Proporciona la mayor cantidad de detalles posible para que podamos resolver tu problema más rápidamente."}
                </p>
              </div>
            </div>
          </div>

          {/* Columna derecha - Formulario */}
          <div className="md:w-2/3 md:pl-8 md:border-l border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">
              {t("support.formTitle") || "Completa el formulario"}
            </h3>

            <form className="space-y-6">
              {/* Categoría de soporte */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("support.categoryLabel") || "Categoría"}
                </label>
                <select
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {supportCategories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campo Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("support.nameLabel") || "Nombre"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiOutlineUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t("support.namePlaceholder") || "Nombre"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              {/* Campo Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("support.emailLabel") || "Correo electrónico"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiOutlineMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={
                      t("support.emailPlaceholder") || "Correo electrónico"
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Campo Mensaje */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("support.messageLabel") || "Mensaje"}
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <HiOutlineChat className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="5"
                    placeholder={
                      t("support.messagePlaceholder") || "Su mensaje"
                    }
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  ></textarea>
                </div>
              </div>

              {/* Mensajes de error o éxito */}
              {error && (
                <div className="flex items-center bg-red-50 text-red-500 p-3 rounded-lg">
                  <FiAlertCircle className="h-5 w-5 mr-2" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-center bg-green-50 text-green-500 p-3 rounded-lg">
                  <FiCheckCircle className="h-5 w-5 mr-2" />
                  <p className="text-sm">
                    {t("support.successMessage") ||
                      "¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto."}
                  </p>
                </div>
              )}

              {/* Botón de envío */}
              <button
                type="button"
                onClick={sendEmail}
                disabled={loading}
                className="flex items-center justify-center w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition duration-150 ease-in-out"
              >
                {loading ? (
                  <>
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
                    {t("support.sendingButton") || "Enviando..."}
                  </>
                ) : (
                  <>
                    <FiSend className="mr-2" />
                    {t("support.sendButton") || "Enviar mensaje"}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Soporte;
