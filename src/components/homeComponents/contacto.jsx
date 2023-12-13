import { useState, Fragment, useCallback, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import emailjs from "emailjs-com";

function Contacto() {
  const [isOpen, setIsOpen] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [subjectError, setSubjectError] = useState("");
  const [messageError, setMessageError] = useState("");

  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);

  useEffect(() => {
    // Check for validation errors after the state has been updated
    if (!isOpen && (emailError || phoneError || subjectError || messageError)) {
      setIsEmailSent(false);
    }
  }, [isOpen, emailError, phoneError, subjectError, messageError]);

  const handlePhoneChange = useCallback((event) => {
    const inputPhoneNumber = event.target.value;
    const validatedPhoneNumber = inputPhoneNumber
      .replace(/[^\d+]/g, "")
      .substring(0, 15);

    setPhoneNumber(validatedPhoneNumber);
  }, []);

  const validateEmail = useCallback(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(
      !emailRegex.test(email) ? "Ingrese un correo electrónico válido." : ""
    );
  }, [email]);

  const validatePhone = useCallback(() => {
    setPhoneError(!phoneNumber.trim() ? "Ingrese un número de teléfono." : "");
  }, [phoneNumber]);

  const validateSubject = useCallback(() => {
    setSubjectError(!subject.trim() ? "Ingrese un asunto." : "");
  }, [subject]);

  const validateMessage = useCallback(() => {
    setMessageError(!message.trim() ? "Ingrese un mensaje." : "");
  }, [message]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setEmail("");
    setPhoneNumber("");
    setSubject("");
    setMessage("");
  }, []);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const sendEmail = useCallback(() => {
    validateEmail();
    validatePhone();
    validateSubject();
    validateMessage();

    if (!(emailError || phoneError || subjectError || messageError)) {
      const templateParams = {
        to_name: "Destinatario",
        from_name: "Remitente",
        email: email,
        telefono: phoneNumber,
        asunto: subject,
        mensaje: message,
      };

      const serviceId = "service_qjv3qpt";
      const templateId = "template_8pvt3ps";
      const userId = "MEzsSEWILjBamER7b";

      emailjs.send(serviceId, templateId, templateParams, userId).then(
        (response) => {
          console.log("Correo electrónico enviado:", response);
          setIsEmailSent(true);
          openModal();
        },
        (error) => {
          console.error("Error al enviar el correo electrónico:", error);
        }
      );
    }
  }, [
    email,
    phoneNumber,
    subject,
    message,
    validateEmail,
    validatePhone,
    validateSubject,
    validateMessage,
    emailError,
    phoneError,
    subjectError,
    messageError,
    openModal,
  ]);

  return (
    <section id="contacto">
      <div className="pt-24  px-4 mx-auto max-w-screen-md">
        <h2 className="mb-4 text-lg md:text-4xl tracking-tight font-extrabold text-center text-custom ">
          Contáctenos
        </h2>
        <p className="mb-8 lg:mb-16 font-light text-center   md:text-xl">
          Nuestra sección de contacto es el canal directo para conectarte con
          Upper DS. A continuación, encontrarás las opciones para cotizar y
          contratar nuestros servicios​
        </p>
        <form action="#" className="space-y-8">
          <div>
            <label
              for="email"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Correo electrónico ​
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={validateEmail}
              className={`shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 ${
                emailError ? "border-red-500" : ""
              }`}
              placeholder="Ejemplo@gmail.com"
              required
            />
            {emailError && <p className="text-red-500">{emailError}</p>}
          </div>
          <div>
            <label
              htmlFor="subject"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Teléfono
            </label>
            <input
              type="tel"
              id="phone"
              value={phoneNumber}
              onChange={handlePhoneChange}
              onBlur={validatePhone}
              className={`shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 ${
                phoneError ? "border-red-500" : ""
              }`}
              placeholder="(55) 1234-5678"
              required
            />
            {phoneError && <p className="text-red-500">{phoneError}</p>}
          </div>
          <div>
            <label
              for="subject"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Asunto
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              onBlur={validateSubject}
              className={`shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 ${
                subjectError ? "border-red-500" : ""
              }`}
              placeholder="Asunto"
              required
            />
            {subjectError && <p className="text-red-500">{subjectError}</p>}
          </div>
          <div className="sm:col-span-2">
            <label
              for="message"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Mensaje
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onBlur={validateMessage}
              rows="4"
              className={`shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 ${
                messageError ? "border-red-500" : ""
              }`}
              placeholder="Escribe tu mensaje..."
              required
            />
            {messageError && <p className="text-red-500">{messageError}</p>}
          </div>
          <button
            type="button"
            onClick={sendEmail}
            disabled={
              emailError ||
              phoneError ||
              subjectError ||
              messageError ||
              !email ||
              !phoneNumber ||
              !subject ||
              !message
            }
            className={`py-3 px-5 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 bg-Second`}
            style={{
              cursor:
                emailError ||
                phoneError ||
                subjectError ||
                messageError ||
                !email ||
                !phoneNumber ||
                !subject ||
                !message
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            Enviar mensaje
          </button>

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
                        Su pregunta a sido enviada
                      </Dialog.Title>
                      <div className="mt-2">
                        {isEmailSent && (
                          <p className="text-sm text-gray-500">
                            Agradecemos tu interés en Upper DS. Hemos recibido
                            tu mensaje y nuestro equipo se pondrá en contacto
                            contigo pronto.
                          </p>
                        )}
                      </div>

                      <div className="mt-4">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          onClick={closeModal}
                        >
                          Gracias!
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
