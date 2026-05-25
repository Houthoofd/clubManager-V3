import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const i18nTest = i18n.createInstance();

i18nTest.use(initReactI18next).init({
  lng: 'fr',
  fallbackLng: 'fr',
  ns: ['common'],
  defaultNS: 'common',
  resources: {
    fr: { common: {} },
    en: { common: {} },
  },
  interpolation: { escapeValue: false },
});

export default i18nTest;
