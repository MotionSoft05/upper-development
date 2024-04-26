import { useState } from "react";
import { useTranslation } from "react-i18next";

function Preguntas() {
  const { t } = useTranslation()
  //  FAQ
  const faqData = [
    {
      question: "preguntas.faq.question1",
      answer: "preguntas.faq.answer1"
    },
    {
      question: "preguntas.faq.question2",
      answer: "preguntas.faq.answer2"
    },
    {
      question: "preguntas.faq.question3",
      answer: "preguntas.faq.answer3"
    },
    {
      question: "preguntas.faq.question4",
      answer: "preguntas.faq.answer4"
    },
    {
      question: "preguntas.faq.question5",
      answer: "preguntas.faq.answer5"
    },
    {
      question: "preguntas.faq.question6",
      answer: "preguntas.faq.answer6"
    },
    {
      question: "preguntas.faq.question7",
      answer: "preguntas.faq.answer7"
    },
    {
      question: "preguntas.faq.question8",
      answer: "preguntas.faq.answer8"
    },
  ];
  

  const [openIndex, setOpenIndex] = useState(null);

  const toggleAnswer = (index) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <section id="preguntas">
      <div className="pt-24 px-4 mx-auto max-w-screen-xl ">
        <div className="mx-auto max-w-screen-md text-center mb-8 lg:mb-12">
          <h2 className="mb-4 text-lg md:text-4xl tracking-tight font-extrabold text-custom">
          {t("preguntas.commonQuestions.title")}
          </h2>
          <p className="mb-5 font-light text-sm md:text-xl text-gray-400">
          {t("preguntas.commonQuestions.description")}
          </p>
        </div>

        <div className="max-w-3xl mx-auto mt-8 space-y-4 md:mt-16">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="transition-all duration-200 bg-white border border-gray-200 cursor-pointer hover:bg-gray-50"
            >
              <button
                type="button"
                onClick={() => toggleAnswer(index)}
                className="flex justify-between items-center w-full px-4 py-5 sm:p-6"
              >
                <span className="text-sm font-semibold text-black">
                {t(item.question)}
                </span>

                <svg
                  className={`w-6 h-6 text-gray-400 transform ${
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
              </button>

              {openIndex === index && (
                <div className="px-4 pb-5 sm:px-6 sm:pb-6">
                  <p>{t(item.answer)}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-gray-600 text-sm md:text-base mt-9">
          {t("preguntas.commonQuestions.noAnswer")}
          <a
            href="#contacto"
            title=""
            className="pl-2 font-medium text-blue-600 transition-all duration-200 hover:text-blue-700 focus:text-blue-700 hover:underline"
          >
            {t("preguntas.commonQuestions.contactSupport")}
          </a>
        </p>
      </div>
    </section>
  );
}

export default Preguntas;
