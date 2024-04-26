import { useTranslation } from 'react-i18next';
import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import emailjs from "emailjs-com";

function Contacto() {
  const {t} = useTranslation(); // Traduccion de i18n
  
  let [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function handlePhoneChange(event) {
    const inputPhoneNumber = event.target.value;
    const validatedPhoneNumber = inputPhoneNumber.replace(/[^\d]/g, ""); // Reemplaza cualquier cosa que no sea un dígito con una cadena vacía

    setPhoneNumber(validatedPhoneNumber);
  }

  function closeModal() {
    setIsOpen(false);
    setEmail("");
    setPhoneNumber("");
    setSubject("");
    setMessage("");
  }

  function openModal() {
    setIsOpen(true);
  }

  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function handlePhoneChange(event) {
    const inputPhoneNumber = event.target.value;
    const validatedPhoneNumber = inputPhoneNumber
      .replace(/[^\d+()-]/g, "")
      .substring(0, 16);

    setPhoneNumber(validatedPhoneNumber);
  }

  function sendEmail() {
    // Validar el correo electrónico
    if (!email || !phoneNumber || !subject || !message) {
      setError(
        t("contacto.validationMessage")
      );
      return;
    }

    // Validar el correo electrónico solo si está presente
    if (email && !emailRegex.test(email)) {
      setError(t("contacto.validEmailError"));
      return;
    }

    // Validar el número de teléfono solo si está presente
    if (phoneNumber && !/^[+\d()-]+$/.test(phoneNumber)) {
      setError(t("contacto.validationNumber"));
      return;
    }

    const templateParams = {
      to_name: "Destinatario",
      from_name: "Remitente",
      email: email,
      telefono: phoneNumber,
      asunto: subject,
      mensaje: message,
    };

    const serviceId = "service_y3wemni";
    const templateId = "template_jas85ew";
    const userId = "IVTJPKKd0ooe1am6U";

    emailjs.send(serviceId, templateId, templateParams, userId).then(
      (response) => {
        console.log("Correo electrónico enviado:", response);
        setSuccess(true);
        setError("");
        openModal();
      },
      (error) => {
        console.error("Error al enviar el correo electrónico:", error);
        setError(
          "Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo más tarde."
        );
      }
    );
  }

  return (
    <section id="contacto">
      <div className="pt-24  px-4 mx-auto max-w-screen-md">
        <h2 className="mb-4 text-lg md:text-4xl tracking-tight font-extrabold text-center text-custom ">
          {/* Contáctenos */}
          {t("contacto.title")}
        </h2>
        <p className="mb-8 lg:mb-16 font-light text-center   md:text-xl">
          {t("contacto.description")}
        </p>
        <form action="#" className="space-y-8">
          <div>
            <label
              for="email"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              {/* Correo electrónico ​ */}
              {t("contacto.email")}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5  "
              placeholder={t("contacto.emailPlaceholder")}
              required
            />
          </div>
          <div>
            <label
              htmlFor="subject"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              {/* Teléfono */}
              {t("contacto.phone")}
            </label>
            <input
              type="text"
              id="Tema"
              value={phoneNumber} // Asignar el estado del número de teléfono al valor del input
              onChange={handlePhoneChange} //! PUEDE QUE ESTO NO ANDE
              className="block p-3 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 "
              placeholder="(55) 1234-5678"
              required
            />
          </div>
          <div>
            <label
              for="subject"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              {/* Asunto */}
              {t("contacto.subject")}
            </label>
            <input
              type="text"
              id="Tema"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="block p-3 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 "
              placeholder={t("contacto.subjectPlaceholder")}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label
              for="message"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              {/* Mensaje */}
              {t("contacto.message")}
            </label>
            <textarea
              id="message"
              rows="6"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg shadow-sm border border-gray-300 focus:ring-primary-500 focus:border-primary-500 "
              placeholder={t("contacto.messagePlaceholder")}
            ></textarea>
          </div>
          <button
            type="button"
            onClick={sendEmail}
            className="py-3 px-5 text-sm font-medium text-center text-white rounded-lg bg-primary-700 sm:w-fit hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 bg-Second"
          >
            {/* Enviar mensaje */}
            {t("contacto.sendMessage")}
          </button>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={closeModal}>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black bg-opacity-25" />
              </Transition.Child>

              <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900"
                      >
                        {/* Su pregunta a sido enviada */}
                        {t("contacto.successMessage")}
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          {t("contacto.successMessageNote")}
                        </p>
                      </div>

                      <div className="mt-4">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          onClick={closeModal}
                        >
                          {/* Gracias! */}
                          {t("contacto.thankYou")}
                        </button>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>
        </form>
      </div>
    </section>
  );
}
export default Contacto;
