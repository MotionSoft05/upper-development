"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, User, ChevronDown, Globe, LogOut } from "lucide-react";
import { auth } from "@/firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState("ES");
  const [hoveredLink, setHoveredLink] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleLanguage = () => {
    setLang((prev) => (prev === "ES" ? "EN" : "ES"));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-md border-b border-gray-100 py-3 shadow-md"
            : "bg-white/5 backdrop-blur-sm border-b border-white/10 py-5"
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between relative">
          {/* Logo - Maximum Size (closer to center) */}
          <Link
            href="/"
            className="flex-shrink-0 relative z-50 group -my-10 ml-4 md:ml-8 lg:ml-12"
          >
            <Image
              src="/img/UpperNewLogo-removebg-preview.png"
              alt="Upper Digital Signage"
              width={700}
              height={200}
              className="h-32 md:h-36 lg:h-40 w-auto transition-transform group-hover:scale-105"
              priority
            />
          </Link>

          {/* Desktop Links - Absolutely Centered with Sliding Highlight */}
          <div
            className="hidden md:flex items-center gap-0 bg-gray-900/90 backdrop-blur-md p-1.5 rounded-full border border-gray-700 shadow-lg absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            onMouseLeave={() => setHoveredLink(null)}
          >
            {[
              { href: "#hero", label: "Nosotros" },
              { href: "#servicios", label: "Soluciones" },
              { href: "#hardware", label: "Aplicación" },
              { href: "#precios", label: "Precios" },
              { href: "#faq", label: "Preguntas" },
            ].map((item) => (
              <NavLinkAnimated
                key={item.href}
                href={item.href}
                isHovered={hoveredLink === item.href}
                onHover={() => setHoveredLink(item.href)}
              >
                {item.label}
              </NavLinkAnimated>
            ))}
          </div>

          {/* Desktop Actions - Right Side */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Switcher - Globe + Animated Flag */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-white/50 transition-colors border border-transparent hover:border-gray-100"
            >
              <Globe className="w-4 h-4 text-gray-500" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={lang}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="font-bold text-gray-700 text-sm"
                >
                  {lang === "ES" ? "🇪🇸 ES" : "🇺🇸 EN"}
                </motion.span>
              </AnimatePresence>
            </button>

            {!loading && (
              <>
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-white bg-gray-900 hover:bg-gray-800 shadow-md hover:shadow-lg transition-all text-sm"
                    >
                      <User size={18} />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-gray-700 bg-gray-100 hover:text-red-600 hover:bg-red-100 transition-all text-sm border border-gray-300 hover:border-red-300"
                    >
                      <LogOut size={16} />
                      Salir
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="px-8 py-2.5 rounded-full font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-lg shadow-blue-500/30 transition-all text-sm transform hover:-translate-y-0.5"
                  >
                    Acceder
                  </button>
                )}
              </>
            )}
          </div>

          {/* Mobile Toggle - Animated Hamburger */}
          <button
            className="md:hidden relative z-50 p-2 w-12 h-12 flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            <div className="w-6 h-5 relative flex flex-col justify-between">
              <motion.span
                className="w-full h-0.5 bg-gray-700 rounded-full origin-left"
                animate={
                  mobileMenuOpen
                    ? { rotate: 45, y: 0, x: 2 }
                    : { rotate: 0, y: 0, x: 0 }
                }
                transition={{ duration: 0.3 }}
              />
              <motion.span
                className="w-full h-0.5 bg-gray-700 rounded-full"
                animate={
                  mobileMenuOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }
                }
                transition={{ duration: 0.2 }}
              />
              <motion.span
                className="w-full h-0.5 bg-gray-700 rounded-full origin-left"
                animate={
                  mobileMenuOpen
                    ? { rotate: -45, y: 0, x: 2 }
                    : { rotate: 0, y: 0, x: 0 }
                }
                transition={{ duration: 0.3 }}
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu - Simplified Actions Only */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed inset-x-0 top-[72px] z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-xl p-6"
            >
              <div className="flex flex-col gap-4 max-w-md mx-auto">
                {/* Language Toggle */}
                <button
                  onClick={() => setLang(lang === "ES" ? "EN" : "ES")}
                  className="flex items-center justify-center gap-3 w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <Globe className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">
                    {lang === "ES" ? "🇪🇸 Español" : "🇺🇸 English"}
                  </span>
                </button>

                {!loading && (
                  <>
                    {user ? (
                      <>
                        {/* Dashboard Button */}
                        <Link
                          href="/dashboard"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-white bg-gray-900 hover:bg-gray-800 shadow-lg transition-all text-lg"
                        >
                          <User size={20} />
                          Dashboard
                        </Link>

                        {/* Logout Button */}
                        <button
                          onClick={() => {
                            handleLogout();
                            setMobileMenuOpen(false);
                          }}
                          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all"
                        >
                          <LogOut size={18} />
                          Cerrar Sesión
                        </button>
                      </>
                    ) : (
                      /* Login/Register Button */
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setShowAuthModal(true);
                        }}
                        className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-lg shadow-blue-500/30 transition-all text-lg"
                      >
                        <User size={20} />
                        Iniciar Sesión
                      </button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Auth Modal - Outside nav to cover full viewport */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}

// Animated NavLink with sliding highlight
function NavLinkAnimated({ href, children, isHovered, onHover }) {
  const handleClick = (e) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      onMouseEnter={onHover}
      className="relative px-4 py-2 rounded-full text-sm font-medium cursor-pointer z-10"
    >
      {isHovered && (
        <motion.span
          layoutId="navHighlight"
          className="absolute inset-0 bg-white rounded-full -z-10"
          initial={false}
          transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
        />
      )}
      <motion.span
        animate={{ color: isHovered ? "#111827" : "#e5e7eb" }}
        transition={{ duration: 0.15 }}
      >
        {children}
      </motion.span>
    </a>
  );
}

// Regular NavLink for mobile menu
function NavLink({ href, children }) {
  const handleClick = (e) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className="px-4 py-2 rounded-full text-sm font-medium text-gray-200 transition-all hover:bg-white hover:text-gray-900 hover:shadow-sm cursor-pointer"
    >
      {children}
    </a>
  );
}

function MobileLink({ href, children, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="text-2xl font-bold text-gray-800 hover:text-[#0080FF] flex items-center justify-between"
    >
      {children}
      <ChevronDown className="-rotate-90 text-gray-300" />
    </Link>
  );
}
