import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { langConfig } from "@/config";
import { ja, en } from "@/config/locales";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: langConfig.default.lang,
    detection: {
      lookupCookie: langConfig.cookie.name,
      lookupLocalStorage: langConfig.cookie.name,
      lookupSessionStorage: langConfig.cookie.name,
      order: ["cookie", "localStorage", "navigator"],
      caches: ["cookie"],
    },
    resources: {
      en: {
        translation: en,
      },
      ja: {
        translation: ja,
      },
    },
  });

export default i18n;
