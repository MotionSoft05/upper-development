"use client";

import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Bars3Icon, UserCircleIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { usePathname } from "next/navigation";
import {
  getDocs,
  onSnapshot,
  collection,
  query,
  where,
  getFirestore,
} from "firebase/firestore";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { firebaseConfig } from "@/firebase/firebaseConfig";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const usuariosCollection = collection(db, "usuarios");

function Navigation() {
  const isProduction = process.env.NEXT_PUBLIC_PRODUCTION;
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pathname = usePathname();

  // Check if we're on the homepage
  const isHomePage =
    pathname === "/" || pathname === "/upper.mx" || pathname === "/upperds.mx";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.emailVerified) {
        setUser(user);

        // Get user's first name from displayName
        const displayName = user.displayName;
        const nombreUsuario = displayName ? displayName.split(" ")[0] : "";
        setUserName(nombreUsuario);

        // Get user data from Firestore
        const q = query(usuariosCollection, where("email", "==", user.email));

        try {
          const querySnapshot = await getDocs(q);
          if (querySnapshot.docs.length > 0) {
            const usuario = querySnapshot.docs[0].data();
            setUserName(usuario.nombre);
          }

          // Listen for user data changes
          const unsubscribeUsuario = onSnapshot(q, (snapshot) => {
            if (snapshot.docs.length > 0) {
              const usuario = snapshot.docs[0].data();
              setUserName(usuario.nombre);
            }
          });

          return () => unsubscribeUsuario();
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
        setUserName(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Hide navigation on specific routes
  const hideNavigation = () => {
    const hideRoutes = [
      "/paginasAleatorias",
      "/pantallaDeServicio",
      "/pantallaDirec1",
    ];

    // Remove .html extension if present
    const sanitizedPathname = pathname.replace(".html", "");

    return (
      hideRoutes.includes(sanitizedPathname) ||
      sanitizedPathname.match(/\/pantalla[1-9]|10/)
    );
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserName(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const navigateToDashboard = () => {
    window.location.href = `/dashboard${isProduction}`;
  };

  if (hideNavigation()) {
    return null;
  }

  // Navbar menu items for homepage
  const menuItems = [
    { id: "products", label: t("navbar.products"), href: "#" },
    { id: "solutions", label: t("navbar.solutions"), href: "#soluciones" },
    { id: "resources", label: t("navbar.resources"), href: "#recursos" },
    { id: "pricing", label: t("navbar.pricing"), href: "#precios" },
    { id: "faq", label: "FAQ", href: "#preguntas" },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-10">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - visible on all screens */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/">
              <img
                src="/img/logov2.png"
                className="h-12 md:h-16"
                alt="Upper Logo"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:justify-end md:flex-1">
            {/* Menu items - only on homepage */}
            {isHomePage && (
              <div className="flex space-x-6 mr-8">
                {menuItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    className="text-gray-700 hover:text-custom font-medium transition duration-150 ease-in-out"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            )}

            {/* Right side - user actions */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-gray-800 font-medium">
                    ¡Hola, <span className="font-bold">{userName}</span>!
                  </span>
                  <Link href={`/dashboard${isProduction}`}>
                    <button className="bg-teal-400 hover:bg-teal-500 text-white font-medium rounded-lg px-5 py-2 text-sm transition duration-150 ease-in-out">
                      Dashboard
                    </button>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg px-5 py-2 text-sm transition duration-150 ease-in-out"
                  >
                    Cerrar sesión
                  </button>
                  <LanguageSwitcher />
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href={`/register${isProduction}`}>
                    <button className="bg-teal-400 hover:bg-teal-500 text-white font-medium rounded-lg px-5 py-2 text-sm transition duration-150 ease-in-out">
                      {t("navbar.register")}
                    </button>
                  </Link>
                  <Link href={`/login${isProduction}`}>
                    <button className="bg-custom hover:bg-teal-500 text-white font-medium rounded-lg px-5 py-2 text-sm transition duration-150 ease-in-out">
                      {t("navbar.login")}
                    </button>
                  </Link>
                  <LanguageSwitcher />
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center space-x-2">
            {/* Menu button - only on homepage */}
            {isHomePage && (
              <Menu as="div" className="relative">
                <Menu.Button
                  className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  <Bars3Icon
                    className="h-6 w-6 text-gray-700"
                    aria-hidden="true"
                  />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
                >
                  <Menu.Items className="absolute left-0 mt-2 w-48 origin-top-left bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {menuItems.map((item) => (
                        <Menu.Item key={item.id}>
                          {({ active }) => (
                            <a
                              href={item.href}
                              className={`${
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-700"
                              } block px-4 py-2 text-sm`}
                            >
                              {item.label}
                            </a>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            )}

            {/* User menu */}
            <Menu as="div" className="relative">
              <div className="flex items-center">
                {user && (
                  <span className="text-gray-800 font-medium mr-2">
                    ¡Hola, <span className="font-bold">{userName}</span>!
                  </span>
                )}
                <Menu.Button className="p-2 rounded-md hover:bg-gray-100 focus:outline-none">
                  <UserCircleIcon
                    className="h-6 w-6 text-gray-700"
                    aria-hidden="true"
                  />
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {user ? (
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href={`/dashboard${isProduction}`}
                            className={`${
                              active
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-700"
                            } block px-4 py-2 text-sm`}
                            onClick={navigateToDashboard}
                          >
                            Dashboard
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={`${
                              active
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-700"
                            } block w-full text-left px-4 py-2 text-sm`}
                          >
                            Cerrar sesión
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  ) : (
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href={`/register${isProduction}`}
                            className={`${
                              active
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-700"
                            } block px-4 py-2 text-sm`}
                          >
                            {t("navbar.register")}
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href={`/login${isProduction}`}
                            className={`${
                              active
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-700"
                            } block px-4 py-2 text-sm`}
                          >
                            {t("navbar.login")}
                          </Link>
                        )}
                      </Menu.Item>
                    </div>
                  )}
                  <div className="py-1 border-t border-gray-100">
                    <div className="px-4 py-2">
                      <LanguageSwitcher />
                    </div>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
