"use client";
import { useState, useEffect, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
  Loader2,
} from "lucide-react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import auth, { loginUser } from "@/firebase/auth";
import GoogleLoginButton from "./GoogleLoginButton";
import getFileUrl from "@/hook/getFileUrl";

// Animation variants
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 300 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 },
  },
};

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", damping: 25, stiffness: 300 },
  },
  exit: (direction) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    transition: { duration: 0.2 },
  }),
};

export default function AuthModal({ isOpen, onClose }) {
  // View state: "login" | "register" | "verification" | "forgotPassword"
  const [view, setView] = useState("login");
  const [direction, setDirection] = useState(0);

  // Login states
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register states
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [registerError, setRegisterError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasMinLength: false,
    hasUpperCase: false,
    hasNumber: false,
  });

  // Forgot password states
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [isSendingRecovery, setIsSendingRecovery] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  // Registered email for verification view
  const [registeredEmail, setRegisteredEmail] = useState("");

  // Load terms URL
  useEffect(() => {
    const fetchFileUrl = async () => {
      try {
        const url = await getFileUrl("termsAndConditions", "terminos");
        setFileUrl(url);
      } catch (error) {
        console.error("Error fetching terms URL:", error);
      }
    };
    fetchFileUrl();
  }, []);

  // Password strength checker
  useEffect(() => {
    const { password } = registerData;
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    let score = 0;
    if (hasMinLength) score++;
    if (hasUpperCase) score++;
    if (hasNumber) score++;

    setPasswordStrength({ score, hasMinLength, hasUpperCase, hasNumber });
  }, [registerData.password]);

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setView("login");
        setLoginData({ email: "", password: "" });
        setRegisterData({
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          password: "",
          confirmPassword: "",
        });
        setLoginError(null);
        setRegisterError(null);
        setTermsChecked(false);
        setRecoveryEmail("");
        setRecoverySuccess(false);
      }, 300);
    }
  }, [isOpen]);

  // Navigation helpers
  const goTo = (newView) => {
    const viewOrder = ["login", "register", "verification", "forgotPassword"];
    const currentIndex = viewOrder.indexOf(view);
    const newIndex = viewOrder.indexOf(newView);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setView(newView);
  };

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) return;

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const userCredential = await loginUser(
        loginData.email,
        loginData.password,
      );
      const user = userCredential.user;

      if (user && user.emailVerified) {
        const db = getFirestore();
        const userDocRef = doc(db, "usuarios", user.uid);
        const userDocSnapshot = await getDoc(userDocRef);
        const sesionActual = userDocSnapshot.data()?.sesion || 0;

        await updateDoc(userDocRef, { sesion: sesionActual + 1 });

        window.location.href = "/dashboard/";
      } else {
        setLoginError(
          "Por favor verifica tu correo electrónico antes de iniciar sesión.",
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("Credenciales incorrectas. Intenta de nuevo.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Register handler
  const handleRegister = async (e) => {
    e.preventDefault();

    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      confirmPassword,
    } = registerData;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phoneNumber ||
      !password ||
      !confirmPassword
    ) {
      setRegisterError("Por favor completa todos los campos.");
      return;
    }

    if (password !== confirmPassword) {
      setRegisterError("Las contraseñas no coinciden.");
      return;
    }

    if (!termsChecked) {
      setRegisterError("Debes aceptar los términos y condiciones.");
      return;
    }

    setIsRegistering(true);
    setRegisterError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });

      await sendEmailVerification(user);

      const db = getFirestore();
      const userRef = doc(db, "usuarios", user.uid);

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

      setRegisteredEmail(email);
      goTo("verification");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setRegisterError("Este correo ya está registrado.");
      } else {
        setRegisterError("Error al registrar. Intenta de nuevo.");
      }
      console.error("Register error:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  // Forgot password handler
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!recoveryEmail) return;

    setIsSendingRecovery(true);

    try {
      await sendPasswordResetEmail(auth, recoveryEmail);
      setRecoverySuccess(true);
    } catch (error) {
      console.error("Password reset error:", error);
    } finally {
      setIsSendingRecovery(false);
    }
  };

  // Open terms
  const openTerms = () => {
    if (fileUrl && fileUrl.length > 0) {
      window.open(fileUrl[0].url, "_blank");
    }
  };

  // Form validation
  const isLoginValid = loginData.email && loginData.password;
  const isRegisterValid =
    registerData.firstName &&
    registerData.lastName &&
    registerData.email &&
    registerData.phoneNumber &&
    registerData.password &&
    registerData.confirmPassword &&
    registerData.password === registerData.confirmPassword &&
    termsChecked;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            variants={backdropVariants}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            variants={modalVariants}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Content with slide animations */}
            <div className="relative min-h-[500px]">
              <AnimatePresence mode="wait" custom={direction}>
                {/* LOGIN VIEW */}
                {view === "login" && (
                  <motion.div
                    key="login"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="p-8"
                  >
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Bienvenido de vuelta
                      </h2>
                      <p className="text-gray-500 mt-2">
                        Inicia sesión en tu cuenta
                      </p>
                    </div>

                    {/* Google Login */}
                    <GoogleLoginButton
                      variant="default"
                      text="Continuar con Google"
                      className="w-full justify-center mb-6"
                    />

                    {/* Divider */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-white text-gray-500">
                          O ingresa con tu email
                        </span>
                      </div>
                    </div>

                    {/* Error message */}
                    {loginError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg"
                      >
                        {loginError}
                      </motion.div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          placeholder="tu@email.com"
                          value={loginData.email}
                          onChange={(e) =>
                            setLoginData({
                              ...loginData,
                              email: e.target.value,
                            })
                          }
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                      </div>

                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Contraseña"
                          value={loginData.password}
                          onChange={(e) =>
                            setLoginData({
                              ...loginData,
                              password: e.target.value,
                            })
                          }
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      {/* Forgot password link */}
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => goTo("forgotPassword")}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          ¿Olvidaste tu contraseña?
                        </button>
                      </div>

                      {/* Submit button */}
                      <button
                        type="submit"
                        disabled={!isLoginValid || isLoggingIn}
                        className={`w-full py-3 rounded-lg font-medium text-white transition-all ${
                          isLoginValid && !isLoggingIn
                            ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-lg hover:shadow-xl"
                            : "bg-gray-300 cursor-not-allowed"
                        }`}
                      >
                        {isLoggingIn ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Iniciando sesión...
                          </span>
                        ) : (
                          "Iniciar Sesión"
                        )}
                      </button>
                    </form>

                    {/* Register link */}
                    <p className="text-center mt-6 text-gray-600">
                      ¿No tienes cuenta?{" "}
                      <button
                        onClick={() => goTo("register")}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Regístrate
                      </button>
                    </p>

                    {/* Security Badges */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="flex items-center justify-center gap-4">
                        {/* Google */}
                        <div
                          className="group flex items-center gap-1.5 cursor-default"
                          title="Infraestructura Google Cloud"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path
                              className="transition-colors fill-gray-400 group-hover:fill-[#4285F4]"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              className="transition-colors fill-gray-400 group-hover:fill-[#34A853]"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              className="transition-colors fill-gray-400 group-hover:fill-[#FBBC05]"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              className="transition-colors fill-gray-400 group-hover:fill-[#EA4335]"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          <span className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors">
                            Google
                          </span>
                        </div>
                        {/* Firebase */}
                        <div
                          className="group flex items-center gap-1.5 cursor-default"
                          title="Firebase Auth"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path
                              className="transition-colors fill-gray-400 group-hover:fill-[#FFA000]"
                              d="M3.89 15.672L6.255.461A.542.542 0 017.27.288l2.543 4.771z"
                            />
                            <path
                              className="transition-colors fill-gray-400 group-hover:fill-[#F57C00]"
                              d="M20.684 19.364l-2.25-14a.54.54 0 00-.919-.295L3.316 19.365l7.856 4.427a1.621 1.621 0 001.588 0z"
                            />
                            <path
                              className="transition-colors fill-gray-400 group-hover:fill-[#FFCA28]"
                              d="M14.3 7.147l-1.82-3.482a.542.542 0 00-.96 0L3.53 17.984z"
                            />
                          </svg>
                          <span className="text-xs text-gray-400 group-hover:text-[#F57C00] transition-colors">
                            Firebase
                          </span>
                        </div>
                        {/* SSL */}
                        <div
                          className="group flex items-center gap-1.5 cursor-default"
                          title="Conexión segura SSL"
                        >
                          <svg
                            className="w-4 h-4 transition-colors text-gray-400 group-hover:text-green-500"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect
                              x="3"
                              y="11"
                              width="18"
                              height="11"
                              rx="2"
                              ry="2"
                            />
                            <path d="M7 11V7a5 5 0 0110 0v4" />
                          </svg>
                          <span className="text-xs text-gray-400 group-hover:text-green-500 transition-colors">
                            SSL
                          </span>
                        </div>
                      </div>
                      <p className="text-center text-xs text-gray-400 mt-2">
                        Tu información está protegida
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* REGISTER VIEW */}
                {view === "register" && (
                  <motion.div
                    key="register"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="p-8"
                  >
                    {/* Back button */}
                    <button
                      onClick={() => goTo("login")}
                      className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span className="text-sm">Volver</span>
                    </button>

                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Crear cuenta
                      </h2>
                      <p className="text-gray-500 mt-1 text-sm">
                        Completa tus datos para registrarte
                      </p>
                    </div>

                    {/* Error message */}
                    {registerError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg"
                      >
                        {registerError}
                      </motion.div>
                    )}

                    {/* Register Form */}
                    <form onSubmit={handleRegister} className="space-y-3">
                      {/* Name fields in row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Nombre"
                            value={registerData.firstName}
                            onChange={(e) =>
                              setRegisterData({
                                ...registerData,
                                firstName: e.target.value,
                              })
                            }
                            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Apellido"
                            value={registerData.lastName}
                            onChange={(e) =>
                              setRegisterData({
                                ...registerData,
                                lastName: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          placeholder="tu@email.com"
                          value={registerData.email}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              email: e.target.value,
                            })
                          }
                          className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Phone */}
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="tel"
                          placeholder="+52 81 1234 5678"
                          value={registerData.phoneNumber}
                          onChange={(e) => {
                            const filtered = e.target.value
                              .replace(/[^+()0-9\-\s]/g, "")
                              .slice(0, 16);
                            setRegisterData({
                              ...registerData,
                              phoneNumber: filtered,
                            });
                          }}
                          className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Password */}
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type={showRegisterPassword ? "text" : "password"}
                          placeholder="Contraseña"
                          value={registerData.password}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              password: e.target.value,
                            })
                          }
                          className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowRegisterPassword(!showRegisterPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          {showRegisterPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Password strength */}
                      {registerData.password && (
                        <div className="flex gap-1.5 text-xs">
                          <span
                            className={
                              passwordStrength.hasMinLength
                                ? "text-green-500"
                                : "text-gray-400"
                            }
                          >
                            8+ chars
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
                              passwordStrength.hasNumber
                                ? "text-green-500"
                                : "text-gray-400"
                            }
                          >
                            Número
                          </span>
                        </div>
                      )}

                      {/* Confirm Password */}
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirmar contraseña"
                          value={registerData.confirmPassword}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              confirmPassword: e.target.value,
                            })
                          }
                          className={`w-full pl-9 pr-10 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            registerData.confirmPassword &&
                            registerData.password !==
                              registerData.confirmPassword
                              ? "border-red-300"
                              : registerData.confirmPassword &&
                                  registerData.password ===
                                    registerData.confirmPassword
                                ? "border-green-300"
                                : "border-gray-300"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Terms checkbox */}
                      <div className="flex items-start gap-2 pt-2">
                        <input
                          type="checkbox"
                          id="terms"
                          checked={termsChecked}
                          onChange={(e) => setTermsChecked(e.target.checked)}
                          className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                        />
                        <label
                          htmlFor="terms"
                          className="text-sm text-gray-600"
                        >
                          Acepto los{" "}
                          <button
                            type="button"
                            onClick={openTerms}
                            className="text-blue-600 hover:underline"
                          >
                            términos y condiciones
                          </button>
                        </label>
                      </div>

                      {/* Submit button */}
                      <button
                        type="submit"
                        disabled={!isRegisterValid || isRegistering}
                        className={`w-full py-3 rounded-lg font-medium text-white transition-all mt-4 ${
                          isRegisterValid && !isRegistering
                            ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-lg"
                            : "bg-gray-300 cursor-not-allowed"
                        }`}
                      >
                        {isRegistering ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Creando cuenta...
                          </span>
                        ) : (
                          "Crear Cuenta"
                        )}
                      </button>
                    </form>

                    {/* Login link */}
                    <p className="text-center mt-4 text-sm text-gray-600">
                      ¿Ya tienes cuenta?{" "}
                      <button
                        onClick={() => goTo("login")}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Inicia Sesión
                      </button>
                    </p>
                  </motion.div>
                )}

                {/* VERIFICATION VIEW */}
                {view === "verification" && (
                  <motion.div
                    key="verification"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="p-8 flex flex-col items-center justify-center min-h-[500px]"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 15, delay: 0.2 }}
                      className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
                    >
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </motion.div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      ¡Registro exitoso!
                    </h2>
                    <p className="text-gray-500 text-center mb-6">
                      Hemos enviado un correo de verificación a:
                    </p>
                    <p className="font-medium text-gray-900 bg-gray-100 px-4 py-2 rounded-lg mb-8">
                      {registeredEmail}
                    </p>
                    <p className="text-sm text-gray-500 text-center mb-6">
                      Por favor revisa tu bandeja de entrada y haz clic en el
                      enlace para verificar tu cuenta.
                    </p>

                    <button
                      onClick={onClose}
                      className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium rounded-lg shadow-lg transition-all"
                    >
                      Entendido
                    </button>
                  </motion.div>
                )}

                {/* FORGOT PASSWORD VIEW */}
                {view === "forgotPassword" && (
                  <motion.div
                    key="forgotPassword"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="p-8"
                  >
                    {/* Back button */}
                    <button
                      onClick={() => goTo("login")}
                      className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span className="text-sm">Volver al login</span>
                    </button>

                    {!recoverySuccess ? (
                      <>
                        <div className="text-center mb-8">
                          <h2 className="text-2xl font-bold text-gray-900">
                            Recuperar contraseña
                          </h2>
                          <p className="text-gray-500 mt-2 text-sm">
                            Ingresa tu email y te enviaremos un enlace para
                            restablecer tu contraseña.
                          </p>
                        </div>

                        <form
                          onSubmit={handleForgotPassword}
                          className="space-y-4"
                        >
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="email"
                              placeholder="tu@email.com"
                              value={recoveryEmail}
                              onChange={(e) => setRecoveryEmail(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={!recoveryEmail || isSendingRecovery}
                            className={`w-full py-3 rounded-lg font-medium text-white transition-all ${
                              recoveryEmail && !isSendingRecovery
                                ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-lg"
                                : "bg-gray-300 cursor-not-allowed"
                            }`}
                          >
                            {isSendingRecovery ? (
                              <span className="flex items-center justify-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Enviando...
                              </span>
                            ) : (
                              "Enviar enlace de recuperación"
                            )}
                          </button>
                        </form>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", damping: 15 }}
                          className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                          <CheckCircle className="w-8 h-8 text-green-500" />
                        </motion.div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          ¡Email enviado!
                        </h3>
                        <p className="text-gray-500 mb-6">
                          Revisa tu correo para restablecer tu contraseña.
                        </p>
                        <button
                          onClick={() => {
                            setRecoverySuccess(false);
                            setRecoveryEmail("");
                            goTo("login");
                          }}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Volver al login
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
