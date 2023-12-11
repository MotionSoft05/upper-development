/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState, Fragment } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import Link from "next/link";

import { Dialog, Transition } from "@headlessui/react";

const firebaseConfig = {
  apiKey: "AIzaSyCzD--npY_6fZcXH-8CzBV7UGzPBqg85y8",
  authDomain: "upper-a544e.firebaseapp.com",
  projectId: "upper-a544e",
  storageBucket: "upper-a544e.appspot.com",
  messagingSenderId: "665713417470",
  appId: "1:665713417470:web:73f7fb8ee518bea35999af",
  measurementId: "G-QTFQ55YY5D",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function LogIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] =
    useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [isResendingVerificationEmail, setIsResendingVerificationEmail] =
    useState(false);
  let [isOpen, setIsOpen] = useState(false);

  const [successMessage, setSuccessMessage] = useState(null);

  const isFormValid = email && password;

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsFormSubmitted(true);

    if (isFormValid) {
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const user = userCredential.user;

        if (user && user.emailVerified) {
          console.log("Usuario ha iniciado sesión exitosamente");
          // Limpiar campos del formulario y redirigir al usuario.
          setEmail("");
          setPassword("");
          setError(null); // Limpiar cualquier mensaje de error existente
          window.location.href = "/";
        } else {
          setError(
            "Por favor, verifica tu correo electrónico antes de iniciar sesión."
          );

          // Agrega la opción de reenviar el correo de verificación
          const resendVerificationOption = (
            <button
              className="text-sm font-light text-gray-500 hover:underline focus:outline-none"
              onClick={handleResendVerificationEmail}
            >
              ¿No has recibido el correo de verificación? Haz clic aquí para
              reenviar.
            </button>
          );

          setError((prevError) => (
            <>
              {prevError}
              {resendVerificationOption}
            </>
          ));
        }
      } catch (error) {
        console.error("Error al iniciar sesión:", error.message);
        setError("Credenciales incorrectas. Por favor, inténtalo de nuevo.");
      }
    } else {
      setError("Por favor, completa todos los campos."); // Muestra un mensaje de error si los campos no están completos
    }
  };

  const handleResendVerificationEmail = async () => {
    try {
      setIsResendingVerificationEmail(true);
      const user = auth.currentUser;
      await sendEmailVerification(user);
      console.log("Correo de verificación reenviado exitosamente");
      setSuccessMessage("Correo de verificación reenviado exitosamente");
      setIsResendingVerificationEmail(false);

      // Limpiar el mensaje después de 3 segundos
    } catch (error) {
      console.error(
        "Error al reenviar el correo de verificación:",
        error.message
      );
      setIsResendingVerificationEmail(false);
    }
  };

  function closeModal() {
    setIsOpen(false);
  }
  const handleForgotPassword = async () => {
    setIsOpen(true);
    try {
      await sendPasswordResetEmail(auth, email);
      // Mostrar un mensaje al usuario indicando que se ha enviado un correo electrónico de restablecimiento de contraseña
      console.log(
        "Correo electrónico de restablecimiento de contraseña enviado"
      );
    } catch (error) {
      console.error(
        "Error al enviar el correo electrónico de restablecimiento de contraseña:",
        error.message
      );
    } finally {
      // Cerrar el modal de recuperación de contraseña
      setIsForgotPasswordModalOpen(false);
    }
  };

  const handleShowPasswordClick = (e) => {
    e.preventDefault(); // Evita el comportamiento predeterminado del botón
    setShowPassword(!showPassword);
  };

  const handleFormKeyDown = (e) => {
    // Verificar si la tecla presionada es "Enter"
    if (e.key === "Enter") {
      // Prevenir el envío del formulario
      e.preventDefault();
      handleLogin(e);
    }
  };

  return (
    <section className="h-screen">
      <div className="h-full px-20">
        <div className="g-6 flex h-full flex-wrap items-center justify-center lg:justify-between">
          <div className="shrink-1 mb-12 grow-0 basis-auto md:mb-0 md:w-9/12 md:shrink-0 lg:w-6/12 xl:w-6/12">
            <img
              src="https://tecdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
              className="w-full"
              alt="Sample image"
            />
          </div>

          <div className="mb-12 md:mb-0 md:w-8/12 lg:w-5/12 xl:w-5/12">
            <form onSubmit={handleLogin} onKeyDown={handleFormKeyDown}>
              <h2 className="mb-6 text-2xl font-semibold text-gray-900">
                Inicio de Sesión
              </h2>
              {error && <div className="text-red-500 mb-4">{error}</div>}
              {successMessage && (
                <p className="text-green-500 mb-4">{successMessage}</p>
              )}
              <div
                className={`mb-6 relative border border-gray-300 shadow-md w-1/2 ${
                  isFormSubmitted && !email ? "border-red-500" : ""
                }`}
                data-te-input-wrapper-init
              >
                <input
                  type="text"
                  className={`peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none ${
                    isFormSubmitted && !email ? "ring ring-red-500" : ""
                  }`}
                  id="exampleFormControlInput2"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div
                className={`mb-6 relative border border-gray-300 shadow-md w-1/2 ${
                  isFormSubmitted && !password ? "border-red-500" : ""
                }`}
                data-te-input-wrapper-init
              >
                <input
                  type={showPassword ? "text" : "password"}
                  className={`peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none ${
                    isFormSubmitted && !password ? "ring ring-red-500" : ""
                  }`}
                  id="exampleFormControlInput22"
                  placeholder="Contraseña"
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
                  className={`inline-block rounded bg-primary px-7 pb-2.5 pt-3 text-sm font-medium uppercase leading-normal shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out ${
                    isFormValid
                      ? "hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
                      : "cursor-not-allowed bg-gray-400 text-gray-200"
                  }`}
                >
                  Login
                </button>

                <div className="mt-3 text-sm font-light text-gray-500">
                  ¿No tienes una cuenta?
                  <strong>
                    <Link href="/register"> Registrate aquí</Link>
                  </strong>
                </div>
                <button
                  onClick={() => setIsForgotPasswordModalOpen(true)}
                  className="text-sm font-light text-gray-500 hover:underline focus:outline-none"
                >
                  ¿Olvidaste tu contraseña?
                </button>
                {isForgotPasswordModalOpen && (
                  <div className="fixed inset-0 flex items-center justify-center">
                    <div
                      className="absolute inset-0 bg-gray-800 opacity-75"
                      onClick={() => setIsForgotPasswordModalOpen(false)}
                    ></div>
                    <div className="bg-white p-8 rounded-md shadow-lg z-10">
                      <h2 className="text-2xl font-semibold mb-4">
                        Recuperar Contraseña
                      </h2>
                      <p className="text-gray-600 mb-6">
                        Ingresa tu correo electrónico para restablecer tu
                        contraseña.
                      </p>
                      <input
                        type="email"
                        className="w-full p-2 border rounded mb-4"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <button
                        onClick={handleForgotPassword}
                        className="w-full text-gray-600 mt-4 hover:underline focus:outline-none"
                      >
                        Enviar Correo de Recuperación
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
                                    Se a enviado un correo de recuperación
                                  </Dialog.Title>
                                  <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                      Si no encuentra el correo en la casilla
                                      principal vea la sección de spam y siga
                                      las instrucciones del correo
                                    </p>
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
                      <button
                        onClick={() => setIsForgotPasswordModalOpen(false)}
                        className="w-full text-gray-600 mt-4 hover:underline focus:outline-none"
                      >
                        Cancelar
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
