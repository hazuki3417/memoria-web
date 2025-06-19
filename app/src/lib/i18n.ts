import i18n, { Resource } from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { langConfig } from "@/config";
import { ja, en, TranslationSchema } from "@/config/locales";

export const resources = {
  ja: { translation: ja },
  en: { translation: en },
} as const satisfies Resource;

// NOTE: 型補完が適用されるように型情報を設定
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: {
      translation: TranslationSchema;
    };
  }
}

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
    interpolation: {
      escapeValue: false,
    },
    resources,
  });

export default i18n;
