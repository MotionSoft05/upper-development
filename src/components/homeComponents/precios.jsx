import { useState } from "react";
import { useTranslation } from "react-i18next";
import CardPrice from "./CardPrice";

function Precios() {
  const { t } = useTranslation();
  const [pricingPeriod, setPricingPeriod] = useState("mensual");

  // Toggle between monthly and annual pricing
  const togglePricingPeriod = () => {
    setPricingPeriod(pricingPeriod === "mensual" ? "anual" : "mensual");
  };

  // Define pricing data
  const pricingData = [
    {
      id: "free",
      title: "precios.free.title",
      description: "precios.free.description",
      price: {
        mensual: "$ 0",
        anual: "$ 0",
      },
      features: ["precios.free.features.item1", "precios.free.features.item2"],
    },
    {
      id: "standard",
      title: "precios.standard.title",
      description: "precios.standard.description",
      price: {
        mensual: "$ 200",
        anual: "$ 1,440", // 12 × $150 = $1,800 but with 20% annual discount = $1,440
      },
      features: [
        "precios.standard.features.item1",
        "precios.standard.features.item2",
      ],
      highlighted: true,
    },
    {
      id: "professional",
      title: "precios.professional.title",
      description: "precios.professional.description",
      price: {
        mensual: t("precios.professional.contact"),
        anual: t("precios.professional.contact"),
      },
      features: [
        "precios.professional.features.item1",
        "precios.professional.features.item2",
      ],
    },
  ];

  return (
    <section id="precios" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 max-w-screen-xl">
        <div className="mx-auto max-w-screen-md text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t("precios.title1")}
          </h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("precios.description1")}
          </p>
        </div>

        {/* Billing Period Toggle */}
        <div className="flex justify-center mb-10">
          <div className="bg-white rounded-full p-1 inline-flex shadow-md">
            <button
              onClick={togglePricingPeriod}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                pricingPeriod === "mensual"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {t("precios.monthly")}
            </button>
            <button
              onClick={togglePricingPeriod}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                pricingPeriod === "anual"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {t("precios.yearly")}
              {pricingPeriod === "anual" && (
                <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                  20% {t("precios.discount")}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pricingData.map((plan) => (
            <CardPrice
              key={plan.id}
              title={t(plan.title)}
              description={t(plan.description)}
              currentPeriod={pricingPeriod}
              price={plan.price[pricingPeriod]}
              periodText={t(
                pricingPeriod === "mensual"
                  ? "precios.perMonth"
                  : "precios.perYear"
              )}
              featureList={plan.features.map((feature) => t(feature))}
              btnTitle={t("precios.btnStart")}
              highlighted={plan.highlighted}
            />
          ))}
        </div>

        <p className="text-center text-gray-500 mt-12">
          {t("precios.pricesNote")}
        </p>
      </div>
    </section>
  );
}

export default Precios;
