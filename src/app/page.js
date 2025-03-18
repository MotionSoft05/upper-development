"use client";
import { useRef, useEffect, useState } from "react";
import "keen-slider/keen-slider.min.css";
import Precios from "@/components/homeComponents/precios";
import Preguntas from "@/components/homeComponents/preguntas";
import Contacto from "@/components/homeComponents/contacto";
import Link from "next/link";
import HomeSlider from "@/components/homeComponents/sliderHome";
// i18n
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Home() {
  const { t } = useTranslation();
  const [showButton, setShowButton] = useState(false);

  // Handle scroll to show/hide the back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative">
        <HomeSlider />
      </section>

      {/* Solutions Section */}
      <section id="soluciones" className="py-16 sm:py-24">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("home.title")}
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {solutionsData.map((solution, index) => (
              <div
                key={index}
                className="group transition-all duration-300 hover:shadow-lg rounded-lg overflow-hidden"
              >
                <div className="p-2 bg-white rounded-lg  ">
                  <div className="overflow-hidden rounded-lg">
                    <img
                      src={solution.image}
                      alt={t(solution.title)}
                      className="w-full h-48 object-cover transform transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">
                      {t(solution.title)}
                    </h3>
                    <p className="text-gray-600">{t(solution.description)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration CTA Section */}
      <section className="bg-gradient-to-r from-gray-900 to-blue-900 py-16 relative">
        <div className="absolute inset-0 opacity-20 bg-pattern"></div>
        <div className="container mx-auto px-4 max-w-screen-xl relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              {t("home.startToday.title")}
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              {t("home.startToday.description1")}
            </p>
            <Link href="/register">
              <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors duration-300 transform hover:scale-105">
                {t("home.btnRegister")}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section id="recursos" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("home.title1")}
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-x-8 gap-y-12 max-w-4xl mx-auto">
            {resourcesData.map((resource, index) => (
              <div key={index} className="flex group">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center group-hover:bg-blue-700 transition-colors duration-300">
                    <img src={resource.icon} className="w-6 h-6" alt="" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {t(resource.title)}
                  </h3>
                  <p className="text-gray-600">{t(resource.description)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ, Pricing, and Contact Sections */}
      <Preguntas />
      <Precios />
      <Contacto />

      {/* Back to Top Button */}
      {showButton && (
        <button
          className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110 focus:outline-none"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      )}
    </main>
  );
}

// Data arrays for solutions and resources sections
const solutionsData = [
  {
    image: "/img/centro1.jpeg",
    title: "home.restaurantAndBars.title",
    description: "home.restaurantAndBars.description1",
  },
  {
    image: "/img/centro2.jpeg",
    title: "home.transport.title",
    description: "home.transport.description1",
  },
  {
    image: "/img/centro3.jpeg",
    title: "home.offices.title",
    description: "home.offices.description1",
  },
  {
    image: "/img/centro4.jpeg",
    title: "home.eventVenues.title",
    description: "home.eventVenues.description1",
  },
  {
    image: "/img/centro5.jpeg",
    title: "home.hotels.title",
    description: "home.hotels.description1",
  },
  {
    image: "/img/centro6.jpeg",
    title: "home.retailersAndMedicalCenters.title",
    description: "home.retailersAndMedicalCenters.description1",
  },
];

const resourcesData = [
  {
    icon: "/img/screens.svg",
    title: "home.publishHighImpactContent.title",
    description: "home.publishHighImpactContent.description1",
  },
  {
    icon: "/img/keyboard.svg",
    title: "home.easyContentScheduling.title",
    description: "home.easyContentScheduling.description1",
  },
  {
    icon: "/img/Posibility.svg",
    title: "home.generateImpactWithVersatileContent.title",
    description: "home.generateImpactWithVersatileContent.description1",
  },
  {
    icon: "/img/security2.svg",
    title: "home.toolSecurityAndHighAvailability.title",
    description: "home.toolSecurityAndHighAvailability.description1",
  },
];
