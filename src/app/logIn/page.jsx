/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import validateLogin from "./validatelogin";

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

  const handleLogin = async (e) => {
    e.preventDefault();
    const validationErrors = validateLogin(email, password);
    if (Object.keys(validationErrors).length > 0) {
      // Si hay errores de validación, establece los errores en el estado y no envíes la solicitud de inicio de sesión.
      setError(validationErrors);
    } else {
      // No hay errores de validación, intenta iniciar sesión.
      try {
        await signInWithEmailAndPassword(auth, email, password);
        console.log("Usuario ha iniciado sesión exitosamente");
        // Limpiar campos del formulario y redirigir al usuario.
        setEmail("");
        setPassword("");
        window.location.href = "/";
      } catch (error) {
        console.error("Error al iniciar sesión:", error.message);
        setError(error.message);
      }
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
            <form onSubmit={handleLogin}>
              <h2 className="mb-6 text-2xl font-semibold text-gray-900">
                Inicio de Sesión
              </h2>
              <div className="mb-6 relative" data-te-input-wrapper-init>
                <input
                  type="text"
                  className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none"
                  id="exampleFormControlInput2"
                  placeholder="Email"
                  value={email} // Vincula el valor del input al estado email
                  onChange={(e) => setEmail(e.target.value)} // Actualiza el estado email cuando el usuario escribe
                />
              </div>

              <div className="mb-6 relative" data-te-input-wrapper-init>
                <input
                  type="password"
                  className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none"
                  id="exampleFormControlInput22"
                  placeholder="Password"
                  value={password} // Vincula el valor del input al estado password
                  onChange={(e) => setPassword(e.target.value)} // Actualiza el estado password cuando el usuario escribe
                />
              </div>

              <div className="text-center lg:text-left">
                <button
                  type="submit"
                  className="inline-block rounded bg-primary px-7 pb-2.5 pt-3 text-sm font-medium uppercase leading-normal shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
                >
                  Login
                </button>

                <div className="mt-3 text-sm font-light text-gray-500">
                  Don't have an account?
                  <strong>
                    <Link href="/register">Register here</Link>
                  </strong>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LogIn;
