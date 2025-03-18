"use client";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

function InteractiveSolutions() {
  const { t } = useTranslation();
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Solution data with benefits (replace with actual content)
  const solutionsData = [
    {
      image: "/img/centro1.jpeg",
      title: "home.restaurantAndBars.title",
      description: "home.restaurantAndBars.description1",
      benefits: [
        "home.restaurantAndBars.benefit1",
        "home.restaurantAndBars.benefit2",
        "home.restaurantAndBars.benefit3",
      ],
    },
    {
      image: "/img/centro2.jpeg",
      title: "home.transport.title",
      description: "home.transport.description1",
      benefits: [
        "home.transport.benefit1",
        "home.transport.benefit2",
        "home.transport.benefit3",
      ],
    },
    {
      image: "/img/centro3.jpeg",
      title: "home.offices.title",
      description: "home.offices.description1",
      benefits: [
        "home.offices.benefit1",
        "home.offices.benefit2",
        "home.offices.benefit3",
      ],
    },
    {
      image: "/img/centro4.jpeg",
      title: "home.eventVenues.title",
      description: "home.eventVenues.description1",
      benefits: [
        "home.eventVenues.benefit1",
        "home.eventVenues.benefit2",
        "home.eventVenues.benefit3",
      ],
    },
    {
      image: "/img/centro5.jpeg",
      title: "home.hotels.title",
      description: "home.hotels.description1",
      benefits: [
        "home.hotels.benefit1",
        "home.hotels.benefit2",
        "home.hotels.benefit3",
      ],
    },
    {
      image: "/img/centro6.jpeg",
      title: "home.retailersAndMedicalCenters.title",
      description: "home.retailersAndMedicalCenters.description1",
      benefits: [
        "home.retailersAndMedicalCenters.benefit1",
        "home.retailersAndMedicalCenters.benefit2",
        "home.retailersAndMedicalCenters.benefit3",
      ],
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6 md:gap-8">
      {solutionsData.map((solution, index) => (
        <div
          key={index}
          className={`rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer 
            ${
              expandedIndex === index
                ? "md:col-span-2 bg-white shadow-2xl scale-100"
                : "bg-gray-100 hover:shadow-lg hover:bg-white"
            }`}
          onClick={() =>
            setExpandedIndex(expandedIndex === index ? null : index)
          }
        >
          {/* Card Content - Top Section Always Visible */}
          <div className="relative">
            <div className="overflow-hidden h-48 md:h-64">
              <img
                src={solution.image}
                alt={t(solution.title)}
                className={`w-full h-full object-cover transition-transform duration-700 
                  ${expandedIndex === index ? "scale-105" : "hover:scale-105"}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-xl md:text-2xl font-bold">
                  {t(solution.title)}
                </h3>
                <div
                  className={`rounded-full bg-white p-2 transition-transform duration-300 
                  ${expandedIndex === index ? "rotate-45" : ""}`}
                >
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={
                        expandedIndex === index
                          ? "M6 18L18 6M6 6l12 12"
                          : "M12 6v12M6 12h12"
                      }
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Expandable Content */}
          <div
            className={`overflow-hidden transition-all duration-500 px-6 
              ${expandedIndex === index ? "max-h-96 py-6" : "max-h-0 py-0"}`}
          >
            <p className="text-gray-600 mb-4">{t(solution.description)}</p>

            <div className="space-y-4 mt-6">
              <h4 className="font-semibold text-gray-900">Beneficios clave:</h4>
              <ul className="space-y-2">
                {solution.benefits &&
                  solution.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg
                        className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="ml-3 text-gray-700">
                        {t(benefit) ||
                          `Beneficio ${idx + 1} para ${t(solution.title)}`}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>

            <div className="mt-6">
              <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300">
                <span>Descubrir más</span>
                <svg
                  className="ml-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default InteractiveSolutions;
