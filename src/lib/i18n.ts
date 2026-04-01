import { en, ja, TranslationSchema } from "@/config/locales"
import { DEFAULT_LOCALE } from "@/constants/locale"
import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import enZod from "zod-i18n-map/locales/en/zod.json"
import jaZod from "zod-i18n-map/locales/ja/zod.json"

export const resources = {
  ja: {
    translation: ja,
    zod: jaZod,
  },
  en: {
    translation: en,
    zod: enZod,
  },
}

// NOTE: 型補完が適用されるように型情報を設定
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation"
    resources: {
      translation: TranslationSchema
    }
  }
}

i18n
  // .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: DEFAULT_LOCALE,
    // detection: {
    //   lookupCookie: langConfig.cookie.name,
    //   lookupLocalStorage: langConfig.cookie.name,
    //   lookupSessionStorage: langConfig.cookie.name,
    //   order: ["cookie", "header"],
    //   caches: ["cookie"],
    // },
    // interpolation: {
    //   escapeValue: false,
    // },
    resources,
  })

export default i18n
