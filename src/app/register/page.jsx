"use client";
import React, { useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import Link from "next/link";
import {
  validateFirstName,
  validateLastName,
  validateEmail,
  validatePhoneNumber,
  validatePassword,
} from "./validateregister.js";

// Configura tu objeto de configuración de Firebase
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

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let errorMessage = "";

    switch (name) {
      case "firstName":
        errorMessage = validateFirstName(value);
        break;
      case "lastName":
        errorMessage = validateLastName(value);
        break;
      case "email":
        errorMessage = validateEmail(value);
        break;
      case "phoneNumber":
        errorMessage = validatePhoneNumber(value);
        break;
      case "password":
        errorMessage = validatePassword(value);
        break;
      default:
        break;
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: errorMessage,
    }));
  };

  const handleRegistration = async (e) => {
    e.preventDefault();

    const firstNameError = validateFirstName(firstName);
    const lastNameError = validateLastName(lastName);
    const emailError = validateEmail(email);
    const phoneNumberError = validatePhoneNumber(phoneNumber);
    const passwordError = validatePassword(password);

    if (
      firstNameError ||
      lastNameError ||
      emailError ||
      phoneNumberError ||
      passwordError
    ) {
      setError(
        firstNameError ||
          lastNameError ||
          emailError ||
          phoneNumberError ||
          passwordError
      );
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Actualizar el perfil del usuario con nombre, apellido y teléfono
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
        phoneNumber: phoneNumber,
      });

      setSuccessMessage("Usuario registrado correctamente");
      // Espera 2 segundos antes de redirigir al usuario a /login
      setTimeout(() => {
        setFirstName("");
        setLastName("");
        setPhoneNumber("");
        setEmail("");
        setPassword("");
        window.location.href = "/login";
      }, 2300); // 2000 milisegundos = 2 segundos
    } catch (error) {
      setError(error.message);
      console.error("Error al registrar el usuario:", error.message);
    }
  };

  return (
    <section className="">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <a
          href="#"
          className="flex items-center mb-6 text-2xl font-semibold text-gray-900 "
        >
          <img className="w-40" src="/img/logo.png" alt="logo" />
        </a>
        <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 ">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
              Create an account
            </h1>
            {successMessage && (
              <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
                {successMessage}
              </div>
            )}
            <form className="space-y-4" onSubmit={handleRegistration}>
              <div className="mb-6 flex space-x-4">
                <div className="relative" data-te-input-wrapper-init>
                  <input
                    type="text"
                    className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none"
                    id="firstName"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  {errors.firstName && (
                    <span className="text-red-500">{errors.firstName}</span>
                  )}
                </div>
                <div className="relative" data-te-input-wrapper-init>
                  <input
                    type="text"
                    className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none"
                    id="lastName"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                  {errors.lastName && (
                    <span className="text-red-500">{errors.lastName}</span>
                  )}
                </div>
              </div>
              <div className="mb-6">
                <div className="relative" data-te-input-wrapper-init>
                  <input
                    type="text"
                    className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none"
                    id="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {errors.email && (
                    <span className="text-red-500">{errors.email}</span>
                  )}
                </div>
              </div>
              <div className="mb-6">
                <div className="relative" data-te-input-wrapper-init>
                  <input
                    type="text"
                    className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none"
                    id="phoneNumber"
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  {errors.phoneNumber && (
                    <span className="text-red-500">{errors.phoneNumber}</span>
                  )}
                </div>
              </div>
              <div className="mb-6">
                <div className="relative" data-te-input-wrapper-init>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none"
                    id="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {errors.password && (
                    <span className="text-red-500">{errors.password}</span>
                  )}

                  <button
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <img src="/password.png" alt="" className="" />
                    ) : (
                      <img src="/password.png" alt="" className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="mb-6">
                <div className="relative" data-te-input-wrapper-init>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none"
                    id="confirmPassword"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {errors.confirmPassword && (
                    <span className="text-red-500">
                      {errors.confirmPassword}
                    </span>
                  )}
                  <button
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 focus:outline-none"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <img
                        src="/img/eye-open.svg"
                        alt="Hide password"
                        className="w-5 h-5"
                      />
                    ) : (
                      <img
                        src="/img/eye-closed.svg"
                        alt="Show password"
                        className="w-5 h-5"
                      />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-start flex-col">
                <button
                  type="submit"
                  className="w-full bg-gray-300 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Create an account
                </button>
                <div className="mt-3 text-sm font-light text-gray-500">
                  Already have an account?
                  <strong>
                    <Link href="/login">Login here</Link>
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

export default Register;
