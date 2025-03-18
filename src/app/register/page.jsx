"use client";
import React, { useState, useEffect } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import Link from "next/link";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import auth from "@/firebase/auth";
import getFileUrl from "@/hook/getFileUrl";

function Register() {
  const { t } = useTranslation();

  // Estado de formulario
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Estado de errores
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  // Estado de campos tocados
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phoneNumber: false,
    password: false,
    confirmPassword: false,
  });

  // Estados UI
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verificación y errores de contraseña
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  // Cargar términos y condiciones
  useEffect(() => {
    const keyword = "terminos";
    const folderPath = "termsAndConditions";
    const fetchFileUrl = async () => {
      try {
        const url = await getFileUrl(folderPath, keyword);
        setFileUrl(url);
      } catch (error) {
        console.error("Error fetching file URL:", error);
      }
    };

    fetchFileUrl();
  }, []);

  // Verificar fuerza de contraseña
  useEffect(() => {
    const { password } = formData;

    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    // Calcular puntuación (0-5)
    let score = 0;
    if (hasMinLength) score++;
    if (hasUpperCase) score++;
    if (hasLowerCase) score++;
    if (hasNumber) score++;
    if (hasSpecialChar) score++;

    setPasswordStrength({
      score,
      hasMinLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
    });
  }, [formData.password]);

  // Verificar si las contraseñas coinciden
  useEffect(() => {
    const { password, confirmPassword } = formData;

    if (touched.confirmPassword && confirmPassword) {
      if (password !== confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: t("register.errors.passwordsMatchError"),
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "",
        }));
      }
    }
  }, [formData.password, formData.confirmPassword, touched.confirmPassword, t]);

  // Verificar si el botón debería estar habilitado
  useEffect(() => {
    const hasFormErrors = Object.values(errors).some((error) => error !== "");
    const allFieldsFilled = Object.values(formData).every(
      (value) => value !== ""
    );
    const passwordsMatch = formData.password === formData.confirmPassword;

    setIsButtonDisabled(
      hasFormErrors || !allFieldsFilled || !passwordsMatch || !termsChecked
    );
  }, [errors, formData, termsChecked]);

  // Manejadores
  const handleChange = (e) => {
    const { id, value } = e.target;

    // Para el teléfono, filtrar caracteres no deseados
    if (id === "phoneNumber") {
      const filteredValue = value.replace(/[^+()0-9\-]/g, "").slice(0, 16);
      setFormData((prev) => ({ ...prev, [id]: filteredValue }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }

    validateField(
      id,
      id === "phoneNumber" ? value.replace(/[^+()0-9\-]/g, "") : value
    );
  };

  const handleBlur = (e) => {
    const { id } = e.target;
    setTouched((prev) => ({ ...prev, [id]: true }));
    validateField(id, formData[id]);
  };

  const validateField = (fieldName, value) => {
    let errorMessage = "";

    switch (fieldName) {
      case "firstName":
        if (!value) errorMessage = t("register.errors.nameRequired");
        break;
      case "lastName":
        if (!value) errorMessage = t("register.errors.lastNameRequired");
        break;
      case "email":
        if (!value) {
          errorMessage = t("register.errors.emailRequired");
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errorMessage = t("register.errors.emailInvalid");
        }
        break;
      case "phoneNumber":
        if (!value) {
          errorMessage = t("register.errors.phoneRequired");
        } else if (!/^[+()0-9\-]*$/.test(value)) {
          errorMessage = t("register.errors.phoneFormat");
        }
        break;
      case "password":
        if (!value) {
          errorMessage = t("register.errors.passwordRequired");
        } else if (value.length < 8) {
          errorMessage = t("register.errors.passwordLength");
        }
        break;
      case "confirmPassword":
        if (!value) {
          errorMessage = t("register.errors.confirmPasswordRequired");
        } else if (value !== formData.password) {
          errorMessage = t("register.errors.passwordsMatchError");
        }
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [fieldName]: errorMessage }));
  };

  const handleShowPasswordClick = (fieldName) => {
    if (fieldName === "password") {
      setShowPassword((prev) => !prev);
    } else {
      setShowConfirmPassword((prev) => !prev);
    }
  };

  const openTermsAndConditions = () => {
    if (fileUrl && fileUrl.length > 0) {
      window.open(fileUrl[0].url, "_blank");
    } else {
      console.error("Términos y condiciones no disponibles.");
    }
  };

  const handleRegistration = async (e) => {
    e.preventDefault();

    // Marcar todos los campos como tocados para activar validaciones
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      password: true,
      confirmPassword: true,
    });

    // Validar todos los campos
    Object.keys(formData).forEach((fieldName) => {
      validateField(fieldName, formData[fieldName]);
    });

    // Verificar si hay errores
    const hasErrors = Object.values(errors).some((error) => error !== "");
    if (hasErrors || !termsChecked) return;

    setIsSubmitting(true);

    try {
      const { firstName, lastName, phoneNumber, email, password } = formData;

      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Actualizar perfil con nombre y apellido
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
        phoneNumber: phoneNumber,
      });

      // Enviar email de verificación
      await sendEmailVerification(userCredential.user);

      // Guardar datos en Firestore
      const userUid = userCredential.user.uid;
      const db = getFirestore();
      const userRef = doc(db, "usuarios", userUid);

      await setDoc(userRef, {
        nombre: firstName,
        apellido: lastName,
        email: email,
        telefono: phoneNumber,
        empresa: "",
        sesion: 0,
        status: true,
        pd: 0,
        ps: 0,
        total: 0,
      });

      // Mostrar modal de verificación
      setShowVerificationModal(true);

      // Limpiar formulario después de 2.3 segundos
      setTimeout(() => {
        setFormData({
          firstName: "",
          lastName: "",
          phoneNumber: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
      }, 2300);
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setErrors((prev) => ({
          ...prev,
          email:
            t("register.errors.emailInUse") ||
            "El correo electrónico ya está en uso",
        }));
      } else {
        console.error(t("register.errors.registrationError"), error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0">
        {/* <Link href="/" className="flex items-center mb-6">
          <img className="w-40 h-auto" src="/img/logo.png" alt="Upper Logo" />
        </Link> */}

        <div className="w-full bg-white rounded-xl shadow-2xl md:mt-0 sm:max-w-md xl:p-0 border border-gray-100">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
              {t("register.title")}
            </h1>

            <form
              className="space-y-4 md:space-y-6"
              onSubmit={handleRegistration}
            >
              {/* Nombre */}
              <div className="relative">
                <input
                  type="text"
                  id="firstName"
                  className={`block w-full px-4 py-3 text-sm border ${
                    errors.firstName && touched.firstName
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500`}
                  placeholder={t("register.placeholders.name")}
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.firstName && touched.firstName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.firstName}
                  </p>
                )}
              </div>

              {/* Apellido */}
              <div className="relative">
                <input
                  type="text"
                  id="lastName"
                  className={`block w-full px-4 py-3 text-sm border ${
                    errors.lastName && touched.lastName
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500`}
                  placeholder={t("register.placeholders.lastName")}
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.lastName && touched.lastName && (
                  <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
                )}
              </div>

              {/* Email */}
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  className={`block w-full px-4 py-3 text-sm border ${
                    errors.email && touched.email
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500`}
                  placeholder={t("register.placeholders.email")}
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.email && touched.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Teléfono */}
              <div className="relative">
                <input
                  type="text"
                  id="phoneNumber"
                  className={`block w-full px-4 py-3 text-sm border ${
                    errors.phoneNumber && touched.phoneNumber
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500`}
                  placeholder={t("register.placeholders.phone")}
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.phoneNumber && touched.phoneNumber && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              {/* Contraseña */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className={`block w-full px-4 py-3 text-sm border ${
                    errors.password && touched.password
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500 pr-12`}
                  placeholder={t("register.placeholders.password")}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => handleShowPasswordClick("password")}
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
                {errors.password && touched.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}

                {/* Indicador de fuerza de contraseña */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                      <div
                        className={`h-1.5 rounded-full ${
                          passwordStrength.score < 2
                            ? "bg-red-500"
                            : passwordStrength.score < 4
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{
                          width: `${(passwordStrength.score / 5) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex flex-wrap gap-1 text-xs">
                      <span
                        className={
                          passwordStrength.hasMinLength
                            ? "text-green-500"
                            : "text-gray-400"
                        }
                      >
                        8+ caracteres
                      </span>
                      <span
                        className={
                          passwordStrength.hasUpperCase
                            ? "text-green-500"
                            : "text-gray-400"
                        }
                      >
                        Mayúscula
                      </span>
                      <span
                        className={
                          passwordStrength.hasLowerCase
                            ? "text-green-500"
                            : "text-gray-400"
                        }
                      >
                        Minúscula
                      </span>
                      <span
                        className={
                          passwordStrength.hasNumber
                            ? "text-green-500"
                            : "text-gray-400"
                        }
                      >
                        Número
                      </span>
                      <span
                        className={
                          passwordStrength.hasSpecialChar
                            ? "text-green-500"
                            : "text-gray-400"
                        }
                      >
                        Caracter especial
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  className={`block w-full px-4 py-3 text-sm border ${
                    errors.confirmPassword && touched.confirmPassword
                      ? "border-red-500"
                      : touched.confirmPassword &&
                        formData.confirmPassword &&
                        formData.confirmPassword === formData.password
                      ? "border-green-500"
                      : "border-gray-300"
                  } rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500 pr-12`}
                  placeholder={t("register.placeholders.confirmPassword")}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => handleShowPasswordClick("confirmPassword")}
                >
                  {showConfirmPassword ? (
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
                {errors.confirmPassword && touched.confirmPassword ? (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.confirmPassword}
                  </p>
                ) : touched.confirmPassword &&
                  formData.confirmPassword &&
                  formData.confirmPassword === formData.password ? (
                  <p className="mt-1 text-sm text-green-500">
                    {t("register.errors.passwordsMatch")}
                  </p>
                ) : null}
              </div>

              {/* Términos y condiciones */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={termsChecked}
                    onChange={(e) => setTermsChecked(e.target.checked)}
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 accent-cyan-500"
                    required
                  />
                </div>
                <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                  {t("register.termsAndConditions")}
                  <button
                    type="button"
                    onClick={openTermsAndConditions}
                    className="ml-1 text-cyan-600 hover:underline font-medium"
                  >
                    {t("register.termsLink")}
                  </button>
                </label>
              </div>

              {/* Botón de envío */}
              <button
                type="submit"
                disabled={isButtonDisabled || isSubmitting}
                className={`w-full text-white px-5 py-3 text-base font-medium rounded-lg transition-colors duration-200 ease-in-out ${
                  isButtonDisabled || isSubmitting
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                }`}
              >
                {isSubmitting ? (
                  <div className="flex justify-center items-center">
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
                    Procesando...
                  </div>
                ) : (
                  t("register.submitButton")
                )}
              </button>

              {/* Enlace a iniciar sesión */}
              <div className="text-center">
                <span className="text-sm text-gray-600">
                  {t("register.alreadyHaveAccount")}
                </span>
                <Link
                  href="/login"
                  className="ml-1 text-cyan-600 hover:underline font-medium"
                >
                  {t("register.loginLink")}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal de verificación */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full mx-4 transform transition-all animate-fadeIn">
            <div className="text-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("register.registrationSuccess")}
            </h2>
            <p className="mb-6 text-gray-600">
              {t("register.verificationEmailSent")}
            </p>
            <div className="text-center">
              <Link href="/login" passHref>
                <button className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all">
                  {t("register.goToLogin")}
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Register;
