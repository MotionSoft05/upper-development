import { useState } from "react";
import { useTranslation } from "react-i18next";

function Preguntas() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(null);

  const faqData = [
    {
      question: "preguntas.faq.question1",
      answer: "preguntas.faq.answer1",
    },
    {
      question: "preguntas.faq.question2",
      answer: "preguntas.faq.answer2",
    },
    {
      question: "preguntas.faq.question3",
      answer: "preguntas.faq.answer3",
    },
    {
      question: "preguntas.faq.question4",
      answer: "preguntas.faq.answer4",
    },
    {
      question: "preguntas.faq.question5",
      answer: "preguntas.faq.answer5",
    },
    {
      question: "preguntas.faq.question6",
      answer: "preguntas.faq.answer6",
    },
    {
      question: "preguntas.faq.question7",
      answer: "preguntas.faq.answer7",
    },
    {
      question: "preguntas.faq.question8",
      answer: "preguntas.faq.answer8",
    },
  ];

  const toggleAnswer = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="preguntas" className="bg-gray-50 py-20">
      <div className="px-4 mx-auto max-w-screen-xl">
        <div className="mx-auto max-w-screen-md text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t("preguntas.commonQuestions.title")}
          </h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="font-light text-lg text-gray-600 max-w-2xl mx-auto">
            {t("preguntas.commonQuestions.description")}
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqData.map((item, index) => (
            <div
              key={index}
              className={`transition-all duration-300 border rounded-lg overflow-hidden ${
                openIndex === index
                  ? "bg-white border-blue-200 shadow-md"
                  : "bg-white border-gray-200 hover:border-blue-100 hover:shadow-sm"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleAnswer(index)}
                className="flex justify-between items-center w-full px-6 py-5 text-left"
              >
                <span
                  className={`text-lg font-medium transition-colors duration-200 ${
                    openIndex === index ? "text-blue-600" : "text-gray-900"
                  }`}
                >
                  {t(item.question)}
                </span>

                <div
                  className={`flex-shrink-0 ml-2 ${
                    openIndex === index ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  <svg
                    className={`w-6 h-6 transition-transform duration-300 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? "max-h-96" : "max-h-0"
                }`}
              >
                <div className="px-6 pb-5 text-gray-600 border-t border-gray-100 pt-4">
                  <p className="leading-relaxed">{t(item.answer)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 text-lg">
            {t("preguntas.commonQuestions.noAnswer")}

            <a
              href="#contacto"
              className="ml-1 font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200"
            >
              {t("preguntas.commonQuestions.contactSupport")}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

export default Preguntas;
