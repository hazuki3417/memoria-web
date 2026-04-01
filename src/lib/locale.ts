import { COOKIE } from "@/constants/cookie"
import { HEADER } from "@/constants/header"
import { DEFAULT_LOCALE, Locale, SUPPORTED_LOCALES } from "@/constants/locale"
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies"
import { cookies, headers } from "next/headers"

/**
 * localeがサポート対象かチェック
 */
export const isSupportedLocale = (
  locale: string | undefined | null,
): boolean => {
  if (!locale) return false
  return SUPPORTED_LOCALES.includes(locale as Locale)
}

/**
 * Accept-Language からユーザーの優先言語を取得する関数
 * @returns
 */
export const getPreferredLocale = async (): Promise<Locale> => {
  const acceptLang = (await headers()).get(HEADER.ACCEPT_LANGUAGE)
  if (!acceptLang) return DEFAULT_LOCALE

  const langs = acceptLang.split(",").map((lang) => lang.split(";")[0].trim())

  for (const lang of langs) {
    const base = lang.split("-")[0] as Locale
    if (SUPPORTED_LOCALES.includes(base)) {
      return base
    }
  }

  return DEFAULT_LOCALE
}

export const getCookieLocale = async (): Promise<RequestCookie | undefined> => {
  return (await cookies()).get(COOKIE.LOCALE.name)
}

export const getLocale = async (): Promise<{
  type: "cookie" | "header" | "default"
  value: Locale
}> => {
  const cookieLocale = await getCookieLocale()
  if (cookieLocale !== undefined) {
    return {
      type: "cookie",
      value: cookieLocale.value as Locale,
    }
  }
  const headerLocale = await getPreferredLocale()
  if (isSupportedLocale(headerLocale)) {
    return {
      type: "header",
      value: headerLocale as Locale,
    }
  }
  return {
    type: "default",
    value: DEFAULT_LOCALE as Locale,
  }
}
