"use client";

import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Bars3Icon, UserCircleIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { usePathname } from "next/navigation"; // Captura la url
import {
  getDocs,
  onSnapshot,
  collection,
  query,
  where,
  getFirestore,
} from "firebase/firestore";
import LanguageSwitcher from "./LanguageSwitcher";

import { useTranslation } from "react-i18next"; // Traducciones
import { firebaseConfig } from "@/firebase/firebaseConfig";
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Asegúrate de agregar esta línea para obtener la instancia de Firestore
const usuariosCollection = collection(db, "usuarios");

{
  /*
const Loader = () => (
  <div className="h-screen bg-white">
    <div className="flex justify-center items-center h-full">
      <img
        className="h-16 w-16"
        src="https://icons8.com/preloaders/preloaders/1488/Iphone-spinner-2.gif"
        alt="Loading spinner"
      />
    
    </div>
  </div>
);
    */
}

function Navigation() {
  const isProduction = process.env.NEXT_PUBLIC_PRODUCTION; // Deploy (.html) o  en localhost()
  const { t } = useTranslation(); // i18n
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState(null);
  //const [loading, setLoading] = useState(true);

  const pathname = usePathname(); // Obtiene la ruta actual (pathname) para renderizar parte del NavBar

  //* --- FUNCIONES ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.emailVerified) {
        // console.log("Usuario autenticado:", user);
        setUser(user);

        // Obtener el nombre del usuario desde la propiedad displayName
        const displayName = user.displayName;

        // Dividir la cadena del nombre y apellido y tomar la primera parte (nombre)
        const nombreUsuario = displayName ? displayName.split(" ")[0] : "";

        setUserName(nombreUsuario);

        const q = query(usuariosCollection, where("email", "==", user.email));

        try {
          const querySnapshot = await getDocs(q);
          if (querySnapshot.docs.length > 0) {
            const usuario = querySnapshot.docs[0].data();
            setUserName(usuario.nombre);
          }

          // Manejar cambios en los datos del usuario
          const unsubscribeUsuario = onSnapshot(q, (snapshot) => {
            if (snapshot.docs.length > 0) {
              const usuario = snapshot.docs[0].data();
              setUserName(usuario.nombre);
            }
          });

          //setLoading(false);

          return () => unsubscribeUsuario();
        } catch (error) {
          console.error("Error al obtener datos del usuario:", error);
          //setLoading(false);
        }
      } else {
        setUser(null);
        setUserName(null);
        //setLoading(false); // Marcar la carga como completa en caso de que no haya usuario autenticado
      }
    });

    return () => unsubscribe();
  }, []); //? Podria ir [pathname] para actualizar en cada url?

  // No muestra Navigation en algunas URL determinadas
  const hideNavigation = () => {
    const hideRoutes = ["/paginasAleatorias", "/pantallaDeServicio"];
    return (
      hideRoutes.includes(pathname) || pathname.match(/\/pantalla[1-9]|10/)
    );
  };

  const handleLogout = async () => {
    try {
      //setLoading(true);
      await signOut(auth);
      setUser(null);
      setUserName(null);
      //setLoading(false);
      window.location.href = "/";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      //setLoading(false); // Marcar la carga como completa en caso de error
    }
  };

  const navigateToDashboard = async () => {
    //setLoading(true); // Iniciar la pantalla de carga al dirigirse al dashboard
    // Puedes agregar cualquier lógica adicional aquí antes de redirigir al dashboard
    window.location.href = `/dashboard${isProduction}`;
  };
  //* --- FUNCIONES ---

  if (hideNavigation()) {
    return null;
  }

  return (
    <nav className="bg-white">
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="hidden md:block flex-shrink-0 items-center">
            <Link href="/">
              <img
                src="/img/logov2.png"
                className="h-16 md:h-24 py-3"
                alt="Logo"
              />
            </Link>
          </div>
          {/* menu y register Desktop */}
          <div className="hidden md:block">
            <div className="ml-auto flex items-baseline space-x-4">
              {/* Se renderiza menu solo en el inicio de la pagina */}
              {(pathname === "/" || pathname === "/upper.mx") && (
                <ul className="flex font-bold rounded-lg flex-row space-x-8">
                  <li>
                    <a
                      href="#"
                      className="hover:text-custom md:p-0"
                      aria-current="page"
                    >
                      {t("navbar.products")}
                    </a>
                  </li>
                  <li>
                    <a href="#soluciones" className="hover:text-custom md:p-0">
                      {t("navbar.solutions")}
                    </a>
                  </li>
                  <li>
                    <a href="#recursos" className="hover:text-custom md:p-0">
                      {t("navbar.resources")}
                    </a>
                  </li>
                  <li>
                    <a href="#precios" className="hover:text-custom md:p-0">
                      {t("navbar.pricing")}
                    </a>
                  </li>
                  <li>
                    <a href="#preguntas" className="hover:text-custom md:p-0">
                      FAQ
                    </a>
                  </li>
                </ul>
              )}

              <div className="px-3">
                <div className="ml-auto flex items-baseline space-x-4 ">
                  {user && (
                    <div className="flex items-center space-x-2">
                      <span className="text-3x2 font-bold text-black">
                        {t("navbar.greeting")} {userName}!
                      </span>

                      {user.emailVerified && (
                        <>
                          <Link
                            // href="/dashboard.html"
                            href={`/dashboard${isProduction}`}
                          >
                            <button className="text-white bg-green-300 hover:bg-teal-300 font-medium rounded-lg text-sm px-4 py-2">
                              Dashboard
                            </button>
                          </Link>
                          <button
                            onClick={async () => {
                              await handleLogout();
                              window.location.href = "/";
                            }}
                            className="text-white bg-red-500 hover:bg-red-600 font-medium rounded-lg text-sm px-4 py-2"
                          >
                            {t("navbar.logout")}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  {!user && (
                    <div className="flex items-center space-x-2">
                      <Link href={`/register${isProduction}`}>
                        <button className="text-white bg-green-300 hover:bg-teal-300 font-medium rounded-lg text-sm px-4 py-2">
                          {/* Registrarse */}
                          {t("navbar.register")}
                        </button>
                      </Link>
                      {/* <Link href="/login.html"> */}
                      <Link href={`/login${isProduction}`}>
                        <button className="text-white bg-custom hover:bg-teal-300 font-medium rounded-lg text-sm px-4 py-2">
                          {/* Iniciar sesión */}
                          {t("navbar.login")}
                        </button>
                      </Link>
                    </div>
                  )}
                  <LanguageSwitcher />
                </div>
              </div>
            </div>
          </div>
          <div className=" lg:hidden md:hidden top-16 w-56 text-right z-10">
            <div className="ml-auto flex items-center space-x-1">
              {/* Se renderiza menu hamburgesa solo en el inicio de la pagina */}
              {(pathname === "/" || pathname === "/upperds.mx") && (
                <Menu as="div" className=" ">
                  <div>
                    <Menu.Button className="p-2">
                      <Bars3Icon
                        className="h-6 text-black"
                        aria-hidden="true"
                      />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute left-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div>
                        <Menu.Item>
                          <a
                            href="#"
                            className="group flex w-full items-center rounded-md px-2 py-1 text-sm"
                          >
                            {t("navbar.products")}
                          </a>
                        </Menu.Item>
                        <Menu.Item>
                          <Link
                            href="/#soluciones"
                            className="group flex w-full items-center rounded-md px-2 py-1 text-sm"
                          >
                            {t("navbar.solutions")}
                          </Link>
                        </Menu.Item>
                      </div>
                      <div>
                        <Menu.Item>
                          <Link
                            href="/#recursos"
                            className="group flex w-full items-center rounded-md px-2 py-1 text-sm"
                          >
                            {t("navbar.resources")}
                          </Link>
                        </Menu.Item>
                        <Menu.Item>
                          <Link
                            href="/#precios"
                            className="group flex w-full items-center rounded-md px-2 py-1 text-sm"
                          >
                            {t("navbar.pricing")}
                          </Link>
                        </Menu.Item>
                        <Menu.Item>
                          <Link
                            href="/#preguntas"
                            className="group flex w-full items-center rounded-md px-2 py-1 text-sm"
                          >
                            FAQ
                          </Link>
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              )}
            </div>
          </div>
          {/* Logo Mobile */}
          <div className="  md:hidden flex-shrink-0  items-center ">
            <Link href="/">
              <img
                src="/img/logov2.png"
                className="h-16 md:h-24 py-3 "
                alt="Logo"
              />
            </Link>
          </div>
          {/* login, dashboard y register Mobile */}
          <div className=" flex justify-between items-center lg:hidden md:hidden top-16 w-56 text-right z-10">
            <div className="ml-4">
              <LanguageSwitcher />
            </div>
            <div className="">
              {(pathname === "/" || pathname === "/upperds.mx") && (
                <Menu as="div" className=" ">
                  <div>
                    <Menu.Button className="p-2">
                      <UserCircleIcon
                        className="h-6 text-black"
                        aria-hidden="true"
                      />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div>
                        {user && (
                          <>
                            <Menu.Item>
                              {/* <Link href="/dashboard.html"> */}
                              <Link href={`/dashboard${isProduction}`}>
                                <button
                                  onClick={navigateToDashboard}
                                  className="group flex w-full items-center rounded-md px-2 py-1 text-sm"
                                >
                                  Dashboard
                                </button>
                              </Link>
                            </Menu.Item>
                            <Menu.Item>
                              <button
                                onClick={async () => {
                                  await handleLogout();
                                  window.location.href = "/";
                                }}
                                className="group flex w-full items-center rounded-md px-2 py-1 text-sm"
                              >
                                {t("navbar.logout")}
                              </button>
                            </Menu.Item>
                          </>
                        )}
                        {!user && (
                          <>
                            <Menu.Item>
                              <Link
                                // href="/register.html"
                                href={`/register${isProduction}`}
                                className="group flex w-full items-center rounded-md px-2 py-1 text-sm"
                              >
                                {/* Registrarse */}
                                {t("navbar.register")}
                              </Link>
                            </Menu.Item>
                            <Menu.Item>
                              <Link
                                // href="/login.html"
                                href={`/login${isProduction}`}
                                className="group flex w-full items-center rounded-md px-2 py-1 text-sm"
                              >
                                {/* Iniciar sesión */}
                                {t("navbar.login")}
                              </Link>
                            </Menu.Item>
                          </>
                        )}
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
