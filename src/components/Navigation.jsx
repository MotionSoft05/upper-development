"use client";

import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Bars3Icon, UserCircleIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";
import Router from "next/router";

const firebaseConfig = {
  apiKey: "AIzaSyCzD--npY_6fZcXH-8CzBV7UGzPBqg85y8",
  authDomain: "upper-a544e.firebaseapp.com",
  projectId: "upper-a544e",
  storageBucket: "upper-a544e.appspot.com",
  messagingSenderId: "665713417470",
  appId: "1:665713417470:web:73f7fb8ee518bea35999af",
  measurementId: "G-QTFQ55YY5D",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function Navigation() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

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
          <div className="hidden md:block">
            <div className="ml-auto flex items-baseline space-x-4">
              <ul className="flex font-bold rounded-lg flex-row space-x-8">
                <li>
                  <a
                    href="#"
                    className="hover:text-custom md:p-0"
                    aria-current="page"
                  >
                    Productos
                  </a>
                </li>
                <li>
                  <a href="#soluciones" className="hover:text-custom md:p-0">
                    Soluciones
                  </a>
                </li>
                <li>
                  <a href="#recursos" className="hover:text-custom md:p-0">
                    Recursos
                  </a>
                </li>
                <li>
                  <a href="#precios" className="hover:text-custom md:p-0">
                    Precios
                  </a>
                </li>
                <li>
                  <a href="#preguntas" className="hover:text-custom md:p-0">
                    FAQ
                  </a>
                </li>
              </ul>
              <div className="px-3">
                <div className="ml-auto flex items-baseline space-x-4">
                  {user && (
                    <div className="flex items-center space-x-2">
                      <span>Hola, {user.email}</span>
                      {user.emailVerified && ( // Verificar si el correo electrónico está verificado
                        <>
                          <Link href="/dashboard">
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
                            Cerrar sesión
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  {!user && (
                    <div className="flex items-center space-x-2">
                      <Link href="/register">
                        <button className="text-white bg-green-300 hover:bg-teal-300 font-medium rounded-lg text-sm px-4 py-2">
                          Registrarse
                        </button>
                      </Link>
                      <Link href="/login">
                        <button className="text-white bg-custom hover:bg-teal-300 font-medium rounded-lg text-sm px-4 py-2">
                          Iniciar sesión
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className=" lg:hidden md:hidden top-16 w-56 text-right z-10">
            <div className="ml-auto flex items-center space-x-1">
              <Menu as="div" className=" ">
                <div>
                  <Menu.Button className="p-2">
                    <Bars3Icon className="h-6 text-black" aria-hidden="true" />
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
                          Productos
                        </a>
                      </Menu.Item>
                      <Menu.Item>
                        <Link
                          href="/about"
                          className="group flex w-full items-center rounded-md px-2 py-1 text-sm"
                        >
                          About Us
                        </Link>
                      </Menu.Item>
                    </div>
                    <div>
                      <Menu.Item>
                        <Link
                          href="/shop"
                          className="group flex w-full items-center rounded-md px-2 py-1 text-sm"
                        >
                          Shop
                        </Link>
                      </Menu.Item>
                      <Menu.Item>
                        <Link
                          href="/profile"
                          className="group flex w-full items-center rounded-md px-2 py-1 text-sm"
                        >
                          Profile
                        </Link>
                      </Menu.Item>
                      <Menu.Item>
                        <Link
                          href="/contact"
                          className="group flex w-full items-center rounded-md px-2 py-1 text-sm"
                        >
                          Contact
                        </Link>
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
          <div className="  md:hidden flex-shrink-0  items-center ">
            <Link href="/">
              <img
                src="/img/logov2.png"
                className="h-16 md:h-24 py-3 "
                alt="Logo"
              />
            </Link>
          </div>
          <div className=" lg:hidden md:hidden top-16 w-56 text-right z-10">
            <div className="">
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
                      <Menu.Item>
                        <a
                          href="/register"
                          className="group flex w-full items-center rounded-md px-2 py-1 text-sm"
                        >
                          Registrarse
                        </a>
                      </Menu.Item>
                      <Menu.Item>
                        <Link
                          href="/login"
                          className="group flex w-full items-center rounded-md px-2 py-1 text-sm"
                        >
                          inician sesión
                        </Link>
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
