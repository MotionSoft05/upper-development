"use client";
import React, { useState, useEffect, useCallback } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import Link from "next/link";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";

const firebaseConfig = {
  apiKey: "AIzaSyAiP1248hBEZt3iS2H4UVVjdf_xbuJHD3k",
  authDomain: "upper-8c817.firebaseapp.com",
  projectId: "upper-8c817",
  storageBucket: "upper-8c817.appspot.com",
  messagingSenderId: "798455798906",
  appId: "1:798455798906:web:f58a3e51b42eebb6436fc3",
  measurementId: "G-6VHX927GH1",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function Register() {

  const {t} = useTranslation()
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
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyNameError, setCompanyNameError] = useState(null);
  const [registeredCompanyName, setRegisteredCompanyName] = useState("");
  const [termsChecked, setTermsChecked] = useState(false);
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    companyName: "",
  });

  useEffect(() => {
    setIsConfirmPasswordTouched(true);
    setPasswordsMatch(password === confirmPassword);

    if (confirmPassword && isConfirmPasswordTouched) {
      const matchError =
        password !== confirmPassword
          ? t("register.errors.passwordsMatchError") //"Las contraseñas no coinciden"
          : t("register.errors.passwordsMatch") //"Las contraseñas coinciden";
      setPasswordsMatchError(matchError);

      // Actualiza el estado de error de la confirmación de contraseña
      setConfirmPasswordError(
        matchError !== 
        // "Las contraseñas coinciden"
        t("register.errors.passwordsMatch")
         ? matchError : null
      );
    } else {
      setPasswordsMatchError("");
      setConfirmPasswordError("");
    }
  }, [password, confirmPassword, isConfirmPasswordTouched]);

  useEffect(() => {
    const hasErrors =
      firstNameError ||
      lastNameError ||
      emailError ||
      phoneNumberError ||
      passwordError ||
      confirmPasswordError ||
      companyNameError;

    const isFieldsCompleted =
      firstName &&
      lastName &&
      email &&
      phoneNumber &&
      password &&
      confirmPassword &&
      companyName;

    setIsButtonDisabled(
      hasErrors ||
        !isFieldsCompleted ||
        passwordsMatchError !== t("register.errors.passwordsMatch") //"Las contraseñas coinciden"
    );
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
    companyNameError,
    passwordsMatchError,
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
        ? t("register.errors.passwordsMatchError") //"Las contraseñas no coinciden"
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

      await sendEmailVerification(userCredential.user);

      const userUid = userCredential.user.uid;
      const db = getFirestore();
      const userRef = doc(db, "usuarios", userUid);
      await setDoc(userRef, {
        nombre: firstName,
        apellido: lastName,
        email: email,
        telefono: phoneNumber,
        empresa: companyName,
        sesion: 0,
        status: true,
        pd: 0,
        ps: 0,
        total: 0,
      });

      setShowVerificationModal(true);
      setRegisteredCompanyName(companyName);

      setTimeout(() => {
        setFirstName("");
        setLastName("");
        setPhoneNumber("");
        setEmail("");
        setPassword("");
        setCompanyName("");
        setConfirmPassword("");
        //window.location.href = "/login";
      }, 2300);
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setEmailError("El correo electrónico ya está en uso");
      } else {
        setErrors(error.message);
        // "Error al registrar el usuario:"
        console.error(t("register.errors.registrationError"), error.message);
      }
    }
  };

  const validateFirstName = (value) => {
    if (!value) {
      // "El nombre es obligatorio";
      return t("register.errors.nameRequired");
    }
    return null;
  };

  const validateLastName = (value) => {
    if (!value) {
      // "El apellido es obligatorio";
      return t("register.errors.lastNameRequired");
    }
    return null;
  };

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      // "El correo electrónico es obligatorio";
      return t("register.errors.emailRequired");
    } else if (!emailRegex.test(value)) {
      // "El correo electrónico no es válido";
      return t("register.errors.emailInvalid");
    }
    return null;
  };

  const validatePhoneNumber = (value) => {
    if (!value) {
      // "El número de teléfono es obligatorio";
      return t("register.errors.phoneRequired");
    }

    // Expresión regular para permitir solo + - ( ) y números
    const phoneNumberRegex = /^[+()0-9\-]*$/;

    if (!phoneNumberRegex.test(value)) {
      // "El número de teléfono solo puede contener + - ( ) y números";
      return t("register.errors.phoneFormat");
    }

    return null;
  };

  const validatePassword = (value) => {
    if (!value) {
      // "La contraseña es obligatoria";
      return t("register.errors.passwordRequired");
    } else if (value.length < 8) {
      // "La contraseña debe tener al menos 8 caracteres";
      return t("register.errors.passwordLength");
    }
    return null;
  };

  const validateCompanyName = (value) => {
    if (!value) {
      // "El nombre de empresa es obligatorio";
      return t("register.errors.companyNameRequired");
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
              {/* Registrate aquí */}
              {t("register.title")}
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
                  placeholder={t("register.placeholders.name")}
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
                  placeholder={t("register.placeholders.lastName")}
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
                    placeholder={t("register.placeholders.email")}
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
                    placeholder={t("register.placeholders.phone")}
                    value={phoneNumber}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      const filteredValue = inputValue.replace(
                        /[^+()0-9\-]/g,
                        ""
                      );

                      // Limitar a 16 caracteres
                      const truncatedValue = filteredValue.slice(0, 16);

                      setPhoneNumber(truncatedValue);
                      const error = validatePhoneNumber(truncatedValue);
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
                    type="text"
                    className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none"
                    id="companyName"
                    placeholder={t("register.placeholders.companyName")}
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                      setCompanyNameError(validateCompanyName(e.target.value));
                    }}
                  />
                  {companyNameError && (
                    <span className="text-sm text-red-500 mt-1 absolute bottom-[-0.8rem] left-3">
                      {companyNameError}
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
                    placeholder={t("register.placeholders.password")}
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
                    placeholder={t("register.placeholders.confirmPassword")}
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
              <div class="flex items-start mb-5">
                <div class="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    value=""
                    class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800"
                    required
                    onChange={(e) => setTermsChecked(e.target.checked)}
                  />
                </div>
                <label
                  htmlFor="terms"
                  class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  {/* Estoy de acuerdo con los */}
                  {t("register.termsAndConditions")}
                  <a
                    href="#"
                    class="pl-1 text-blue-600 hover:underline dark:text-blue-500"
                  >
                    {/* términos y condiciones */}
                    {t("register.termsLink")}
                  </a>
                </label>
              </div>
              <div className="flex items-start flex-col">
                <button
                  type="submit"
                  className={`w-full bg-gray-300 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ${
                    isButtonDisabled || !passwordsMatch
                      ? "cursor-not-allowed"
                      : ""
                  }`}
                  disabled={
                    isButtonDisabled || !passwordsMatch || !termsChecked
                  }
                >
                  {/* Crear cuenta */}
                  {t("register.submitButton")}
                </button>

                <div className="mt-3 text-sm font-light text-gray-500">
                  {/* ¿Ya tienes una cuenta? */}
                  {t("register.termsAndConditions")}
                  <strong>
                    <Link href="/login"> 
                    {/* Ingresa aquí */}
                    {t("register.loginLink")}
                    </Link>
                  </strong>
                </div>
                {showVerificationModal && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded-lg">
                      <p className="text-xl font-semibold mb-4">
                        {/* Usuario registrado correctamente. */}
                        {t("register.registrationSuccess")}
                      </p>
                      <p className="mb-4">
                        {/* Se ha enviado un correo de verificación... */}
                        {t("register.verificationEmailSent")}
                      </p>

                      <Link href="/login" passHref>
                        <p className="text-blue-500 hover:underline">
                          {/* Ir a iniciar sesión */}
                          {t("register.goToLogin")}
                        </p>
                      </Link>
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

export default Register;
