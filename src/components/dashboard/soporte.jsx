import React, { useState } from "react";
import emailjs from "emailjs-com";
import { useTranslation } from "react-i18next";

function Soporte() {

  const {t} = useTranslation()
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function sendEmail() {
    // Validar campos
    if (!name || !email || !message) {
      setError(
        // "Por favor, completa todos los campos antes de enviar el mensaje."
        t("support.errorMessageFields")
      );
      return;
    }

    // Validar correo electrónico
    if (!emailRegex.test(email)) {
      // "Por favor, ingresa un correo electrónico válido."
      setError(t("support.validEmailError"));
      return;
    }

    const templateParams = {
      to_name: "Destinatario",
      name: name,
      email: email,
      mensaje: message,
    };

    const serviceId = "service_y3wemni";
    const templateId = "template_jas85ew";
    const userId = "IVTJPKKd0ooe1am6U";

    emailjs.send(serviceId, templateId, templateParams, userId).then(
      (response) => {
        // "Correo electrónico enviado:"
        console.log(t("support.consoleSuccess"), response);
        setSuccess(true);
        setError("");
      },
      (error) => {
        // "Error al enviar el correo electrónico:"
        console.error(t("support.consoleError"), error);
        setError(
          // "Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo más tarde."
          t("support.errorMessage")
        );
      }
    );
  }

  return (
    <section className="px-5 md:px-32">
      <div className="p-5">
        <h1 className="mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl">
          {/* CONTACTO SOPORTE */}
          {t("support.contactTitle")}
        </h1>
      </div>
      <div className="container px-6 md:px-12 mt-10">
        <div className="block rounded-lg px-6 py-12 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]  shadow-black/20 md:py-16 md:px-12 -mt-[50px] backdrop-blur-[30px]">
          <div className="mb-12 ">
            <div className="flex flex-col space-y-5 mx-auto mb-12 text-center lg:mb-0">
              <h1 className="font-medium">
                {/* ¿Estás experimentando algún ... */}
                {t("support.contactSubtitle1")}
              </h1>
              <h2 className="font-medium">
                {/* Para agilizar el proceso y brindarte ... */}
                {t("support.contactSubtitle2")}
              </h2>
              <h2 className="font-medium">
                {/* Simplemente completa el formulario con todos ... */}
                {t("support.contactSubtitle3")}
              </h2>
            </div>
          </div>
          <div className="mx-auto max-w-[700px]">
            <form>
              <div className="relative mb-6" data-te-input-wrapper-init>
                <input
                  type="text"
                  className="w-full rounded bg-transparent pl-2 py-[0.32rem] text-black border border-sky-100 "
                  id="exampleInput90"
                  placeholder={t("support.namePlaceholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="relative mb-6" data-te-input-wrapper-init>
                <input
                  type="email"
                  className="w-full rounded bg-transparent pl-2 py-[0.32rem] text-black border border-sky-100 "
                  placeholder={t("support.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <textarea
                  className="w-full rounded bg-transparent pl-2 py-[0.32rem] text-black border border-sky-100 "
                  id="exampleFormControlTextarea1"
                  rows="3"
                  placeholder={t("support.messagePlaceholder")}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
              </div>

              <button
                type="button"
                onClick={sendEmail}
                className="block w-full bg-indigo-600 mt-4 py-2 rounded-2xl text-white font-semibold mb-2"
              >
                {/* Enviar */}
                {t("support.sendButton")}
              </button>
            </form>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {success && (
              <p className="text-green-500 text-sm mt-2">
                {/* ¡Mensaje enviado con éxito! Nos pondremos en ... */}
                {t("support.successMessage")}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
export default Soporte;
