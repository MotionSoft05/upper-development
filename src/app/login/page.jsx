"use client";
import React, { useState, Fragment } from "react";
import Link from "next/link";
import emailjs from "emailjs-com";
import { Dialog, Transition } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import auth, { loginUser } from "@/firebase/auth";
import { doc, updateDoc, getDoc, getFirestore } from "firebase/firestore";
import { sendPasswordResetEmail, sendEmailVerification } from "firebase/auth";

// Esta función enviará un correo electrónico utilizando Email.js
const sendEmail = async (userID) => {
  try {
    // Configura tus credenciales de Email.js
    const serviceID = "service_qjv3qpt";
    const templateID = "template_pa584we";
    const userIDEmailJS = "MEzsSEWILjBamER7b";

    // Obtiene una referencia al documento del usuario en Firestore
    const db = getFirestore();
    const userDocRef = doc(db, "usuarios", userID);

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

function LogIn() {
  const { t } = useTranslation();

  // Estados principales
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Estados de UI
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showResetEmailSentModal, setShowResetEmailSentModal] = useState(false);
  const [isResendingVerificationEmail, setIsResendingVerificationEmail] =
    useState(false);

  // Estados de mensajes
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [recoveryEmail, setRecoveryEmail] = useState("");

  // Validaciones
  const isFormValid = formData.email && formData.password;

  // Manejadores
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!isFormValid) return;

    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await loginUser(formData.email, formData.password);
      const user = userCredential.user;

      if (user && user.emailVerified) {
        // Login exitoso
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

        // Redireccionar al usuario
        window.location.href = "/";
      } else {
        // El email no está verificado
        setError(t("login.verifyEmail"));
      }
    } catch (error) {
      console.error("Error de inicio de sesión:", error);
      setError(t("login.incorrectCredentials"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    try {
      setIsResendingVerificationEmail(true);
      const user = auth.currentUser;
      await sendEmailVerification(user);
      setSuccessMessage(t("login.verificationEmailResent"));
    } catch (error) {
      console.error("Error al reenviar email de verificación:", error);
      setError(t("login.resendVerificationError"));
    } finally {
      setIsResendingVerificationEmail(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!recoveryEmail) return;

    try {
      setIsLoading(true);
      await sendPasswordResetEmail(auth, recoveryEmail);
      setShowForgotPasswordModal(false);
      setShowResetEmailSentModal(true);
    } catch (error) {
      console.error(t("login.resetPasswordEmailError"), error.message);
      setError(t("login.resetPasswordEmailError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowPasswordClick = () => {
    setShowPassword(!showPassword);
  };

  return (
    <section className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-center gap-8">
          {/* Parte izquierda - Ilustración */}
          <div className="lg:w-1/2 hidden md:block">
            <img
              src="https://tecdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
              className="w-full max-w-lg mx-auto"
              alt="Login illustration"
            />
          </div>

          {/* Parte derecha - Formulario */}
          <div className="w-full lg:w-5/12 p-6 bg-white rounded-xl shadow-2xl">
            <div className="mb-6 text-center">
              {/* <Link href="/" className="inline-block mb-6">
                <img className="h-12" src="/img/logo.png" alt="Logo" />
              </Link> */}
              <h2 className="text-3xl font-bold text-gray-800">
                {t("login.loginTitle")}
              </h2>
              <p className="text-gray-600 mt-2">{t("login.welcomeBack")}</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                <p className="font-medium">{error}</p>
                {error === t("login.verifyEmail") && (
                  <button
                    className="text-sm mt-2 text-red-600 hover:text-red-800 underline focus:outline-none"
                    onClick={handleResendVerificationEmail}
                    disabled={isResendingVerificationEmail}
                  >
                    {isResendingVerificationEmail
                      ? t("login.resendingVerificationEmail")
                      : t("login.resendVerificationEmail")}
                  </button>
                )}
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
                <p>{successMessage}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("login.email")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder={t("login.emailPlaceholder")}
                    required
                  />
                </div>
              </div>

              {/* Password input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("login.password")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder={t("login.passwordPlaceholder")}
                    required
                  />
                  <button
                    type="button"
                    onClick={handleShowPasswordClick}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <img
                        src="/img/ojo.png"
                        alt="Hide password"
                        className="w-6 h-6"
                      />
                    ) : (
                      <img
                        src="/img/ojosno.png"
                        alt="Show password"
                        className="w-6 h-6"
                      />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot password link */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(true)}
                  className="text-sm text-cyan-600 hover:text-cyan-800 focus:outline-none"
                >
                  {t("login.forgotPasswordLink")}
                </button>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white focus:outline-none transition-colors duration-200 ${
                  isFormValid && !isLoading
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {isLoading ? (
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
                    {t("login.loggingIn")}
                  </div>
                ) : (
                  t("login.loginButton")
                )}
              </button>

              {/* Register link */}
              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  {t("login.noAccountMessage")}
                  <Link
                    href="/register"
                    className="ml-1 font-medium text-cyan-600 hover:text-cyan-800"
                  >
                    {t("login.registerLink")}
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Transition appear show={showForgotPasswordModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setShowForgotPasswordModal(false)}
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
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
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
                    {t("login.forgotPasswordTitle")}
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {t("login.forgotPasswordDescription")}
                    </p>
                  </div>

                  <div className="mt-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                          />
                        </svg>
                      </div>
                      <input
                        type="email"
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
                        placeholder="tu@email.com"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500 border border-gray-300 rounded-md"
                      onClick={() => setShowForgotPasswordModal(false)}
                    >
                      {t("login.cancelButton")}
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500 ${
                        recoveryEmail && !isLoading
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                          : "bg-gray-300 cursor-not-allowed"
                      }`}
                      onClick={handleForgotPassword}
                      disabled={!recoveryEmail || isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                          {t("login.sending")}
                        </div>
                      ) : (
                        t("login.sendRecoveryEmailButton")
                      )}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Reset Email Sent Modal */}
      <Transition appear show={showResetEmailSentModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setShowResetEmailSentModal(false)}
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
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
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
                  <div className="text-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 mx-auto text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>

                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 text-center"
                  >
                    {t("login.recoveryEmailSent")}
                  </Dialog.Title>

                  <div className="mt-3">
                    <p className="text-sm text-gray-500 text-center">
                      {t("login.recoveryEmailInstructions")}
                    </p>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500"
                      onClick={() => setShowResetEmailSentModal(false)}
                    >
                      {t("login.confirmationButton")}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </section>
  );
}

export default LogIn;
