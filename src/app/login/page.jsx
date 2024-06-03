/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState, Fragment } from "react";
import Link from "next/link";
import emailjs from "emailjs-com";
import { initializeApp } from "firebase/app";
import { Dialog, Transition } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import auth, { loginUser, logoutUser } from "@/firebase/auth";
import { doc, updateDoc, getDoc, getFirestore } from "firebase/firestore";
import { sendPasswordResetEmail, sendEmailVerification } from "firebase/auth";


// Esta función enviará un correo electrónico utilizando Email.js
const sendEmail = async (userID) => {
  // Cambiar user.uid a userID
  try {
    // Configura tus credenciales de Email.js
    const serviceID = "service_qjv3qpt"; // Reemplaza con tu Service ID
    const templateID = "template_pa584we"; // Reemplaza con tu Template ID
    const userIDEmailJS = "MEzsSEWILjBamER7b"; // Reemplaza con tu User ID de Email.js

    // Obtiene una referencia al documento del usuario en Firestore
    const db = getFirestore();
    const userDocRef = doc(db, "usuarios", userID); // Usar userID aquí

    // Obtiene los datos del usuario de Firestore
    const userDocSnapshot = await getDoc(userDocRef);
    const userData = userDocSnapshot.data();

    // Configura los datos del correo electrónico que deseas enviar
    const emailParams = {
      to_name: userData.nombre,
      to_lastName: userData.apellido,
      to_correo: userData.email,
    };

    // Envía el correo electrónico utilizando Email.js
    await emailjs.send(serviceID, templateID, emailParams, userIDEmailJS);
  } catch (error) {
    console.error("Error al enviar el correo electrónico:", error);
  }
};

