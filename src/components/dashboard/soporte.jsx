import React, { useState } from "react";
import emailjs from "emailjs-com";

function Soporte() {
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
        "Por favor, completa todos los campos antes de enviar el mensaje."
      );
      return;
    }

    // Validar correo electrónico
    if (!emailRegex.test(email)) {
      setError("Por favor, ingresa un correo electrónico válido.");
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
        console.log("Correo electrónico enviado:", response);
        setSuccess(true);
        setError("");
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
    <section className="px-5 md:px-32">
      <div className="p-5">
        <h1 className="mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl">
          CONTACTO SOPORTE
        </h1>
      </div>
      <div className="container px-6 md:px-12 mt-10">
        <div className="block rounded-lg px-6 py-12 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]  shadow-black/20 md:py-16 md:px-12 -mt-[50px] backdrop-blur-[30px]">
          <div className="mb-12 ">
            <div className="flex flex-col space-y-5 mx-auto mb-12 text-center lg:mb-0">
              <h1 className="font-medium">
                ¿Estás experimentando algún problema técnico que necesitas
                resolver? ¡No te preocupes! Estamos aquí para ayudarte.
              </h1>
              <h2 className="font-medium">
                Para agilizar el proceso y brindarte la asistencia que
                necesitas, te invitamos a generar un reporte para nuestro equipo
                de soporte técnico. ¡Es fácil y rápido!
              </h2>
              <h2 className="font-medium">
                Simplemente completa el formulario con todos los detalles
                relevantes sobre el problema que estás enfrentando. Cuanta más
                información nos proporciones, mejor podremos ayudarte.
              </h2>
            </div>
          </div>
          <div className="mx-auto max-w-[700px]">
            <form>
              <div className="relative mb-6" data-te-input-wrapper-init>
                <input
                  type="text"
                  className="w-full rounded bg-transparent py-[0.32rem] text-black border border-sky-100 "
                  id="exampleInput90"
                  placeholder="Nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="relative mb-6" data-te-input-wrapper-init>
                <input
                  type="email"
                  className="w-full rounded bg-transparent py-[0.32rem] text-black border border-sky-100 "
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <textarea
                  className="w-full rounded bg-transparent py-[0.32rem] text-black border border-sky-100 "
                  id="exampleFormControlTextarea1"
                  rows="3"
                  placeholder="Su mensaje"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
              </div>

              <button
                type="button"
                onClick={sendEmail}
                className="block w-full bg-indigo-600 mt-4 py-2 rounded-2xl text-white font-semibold mb-2"
              >
                Enviar
              </button>
            </form>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {success && (
              <p className="text-green-500 text-sm mt-2">
                ¡Mensaje enviado con éxito! Nos pondremos en contacto contigo
                pronto.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
export default Soporte;
