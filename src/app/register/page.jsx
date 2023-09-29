"use client";
import React, { useState } from "react";
import { auth, firestore } from "../../firebase"; // Importa las instancias de Firebase desde el archivo firebase.js

function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "", // Nuevo campo de contraseña
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted!");

    // Autenticación con Firebase
    auth
      .createUserWithEmailAndPassword(formData.email, formData.password) // Utiliza el valor del campo de contraseña
      .then((userCredential) => {
        const user = userCredential.user;
        // Puedes acceder a 'user' aquí dentro
      })
      .catch((error) => {
        console.error("Error creating account: ", error);
      });

    // Almacenamiento de datos en Firestore
    firestore
      .collection("usuarios")
      .add({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
      })
      .then((docRef) => {
        // Documento agregado exitosamente
      })
      .catch((error) => {
        // Maneja errores de Firestore
        console.error("Error adding document: ", error);
      });
  };
  console.log(auth); // Verifica si auth se inicializa correctamente
  console.log(firestore); // Verifica si firestore se inicializa correctamente

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
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="mb-6 flex space-x-4">
                <div className="relative" data-te-input-wrapper-init>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First Name"
                    className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none"
                  />
                </div>
                <div className="relative" data-te-input-wrapper-init>
                  <input
                    type="text"
                    className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none"
                    id="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="mb-6">
                <div className="relative" data-te-input-wrapper-init>
                  <input
                    type="text"
                    className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none"
                    id="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="mb-6">
                <div className="relative" data-te-input-wrapper-init>
                  <input
                    type="text"
                    className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none"
                    id="phoneNumber"
                    placeholder="Phone Number"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="mb-6">
                <div className="relative" data-te-input-wrapper-init>
                  <input
                    type="password"
                    className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none"
                    id="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </form>
            <div className="flex items-start flex-col">
              <div className="mb-3 flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300"
                  required=""
                />
                <label
                  htmlFor="terms"
                  className="ml-2 font-light text-gray-500"
                >
                  I accept the
                  <a
                    className="font-medium text-primary-600 hover:underline "
                    href="#"
                  >
                    Terms and Conditions
                  </a>
                </label>
              </div>
              <button
                type="submit"
                className="w-full bg-gray-300 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Create an account
              </button>
              <p className="mt-3 text-sm font-light text-gray-500">
                Already have an account?
                <a
                  href="#"
                  className="font-medium text-primary-600 hover:underline "
                >
                  Login here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Register;
