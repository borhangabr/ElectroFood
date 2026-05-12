// i18next + react-i18next setup.
//
// Two responsibilities:
//   1. Load EN/AR resources and pick the right default (saved preference > browser).
//   2. Keep <html lang> and <html dir> in sync with the active language.
// Component code never touches the <html> element — it just calls i18n.changeLanguage().

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './en.json';
import ar from './ar.json';

export const SUPPORTED_LANGS = ['en', 'ar'];
export const DEFAULT_LANG = 'en';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    fallbackLng: DEFAULT_LANG,
    supportedLngs: SUPPORTED_LANGS,
    interpolation: { escapeValue: false }, // React already escapes
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'lang',
    },
  });

function applyDocumentAttrs(lng) {
  const safe = SUPPORTED_LANGS.includes(lng) ? lng : DEFAULT_LANG;
  const html = document.documentElement;
  html.setAttribute('lang', safe);
  html.setAttribute('dir', safe === 'ar' ? 'rtl' : 'ltr');
}

// Initial sync (DetectLanguage may have set lng before init finished).
applyDocumentAttrs(i18n.resolvedLanguage || i18n.language);
// Keep them in sync on every change.
i18n.on('languageChanged', applyDocumentAttrs);

export default i18n;
