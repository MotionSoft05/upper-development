import React, { useEffect } from "react";
import i18n from "@/utils/i18n"; // Importa tu archivo de configuración de i18n
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";

function LanguageSwitcher() {
  const { t } = useTranslation();

  useEffect(() => {
    const storedLanguage = localStorage.getItem("language");
    if (storedLanguage) {
      i18n.changeLanguage(storedLanguage);
    }
  }, []);

  const changeLanguage = (event) => {
    const selectedLanguage = event.target.value;
    localStorage.setItem("language", selectedLanguage);
    i18n.changeLanguage(selectedLanguage);
  };

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
        defaultValue={localStorage.getItem("language")}
      >
        <option value="en" className="px-6">English</option>
        <option value="es" className="px-6">Español</option>
      </select>
    </div>
  );
}

export default LanguageSwitcher;
