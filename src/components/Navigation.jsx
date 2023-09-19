"use client";

import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Bars3Icon } from "@heroicons/react/20/solid";
import Link from "next/link";

function Navigation() {
  return (
    <nav className="bg-white">
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center ">
            <img
              src="/img/logov2.png"
              className="h-16 md:h-24 py-3 "
              alt="Logo"
            />
          </div>
          <div className="hidden md:block">
            <div className="ml-auto flex items-baseline space-x-4">
              <ul className="flex font-bold rounded-lg flex-row space-x-8  ">
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
                  <a href="#recursos" className=" hover:text-custom md:p-0">
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
              <div className=" p-3">
                <button
                  type="button"
                  className="text-white bg-green-300 hover:bg-teal-300 font-medium rounded-lg text-sm px-4 py-2  "
                >
                  Registrarse
                </button>
              </div>
              <div>
                <button
                  type="button"
                  className="text-white bg-custom hover:bg-teal-300 font-medium rounded-lg text-sm px-4 py-2 "
                >
                  Acceso a usuarios
                </button>
              </div>
            </div>
          </div>
          <div className=" lg:hidden md:hidden top-16 w-56 text-right z-10">
            <div className="ml-auto flex items-center space-x-1">
              <div className=" md:p-3">
                <button
                  type="button"
                  className="text-white bg-green-300 hover:bg-teal-300 font-medium rounded-lg text-xs md:text-sm px-2 py-1"
                >
                  Registrarse
                </button>
              </div>
              <div>
                <button
                  type="button"
                  className="text-white bg-custom hover:bg-teal-300 font-medium rounded-lg text-xs md:text-sm px-2 py-1"
                >
                  inician sesión
                </button>
              </div>{" "}
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
                  <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
