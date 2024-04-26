import { useState } from "react";
import Link from "next/link";

const CardPrice = ({ title, description, mensualPrice, mensualTitle, anualPrice, anualTitle, featureList, btnTitle }) => {
  return (
    <div className="flex flex-col p-6 mx-auto max-w-lg text-center  rounded-lg border  shadow border-gray-600 xl:p-8 bg-gray-800 text-white justify-between ">
    <h3 className="mb-4 text-2xl font-semibold text-custom">
      {title}
    </h3>
    <p className="font-light sm:text-lg text-gray-400">
      {description}
    </p>
    <div
      id="precios1"
      className="flex flex-col justify-center items-center my-8 mt-4"
    >
      <h4 className="mb-2">{mensualTitle}</h4>
      {/* <h4 className="mb-2">{t("precios.monthly")}</h4> */}
      <div className="mb-2 text-4xl font-extrabold">
        {/* Precio Mensual*/}
        {mensualPrice}
        {/* {t("precios.free.monthly")} */}
        {/* {t(precios.gratis.mensual)} */}
      </div>
      <h4 className="mb-2mt-4">{anualTitle}</h4>
      <div className="text-4xl font-extrabold">
        {/* Precio Anual*/}
        {anualPrice}
        {/* {t("precios.free.yearly")} */}
        {/* {t(precios.gratis.anual)} */}
      </div>
    </div>

    <ul role="list" className="mb-8 space-y-4 text-left">
        {featureList.map((feature, index) => (
          <li key={index} className="flex items-center space-x-3">
            <img src="/img/tick.svg" alt="Tick icon" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    <Link href="/register">
      <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded inline-block mt-auto">
        {btnTitle}
      </button>
    </Link>
  </div>
  )
}

export default CardPrice