function LogIn({ url }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState(null);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [isResendingVerificationEmail, setIsResendingVerificationEmail] = useState(false);
  let [isOpen, setIsOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);

  const isFormValid = email && password;

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsFormSubmitted(true);

    if (isFormValid) {
      try {
        const userCredential = await loginUser(email, password);
        const user = userCredential.user;

        if (user && user.emailVerified) {
          setEmail("");
          setPassword("");
          setError(null);
          // Obtener una referencia al documento del usuario en Firestore
          const db = getFirestore();
          const userDocRef = doc(db, "usuarios", user.uid);

          // Obtener el valor actual del campo "sesion"
          const userDocSnapshot = await getDoc(userDocRef);
          const sesionActual = userDocSnapshot.data().sesion || 0;

          // Incrementar el valor del campo "sesion" en 1
          await updateDoc(userDocRef, {
            sesion: sesionActual + 1,
          });

          // Verificar si la sesión pasó a estar en 1 y enviar el correo electrónico
          if (sesionActual + 1 === 1) {
            await sendEmail(user.uid);
          }

          window.location.href = "/";
        } else {
          // "Verifica tu correo antes de iniciar sesión. Si no lo encuentras, revisa el correo no deseado."
          setError(t("login.verifyEmail"));
          const resendVerificationOption = (
            <button
              className="text-sm font-light text-gray-500 hover:underline focus:outline-none"
              onClick={handleResendVerificationEmail}
            >
              {/* ¿No has recibido el correo de verificación? Haz clic aquí para
              reenviar. */}
              {t("login.resendVerificationEmail")}
            </button>
          );
          //
          setError((prevError) => (
            <>
              {prevError}
              {resendVerificationOption}
            </>
          ));
        }
      } catch (error) {
        // ("Credenciales incorrectas. Por favor, inténtalo de nuevo.")
        setError(t("login.incorrectCredentials"));
      }
    }
  };

  const handleResendVerificationEmail = async () => {
    try {
      setIsResendingVerificationEmail(true);
      const user = auth.currentUser;
      await sendEmailVerification(user);
      setSuccessMessage(t("login.verificationEmailResent")); // "Correo de verificación reenviado exitosamente"
      setIsResendingVerificationEmail(false);
    } catch (error) {
      setIsResendingVerificationEmail(false);
    }
  };

  function closeModal() {
    setIsOpen(false);
    setIsForgotPasswordModalOpen(false);
  }

  const handleForgotPassword = async () => {
    setIsOpen(true);

    try {
      await sendPasswordResetEmail(auth, recoveryEmail);
    } catch (error) {
      // "Error al enviar el correo electrónico de restablecimiento de contraseña:",
      console.error(t("login.resetPasswordEmailError"), error.message );
    }
  };

  const handleShowPasswordClick = (e) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  const handleFormKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLogin(e);
    }
  };

  return (
    <section className="">
      <div className="mt-20">
        <div className="g-6 flex h-full flex-wrap items-center justify-center lg:justify-between">
          <div className="mb-12 md:mb-0 md:w-full lg:w-6/12 xl:w-6/12">
            <img
              src="https://tecdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
              className="w-full"
              alt="Sample image"
            />
          </div>
          <div className="mb-4 md:mb-0 md:w-full lg:w-5/12 xl:w-5/12 md:ml-auto md:mr-auto lg:ml-0 lg:mr-0">
            <form onSubmit={handleLogin} onKeyDown={handleFormKeyDown}>
              <h2 className="mb-6 text-2xl font-semibold text-gray-900">
                {/* Inicio de Sesión */}
                {t("login.loginTitle")}
              </h2>
              {error && <div className="text-red-500 mb-4">{error}</div>}
              {successMessage && (
                <p className="text-green-500 mb-4">{successMessage}</p>
              )}
              <div className="mb-6 relative border border-gray-300 shadow-md w-full md:w-1/2">
                <input
                  type="text"
                  className={`peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none ${
                    isFormSubmitted && !email ? "" : ""
                  }`}
                  id="exampleFormControlInput2"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="mb-6 relative border border-gray-300 shadow-md w-full md:w-1/2">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none ${
                    isFormSubmitted && !password ? "" : ""
                  }`}
                  id="exampleFormControlInput22"
                  placeholder={t("login.password")} //"Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 focus:outline-none"
                  onClick={handleShowPasswordClick}
                >
                  {showPassword ? (
                    <img
                      src="/img/ojo.png"
                      alt="Hide password"
                      className="w-7 h-7"
                    />
                  ) : (
                    <img
                      src="/img/ojosno.png"
                      alt="Show password"
                      className="w-7 h-7"
                    />
                  )}
                </button>
              </div>

              <div className="text-center lg:text-left">
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className={`inline-block rounded bg-gray-400 text-white px-7 pb-2.5 pt-3 text-sm font-medium uppercase leading-normal shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out ${
                    isFormValid
                      ? "bg-green-300 hover:bg-primary hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
                      : "cursor-not-allowed bg-gray-400 text-gray-200"
                  }`}
                >
                  {/* Iniciar Sesión */}
                  {t("login.loginTitle")}
                </button>

                <div className="mt-3 text-sm font-light text-gray-500">
                  {/* ¿No tienes una cuenta? */}
                  {t("login.noAccountMessage")}
                  <strong>
                    <Link href="/register">
                      {/* Registrate aquí */}
                      {t("login.registerLink")}
                    </Link>
                  </strong>
                </div>
                <button
                  onClick={() => setIsForgotPasswordModalOpen(true)}
                  className="text-sm font-light text-gray-500 hover:underline focus:outline-none"
                >
                  {/* ¿Olvidaste tu contraseña? */}
                  {t("login.forgotPasswordLink")}
                </button>
                {isForgotPasswordModalOpen && (
                  <div className="fixed inset-0 flex items-center justify-center">
                    <div
                      className="absolute inset-0 bg-gray-800 opacity-75"
                      onClick={() => setIsForgotPasswordModalOpen(false)}
                    ></div>
                    <div className="bg-white p-8 rounded-md shadow-lg z-10">
                      <h2 className="text-2xl font-semibold mb-4">
                        {/* Recuperar Contraseña */}
                        {t("login.forgotPasswordTitle")}
                      </h2>
                      <p className="text-gray-600 mb-6">
                        {/* Ingresa tu correo electrónico para restablecer tu
                        contraseña. */}
                        {t("login.forgotPasswordDescription")}
                      </p>
                      <input
                        type="email"
                        className="w-full p-2 border rounded mb-4"
                        placeholder="Email"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                      />
                      <button
                        onClick={handleForgotPassword}
                        className={`w-full text-gray-600 mt-4 hover:underline focus:outline-none ${
                          recoveryEmail ? "" : "cursor-not-allowed opacity-50"
                        }`}
                        disabled={!recoveryEmail}
                      >
                        {/* Enviar Correo de Recuperación */}
                        {t("login.sendRecoveryEmailButton")}
                      </button>

                      <Transition appear show={isOpen} as={Fragment}>
                        <Dialog
                          as="div"
                          className="relative z-10"
                          onClose={closeModal}
                        >
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
                                    {/* ¡Correo de recuperación enviado! */}
                                    {t("login.recoveryEmailSent")}
                                  </Dialog.Title>
                                  <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                      {/* Te enviamos un correo con instrucciones
                                      para actualizar ... */}
                                      {t("login.recoveryEmailInstructions")}
                                    </p>
                                  </div>

                                  <div className="mt-4">
                                    <button
                                      type="button"
                                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                      onClick={closeModal}
                                    >
                                      {/* Listo! */}
                                      {t("login.confirmationButton")}
                                    </button>
                                  </div>
                                </Dialog.Panel>
                              </Transition.Child>
                            </div>
                          </div>
                        </Dialog>
                      </Transition>
                      <button
                        onClick={() => setIsForgotPasswordModalOpen(false)}
                        className="w-full text-gray-600 mt-4 hover:underline focus:outline-none"
                      >
                        {/* Cancelar */}
                        {t("login.cancelButton")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LogIn;