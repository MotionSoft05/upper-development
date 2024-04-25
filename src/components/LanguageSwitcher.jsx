import React, { useEffect } from 'react';
import i18n from '@/utils/i18n'; // Importa tu archivo de configuración de i18n
import { useTranslation } from 'react-i18next';


function LanguageSwitcher() {
    const { t } = useTranslation()

    useEffect(() => {
      const storedLanguage = localStorage.getItem('language');
      if (storedLanguage) {
        i18n.changeLanguage(storedLanguage);
      }
    }, []);
  
    const changeLanguage = (event) => {
      const selectedLanguage = event.target.value;
      localStorage.setItem('language', selectedLanguage);
      i18n.changeLanguage(selectedLanguage);
    };
  
    return (
      <div>
        <label htmlFor="languageSelect">{t('navbar.language')}:</label>
        <select id="languageSelect" onChange={changeLanguage} defaultValue={localStorage.getItem('language')}>
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </div>
    );
  }
  
  export default LanguageSwitcher;