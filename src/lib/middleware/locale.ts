import { COOKIE } from "@/constants/cookie"
import { HEADER } from "@/constants/header"
import { DEFAULT_LOCALE, Locale, SUPPORTED_LOCALES } from "@/constants/locale"
import { serverEnv } from "@/env/server"
import { NextRequest, NextResponse } from "next/server"
import { isSupportedLocale } from "../locale"

/**
 * Accept-Language からユーザーの優先言語を取得する関数
 * @returns
 */
export const getPreferredLocale = (request: NextRequest): string => {
  const acceptLang = request.headers.get(HEADER.ACCEPT_LANGUAGE)
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

export const getCookieLocale = (request: NextRequest): string | undefined => {
  return request.cookies.get(COOKIE.LOCALE.name)?.value
}

export const getLocale = (
  request: NextRequest,
): {
  type: "cookie" | "header" | "default"
  value: Locale
} => {
  const cookieLocale = getCookieLocale(request)
  if (cookieLocale !== undefined) {
    return {
      type: "cookie",
      value: cookieLocale as Locale,
    }
  }
  const headerLocale = getPreferredLocale(request)
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

export const setLocale = (response: NextResponse, locale: Locale) => {
  response.cookies.set(COOKIE.LOCALE.name, locale, {
    path: "/",
    maxAge: COOKIE.LOCALE.maxAge,
    sameSite: "lax",
    secure: serverEnv.NODE_ENV === "production",
  })
}
