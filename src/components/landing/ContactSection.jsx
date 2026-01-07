"use client";
import React, { useState } from "react";
import { Mail, MessageSquare, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ContactSection() {
  const [formStatus, setFormStatus] = useState("idle"); // idle, submitting, success

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus("submitting");
    // Simulate API call
    setTimeout(() => {
      setFormStatus("success");
    }, 1500);
  };

  return (
    <section
      id="contacto"
      className="py-24 bg-transparent relative overflow-hidden"
    >
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          {/* Left Side: Context & Direct Contact */}
          <div className="flex-1 lg:pt-10">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Hablemos de tu <br />
              <span className="text-[#0080FF]">Transformación Digital.</span>
            </h2>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-lg">
              Ya sea que gestiones un hotel boutique o una cadena internacional,
              tenemos la solución escalable para ti.
            </p>

            <div className="space-y-8">
              {/* Direct Link 1 */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 bg-blue-50 text-[#0080FF] rounded-lg">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">
                    Ventas & Proyectos
                  </h4>
                  <p className="text-sm text-gray-500 mb-2">
                    Para cotizaciones y demos personalizadas.
                  </p>
                  <a
                    href="mailto:contacto@upperds.mx"
                    className="text-[#0080FF] font-medium hover:underline text-sm"
                  >
                    contacto@upperds.mx
                  </a>
                </div>
              </div>

              {/* Direct Link 2 */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">
                    Soporte Técnico
                  </h4>
                  <p className="text-sm text-gray-500 mb-2">
                    Ayuda inmediata para clientes activos.
                  </p>
                  <a
                    href="https://wa.me/525537173408"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 font-medium hover:underline text-sm"
                  >
                    Chat por WhatsApp (+52 55 3717 3408)
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: The Form */}
          <div className="flex-1 w-full max-w-[550px]">
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-blue-900/5 border border-gray-100">
              {formStatus === "success" ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    ¡Mensaje Enviado!
                  </h3>
                  <p className="text-gray-500">
                    Un especialista de Upper te contactará en menos de 24 horas.
                  </p>
                  <button
                    onClick={() => setFormStatus("idle")}
                    className="mt-8 text-[#0080FF] font-medium hover:underline"
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Envíanos un mensaje
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="text-sm font-medium text-gray-700"
                      >
                        Nombre
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-[#0080FF] focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="company"
                        className="text-sm font-medium text-gray-700"
                      >
                        Empresa
                      </label>
                      <input
                        type="text"
                        id="company"
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-[#0080FF] focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        placeholder="Nombre de tu empresa"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700"
                    >
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-[#0080FF] focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="message"
                      className="text-sm font-medium text-gray-700"
                    >
                      Mensaje
                    </label>
                    <textarea
                      id="message"
                      rows="4"
                      required
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-[#0080FF] focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                      placeholder="¿Cómo podemos ayudarte?"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={formStatus === "submitting"}
                    className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    {formStatus === "submitting" ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        Enviar Mensaje <ArrowRight size={20} />
                      </>
                    )}
                  </button>

                  <p className="text-xs text-center text-gray-400 mt-4">
                    Al enviar este formulario aceptas nuestra política de
                    privacidad.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
