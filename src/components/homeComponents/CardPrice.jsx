import Link from "next/link";
import { useTranslation } from "react-i18next";
const CardPrice = ({
  title,
  description,
  price,
  periodText,
  currentPeriod,
  featureList,
  btnTitle,
  highlighted = false,
}) => {
  const { t } = useTranslation();
  return (
    <div
      className={`flex flex-col h-full overflow-hidden rounded-2xl ${
        highlighted
          ? "border-2 border-blue-500 shadow-xl transform md:-translate-y-4 scale-105"
          : "border border-gray-200 shadow-lg"
      }`}
    >
      {/* Card Header */}
      <div
        className={`p-8 ${
          highlighted ? "bg-blue-600 text-white" : "bg-white text-gray-900"
        }`}
      >
        {highlighted && (
          <span className="inline-block px-3 py-1 text-xs font-semibold bg-blue-200 text-blue-800 rounded-full mb-4">
            {t("precios.mostPopular")}
          </span>
        )}
        <h3
          className={`text-2xl font-bold mb-2 ${
            highlighted ? "text-white" : "text-gray-900"
          }`}
        >
          {title}
        </h3>
        <p
          className={`font-light ${
            highlighted ? "text-blue-100" : "text-gray-600"
          }`}
        >
          {description}
        </p>
      </div>

      {/* Price */}
      <div className="px-8 py-6 bg-gray-50 border-t border-b border-gray-200">
        <div className="flex items-end">
          <span className="text-4xl font-extrabold text-gray-900">{price}</span>
          {price !== t("precios.professional.contact") && (
            <span className="text-gray-500 ml-2">{periodText}</span>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="flex-grow p-8 bg-white">
        <ul className="space-y-4">
          {featureList.map((feature, index) => (
            <li key={index} className="flex items-start">
              <svg
                className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="ml-3 text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Button */}
      <div className="p-8 bg-white border-t border-gray-200">
        <Link href="/register">
          <button
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
              highlighted
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-800 text-white hover:bg-gray-900"
            }`}
          >
            {btnTitle}
          </button>
        </Link>
      </div>
    </div>
  );
};

export default CardPrice;
