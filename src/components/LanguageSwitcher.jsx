import React, { useEffect } from "react";
import i18n from "@/utils/i18n"; // Importa tu archivo de configuración de i18n
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";

function LanguageSwitcher() {
  const { t } = useTranslation();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLanguage = localStorage.getItem("language");
      if (storedLanguage) {
        i18n.changeLanguage(storedLanguage);
      }
    }
  }, []);

  const changeLanguage = (event) => {
    const selectedLanguage = event.target.value;
    if (typeof window !== "undefined") {
      localStorage.setItem("language", selectedLanguage);
      i18n.changeLanguage(selectedLanguage);
    }
  };

  // Obtén el idioma almacenado en localStorage solo si estás en el navegador
  const storedLanguage = typeof window !== "undefined" ? localStorage.getItem("language") : null;

  return (
    <div>
      <FontAwesomeIcon icon={faGlobe} />
      {/* <label htmlFor="languageSelect">
        :
      </label> */}
      <select
        className="ml-2 w-10"
        id="languageSelect"
        onChange={changeLanguage}
        value={storedLanguage}
        defaultValue={typeof window !== "undefined" && localStorage.getItem("language")}
      >
        <option value="en" className="px-6">English</option>
        <option value="es" className="px-6">Español</option>
      </select>
    </div>
  );
}

export default LanguageSwitcher;
