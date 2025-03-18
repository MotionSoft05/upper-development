// Importa las bibliotecas necesarias
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importa los archivos de traducción y configura i18next
import translationES from '@/lang/translationES.json'
import translationEN from '@/lang/translationEN.json'
// import translationEN from './locales/en/translation.json';
// import translationES from './locales/es/translation.json';

i18n
  .use(initReactI18next) // inicializa react-i18next
  .init({
    resources: {
      en: {
        translation: translationEN,
      },
      es: {
        translation: translationES,
      },
    },
    lng: 'en', // idioma por defecto
    fallbackLng: 'en', // idioma de reserva en caso de que la traducción falte en el idioma actual
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
