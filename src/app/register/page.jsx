"use client";
import React, { useState, useEffect, useCallback } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import Link from "next/link";

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
  const [passwordError, setPasswordError] = useState(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState(null);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [passwordsMatchError, setPasswordsMatchError] = useState("");
  const [emailError, setEmailError] = useState(null);
  const [firstNameError, setFirstNameError] = useState(null);
  const [lastNameError, setLastNameError] = useState(null);
  const [phoneNumberError, setPhoneNumberError] = useState(null);
  const [isFirstNameTouched, setIsFirstNameTouched] = useState(false);
  const [isLastNameTouched, setIsLastNameTouched] = useState(false);
  const [isEmailTouched, setIsEmailTouched] = useState(false);
  const [isPhoneNumberTouched, setIsPhoneNumberTouched] = useState(false);
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);
  const [isConfirmPasswordTouched, setIsConfirmPasswordTouched] =
    useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setIsConfirmPasswordTouched(true);
    setPasswordsMatch(password === confirmPassword);

    if (confirmPassword && isConfirmPasswordTouched) {
      const matchError =
        password !== confirmPassword
          ? "Las contraseñas no coinciden"
          : "Las contraseñas coinciden";
      setPasswordsMatchError(matchError);
    } else {
      setPasswordsMatchError("");
    }
  }, [password, confirmPassword, isConfirmPasswordTouched]);

  useEffect(() => {
    const hasErrors =
      firstNameError ||
      lastNameError ||
      emailError ||
      phoneNumberError ||
      passwordError ||
      confirmPasswordError;

    const isFieldsCompleted =
      firstName &&
      lastName &&
      email &&
      phoneNumber &&
      password &&
      confirmPassword;

    setIsButtonDisabled(hasErrors || !isFieldsCompleted);
  }, [
    firstName,
    lastName,
    email,
    phoneNumber,
    password,
    confirmPassword,
    firstNameError,
    lastNameError,
    emailError,
    phoneNumberError,
    passwordError,
    confirmPasswordError,
  ]);

  const handleShowPasswordClick = (e) => {
    e.preventDefault();
    setShowPassword((prev) => !prev);
  };

  const handleShowConfirmPasswordClick = (e) => {
    e.preventDefault();
    setShowConfirmPassword((prev) => !prev);
  };

  const handleRegistration = async (e) => {
    e.preventDefault();

    setIsFirstNameTouched(true);
    setIsLastNameTouched(true);
    setIsEmailTouched(true);
    setIsPhoneNumberTouched(true);
    setIsPasswordTouched(true);
    setIsConfirmPasswordTouched(true);

    const firstNameError = isFirstNameTouched
      ? validateFirstName(firstName)
      : null;
    setFirstNameError(firstNameError);

    const lastNameError = isLastNameTouched ? validateLastName(lastName) : null;
    setLastNameError(lastNameError);

    const emailError = isEmailTouched ? validateEmail(email) : null;
    setEmailError(emailError);

    const phoneNumberError = isPhoneNumberTouched
      ? validatePhoneNumber(phoneNumber)
      : null;
    setPhoneNumberError(phoneNumberError);

    const passwordError = isPasswordTouched ? validatePassword(password) : null;
    setPasswordError(passwordError);

    const confirmPasswordError =
      isConfirmPasswordTouched && confirmPassword !== password
        ? "Las contraseñas no coinciden"
        : null;
    setConfirmPasswordError(confirmPasswordError);

    if (
      firstNameError ||
      lastNameError ||
      emailError ||
      phoneNumberError ||
      passwordError
    ) {
      setErrors(
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
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
        phoneNumber: phoneNumber,
      });

      setSuccessMessage("Usuario registrado correctamente");
      setTimeout(() => {
        setFirstName("");
        setLastName("");
        setPhoneNumber("");
        setEmail("");
        setPassword("");
        window.location.href = "/login";
      }, 2300);
    } catch (error) {
      setErrors(error.message);
      console.error("Error al registrar el usuario:", error.message);
    }
  };

  const validateFirstName = (value) => {
    if (!value) {
      return "El nombre es obligatorio";
    }
    return null;
  };

  const validateLastName = (value) => {
    if (!value) {
      return "El apellido es obligatorio";
    }
    return null;
  };

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      return "El correo electrónico es obligatorio";
    } else if (!emailRegex.test(value)) {
      return "El correo electrónico no es válido";
    }
    return null;
  };

  const validatePhoneNumber = (value) => {
    if (!value) {
      return "El número de teléfono es obligatorio";
    }

    return null;
  };

  const validatePassword = (value) => {
    if (!value) {
      return "La contraseña es obligatoria";
    } else if (value.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres";
    }
    return null;
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
              <div className="relative" data-te-input-wrapper-init>
                <input
                  type="text"
                  className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none"
                  id="firstName"
                  placeholder="Nombre"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setFirstNameError(validateFirstName(e.target.value));
                  }}
                />
                {firstNameError && (
                  <span className="text-sm text-red-500 mt-1 absolute bottom-[-0.8rem] left-3">
                    {firstNameError}
                  </span>
                )}
              </div>
              <div className="relative" data-te-input-wrapper-init>
                <input
                  type="text"
                  className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none"
                  id="lastName"
                  placeholder="Apellido"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    setLastNameError(validateLastName(e.target.value));
                  }}
                />
                {lastNameError && (
                  <span className="text-sm text-red-500 mt-1 absolute bottom-[-0.8rem] left-3">
                    {lastNameError}
                  </span>
                )}
              </div>

              <div className="mb-6 flex flex-col relative">
                <div className="relative" data-te-input-wrapper-init>
                  <input
                    type="text"
                    className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none"
                    id="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      const error = validateEmail(e.target.value);
                      setEmailError(error);
                    }}
                  />
                  {emailError && (
                    <span className="text-sm text-red-500 mt-1 absolute bottom-[-0.8rem] left-3">
                      {emailError}
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <div className="relative" data-te-input-wrapper-init>
                  <input
                    type="text"
                    className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none"
                    id="phoneNumber"
                    placeholder="Teléfono"
                    value={phoneNumber}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      const filteredValue = inputValue.replace(
                        /[^0-9+\s-]/g,
                        ""
                      );
                      setPhoneNumber(filteredValue);
                      const error = validatePhoneNumber(filteredValue);
                      setPhoneNumberError(error);
                    }}
                  />
                  {phoneNumberError && (
                    <span className="text-sm text-red-500 mt-1 absolute bottom-[-0.8rem] left-3">
                      {phoneNumberError}
                    </span>
                  )}
                </div>
              </div>
              <div className="mb-6">
                <div className="relative" data-te-input-wrapper-init>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none"
                    id="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      const error = validatePassword(e.target.value);
                      setPasswordError(error);
                    }}
                  />
                  {passwordError && (
                    <span className="text-sm text-red-500 mt-1 absolute bottom-[-0.8rem] left-3">
                      {passwordError}
                    </span>
                  )}
                  <button
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 focus:outline-none"
                    onClick={(e) => handleShowPasswordClick(e)} // Agrega el evento y pasa el evento como argumento
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
              </div>
              <div className="mb-6">
                <div className="relative" data-te-input-wrapper-init>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none"
                    id="confirmPassword"
                    placeholder="Confirmar contraseña"
                    value={confirmPassword}
                    onFocus={() => setIsConfirmPasswordTouched(true)}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      const error =
                        isConfirmPasswordTouched && e.target.value !== password
                          ? "Las contraseñas no coinciden"
                          : null;
                      setConfirmPasswordError(error);
                    }}
                  />

                  {passwordsMatchError && (
                    <span
                      className={`text-sm mt-1 absolute bottom-[-0.8rem] left-3 ${
                        passwordsMatchError === "Las contraseñas coinciden"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {passwordsMatchError}
                    </span>
                  )}
                  <button
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 focus:outline-none"
                    onClick={handleShowConfirmPasswordClick}
                  >
                    {showConfirmPassword ? (
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
              </div>
              <div className="flex items-start flex-col">
                <button
                  type="submit"
                  className={`w-full bg-gray-300 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ${
                    isButtonDisabled || !passwordsMatch
                      ? "cursor-not-allowed"
                      : ""
                  }`}
                  disabled={isButtonDisabled || !passwordsMatch}
                >
                  Crear cuenta
                </button>

                <div className="mt-3 text-sm font-light text-gray-500">
                  ¿Ya tienes una cuenta?
                  <strong>
                    <Link href="/login">Ingresa aquí</Link>
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
